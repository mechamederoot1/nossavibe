#!/usr/bin/env python3
"""
Corrigir usuários verificados que ainda têm status 'pending'
"""
import sys
import os

# Adicionar o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from models.user import User, AccountStatus

def fix_verified_users():
    db = SessionLocal()
    
    try:
        print("🔧 CORRIGINDO USUÁRIOS VERIFICADOS")
        print("="*40)
        
        # Buscar usuários verificados mas com status pending
        users_to_fix = db.query(User).filter(
            User.is_verified == True,
            User.account_status == AccountStatus.pending
        ).all()
        
        print(f"📊 Usuários verificados com status pending: {len(users_to_fix)}")
        
        if users_to_fix:
            for user in users_to_fix:
                print(f"👤 Corrigindo usuário: {user.email} (ID: {user.id})")
                user.account_status = AccountStatus.active
            
            db.commit()
            print(f"✅ {len(users_to_fix)} usuários corrigidos!")
        else:
            print("✅ Nenhum usuário precisa de correção!")
        
        # Mostrar status atual
        print(f"\n📊 STATUS ATUAL DOS USUÁRIOS:")
        all_users = db.query(User).all()
        
        for user in all_users:
            status_str = user.account_status.value if hasattr(user.account_status, 'value') else str(user.account_status)
            verified_str = "✅" if user.is_verified else "❌"
            print(f"  - {user.email}: {verified_str} verified, status: {status_str}")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_verified_users()
