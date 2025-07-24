#!/usr/bin/env python3
"""
Verificação rápida do banco de dados de verificação de email
"""
import sys
import os
from datetime import datetime, timedelta

# Adicionar o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from routes.email_verification import EmailVerification

def quick_check():
    db = SessionLocal()
    
    try:
        print("🔍 VERIFICAÇÃO RÁPIDA - EMAIL VERIFICATION")
        print("="*50)
        
        # Verificar últimos códigos
        recent_codes = db.query(EmailVerification).filter(
            EmailVerification.created_at > datetime.utcnow() - timedelta(hours=1)
        ).order_by(EmailVerification.created_at.desc()).limit(5).all()
        
        print(f"📊 Códigos criados na última hora: {len(recent_codes)}")
        
        for code in recent_codes:
            now = datetime.utcnow()
            is_expired = code.expires_at < now
            time_left = (code.expires_at - now).total_seconds() / 60
            
            print(f"\n👤 User ID: {code.user_id}")
            print(f"📧 Email: {code.email}")
            print(f"🔢 Código: {code.verification_code}")
            print(f"⏰ Criado: {code.created_at}")
            print(f"⏰ Expira: {code.expires_at}")
            print(f"🔴 Status: {'EXPIRADO' if is_expired else f'VÁLIDO ({time_left:.1f}min restantes)'}")
            print(f"✅ Verificado: {'SIM' if code.verified else 'NÃO'}")
        
        # Teste de consulta
        print(f"\n🧪 TESTE DE CONSULTA")
        print("="*30)
        
        if recent_codes:
            test_code = recent_codes[0]
            print(f"Testando busca do código: {test_code.verification_code}")
            
            found = db.query(EmailVerification).filter(
                EmailVerification.user_id == test_code.user_id,
                EmailVerification.verification_code == test_code.verification_code,
                EmailVerification.verified == False,
                EmailVerification.expires_at > datetime.utcnow()
            ).first()
            
            if found:
                print("✅ Código encontrado pela consulta!")
            else:
                print("❌ Código NÃO encontrado pela consulta!")
                
                # Verificar razões possíveis
                print("\n🔍 Investigando razões:")
                
                # Código existe?
                exists = db.query(EmailVerification).filter(
                    EmailVerification.verification_code == test_code.verification_code
                ).first()
                if not exists:
                    print("  ❌ Código não existe no banco")
                else:
                    print("  ✅ Código existe no banco")
                
                # Usuário correto?
                user_match = db.query(EmailVerification).filter(
                    EmailVerification.user_id == test_code.user_id,
                    EmailVerification.verification_code == test_code.verification_code
                ).first()
                if not user_match:
                    print("  ❌ User ID não confere")
                else:
                    print("  ✅ User ID confere")
                
                # Já verificado?
                if test_code.verified:
                    print("  ❌ Código já foi verificado")
                else:
                    print("  ✅ Código não foi verificado ainda")
                
                # Expirado?
                if test_code.expires_at < datetime.utcnow():
                    print("  ❌ Código expirado")
                else:
                    print("  ✅ Código não expirado")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    quick_check()
