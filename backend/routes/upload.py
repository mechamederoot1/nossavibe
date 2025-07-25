"""
Rotas para upload de arquivos
"""
import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from core.database import get_db
from models.user import User
from utils.auth import get_current_user
from utils.files import save_uploaded_file, validate_media_file

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/media")
async def upload_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload mídia para stories, posts, etc."""
    
    try:
        # Validar arquivo
        validation_result = validate_media_file(file)
        if not validation_result["valid"]:
            raise HTTPException(status_code=400, detail=validation_result["error"])
        
        # Salvar arquivo
        filename = await save_uploaded_file(file, "media")
        file_path = f"/uploads/media/{filename}"
        
        return {
            "success": True,
            "message": "Arquivo enviado com sucesso",
            "file_path": file_path,
            "file_url": file_path,
            "media_url": file_path,
            "url": file_path,  # Multiple field names for compatibility
            "filename": filename,
            "original_filename": file.filename,
            "content_type": file.content_type,
            "size": file.size if hasattr(file, 'size') else None
        }
        
    except Exception as e:
        print(f"❌ Erro no upload de mídia: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload: {str(e)}")

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload de avatar de usuário"""
    
    try:
        # Validar se é imagem
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Apenas imagens são permitidas para avatar")
        
        # Salvar arquivo
        filename = await save_uploaded_file(file, "avatars")
        file_path = f"/uploads/avatars/{filename}"
        
        return {
            "success": True,
            "message": "Avatar enviado com sucesso",
            "file_path": file_path,
            "avatar_url": file_path
        }
        
    except Exception as e:
        print(f"❌ Erro no upload de avatar: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload do avatar: {str(e)}")

@router.post("/cover")
async def upload_cover(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload de foto de capa"""
    
    try:
        # Validar se é imagem
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Apenas imagens são permitidas para capa")
        
        # Salvar arquivo
        filename = await save_uploaded_file(file, "covers")
        file_path = f"/uploads/covers/{filename}"
        
        return {
            "success": True,
            "message": "Foto de capa enviada com sucesso",
            "file_path": file_path,
            "cover_url": file_path
        }
        
    except Exception as e:
        print(f"❌ Erro no upload de capa: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload da capa: {str(e)}")
