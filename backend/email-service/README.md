# 📧 Microserviço de E-mail - Vibe

Este é o microserviço responsável pelo envio de e-mails de verificação e recuperação de senha da plataforma Vibe.

## 🚀 Configuração Rápida

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar ambiente
```bash
npm run fix-db
```

### 3. Configurar SMTP
Edite o arquivo `.env` com suas credenciais SMTP:

```env
SMTP_HOST=seu-servidor-smtp.com
SMTP_PORT=587
SMTP_USER=seu-email@dominio.com
SMTP_PASS=sua-senha-smtp
SMTP_FROM=noreply@seudominio.com
```

### 4. Iniciar serviço
```bash
npm start
```

## 🔧 Configuração Detalhada

### Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SMTP_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Porta SMTP | `587` |
| `SMTP_USER` | Usuário SMTP | `seu@email.com` |
| `SMTP_PASS` | Senha SMTP | `sua-senha` |
| `SMTP_FROM` | E-mail remetente | `noreply@vibe.com` |
| `DB_HOST` | Host do MySQL | `127.0.0.1` |
| `DB_PORT` | Porta do MySQL | `3306` |
| `DB_USER` | Usuário MySQL | `root` |
| `DB_PASSWORD` | Senha MySQL | `sua-senha` |
| `DB_NAME` | Nome do banco | `vibe` |

### Configurações SMTP Populares

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@gmail.com
SMTP_PASS=sua-senha-de-app
```

#### Hostinger
```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=seu@dominio.com
SMTP_PASS=sua-senha
```

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seu@outlook.com
SMTP_PASS=sua-senha
```

## 🧪 Testes

### Testar conexão com banco
```bash
npm run test-db
```

### Criar/verificar tabelas
```bash
npm run create-tables
```

### Configuração completa (recomendado)
```bash
npm run fix-db
```

### Testar o serviço
```bash
npm test
```

### Testar health check
```bash
curl http://localhost:3001/health
```

### Testar envio de e-mail
```bash
curl -X POST http://localhost:3001/test-email
```

## 📡 Endpoints

### GET /health
Verifica se o serviço está funcionando.

### POST /test-email
Envia um e-mail de teste.

### POST /send-verification
Envia e-mail de verificação de conta.

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "firstName": "Nome",
  "userId": 123
}
```

### POST /verify-code
Verifica código de 6 dígitos.

**Body:**
```json
{
  "userId": 123,
  "code": "123456"
}
```

### POST /send-password-recovery
Envia e-mail de recuperação de senha.

**Body:**
```json
{
  "email": "usuario@exemplo.com"
}
```

## 🔒 Segurança

- Códigos de verificação expiram em 5 minutos
- Rate limiting: máximo 5 tentativas por hora
- Cooldown de 1 minuto entre envios
- Logs de todas as tentativas

## 🐛 Solução de Problemas

### Erro: "Variáveis de ambiente faltando"
1. Execute `npm run fix-db`
2. Configure o arquivo `.env`
3. Reinicie o serviço

### Erro: "Access denied for user 'root'"
1. Execute o script SQL: `fix-mysql-permissions.sql`
2. Ou altere a senha: `mysqladmin -u root password "Evo@000#!"`
3. Verifique se o MySQL está rodando
4. Execute: `npm run test-db`

### Erro: "EAUTH - Invalid login"
1. Verifique suas credenciais SMTP
2. Para Gmail, use senha de app
3. Verifique se 2FA está habilitado

### Erro: "Connection refused"
1. Verifique se o servidor SMTP está correto
2. Teste a conectividade de rede
3. Verifique firewall/proxy

### Erro: "Table doesn't exist"
1. Execute: `npm run create-tables`
2. Verifique se o banco 'vibe' existe
3. Execute: `npm run fix-db` para configuração completa
## 📝 Logs

O serviço gera logs detalhados:
- ✅ Sucessos em verde
- ❌ Erros em vermelho
- ⚠️ Avisos em amarelo
- 📧 E-mails enviados
- 🔒 Tentativas de verificação

## 🔄 Integração

Este serviço é usado pelo backend principal (`http://localhost:8000`) para:
- Verificação de e-mail no registro
- Recuperação de senha
- Notificações por e-mail

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do serviço
2. Execute os testes: `npm test`
3. Consulte a documentação da API