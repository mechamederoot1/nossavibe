#!/bin/bash

echo "🚀 Iniciando Microserviço de E-mail Melhorado..."
echo "=============================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Erro: Node.js não está instalado"
    echo "💡 Instale Node.js em: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Navegar para o diretório do serviço de e-mail
cd backend/email-service

# Executar setup
echo "🔧 Executando configuração inicial..."
node setup.js

# Verificar se as variáveis de ambiente estão configuradas
echo "🔍 Verificando configurações..."

if [ -f ".env" ]; then
    echo "✅ Arquivo .env encontrado"
    
    # Verificar se as variáveis SMTP estão definidas
    if grep -q "SMTP_HOST=" .env && grep -q "SMTP_USER=" .env; then
        echo "✅ Configurações SMTP encontradas"
    else
        echo "⚠️  Configure suas credenciais SMTP no arquivo .env"
        echo "📝 Edite o arquivo backend/email-service/.env"
    fi
else
    echo "❌ Arquivo .env não encontrado"
    exit 1
fi

# Configurar banco de dados
echo "🗄️ Configurando banco de dados..."
node setup_database.js

# Iniciar o serviço
echo "🌟 Iniciando microserviço de e-mail na porta 3001"
echo "📧 Configurações SMTP carregadas"
echo "Pressione Ctrl+C para parar o servidor"
echo "========================================"

npm start