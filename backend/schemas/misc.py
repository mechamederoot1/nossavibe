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
    message_type: str = "text"  # text, image, video, audio, file
    media_url: Optional[str] = None
    media_metadata: Optional[str] = None

class MessageResponse(BaseModel):
    id: int
    sender: Dict[str, Any]
    recipient: Dict[str, Any]
    content: Optional[str]
    message_type: str
    media_url: Optional[str]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

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
