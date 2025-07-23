#!/bin/bash

echo "🚀 Iniciando todos os serviços do Vibe..."

# Matar processos existentes nas portas
echo "🔧 Limpando portas..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Aguardar um momento
sleep 2

# Iniciar backend Python
echo "🐍 Iniciando backend Python na porta 8000..."
cd backend && python main.py &
BACKEND_PID=$!

# Aguardar o backend inicializar
sleep 5

# Iniciar serviço de e-mail Node.js
echo "📧 Iniciando serviço de e-mail na porta 3001..."
cd email-service && node index.js &
EMAIL_PID=$!

# Aguardar o serviço de e-mail inicializar
sleep 3

echo "✅ Serviços iniciados:"
echo "   - Backend Python: PID $BACKEND_PID (porta 8000)"
echo "   - Serviço de E-mail: PID $EMAIL_PID (porta 3001)"

# Função para parar os serviços
cleanup() {
    echo "🛑 Parando serviços..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $EMAIL_PID 2>/dev/null || true
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Aguardar indefinidamente
echo "📊 Serviços rodando. Pressione Ctrl+C para parar."
wait
