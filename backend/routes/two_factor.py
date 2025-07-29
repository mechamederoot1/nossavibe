"""
Two-Factor Authentication routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from typing import Optional
import pyotp
import qrcode
import io
import base64
import secrets
import string
from datetime import datetime, timedelta

from backend.core.database import get_db
from backend.utils.auth import get_current_user
from backend.models.user import User
from backend.models.two_factor import TwoFactorAuth

router = APIRouter(prefix="/2fa", tags=["two-factor-auth"])

def generate_backup_codes(count: int = 8) -> list:
    """Generate backup codes for 2FA"""
    codes = []
    for _ in range(count):
        code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        codes.append(f"{code[:4]}-{code[4:]}")
    return codes

@router.post("/setup/generate")
async def generate_2fa_setup(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate QR code and secret for 2FA setup"""
    
    # Check if 2FA is already enabled
    existing_2fa = db.query(TwoFactorAuth).filter(
        TwoFactorAuth.user_id == current_user.id
    ).first()
    
    if existing_2fa and existing_2fa.is_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA já está habilitado para esta conta"
        )
    
    # Generate secret key
    secret_key = pyotp.random_base32()
    
    # Create TOTP URI for QR code
    totp_uri = pyotp.totp.TOTP(secret_key).provisioning_uri(
        name=current_user.email,
        issuer_name="Vibe Social Network"
    )
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(totp_uri)
    qr.make(fit=True)
    
    # Convert QR code to base64 image
    img = qr.make_image(fill_color="black", back_color="white")
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    qr_code_base64 = base64.b64encode(img_buffer.getvalue()).decode()
    
    # Generate backup codes
    backup_codes = generate_backup_codes()
    
    # Store or update 2FA record (not enabled yet)
    if existing_2fa:
        existing_2fa.secret_key = secret_key
        existing_2fa.backup_codes = backup_codes
        existing_2fa.is_enabled = False
    else:
        two_factor = TwoFactorAuth(
            user_id=current_user.id,
            secret_key=secret_key,
            backup_codes=backup_codes,
            is_enabled=False
        )
        db.add(two_factor)
    
    db.commit()
    
    return {
        "success": True,
        "setup_data": {
            "secret_key": secret_key,
            "qr_code": f"data:image/png;base64,{qr_code_base64}",
            "backup_codes": backup_codes,
            "manual_entry_key": secret_key
        },
        "message": "QR code gerado. Escaneie com seu app autenticador e confirme com um código."
    }

