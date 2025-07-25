"""
Rotas de autenticação
"""
from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import timedelta, datetime

from core.database import get_db
from core.security import hash_password, verify_password, create_access_token, get_current_user
from core.security_middleware import security_middleware
from core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from models import User
from schemas import LoginRequest, Token, UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/test-db")
def test_database_connection(db: Session = Depends(get_db)):
    """Test endpoint to verify database connection and schema"""
    try:
        # Test basic database connection
        result = db.execute("SELECT 1 as test").fetchone()
        print(f"✅ Database connection test: {result}")

        # Test User table access
        user_count = db.query(User).count()
        print(f"✅ User table accessible, count: {user_count}")

        return {
            "status": "success",
            "database_connected": True,
            "user_table_accessible": True,
            "user_count": user_count
        }
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "database_connected": False
        }

@router.post("/register")
async def register(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    # Verificações de segurança
    security_response = await security_middleware.process_request(request)
    if security_response:
        return security_response

    ip = security_middleware.get_client_ip(request)
    try:
        print(f"🔍 Registration attempt for email: {user.email}")
        print(f"🔍 Received data: {user.dict()}")

        # Sanitizar inputs
        user.first_name = security_middleware.sanitize_input(user.first_name)
        user.last_name = security_middleware.sanitize_input(user.last_name)
        user.email = security_middleware.sanitize_input(user.email)

        # Validate required fields
        if not user.first_name or not user.first_name.strip():
            raise HTTPException(status_code=400, detail="Nome é obrigatório")
        if not user.last_name or not user.last_name.strip():
            raise HTTPException(status_code=400, detail="Sobrenome é obrigatório")
        if not user.email or not user.email.strip():
            raise HTTPException(status_code=400, detail="E-mail é obrigatório")
        if not user.password or len(user.password) < 8:
            raise HTTPException(status_code=400, detail="Senha deve ter pelo menos 8 caracteres")

        # Verificar força da senha
        import re
        if not re.search(r'(?=.*[a-z])(?=.*[A-Z])(?=.*\d)', user.password):
            raise HTTPException(
                status_code=400,
                detail="Senha deve conter ao menos uma letra maiúscula, uma minúscula e um número"
            )

        print(f"✅ Required fields validated")

        # Verifica se o usuário já existe
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            print(f"❌ Email already registered: {user.email}")
            raise HTTPException(status_code=400, detail="Email already registered")

        print(f"✅ Email available: {user.email}")

        # Hash password
        hashed_password = hash_password(user.password)
        print(f"✅ Password hashed successfully")

        # Process birth date
        birth_date_obj = None
        if user.birth_date:
            try:
                birth_date_obj = user.get_birth_date_as_date()
                print(f"✅ Birth date processed: {birth_date_obj}")
            except Exception as date_error:
                print(f"⚠️ Birth date conversion failed: {date_error}")

        # Create user with only required fields first
        db_user = User(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            password_hash=hashed_password
        )

        # Add optional fields
        if user.gender:
            db_user.gender = user.gender
        if birth_date_obj:
            db_user.birth_date = birth_date_obj
        if user.phone:
            db_user.phone = user.phone

        print(f"✅ User object created")

        # Save to database
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        print(f"✅ User {db_user.id} created successfully!")

        # Return minimal response to avoid serialization issues
        return {
            "id": db_user.id,
            "first_name": db_user.first_name,
            "last_name": db_user.last_name,
            "email": db_user.email,
            "is_active": db_user.is_active,
            "is_verified": getattr(db_user, 'is_verified', False),
            "created_at": db_user.created_at.isoformat(),
            "last_seen": db_user.last_seen.isoformat()
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"❌ Unexpected error: {type(e).__name__}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@router.post("/login", response_model=Token)
async def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    # Verificações de segurança
    security_response = await security_middleware.process_request(request)
    if security_response:
        return security_response

    ip = security_middleware.get_client_ip(request)

    # Verificar tentativas de login
    if not security_middleware.check_login_attempts(ip, login_data.email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Muitas tentativas de login falhadas. Tente novamente em 15 minutos."
        )
    try:
        user = db.query(User).filter(User.email == login_data.email).first()

        if not user or not verify_password(login_data.password, user.password_hash):
            # Registrar tentativa falhada
            security_middleware.record_failed_login(ip, login_data.email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")

        # Verificar se o email foi confirmado
        is_verified = getattr(user, 'is_verified', False)
        if not is_verified:
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "email_not_verified",
                    "message": "Você precisa confirmar seu email antes de fazer login. Verifique sua caixa de entrada.",
                    "user_id": user.id,
                    "email": user.email
                }
            )

        # Verificar status da conta
        account_status = getattr(user, 'account_status', 'pending')

        # Converter Enum para string para serialização JSON
        if hasattr(account_status, 'value'):
            account_status_str = account_status.value
        else:
            account_status_str = str(account_status)

        if account_status_str != 'active':
            status_messages = {
                'pending': 'Sua conta está pendente de ativação. Confirme seu email.',
                'suspended': 'Sua conta foi suspensa. Entre em contato com o suporte.',
                'banned': 'Sua conta foi banida. Entre em contato com o suporte.'
            }
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "account_not_active",
                    "message": status_messages.get(account_status_str, "Conta não está ativa"),
                    "status": account_status_str,
                    "user_id": user.id
                }
            )

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id}, expires_delta=access_token_expires
        )

        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/check-email")
def check_email_exists(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    return {"exists": user is not None}

@router.get("/check-username")
def check_username_exists(username: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.username == username,
        User.id != current_user.id  # Exclude current user
    ).first()
    return {"exists": user is not None}

@router.get("/check-username-public")
def check_username_exists_public(username: str, db: Session = Depends(get_db)):
    """Public route to check username availability during registration"""
    user = db.query(User).filter(User.username == username).first()
    return {"exists": user is not None}

@router.get("/verify-token")
async def verify_token(current_user: User = Depends(get_current_user)):
    return {"valid": True, "user": current_user}

@router.post("/complete-onboarding")
async def complete_onboarding(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marcar o onboarding como completo para o usuário atual"""
    # Verificações de segurança
    security_response = await security_middleware.process_request(request)
    if security_response:
        return security_response

    try:
        # Atualizar usuário
        current_user.onboarding_completed = True
        current_user.updated_at = datetime.now()

        db.commit()
        db.refresh(current_user)

        print(f"✅ Usuário {current_user.id} completou o onboarding")

        return {
            "success": True,
            "message": "Onboarding marcado como completo",
            "onboarding_completed": True
        }

    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao completar onboarding para usuário {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno ao completar onboarding"
        )
