#!/usr/bin/env python3
"""
Script para criar usuário teste no banco de dados
"""
import sys
import os
from datetime import datetime
from dotenv import load_dotenv

# Adicionar o caminho do backend ao sys.path
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Carregar variáveis de ambiente
load_dotenv()

from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from core.config import get_database_url
from core.security import hash_password
from models.user import User

def create_test_user():
    """Criar usuário teste"""
    try:
        print("🔄 Conectando ao banco de dados...")
        
        # Conectar ao banco
        database_url = get_database_url()
        engine = create_engine(database_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        print("🔍 Verificando se usuário teste já existe...")
        
        # Verificar se o usuário já existe
        existing_user = db.query(User).filter(User.email == "teste@mail.com").first()
        if existing_user:
            print(f"✅ Usuário teste já existe!")
            print(f"   ID: {existing_user.id}")
            print(f"   Email: {existing_user.email}")
            print(f"   Nome: {existing_user.first_name} {existing_user.last_name}")
            print(f"   Username: {existing_user.username}")
            print(f"   Verificado: {existing_user.verified}")
            print(f"   Ativo: {existing_user.is_active}")
            
            # Garantir que está ativo e verificado
            if not existing_user.verified or not existing_user.is_active:
                existing_user.verified = True
                existing_user.is_active = True
                existing_user.onboarding_completed = True
                db.commit()
                print(f"🔄 Conta ativada e verificada!")
                
            db.close()
            return existing_user
        
        print("👤 Criando novo usuário teste...")
        
        # Criar novo usuário
        hashed_password = hash_password("12345678")
        
        test_user = User(
            first_name="Teste",
            last_name="Usuario",
            username="teste_user",
            email="teste@mail.com",
            password_hash=hashed_password,
            verified=True,  # Verificar email diretamente
            is_active=True,
            onboarding_completed=True,  # Pular onboarding
            bio="Usuário de teste para desenvolvimento",
            location="Brasil",
            created_at=datetime.utcnow(),
            last_seen=datetime.utcnow()
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print(f"✅ Usuário teste criado com sucesso!")
        print(f"   ID: {test_user.id}")
        print(f"   Email: {test_user.email}")
        print(f"   Nome: {test_user.first_name} {test_user.last_name}")
        print(f"   Username: {test_user.username}")
        print(f"   Verificado: {test_user.verified}")
        print(f"   Ativo: {test_user.is_active}")
        print(f"   Senha: 12345678")
        print(f"")
        print(f"🎯 CREDENCIAIS PARA LOGIN:")
        print(f"   Email: teste@mail.com")
        print(f"   Senha: 12345678")
        
        db.close()
        return test_user
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário teste: {e}")
        import traceback
        traceback.print_exc()
        if 'db' in locals():
            db.rollback()
            db.close()
        return None

if __name__ == "__main__":
    print("🚀 CRIANDO USUÁRIO TESTE")
    print("=" * 50)
    create_test_user()
    print("=" * 50)
    print("✅ Processo concluído!")
