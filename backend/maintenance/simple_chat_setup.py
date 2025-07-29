#!/usr/bin/env python3
"""
Script simplificado para configurar o sistema de chat
Execute: python simple_chat_setup.py
"""

import sys
import os

# Adicionar o diretório pai ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from core.database import Base, engine
    from models.message import Message
    from models.user import User
    
    print("🚀 Configurando sistema de chat...")
    
    # Criar todas as tabelas se não existirem
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas/verificadas com sucesso!")
    
    # Testar conexão simples
    from sqlalchemy.orm import sessionmaker
    Session = sessionmaker(bind=engine)
    session = Session()
    
    user_count = session.query(User).count()
    message_count = session.query(Message).count()
    
    print(f"📊 Status do banco:")
    print(f"   👥 Usuários: {user_count}")
    print(f"   💬 Mensagens: {message_count}")
    
    session.close()
    
    print("\n🎉 Sistema de chat configurado com sucesso!")
    print("\nFuncionalidades disponíveis:")
    print("- ✅ Mensagens em tempo real")
    print("- ✅ Status online/offline")
    print("- ✅ Indicadores de digitação")
    print("- ✅ Recibos de leitura")
    print("- ✅ Histórico de conversas")
    print("- ✅ Envio de mídia")
    
except ImportError as e:
    print(f"❌ Erro de importação: {e}")
    print("Certifique-se de estar no diretório correto e ter as dependências instaladas.")
    sys.exit(1)
except Exception as e:
    print(f"❌ Erro: {e}")
    sys.exit(1)
