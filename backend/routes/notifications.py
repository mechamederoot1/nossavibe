"""
Rotas para gerenciamento de notificações
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json

from core.database import get_db
from core.security import get_current_user
from models import User, Notification, NotificationType

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/")
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    unread_only: bool = Query(False),
    notification_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter notificações do usuário"""
    query = db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.is_deleted == False
    )
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    if notification_type:
        query = query.filter(Notification.notification_type == notification_type)
    
    notifications = query.order_by(
        Notification.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    result = []
    for notification in notifications:
        notification_data = {
            "id": notification.id,
            "type": notification.notification_type.value,
            "title": notification.title,
            "message": notification.message,
            "is_read": notification.is_read,
            "is_clicked": notification.is_clicked,
            "created_at": notification.created_at.isoformat(),
            "read_at": notification.read_at.isoformat() if notification.read_at else None,
            "sender": None,
            "data": json.loads(notification.data) if notification.data else {}
        }
        
        if notification.sender:
            notification_data["sender"] = {
                "id": notification.sender.id,
                "first_name": notification.sender.first_name,
                "last_name": notification.sender.last_name,
                "username": notification.sender.username,
                "avatar": notification.sender.avatar
            }
        
        result.append(notification_data)
    
    return result

@router.get("/count")
async def get_notification_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter contagem de notificações não lidas"""
    unread_count = db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.is_read == False,
        Notification.is_deleted == False
    ).count()
    
    return {"unread_count": unread_count}

@router.post("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marcar notificação como lida"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        db.commit()
    
    return {"message": "Notification marked as read"}

@router.post("/{notification_id}/click")
async def mark_notification_as_clicked(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marcar notificação como clicada"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if not notification.is_clicked:
        notification.is_clicked = True
        notification.clicked_at = datetime.utcnow()
        
        # Marcar como lida também se não estiver
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
        
        db.commit()
    
    return {"message": "Notification marked as clicked"}

@router.post("/mark-all-read")
async def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marcar todas as notificações como lidas"""
    db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.is_read == False,
        Notification.is_deleted == False
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow()
    })
    
    db.commit()
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletar notificação"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_deleted = True
    db.commit()
    
    return {"message": "Notification deleted"}

@router.delete("/clear-all")
async def clear_all_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Limpar todas as notificações"""
    db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.is_deleted == False
    ).update({"is_deleted": True})
    
    db.commit()
    return {"message": "All notifications cleared"}
