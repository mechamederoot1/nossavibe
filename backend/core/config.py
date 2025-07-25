"""
Configurações centralizadas da aplicação
"""
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Configurações JWT
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configurações do banco de dados
def get_database_url():
    """Create database URL from environment variables"""
    # Try URL-encoded version first
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    # Build URL from individual components (safer for special characters)
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "3306")
    db_user = os.getenv("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD", "Evo@000#!")
    db_name = os.getenv("DB_NAME", "vibe")

    # URL encode the password to handle special characters
    from urllib.parse import quote_plus
    encoded_password = quote_plus(db_password)

    return f"mysql+pymysql://{db_user}:{encoded_password}@{db_host}:{db_port}/{db_name}"

# CORS settings
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
]

# Upload settings
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE_MB = 50  # 50MB max for files
MAX_AVATAR_SIZE_MB = 5  # 5MB max for avatars
MAX_COVER_SIZE_MB = 10  # 10MB max for cover photos
