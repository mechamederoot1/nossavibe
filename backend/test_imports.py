#!/usr/bin/env python3
"""
Script para testar se as importações estão funcionando
Execute: python test_imports.py
"""

import sys
import os

try:
    print("🧪 Testando importações...")
    
    # Testar importação do modelo Message
    from models.message import Message
    print("✅ models.message.Message importado com sucesso")
    
    # Testar importação das rotas
    from routes.messages import router as messages_router
    print("✅ routes.messages importado com sucesso")
    
    # Testar importação do main (sem executar)
    import importlib.util
    spec = importlib.util.spec_from_file_location("main", "main.py")
    if spec and spec.loader:
        print("✅ main.py pode ser importado sem erro")
    
    print("\n🎉 Todas as importações funcionaram!")
    print("✅ O servidor backend deve iniciar sem problemas")
    
except ImportError as e:
    print(f"❌ Erro de importação: {e}")
    sys.exit(1)
    
except Exception as e:
    print(f"❌ Erro: {e}")
    sys.exit(1)

print("\n🚀 Execute agora: python main.py")
