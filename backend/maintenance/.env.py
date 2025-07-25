# Configurações do banco de dados MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Dashwoodi@1995
DB_NAME=vibe

# JWT Configuration
SECRET_KEY=your-secret-key-here-change-in-production-vibe-2024
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Email Service Configuration
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=suporte@meuvibe.com
SMTP_PASS=Dashwoodi@1995
SMTP_FROM=no-reply@meuvibe.com

# Configurações de verificação de e-mail (SEM "ms" no final!)
VERIFICATION_CODE_EXPIRY=300000
RESEND_COOLDOWN=60000
MAX_RESEND_ATTEMPTS=5
