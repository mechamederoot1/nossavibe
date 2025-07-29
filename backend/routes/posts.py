"""
Rotas de posts, reações e comentários
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import re
from datetime import datetime

from core.database import get_db
from core.security import get_current_user
from models import User, Post, Reaction, Comment, Share
from models.hashtag import Hashtag, PostHashtag
from models.mention import PostMention
from schemas import PostCreate, PostResponse, ReactionCreate, CommentCreate, CommentResponse, ShareCreate
from schemas.post import PostUpdate
from utils.notification_helpers import create_post_reaction_notification, create_post_comment_notification, create_notification
from utils.realtime_notifications import realtime_notifications

router = APIRouter(prefix="/posts", tags=["posts"])

def extract_hashtags(content: str) -> List[str]:
    """Extract hashtags from content"""
    if not content:
        return []
    hashtag_pattern = r'#(\w+)'
    hashtags = re.findall(hashtag_pattern, content, re.IGNORECASE)
    return list(set(hashtags))  # Remove duplicates

def extract_mentions(content: str) -> List[str]:
    """Extract user mentions from content"""
    if not content:
        return []
    mention_pattern = r'@(\w+)'
    mentions = re.findall(mention_pattern, content, re.IGNORECASE)
    return list(set(mentions))  # Remove duplicates

def process_hashtags(db: Session, post_id: int, content: str):
    """Process and create hashtag associations for a post"""
    hashtags = extract_hashtags(content)

    for hashtag_name in hashtags:
        # Get or create hashtag
        hashtag = db.query(Hashtag).filter(Hashtag.name == hashtag_name.lower()).first()
        if not hashtag:
            hashtag = Hashtag(name=hashtag_name.lower(), usage_count=0)
            db.add(hashtag)
            db.flush()

        # Create post-hashtag association
        post_hashtag = PostHashtag(post_id=post_id, hashtag_id=hashtag.id)
        db.add(post_hashtag)

        # Update usage count
        hashtag.usage_count += 1
        hashtag.updated_at = datetime.utcnow()

def process_mentions(db: Session, post_id: int, content: str, current_user_id: int):
    """Process and create mention associations for a post"""
    mentions = extract_mentions(content)

    for username in mentions:
        # Find user by username
        mentioned_user = db.query(User).filter(User.username == username).first()
        if mentioned_user:
            # Create mention association
            mention = PostMention(
                post_id=post_id,
                mentioned_user_id=mentioned_user.id,
                mentioned_by_user_id=current_user_id,
                mention_text=f"@{username}"
            )
            db.add(mention)

            # Create notification for mentioned user
            create_notification(
                db=db,
                recipient_id=mentioned_user.id,
                sender_id=current_user_id,
                notification_type="mention",
                title="Você foi mencionado",
                message=f"Você foi mencionado em um post",
                data={"post_id": post_id, "mention_text": f"@{username}"}
            )

@router.post("/", response_model=PostResponse)
async def create_post(post: PostCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Validação e processamento do conteúdo
    content_to_save = post.content
    
    # Se for um depoimento, validamos se é JSON válido
    if post.post_type == "testimonial" and post.content:
        try:
            parsed_content = json.loads(post.content)
            if isinstance(parsed_content, dict) and 'content' in parsed_content and 'styles' in parsed_content:
                content_to_save = post.content
            else:
                content_to_save = post.content
        except (json.JSONDecodeError, TypeError):
            content_to_save = post.content
    
    db_post = Post(
        author_id=current_user.id,
        content=content_to_save,
        post_type=post.post_type,
        media_type=post.media_type,
        media_url=post.media_url,
        media_metadata=post.media_metadata,
        privacy=post.privacy,
        is_profile_update=post.is_profile_update,
        is_cover_update=post.is_cover_update
    )
    db.add(db_post)
    db.flush()  # Get the post ID before committing

    # Process hashtags and mentions
    if content_to_save:
        process_hashtags(db, db_post.id, content_to_save)
        process_mentions(db, db_post.id, content_to_save, current_user.id)

    db.commit()
    db.refresh(db_post)
    
    return PostResponse(
        id=db_post.id,
        author={
            "id": db_post.author.id,
            "first_name": db_post.author.first_name,
            "last_name": db_post.author.last_name,
            "avatar": getattr(db_post.author, 'avatar', None)
        },
        content=db_post.content,
        post_type=db_post.post_type,
        media_type=db_post.media_type,
        media_url=db_post.media_url,
        created_at=db_post.created_at,
        reactions_count=db_post.reactions_count,
        comments_count=db_post.comments_count,
        shares_count=db_post.shares_count,
        is_profile_update=db_post.is_profile_update,
        is_cover_update=db_post.is_cover_update
    )

@router.get("/", response_model=List[PostResponse])
async def get_posts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.created_at.desc()).limit(50).all()
    
    return [
        PostResponse(
            id=post.id,
            author={
                "id": post.author.id,
                "first_name": post.author.first_name,
                "last_name": post.author.last_name,
                "avatar": getattr(post.author, 'avatar', None)
            },
            content=post.content,
            post_type=post.post_type,
            media_type=post.media_type,
            media_url=post.media_url,
            created_at=post.created_at,
            reactions_count=post.reactions_count,
            comments_count=post.comments_count,
            shares_count=post.shares_count,
            is_profile_update=post.is_profile_update,
            is_cover_update=post.is_cover_update
        )
        for post in posts
    ]

@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get individual post by ID"""
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return PostResponse(
        id=post.id,
        author={
            "id": post.author.id,
            "first_name": post.author.first_name,
            "last_name": post.author.last_name,
            "avatar": getattr(post.author, 'avatar', None)
        },
        content=post.content,
        post_type=post.post_type,
        media_type=post.media_type,
        media_url=post.media_url,
        created_at=post.created_at,
        reactions_count=db.query(Reaction).filter(Reaction.post_id == post.id).count(),
        comments_count=db.query(Comment).filter(Comment.post_id == post.id).count(),
        shares_count=db.query(Share).filter(Share.post_id == post.id).count(),
        is_profile_update=post.is_profile_update,
        is_cover_update=post.is_cover_update
    )

