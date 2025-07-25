"""
Rotas de verificação de e-mail
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime, timedelta
import random
import secrets
from pydantic import BaseModel

from core.database import get_db, Base
from models import User

router = APIRouter(prefix="/email-verification", tags=["email-verification"])

# Modelo para verificações de e-mail
class EmailVerification(Base):
    __tablename__ = "email_verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    email = Column(String(255), nullable=False)
    verification_code = Column(String(6), nullable=False)
    verification_token = Column(String(64), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)
    attempts = Column(Integer, default=1)

# Schemas
class SendVerificationRequest(BaseModel):
    email: str
    first_name: str
    user_id: int

class VerifyCodeRequest(BaseModel):
    user_id: int
    code: str

class VerifyTokenRequest(BaseModel):
    token: str

def generate_verification_code():
    """Gera código de 6 dígitos"""
    return str(random.randint(100000, 999999))

def generate_verification_token():
    """Gera token de verificação"""
    return secrets.token_hex(32)

def create_verification_record(user_id: int, email: str, first_name: str, db: Session) -> bool:
    """
    Sync helper function to create verification record during registration
    Returns True if successful, False otherwise
    """
    try:
        print(f"📧 Creating verification record for user {user_id}: {email}")

        # Verificar limite de tentativas (anti-spam) - 5 por hora
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        recent_attempts = db.query(EmailVerification).filter(
            EmailVerification.user_id == user_id,
            EmailVerification.created_at > one_hour_ago
        ).count()

        if recent_attempts >= 5:
            print(f"❌ Too many attempts for user {user_id}")
            return False

        # Gerar código e token
        verification_code = generate_verification_code()
        verification_token = generate_verification_token()
        # Usar tempo do banco para consistência
        from sqlalchemy import text
        db_time = db.execute(text("SELECT NOW()")).fetchone()[0]
        expires_at = db_time + timedelta(minutes=10)

        print(f"📝 Generated verification code: {verification_code}")

        # Remover verificações antigas não utilizadas
        db.query(EmailVerification).filter(
            EmailVerification.user_id == user_id,
            EmailVerification.verified == False
        ).delete()

        # Salvar no banco
        db_verification = EmailVerification(
            user_id=user_id,
            email=email,
            verification_code=verification_code,
            verification_token=verification_token,
            expires_at=expires_at
        )
        db.add(db_verification)
        db.commit()

        print(f"✅ Verification record saved to database")
        print(f"📧 Código de verificação para {email}: {verification_code}")
        print(f"🔗 Token: {verification_token}")
        print(f"⏰ Expira em: {expires_at}")

        return True

    except Exception as e:
        print(f"❌ Erro ao criar registro de verificação: {e}")
        db.rollback()
        return False

@router.post("/send-verification")
async def send_verification_email(
    request: SendVerificationRequest,
    db: Session = Depends(get_db)
):
    """Enviar código de verificação por e-mail"""
    try:
        email = request.email
        first_name = request.first_name
        user_id = request.user_id
        
        print(f"📧 Received verification request for user {user_id}: {email}")

        # Verificar se o usuário existe
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print(f"❌ User {user_id} not found in database")
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

        # Verificar limite de tentativas (anti-spam) - 5 por hora
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        recent_attempts = db.query(EmailVerification).filter(
            EmailVerification.user_id == user_id,
            EmailVerification.created_at > one_hour_ago
        ).count()

        if recent_attempts >= 5:
            print(f"❌ Too many attempts for user {user_id}")
            raise HTTPException(
                status_code=429,
                detail="Muitas tentativas. Tente novamente em 1 hora."
            )

        # Verificar cooldown (1 minuto)
        one_minute_ago = datetime.utcnow() - timedelta(minutes=1)
        recent_attempt = db.query(EmailVerification).filter(
            EmailVerification.user_id == user_id,
            EmailVerification.created_at > one_minute_ago
        ).first()

        if recent_attempt:
            remaining_time = 60 - int((datetime.utcnow() - recent_attempt.created_at).total_seconds())
            if remaining_time > 0:
                print(f"❌ Cooldown active for user {user_id}: {remaining_time}s remaining")
                raise HTTPException(
                    status_code=429,
                    detail=f"Aguarde {remaining_time} segundos antes de solicitar um novo código",
                    headers={"Retry-After": str(remaining_time)}
                )

        # Gerar código e token
        verification_code = generate_verification_code()
        verification_token = generate_verification_token()
        # Usar tempo do banco para consistência
        from sqlalchemy import text
        db_time = db.execute(text("SELECT NOW()")).fetchone()[0]
        expires_at = db_time + timedelta(minutes=10)
        
        print(f"📝 Generated verification code: {verification_code}")

        # Remover verificações antigas não utilizadas
        db.query(EmailVerification).filter(
            EmailVerification.user_id == user_id,
            EmailVerification.verified == False
        ).delete()

        # Salvar no banco
        db_verification = EmailVerification(
            user_id=user_id,
            email=email,
            verification_code=verification_code,
            verification_token=verification_token,
            expires_at=expires_at
        )
        db.add(db_verification)
        db.commit()
        
        print(f"✅ Verification record saved to database")

        # Log do código (em produção, envie por e-mail real)
        print(f"📧 Código de verificação para {email}: {verification_code}")
        print(f"🔗 Token: {verification_token}")
        print(f"⏰ Expira em: {expires_at}")
        
        return {
            "success": True,
            "message": "Código de verificação enviado com sucesso",
            "expires_in": 600000,  # 10 minutos em millisegundos
            "cooldown_ms": 60000   # 1 minuto em millisegundos
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao enviar código: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor")

@router.post("/verify-code")
async def verify_code(
    request: VerifyCodeRequest,
    db: Session = Depends(get_db)
):
    """Verificar código de 6 dígitos"""
    try:
        user_id = request.user_id
        code = request.code
        
        print(f"🔍 Verifying code {code} for user {user_id}")

        # Usar tempo do banco para consistência
        from sqlalchemy import text
        db_time = db.execute(text("SELECT NOW()")).fetchone()[0]
        print(f"⏰ Current database time: {db_time}")

        # Buscar código válido usando tempo do banco
        verification = db.query(EmailVerification).filter(
            EmailVerification.user_id == user_id,
            EmailVerification.verification_code == code,
            EmailVerification.verified == False,
            EmailVerification.expires_at > db_time
        ).first()

        if not verification:
            # Debug: verificar se existe algum código para este usuário
            all_codes = db.query(EmailVerification).filter(
                EmailVerification.user_id == user_id,
                EmailVerification.verification_code == code
            ).all()

            if all_codes:
                for v in all_codes:
                    print(f"🔍 Found code: verified={v.verified}, expires_at={v.expires_at}, current_db_time={db_time}")
            else:
                print(f"❌ No code found with value {code} for user {user_id}")

            print(f"❌ Invalid or expired code for user {user_id}")
            raise HTTPException(
                status_code=400,
                detail="Código inválido ou expirado"
            )

        # Marcar como verificado
        verification.verified = True
        verification.verified_at = db_time

        # Atualizar usuário como verificado e ativar conta
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_verified = True
            # Ativar conta após verificação de email
            from models.user import AccountStatus
            user.account_status = AccountStatus.active
            print(f"✅ User {user_id} marked as verified and account activated")

        db.commit()

        return {
            "success": True,
            "message": "E-mail verificado com sucesso!"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao verificar código: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/verify-token")
async def verify_token(
    request: VerifyTokenRequest,
    db: Session = Depends(get_db)
):
    """Verificar token do link do e-mail"""
    try:
        token = request.token

        # Buscar token válido
        verification = db.query(EmailVerification).filter(
            EmailVerification.verification_token == token,
            EmailVerification.verified == False,
            EmailVerification.expires_at > datetime.utcnow()
        ).first()

        if not verification:
            raise HTTPException(
                status_code=400,
                detail="Token inválido ou expirado"
            )

        # Marcar como verificado
        verification.verified = True
        verification.verified_at = db_time

        # Atualizar usuário como verificado e ativar conta
        user = db.query(User).filter(User.id == verification.user_id).first()
        if user:
            user.is_verified = True
            # Ativar conta após verificação de email
            from models.user import AccountStatus
            user.account_status = AccountStatus.active

        db.commit()

        return {
            "success": True,
            "message": "E-mail verificado com sucesso!",
            "user_id": verification.user_id
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao verificar token: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/verification-status/{user_id}")
async def get_verification_status(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Verificar status de verificação do usuário"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

        return {
            "success": True,
            "verified": user.is_verified or False
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/health")
async def health_check():
    """Health check do serviço de verificação"""
    return {
        "status": "OK",
        "service": "Email Verification Service",
        "timestamp": datetime.utcnow().isoformat()
    }
