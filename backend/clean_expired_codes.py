#!/usr/bin/env python3
"""
Limpar códigos expirados do banco de dados
"""
import sys
import os

# Adicionar o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from routes.email_verification import EmailVerification
from sqlalchemy import text

def clean_expired():
    db = SessionLocal()
    
    try:
        print("🧹 LIMPANDO CÓDIGOS EXPIRADOS")
        print("="*40)
        
        # Usar tempo do banco para consistência
        db_time = db.execute(text("SELECT NOW()")).fetchone()[0]
        print(f"⏰ Tempo atual do banco: {db_time}")
        
        # Buscar códigos expirados
        expired_codes = db.query(EmailVerification).filter(
            EmailVerification.expires_at < db_time,
            EmailVerification.verified == False
        ).all()
        
        print(f"📊 Códigos expirados encontrados: {len(expired_codes)}")
        
        if expired_codes:
            for code in expired_codes:
                print(f"  - User {code.user_id}: {code.verification_code} (expirou em {code.expires_at})")
                db.delete(code)
            
            db.commit()
            print(f"✅ {len(expired_codes)} códigos expirados removidos!")
        else:
            print("✅ Nenhum código expirado encontrado!")
        
        # Mostrar códigos restantes
        remaining = db.query(EmailVerification).filter(
            EmailVerification.verified == False
        ).all()
        
        print(f"\n📊 Códigos não verificados restantes: {len(remaining)}")
        for code in remaining:
            is_expired = code.expires_at < db_time
            status = "EXPIRADO" if is_expired else "VÁLIDO"
            print(f"  - User {code.user_id}: {code.verification_code} ({status})")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clean_expired()
