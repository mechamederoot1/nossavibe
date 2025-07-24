#!/usr/bin/env python3
"""
Script para adicionar o campo onboarding_completed à tabela users
"""
import sys
import os
from datetime import datetime

# Adicionar o diretório raiz ao path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from core.database import engine, SessionLocal
from sqlalchemy import text

def add_onboarding_field():
    """Adiciona o campo onboarding_completed à tabela users"""
    db = SessionLocal()
    
    try:
        print("🔧 Verificando se o campo onboarding_completed já existe...")
        
        # Verificar se a coluna já existe
        result = db.execute(text("""
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'onboarding_completed'
        """)).fetchone()
        
        if result.count > 0:
            print("✅ Campo onboarding_completed já existe na tabela users")
            return True
        
        print("➕ Adicionando campo onboarding_completed à tabela users...")
        
        # Adicionar a coluna
        db.execute(text("""
            ALTER TABLE users 
            ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE 
            COMMENT 'Indica se o usuário completou o tutorial de boas-vindas'
        """))
        
        print("✅ Campo onboarding_completed adicionado com sucesso!")
        
        # Atualizar usuários existentes como tendo completado o onboarding
        # (assumindo que são usuários antigos que não precisam ver o tutorial)
        result = db.execute(text("""
            UPDATE users 
            SET onboarding_completed = TRUE 
            WHERE created_at < NOW() - INTERVAL 1 DAY
        """))
        
        updated_count = result.rowcount
        print(f"✅ {updated_count} usuários existentes marcados como tendo completado o onboarding")
        
        db.commit()
        print("🎉 Migração concluída com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro durante a migração: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def verify_migration():
    """Verifica se a migração foi aplicada corretamente"""
    db = SessionLocal()
    
    try:
        print("\n🔍 Verificando a migração...")
        
        # Verificar estrutura da tabela
        result = db.execute(text("""
            DESCRIBE users
        """)).fetchall()
        
        onboarding_field_found = False
        for row in result:
            if row[0] == 'onboarding_completed':
                onboarding_field_found = True
                print(f"✅ Campo encontrado: {row[0]} - {row[1]} - Default: {row[4]}")
                break
        
        if not onboarding_field_found:
            print("❌ Campo onboarding_completed não encontrado!")
            return False
        
        # Verificar dados
        result = db.execute(text("""
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN onboarding_completed = TRUE THEN 1 ELSE 0 END) as completed_onboarding,
                SUM(CASE WHEN onboarding_completed = FALSE THEN 1 ELSE 0 END) as pending_onboarding
            FROM users
        """)).fetchone()
        
        print(f"📊 Estatísticas:")
        print(f"   Total de usuários: {result.total_users}")
        print(f"   Onboarding completo: {result.completed_onboarding}")
        print(f"   Onboarding pendente: {result.pending_onboarding}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro durante a verificação: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Iniciando migração para adicionar campo onboarding_completed")
    print("=" * 60)
    
    # Testar conexão com o banco
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        print("✅ Conexão com o banco de dados estabelecida")
    except Exception as e:
        print(f"❌ Erro de conexão com o banco: {e}")
        print("Verifique suas configurações de banco de dados no .env")
        sys.exit(1)
    
    # Executar migração
    if add_onboarding_field():
        if verify_migration():
            print("\n🎉 Migração concluída com sucesso!")
            print("O campo onboarding_completed foi adicionado à tabela users")
        else:
            print("\n⚠️ Migração executada, mas verificação falhou")
            sys.exit(1)
    else:
        print("\n❌ Falha na migração")
        sys.exit(1)
