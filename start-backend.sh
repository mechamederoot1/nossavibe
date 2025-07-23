#!/bin/bash

echo "🚀 Iniciando Vibe Backend..."
echo "=========================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Erro: Python 3 não está instalado"
    exit 1
fi

# Navigate to backend directory
cd backend

# Inicializar banco de dados
echo "🗄️ Verificando banco de dados..."
python3 init_database.py

# Start the backend server
echo "🌟 Iniciando servidor FastAPI em http://localhost:8000"
echo "Pressione Ctrl+C para parar o servidor"
echo "========================================"

python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
