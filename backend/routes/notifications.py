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
from utils.websocket_manager import manager

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

# Utility function to create notifications
async def create_notification(
    db: Session,
    recipient_id: int,
    notification_type: NotificationType,
    title: str,
    message: str,
    sender_id: Optional[int] = None,
    post_id: Optional[int] = None,
    comment_id: Optional[int] = None,
    story_id: Optional[int] = None,
    friendship_id: Optional[int] = None,
    data: Optional[dict] = None
):
    """Criar uma nova notificação e enviar via WebSocket"""
    
    # Verificar se o recipient não é o sender (evitar auto-notificações)
    if sender_id and recipient_id == sender_id:
        return None
    
    notification = Notification(
        recipient_id=recipient_id,
        sender_id=sender_id,
        notification_type=notification_type,
        title=title,
        message=message,
        post_id=post_id,
        comment_id=comment_id,
        story_id=story_id,
        friendship_id=friendship_id,
        data=json.dumps(data) if data else None
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    # Preparar dados para envio via WebSocket
    sender_data = None
    if notification.sender:
        sender_data = {
            "id": notification.sender.id,
            "first_name": notification.sender.first_name,
            "last_name": notification.sender.last_name,
            "username": notification.sender.username,
            "avatar": notification.sender.avatar
        }
    
    notification_data = {
        "id": notification.id,
        "type": notification.notification_type.value,
        "title": notification.title,
        "message": notification.message,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat(),
        "sender": sender_data,
        "data": json.loads(notification.data) if notification.data else {}
    }
    
    # Enviar notificação via WebSocket
    await manager.send_personal_message(
        message={
            "type": "notification",
            "data": notification_data
        },
        user_id=recipient_id
    )
    
    return notification

# Friend request notifications
async def create_friend_request_notification(
    db: Session,
    requester_id: int,
    addressee_id: int,
    friendship_id: int
):
    """Criar notificação de solicitação de amizade"""
    requester = db.query(User).filter(User.id == requester_id).first()
    if not requester:
        return
    
    await create_notification(
        db=db,
        recipient_id=addressee_id,
        sender_id=requester_id,
        notification_type=NotificationType.FRIEND_REQUEST,
        title="Nova solicitação de amizade",
        message=f"{requester.first_name} {requester.last_name} enviou uma solicitação de amizade",
        friendship_id=friendship_id,
        data={"action_url": "/friends"}
    )

async def create_friend_request_accepted_notification(
    db: Session,
    requester_id: int,
    addressee_id: int,
    friendship_id: int
):
    """Criar notificação de solicitação aceita"""
    addressee = db.query(User).filter(User.id == addressee_id).first()
    if not addressee:
        return
    
    await create_notification(
        db=db,
        recipient_id=requester_id,
        sender_id=addressee_id,
        notification_type=NotificationType.FRIEND_REQUEST_ACCEPTED,
        title="Solicitação de amizade aceita",
        message=f"{addressee.first_name} {addressee.last_name} aceitou sua solicitação de amizade",
        friendship_id=friendship_id,
        data={"action_url": f"/profile/{addressee_id}"}
    )

# Post interaction notifications
async def create_post_reaction_notification(
    db: Session,
    post_id: int,
    reactor_id: int,
    post_author_id: int,
    reaction_type: str
):
    """Criar notificação de reação em post"""
    reactor = db.query(User).filter(User.id == reactor_id).first()
    if not reactor:
        return
    
    reaction_messages = {
        "like": "curtiu seu post",
        "love": "amou seu post",
        "haha": "achou engraçado seu post",
        "wow": "ficou impressionado com seu post",
        "sad": "ficou triste com seu post",
        "angry": "ficou irritado com seu post"
    }
    
    message = reaction_messages.get(reaction_type, "reagiu ao seu post")
    
    await create_notification(
        db=db,
        recipient_id=post_author_id,
        sender_id=reactor_id,
        notification_type=NotificationType.POST_REACTION,
        title="Nova reação no seu post",
        message=f"{reactor.first_name} {reactor.last_name} {message}",
        post_id=post_id,
        data={"action_url": f"/post/{post_id}", "reaction_type": reaction_type}
    )

async def create_post_comment_notification(
    db: Session,
    post_id: int,
    commenter_id: int,
    post_author_id: int,
    comment_id: int
):
    """Criar notificação de comentário em post"""
    commenter = db.query(User).filter(User.id == commenter_id).first()
    if not commenter:
        return
    
    await create_notification(
        db=db,
        recipient_id=post_author_id,
        sender_id=commenter_id,
        notification_type=NotificationType.POST_COMMENT,
        title="Novo comentário no seu post",
        message=f"{commenter.first_name} {commenter.last_name} comentou no seu post",
        post_id=post_id,
        comment_id=comment_id,
        data={"action_url": f"/post/{post_id}"}
    )

async def create_follow_notification(
    db: Session,
    follower_id: int,
    followed_id: int
):
    """Criar notificação de novo seguidor"""
    follower = db.query(User).filter(User.id == follower_id).first()
    if not follower:
        return
    
    await create_notification(
        db=db,
        recipient_id=followed_id,
        sender_id=follower_id,
        notification_type=NotificationType.NEW_FOLLOWER,
        title="Novo seguidor",
        message=f"{follower.first_name} {follower.last_name} começou a seguir você",
        data={"action_url": f"/profile/{follower_id}"}
    )
