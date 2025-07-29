#!/usr/bin/env python3
"""
Script para adicionar novas tabelas de funcionalidades sociais:
- Reações em comentários
- Posts salvos
- Coleções/pastas de posts salvos
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from core.database import engine, Base
from models.saved_posts import SavedPostCollection, SavedPost, CommentReaction

def create_social_features_tables():
    """Criar as novas tabelas para funcionalidades sociais"""
    
    print("🔧 Criando tabelas para funcionalidades sociais...")
    
    try:
        # Criar tabelas baseadas nos modelos SQLAlchemy
        Base.metadata.create_all(bind=engine, tables=[
            SavedPostCollection.__table__,
            SavedPost.__table__,
            CommentReaction.__table__
        ])
        
        print("✅ Tabelas criadas com sucesso!")
        
        # Criar pasta padrão "Salvos" para usuários existentes
        create_default_collections()
        
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        return False
    
    return True

def create_default_collections():
    """Criar pasta padrão 'Salvos' para todos os usuários existentes"""
    
    print("📁 Criando pastas padrão 'Salvos' para usuários existentes...")
    
    try:
        with engine.connect() as conn:
            # Verificar se já existem usuários
            result = conn.execute(text("SELECT COUNT(*) as count FROM users"))
            user_count = result.fetchone()[0]
            
            if user_count > 0:
                # Criar pasta padrão para cada usuário
                conn.execute(text("""
                    INSERT INTO saved_post_collections (user_id, name, description, is_default, created_at, updated_at)
                    SELECT 
                        id as user_id,
                        'Salvos' as name,
                        'Pasta padrão para posts salvos' as description,
                        true as is_default,
                        NOW() as created_at,
                        NOW() as updated_at
                    FROM users
                    WHERE id NOT IN (
                        SELECT user_id FROM saved_post_collections WHERE is_default = true
                    )
                """))
                
                conn.commit()
                print(f"✅ Criadas pastas padrão para {user_count} usuários!")
            else:
                print("ℹ️ Nenhum usuário encontrado, pastas serão criadas automaticamente no registro")
                
    except Exception as e:
        print(f"❌ Erro ao criar pastas padrão: {e}")

def check_table_exists(table_name):
    """Verificar se uma tabela já existe"""
    try:
        with engine.connect() as conn:
            # Tentar fazer uma query simples na tabela
            result = conn.execute(text(f"SELECT 1 FROM {table_name} LIMIT 1"))
            return True
    except:
        return False

def main():
    """Função principal"""
    print("🚀 Iniciando migração de funcionalidades sociais...")
    
    # Verificar se as tabelas já existem
    tables_to_check = [
        "saved_post_collections",
        "saved_posts", 
        "comment_reactions"
    ]
    
    existing_tables = []
    for table in tables_to_check:
        if check_table_exists(table):
            existing_tables.append(table)
    
    if existing_tables:
        print(f"⚠️ As seguintes tabelas já existem: {', '.join(existing_tables)}")
        response = input("Deseja continuar mesmo assim? (y/N): ")
        if response.lower() != 'y':
            print("❌ Operação cancelada pelo usuário")
            return
    
    # Executar migração
    if create_social_features_tables():
        print("\n🎉 Migração concluída com sucesso!")
        print("\n📋 Novas funcionalidades disponíveis:")
        print("   • Reações em comentários")
        print("   • Sistema de posts salvos")
        print("   • Pastas/coleções personalizadas")
        print("\n💡 Reinicie o backend para aplicar as mudanças")
    else:
        print("\n❌ Migração falhou!")
        sys.exit(1)

if __name__ == "__main__":
    main()
