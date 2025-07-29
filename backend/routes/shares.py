"""
Shares routes for post sharing functionality
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional

from core.database import get_db
from models.user import User
from models.post import Post
from models.share import Share
from models.notification import Notification
from utils.auth import get_current_user
from utils.notification_helpers import create_notification
from utils.realtime_notifications import realtime_notifications

router = APIRouter(prefix="/shares", tags=["shares"])

@router.post("/posts/{post_id}")
async def share_post(
    post_id: int,
    message: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Share a post"""
    
    # Check if post exists
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if user can see this post (privacy check)
    if post.privacy == "private" and post.author_id != current_user.id:
        # TODO: Add friends check for private posts
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot share private post"
        )
    
    # Check if already shared by this user
    existing_share = db.query(Share).filter(
        Share.user_id == current_user.id,
        Share.post_id == post_id
    ).first()
    
    if existing_share:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post already shared by you"
        )
    
    # Create share record
    share = Share(
        user_id=current_user.id,
        post_id=post_id
    )
    
    db.add(share)
    
    # Update post shares count
    post.shares_count = (post.shares_count or 0) + 1
    
    db.commit()
    db.refresh(share)
    
    # Create notification for post author (if not sharing own post)
    if post.author_id != current_user.id:
        create_notification(
            db=db,
            recipient_id=post.author_id,
            sender_id=current_user.id,
            notification_type="share",
            title="Post compartilhado",
            message=f"{current_user.first_name} {current_user.last_name} compartilhou seu post",
            data={"post_id": post_id, "share_id": share.id}
        )
    
    # If sharing with a message, create a new post that references the original
    shared_post_id = None
    if message:
        shared_post = Post(
            author_id=current_user.id,
            content=message,
            post_type="share",
            shared_post_id=post_id,  # Reference to original post
            privacy="public"  # Default for shares
        )
        
        db.add(shared_post)
        db.commit()
        db.refresh(shared_post)
        shared_post_id = shared_post.id
    
    return {
        "message": "Post shared successfully",
        "share_id": share.id,
        "shared_post_id": shared_post_id,
        "shares_count": post.shares_count
    }

@router.delete("/posts/{post_id}")
async def unshare_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove share from a post"""
    
    share = db.query(Share).filter(
        Share.user_id == current_user.id,
        Share.post_id == post_id
    ).first()
    
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found"
        )
    
    # Update post shares count
    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        post.shares_count = max((post.shares_count or 0) - 1, 0)
    
    db.delete(share)
    db.commit()
    
    return {
        "message": "Share removed successfully",
        "shares_count": post.shares_count if post else 0
    }

@router.get("/posts/{post_id}")
async def get_post_shares(
    post_id: int,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get list of users who shared a post"""
    
    # Check if post exists
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    shares = db.query(Share).filter(
        Share.post_id == post_id
    ).order_by(desc(Share.created_at)).offset(offset).limit(limit).all()
    
    share_list = []
    for share in shares:
        user = share.user
        share_list.append({
            "share_id": share.id,
            "shared_at": share.created_at.isoformat(),
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
                "avatar": user.avatar,
                "is_verified": user.is_verified
            }
        })
    
    return {
        "shares": share_list,
        "total_shares": post.shares_count,
        "has_more": len(share_list) == limit
    }

@router.get("/")
async def get_user_shares(
    user_id: Optional[int] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get posts shared by a user"""
    
    target_user_id = user_id if user_id else current_user.id
    
    shares = db.query(Share).filter(
        Share.user_id == target_user_id
    ).order_by(desc(Share.created_at)).offset(offset).limit(limit).all()
    
    shared_posts = []
    for share in shares:
        post = share.post
        shared_posts.append({
            "share_id": share.id,
            "shared_at": share.created_at.isoformat(),
            "post": {
                "id": post.id,
                "content": post.content,
                "author": {
                    "id": post.author.id,
                    "first_name": post.author.first_name,
                    "last_name": post.author.last_name,
                    "username": post.author.username,
                    "avatar": post.author.avatar
                },
                "media_url": post.media_url,
                "media_type": post.media_type,
                "created_at": post.created_at.isoformat(),
                "reactions_count": post.reactions_count,
                "comments_count": post.comments_count,
                "shares_count": post.shares_count
            }
        })
    
    return {
        "shares": shared_posts,
        "total": len(shared_posts),
        "has_more": len(shared_posts) == limit
    }

@router.get("/check/{post_id}")
async def check_share_status(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user has shared a post"""
    
    share = db.query(Share).filter(
        Share.user_id == current_user.id,
        Share.post_id == post_id
    ).first()
    
    return {
        "is_shared": share is not None,
        "share_id": share.id if share else None,
        "shared_at": share.created_at.isoformat() if share else None
    }

@router.get("/stats/{post_id}")
async def get_share_stats(
    post_id: int,
    db: Session = Depends(get_db)
):
    """Get sharing statistics for a post"""
    
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Get share count by time periods
    from datetime import datetime, timedelta
    
    now = datetime.utcnow()
    shares_24h = db.query(Share).filter(
        Share.post_id == post_id,
        Share.created_at >= now - timedelta(hours=24)
    ).count()
    
    shares_7d = db.query(Share).filter(
        Share.post_id == post_id,
        Share.created_at >= now - timedelta(days=7)
    ).count()
    
    return {
        "total_shares": post.shares_count,
        "shares_24h": shares_24h,
        "shares_7d": shares_7d,
        "share_rate": round(post.shares_count / max(post.reactions_count, 1) * 100, 2)
    }
