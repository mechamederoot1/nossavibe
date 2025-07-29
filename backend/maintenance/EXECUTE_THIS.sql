-- ====================================================
-- CONFIGURAÇÃO MANUAL DO SISTEMA DE CHAT
-- Execute estes comandos NO MYSQL WORKBENCH
-- ====================================================

-- 1. VERIFICAR SE A TABELA MESSAGES JÁ EXISTE
SELECT COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'messages';

-- 2. CRIAR TABELA MESSAGES (apenas se não existir)
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
);

-- 3. VERIFICAR COLUNAS EXISTENTES NA TABELA USERS
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
AND TABLE_SCHEMA = DATABASE()
AND COLUMN_NAME IN ('last_seen', 'is_online');

-- 4. ADICIONAR COLUNAS PARA STATUS ONLINE (execute apenas se não existirem)
-- Descomente e execute apenas se as colunas não existirem:

-- ALTER TABLE users ADD COLUMN last_seen DATETIME;
-- ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT FALSE;

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 6. VERIFICAR SE DEU CERTO
DESCRIBE messages;
DESCRIBE users;

-- 7. CONTAR REGISTROS
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM messages) as total_messages;

-- ====================================================
-- ✅ PRONTO! SISTEMA DE CHAT CONFIGURADO
-- ====================================================
