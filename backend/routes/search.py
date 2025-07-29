"""
Search routes for global search functionality
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from typing import List, Optional
from datetime import datetime, timedelta

from core.database import get_db
from models.user import User
from models.post import Post
from models.story import Story
from models.hashtag import Hashtag, PostHashtag
from utils.auth import get_current_user
from schemas.misc import SearchResults

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/")
async def global_search(
    q: str = Query(..., min_length=1, description="Search query"),
    type: Optional[str] = Query(None, description="Search type: users, posts, hashtags, all"),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Global search across users, posts, and hashtags"""
    
    results = {
        "query": q,
        "users": [],
        "posts": [],
        "hashtags": [],
        "total": 0
    }
    
    search_term = f"%{q}%"
    
    if type in [None, "all", "users"]:
        # Search users
        users_query = db.query(User).filter(
            and_(
                User.is_active == True,
                or_(
                    User.first_name.ilike(search_term),
                    User.last_name.ilike(search_term),
                    User.username.ilike(search_term),
                    User.bio.ilike(search_term)
                )
            )
        ).order_by(
            # Prioritize exact username matches
            func.case(
                (User.username.ilike(q), 1),
                (func.concat(User.first_name, ' ', User.last_name).ilike(search_term), 2),
                else_=3
            )
        )
        
        if type == "users":
            users_query = users_query.offset(offset).limit(limit)
        else:
            users_query = users_query.limit(10)
            
        users = users_query.all()
        
        for user in users:
            results["users"].append({
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
                "avatar": user.avatar,
                "bio": user.bio,
                "is_verified": user.is_verified,
                "is_private": user.is_private,
                "followers_count": getattr(user, 'followers_count', 0)
            })
    
    if type in [None, "all", "posts"]:
        # Search posts (only public and friends' posts)
        posts_query = db.query(Post).filter(
            and_(
                Post.content.ilike(search_term),
                or_(
                    Post.privacy == "public",
                    # TODO: Add friends check
                    Post.author_id == current_user.id
                )
            )
        ).order_by(desc(Post.created_at))
        
        if type == "posts":
            posts_query = posts_query.offset(offset).limit(limit)
        else:
            posts_query = posts_query.limit(10)
            
        posts = posts_query.all()
        
        for post in posts:
            results["posts"].append({
                "id": post.id,
                "content": post.content[:200] + "..." if len(post.content) > 200 else post.content,
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
                "comments_count": post.comments_count
            })
    
    if type in [None, "all", "hashtags"]:
        # Search hashtags
        hashtags_query = db.query(Hashtag).filter(
            Hashtag.name.ilike(search_term)
        ).order_by(desc(Hashtag.usage_count))
        
        if type == "hashtags":
            hashtags_query = hashtags_query.offset(offset).limit(limit)
        else:
            hashtags_query = hashtags_query.limit(10)
            
        hashtags = hashtags_query.all()
        
        for hashtag in hashtags:
            results["hashtags"].append({
                "id": hashtag.id,
                "name": hashtag.name,
                "usage_count": hashtag.usage_count
            })
    
    results["total"] = len(results["users"]) + len(results["posts"]) + len(results["hashtags"])
    
    return results

