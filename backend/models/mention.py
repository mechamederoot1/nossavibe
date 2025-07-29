"""
Mention model for user mentions in posts
"""
from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint, String
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class PostMention(Base):
    __tablename__ = "post_mentions"
    __table_args__ = (
        UniqueConstraint('post_id', 'mentioned_user_id', name='unique_post_mention'),
        {'extend_existing': True}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    mentioned_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mentioned_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mention_text = Column(String(100))  # The actual mention text (e.g., "@username")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    post = relationship("Post", backref="mentions")
    mentioned_user = relationship("User", foreign_keys=[mentioned_user_id], backref="mentions_received")
    mentioned_by = relationship("User", foreign_keys=[mentioned_by_user_id], backref="mentions_made")

class CommentMention(Base):
    __tablename__ = "comment_mentions"
    __table_args__ = (
        UniqueConstraint('comment_id', 'mentioned_user_id', name='unique_comment_mention'),
        {'extend_existing': True}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False)
    mentioned_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mentioned_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mention_text = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    comment = relationship("Comment", backref="mentions")
    mentioned_user = relationship("User", foreign_keys=[mentioned_user_id], backref="comment_mentions_received")
    mentioned_by = relationship("User", foreign_keys=[mentioned_by_user_id], backref="comment_mentions_made")
