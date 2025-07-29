# Sistema de Stories - Vibe Social Network

## Como Funciona (Sistema Correto)

### 1. **Banco de Dados** 
As imagens dos stories são salvas corretamente no sistema:

#### Modelo no Banco (PostgreSQL/MySQL):
- **Tabela `stories`**: Metadados do story (ID, autor, tipo, URL da mídia, etc.)
- **Campo `media_url`**: Caminho para o arquivo físico (ex: `/uploads/stories/story_uuid.jpg`)
- **Arquivos Físicos**: Salvos na pasta `backend/uploads/stories/`

#### Exemplo no banco:
```sql
stories table:
| id | author_id | media_type | media_url                           | content  |
|----|-----------|------------|-------------------------------------|----------|
| 1  | 42        | image      | /uploads/stories/story_abc123.jpg   | "Férias" |
```

### 2. **Fluxo de Upload**
1. **Frontend**: Envia FormData com arquivo via `StoryUploadHelper.tsx`
2. **Backend**: Recebe em `/stories/` (POST)
3. **Salvamento**: 
   - Arquivo físico → `backend/uploads/stories/`
   - Metadados → Tabela `stories` no banco
4. **Resposta**: Retorna dados do story com URL correta

### 3. **Fluxo de Visualização**
1. **Frontend**: Busca stories via `/stories/` (GET) 
2. **Backend**: Retorna lista com `media_url` para cada story
3. **Exibição**: Frontend acessa `http://localhost:8000/uploads/stories/arquivo.jpg`
4. **Servidor Estático**: FastAPI serve arquivos da pasta `uploads`

## Problema Atual

### ❌ **Backend Offline**
O servidor Python não está rodando, então:
- Stories não são salvos no banco
- Imagens não são acessíveis
- Frontend mostra erro 404 nas imagens

## Solução

### ✅ **Iniciar o Backend**

#### Opção 1: Script Automático
```bash
python3 start-backend.py
```

#### Opção 2: Manual
```bash
cd backend
python3 init_database.py  # Inicializar DB
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Opção 3: Docker (se disponível)
```bash
docker-compose up backend
```

## Verificação

### ✅ **Backend Online**
- ✅ `curl http://localhost:8000/health` retorna HTTP 200
- ✅ Stories aparecem com imagens normalmente
- �� Indicador verde no frontend

### ❌ **Backend Offline** 
- ❌ `curl http://localhost:8000/health` falha
- ❌ Stories aparecem com ícone de fallback
- ❌ Indicador vermelho no frontend

## Arquitetura Correta

```
Frontend (React)           Backend (FastAPI)         Database
┌─────────────────┐       ┌──────────────────┐      ┌─────────────┐
│ StoryUpload     │────→  │ POST /stories/   │────→ │ stories     │
│ FormData + File │       │ - Save file      │      │ table       │
└─────────────────┘       │ - Save metadata  │      └─────────────┘
                          └──────────────────┘
┌─────────────────┐       ┌──────────────────┐      ┌─────────────┐
│ StoryViewer     │←───── │ GET /stories/    │←──── │ stories     │
│ Display images  │       │ Static files     │      │ + files     │
└─────────────────┘       └────────────���─────┘      └─────────────┘
```

## Correções Feitas

1. **URLs Configuráveis**: Usado `API_BASE_URL` em vez de hardcode
2. **Fallback Visual**: Ícone quando imagem não carrega  
3. **Status Indicator**: Mostra se backend está online/offline
4. **Error Handling**: Tratamento adequado de erros de conectividade

## Próximos Passos

1. **Iniciar o backend** usando um dos métodos acima
2. **Testar criação de story** com imagem
3. **Verificar se aparecem** corretamente
4. **Configurar ambiente** para desenvolvimento contínuo
