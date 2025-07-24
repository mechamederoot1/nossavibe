#!/bin/bash

# Script para executar a migração do campo onboarding_completed
# Este script adiciona o campo à tabela users e configura os dados iniciais

echo "🚀 Executando migração para adicionar campo onboarding_completed"
echo "=================================================================="

# Verificar se estamos no diretório correto
if [ ! -f "../.env" ]; then
    echo "❌ Arquivo .env não encontrado no diretório pai"
    echo "Execute este script a partir do diretório backend/maintenance/"
    exit 1
fi

# Verificar se Python está disponível
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Instale Python3 para continuar."
    exit 1
fi

# Executar o script de migração
echo "🔧 Executando script de migração..."
python3 add_onboarding_field.py

# Verificar o código de saída
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migração executada com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo "   1. Reinicie o servidor backend para carregar as mudanças do modelo"
    echo "   2. O campo onboarding_completed agora está disponível"
    echo "   3. Novos usuários começarão com onboarding_completed = FALSE"
    echo "   4. Usuários existentes foram marcados como onboarding_completed = TRUE"
    echo ""
    echo "🔗 Endpoints disponíveis:"
    echo "   POST /auth/complete-onboarding - Marcar onboarding como completo"
    echo "   GET /auth/me - Verificar status do onboarding no campo onboarding_completed"
else
    echo ""
    echo "❌ Erro durante a migração!"
    echo "Verifique os logs acima para mais detalhes."
    exit 1
fi
