# 🔧 CONFIGURAÇÃO DOS ARQUIVOS .ENV - VIBE

## 📥 DEPOIS DE BAIXAR O PROJETO

Os arquivos de configuração estão como `.env.py` para você conseguir baixar. Para usar o projeto, você precisa renomeá-los:

### 1️⃣ BACKEND PRINCIPAL
```bash
cd backend
mv .env.py .env
```

### 2️⃣ SERVIÇO DE EMAIL  
```bash
cd backend/email-service
mv .env.py .env
```

### 3️⃣ VERIFICAR SE FUNCIONOU
```bash
# Deve existir:
ls backend/.env
ls backend/email-service/.env
```

## 🚀 EXECUTAR O PROJETO

```bash
# 1. Backend principal
cd backend
python3 main.py

# 2. Serviço de email (nova aba do terminal)
cd backend/email-service
npm run dev

# 3. Frontend (nova aba do terminal)
npm run dev
```

## ⚠️ IMPORTANTE

- ✅ `.env.py` = Arquivo para download
- ✅ `.env` = Arquivo que o projeto usa
- ❌ O projeto NÃO funciona com `.env.py`
- ❌ Sempre renomeie para `.env` antes de executar

## 🔒 SUAS CREDENCIAIS JÁ ESTÃO CONFIGURADAS

Os arquivos `.env.py` já contêm suas credenciais:
- ✅ Banco de dados: `root` / `Dashwoodi@1995`
- ✅ Email SMTP: `suporte@meuvibe.com`
- ✅ Configurações corretas de cooldown

Só renomear e usar! 🎉
