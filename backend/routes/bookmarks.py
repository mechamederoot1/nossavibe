"""
Bookmarks routes for saved posts functionality
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from core.database import get_db
from models.user import User
from models.post import Post
from models.bookmark import Bookmark
from utils.auth import get_current_user

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])

@router.post("/posts/{post_id}")
async def bookmark_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bookmark a post"""
    
    # Check if post exists
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if already bookmarked
    existing_bookmark = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.post_id == post_id
    ).first()
    
    if existing_bookmark:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post already bookmarked"
        )
    
    # Create bookmark
    bookmark = Bookmark(
        user_id=current_user.id,
        post_id=post_id
    )
    
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    
    return {
        "message": "Post bookmarked successfully",
        "bookmark_id": bookmark.id
    }

@router.delete("/posts/{post_id}")
async def remove_bookmark(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove bookmark from a post"""
    
    bookmark = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.post_id == post_id
    ).first()
    
    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark not found"
        )
    
    db.delete(bookmark)
    db.commit()
    
    return {"message": "Bookmark removed successfully"}

@router.get("/")
async def get_bookmarked_posts(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's bookmarked posts"""
    
    bookmarks = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id
    ).order_by(desc(Bookmark.created_at)).offset(offset).limit(limit).all()
    
    bookmarked_posts = []
    for bookmark in bookmarks:
        post = bookmark.post
        bookmarked_posts.append({
            "bookmark_id": bookmark.id,
            "bookmarked_at": bookmark.created_at.isoformat(),
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
        "bookmarks": bookmarked_posts,
        "total": len(bookmarked_posts),
        "has_more": len(bookmarked_posts) == limit
    }

@router.get("/check/{post_id}")
async def check_bookmark_status(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if a post is bookmarked by current user"""
    
    bookmark = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.post_id == post_id
    ).first()
    
    return {
        "is_bookmarked": bookmark is not None,
        "bookmark_id": bookmark.id if bookmark else None
    }

@router.get("/count")
async def get_bookmarks_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get total number of bookmarked posts"""
    
    count = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id
    ).count()
    
    return {"total_bookmarks": count}
