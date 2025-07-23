"""
Aplicação principal FastAPI - Vibe Social Network
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from core.config import ALLOWED_ORIGINS
from core.database import engine, Base
from routes import auth_router, posts_router, users_router, email_verification_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Iniciando Vibe Social Network API...")

    # Auto-fix database issues on startup
    try:
        from maintenance.auto_fix_reactions import auto_fix_reactions_table
        auto_fix_reactions_table()
    except Exception as e:
        # Silenciar aviso se arquivo não existir
        if "No module named" not in str(e):
            print(f"⚠️ Could not auto-fix reactions table: {e}")

    # Criar tabelas se não existirem
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas do banco verificadas/criadas!")
    except Exception as e:
        print(f"⚠️ Erro ao criar tabelas: {e}")

    print("🌟 API pronta para uso!")

    yield

    # Shutdown
    print("🛑 Encerrando API...")

# Criar instância da aplicação FastAPI
app = FastAPI(
    title="Vibe Social Network API",
    version="2.0.0",
    description="API modular para rede social",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar diretórios de upload se não existirem
os.makedirs("uploads/stories", exist_ok=True)
os.makedirs("uploads/posts", exist_ok=True)
os.makedirs("uploads/profiles", exist_ok=True)
os.makedirs("uploads/image", exist_ok=True)

# Servir arquivos estáticos para uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Incluir rotas
app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(users_router)
app.include_router(email_verification_router)

@app.get("/")
async def root():
    """Endpoint raiz da API"""
    return {
        "message": "Vibe Social Network API",
        "version": "2.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
