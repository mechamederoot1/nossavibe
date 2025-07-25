"""
Rotas da aplicação
"""
from .auth import router as auth_router
from .posts import router as posts_router
from .users import router as users_router
from .email_verification import router as email_verification_router
from .stories import router as stories_router
from .upload import router as upload_router

__all__ = [
    "auth_router",
    "posts_router",
    "users_router",
    "email_verification_router",
    "stories_router",
    "upload_router"
]
