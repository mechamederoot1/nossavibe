#!/usr/bin/env python3
"""
Script para adicionar campos necessários para edição e arquivamento de posts
Adiciona: is_archived, updated_at
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import engine
from sqlalchemy import text

def add_post_fields():
    """Adiciona campos is_archived e updated_at à tabela posts"""
    
    with engine.connect() as connection:
        # Verificar se os campos já existem
        check_archived = text("""
            SELECT COUNT(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'posts' 
            AND COLUMN_NAME = 'is_archived'
        """)
        
        check_updated = text("""
            SELECT COUNT(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'posts' 
            AND COLUMN_NAME = 'updated_at'
        """)
        
        archived_exists = connection.execute(check_archived).scalar()
        updated_exists = connection.execute(check_updated).scalar()
        
        # Adicionar campo is_archived se não existir
        if not archived_exists:
            print("Adicionando campo 'is_archived' à tabela posts...")
            alter_archived = text("""
                ALTER TABLE posts 
                ADD COLUMN is_archived BOOLEAN DEFAULT FALSE NOT NULL
            """)
            connection.execute(alter_archived)
            print("✅ Campo 'is_archived' adicionado com sucesso!")
        else:
            print("❌ Campo 'is_archived' já existe na tabela posts")
        
        # Adicionar campo updated_at se não existir
        if not updated_exists:
            print("Adicionando campo 'updated_at' à tabela posts...")
            alter_updated = text("""
                ALTER TABLE posts 
                ADD COLUMN updated_at DATETIME DEFAULT NULL
            """)
            connection.execute(alter_updated)
            print("✅ Campo 'updated_at' adicionado com sucesso!")
        else:
            print("❌ Campo 'updated_at' já existe na tabela posts")
        
        connection.commit()
        print("\n🎉 Migração concluída com sucesso!")

if __name__ == "__main__":
    try:
        add_post_fields()
    except Exception as e:
        print(f"❌ Erro durante a migração: {e}")
        sys.exit(1)
