# 📁 CONFIGURAÇÃO DOS ARQUIVOS .ENV

## 🚨 IMPORTANTE
Os arquivos `.env.py` são apenas para download/backup. Para usar no projeto, você precisa renomeá-los para `.env`.

## 📋 ARQUIVOS DE CONFIGURAÇÃO

### 1. `backend/.env.py` → `backend/.env`
Configurações principais do backend:
- Banco de dados MySQL
- JWT e autenticação  
- CORS
- Configurações de email

### 2. `backend/email-service/.env.py` → `backend/email-service/.env`
Configurações específicas do serviço de email:
- Credenciais SMTP
- Configurações de cooldown
- Porta do serviço

### 3. `backend/email-service/.env.example.py` → `backend/email-service/.env.example`
Arquivo de exemplo seguro (sem credenciais reais)

## 🔧 COMO USAR

### 1. Após baixar o projeto:
```bash
# Ir para o backend
cd backend

# Renomear o arquivo
mv .env.py .env

# Ir para o email-service
cd email-service

# Renomear o arquivo
mv .env.py .env
```

### 2. Ou copiar do exemplo:
```bash
cd backend/email-service
cp .env.example.py .env.example
cp .env.example .env
# Depois edite o .env com suas credenciais
```

### 3. Editar com suas credenciais:
```bash
# Editar backend/.env
nano backend/.env

# Editar email-service/.env  
nano backend/email-service/.env
```

## 🔒 SEGURANÇA

- ✅ Arquivos `.env.py` podem ser commitados (para backup/download)
- ❌ Arquivos `.env` NUNCA devem ser commitados
- 🔐 Sempre use credenciais reais apenas nos arquivos `.env`
- 📝 Use `.env.example` para compartilhar estrutura sem credenciais

## ⚠️ ATENÇÃO

**Sempre verifique se você está usando o arquivo correto:**
- `**arquivo.env.py**` = Para download/backup
- `**arquivo.env**` = Para executar o projeto

O projeto SÓ funciona com arquivos `.env` (sem .py no final)!
