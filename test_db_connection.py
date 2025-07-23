#!/usr/bin/env python3
"""
Script simples para testar a conexão com MySQL
"""
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

try:
    import pymysql
    
    # Configurações do banco
    db_config = {
        'host': os.getenv('DB_HOST', '127.0.0.1'),
        'port': int(os.getenv('DB_PORT', 3306)),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', 'Evo@000#!'),
        'database': os.getenv('DB_NAME', 'vibe'),
        'charset': 'utf8mb4'
    }
    
    print("🔍 Testando conexão com MySQL...")
    print(f"   Host: {db_config['host']}")
    print(f"   Port: {db_config['port']}")
    print(f"   User: {db_config['user']}")
    print(f"   Database: {db_config['database']}")
    
    # Tentar conectar
    connection = pymysql.connect(**db_config)
    print("✅ Conexão com MySQL estabelecida com sucesso!")
    
    # Testar uma query simples
    cursor = connection.cursor()
    cursor.execute("SELECT VERSION()")
    version = cursor.fetchone()
    print(f"🐬 Versão do MySQL: {version[0]}")
    
    # Verificar se existe o banco de dados
    cursor.execute("SHOW DATABASES")
    databases = [db[0] for db in cursor.fetchall()]
    
    if db_config['database'] in databases:
        print(f"✅ Banco de dados '{db_config['database']}' encontrado!")
    else:
        print(f"⚠️  Banco de dados '{db_config['database']}' não encontrado.")
        print("   Criando banco de dados...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_config['database']}")
        print(f"✅ Banco de dados '{db_config['database']}' criado!")
    
    cursor.close()
    connection.close()
    print("✅ Teste de conexão concluído com sucesso!")
    
except ImportError:
    print("❌ PyMySQL não está instalado. Execute: pip install pymysql")
except Exception as e:
    print(f"❌ Erro na conexão com MySQL: {e}")
    print("\n🔧 Verificações:")
    print("   1. MySQL está rodando?")
    print("   2. Credenciais estão corretas?")
    print("   3. Host e porta estão acessíveis?")
