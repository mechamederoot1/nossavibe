"""
Real-time notification system using WebSocket
"""
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from core.database import SessionLocal
from models.user import User
from models.notification import Notification
from models.post import Post, Reaction, Comment
from models.message import Message
from models.friendship import Friendship
from utils.websocket_manager import manager

class RealtimeNotificationService:
    """Service for sending real-time notifications"""
    
    @staticmethod
    async def send_like_notification(
        liker_id: int,
        post_author_id: int,
        post_id: int,
        reaction_type: str = "like"
    ):
        """Send real-time notification when someone likes a post"""
        if liker_id == post_author_id:
            return  # Don't notify if user likes their own post
        
        db = SessionLocal()
        try:
            liker = db.query(User).filter(User.id == liker_id).first()
            post = db.query(Post).filter(Post.id == post_id).first()
            
            if not liker or not post:
                return
            
            # Create notification in database
            notification = Notification(
                recipient_id=post_author_id,
                sender_id=liker_id,
                notification_type="like",
                title="Nova curtida",
                message=f"{liker.first_name} {liker.last_name} curtiu seu post",
                data=json.dumps({
                    "post_id": post_id,
                    "reaction_type": reaction_type,
                    "liker": {
                        "id": liker.id,
                        "name": f"{liker.first_name} {liker.last_name}",
                        "avatar": liker.avatar
                    }
                })
            )
            
            db.add(notification)
            db.commit()
            db.refresh(notification)
            
            # Send real-time notification
            notification_data = {
                "type": "notification",
                "subtype": "like",
                "id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "sender": {
                    "id": liker.id,
                    "first_name": liker.first_name,
                    "last_name": liker.last_name,
                    "avatar": liker.avatar
                },
                "data": {
                    "post_id": post_id,
                    "reaction_type": reaction_type
                },
                "created_at": notification.created_at.isoformat(),
                "is_read": False
            }
            
            await manager.send_personal_message(notification_data, post_author_id)
            
        finally:
            db.close()
    
    @staticmethod
    async def send_comment_notification(
        commenter_id: int,
        post_author_id: int,
        post_id: int,
        comment_id: int,
        comment_content: str
    ):
        """Send real-time notification when someone comments on a post"""
        if commenter_id == post_author_id:
            return  # Don't notify if user comments on their own post
        
        db = SessionLocal()
        try:
            commenter = db.query(User).filter(User.id == commenter_id).first()
            post = db.query(Post).filter(Post.id == post_id).first()
            
            if not commenter or not post:
                return
            
            # Create notification in database
            notification = Notification(
                recipient_id=post_author_id,
                sender_id=commenter_id,
                notification_type="comment",
                title="Novo comentário",
                message=f"{commenter.first_name} {commenter.last_name} comentou em seu post",
                data=json.dumps({
                    "post_id": post_id,
                    "comment_id": comment_id,
                    "comment_preview": comment_content[:50] + "..." if len(comment_content) > 50 else comment_content,
                    "commenter": {
                        "id": commenter.id,
                        "name": f"{commenter.first_name} {commenter.last_name}",
                        "avatar": commenter.avatar
                    }
                })
            )
            
            db.add(notification)
            db.commit()
            db.refresh(notification)
            
            # Send real-time notification
            notification_data = {
                "type": "notification",
                "subtype": "comment",
                "id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "sender": {
                    "id": commenter.id,
                    "first_name": commenter.first_name,
                    "last_name": commenter.last_name,
                    "avatar": commenter.avatar
                },
                "data": {
                    "post_id": post_id,
                    "comment_id": comment_id,
                    "comment_preview": comment_content[:50] + "..." if len(comment_content) > 50 else comment_content
                },
                "created_at": notification.created_at.isoformat(),
                "is_read": False
            }
            
            await manager.send_personal_message(notification_data, post_author_id)
            
        finally:
            db.close()
    
    @staticmethod
    async def send_friend_request_notification(
        requester_id: int,
        addressee_id: int,
        friendship_id: int
    ):
        """Send real-time notification when someone sends a friend request"""
        db = SessionLocal()
        try:
            requester = db.query(User).filter(User.id == requester_id).first()
            
            if not requester:
                return
            
            # Create notification in database
            notification = Notification(
                recipient_id=addressee_id,
                sender_id=requester_id,
                notification_type="friend_request",
                title="Nova solicitação de amizade",
                message=f"{requester.first_name} {requester.last_name} enviou uma solicitação de amizade",
                data=json.dumps({
                    "friendship_id": friendship_id,
                    "requester": {
                        "id": requester.id,
                        "name": f"{requester.first_name} {requester.last_name}",
                        "avatar": requester.avatar,
                        "username": requester.username
                    }
                })
            )
            
            db.add(notification)
            db.commit()
            db.refresh(notification)
            
            # Send real-time notification
            notification_data = {
                "type": "notification",
                "subtype": "friend_request",
                "id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "sender": {
                    "id": requester.id,
                    "first_name": requester.first_name,
                    "last_name": requester.last_name,
                    "avatar": requester.avatar,
                    "username": requester.username
                },
                "data": {
                    "friendship_id": friendship_id
                },
                "created_at": notification.created_at.isoformat(),
                "is_read": False
            }
            
            await manager.send_personal_message(notification_data, addressee_id)
            
        finally:
            db.close()
    
    @staticmethod
    async def send_friend_accept_notification(
        accepter_id: int,
        requester_id: int,
        friendship_id: int
    ):
        """Send real-time notification when someone accepts a friend request"""
        db = SessionLocal()
        try:
            accepter = db.query(User).filter(User.id == accepter_id).first()
            
            if not accepter:
                return
            
            # Create notification in database
            notification = Notification(
                recipient_id=requester_id,
                sender_id=accepter_id,
                notification_type="friend_accept",
                title="Solicitação aceita",
                message=f"{accepter.first_name} {accepter.last_name} aceitou sua solicitação de amizade",
                data=json.dumps({
                    "friendship_id": friendship_id,
                    "accepter": {
                        "id": accepter.id,
                        "name": f"{accepter.first_name} {accepter.last_name}",
                        "avatar": accepter.avatar,
                        "username": accepter.username
                    }
                })
            )
            
            db.add(notification)
            db.commit()
            db.refresh(notification)
            
            # Send real-time notification
            notification_data = {
                "type": "notification",
                "subtype": "friend_accept",
                "id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "sender": {
                    "id": accepter.id,
                    "first_name": accepter.first_name,
                    "last_name": accepter.last_name,
                    "avatar": accepter.avatar,
                    "username": accepter.username
                },
                "data": {
                    "friendship_id": friendship_id
                },
                "created_at": notification.created_at.isoformat(),
                "is_read": False
            }
            
            await manager.send_personal_message(notification_data, requester_id)
            
        finally:
            db.close()
    
    @staticmethod
    async def send_message_notification(
        sender_id: int,
        recipient_id: int,
        message_id: int,
        message_content: str,
        message_type: str = "text"
    ):
        """Send real-time notification for new message"""
        db = SessionLocal()
        try:
            sender = db.query(User).filter(User.id == sender_id).first()
            
            if not sender:
                return
            
            # Create notification in database
            notification = Notification(
                recipient_id=recipient_id,
                sender_id=sender_id,
                notification_type="message",
                title="Nova mensagem",
                message=f"{sender.first_name} {sender.last_name} enviou uma mensagem",
                data=json.dumps({
                    "message_id": message_id,
                    "message_type": message_type,
                    "message_preview": message_content[:50] + "..." if len(message_content) > 50 else message_content,
                    "sender": {
                        "id": sender.id,
                        "name": f"{sender.first_name} {sender.last_name}",
                        "avatar": sender.avatar,
                        "username": sender.username
                    }
                })
            )
            
            db.add(notification)
            db.commit()
            db.refresh(notification)
            
            # Send real-time notification
            notification_data = {
                "type": "notification",
                "subtype": "message",
                "id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "sender": {
                    "id": sender.id,
                    "first_name": sender.first_name,
                    "last_name": sender.last_name,
                    "avatar": sender.avatar,
                    "username": sender.username
                },
                "data": {
                    "message_id": message_id,
                    "message_type": message_type,
                    "message_preview": message_content[:50] + "..." if len(message_content) > 50 else message_content
                },
                "created_at": notification.created_at.isoformat(),
                "is_read": False
            }
            
            await manager.send_personal_message(notification_data, recipient_id)
            
        finally:
            db.close()
    
    @staticmethod
    async def send_share_notification(
        sharer_id: int,
        post_author_id: int,
        post_id: int,
        share_id: int
    ):
        """Send real-time notification when someone shares a post"""
        if sharer_id == post_author_id:
            return  # Don't notify if user shares their own post
        
        db = SessionLocal()
        try:
            sharer = db.query(User).filter(User.id == sharer_id).first()
            post = db.query(Post).filter(Post.id == post_id).first()
            
            if not sharer or not post:
                return
            
            # Create notification in database
            notification = Notification(
                recipient_id=post_author_id,
                sender_id=sharer_id,
                notification_type="share",
                title="Post compartilhado",
                message=f"{sharer.first_name} {sharer.last_name} compartilhou seu post",
                data=json.dumps({
                    "post_id": post_id,
                    "share_id": share_id,
                    "sharer": {
                        "id": sharer.id,
                        "name": f"{sharer.first_name} {sharer.last_name}",
                        "avatar": sharer.avatar
                    }
                })
            )
            
            db.add(notification)
            db.commit()
            db.refresh(notification)
            
            # Send real-time notification
            notification_data = {
                "type": "notification",
                "subtype": "share",
                "id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "sender": {
                    "id": sharer.id,
                    "first_name": sharer.first_name,
                    "last_name": sharer.last_name,
                    "avatar": sharer.avatar
                },
                "data": {
                    "post_id": post_id,
                    "share_id": share_id
                },
                "created_at": notification.created_at.isoformat(),
                "is_read": False
            }
            
            await manager.send_personal_message(notification_data, post_author_id)
            
        finally:
            db.close()

# Create a global instance
realtime_notifications = RealtimeNotificationService()
