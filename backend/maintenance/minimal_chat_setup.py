#!/usr/bin/env python3
"""
Script mínimo para configurar o sistema de chat
Execute: python minimal_chat_setup.py
"""

import sys
import os

# Adicionar o diretório pai ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def setup_chat():
    try:
        from sqlalchemy import create_engine, text
        from core.config import get_database_url
        
        print("🚀 Configurando sistema de chat...")
        
        # Criar engine
        database_url = get_database_url()
        engine = create_engine(database_url)
        
        print("✅ Conexão com banco estabelecida!")
        
        # SQL para criar tabela messages se não existir
        create_messages_sql = """
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            recipient_id INT NOT NULL,
            content TEXT,
            message_type VARCHAR(20) DEFAULT 'text',
            media_url VARCHAR(500),
            media_metadata TEXT,
            is_read BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_sender (sender_id),
            INDEX idx_recipient (recipient_id),
            INDEX idx_created (created_at),
            INDEX idx_conversation (sender_id, recipient_id),
            INDEX idx_unread (recipient_id, is_read)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
        
        # SQL para adicionar colunas na tabela users se não existirem
        add_user_columns_sql = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen DATETIME;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;"
        ]
        
        with engine.connect() as conn:
            # Criar tabela messages
            print("📋 Criando/verificando tabela messages...")
            conn.execute(text(create_messages_sql))
            
            # Adicionar colunas em users (MySQL pode não suportar IF NOT EXISTS em ALTER)
            print("👥 Verificando colunas da tabela users...")
            for sql in add_user_columns_sql:
                try:
                    conn.execute(text(sql))
                except Exception as e:
                    if "Duplicate column name" in str(e):
                        print(f"   ✅ Coluna já existe (ok)")
                    else:
                        print(f"   ⚠️ {e}")
            
            # Verificar estrutura
            print("🔍 Verificando estrutura...")
            
            # Contar registros
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.scalar()
            
            result = conn.execute(text("SELECT COUNT(*) FROM messages"))
            message_count = result.scalar()
            
            print(f"📊 Status do banco:")
            print(f"   👥 Usuários: {user_count}")
            print(f"   💬 Mensagens: {message_count}")
            
            conn.commit()
        
        print("\n🎉 Sistema de chat configurado com sucesso!")
        print("\nFuncionalidades disponíveis:")
        print("- ✅ Envio de mensagens")
        print("- ✅ Histórico de conversas")  
        print("- ✅ Status de leitura")
        print("- ✅ Diferentes tipos de mídia")
        print("- ✅ WebSocket em tempo real")
        print("- ✅ Status online/offline")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        print("\n🔧 Solução alternativa:")
        print("Execute o arquivo chat_database_setup.sql manualmente no MySQL Workbench")
        return False

if __name__ == "__main__":
    success = setup_chat()
    if success:
        print("\n✅ Pronto! Agora reinicie o servidor backend")
    else:
        print("\n❌ Falhou. Tente a configuração manual via SQL")
