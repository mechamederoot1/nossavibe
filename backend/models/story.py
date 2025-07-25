"""
Modelos relacionados a stories
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class Story(Base):
    __tablename__ = "stories"
    
    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text)
    media_type = Column(String(50))
    media_url = Column(String(500))
    background_color = Column(String(7))
    duration_hours = Column(Integer, default=24)
    max_duration_seconds = Column(Integer, default=25)  # Para vídeos
    archived = Column(Boolean, default=False)
    archived_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    views_count = Column(Integer, default=0)
    
    author = relationship("User", backref="stories")

class StoryView(Base):
    __tablename__ = "story_views"
    
    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=False)
    viewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    viewed_at = Column(DateTime, default=datetime.utcnow)
    
    story = relationship("Story", backref="views")
    viewer = relationship("User", backref="story_views")

class StoryTag(Base):
    __tablename__ = "story_tags"

    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=False)
    tagged_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    position_x = Column(Integer, default=50)  # Posição X em percentual (0-100)
    position_y = Column(Integer, default=50)  # Posição Y em percentual (0-100)
    created_at = Column(DateTime, default=datetime.utcnow)

    story = relationship("Story", backref="tags")
    tagged_user = relationship("User", backref="story_tags")

class StoryOverlay(Base):
    __tablename__ = "story_overlays"

    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=False)
    overlay_type = Column(String(20), nullable=False)  # text, emoji, sticker, drawing
    content = Column(Text)  # Texto ou dados do overlay
    position_x = Column(Integer, default=50)  # Posição X em percentual
    position_y = Column(Integer, default=50)  # Posição Y em percentual
    rotation = Column(Integer, default=0)  # Rotação em graus
    scale = Column(Integer, default=100)  # Escala em percentual
    color = Column(String(7))  # Cor em hex
    font_family = Column(String(50))  # Família da fonte
    font_size = Column(Integer, default=16)  # Tamanho da fonte
    created_at = Column(DateTime, default=datetime.utcnow)

    story = relationship("Story", backref="overlays")
