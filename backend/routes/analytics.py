"""
Analytics and insights routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
import calendar

from backend.core.database import get_db
from backend.utils.auth import get_current_user
from backend.models.user import User
from backend.models.post import Post, Reaction, Comment
from backend.models.story import Story, StoryView
from backend.models.friendship import Friendship, Follow
from backend.models.message import Message
from backend.models.album import Album
from backend.models.analytics import UserAnalytics, PostAnalytics

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/profile/overview")
async def get_profile_overview(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile analytics overview"""
    
    since_date = datetime.utcnow() - timedelta(days=days)
    
    # Basic counts
    total_posts = db.query(Post).filter(Post.user_id == current_user.id).count()
    posts_in_period = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.created_at >= since_date
    ).count()
    
    total_stories = db.query(Story).filter(Story.user_id == current_user.id).count()
    stories_in_period = db.query(Story).filter(
        Story.user_id == current_user.id,
        Story.created_at >= since_date
    ).count()
    
    # Followers/Following counts
    followers_count = db.query(Follow).filter(Follow.following_id == current_user.id).count()
    following_count = db.query(Follow).filter(Follow.follower_id == current_user.id).count()
    
    # Friends count
    friends_count = db.query(Friendship).filter(
        or_(
            Friendship.requester_id == current_user.id,
            Friendship.addressee_id == current_user.id
        ),
        Friendship.status == 'accepted'
    ).count()
    
    # Engagement metrics for user's posts
    user_posts = db.query(Post.id).filter(Post.user_id == current_user.id).subquery()
    
    total_likes = db.query(Reaction).filter(
        Reaction.post_id.in_(db.query(user_posts.c.id)),
        Reaction.reaction_type == 'like'
    ).count()
    
    total_comments = db.query(Comment).filter(
        Comment.post_id.in_(db.query(user_posts.c.id))
    ).count()
    
    # Recent activity
    recent_posts = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.created_at >= since_date
    ).order_by(desc(Post.created_at)).limit(5).all()
    
    return {
        "success": True,
        "overview": {
            "period_days": days,
            "content": {
                "total_posts": total_posts,
                "posts_this_period": posts_in_period,
                "total_stories": total_stories,
                "stories_this_period": stories_in_period
            },
            "social": {
                "followers": followers_count,
                "following": following_count,
                "friends": friends_count
            },
            "engagement": {
                "total_likes_received": total_likes,
                "total_comments_received": total_comments,
                "avg_likes_per_post": round(total_likes / max(total_posts, 1), 2),
                "avg_comments_per_post": round(total_comments / max(total_posts, 1), 2)
            },
            "recent_activity": [
                {
                    "id": post.id,
                    "content": post.content[:100] + "..." if len(post.content) > 100 else post.content,
                    "created_at": post.created_at,
                    "likes_count": db.query(Reaction).filter(
                        Reaction.post_id == post.id,
                        Reaction.reaction_type == 'like'
                    ).count(),
                    "comments_count": db.query(Comment).filter(Comment.post_id == post.id).count()
                }
                for post in recent_posts
            ]
        }
    }

@router.get("/posts/insights")
async def get_posts_insights(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed insights about user's posts performance"""
    
    since_date = datetime.utcnow() - timedelta(days=days)
    
    # Get posts in period with engagement data
    posts_query = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.created_at >= since_date
    ).order_by(desc(Post.created_at))
    
    posts = posts_query.all()
    
    posts_insights = []
    for post in posts:
        likes_count = db.query(Reaction).filter(
            Reaction.post_id == post.id,
            Reaction.reaction_type == 'like'
        ).count()
        
        comments_count = db.query(Comment).filter(Comment.post_id == post.id).count()
        
        # Calculate engagement rate (likes + comments / followers)
        engagement_rate = ((likes_count + comments_count) / max(1, followers_count)) * 100 if 'followers_count' in locals() else 0
        
        posts_insights.append({
            "id": post.id,
            "content": post.content[:100] + "..." if len(post.content) > 100 else post.content,
            "created_at": post.created_at,
            "likes_count": likes_count,
            "comments_count": comments_count,
            "engagement_rate": round(engagement_rate, 2),
            "has_images": bool(post.image_urls)
        })
    
    # Best performing posts
    best_posts = sorted(posts_insights, key=lambda x: x['likes_count'] + x['comments_count'], reverse=True)[:5]
    
    # Posting patterns
    posts_by_hour = {}
    posts_by_day = {}
    
    for post in posts:
        hour = post.created_at.hour
        day = post.created_at.strftime('%A')
        
        posts_by_hour[hour] = posts_by_hour.get(hour, 0) + 1
        posts_by_day[day] = posts_by_day.get(day, 0) + 1
    
    # Average engagement
    total_likes = sum(p['likes_count'] for p in posts_insights)
    total_comments = sum(p['comments_count'] for p in posts_insights)
    
    return {
        "success": True,
        "insights": {
            "period_days": days,
            "total_posts": len(posts),
            "average_engagement": {
                "likes_per_post": round(total_likes / max(len(posts), 1), 2),
                "comments_per_post": round(total_comments / max(len(posts), 1), 2)
            },
            "best_performing_posts": best_posts,
            "posting_patterns": {
                "by_hour": [{"hour": h, "posts": c} for h, c in sorted(posts_by_hour.items())],
                "by_day": [{"day": d, "posts": c} for d, c in posts_by_day.items()]
            },
            "content_analysis": {
                "posts_with_images": len([p for p in posts_insights if p['has_images']]),
                "posts_text_only": len([p for p in posts_insights if not p['has_images']])
            }
        }
    }

