#!/usr/bin/env python3
"""
Script para adicionar novas tabelas de funcionalidades sociais
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text, Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

# Importar configurações básicas
try:
    from core.database import engine, Base
except ImportError:
    print("❌ Erro: Não foi possível importar configurações do banco.")
    print("Certifique-se de estar no diretório backend e que o arquivo core/database.py existe.")
    sys.exit(1)

# Definir os modelos inline
class SavedPostCollection(Base):
    __tablename__ = "saved_post_collections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SavedPost(Base):
    __tablename__ = "saved_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    collection_id = Column(Integer, ForeignKey("saved_post_collections.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class CommentReaction(Base):
    __tablename__ = "comment_reactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False)
    reaction_type = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def create_tables():
    print("🔧 Criando tabelas...")
    
    try:
        Base.metadata.create_all(bind=engine, tables=[
            SavedPostCollection.__table__,
            SavedPost.__table__,
            CommentReaction.__table__
        ])
        
        print("✅ Tabelas criadas com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_table_exists(table_name):
    try:
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT 1 FROM {table_name} LIMIT 1"))
            return True
    except:
        return False

def main():
    print("🚀 Iniciando migração...")
    print(f"📁 Diretório: {os.getcwd()}")
    
    # Verificar tabelas existentes
    tables = ["saved_post_collections", "saved_posts", "comment_reactions"]
    existing = [t for t in tables if check_table_exists(t)]
    
    if existing:
        print(f"⚠️ Tabelas existentes: {', '.join(existing)}")
        response = input("Continuar? (y/N): ")
        if response.lower() != 'y':
            print("❌ Cancelado")
            return
    
    # Criar tabelas
    if create_tables():
        print("\n🎉 Migração concluída!")
        print("\n🚀 Funcionalidades adicionadas:")
        print("   • ❤️ Reações em comentários")
        print("   • 💾 Posts salvos")
        print("   • 📁 Coleções personalizadas")
        print("\n💡 Reinicie o backend")
    else:
        print("\n❌ Migração falhou!")
        sys.exit(1)

if __name__ == "__main__":
    main()
