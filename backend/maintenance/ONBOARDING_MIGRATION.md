# Migração do Campo Onboarding

## Objetivo
Adicionar o campo `onboarding_completed` à tabela `users` para controlar quando o modal de boas-vindas deve aparecer.

## Como Executar

### 1. Via Python (Recomendado)
```bash
cd backend/maintenance
python3 add_onboarding_field.py
```

### 2. Via Script Bash
```bash
cd backend/maintenance
bash run_onboarding_migration.sh
```

### 3. Executar SQL Manualmente
Se preferir executar o SQL diretamente no MySQL:

```sql
-- Verificar se a coluna já existe
SELECT COUNT(*) as count 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME = 'onboarding_completed';

-- Adicionar a coluna (se não existir)
ALTER TABLE users 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE 
COMMENT 'Indica se o usuário completou o tutorial de boas-vindas';

-- Marcar usuários existentes como tendo completado
UPDATE users 
SET onboarding_completed = TRUE 
WHERE created_at < NOW() - INTERVAL 1 DAY;
```

## O que a Migração Faz

1. **Adiciona o campo `onboarding_completed`**:
   - Tipo: `BOOLEAN`
   - Padrão: `FALSE`
   - Comentário explicativo

2. **Marca usuários existentes como completos**:
   - Usuários criados há mais de 1 dia são marcados como `onboarding_completed = TRUE`
   - Isso evita que usuários antigos vejam o modal

3. **Novos usuários**:
   - Começam com `onboarding_completed = FALSE`
   - Veem o modal de boas-vindas na primeira vez

## Verificação da Migração

Após executar, você pode verificar se funcionou:

```sql
-- Ver estrutura da tabela
DESCRIBE users;

-- Ver estatísticas
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN onboarding_completed = TRUE THEN 1 ELSE 0 END) as completed_onboarding,
    SUM(CASE WHEN onboarding_completed = FALSE THEN 1 ELSE 0 END) as pending_onboarding
FROM users;
```

## Endpoints Relacionados

Após a migração, os seguintes endpoints estarão disponíveis:

- **GET /auth/me**: Retorna informações do usuário incluindo `onboarding_completed`
- **POST /auth/complete-onboarding**: Marca o onboarding como completo

## Comportamento da Aplicação

1. **Usuário novo**: `onboarding_completed = FALSE` → Modal aparece
2. **Usuário completa tutorial**: Chama API → `onboarding_completed = TRUE`
3. **Próximos logins**: Modal não aparece mais

## Rollback (se necessário)

Para reverter a migração:

```sql
ALTER TABLE users DROP COLUMN onboarding_completed;
```

⚠️ **Cuidado**: Isso removerá permanentemente os dados do campo.
