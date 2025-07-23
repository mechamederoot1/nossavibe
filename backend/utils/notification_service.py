from sqlalchemy.orm import Session
from models.notification import Notification
from routes.notifications import create_notification
from websocket_manager import manager
import asyncio
from typing import Optional

class NotificationService:
    @staticmethod
    async def send_like_notification(
        db: Session,
        post_author_id: int,
        liker_id: int,
        liker_name: str,
        post_id: int
    ):
        """Send notification when someone likes a post"""
        if post_author_id == liker_id:
            return  # Don't notify yourself
            
        notification = create_notification(
            db=db,
            recipient_id=post_author_id,
            sender_id=liker_id,
            notification_type="like",
            title="Nova curtida!",
            message=f"{liker_name} curtiu seu post",
            data={"post_id": post_id, "action": "like"}
        )
        
        # Send real-time notification
        await manager.send_notification(post_author_id, {
            "id": notification.id,
            "type": "like",
            "title": notification.title,
            "message": notification.message,
            "sender": {"name": liker_name},
            "data": {"post_id": post_id},
            "created_at": notification.created_at.isoformat()
        })
    
    @staticmethod
    async def send_comment_notification(
        db: Session,
        post_author_id: int,
        commenter_id: int,
        commenter_name: str,
        post_id: int,
        comment_id: int
    ):
        """Send notification when someone comments on a post"""
        if post_author_id == commenter_id:
            return  # Don't notify yourself
            
        notification = create_notification(
            db=db,
            recipient_id=post_author_id,
            sender_id=commenter_id,
            notification_type="comment",
            title="Novo comentário!",
            message=f"{commenter_name} comentou em seu post",
            data={"post_id": post_id, "comment_id": comment_id, "action": "comment"}
        )
        
        # Send real-time notification
        await manager.send_notification(post_author_id, {
            "id": notification.id,
            "type": "comment",
            "title": notification.title,
            "message": notification.message,
            "sender": {"name": commenter_name},
            "data": {"post_id": post_id, "comment_id": comment_id},
            "created_at": notification.created_at.isoformat()
        })
    
    @staticmethod
    async def send_share_notification(
        db: Session,
        post_author_id: int,
        sharer_id: int,
        sharer_name: str,
        post_id: int
    ):
        """Send notification when someone shares a post"""
        if post_author_id == sharer_id:
            return  # Don't notify yourself
            
        notification = create_notification(
            db=db,
            recipient_id=post_author_id,
            sender_id=sharer_id,
            notification_type="share",
            title="Post compartilhado!",
            message=f"{sharer_name} compartilhou seu post",
            data={"post_id": post_id, "action": "share"}
        )
        
        # Send real-time notification
        await manager.send_notification(post_author_id, {
            "id": notification.id,
            "type": "share",
            "title": notification.title,
            "message": notification.message,
            "sender": {"name": sharer_name},
            "data": {"post_id": post_id},
            "created_at": notification.created_at.isoformat()
        })
    
    @staticmethod
    async def send_friend_request_notification(
        db: Session,
        recipient_id: int,
        requester_id: int,
        requester_name: str
    ):
        """Send notification for friend request"""
        notification = create_notification(
            db=db,
            recipient_id=recipient_id,
            sender_id=requester_id,
            notification_type="friend_request",
            title="Nova solicitação de amizade!",
            message=f"{requester_name} enviou uma solicitação de amizade",
            data={"action": "friend_request"}
        )
        
        # Send real-time notification
        await manager.send_notification(recipient_id, {
            "id": notification.id,
            "type": "friend_request",
            "title": notification.title,
            "message": notification.message,
            "sender": {"name": requester_name},
            "data": {"action": "friend_request"},
            "created_at": notification.created_at.isoformat()
        })
    
    @staticmethod
    async def send_friend_accept_notification(
        db: Session,
        recipient_id: int,
        accepter_id: int,
        accepter_name: str
    ):
        """Send notification when friend request is accepted"""
        notification = create_notification(
            db=db,
            recipient_id=recipient_id,
            sender_id=accepter_id,
            notification_type="friend_accept",
            title="Solicitação aceita!",
            message=f"{accepter_name} aceitou sua solicitação de amizade",
            data={"action": "friend_accept"}
        )
        
        # Send real-time notification
        await manager.send_notification(recipient_id, {
            "id": notification.id,
            "type": "friend_accept",
            "title": notification.title,
            "message": notification.message,
            "sender": {"name": accepter_name},
            "data": {"action": "friend_accept"},
            "created_at": notification.created_at.isoformat()
        })
    
    @staticmethod
    async def send_follow_notification(
        db: Session,
        recipient_id: int,
        follower_id: int,
        follower_name: str
    ):
        """Send notification when someone follows you"""
        notification = create_notification(
            db=db,
            recipient_id=recipient_id,
            sender_id=follower_id,
            notification_type="follow",
            title="Novo seguidor!",
            message=f"{follower_name} começou a seguir você",
            data={"action": "follow"}
        )
        
        # Send real-time notification
        await manager.send_notification(recipient_id, {
            "id": notification.id,
            "type": "follow",
            "title": notification.title,
            "message": notification.message,
            "sender": {"name": follower_name},
            "data": {"action": "follow"},
            "created_at": notification.created_at.isoformat()
        })
    
    @staticmethod
    async def send_message_notification(
        db: Session,
        recipient_id: int,
        sender_id: int,
        sender_name: str,
        message_preview: str
    ):
        """Send notification for new message"""
        notification = create_notification(
            db=db,
            recipient_id=recipient_id,
            sender_id=sender_id,
            notification_type="message",
            title="Nova mensagem!",
            message=f"{sender_name}: {message_preview[:50]}{'...' if len(message_preview) > 50 else ''}",
            data={"action": "message"}
        )
        
        # Send real-time notification
        await manager.send_notification(recipient_id, {
            "id": notification.id,
            "type": "message",
            "title": notification.title,
            "message": notification.message,
            "sender": {"name": sender_name},
            "data": {"action": "message"},
            "created_at": notification.created_at.isoformat()
        })

# Create instance
notification_service = NotificationService()