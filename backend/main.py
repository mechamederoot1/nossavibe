"""
Aplicação principal FastAPI - Vibe Social Network
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from core.config import ALLOWED_ORIGINS
from core.database import engine, Base
from core.security_middleware import security_middleware
from core.performance_middleware import performance_middleware, start_cache_cleanup
from core.websockets import manager
from routes import auth_router, posts_router, users_router, email_verification_router, stories_router, upload_router
from routes.friendships import router as friendships_router
from routes.follows import router as follows_router
from routes.reports import router as reports_router
from routes.notifications import router as notifications_router
from utils.auth import verify_websocket_token

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

    # Iniciar tarefas de background
    print("🔧 Starting security and performance services...")
    start_cache_cleanup()

    print("🌟 API pronta para uso!")

    yield

    # Shutdown
    print("🛑 Encerrando API...")

# Criar instância da aplicação FastAPI
app = FastAPI(
    title="Vibe Social Network API",
    version="2.0.0",
    description="API modular para rede social com segurança avançada",
    lifespan=lifespan
)

# Middleware de segurança e performance
@app.middleware("http")
async def security_performance_middleware(request: Request, call_next):
    """Middleware combinado de segurança e performance"""
    # 1. Verificações de segurança
    security_response = await security_middleware.process_request(request)
    if security_response:
        return security_response

    # 2. Verificar cache de performance
    perf_response = await performance_middleware.process_request(request)
    if perf_response:
        return perf_response

    # 3. Processar requisição normal
    try:
        response = await call_next(request)

        # 4. Processar resposta com otimiza��ões
        response = await performance_middleware.process_response(request, response)

        return response

    except Exception as e:
        # Log do erro
        print(f"❌ Error processing request {request.url}: {str(e)}")

        # Verificar se é um ataque
        ip = security_middleware.get_client_ip(request)
        if isinstance(e, (ValueError, TypeError)):
            security_middleware.block_ip(ip)

        raise e

# Headers de segurança globais
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Adicionar headers de segurança"""
    response = await call_next(request)

    # Headers de segurança
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

    # CSP (Content Security Policy)
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: blob:; "
        "connect-src 'self' ws: wss:; "
        "font-src 'self'; "
        "object-src 'none'; "
        "media-src 'self'; "
        "frame-src 'none';"
    )
    response.headers["Content-Security-Policy"] = csp

    return response

# Configurar CORS com segurança
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS + [
        "https://vibe.social",
        "https://app.vibe.social"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With"
    ],
    expose_headers=["X-Response-Time", "X-Cache", "X-Slow-Request"]
)

# Criar diretórios de upload se não existirem
os.makedirs("uploads/stories", exist_ok=True)
os.makedirs("uploads/posts", exist_ok=True)
os.makedirs("uploads/profiles", exist_ok=True)
os.makedirs("uploads/image", exist_ok=True)
os.makedirs("uploads/media", exist_ok=True)
os.makedirs("uploads/avatars", exist_ok=True)
os.makedirs("uploads/covers", exist_ok=True)

# Servir arquivos estáticos para uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Incluir rotas
app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(users_router)
app.include_router(email_verification_router)
app.include_router(stories_router)
app.include_router(upload_router)
app.include_router(friendships_router)
app.include_router(follows_router)
app.include_router(reports_router)
app.include_router(notifications_router)

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, token: str = None):
    """Endpoint WebSocket para notificações em tempo real"""
    try:
        # Verificar token de autenticação
        if not token:
            await websocket.close(code=1008, reason="Token de autenticação necessário")
            return

        # Verificar se o token é válido
        user = verify_websocket_token(token)
        if not user or user.id != user_id:
            print(f"❌ WebSocket: Token inválido para usuário {user_id}")
            await websocket.close(code=1008, reason="Token inválido")
            return

        # Conectar o usuário
        await manager.connect(websocket, user_id)
        print(f"✅ WebSocket: Usuário {user_id} conectado")

        try:
            # Manter conexão ativa
            while True:
                # Aguardar mensagens do cliente (ping/pong para manter conexão)
                data = await websocket.receive_text()
                # Echo para manter conexão ativa
                if data == "ping":
                    await websocket.send_text("pong")

        except WebSocketDisconnect:
            manager.disconnect(websocket, user_id)
            print(f"��� WebSocket: Usuário {user_id} desconectado")

    except Exception as e:
        print(f"❌ Erro no WebSocket para usuário {user_id}: {str(e)}")
        try:
            await websocket.close(code=1011, reason="Erro interno do servidor")
        except:
            pass

@app.get("/")
async def root():
    """Endpoint raiz da API"""
    return {
        "message": "Vibe - conecte-se!",
        "version": "2.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/stats")
async def get_performance_stats():
    """Endpoint para obter estatísticas de performance (apenas para desenvolvimento)"""
    return performance_middleware.get_stats()

@app.post("/admin/clear-cache")
async def clear_cache():
    """Limpar cache de performance"""
    performance_middleware.clear_cache()
    return {"message": "Cache cleared successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