@router.get("/audience/demographics")
async def get_audience_demographics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get audience demographics and engagement patterns"""
    
    # Get followers
    followers = db.query(User).join(
        Follow, and_(Follow.follower_id == User.id, Follow.following_id == current_user.id)
    ).all()
    
    # Get users who engaged with posts
    engaged_users = db.query(User).join(
        Reaction, Reaction.user_id == User.id
    ).join(
        Post, and_(Post.id == Reaction.post_id, Post.user_id == current_user.id)
    ).distinct().all()
    
    # Analyze engagement patterns
    engagement_by_user = {}
    user_posts = db.query(Post).filter(Post.user_id == current_user.id).all()
    
    for post in user_posts:
        reactions = db.query(Reaction).filter(Reaction.post_id == post.id).all()
        comments = db.query(Comment).filter(Comment.post_id == post.id).all()
        
        for reaction in reactions:
            user_id = reaction.user_id
            engagement_by_user[user_id] = engagement_by_user.get(user_id, 0) + 1
        
        for comment in comments:
            user_id = comment.user_id
            engagement_by_user[user_id] = engagement_by_user.get(user_id, 0) + 1
    
    # Top engaging users
    top_engaging_users = sorted(engagement_by_user.items(), key=lambda x: x[1], reverse=True)[:10]
    
    top_users_info = []
    for user_id, engagement_count in top_engaging_users:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            top_users_info.append({
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "avatar_url": user.avatar_url,
                "engagement_count": engagement_count
            })
    
    return {
        "success": True,
        "audience": {
            "total_followers": len(followers),
            "total_engaged_users": len(engaged_users),
            "engagement_rate": round((len(engaged_users) / max(len(followers), 1)) * 100, 2),
            "top_engaging_users": top_users_info,
            "follower_growth": {
                # TODO: Implement follower growth tracking over time
                "message": "Follower growth tracking coming soon"
            }
        }
    }

@router.get("/stories/performance")
async def get_stories_performance(
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get stories performance analytics"""
    
    since_date = datetime.utcnow() - timedelta(days=days)
    
    # Get stories in period
    stories = db.query(Story).filter(
        Story.user_id == current_user.id,
        Story.created_at >= since_date
    ).order_by(desc(Story.created_at)).all()
    
    stories_data = []
    total_views = 0
    
    for story in stories:
        views_count = db.query(StoryView).filter(StoryView.story_id == story.id).count()
        total_views += views_count
        
        stories_data.append({
            "id": story.id,
            "media_type": story.media_type,
            "text_overlay": story.text_overlay,
            "created_at": story.created_at,
            "views_count": views_count
        })
    
    # Story performance metrics
    avg_views = round(total_views / max(len(stories), 1), 2)
    best_story = max(stories_data, key=lambda x: x['views_count']) if stories_data else None
    
    return {
        "success": True,
        "stories_performance": {
            "period_days": days,
            "total_stories": len(stories),
            "total_views": total_views,
            "average_views_per_story": avg_views,
            "best_performing_story": best_story,
            "stories_breakdown": [
                {
                    "id": story["id"],
                    "media_type": story["media_type"],
                    "views": story["views_count"],
                    "created_at": story["created_at"]
                }
                for story in stories_data
            ]
        }
    }

