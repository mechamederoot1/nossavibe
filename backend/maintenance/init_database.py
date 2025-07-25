#!/usr/bin/env python3
"""
Script para inicializar o banco de dados MySQL com as tabelas necessárias
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from core.database import Base
from core.config import get_database_url
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

def init_database():
    """Inicializa o banco de dados com as tabelas necessárias"""
    try:
        print("🔍 Inicializando banco de dados...")
        
        # Conectar ao MySQL (sem especificar banco)
        db_host = os.getenv("DB_HOST", "127.0.0.1")
        db_port = os.getenv("DB_PORT", "3306")
        db_user = os.getenv("DB_USER", "root")
        db_password = os.getenv("DB_PASSWORD", "Evo@000#!")
        db_name = os.getenv("DB_NAME", "vibe")
        
        # URL encode da senha para caracteres especiais
        from urllib.parse import quote_plus
        encoded_password = quote_plus(db_password)
        
        # Conectar sem especificar banco primeiro
        root_url = f"mysql+pymysql://{db_user}:{encoded_password}@{db_host}:{db_port}/"
        root_engine = create_engine(root_url)
        
        # Criar banco se não existir
        with root_engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name}"))
            print(f"✅ Banco de dados '{db_name}' criado/verificado!")
        
        root_engine.dispose()
        
        # Agora conectar ao banco específico
        database_url = get_database_url()
        engine = create_engine(database_url)
        
        # Criar todas as tabelas
        Base.metadata.create_all(bind=engine)
        print("✅ Todas as tabelas foram criadas com sucesso!")

        # Criar tabela de verificação de e-mail se não existir
        with engine.connect() as conn:
            conn.execute(text("""
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
            """))

            # Verificar se a coluna is_verified existe
            result = conn.execute(text("""
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = 'vibe'
                AND TABLE_NAME = 'users'
                AND COLUMN_NAME = 'is_verified'
            """))

            if not result.fetchone():
                conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE"))
                print("✅ Coluna is_verified adicionada à tabela users!")

            conn.commit()
            print("✅ Tabelas de verificação de e-mail configuradas!")
        
        # Verificar tabelas criadas
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]
            print(f"📋 Tabelas criadas: {', '.join(tables)}")
        
        engine.dispose()
        print("🎉 Inicialização do banco de dados concluída!")
        
    except Exception as e:
        print(f"❌ Erro na inicialização: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = init_database()
    if not success:
        exit(1)
