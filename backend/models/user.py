"""
Modelo de usuário
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Date, Enum
from datetime import datetime
from core.database import Base
import enum

class AccountStatus(enum.Enum):
    pending = "pending"
    active = "active"
    suspended = "suspended"
    banned = "banned"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    display_id = Column(String(20), unique=True, index=True)  # Random ID for URLs
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    gender = Column(String(20))
    birth_date = Column(Date)
    phone = Column(String(20))

    # Profile fields
    username = Column(String(50), unique=True, index=True)
    nickname = Column(String(50))
    bio = Column(Text)
    avatar = Column(String(500))
    cover_photo = Column(String(500))
    location = Column(String(100))
    website = Column(String(200))
    relationship_status = Column(String(20))  # single, in_relationship, married, etc
    work = Column(String(100))
    education = Column(String(100))

    # Privacy settings
    profile_visibility = Column(String(20), default="public")  # public, friends, private
    friend_request_privacy = Column(String(20), default="everyone")  # everyone, friends_of_friends, none
    post_visibility = Column(String(20), default="public")  # public, friends, private
    story_visibility = Column(String(20), default="public")  # public, friends, private
    email_visibility = Column(String(20), default="private")  # public, friends, private
    phone_visibility = Column(String(20), default="private")  # public, friends, private
    birth_date_visibility = Column(String(20), default="friends")  # public, friends, private

    # Notification settings
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    friend_request_notifications = Column(Boolean, default=True)
    comment_notifications = Column(Boolean, default=True)
    reaction_notifications = Column(Boolean, default=True)
    message_notifications = Column(Boolean, default=True)
    story_notifications = Column(Boolean, default=True)

    # Account settings
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    account_status = Column(Enum(AccountStatus), default=AccountStatus.pending)
    account_deactivated = Column(Boolean, default=False)
    deactivated_at = Column(DateTime)

    # Onboarding
    onboarding_completed = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
