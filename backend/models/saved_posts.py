"""
Modelos para sistema de posts salvos com pastas/coleções
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class SavedPostCollection(Base):
    """Pastas/coleções para organizar posts salvos"""
    __tablename__ = "saved_post_collections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)  # Nome da pasta
    description = Column(Text)  # Descrição opcional
    is_default = Column(Boolean, default=False)  # Pasta padrão "Salvos"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", backref="saved_collections")

class SavedPost(Base):
    """Posts salvos pelo usuário"""
    __tablename__ = "saved_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    collection_id = Column(Integer, ForeignKey("saved_post_collections.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", backref="saved_posts")
    post = relationship("Post", backref="saved_by_users")
    collection = relationship("SavedPostCollection", backref="saved_posts")

class CommentReaction(Base):
    """Reações específicas para comentários"""
    __tablename__ = "comment_reactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False)
    reaction_type = Column(String(20), nullable=False)  # like, love, haha, wow, sad, angry
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", backref="comment_reactions")
    comment = relationship("Comment", backref="reactions")
