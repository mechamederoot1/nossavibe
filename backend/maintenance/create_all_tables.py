#!/usr/bin/env python3
"""
Script para criar todas as tabelas do banco de dados
Execute: python create_all_tables.py
"""

import sys
import os

# Adicionar o diretório pai ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def create_all_tables():
    try:
        from core.database import Base, engine
        from models import *  # Import all models
        
        print("🚀 Criando todas as tabelas do banco de dados...")
        
        # Criar todas as tabelas
        Base.metadata.create_all(bind=engine)
        
        print("✅ Todas as tabelas foram criadas com sucesso!")
        
        # Verificar tabelas criadas
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result.fetchall()]
            
            print(f"\n📊 {len(tables)} tabelas criadas:")
            for table in sorted(tables):
                print(f"  ✅ {table}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        return False

if __name__ == "__main__":
    success = create_all_tables()
    if success:
        print("\n🎉 Banco de dados configurado com sucesso!")
        print("Agora execute: python main.py")
    else:
        print("\n❌ Falha na configuração do banco")
        sys.exit(1)
