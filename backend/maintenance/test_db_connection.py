#!/usr/bin/env python3
"""
Script para testar a conexão com o banco de dados antes de executar a migração
"""
import sys
import os
from datetime import datetime

# Adicionar o diretório raiz ao path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def test_connection():
    """Testa a conexão com o banco de dados"""
    try:
        print("🔧 Testando conexão com o banco de dados...")
        
        from core.database import SessionLocal
        from sqlalchemy import text
        
        db = SessionLocal()
        
        # Teste básico de conexão
        result = db.execute(text("SELECT 1 as test")).fetchone()
        print(f"✅ Conexão básica: {result.test}")
        
        # Verificar se a tabela users existe
        result = db.execute(text("SHOW TABLES LIKE 'users'")).fetchone()
        if result:
            print("✅ Tabela 'users' encontrada")
        else:
            print("❌ Tabela 'users' não encontrada")
            return False
        
        # Verificar estrutura da tabela users
        result = db.execute(text("DESCRIBE users")).fetchall()
        print(f"✅ Tabela 'users' tem {len(result)} colunas")
        
        # Verificar se onboarding_completed já existe
        columns = [row[0] for row in result]
        if 'onboarding_completed' in columns:
            print("⚠️ Campo 'onboarding_completed' já existe")
            
            # Mostrar estatísticas
            stats = db.execute(text("""
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN onboarding_completed = TRUE THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN onboarding_completed = FALSE THEN 1 ELSE 0 END) as pending
                FROM users
            """)).fetchone()
            
            print(f"📊 Usuários: {stats.total} total, {stats.completed} completos, {stats.pending} pendentes")
        else:
            print("✅ Campo 'onboarding_completed' não existe - migração necessária")
        
        # Verificar quantos usuários existem
        result = db.execute(text("SELECT COUNT(*) as count FROM users")).fetchone()
        print(f"👥 Total de usuários na base: {result.count}")
        
        db.close()
        return True
        
    except ImportError as e:
        print(f"❌ Erro de importação: {e}")
        print("Verifique se as dependências estão instaladas:")
        print("pip install sqlalchemy pymysql python-dotenv")
        return False
        
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        print("\nVerifique suas configurações no arquivo .env:")
        print("DB_HOST=127.0.0.1")
        print("DB_PORT=3306")
        print("DB_USER=root")
        print("DB_PASSWORD=sua_senha")
        print("DB_NAME=vibe")
        return False

def show_env_info():
    """Mostra informações do arquivo .env"""
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    
    if os.path.exists(env_path):
        print(f"✅ Arquivo .env encontrado em: {env_path}")
        
        try:
            with open(env_path, 'r') as f:
                lines = f.readlines()
            
            db_vars = [line.strip() for line in lines if line.startswith('DB_')]
            print("📋 Configurações do banco encontradas:")
            for var in db_vars:
                if 'PASSWORD' in var:
                    # Mascarar senha
                    key, value = var.split('=', 1)
                    masked = '*' * len(value) if value else '(vazio)'
                    print(f"   {key}={masked}")
                else:
                    print(f"   {var}")
                    
        except Exception as e:
            print(f"⚠️ Erro ao ler .env: {e}")
    else:
        print(f"❌ Arquivo .env não encontrado em: {env_path}")
        print("Crie o arquivo .env com as configurações do banco de dados")

if __name__ == "__main__":
    print("🧪 Teste de Conexão com Banco de Dados")
    print("=" * 50)
    
    show_env_info()
    print()
    
    if test_connection():
        print("\n🎉 Teste de conexão bem-sucedido!")
        print("Você pode executar a migração com segurança:")
        print("python3 add_onboarding_field.py")
    else:
        print("\n❌ Teste de conexão falhou!")
        print("Corrija os problemas antes de executar a migração.")
        sys.exit(1)
