"""
Schemas de posts
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class PostCreate(BaseModel):
    content: str
    post_type: str = "post"
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    media_metadata: Optional[str] = None
    privacy: str = "public"  # public, friends, private
    is_profile_update: Optional[bool] = False
    is_cover_update: Optional[bool] = False

class PostResponse(BaseModel):
    id: int
    author: Dict[str, Any]
    content: str
    post_type: str
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    created_at: datetime
    reactions_count: int
    comments_count: int
    shares_count: int
    is_profile_update: Optional[bool] = False
    is_cover_update: Optional[bool] = False
    
    class Config:
        from_attributes = True

class ReactionCreate(BaseModel):
    post_id: int
    reaction_type: str

class CommentCreate(BaseModel):
    content: str
    post_id: int
    parent_id: Optional[int] = None

class CommentResponse(BaseModel):
    id: int
    content: str
    author: Dict[str, Any]
    created_at: datetime
    reactions_count: int = 0
    replies: List['CommentResponse'] = []
    
    class Config:
        from_attributes = True

class ShareCreate(BaseModel):
    post_id: int
