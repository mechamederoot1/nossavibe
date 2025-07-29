#!/usr/bin/env python3
"""
Script para testar o sistema completo de chat
"""

import sys
import os
import asyncio
import json
from datetime import datetime

# Adicionar o diretório pai ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import sessionmaker
from core.database import engine
from models.user import User
from models.message import Message

def test_message_crud():
    """Testar operações CRUD de mensagens"""
    
    print("🧪 Testando operações CRUD de mensagens...")
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Buscar usuários para teste
        users = session.query(User).limit(2).all()
        if len(users) < 2:
            print("❌ Necessário pelo menos 2 usuários para testar mensagens")
            return False
        
        sender = users[0]
        recipient = users[1]
        
        print(f"📤 Remetente: {sender.first_name} {sender.last_name} (ID: {sender.id})")
        print(f"📥 Destinatário: {recipient.first_name} {recipient.last_name} (ID: {recipient.id})")
        
        # 1. Criar mensagem
        message = Message(
            sender_id=sender.id,
            recipient_id=recipient.id,
            content="Mensagem de teste automático",
            message_type="text"
        )
        session.add(message)
        session.commit()
        message_id = message.id
        print(f"✅ Mensagem criada (ID: {message_id})")
        
        # 2. Ler mensagem
        retrieved_message = session.query(Message).filter(Message.id == message_id).first()
        if retrieved_message:
            print(f"✅ Mensagem lida: '{retrieved_message.content}'")
        else:
            print("❌ Erro ao ler mensagem")
            return False
        
        # 3. Atualizar mensagem (marcar como lida)
        retrieved_message.is_read = True
        session.commit()
        print("✅ Mensagem marcada como lida")
        
        # 4. Buscar conversas
        conversation_messages = session.query(Message).filter(
            ((Message.sender_id == sender.id) & (Message.recipient_id == recipient.id)) |
            ((Message.sender_id == recipient.id) & (Message.recipient_id == sender.id))
        ).all()
        print(f"✅ Encontradas {len(conversation_messages)} mensagens na conversa")
        
        # 5. Deletar mensagem
        session.delete(retrieved_message)
        session.commit()
        print("✅ Mensagem deletada")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro no teste CRUD: {e}")
        return False
    finally:
        session.close()

def test_conversation_queries():
    """Testar consultas de conversas"""
    
    print("\n🧪 Testando consultas de conversas...")
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Buscar usuários
        users = session.query(User).limit(3).all()
        if len(users) < 2:
            print("❌ Necessário pelo menos 2 usuários")
            return False
        
        # Criar algumas mensagens de teste
        test_messages = [
            Message(sender_id=users[0].id, recipient_id=users[1].id, content="Olá!", message_type="text"),
            Message(sender_id=users[1].id, recipient_id=users[0].id, content="Oi! Como vai?", message_type="text"),
            Message(sender_id=users[0].id, recipient_id=users[1].id, content="Tudo bem!", message_type="text"),
        ]
        
        if len(users) >= 3:
            test_messages.append(
                Message(sender_id=users[0].id, recipient_id=users[2].id, content="Oi para você também!", message_type="text")
            )
        
        for msg in test_messages:
            session.add(msg)
        session.commit()
        print(f"✅ Criadas {len(test_messages)} mensagens de teste")
        
        # Testar busca de conversas de um usuário
        user_conversations = session.query(Message).filter(
            (Message.sender_id == users[0].id) | (Message.recipient_id == users[0].id)
        ).all()
        print(f"✅ Usuário {users[0].first_name} tem {len(user_conversations)} mensagens")
        
        # Testar busca de mensagens não lidas
        unread_messages = session.query(Message).filter(
            Message.recipient_id == users[1].id,
            Message.is_read == False
        ).all()
        print(f"✅ Usuário {users[1].first_name} tem {len(unread_messages)} mensagens não lidas")
        
        # Limpeza: deletar mensagens de teste
        for msg in test_messages:
            session.delete(msg)
        session.commit()
        print("✅ Mensagens de teste removidas")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro no teste de conversas: {e}")
        return False
    finally:
        session.close()

def test_message_types():
    """Testar diferentes tipos de mensagem"""
    
    print("\n🧪 Testando tipos de mensagem...")
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        users = session.query(User).limit(2).all()
        if len(users) < 2:
            print("❌ Necessário pelo menos 2 usuários")
            return False
        
        message_types = [
            ("text", "Mensagem de texto"),
            ("image", "foto.jpg", "/uploads/images/foto.jpg"),
            ("video", "video.mp4", "/uploads/videos/video.mp4"),
            ("audio", "audio.wav", "/uploads/audio/audio.wav"),
            ("file", "documento.pdf", "/uploads/files/documento.pdf"),
            ("sticker", "", "/stickers/emoji-1.png")
        ]
        
        created_messages = []
        
        for msg_type, content, *media_url in message_types:
            message = Message(
                sender_id=users[0].id,
                recipient_id=users[1].id,
                content=content,
                message_type=msg_type,
                media_url=media_url[0] if media_url else None
            )
            session.add(message)
            created_messages.append(message)
        
        session.commit()
        print(f"✅ Criadas mensagens de {len(message_types)} tipos diferentes")
        
        # Verificar cada tipo
        for message in created_messages:
            print(f"  📝 {message.message_type}: {message.content or message.media_url}")
        
        # Limpeza
        for message in created_messages:
            session.delete(message)
        session.commit()
        print("✅ Mensagens de teste removidas")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro no teste de tipos de mensagem: {e}")
        return False
    finally:
        session.close()