@router.get("/growth/timeline")
async def get_growth_timeline(
    months: int = Query(6, ge=1, le=24),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get growth timeline over specified months"""
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=months * 30)
    
    # Generate monthly data points
    timeline_data = []
    
    current_date = start_date
    while current_date <= end_date:
        month_end = min(current_date + timedelta(days=30), end_date)
        
        # Count posts in this month
        posts_count = db.query(Post).filter(
            Post.user_id == current_user.id,
            Post.created_at >= current_date,
            Post.created_at < month_end
        ).count()
        
        # Count stories in this month
        stories_count = db.query(Story).filter(
            Story.user_id == current_user.id,
            Story.created_at >= current_date,
            Story.created_at < month_end
        ).count()
        
        # Count followers gained (approximation)
        # Note: This is a simplified approach since we don't track follower history
        followers_at_period = db.query(Follow).filter(
            Follow.following_id == current_user.id,
            Follow.created_at <= month_end
        ).count() if hasattr(Follow, 'created_at') else 0
        
        timeline_data.append({
            "period": current_date.strftime("%Y-%m"),
            "posts_created": posts_count,
            "stories_created": stories_count,
            "followers": followers_at_period,
            "engagement_events": 0  # TODO: Calculate actual engagement events
        })
        
        current_date = month_end
    
    return {
        "success": True,
        "growth_timeline": {
            "period_months": months,
            "data": timeline_data
        }
    }

@router.get("/comparative/users")
async def get_comparative_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comparative analytics against platform averages"""
    
    # Platform averages (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    # User's metrics
    user_posts_30d = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.created_at >= thirty_days_ago
    ).count()
    
    user_stories_30d = db.query(Story).filter(
        Story.user_id == current_user.id,
        Story.created_at >= thirty_days_ago
    ).count()
    
    # Platform averages
    total_users = db.query(User).count()
    total_posts_30d = db.query(Post).filter(Post.created_at >= thirty_days_ago).count()
    total_stories_30d = db.query(Story).filter(Story.created_at >= thirty_days_ago).count()
    
    avg_posts_per_user = round(total_posts_30d / max(total_users, 1), 2)
    avg_stories_per_user = round(total_stories_30d / max(total_users, 1), 2)
    
    # User's engagement rate
    user_posts = db.query(Post.id).filter(Post.user_id == current_user.id).subquery()
    user_total_reactions = db.query(Reaction).filter(
        Reaction.post_id.in_(db.query(user_posts.c.id))
    ).count()
    
    user_followers = db.query(Follow).filter(Follow.following_id == current_user.id).count()
    user_engagement_rate = (user_total_reactions / max(user_followers, 1)) * 100
    
    return {
        "success": True,
        "comparative_analytics": {
            "user_metrics": {
                "posts_30d": user_posts_30d,
                "stories_30d": user_stories_30d,
                "followers": user_followers,
                "engagement_rate": round(user_engagement_rate, 2)
            },
            "platform_averages": {
                "posts_per_user_30d": avg_posts_per_user,
                "stories_per_user_30d": avg_stories_per_user,
                "total_users": total_users
            },
            "performance_vs_average": {
                "posts_performance": "above" if user_posts_30d > avg_posts_per_user else "below",
                "stories_performance": "above" if user_stories_30d > avg_stories_per_user else "below"
            }
        }
    }

@router.get("/export/data")
async def export_analytics_data(
    format: str = Query("json", regex="^(json|csv)$"),
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export user's analytics data"""
    
    since_date = datetime.utcnow() - timedelta(days=days)
    
    # Gather all data
    posts = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.created_at >= since_date
    ).all()
    
    export_data = {
        "user_info": {
            "id": current_user.id,
            "username": current_user.username,
            "full_name": current_user.full_name
        },
        "export_period": {
            "days": days,
            "start_date": since_date.isoformat(),
            "end_date": datetime.utcnow().isoformat()
        },
        "posts": [],
        "summary": {
            "total_posts": len(posts),
            "total_likes": 0,
            "total_comments": 0
        }
    }
    
    # Add detailed post data
    for post in posts:
        likes_count = db.query(Reaction).filter(
            Reaction.post_id == post.id,
            Reaction.reaction_type == 'like'
        ).count()
        
        comments_count = db.query(Comment).filter(Comment.post_id == post.id).count()
        
        export_data["posts"].append({
            "id": post.id,
            "content": post.content,
            "created_at": post.created_at.isoformat(),
            "likes_count": likes_count,
            "comments_count": comments_count,
            "has_images": bool(post.image_urls)
        })
        
        export_data["summary"]["total_likes"] += likes_count
        export_data["summary"]["total_comments"] += comments_count
    
    return {
        "success": True,
        "format": format,
        "data": export_data
    }
