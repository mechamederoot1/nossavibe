"""
Utility functions for creating notifications
"""
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import json

from models import User, Notification, NotificationType
from utils.websocket_manager import manager

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
