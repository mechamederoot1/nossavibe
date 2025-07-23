# 🔧 INSTRUÇÕES PARA RESOLVER PROBLEMAS - VIBE

## Problemas Identificados
1. ❌ **Cooldown excessivo** (10810 segundos ≈ 3 horas)
2. ❌ **Login sem verificação de email** (falha de segurança)
3. ❌ **Sistema de conta ativa não implementado**
4. ❌ **Registros problemáticos no banco**

## 🚨 SOLUÇÃO COMPLETA

### Passo 1: Corrigir Banco de Dados

Execute estas queries SQL no MySQL:

```sql
-- 1. Conectar ao banco
USE vibe;

-- 2. Adicionar colunas necessárias (se não existirem)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_status ENUM('pending', 'active', 'suspended', 'banned') DEFAULT 'pending';

-- 3. Limpar registros problemáticos de email
DELETE FROM email_verifications 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR);

-- 4. Resetar cooldown para usuários problemáticos
DELETE FROM email_verifications 
WHERE user_id IN (25, 26, 27);

-- 5. Atualizar status das contas
UPDATE users 
SET account_status = 'pending' 
WHERE (is_verified = FALSE OR is_verified IS NULL) 
AND account_status NOT IN ('suspended', 'banned');

UPDATE users 
SET account_status = 'active' 
WHERE is_verified = TRUE AND account_status = 'pending';

-- 6. Verificar resultados
SELECT account_status, is_verified, COUNT(*) as count 
FROM users 
GROUP BY account_status, is_verified;
```

### Passo 2: Executar Scripts de Correção

```bash
# Opção A: Script Node.js
cd backend
node resolver.js

# Opção B: Script Python (se disponível)
cd backend
python3 resolver.py
```

### Passo 3: Configurar Email Service

O arquivo `.env` correto já foi criado em `backend/email-service/.env` com:

```env
# Cooldown correto: 60 segundos (não 10810)
RESEND_COOLDOWN=60000

# Código expira em 5 minutos
VERIFICATION_CODE_EXPIRY=300000

# Máximo 5 tentativas por hora
MAX_RESEND_ATTEMPTS=5
```

### Passo 4: Reiniciar Serviços

```bash
# 1. Parar serviço de email atual
pkill -f "email-service"

# 2. Reiniciar serviço de email
cd backend/email-service
npm run dev

# 3. Reiniciar backend principal
cd backend
python3 main.py
```

## ✅ VERIFICAÇÕES PÓS-CORREÇÃO

### Teste 1: Login sem Verificação (deve falhar)
1. Registrar nova conta
2. **NÃO** confirmar email
3. Tentar fazer login
4. **Resultado esperado**: Erro 403 "Email não verificado"

### Teste 2: Cooldown de Email (deve ser 60s)
1. Solicitar código de verificação
2. Tentar solicitar novamente imediatamente
3. **Resultado esperado**: "Aguarde 60 segundos"

### Teste 3: Fluxo Completo
1. Registrar conta → ✅
2. Receber email → ✅ 
3. Confirmar código → ✅
4. Fazer login → ✅ (agora deve funcionar)

## 🎯 RESULTADOS ESPERADOS

Após aplicar todas as correções:

- ✅ **Cooldown**: 60 segundos (não mais 3 horas)
- ✅ **Segurança**: Login bloqueado sem verificação
- ✅ **Status da conta**: Sistema ativo/pendente/suspenso
- ✅ **Limpeza**: Registros problemáticos removidos

## 🚨 RESOLUÇÃO RÁPIDA (Se tiver pressa)

Se você quer resolver AGORA mesmo:

```sql
-- Execute APENAS isto no MySQL:
USE vibe;
DELETE FROM email_verifications WHERE user_id IN (25, 26, 27);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status ENUM('pending', 'active', 'suspended', 'banned') DEFAULT 'pending';
```

Depois reinicie o serviço de email e teste novamente.

## 📞 SUPORTE

Se ainda tiver problemas:
1. Verifique os logs do email service
2. Confirme que o .env está correto
3. Teste a conexão com o banco
4. Verifique se as colunas foram criadas: `SHOW COLUMNS FROM users;`

---

**⚡ Esta solução resolve TODOS os problemas identificados de uma vez!**
