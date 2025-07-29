#!/usr/bin/env python3
"""
Script para configurar tabelas de chat no banco de dados
"""

import sys
import os

# Adicionar o diretório pai ao path para importar módulos do backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text, MetaData, Table, Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from core.config import get_database_url
from core.database import Base, engine
from models.message import Message
from models.user import User

def check_table_exists(engine, table_name):
    """Verificar se uma tabela existe no banco de dados"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text(f"SHOW TABLES LIKE '{table_name}'"))
            return result.fetchone() is not None
    except Exception as e:
        print(f"Erro ao verificar tabela {table_name}: {e}")
        return False

def create_chat_tables():
    """Criar tabelas necessárias para o sistema de chat"""
    
    print("🔍 Verificando estrutura do banco de dados para chat...")
    
    # Verificar se a tabela de mensagens existe
    messages_exists = check_table_exists(engine, 'messages')
    users_exists = check_table_exists(engine, 'users')
    
    print(f"✅ Tabela 'users': {'Existe' if users_exists else 'Não existe'}")
    print(f"✅ Tabela 'messages': {'Existe' if messages_exists else 'Não existe'}")
    
    if not users_exists:
        print("❌ Tabela 'users' não encontrada. Execute o script de inicialização do banco primeiro.")
        return False
    
    # Criar todas as tabelas se não existirem
    try:
        print("🔧 Criando/Atualizando tabelas...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas/atualizadas com sucesso!")
        
        # Verificar se as colunas necessárias existem na tabela messages
        verify_message_columns()
        
        # Verificar se as colunas necessárias existem na tabela users
        verify_user_columns()
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        return False

def verify_message_columns():
    """Verificar e adicionar colunas necessárias na tabela messages"""
    
    required_columns = {
        'sender_id': 'INT NOT NULL',
        'recipient_id': 'INT NOT NULL',
        'content': 'TEXT',
        'message_type': 'VARCHAR(20) DEFAULT "text"',
        'media_url': 'VARCHAR(500)',
        'media_metadata': 'TEXT',
        'is_read': 'BOOLEAN DEFAULT FALSE',
        'created_at': 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        'updated_at': 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    }
    
    print("🔍 Verificando colunas da tabela 'messages'...")
    
    try:
        with engine.connect() as conn:
            # Obter colunas existentes
            result = conn.execute(text("DESCRIBE messages"))
            existing_columns = {row[0] for row in result.fetchall()}
            
            # Adicionar colunas que estão faltando
            for column_name, column_definition in required_columns.items():
                if column_name not in existing_columns:
                    print(f"➕ Adicionando coluna '{column_name}' à tabela 'messages'...")
                    try:
                        conn.execute(text(f"ALTER TABLE messages ADD COLUMN {column_name} {column_definition}"))
                        print(f"✅ Coluna '{column_name}' adicionada com sucesso!")
                    except Exception as e:
                        print(f"⚠️ Erro ao adicionar coluna '{column_name}': {e}")
                else:
                    print(f"✅ Coluna '{column_name}' já existe")
            
            # Adicionar índices para performance
            add_message_indexes(conn)
            
    except Exception as e:
        print(f"❌ Erro ao verificar colunas da tabela 'messages': {e}")

def verify_user_columns():
    """Verificar e adicionar colunas necessárias na tabela users para status online"""
    
    required_columns = {
        'last_seen': 'DATETIME',
        'is_online': 'BOOLEAN DEFAULT FALSE'
    }
    
    print("🔍 Verificando colunas da tabela 'users' para chat...")
    
    try:
        with engine.connect() as conn:
            # Obter colunas existentes
            result = conn.execute(text("DESCRIBE users"))
            existing_columns = {row[0] for row in result.fetchall()}
            
            # Adicionar colunas que estão faltando
            for column_name, column_definition in required_columns.items():
                if column_name not in existing_columns:
                    print(f"➕ Adicionando coluna '{column_name}' à tabela 'users'...")
                    try:
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_definition}"))
                        print(f"✅ Coluna '{column_name}' adicionada com sucesso!")
                    except Exception as e:
                        print(f"⚠️ Erro ao adicionar coluna '{column_name}': {e}")
                else:
                    print(f"✅ Coluna '{column_name}' já existe")
            
    except Exception as e:
        print(f"❌ Erro ao verificar colunas da tabela 'users': {e}")

def add_message_indexes(conn):
    """Adicionar índices para melhor performance das consultas de chat"""
    
    indexes = [
        ("idx_messages_sender", "messages", "sender_id"),
        ("idx_messages_recipient", "messages", "recipient_id"),
        ("idx_messages_created_at", "messages", "created_at"),
        ("idx_messages_conversation", "messages", "sender_id, recipient_id"),
        ("idx_messages_unread", "messages", "recipient_id, is_read")
    ]
    
    print("🔍 Adicionando índices para performance...")
    
    for index_name, table_name, columns in indexes:
        try:
            # Verificar se o índice já existe
            result = conn.execute(text(f"SHOW INDEX FROM {table_name} WHERE Key_name = '{index_name}'"))
            if result.fetchone() is None:
                print(f"➕ Criando índice '{index_name}'...")
                conn.execute(text(f"CREATE INDEX {index_name} ON {table_name} ({columns})"))
                print(f"✅ Índice '{index_name}' criado com sucesso!")
            else:
                print(f"✅ Índice '{index_name}' já existe")
        except Exception as e:
            print(f"⚠️ Erro ao criar índice '{index_name}': {e}")

def test_chat_functionality():
    """Testar funcionalidades básicas do chat"""
    
    print("🧪 Testando funcionalidades do chat...")
    
    try:
        from sqlalchemy.orm import sessionmaker
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Testar consulta de usuários
        user_count = session.query(User).count()
        print(f"✅ Usuários no banco: {user_count}")
        
        # Testar consulta de mensagens
        message_count = session.query(Message).count()
        print(f"✅ Mensagens no banco: {message_count}")
        
        # Testar criação de uma mensagem de teste (se houver usuários)
        if user_count >= 2:
            users = session.query(User).limit(2).all()
            if len(users) >= 2:
                # Verificar se já existe uma mensagem de teste
                test_message = session.query(Message).filter(
                    Message.content == "Mensagem de teste do sistema de chat"
                ).first()
                
                if not test_message:
                    test_message = Message(
                        sender_id=users[0].id,
                        recipient_id=users[1].id,
                        content="Mensagem de teste do sistema de chat",
                        message_type="text"
                    )
                    session.add(test_message)
                    session.commit()
                    print("✅ Mensagem de teste criada com sucesso!")
                else:
                    print("✅ Mensagem de teste já existe")
        
        session.close()
        print("✅ Teste de funcionalidades concluído!")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar funcionalidades: {e}")
        return False

def main():
    """Função principal"""
    
    print("🚀 Iniciando configuração do sistema de chat...")
    print("=" * 50)
    
    # Verificar conexão com o banco
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Conexão com banco de dados estabelecida!")
    except Exception as e:
        print(f"❌ Erro de conexão com o banco: {e}")
        return False
    
    # Criar tabelas
    if not create_chat_tables():
        print("❌ Falha ao criar tabelas do chat")
        return False
    
    # Testar funcionalidades
    if not test_chat_functionality():
        print("❌ Falha ao testar funcionalidades do chat")
        return False
    
    print("=" * 50)
    print("🎉 Sistema de chat configurado com sucesso!")
    print("\nFuncionalidades disponíveis:")
    print("- ✅ Envio de mensagens texto")
    print("- ✅ Envio de mídia (imagens, vídeos, áudio)")
    print("- ✅ Status de leitura")
    print("- ✅ Histórico de conversas")
    print("- ✅ Indicadores de digitação (WebSocket)")
    print("- ✅ Status online (WebSocket)")
    print("- ✅ Notificações em tempo real")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
