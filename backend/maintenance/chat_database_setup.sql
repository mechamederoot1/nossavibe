-- Script SQL para configurar o sistema de chat
-- Execute este script no seu banco de dados MySQL

-- Verificar se a tabela messages existe e criar se necessário
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text',
    media_url VARCHAR(500),
    media_metadata TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Chaves estrangeiras
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Adicionar colunas na tabela users para status online (se não existirem)
-- Use estas queries uma por vez para evitar erros se as colunas já existirem

-- Verificar se a coluna last_seen existe
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'last_seen' AND TABLE_SCHEMA = DATABASE();

-- Se não existir, adicionar:
-- ALTER TABLE users ADD COLUMN last_seen DATETIME;

-- Verificar se a coluna is_online existe
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'is_online' AND TABLE_SCHEMA = DATABASE();

-- Se não existir, adicionar:
-- ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT FALSE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, is_read);

-- Verificar estrutura da tabela
DESCRIBE messages;
DESCRIBE users;

-- Testar inserção de uma mensagem (exemplo)
-- INSERT INTO messages (sender_id, recipient_id, content, message_type) 
-- VALUES (1, 2, 'Mensagem de teste do sistema de chat', 'text');

-- Verificar se a inserção funcionou
-- SELECT * FROM messages WHERE content = 'Mensagem de teste do sistema de chat';

-- Limpeza (remover mensagem de teste)
-- DELETE FROM messages WHERE content = 'Mensagem de teste do sistema de chat';

SHOW TABLES;
SELECT COUNT(*) as total_messages FROM messages;
SELECT COUNT(*) as total_users FROM users;
