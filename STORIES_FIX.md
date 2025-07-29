# Correção do Problema dos Stories

## Problema Identificado
Os stories estavam sendo criados, mas apareciam escuros/pretos sem mostrar as imagens porque:

1. **Backend offline**: O servidor Python/FastAPI em `http://localhost:8000` não estava rodando
2. **URLs das imagens quebradas**: As imagens dos stories apontavam para o backend offline
3. **Sem fallback**: Não havia tratamento quando as imagens falhavam ao carregar

## Soluções Implementadas

### 1. Tratamento de Erro nas Imagens
- **StoryViewer.tsx**: Adicionado fallback visual quando imagens não carregam
- **StoriesBar.tsx**: Preview dos stories agora mostra ícone quando imagem falha
- Suporte para URLs base64 (para stories salvos localmente)

### 2. Sistema de Stories Locais
- **StoryUploadHelper.tsx**: Stories são salvos em localStorage quando backend está offline
- Conversão automática de arquivos para base64
- Expiração automática dos stories locais

### 3. Indicador de Status do Backend
- **BackendStatus.tsx**: Componente que monitora se o backend está online
- Aviso visual quando backend está offline
- Verificação automática a cada 30 segundos

### 4. Carregamento Híbrido
- **StoriesBar.tsx**: Tenta carregar do backend primeiro, depois dos stories locais
- Limpeza automática de stories expirados

## Como Testar

### Cenário 1: Backend Online
1. Inicie o backend: `cd backend && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
2. Crie um story com imagem
3. Deve aparecer normalmente

### Cenário 2: Backend Offline (atual)
1. Crie um story com imagem
2. Deve aparecer indicador vermelho "Backend offline"
3. Story é salvo localmente e aparece com a imagem
4. Stories antigos do servidor aparecem com ícone de câmera e mensagem de fallback

## Arquivos Modificados
- `src/components/stories/StoryViewer.tsx` - Fallback para imagens quebradas
- `src/components/stories/StoriesBar.tsx` - Preview e carregamento híbrido  
- `src/components/stories/StoryUploadHelper.tsx` - Sistema local de backup
- `src/components/common/BackendStatus.tsx` - Novo componente de status
- `src/components/Layout.tsx` - Integração do status do backend

## Resultado
- ✅ Stories agora aparecem mesmo com backend offline
- ✅ Imagens em base64 funcionam normalmente
- ✅ Fallback visual para imagens quebradas
- ✅ Indicador claro de status do sistema
- ✅ Experiência do usuário preservada
