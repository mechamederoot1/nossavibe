"""
Schemas/DTOs da aplicação
"""
from .auth import LoginRequest, Token, PasswordUpdate
from .user import (
    UserBase, UserCreate, UserResponse, UserProfileUpdate,
    PrivacySettings, NotificationSettings
)
from .post import (
    PostCreate, PostResponse, ReactionCreate, 
    CommentCreate, CommentResponse, ShareCreate
)
from .story import (
    StoryCreate, StoryResponse, StoryTagCreate,
    StoryOverlayCreate, StoryWithEditor
)
from .misc import (
    FriendshipCreate, BlockCreate, FollowCreate,
    MessageCreate, MessageResponse, NotificationResponse,
    MediaUploadResponse
)

__all__ = [
    # Auth
    "LoginRequest", "Token", "PasswordUpdate",
    # User
    "UserBase", "UserCreate", "UserResponse", "UserProfileUpdate",
    "PrivacySettings", "NotificationSettings",
    # Post
    "PostCreate", "PostResponse", "ReactionCreate", 
    "CommentCreate", "CommentResponse", "ShareCreate",
    # Story
    "StoryCreate", "StoryResponse", "StoryTagCreate",
    "StoryOverlayCreate", "StoryWithEditor",
    # Misc
    "FriendshipCreate", "BlockCreate", "FollowCreate",
    "MessageCreate", "MessageResponse", "NotificationResponse",
    "MediaUploadResponse"
]
