-- CONFIGURAÇÃO RÁPIDA DO SISTEMA DE CHAT
-- Execute estas queries uma por uma no MySQL Workbench

-- 1. Criar tabela messages (se não existir)
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Adicionar chaves estrangeiras (se a tabela foi criada agora)
-- Apenas execute se a tabela messages foi criada agora
-- ALTER TABLE messages ADD FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
-- ALTER TABLE messages ADD FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. Verificar se as colunas de chat existem na tabela users
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
AND COLUMN_NAME IN ('last_seen', 'is_online')
AND TABLE_SCHEMA = DATABASE();

-- 4. Adicionar colunas se não existirem (execute apenas se necessário)
-- Verifique o resultado da query anterior primeiro
-- Se last_seen não existir:
-- ALTER TABLE users ADD COLUMN last_seen DATETIME;

-- Se is_online não existir:
-- ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT FALSE;

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, is_read);

-- 6. Verificar resultado
DESCRIBE messages;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_messages FROM messages;

-- ✅ PRONTO! Seu sistema de chat está configurado
