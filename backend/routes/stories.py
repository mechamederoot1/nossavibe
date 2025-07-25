"""
Rotas para stories
"""
import os
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from core.database import get_db
from models.story import Story, StoryView, StoryTag, StoryOverlay
from models.user import User
from schemas.story import StoryCreate, StoryResponse, StoryWithEditor
from utils.auth import get_current_user
from utils.files import save_uploaded_file

router = APIRouter(prefix="/stories", tags=["stories"])

@router.post("/", response_model=dict)
async def create_story(
    story_data: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    media_type: Optional[str] = Form(None),
    background_color: Optional[str] = Form(None),
    duration_hours: int = Form(24),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Criar uma nova story com upload de mídia opcional"""
    
    try:
        media_url = None
        
        # Se há arquivo, fazer upload
        if file:
            if file.content_type and file.content_type.startswith(('image/', 'video/')):
                filename = await save_uploaded_file(file, "stories")
                media_url = f"/uploads/stories/{filename}"
                
                # Definir media_type baseado no arquivo
                if file.content_type.startswith('image/'):
                    media_type = "image"
                elif file.content_type.startswith('video/'):
                    media_type = "video"
            else:
                raise HTTPException(status_code=400, detail="Tipo de arquivo não suportado")
        
        # Criar story
        expires_at = datetime.utcnow() + timedelta(hours=duration_hours)
        
        story = Story(
            author_id=current_user.id,
            content=content,
            media_type=media_type,
            media_url=media_url,
            background_color=background_color,
            duration_hours=duration_hours,
            expires_at=expires_at
        )
        
        db.add(story)
        db.commit()
        db.refresh(story)
        
        return {
            "success": True,
            "message": "Story criada com sucesso!",
            "story_id": story.id,
            "story": {
                "id": story.id,
                "author": {
                    "id": current_user.id,
                    "first_name": current_user.first_name,
                    "last_name": current_user.last_name,
                    "avatar_url": current_user.avatar_url
                },
                "content": story.content,
                "media_type": story.media_type,
                "media_url": story.media_url,
                "background_color": story.background_color,
                "created_at": story.created_at.isoformat(),
                "expires_at": story.expires_at.isoformat(),
                "views_count": story.views_count
            }
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar story: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar story: {str(e)}")

@router.get("/", response_model=List[dict])
async def get_stories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Buscar stories ativas (não expiradas)"""
    
    try:
        now = datetime.utcnow()
        
        # Buscar stories não expiradas
        stories = db.query(Story).join(User).filter(
            and_(
                Story.expires_at > now,
                Story.archived == False
            )
        ).order_by(desc(Story.created_at)).all()
        
        result = []
        for story in stories:
            # Verificar se o usuário atual já visualizou esta story
            viewed = db.query(StoryView).filter(
                and_(
                    StoryView.story_id == story.id,
                    StoryView.viewer_id == current_user.id
                )
            ).first() is not None
            
            story_data = {
                "id": story.id,
                "author": {
                    "id": story.author.id,
                    "first_name": story.author.first_name,
                    "last_name": story.author.last_name,
                    "username": story.author.username,
                    "avatar_url": story.author.avatar_url
                },
                "content": story.content,
                "media_type": story.media_type,
                "media_url": story.media_url,
                "background_color": story.background_color,
                "created_at": story.created_at.isoformat(),
                "expires_at": story.expires_at.isoformat(),
                "views_count": story.views_count,
                "viewed_by_user": viewed
            }
            result.append(story_data)
        
        return result
        
    except Exception as e:
        print(f"❌ Erro ao buscar stories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar stories: {str(e)}")

@router.post("/{story_id}/view")
async def view_story(
    story_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marcar story como visualizada"""
    
    try:
        # Verificar se a story existe
        story = db.query(Story).filter(Story.id == story_id).first()
        if not story:
            raise HTTPException(status_code=404, detail="Story não encontrada")
        
        # Verificar se já foi visualizada
        existing_view = db.query(StoryView).filter(
            and_(
                StoryView.story_id == story_id,
                StoryView.viewer_id == current_user.id
            )
        ).first()
        
        if not existing_view:
            # Adicionar visualização
            view = StoryView(
                story_id=story_id,
                viewer_id=current_user.id
            )
            db.add(view)
            
            # Incrementar contador de visualizações
            story.views_count += 1
            
            db.commit()
        
        return {"success": True, "message": "Visualização registrada"}
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao registrar visualização: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao registrar visualização")

@router.get("/{story_id}")
async def get_story(
    story_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Buscar uma story específica"""
    
    try:
        story = db.query(Story).join(User).filter(Story.id == story_id).first()
        
        if not story:
            raise HTTPException(status_code=404, detail="Story não encontrada")
        
        # Verificar se expirou
        if story.expires_at < datetime.utcnow():
            raise HTTPException(status_code=404, detail="Story expirada")
        
        return {
            "id": story.id,
            "author": {
                "id": story.author.id,
                "first_name": story.author.first_name,
                "last_name": story.author.last_name,
                "username": story.author.username,
                "avatar_url": story.author.avatar_url
            },
            "content": story.content,
            "media_type": story.media_type,
            "media_url": story.media_url,
            "background_color": story.background_color,
            "created_at": story.created_at.isoformat(),
            "expires_at": story.expires_at.isoformat(),
            "views_count": story.views_count
        }
        
    except Exception as e:
        print(f"❌ Erro ao buscar story: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar story")

@router.delete("/{story_id}")
async def delete_story(
    story_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletar uma story (apenas o autor pode deletar)"""
    
    try:
        story = db.query(Story).filter(
            and_(
                Story.id == story_id,
                Story.author_id == current_user.id
            )
        ).first()
        
        if not story:
            raise HTTPException(status_code=404, detail="Story não encontrada ou você não tem permissão")
        
        # Deletar arquivo de mídia se existir
        if story.media_url:
            file_path = f"uploads{story.media_url}"
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Deletar visualizações e tags relacionadas
        db.query(StoryView).filter(StoryView.story_id == story_id).delete()
        db.query(StoryTag).filter(StoryTag.story_id == story_id).delete()
        db.query(StoryOverlay).filter(StoryOverlay.story_id == story_id).delete()
        
        # Deletar a story
        db.delete(story)
        db.commit()
        
        return {"success": True, "message": "Story deletada com sucesso"}
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao deletar story: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao deletar story")
