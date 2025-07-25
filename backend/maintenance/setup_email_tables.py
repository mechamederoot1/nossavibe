#!/usr/bin/env python3
"""
Script para configurar as tabelas necessárias para o microserviço de e-mail
"""
import os
import pymysql
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

def setup_email_tables():
    """Configura as tabelas necessárias para verificação de e-mail"""
    try:
        print("🔗 Conectando ao banco de dados...")
        
        # Conectar ao MySQL
        connection = pymysql.connect(
            host=os.getenv('DB_HOST', '127.0.0.1'),
            port=int(os.getenv('DB_PORT', 3306)),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', 'Evo@000#!'),
            database=os.getenv('DB_NAME', 'vibe'),
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        print("📋 Criando tabelas necessárias para o microserviço de e-mail...")

        # Tabela de verificações de e-mail
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS email_verifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                email VARCHAR(255) NOT NULL,
                verification_code VARCHAR(6) NOT NULL,
                verification_token VARCHAR(64) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                verified BOOLEAN DEFAULT FALSE,
                verified_at DATETIME NULL,
                attempts INT DEFAULT 1,
                INDEX idx_user_id (user_id),
                INDEX idx_token (verification_token),
                INDEX idx_code (verification_code)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)

        # Tabela de recuperação de senha
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS password_recovery (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                email VARCHAR(255) NOT NULL,
                recovery_code VARCHAR(6) NOT NULL,
                recovery_token VARCHAR(64) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                used BOOLEAN DEFAULT FALSE,
                used_at DATETIME NULL,
                INDEX idx_user_id (user_id),
                INDEX idx_token (recovery_token),
                INDEX idx_code (recovery_code)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)

        # Tabela de logs de recuperação de senha
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS password_recovery_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT DEFAULT 0,
                email VARCHAR(255) NOT NULL,
                action_type VARCHAR(50) NOT NULL,
                recovery_id INT NULL,
                success BOOLEAN NOT NULL,
                error_message TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_email (email),
                INDEX idx_action (action_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)

        print("✅ Tabelas criadas com sucesso!")

        # Verificar se a coluna is_verified existe na tabela users
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'is_verified'
        """, (os.getenv('DB_NAME', 'vibe'),))

        if not cursor.fetchone():
            print("➕ Adicionando coluna is_verified à tabela users...")
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN is_verified BOOLEAN DEFAULT FALSE
            """)
            print("✅ Coluna is_verified adicionada!")
        else:
            print("✅ Coluna is_verified já existe")

        # Commit das mudanças
        connection.commit()
        print("🎉 Configuração do banco de dados concluída!")

    except Exception as e:
        print(f"❌ Erro ao configurar banco de dados: {e}")
        return False
    finally:
        if 'connection' in locals():
            connection.close()
    
    return True

def create_email_service_env():
    """Cria arquivo .env para o microserviço de e-mail"""
    env_content = f"""# Configurações do banco de dados MySQL
DB_HOST={os.getenv('DB_HOST', '127.0.0.1')}
DB_PORT={os.getenv('DB_PORT', '3306')}
DB_USER={os.getenv('DB_USER', 'root')}
DB_PASSWORD={os.getenv('DB_PASSWORD', 'Evo@000#!')}
DB_NAME={os.getenv('DB_NAME', 'vibe')}

# Configurações SMTP (Gmail exemplo - configure com suas credenciais)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@vibe.com

# Configurações de verificação
VERIFICATION_CODE_EXPIRY=300000
RESEND_COOLDOWN=60000
MAX_RESEND_ATTEMPTS=5

# Porta do serviço
PORT=3001
"""
    
    try:
        email_service_env = "backend/email-service/.env"
        with open(email_service_env, 'w') as f:
            f.write(env_content)
        print(f"✅ Arquivo {email_service_env} criado!")
        return True
    except Exception as e:
        print(f"❌ Erro ao criar arquivo .env: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Configurando sistema de verificação de e-mail...")
    
    # Configurar tabelas
    if setup_email_tables():
        print("✅ Tabelas configuradas com sucesso!")
    else:
        print("❌ Erro na configuração das tabelas")
        exit(1)
    
    # Criar arquivo .env para o microserviço
    if create_email_service_env():
        print("✅ Configuração do microserviço criada!")
    else:
        print("❌ Erro na configuração do microserviço")
        exit(1)
    
    print("\n🎉 Sistema de verificação de e-mail configurado!")
    print("\n📝 Próximos passos:")
    print("1. Configure suas credenciais SMTP no arquivo backend/email-service/.env")
    print("2. Execute 'cd backend/email-service && npm install && npm start' para iniciar o microserviço")
    print("3. Agora o registro redirecionará para a página de verificação de e-mail!")
