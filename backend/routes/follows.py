"""
Rotas para gerenciamento de seguir/deixar de seguir
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from core.database import get_db
from core.security import get_current_user
from models import User, Follow, Block
from utils.notification_helpers import create_follow_notification

router = APIRouter(prefix="/follow", tags=["follow"])

@router.post("/{user_id}")
async def follow_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Seguir um usuário"""
    # Verificar se não está tentando seguir a si mesmo
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    # Verificar se o usuário existe
    user_to_follow = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user_to_follow:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verificar se há bloqueio entre os usuários
    block = db.query(Block).filter(
        ((Block.blocker_id == current_user.id) & (Block.blocked_id == user_id)) |
        ((Block.blocker_id == user_id) & (Block.blocked_id == current_user.id))
    ).first()
    
    if block:
        raise HTTPException(status_code=403, detail="Cannot follow due to blocking")
    
    # Verificar se já está seguindo
    existing_follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.followed_id == user_id
    ).first()
    
    if existing_follow:
        raise HTTPException(status_code=400, detail="Already following this user")
    
    # Criar novo follow
    follow = Follow(
        follower_id=current_user.id,
        followed_id=user_id
    )
    
    db.add(follow)
    db.commit()

    # Criar notificação para o usuário seguido
    await create_follow_notification(
        db=db,
        follower_id=current_user.id,
        followed_id=user_id
    )

    return {"message": "User followed successfully"}

@router.delete("/{user_id}")
async def unfollow_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deixar de seguir um usuário"""
    follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.followed_id == user_id
    ).first()
    
    if not follow:
        raise HTTPException(status_code=404, detail="Not following this user")
    
    db.delete(follow)
    db.commit()
    
    return {"message": "User unfollowed successfully"}

@router.get("/status/{user_id}")
async def get_follow_status(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verificar se está seguindo um usuário"""
    if current_user.id == user_id:
        return {"is_following": False, "is_self": True}
    
    follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.followed_id == user_id
    ).first()
    
    return {"is_following": follow is not None, "is_self": False}

@router.get("/followers")
async def get_followers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter lista de seguidores"""
    follows = db.query(Follow).filter(Follow.followed_id == current_user.id).all()
    
    followers = []
    for follow in follows:
        follower = follow.follower
        followers.append({
            "id": follower.id,
            "first_name": follower.first_name,
            "last_name": follower.last_name,
            "username": follower.username,
            "avatar": follower.avatar,
            "bio": follower.bio,
            "is_verified": follower.is_verified,
            "followed_at": follow.created_at.isoformat()
        })
    
    return followers

@router.get("/following")
async def get_following(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter lista de usuários que está seguindo"""
    follows = db.query(Follow).filter(Follow.follower_id == current_user.id).all()
    
    following = []
    for follow in follows:
        followed = follow.followed
        following.append({
            "id": followed.id,
            "first_name": followed.first_name,
            "last_name": followed.last_name,
            "username": followed.username,
            "avatar": followed.avatar,
            "bio": followed.bio,
            "is_verified": followed.is_verified,
            "followed_at": follow.created_at.isoformat()
        })
    
    return following

@router.get("/users/{user_id}/followers")
async def get_user_followers(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter seguidores de um usuário específico"""
    # Verificar se o usuário existe
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    follows = db.query(Follow).filter(Follow.followed_id == user_id).all()
    
    followers = []
    for follow in follows:
        follower = follow.follower
        followers.append({
            "id": follower.id,
            "first_name": follower.first_name,
            "last_name": follower.last_name,
            "username": follower.username,
            "avatar": follower.avatar,
            "bio": follower.bio,
            "is_verified": follower.is_verified,
            "followed_at": follow.created_at.isoformat()
        })
    
    return followers

@router.get("/users/{user_id}/following")
async def get_user_following(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter usuários que um usuário específico está seguindo"""
    # Verificar se o usuário existe
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    follows = db.query(Follow).filter(Follow.follower_id == user_id).all()
    
    following = []
    for follow in follows:
        followed = follow.followed
        following.append({
            "id": followed.id,
            "first_name": followed.first_name,
            "last_name": followed.last_name,
            "username": followed.username,
            "avatar": followed.avatar,
            "bio": followed.bio,
            "is_verified": followed.is_verified,
            "followed_at": follow.created_at.isoformat()
        })
    
    return following
