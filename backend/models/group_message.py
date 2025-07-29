"""
Group messaging models
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class ChatGroup(Base):
    __tablename__ = "chat_groups"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    group_avatar = Column(String(500))
    is_private = Column(Boolean, default=True)
    max_members = Column(Integer, default=100)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    creator = relationship("User", backref="created_groups")

class GroupMember(Base):
    __tablename__ = "group_members"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("chat_groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), default="member")  # member, admin, moderator
    joined_at = Column(DateTime, default=datetime.utcnow)
    added_by_id = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    last_read_message_id = Column(Integer, ForeignKey("group_messages.id"))
    
    group = relationship("ChatGroup", backref="members")
    user = relationship("User", backref="group_memberships")
    added_by = relationship("User", foreign_keys=[added_by_id])

class GroupMessage(Base):
    __tablename__ = "group_messages"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("chat_groups.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text)
    message_type = Column(String(20), default="text")  # text, image, video, audio, file
    media_url = Column(String(500))
    reply_to_message_id = Column(Integer, ForeignKey("group_messages.id"))
    is_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    group = relationship("ChatGroup", backref="messages")
    sender = relationship("User", backref="group_messages")
    reply_to = relationship("GroupMessage", remote_side=[id])

class MessageReaction(Base):
    __tablename__ = "message_reactions"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"))
    group_message_id = Column(Integer, ForeignKey("group_messages.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reaction_type = Column(String(20), nullable=False)  # like, love, laugh, angry, sad, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    
    message = relationship("Message", backref="reactions")
    group_message = relationship("GroupMessage", backref="reactions")
    user = relationship("User", backref="message_reactions")

class MessageReadStatus(Base):
    __tablename__ = "message_read_status"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"))
    group_message_id = Column(Integer, ForeignKey("group_messages.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    read_at = Column(DateTime, default=datetime.utcnow)
    
    message = relationship("Message", backref="read_status")
    group_message = relationship("GroupMessage", backref="read_status")
    user = relationship("User", backref="message_reads")