@router.get("/users")
async def search_users(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search users specifically"""
    
    search_term = f"%{q}%"
    
    users = db.query(User).filter(
        and_(
            User.is_active == True,
            or_(
                User.first_name.ilike(search_term),
                User.last_name.ilike(search_term),
                User.username.ilike(search_term),
                User.bio.ilike(search_term)
            )
        )
    ).order_by(
        func.case(
            (User.username.ilike(q), 1),
            (func.concat(User.first_name, ' ', User.last_name).ilike(search_term), 2),
            else_=3
        )
    ).offset(offset).limit(limit).all()
    
    return [
        {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "avatar": user.avatar,
            "bio": user.bio,
            "is_verified": user.is_verified,
            "is_private": user.is_private,
            "mutual_friends": 0  # TODO: Calculate mutual friends
        }
        for user in users
    ]

@router.get("/posts")
async def search_posts(
    q: str = Query(..., min_length=1),
    hashtag: Optional[str] = Query(None),
    author_id: Optional[int] = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search posts with filters"""
    
    query = db.query(Post)
    
    # Text search
    if q:
        query = query.filter(Post.content.ilike(f"%{q}%"))
    
    # Hashtag filter
    if hashtag:
        query = query.join(PostHashtag).join(Hashtag).filter(
            Hashtag.name == hashtag.lstrip('#')
        )
    
    # Author filter
    if author_id:
        query = query.filter(Post.author_id == author_id)
    
    # Privacy filter
    query = query.filter(
        or_(
            Post.privacy == "public",
            Post.author_id == current_user.id
            # TODO: Add friends check
        )
    )
    
    posts = query.order_by(desc(Post.created_at)).offset(offset).limit(limit).all()
    
    return [
        {
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
        for post in posts
    ]

@router.get("/hashtags")
async def search_hashtags(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Search hashtags"""
    
    hashtags = db.query(Hashtag).filter(
        Hashtag.name.ilike(f"%{q}%")
    ).order_by(desc(Hashtag.usage_count)).offset(offset).limit(limit).all()
    
    return [
        {
            "id": hashtag.id,
            "name": hashtag.name,
            "usage_count": hashtag.usage_count,
            "recent_posts": []  # TODO: Get recent posts with this hashtag
        }
        for hashtag in hashtags
    ]

@router.get("/trending")
async def get_trending_content(
    type: Optional[str] = Query("all", description="Type: hashtags, posts, users"),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db)
):
    """Get trending content"""
    
    results = {}
    
    if type in ["all", "hashtags"]:
        # Trending hashtags (most used in last 7 days)
        trending_hashtags = db.query(Hashtag).join(PostHashtag).join(Post).filter(
            Post.created_at >= datetime.utcnow() - timedelta(days=7)
        ).group_by(Hashtag.id).order_by(
            desc(func.count(PostHashtag.id))
        ).limit(limit).all()
        
        results["hashtags"] = [
            {
                "id": hashtag.id,
                "name": hashtag.name,
                "usage_count": hashtag.usage_count,
                "trend_score": 100  # TODO: Calculate actual trend score
            }
            for hashtag in trending_hashtags
        ]
    
    if type in ["all", "posts"]:
        # Trending posts (most engagement in last 24h)
        trending_posts = db.query(Post).filter(
            and_(
                Post.created_at >= datetime.utcnow() - timedelta(hours=24),
                Post.privacy == "public"
            )
        ).order_by(
            desc(Post.reactions_count + Post.comments_count + Post.shares_count)
        ).limit(limit).all()
        
        results["posts"] = [
            {
                "id": post.id,
                "content": post.content[:200] + "..." if len(post.content) > 200 else post.content,
                "author": {
                    "id": post.author.id,
                    "first_name": post.author.first_name,
                    "last_name": post.author.last_name,
                    "username": post.author.username,
                    "avatar": post.author.avatar
                },
                "engagement_score": post.reactions_count + post.comments_count + post.shares_count,
                "created_at": post.created_at.isoformat()
            }
            for post in trending_posts
        ]
    
    if type in ["all", "users"]:
        # Trending users (most new followers in last 7 days)
        # TODO: Implement follower tracking
        results["users"] = []
    
    return results

@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get search suggestions as user types"""
    
    suggestions = {
        "users": [],
        "hashtags": [],
        "recent_searches": []  # TODO: Implement search history
    }
    
    search_term = f"{q}%"
    
    # User suggestions
    users = db.query(User).filter(
        and_(
            User.is_active == True,
            or_(
                User.username.ilike(search_term),
                func.concat(User.first_name, ' ', User.last_name).ilike(search_term)
            )
        )
    ).order_by(User.username).limit(5).all()
    
    suggestions["users"] = [
        {
            "id": user.id,
            "display_name": f"{user.first_name} {user.last_name}",
            "username": user.username,
            "avatar": user.avatar
        }
        for user in users
    ]
    
    # Hashtag suggestions
    hashtags = db.query(Hashtag).filter(
        Hashtag.name.ilike(search_term)
    ).order_by(desc(Hashtag.usage_count)).limit(5).all()
    
    suggestions["hashtags"] = [
        {
            "id": hashtag.id,
            "name": hashtag.name,
            "usage_count": hashtag.usage_count
        }
        for hashtag in hashtags
    ]
    
    return suggestions
