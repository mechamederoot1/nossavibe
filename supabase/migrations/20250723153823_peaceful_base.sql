-- Script SQL para corrigir permissões do MySQL
-- Execute este script como administrador do MySQL

-- 1. Verificar usuários existentes
SELECT User, Host FROM mysql.user WHERE User = 'root';

-- 2. Atualizar senha do root (se necessário)
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Evo@000#!';

-- 3. Criar usuário específico para a aplicação (opcional)
CREATE USER IF NOT EXISTS 'vibe_user'@'localhost' IDENTIFIED BY 'Evo@000#!';

-- 4. Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS vibe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. Conceder permissões ao usuário
GRANT ALL PRIVILEGES ON vibe.* TO 'vibe_user'@'localhost';
GRANT ALL PRIVILEGES ON vibe.* TO 'root'@'localhost';

-- 6. Aplicar mudanças
FLUSH PRIVILEGES;

-- 7. Verificar permissões
SHOW GRANTS FOR 'root'@'localhost';

-- 8. Verificar se o banco foi criado
SHOW DATABASES LIKE 'vibe';