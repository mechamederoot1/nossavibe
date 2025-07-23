#!/usr/bin/env python3
"""
Migração do Banco de Dados - Vibe Social Network
==============================================
Este script adiciona as colunas necessárias para o sistema de verificação de conta
"""

import mysql.connector
import sys
from datetime import datetime

def run_migration():
    """Executa a migração do banco de dados"""
    
    db_config = {
        'host': '127.0.0.1',
        'port': 3306,
        'user': 'root',
        'password': 'Dashwoodi@1995',
        'database': 'vibe',
        'charset': 'utf8mb4'
    }
    
    try:
        print("🔌 Conectando ao banco de dados...")
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        
        print("📋 Verificando estrutura atual da tabela users...")
        
        # Verificar se a coluna is_verified existe
        cursor.execute("SHOW COLUMNS FROM users LIKE 'is_verified'")
        is_verified_exists = cursor.fetchone() is not None
        
        if not is_verified_exists:
            print("➕ Adicionando coluna is_verified...")
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN is_verified BOOLEAN DEFAULT FALSE
            """)
            print("✅ Coluna is_verified adicionada!")
        else:
            print("✅ Coluna is_verified já existe")
        
        # Verificar se a coluna account_status existe
        cursor.execute("SHOW COLUMNS FROM users LIKE 'account_status'")
        account_status_exists = cursor.fetchone() is not None
        
        if not account_status_exists:
            print("➕ Adicionando coluna account_status...")
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN account_status ENUM('pending', 'active', 'suspended', 'banned') 
                DEFAULT 'pending'
            """)
            print("✅ Coluna account_status adicionada!")
        else:
            print("✅ Coluna account_status já existe")
        
        # Atualizar registros existentes
        print("🔄 Atualizando registros existentes...")
        
        # Marcar contas não verificadas como pending
        cursor.execute("""
            UPDATE users 
            SET account_status = 'pending' 
            WHERE (is_verified = FALSE OR is_verified IS NULL) 
            AND account_status NOT IN ('suspended', 'banned')
        """)
        
        # Ativar contas que já estão verificadas
        cursor.execute("""
            UPDATE users 
            SET account_status = 'active' 
            WHERE is_verified = TRUE AND account_status = 'pending'
        """)
        
        # Commit das mudanças
        connection.commit()
        
        # Verificar resultados
        cursor.execute("""
            SELECT account_status, is_verified, COUNT(*) as count 
            FROM users 
            GROUP BY account_status, is_verified
        """)
        
        results = cursor.fetchall()
        print("\n📊 Status das contas após migração:")
        for row in results:
            status, verified, count = row
            verified_text = "✅ Verificado" if verified else "❌ Não verificado"
            print(f"   - {status.title()}: {count} usuários ({verified_text})")
        
        # Verificar total de usuários
        cursor.execute("SELECT COUNT(*) FROM users")
        total = cursor.fetchone()[0]
        print(f"\n👥 Total de usuários: {total}")
        
        cursor.close()
        connection.close()
        
        print("\n🎉 Migração concluída com sucesso!")
        return True
        
    except mysql.connector.Error as err:
        print(f"❌ Erro na migração: {err}")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

if __name__ == "__main__":
    print("🚀 INICIANDO MIGRAÇÃO DO BANCO DE DADOS")
    print("=" * 50)
    print(f"⏰ Início: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    success = run_migration()
    
    if success:
        print("\n✅ Migração executada com sucesso!")
        sys.exit(0)
    else:
        print("\n❌ Falha na migração!")
        sys.exit(1)
