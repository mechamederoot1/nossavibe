#!/usr/bin/env python3
"""
Script simples para criar usuário teste
"""
import os
import sys
import hashlib
from datetime import datetime, timezone

# Adicionar path do backend
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

def hash_password_simple(password: str) -> str:
    """Hash simples de senha compatível com o backend"""
    # Usando o mesmo método do backend
    return hashlib.sha256(password.encode()).hexdigest()

def create_user_sql():
    """Gerar SQL para criar usuário teste"""
    
    email = "teste@mail.com"
    password = "12345678"
    hashed_password = hash_password_simple(password)
    now = datetime.now(timezone.utc).isoformat()
    
    sql_commands = f"""
-- Deletar usuário teste se já existir
DELETE FROM users WHERE email = '{email}';

-- Criar usuário teste
INSERT INTO users (
    first_name, 
    last_name, 
    username,
    email, 
    password_hash, 
    verified, 
    is_active,
    onboarding_completed,
    bio,
    location,
    created_at,
    last_seen
) VALUES (
    'Teste',
    'Usuario', 
    'teste_user',
    '{email}',
    '{hashed_password}',
    true,
    true,
    true,
    'Usuário de teste para desenvolvimento',
    'Brasil',
    '{now}',
    '{now}'
);

-- Verificar se foi criado
SELECT id, first_name, last_name, email, verified, is_active FROM users WHERE email = '{email}';
"""
    
    print("🔧 SQL PARA CRIAR USUÁRIO TESTE:")
    print("=" * 60)
    print(sql_commands)
    print("=" * 60)
    print(f"✅ CREDENCIAIS PARA LOGIN:")
    print(f"   Email: {email}")
    print(f"   Senha: {password}")
    print("=" * 60)
    
    # Tentar executar com SQLite se for o caso
    try:
        import sqlite3
        
        # Assumindo que é SQLite
        db_path = "vibe.db"
        if os.path.exists(db_path):
            print(f"📁 Tentando conectar ao SQLite: {db_path}")
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Executar comandos
            commands = sql_commands.split(';')
            for cmd in commands:
                cmd = cmd.strip()
                if cmd and not cmd.startswith('--'):
                    try:
                        cursor.execute(cmd)
                    except Exception as e:
                        print(f"⚠️ Comando falhou: {e}")
            
            conn.commit()
            
            # Verificar resultado
            cursor.execute("SELECT id, first_name, last_name, email, verified, is_active FROM users WHERE email = ?", (email,))
            result = cursor.fetchone()
            
            if result:
                print(f"✅ Usuário criado com sucesso!")
                print(f"   ID: {result[0]}")
                print(f"   Nome: {result[1]} {result[2]}")
                print(f"   Email: {result[3]}")
                print(f"   Verificado: {result[4]}")
                print(f"   Ativo: {result[5]}")
            else:
                print("❌ Falha ao criar usuário")
                
            conn.close()
        else:
            print(f"❌ Arquivo SQLite não encontrado: {db_path}")
            print("📝 Execute os comandos SQL acima manualmente no seu banco de dados")
            
    except ImportError:
        print("📝 Execute os comandos SQL acima manualmente no seu banco de dados")
    except Exception as e:
        print(f"❌ Erro: {e}")
        print("📝 Execute os comandos SQL acima manualmente no seu banco de dados")

if __name__ == "__main__":
    create_user_sql()