@router.delete("/{post_id}")
async def delete_post(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    # Delete related data
    db.query(Reaction).filter(Reaction.post_id == post_id).delete()
    db.query(Comment).filter(Comment.post_id == post_id).delete()
    db.query(Share).filter(Share.post_id == post_id).delete()
    
    db.delete(post)
    db.commit()
    
    return {"message": "Post deleted successfully"}

@router.put("/{post_id}")
async def update_post(
    post_id: int,
    post_update: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")

    # Update content if provided
    if post_update.content is not None:
        post.content = post_update.content
        post.edited_at = datetime.utcnow()
        post.is_edited = True

        # Remove old hashtags and mentions
        db.query(PostHashtag).filter(PostHashtag.post_id == post_id).delete()
        db.query(PostMention).filter(PostMention.post_id == post_id).delete()

        # Process new hashtags and mentions
        process_hashtags(db, post.id, post_update.content)
        process_mentions(db, post.id, post_update.content, current_user.id)

    # Update privacy if provided
    if post_update.privacy is not None:
        post.privacy = post_update.privacy

    # Update media if provided
    if post_update.media_url is not None:
        post.media_url = post_update.media_url
    if post_update.media_type is not None:
        post.media_type = post_update.media_type

    db.commit()
    db.refresh(post)

    return {
        "message": "Post updated successfully",
        "post": {
            "id": post.id,
            "content": post.content,
            "privacy": post.privacy,
            "edited_at": post.edited_at.isoformat() if post.edited_at else None,
            "is_edited": post.is_edited
        }
    }

# Reactions
@router.post("/{post_id}/reactions")
async def create_post_reaction(post_id: int, reaction_data: ReactionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Add or update reaction to a post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if user already reacted
    existing_reaction = db.query(Reaction).filter(
        Reaction.post_id == post_id,
        Reaction.user_id == current_user.id
    ).first()

    if existing_reaction:
        # Update existing reaction
        existing_reaction.reaction_type = reaction_data.reaction_type
        db.commit()
        return {"message": "Reaction updated"}
    else:
        # Create new reaction
        reaction = Reaction(
            post_id=post_id,
            user_id=current_user.id,
            reaction_type=reaction_data.reaction_type
        )
        db.add(reaction)
        db.commit()

        # Criar notificação para o autor do post (se não for o mesmo usuário)
        if post.author_id != current_user.id:
            await create_post_reaction_notification(
                db=db,
                post_id=post_id,
                reactor_id=current_user.id,
                post_author_id=post.author_id,
                reaction_type=reaction_data.reaction_type
            )

            # Send real-time notification
            await realtime_notifications.send_like_notification(
                liker_id=current_user.id,
                post_author_id=post.author_id,
                post_id=post_id,
                reaction_type=reaction_data.reaction_type
            )

        return {"message": "Reaction added"}

@router.delete("/{post_id}/reactions")
async def remove_post_reaction(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Remove reaction from a post"""
    reaction = db.query(Reaction).filter(
        Reaction.post_id == post_id,
        Reaction.user_id == current_user.id
    ).first()

    if reaction:
        db.delete(reaction)
        db.commit()
        return {"message": "Reaction removed"}
    else:
        raise HTTPException(status_code=404, detail="Reaction not found")

# Comments
@router.get("/{post_id}/comments", response_model=List[CommentResponse])
async def get_post_comments(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get comments for a specific post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()

    return [
        CommentResponse(
            id=comment.id,
            content=comment.content,
            author={
                "id": comment.author.id,
                "first_name": comment.author.first_name,
                "last_name": comment.author.last_name,
                "avatar": getattr(comment.author, 'avatar', None)
            },
            created_at=comment.created_at,
            reactions_count=0
        )
        for comment in comments
    ]

@router.post("/{post_id}/comments", response_model=CommentResponse)
async def create_comment(post_id: int, comment_data: CommentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a comment on a post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = Comment(
        content=comment_data.content,
        post_id=post_id,
        author_id=current_user.id
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Criar notificação para o autor do post (se não for o mesmo usuário)
    if post.author_id != current_user.id:
        await create_post_comment_notification(
            db=db,
            post_id=post_id,
            commenter_id=current_user.id,
            post_author_id=post.author_id,
            comment_id=comment.id
        )

    return CommentResponse(
        id=comment.id,
        content=comment.content,
        author={
            "id": current_user.id,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "avatar": getattr(current_user, 'avatar', None)
        },
        created_at=comment.created_at,
        reactions_count=0
    )
