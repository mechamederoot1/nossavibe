"""
Hashtag models
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class Hashtag(Base):
    __tablename__ = "hashtags"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class PostHashtag(Base):
    __tablename__ = "post_hashtags"
    __table_args__ = (
        UniqueConstraint('post_id', 'hashtag_id', name='unique_post_hashtag'),
        {'extend_existing': True}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    hashtag_id = Column(Integer, ForeignKey("hashtags.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    post = relationship("Post", backref="hashtags")
    hashtag = relationship("Hashtag", backref="posts")
