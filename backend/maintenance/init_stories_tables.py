#!/usr/bin/env python3
"""
Script simples para criar tabelas de stories
"""

import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import Base, engine
from models.story import Story, StoryView, StoryTag, StoryOverlay
from models.user import User

def create_stories_tables():
    """Criar tabelas de stories"""
    print("🔍 Criando tabelas de stories...")
    
    try:
        # Criar todas as tabelas
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas com sucesso!")
        
        # Verificar se foram criadas
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        required_tables = ['stories', 'story_views', 'story_tags', 'story_overlays']
        
        for table in required_tables:
            if table in tables:
                print(f"✅ Tabela {table} existe")
            else:
                print(f"❌ Tabela {table} NÃO foi criada")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {str(e)}")
        return False

if __name__ == "__main__":
    success = create_stories_tables()
    if success:
        print("\n🎉 Tabelas de stories prontas!")
    else:
        print("\n💥 Erro ao criar tabelas")
