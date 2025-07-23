#!/usr/bin/env python3
"""
Verificar sincronização entre serviços Python e Node.js
"""
import sys
import os
import requests
import json
from datetime import datetime

# Adicionar o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from routes.email_verification import EmailVerification

def check_services():
    print("🔄 VERIFICAÇÃO DE SINCRONIZAÇÃO DOS SERVIÇOS")
    print("="*60)
    
    # 1. Verificar se Python backend está rodando
    print("1. Verificando Python Backend (porta 8000)...")
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        if response.status_code == 200:
            print("✅ Python Backend respondendo")
        else:
            print(f"⚠️ Python Backend respondeu com status {response.status_code}")
    except Exception as e:
        print(f"❌ Python Backend não acessível: {e}")
    
    # 2. Verificar se Node.js service está rodando
    print("\n2. Verificando Node.js Email Service (porta 3001)...")
    try:
        response = requests.get('http://localhost:3001/health', timeout=5)
        if response.status_code == 200:
            print("✅ Node.js Email Service respondendo")
        else:
            print(f"⚠️ Node.js Email Service respondeu com status {response.status_code}")
    except Exception as e:
        print(f"❌ Node.js Email Service não acessível: {e}")
    
    # 3. Comparar configurações
    print("\n3. Comparando configurações...")
    
    # Verificar banco de dados Python
    db = SessionLocal()
    try:
        # Últimos códigos no banco Python
        recent_codes = db.query(EmailVerification).order_by(
            EmailVerification.created_at.desc()
        ).limit(3).all()
        
        print(f"📊 Últimos códigos no banco (Python): {len(recent_codes)}")
        
        for code in recent_codes:
            print(f"  - ID: {code.id}, User: {code.user_id}, Código: {code.verification_code}")
            print(f"    Criado: {code.created_at}, Expira: {code.expires_at}")
            print(f"    Verificado: {code.verified}")
        
    except Exception as e:
        print(f"❌ Erro ao acessar banco Python: {e}")
    finally:
        db.close()
    
    # 4. Testar endpoint de verificação
    print("\n4. Testando endpoint de verificação...")
    
    if recent_codes:
        test_code = recent_codes[0]
        test_data = {
            "user_id": test_code.user_id,
            "code": test_code.verification_code
        }
        
        print(f"Testando com: {test_data}")
        
        try:
            response = requests.post(
                'http://localhost:8000/email-verification/verify-code',
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            print(f"Status: {response.status_code}")
            print(f"Resposta: {response.text}")
            
            if response.status_code == 400:
                print("⚠️ Erro 400 - pode ser código inválido/expirado ou estrutura de dados")
            elif response.status_code == 200:
                print("✅ Endpoint funcionando!")
            else:
                print(f"⚠️ Status inesperado: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Erro ao testar endpoint: {e}")

def check_database_tables():
    """Verificar se as tabelas necessárias existem"""
    print("\n5. Verificando estrutura do banco...")
    
    from sqlalchemy import create_engine, text
    from core.config import get_database_url
    
    engine = create_engine(get_database_url())
    
    try:
        with engine.connect() as conn:
            # Verificar tabela email_verifications
            result = conn.execute(text("SHOW TABLES LIKE 'email_verifications'"))
            if result.fetchone():
                print("✅ Tabela 'email_verifications' existe")
                
                # Verificar estrutura
                columns = conn.execute(text("DESCRIBE email_verifications"))
                print("📋 Estrutura da tabela:")
                for column in columns:
                    print(f"  - {column[0]}: {column[1]}")
            else:
                print("❌ Tabela 'email_verifications' não existe!")
            
            # Verificar tabela users
            result = conn.execute(text("SHOW TABLES LIKE 'users'"))
            if result.fetchone():
                print("✅ Tabela 'users' existe")
            else:
                print("❌ Tabela 'users' não existe!")
                
    except Exception as e:
        print(f"❌ Erro ao verificar banco: {e}")

if __name__ == "__main__":
    check_services()
    check_database_tables()
