#!/bin/bash

echo "🚀 Iniciando Microserviço de E-mail..."
echo "=========================="

# Navigate to email service directory
cd backend/email-service

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Erro: Node.js não está instalado"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Setup database tables
echo "🗄️ Configurando banco de dados..."
node setup_database.js

# Start the email service
echo "🌟 Iniciando microserviço de e-mail na porta 3001"
echo "Pressione Ctrl+C para parar o servidor"
echo "========================================"

npm start
