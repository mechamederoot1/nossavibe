"""
Script para verificar e corrigir tabelas de notificações
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text, inspect
from core.database import engine, SessionLocal
from models import Notification, NotificationType

def check_and_fix_notifications_tables():
    """Verificar e corrigir estrutura das tabelas de notificações"""
    
    print("🔍 Verificando estrutura das tabelas de notificações...")
    
    db = SessionLocal()
    try:
        # Verificar se a tabela notifications existe
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if "notifications" not in tables:
            print("❌ Tabela 'notifications' não encontrada. Criando...")
            
            # Criar todas as tabelas
            from core.database import Base
            Base.metadata.create_all(bind=engine)
            print("✅ Tabelas criadas com sucesso!")
        
        else:
            print("✅ Tabela 'notifications' encontrada.")
            
            # Verificar estrutura da tabela
            columns = inspector.get_columns("notifications")
            column_names = [col['name'] for col in columns]
            
            expected_columns = [
                'id', 'recipient_id', 'sender_id', 'notification_type',
                'title', 'message', 'post_id', 'comment_id', 'story_id',
                'friendship_id', 'data', 'is_read', 'is_clicked', 
                'is_deleted', 'created_at', 'read_at', 'clicked_at'
            ]
            
            missing_columns = []
            for col in expected_columns:
                if col not in column_names:
                    missing_columns.append(col)
            
            if missing_columns:
                print(f"❌ Colunas faltando: {missing_columns}")
                print("🔧 Adicionando colunas faltantes...")
                
                for col in missing_columns:
                    try:
                        if col == 'is_clicked':
                            db.execute(text("ALTER TABLE notifications ADD COLUMN is_clicked BOOLEAN DEFAULT FALSE"))
                        elif col == 'is_deleted':
                            db.execute(text("ALTER TABLE notifications ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE"))
                        elif col == 'read_at':
                            db.execute(text("ALTER TABLE notifications ADD COLUMN read_at DATETIME NULL"))
                        elif col == 'clicked_at':
                            db.execute(text("ALTER TABLE notifications ADD COLUMN clicked_at DATETIME NULL"))
                        elif col == 'post_id':
                            db.execute(text("ALTER TABLE notifications ADD COLUMN post_id INTEGER NULL"))
                        elif col == 'comment_id':
                            db.execute(text("ALTER TABLE notifications ADD COLUMN comment_id INTEGER NULL"))
                        elif col == 'story_id':
                            db.execute(text("ALTER TABLE notifications ADD COLUMN story_id INTEGER NULL"))
                        elif col == 'friendship_id':
                            db.execute(text("ALTER TABLE notifications ADD COLUMN friendship_id INTEGER NULL"))
                        elif col == 'data':
                            db.execute(text("ALTER TABLE notifications ADD COLUMN data TEXT NULL"))
                        
                        print(f"  ✅ Coluna '{col}' adicionada")
                    except Exception as e:
                        print(f"  ⚠️  Erro ao adicionar coluna '{col}': {e}")
                
                db.commit()
                print("✅ Estrutura da tabela atualizada!")
            else:
                print("✅ Estrutura da tabela está correta!")
        
        # Testar inserção de notificação
        print("\n🧪 Testando sistema de notificações...")
        
        # Verificar se há usuários para teste
        result = db.execute(text("SELECT COUNT(*) as count FROM users")).fetchone()
        user_count = result[0] if result else 0
        
        if user_count >= 2:
            # Buscar dois usuários para teste
            users = db.execute(text("SELECT id FROM users LIMIT 2")).fetchall()
            user1_id = users[0][0]
            user2_id = users[1][0]
            
            # Criar notificação de teste
            test_notification = Notification(
                recipient_id=user2_id,
                sender_id=user1_id,
                notification_type=NotificationType.FRIEND_REQUEST,
                title="Teste de notificação",
                message="Esta é uma notificação de teste do sistema"
            )
            
            db.add(test_notification)
            db.commit()
            
            print(f"✅ Notificação de teste criada (ID: {test_notification.id})")
            
            # Remover notificação de teste
            db.delete(test_notification)
            db.commit()
            print("🗑️  Notificação de teste removida")
            
        else:
            print("⚠️  Não há usuários suficientes para teste (necessário pelo menos 2)")
        
        print("\n🎉 Verificação e correção concluída com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro durante verificação: {e}")
        db.rollback()
    
    finally:
        db.close()

if __name__ == "__main__":
    check_and_fix_notifications_tables()
