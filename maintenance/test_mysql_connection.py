#!/usr/bin/env python3
"""
Script para testar e corrigir a conexão MySQL
"""
import pymysql
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

def test_mysql_connection():
    """Testa a conexão com MySQL e oferece soluções"""
    
    print("🔍 Testando conexão com MySQL...")
    
    # Configurações do banco
    config = {
        'host': '127.0.0.1',
        'port': 3306,
        'user': 'root',
        'password': 'Evo@000#!',
        'charset': 'utf8mb4'
    }
    
    print(f"📋 Configurações:")
    print(f"   Host: {config['host']}")
    print(f"   Port: {config['port']}")
    print(f"   User: {config['user']}")
    print(f"   Password: {'*' * len(config['password'])}")
    
    try:
        # Tentar conectar sem especificar banco primeiro
        print("\n🔄 Tentando conectar ao MySQL...")
        connection = pymysql.connect(**config)
        
        print("✅ Conexão estabelecida com sucesso!")
        
        cursor = connection.cursor()
        
        # Verificar versão
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"🐬 Versão do MySQL: {version[0]}")
        
        # Verificar usuário atual
        cursor.execute("SELECT USER()")
        current_user = cursor.fetchone()
        print(f"👤 Usuário conectado: {current_user[0]}")
        
        # Listar bancos de dados
        cursor.execute("SHOW DATABASES")
        databases = [db[0] for db in cursor.fetchall()]
        print(f"📚 Bancos disponíveis: {', '.join(databases)}")
        
        # Criar banco 'vibe' se não existir
        if 'vibe' not in databases:
            print("🔧 Criando banco de dados 'vibe'...")
            cursor.execute("CREATE DATABASE vibe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print("✅ Banco 'vibe' criado com sucesso!")
        else:
            print("✅ Banco 'vibe' já existe!")
        
        # Testar conexão com o banco específico
        cursor.execute("USE vibe")
        print("✅ Conectado ao banco 'vibe'!")
        
        cursor.close()
        connection.close()
        
        return True
        
    except pymysql.Error as e:
        print(f"❌ Erro MySQL: {e}")
        print("\n🔧 Possíveis soluções:")
        
        if "Access denied" in str(e):
            print("1. Verifique se a senha do MySQL está correta")
            print("2. Execute no MySQL como administrador:")
            print("   ALTER USER 'root'@'localhost' IDENTIFIED BY 'Evo@000#!';")
            print("   FLUSH PRIVILEGES;")
            print("3. Ou crie um novo usuário:")
            print("   CREATE USER 'vibe_user'@'localhost' IDENTIFIED BY 'Evo@000#!';")
            print("   GRANT ALL PRIVILEGES ON vibe.* TO 'vibe_user'@'localhost';")
            print("   FLUSH PRIVILEGES;")
        
        elif "Can't connect" in str(e):
            print("1. Verifique se o MySQL está rodando")
            print("2. Verifique se a porta 3306 está aberta")
            print("3. Tente conectar com um cliente MySQL primeiro")
        
        return False
    
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        return False

def create_mysql_user():
    """Cria um usuário específico para a aplicação"""
    print("\n🔧 Criando usuário específico para a aplicação...")
    
    try:
        # Conectar como root sem senha (se possível)
        connection = pymysql.connect(
            host='127.0.0.1',
            port=3306,
            user='root',
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        # Criar usuário
        cursor.execute("CREATE USER IF NOT EXISTS 'vibe_user'@'localhost' IDENTIFIED BY 'Evo@000#!'")
        cursor.execute("GRANT ALL PRIVILEGES ON vibe.* TO 'vibe_user'@'localhost'")
        cursor.execute("FLUSH PRIVILEGES")
        
        print("✅ Usuário 'vibe_user' criado com sucesso!")
        print("📝 Atualize o .env para usar:")
        print("   DB_USER=vibe_user")
        
        cursor.close()
        connection.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Diagnóstico de Conexão MySQL")
    print("=" * 40)
    
    success = test_mysql_connection()
    
    if not success:
        print("\n💡 Tentando criar usuário alternativo...")
        create_mysql_user()
    
    print("\n" + "=" * 40)
    print("✅ Diagnóstico concluído!")