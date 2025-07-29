#!/usr/bin/env python3
"""
Script para iniciar o backend do Vibe Social Network
"""
import subprocess
import sys
import os

def main():
    """Iniciar o backend"""
    print("🚀 Iniciando Vibe Backend...")
    
    # Verificar se estamos no diretório correto
    if not os.path.exists("backend"):
        print("❌ Erro: Diretório 'backend' não encontrado")
        print("Execute este script a partir da raiz do projeto")
        sys.exit(1)
    
    # Mudar para o diretório backend
    os.chdir("backend")
    
    # Verificar se o main.py existe
    if not os.path.exists("main.py"):
        print("❌ Erro: arquivo main.py não encontrado em backend/")
        sys.exit(1)
    
    try:
        # Inicializar banco de dados primeiro
        print("🗄️ Inicializando banco de dados...")
        subprocess.run([sys.executable, "init_database.py"], check=True)
        
        # Iniciar o servidor
        print("🌟 Iniciando servidor FastAPI em http://localhost:8000")
        print("Pressione Ctrl+C para parar o servidor")
        print("="*50)
        
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ])
        
    except KeyboardInterrupt:
        print("\n🛑 Servidor parado pelo usuário")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao executar comando: {e}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    main()
