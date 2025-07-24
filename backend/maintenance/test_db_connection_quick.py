#!/usr/bin/env python3
"""
Teste rápido de conexão com o banco de dados
"""
import sys
import os

# Adicionar o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from dotenv import load_dotenv
    load_dotenv()  # Carregar .env file
    
    from core.config import get_database_url
    from sqlalchemy import create_engine, text
    
    print("🔍 TESTE DE CONEXÃO COM BANCO DE DADOS")
    print("="*50)
    
    # Mostrar configurações (sem senha)
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "3306") 
    db_user = os.getenv("DB_USER", "root")
    db_name = os.getenv("DB_NAME", "vibe")
    password_length = len(os.getenv("DB_PASSWORD", ""))
    
    print(f"📊 Configurações:")
    print(f"  - Host: {db_host}")
    print(f"  - Porta: {db_port}")
    print(f"  - Usuário: {db_user}")
    print(f"  - Banco: {db_name}")
    print(f"  - Senha: {'*' * password_length} ({password_length} caracteres)")
    
    # Tentar conectar
    print(f"\n🔄 Tentando conectar...")
    database_url = get_database_url()
    engine = create_engine(database_url)
    
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1 as test"))
        test_value = result.fetchone()[0]
        
        if test_value == 1:
            print("✅ Conexão bem-sucedida!")
            
            # Testar se banco 'vibe' existe
            result = conn.execute(text("SHOW DATABASES LIKE 'vibe'"))
            if result.fetchone():
                print("✅ Banco de dados 'vibe' existe!")
            else:
                print("❌ Banco de dados 'vibe' não existe!")
                
            # Mostrar tabelas
            conn.execute(text("USE vibe"))
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result.fetchall()]
            print(f"📋 Tabelas no banco: {len(tables)}")
            for table in tables:
                print(f"  - {table}")
        else:
            print("❌ Problema na consulta de teste")
            
except Exception as e:
    print(f"❌ Erro de conexão: {e}")
    print("\n💡 Possíveis soluções:")
    print("1. Verificar se MySQL está rodando")
    print("2. Verificar credenciais no arquivo .env")
    print("3. Verificar se o banco 'vibe' existe")
    print("4. Verificar permissões do usuário 'root'")
