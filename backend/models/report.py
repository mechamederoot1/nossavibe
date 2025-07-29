"""
Report model for content moderation system
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.models.base import Base

class Report(Base):
    __tablename__ = "reports"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reported_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reported_post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    reported_comment_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    
    report_type = Column(
        Enum('spam', 'harassment', 'hate_speech', 'violence', 'nudity', 'fake_account', 'intellectual_property', 'other', name="report_types"),
        nullable=False
    )
    reason = Column(Text)
    
    status = Column(
        Enum('pending', 'investigating', 'resolved', 'dismissed', name="report_status"),
        default='pending'
    )
    
    moderator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    moderator_notes = Column(Text)
    
    action_taken = Column(
        Enum('none', 'warning', 'content_removed', 'account_suspended', 'account_banned', name="moderation_actions"),
        default='none'
    )
    
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reports_made")
    reported_user = relationship("User", foreign_keys=[reported_user_id], back_populates="reports_received")
    moderator = relationship("User", foreign_keys=[moderator_id], back_populates="moderated_reports")
    reported_post = relationship("Post", back_populates="reports")
    reported_comment = relationship("Comment", back_populates="reports")