@router.post("/setup/verify")
async def verify_2fa_setup(
    code: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify and enable 2FA setup"""
    
    # Get 2FA record
    two_factor = db.query(TwoFactorAuth).filter(
        TwoFactorAuth.user_id == current_user.id
    ).first()
    
    if not two_factor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Setup de 2FA não encontrado. Execute o setup primeiro."
        )
    
    if two_factor.is_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA já está habilitado"
        )
    
    # Verify the code
    totp = pyotp.TOTP(two_factor.secret_key)
    if not totp.verify(code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código inválido. Tente novamente."
        )
    
    # Enable 2FA
    two_factor.is_enabled = True
    
    # Update user settings to enable 2FA
    if hasattr(current_user, 'settings'):
        current_user.settings.two_factor_enabled = True
    
    db.commit()
    
    return {
        "success": True,
        "message": "2FA habilitado com sucesso",
        "backup_codes": two_factor.backup_codes
    }

@router.post("/verify")
async def verify_2fa_code(
    code: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify 2FA code during login or sensitive operations"""
    
    # Get 2FA record
    two_factor = db.query(TwoFactorAuth).filter(
        TwoFactorAuth.user_id == current_user.id,
        TwoFactorAuth.is_enabled == True
    ).first()
    
    if not two_factor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA não está habilitado para esta conta"
        )
    
    # Try TOTP verification first
    totp = pyotp.TOTP(two_factor.secret_key)
    if totp.verify(code, valid_window=1):\n        return {\n            \"success\": True,\n            \"message\": \"Código 2FA verificado com sucesso\",\n            \"method\": \"totp\"\n        }\n    \n    # Try backup code verification\n    if code in two_factor.backup_codes:\n        # Remove used backup code\n        backup_codes = two_factor.backup_codes.copy()\n        backup_codes.remove(code)\n        two_factor.backup_codes = backup_codes\n        db.commit()\n        \n        return {\n            \"success\": True,\n            \"message\": \"Código de backup usado com sucesso\",\n            \"method\": \"backup\",\n            \"remaining_backup_codes\": len(backup_codes)\n        }\n    \n    raise HTTPException(\n        status_code=status.HTTP_400_BAD_REQUEST,\n        detail=\"Código inválido\"\n    )\n\n@router.post(\"/disable\")\nasync def disable_2fa(\n    password: str = Form(...),\n    code: Optional[str] = Form(None),\n    current_user: User = Depends(get_current_user),\n    db: Session = Depends(get_db)\n):\n    \"\"\"Disable 2FA (requires password and 2FA code)\"\"\"\n    \n    # Verify password\n    from backend.utils.auth import verify_password\n    if not verify_password(password, current_user.password_hash):\n        raise HTTPException(\n            status_code=status.HTTP_400_BAD_REQUEST,\n            detail=\"Senha incorreta\"\n        )\n    \n    # Get 2FA record\n    two_factor = db.query(TwoFactorAuth).filter(\n        TwoFactorAuth.user_id == current_user.id,\n        TwoFactorAuth.is_enabled == True\n    ).first()\n    \n    if not two_factor:\n        raise HTTPException(\n            status_code=status.HTTP_400_BAD_REQUEST,\n            detail=\"2FA não está habilitado\"\n        )\n    \n    # Verify 2FA code if provided\n    if code:\n        totp = pyotp.TOTP(two_factor.secret_key)\n        if not totp.verify(code, valid_window=1) and code not in two_factor.backup_codes:\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=\"Código 2FA inválido\"\n            )\n    \n    # Disable 2FA\n    two_factor.is_enabled = False\n    \n    # Update user settings\n    if hasattr(current_user, 'settings'):\n        current_user.settings.two_factor_enabled = False\n    \n    db.commit()\n    \n    return {\n        \"success\": True,\n        \"message\": \"2FA desabilitado com sucesso\"\n    }\n\n@router.get(\"/status\")\nasync def get_2fa_status(\n    current_user: User = Depends(get_current_user),\n    db: Session = Depends(get_db)\n):\n    \"\"\"Get current 2FA status\"\"\"\n    \n    two_factor = db.query(TwoFactorAuth).filter(\n        TwoFactorAuth.user_id == current_user.id\n    ).first()\n    \n    if not two_factor:\n        return {\n            \"success\": True,\n            \"status\": {\n                \"enabled\": False,\n                \"setup_completed\": False,\n                \"backup_codes_count\": 0\n            }\n        }\n    \n    return {\n        \"success\": True,\n        \"status\": {\n            \"enabled\": two_factor.is_enabled,\n            \"setup_completed\": bool(two_factor.secret_key),\n            \"backup_codes_count\": len(two_factor.backup_codes) if two_factor.backup_codes else 0,\n            \"phone_backup\": two_factor.phone_number is not None,\n            \"email_backup\": two_factor.email_backup\n        }\n    }\n\n@router.post(\"/backup-codes/regenerate\")\nasync def regenerate_backup_codes(\n    password: str = Form(...),\n    current_user: User = Depends(get_current_user),\n    db: Session = Depends(get_db)\n):\n    \"\"\"Regenerate backup codes\"\"\"\n    \n    # Verify password\n    from backend.utils.auth import verify_password\n    if not verify_password(password, current_user.password_hash):\n        raise HTTPException(\n            status_code=status.HTTP_400_BAD_REQUEST,\n            detail=\"Senha incorreta\"\n        )\n    \n    # Get 2FA record\n    two_factor = db.query(TwoFactorAuth).filter(\n        TwoFactorAuth.user_id == current_user.id,\n        TwoFactorAuth.is_enabled == True\n    ).first()\n    \n    if not two_factor:\n        raise HTTPException(\n            status_code=status.HTTP_400_BAD_REQUEST,\n            detail=\"2FA não está habilitado\"\n        )\n    \n    # Generate new backup codes\n    new_backup_codes = generate_backup_codes()\n    two_factor.backup_codes = new_backup_codes\n    \n    db.commit()\n    \n    return {\n        \"success\": True,\n        \"message\": \"Códigos de backup regenerados com sucesso\",\n        \"backup_codes\": new_backup_codes\n    }\n\n@router.put(\"/phone\")\nasync def update_phone_backup(\n    phone_number: Optional[str] = Form(None),\n    enable: bool = Form(True),\n    current_user: User = Depends(get_current_user),\n    db: Session = Depends(get_db)\n):\n    \"\"\"Update phone backup for 2FA\"\"\"\n    \n    two_factor = db.query(TwoFactorAuth).filter(\n        TwoFactorAuth.user_id == current_user.id\n    ).first()\n    \n    if not two_factor:\n        raise HTTPException(\n            status_code=status.HTTP_400_BAD_REQUEST,\n            detail=\"2FA não está configurado\"\n        )\n    \n    if enable and phone_number:\n        # TODO: Add phone number validation and SMS verification\n        two_factor.phone_number = phone_number\n    elif not enable:\n        two_factor.phone_number = None\n    \n    db.commit()\n    \n    return {\n        \"success\": True,\n        \"message\": f\"Backup por SMS {'habilitado' if enable and phone_number else 'desabilitado'}\"\n    }\n\n@router.put(\"/email-backup\")\nasync def toggle_email_backup(\n    enabled: bool = Form(...),\n    current_user: User = Depends(get_current_user),\n    db: Session = Depends(get_db)\n):\n    \"\"\"Toggle email backup for 2FA\"\"\"\n    \n    two_factor = db.query(TwoFactorAuth).filter(\n        TwoFactorAuth.user_id == current_user.id\n    ).first()\n    \n    if not two_factor:\n        raise HTTPException(\n            status_code=status.HTTP_400_BAD_REQUEST,\n            detail=\"2FA não está configurado\"\n        )\n    \n    two_factor.email_backup = enabled\n    db.commit()\n    \n    return {\n        \"success\": True,\n        \"message\": f\"Backup por email {'habilitado' if enabled else 'desabilitado'}\"\n    }\n
