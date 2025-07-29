# Guia de Configuração do Sistema de Chat

## 🚀 Configuração Rápida

### Opção 1: Script Python Simplificado
```bash
cd backend/maintenance
python simple_chat_setup.py
```

### Opção 2: Script Python Completo
```bash
cd backend/maintenance  
python setup_chat_database.py
```

### Opção 3: SQL Manual
Execute o arquivo `chat_database_setup.sql` no seu MySQL Workbench ou cliente de sua preferência.

## 🔧 Verificação Manual

### 1. Verificar se as tabelas existem:
```sql
SHOW TABLES LIKE 'messages';
SHOW TABLES LIKE 'users';
```

### 2. Verificar estrutura da tabela messages:
```sql
DESCRIBE messages;
```

### 3. Verificar se as colunas de chat existem em users:
```sql
DESCRIBE users;
```

### 4. Adicionar colunas se necessário:
```sql
-- Apenas se as colunas não existirem
ALTER TABLE users ADD COLUMN last_seen DATETIME;
ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT FALSE;
```

## 📋 Estrutura Esperada

### Tabela `messages`:
- `id` (PRIMARY KEY)
- `sender_id` (FK para users.id)
- `recipient_id` (FK para users.id)  
- `content` (TEXT)
- `message_type` (VARCHAR - 'text', 'image', 'video', etc.)
- `media_url` (VARCHAR)
- `media_metadata` (TEXT)
- `is_read` (BOOLEAN)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### Tabela `users` (colunas adicionais):
- `last_seen` (DATETIME)
- `is_online` (BOOLEAN)

## 🧪 Teste Rápido

### 1. Teste de inserção:
```sql
INSERT INTO messages (sender_id, recipient_id, content, message_type) 
VALUES (1, 2, 'Teste do sistema de chat', 'text');
```

### 2. Teste de consulta:
```sql
SELECT * FROM messages WHERE content = 'Teste do sistema de chat';
```

### 3. Limpeza:
```sql
DELETE FROM messages WHERE content = 'Teste do sistema de chat';
```

## ✅ Verificação de Funcionalidades

Após a configuração, verifique se:

1. ✅ **Backend**: As rotas `/messages/*` estão funcionando
2. ✅ **Frontend**: Os componentes de chat carregam sem erro
3. ✅ **WebSocket**: Conexão estabelecida em `ws://localhost:8000/ws/{user_id}`
4. ✅ **UI**: Sidebar de amigos online aparece
5. ✅ **Comentários**: Aparecem inline nos posts

## 🐛 Resolução de Problemas

### Erro "ImportError: cannot import name 'DATABASE_URL'"
✅ **Resolvido**: Use `simple_chat_setup.py` ao invés do script original

### Erro "Table 'messages' doesn't exist"
```sql
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text',
    media_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
);
```

### Erro "Column 'last_seen' doesn't exist"
```sql
ALTER TABLE users ADD COLUMN last_seen DATETIME;
ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT FALSE;
```

## 🎯 Próximos Passos

1. Execute um dos scripts de configuração
2. Reinicie o servidor backend
3. Teste as funcionalidades no frontend
4. Verifique os logs do WebSocket

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do backend
2. Confirme se o MySQL está rodando
3. Teste a conexão com o banco
4. Execute o script de teste: `python test_chat_system.py`
