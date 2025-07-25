"""
Modelos de notificações e mensagens
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from core.database import Base

class NotificationType(enum.Enum):
    # Friend-related notifications
    FRIEND_REQUEST = "friend_request"
    FRIEND_REQUEST_ACCEPTED = "friend_request_accepted"
    FRIEND_REQUEST_REJECTED = "friend_request_rejected"

    # Follow notifications
    NEW_FOLLOWER = "new_follower"

    # Post interactions
    POST_REACTION = "post_reaction"
    POST_COMMENT = "post_comment"
    POST_SHARE = "post_share"
    POST_MENTION = "post_mention"

    # Story interactions
    STORY_REACTION = "story_reaction"
    STORY_VIEW = "story_view"

    # Comment interactions
    COMMENT_REACTION = "comment_reaction"
    COMMENT_REPLY = "comment_reply"

    # System notifications
    WELCOME = "welcome"
    ACCOUNT_VERIFIED = "account_verified"
    PASSWORD_CHANGED = "password_changed"

    # General
    BIRTHDAY_REMINDER = "birthday_reminder"
    ANNIVERSARY = "anniversary"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"))
    notification_type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)

    # Reference to related entities
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    comment_id = Column(Integer, nullable=True)  # For comment-related notifications
    story_id = Column(Integer, nullable=True)    # For story-related notifications
    friendship_id = Column(Integer, ForeignKey("friendships.id"), nullable=True)

    # Additional data as JSON
    data = Column(Text)  # JSON data for extra information

    # Status
    is_read = Column(Boolean, default=False)
    is_clicked = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)
    clicked_at = Column(DateTime, nullable=True)

    # Relationships
    recipient = relationship("User", foreign_keys=[recipient_id], backref="received_notifications")
    sender = relationship("User", foreign_keys=[sender_id], backref="sent_notifications")
    post = relationship("Post", foreign_keys=[post_id], backref="notifications")
    friendship = relationship("Friendship", foreign_keys=[friendship_id], backref="notifications")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text)
    message_type = Column(String(20), default="text")  # text, image, video, audio, file
    media_url = Column(String(500))
    media_metadata = Column(Text)  # JSON metadata
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], backref="received_messages")

class MediaFile(Base):
    __tablename__ = "media_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255))
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    file_type = Column(String(20))  # image, video, audio, document
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)

    uploader = relationship("User", backref="uploaded_files")
