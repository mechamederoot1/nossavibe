"""
Schemas de stories
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class StoryCreate(BaseModel):
    content: Optional[str] = None
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    background_color: Optional[str] = None
    duration_hours: int = 24
    max_duration_seconds: int = 25  # Para vídeos
    archived: bool = False

class StoryResponse(BaseModel):
    id: int
    author: Dict[str, Any]
    content: Optional[str] = None
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    background_color: Optional[str] = None
    created_at: datetime
    expires_at: datetime
    views_count: int
    
    class Config:
        from_attributes = True

class StoryTagCreate(BaseModel):
    story_id: int
    tagged_user_id: int
    position_x: int = 50
    position_y: int = 50

class StoryOverlayCreate(BaseModel):
    story_id: int
    overlay_type: str  # text, emoji, sticker, drawing
    content: str
    position_x: int = 50
    position_y: int = 50
    rotation: int = 0
    scale: int = 100
    color: Optional[str] = None
    font_family: Optional[str] = None
    font_size: int = 16

class StoryWithEditor(BaseModel):
    """Story com editor mobile - incluindo tags e overlays"""
    content: Optional[str] = None
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    background_color: Optional[str] = None
    duration_hours: int = 24
    max_duration_seconds: int = 25
    tags: List[StoryTagCreate] = []
    overlays: List[StoryOverlayCreate] = []
