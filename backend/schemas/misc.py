"""
Schemas diversos (amizades, mensagens, notificações, etc.)
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

# Friendship schemas
class FriendshipCreate(BaseModel):
    addressee_id: int

class BlockCreate(BaseModel):
    blocked_id: int

class FollowCreate(BaseModel):
    followed_id: int

# Message schemas
class MessageCreate(BaseModel):
    recipient_id: int
    content: Optional[str] = None
    message_type: str = "text"  # text, image, video, audio, file, sticker
    media_url: Optional[str] = None
    media_metadata: Optional[str] = None

class MessageResponse(BaseModel):
    id: int
    sender: Dict[str, Any]
    content: Optional[str]
    message_type: str
    media_url: Optional[str]
    is_read: bool
    created_at: str
    is_own: bool

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    user: Dict[str, Any]
    unread_count: int
    last_message: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class UserSender(BaseModel):
    id: int
    first_name: str
    last_name: str
    avatar: Optional[str] = None

class LastMessage(BaseModel):
    content: Optional[str]
    message_type: str
    created_at: str
    is_read: bool
    is_own: bool

# Notification schemas
class NotificationResponse(BaseModel):
    id: int
    notification_type: str
    title: str
    message: str
    data: Optional[str] = None
    is_read: bool
    created_at: datetime
    sender: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

# Media schemas
class MediaUploadResponse(BaseModel):
    id: int
    filename: str
    file_path: str
    file_type: str
    file_size: int
    mime_type: str
    upload_date: datetime

    class Config:
        from_attributes = True
