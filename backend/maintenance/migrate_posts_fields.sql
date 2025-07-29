-- Script SQL para adicionar campos necessários para edição e arquivamento de posts
-- Execute este script no seu banco de dados MySQL

-- Verificar se a coluna is_archived já existe antes de adicionar
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'is_archived';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE posts ADD COLUMN is_archived BOOLEAN DEFAULT FALSE NOT NULL', 
  'SELECT "Campo is_archived já existe" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar se a coluna updated_at já existe antes de adicionar
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'updated_at';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE posts ADD COLUMN updated_at DATETIME DEFAULT NULL', 
  'SELECT "Campo updated_at já existe" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Confirmar que os campos foram adicionados
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME IN ('is_archived', 'updated_at');