def test_performance():
    """Testar performance com muitas mensagens"""
    
    print("\n🧪 Testando performance...")
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        users = session.query(User).limit(2).all()
        if len(users) < 2:
            print("❌ Necessário pelo menos 2 usuários")
            return False
        
        # Criar muitas mensagens para teste de performance
        start_time = datetime.now()
        batch_size = 100
        
        messages = []
        for i in range(batch_size):
            message = Message(
                sender_id=users[i % 2].id,
                recipient_id=users[(i + 1) % 2].id,
                content=f"Mensagem de performance #{i + 1}",
                message_type="text"
            )
            messages.append(message)
        
        session.add_all(messages)
        session.commit()
        
        insert_time = datetime.now() - start_time
        print(f"✅ Inseridas {batch_size} mensagens em {insert_time.total_seconds():.2f}s")
        
        # Testar consulta de performance
        start_time = datetime.now()
        conversation = session.query(Message).filter(
            ((Message.sender_id == users[0].id) & (Message.recipient_id == users[1].id)) |
            ((Message.sender_id == users[1].id) & (Message.recipient_id == users[0].id))
        ).order_by(Message.created_at).limit(50).all()
        
        query_time = datetime.now() - start_time
        print(f"✅ Consultadas {len(conversation)} mensagens em {query_time.total_seconds():.2f}s")
        
        # Limpeza
        for message in messages:
            session.delete(message)
        session.commit()
        print("✅ Mensagens de teste removidas")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro no teste de performance: {e}")
        return False
    finally:
        session.close()

def test_websocket_data_format():
    """Testar formato de dados para WebSocket"""
    
    print("\n🧪 Testando formato de dados WebSocket...")
    
    try:
        # Formato de mensagem para WebSocket
        message_data = {
            "type": "message",
            "id": 123,
            "sender": {
                "id": 1,
                "first_name": "João",
                "last_name": "Silva",
                "avatar": "/uploads/avatars/joao.jpg"
            },
            "content": "Olá! Como você está?",
            "message_type": "text",
            "media_url": None,
            "is_read": False,
            "created_at": datetime.now().isoformat(),
            "is_own": False
        }
        
        # Formato de indicador de digitação
        typing_data = {
            "type": "typing",
            "sender_id": 1,
            "is_typing": True
        }
        
        # Formato de status online
        status_data = {
            "type": "user_status",
            "user_id": 1,
            "status": "online"
        }
        
        # Formato de recibo de leitura
        read_receipt_data = {
            "type": "message_read",
            "message_id": 123,
            "read_by": 2
        }
        
        # Validar se os dados podem ser serializados para JSON
        json.dumps(message_data)
        json.dumps(typing_data)
        json.dumps(status_data)
        json.dumps(read_receipt_data)
        
        print("✅ Formato de dados de mensagem validado")
        print("✅ Formato de dados de digitação validado")
        print("✅ Formato de dados de status validado")
        print("✅ Formato de dados de recibo de leitura validado")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro no teste de formato WebSocket: {e}")
        return False

def main():
    """Função principal de teste"""
    
    print("🚀 Iniciando testes do sistema de chat...")
    print("=" * 60)
    
    tests = [
        ("CRUD de Mensagens", test_message_crud),
        ("Consultas de Conversa", test_conversation_queries),
        ("Tipos de Mensagem", test_message_types),
        ("Performance", test_performance),
        ("Formato WebSocket", test_websocket_data_format)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Executando: {test_name}")
        print("-" * 40)
        
        try:
            if test_func():
                print(f"✅ {test_name}: PASSOU")
                passed += 1
            else:
                print(f"❌ {test_name}: FALHOU")
        except Exception as e:
            print(f"❌ {test_name}: ERRO - {e}")
    
    print("\n" + "=" * 60)
    print(f"📊 Resultados dos testes:")
    print(f"   ✅ Passaram: {passed}/{total}")
    print(f"   ❌ Falharam: {total - passed}/{total}")
    
    if passed == total:
        print("🎉 Todos os testes passaram! Sistema de chat funcionando corretamente.")
        return True
    else:
        print("⚠️ Alguns testes falharam. Verifique a configuração do sistema.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
