-- CORREÇÃO EMERGENCIAL DO COOLDOWN - VIBE
-- Execute estas queries no MySQL para resolver o problema AGORA

USE vibe;

-- 1. Ver registros problemáticos
SELECT user_id, email, created_at, verified 
FROM email_verifications 
ORDER BY created_at DESC LIMIT 10;

-- 2. LIMPAR TODOS os registros de verificação (isso resolve o cooldown)
DELETE FROM email_verifications;

-- 3. Verificar se limpou
SELECT COUNT(*) as registros_restantes FROM email_verifications;

-- 4. Adicionar colunas necessárias se não existirem
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status ENUM('pending', 'active', 'suspended', 'banned') DEFAULT 'pending';

-- 5. Atualizar status das contas existentes
UPDATE users SET account_status = 'pending' WHERE is_verified = FALSE;
UPDATE users SET account_status = 'active' WHERE is_verified = TRUE;

-- 6. Verificar resultado
SELECT account_status, is_verified, COUNT(*) as count 
FROM users 
GROUP BY account_status, is_verified;

SELECT 'CORREÇÃO CONCLUÍDA - Agora teste criar nova conta!' as resultado;
