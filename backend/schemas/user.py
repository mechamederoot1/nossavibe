"""
Schemas de usuário
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, Union
from datetime import datetime, date

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    gender: Optional[str] = None
    birth_date: Optional[str] = None
    phone: Optional[str] = None
    username: Optional[str] = None
    nickname: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    cover_photo: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    relationship_status: Optional[str] = None
    work: Optional[str] = None
    education: Optional[str] = None

class UserCreate(UserBase):
    password: str

    def get_birth_date_as_date(self) -> Optional[date]:
        """Converte birth_date string para objeto date"""
        if self.birth_date:
            try:
                # Assume formato YYYY-MM-DD
                year, month, day = map(int, self.birth_date.split('-'))
                return date(year, month, day)
            except (ValueError, AttributeError):
                return None
        return None

class UserResponse(UserBase):
    id: int
    display_id: Optional[str] = None
    birth_date: Optional[Union[str, date]] = None
    is_active: bool
    onboarding_completed: bool = False
    created_at: datetime
    last_seen: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            date: lambda v: v.isoformat() if v else None
        }

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    nickname: Optional[str] = None
    bio: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    cover_photo: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    birth_date: Optional[str] = None
    gender: Optional[str] = None
    relationship_status: Optional[str] = None
    work: Optional[str] = None
    education: Optional[str] = None

class PrivacySettings(BaseModel):
    profile_visibility: Optional[str] = None
    friend_request_privacy: Optional[str] = None
    post_visibility: Optional[str] = None
    story_visibility: Optional[str] = None
    email_visibility: Optional[str] = None
    phone_visibility: Optional[str] = None
    birth_date_visibility: Optional[str] = None

class NotificationSettings(BaseModel):
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    friend_request_notifications: Optional[bool] = None
    comment_notifications: Optional[bool] = None
    reaction_notifications: Optional[bool] = None
    message_notifications: Optional[bool] = None
    story_notifications: Optional[bool] = None
