"""
Settings routes for user configuration
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from passlib.context import CryptContext
import json

from core.database import get_db
from models.user import User
from utils.auth import get_current_user
from schemas.user import UserProfileUpdate, PasswordChange, PrivacySettings

router = APIRouter(prefix="/settings", tags=["settings"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.get("/profile")
async def get_profile_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user profile settings"""
    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "username": current_user.username,
        "email": current_user.email,
        "bio": current_user.bio,
        "location": current_user.location,
        "website": current_user.website,
        "work": current_user.work,
        "education": current_user.education,
        "birth_date": current_user.birth_date.isoformat() if current_user.birth_date else None,
        "gender": current_user.gender,
        "relationship_status": current_user.relationship_status,
        "phone": current_user.phone,
        "avatar": current_user.avatar,
        "cover_photo": current_user.cover_photo,
        "is_verified": current_user.is_verified,
        "is_private": current_user.is_private
    }

@router.put("/profile")
async def update_profile_settings(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile settings"""
    
    # Update fields if provided
    if profile_data.first_name is not None:
        current_user.first_name = profile_data.first_name
    if profile_data.last_name is not None:
        current_user.last_name = profile_data.last_name
    if profile_data.username is not None:
        # Check if username is available
        existing = db.query(User).filter(
            User.username == profile_data.username,
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.username = profile_data.username
    
    if profile_data.bio is not None:
        current_user.bio = profile_data.bio
    if profile_data.location is not None:
        current_user.location = profile_data.location
    if profile_data.website is not None:
        current_user.website = profile_data.website
    if profile_data.work is not None:
        current_user.work = profile_data.work
    if profile_data.education is not None:
        current_user.education = profile_data.education
    if profile_data.birth_date is not None:
        current_user.birth_date = profile_data.birth_date
    if profile_data.gender is not None:
        current_user.gender = profile_data.gender
    if profile_data.relationship_status is not None:
        current_user.relationship_status = profile_data.relationship_status
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
    
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Profile updated successfully"}

@router.get("/privacy")
async def get_privacy_settings(
    current_user: User = Depends(get_current_user)
):
    """Get user privacy settings"""
    
    privacy_settings = {}
    if current_user.privacy_settings:
        try:
            privacy_settings = json.loads(current_user.privacy_settings)
        except:
            privacy_settings = {}
    
    # Default privacy settings
    default_settings = {
        "profile_visibility": "public",
        "posts_visibility": "friends",
        "stories_visibility": "friends",
        "friend_list_visibility": "friends",
        "online_status_visibility": "friends",
        "allow_tagging": "friends",
        "allow_mentions": "everyone",
        "allow_messages": "friends",
        "allow_friend_requests": "everyone",
        "search_visibility": "everyone",
        "email_notifications": True,
        "push_notifications": True,
        "notification_types": {
            "likes": True,
            "comments": True,
            "friend_requests": True,
            "messages": True,
            "mentions": True,
            "birthdays": True
        }
    }
    
    # Merge with user settings
    for key, value in default_settings.items():
        if key not in privacy_settings:
            privacy_settings[key] = value
    
    return privacy_settings

@router.put("/privacy")
async def update_privacy_settings(
    settings: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user privacy settings"""
    
    # Validate settings structure
    valid_visibility_options = ["public", "friends", "private", "nobody"]
    
    if "profile_visibility" in settings:
        if settings["profile_visibility"] not in valid_visibility_options:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid profile visibility option"
            )
        current_user.is_private = settings["profile_visibility"] == "private"
    
    # Store privacy settings as JSON
    current_user.privacy_settings = json.dumps(settings)
    
    db.commit()
    
    return {"message": "Privacy settings updated successfully"}

@router.put("/password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    
    # Verify current password
    if not pwd_context.verify(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Hash new password
    new_password_hash = pwd_context.hash(password_data.new_password)
    current_user.password_hash = new_password_hash
    
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.get("/notifications")
async def get_notification_settings(
    current_user: User = Depends(get_current_user)
):
    """Get notification settings"""
    
    notification_settings = {}
    if current_user.notification_settings:
        try:
            notification_settings = json.loads(current_user.notification_settings)
        except:
            notification_settings = {}
    
    # Default notification settings
    default_settings = {
        "email_notifications": True,
        "push_notifications": True,
        "sms_notifications": False,
        "notification_types": {
            "likes": True,
            "comments": True,
            "friend_requests": True,
            "messages": True,
            "mentions": True,
            "shares": True,
            "birthdays": True,
            "events": True,
            "group_activity": True
        },
        "email_frequency": "immediately",  # immediately, hourly, daily, weekly
        "quiet_hours": {
            "enabled": False,
            "start": "22:00",
            "end": "08:00"
        }
    }
    
    # Merge with user settings
    for key, value in default_settings.items():
        if key not in notification_settings:
            notification_settings[key] = value
    
    return notification_settings

@router.put("/notifications")
async def update_notification_settings(
    settings: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update notification settings"""
    
    current_user.notification_settings = json.dumps(settings)
    db.commit()
    
    return {"message": "Notification settings updated successfully"}

@router.get("/account")
async def get_account_settings(
    current_user: User = Depends(get_current_user)
):
    """Get account settings and info"""
    
    return {
        "account_created": current_user.created_at.isoformat(),
        "email_verified": current_user.email_verified,
        "phone_verified": current_user.phone_verified if hasattr(current_user, 'phone_verified') else False,
        "two_factor_enabled": False,  # TODO: Check if 2FA is enabled
        "active_sessions": 1,  # TODO: Count active sessions
        "login_activity": [],  # TODO: Get recent login activity
    }

@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user account (soft delete)"""
    
    # Soft delete - deactivate account
    current_user.is_active = False
    current_user.deactivated_at = datetime.utcnow()
    
    # TODO: Implement data cleanup and anonymization
    
    db.commit()
    
    return {"message": "Account deactivated successfully"}

@router.post("/username/check")
async def check_username_availability(
    username: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if username is available"""
    
    existing = db.query(User).filter(
        User.username == username,
        User.id != current_user.id
    ).first()
    
    return {
        "available": existing is None,
        "username": username
    }
