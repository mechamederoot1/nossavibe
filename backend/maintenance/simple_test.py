import os
from dotenv import load_dotenv

# Carregar .env
load_dotenv()

# Mostrar credenciais
print("DB_HOST:", os.getenv("DB_HOST"))
print("DB_USER:", os.getenv("DB_USER"))
print("DB_NAME:", os.getenv("DB_NAME"))
print("DB_PASSWORD length:", len(os.getenv("DB_PASSWORD", "")))
