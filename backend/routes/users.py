"""
Rotas de usuários e perfis
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from pathlib import Path

from core.database import get_db
from core.security import get_current_user
from models import User, Post, Friendship
from schemas import UserResponse, PostResponse

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
async def search_users(
    search: str = "",
    location: str = None,
    verified_only: bool = False,
    limit: int = 20,
    sort: str = "id",
    order: str = "asc",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Buscar usuários com filtros avançados"""
    query = db.query(User).filter(
        User.is_active == True,
        User.id != current_user.id
    )

    # Filtro de busca por texto
    if search.strip():
        search_filter = (
            User.first_name.ilike(f"%{search}%") |
            User.last_name.ilike(f"%{search}%") |
            User.email.ilike(f"%{search}%") |
            User.username.ilike(f"%{search}%") |
            User.bio.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    # Filtro por localização
    if location:
        query = query.filter(User.location.ilike(f"%{location}%"))

    # Filtro por usuários verificados
    if verified_only:
        query = query.filter(User.is_verified == True)

    # Obter usuários bloqueados para excluir dos resultados
    from models import Block
    blocked_users = db.query(Block).filter(
        (Block.blocker_id == current_user.id) | (Block.blocked_id == current_user.id)
    ).all()

    blocked_ids = set()
    for block in blocked_users:
        blocked_ids.add(block.blocker_id)
        blocked_ids.add(block.blocked_id)

    if blocked_ids:
        query = query.filter(~User.id.in_(blocked_ids))

    # Aplicar ordenação
    if sort == "created_at":
        if order == "desc":
            query = query.order_by(User.created_at.desc())
        else:
            query = query.order_by(User.created_at.asc())
    elif sort == "first_name":
        if order == "desc":
            query = query.order_by(User.first_name.desc())
        else:
            query = query.order_by(User.first_name.asc())
    else:  # default to id
        if order == "desc":
            query = query.order_by(User.id.desc())
        else:
            query = query.order_by(User.id.asc())

    users = query.limit(limit).all()

    return [
        {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "email": user.email,
            "bio": user.bio,
            "avatar": getattr(user, 'avatar', None),
            "location": user.location,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat()
        }
        for user in users
    ]

@router.get("/discover")
async def discover_users(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Descobrir novos usuários (usuários reais cadastrados)"""
    # Obter IDs de amigos atuais
    current_friends_query = db.query(Friendship).filter(
        ((Friendship.requester_id == current_user.id) | (Friendship.addressee_id == current_user.id)),
        Friendship.status == "accepted"
    )

    friend_ids = []
    for friendship in current_friends_query:
        if friendship.requester_id == current_user.id:
            friend_ids.append(friendship.addressee_id)
        else:
            friend_ids.append(friendship.requester_id)

    # Obter usuários bloqueados
    from models import Block
    blocked_users = db.query(Block).filter(
        (Block.blocker_id == current_user.id) | (Block.blocked_id == current_user.id)
    ).all()

    blocked_ids = set()
    for block in blocked_users:
        blocked_ids.add(block.blocker_id)
        blocked_ids.add(block.blocked_id)

    # Obter solicitações pendentes
    pending_requests = db.query(Friendship).filter(
        ((Friendship.requester_id == current_user.id) | (Friendship.addressee_id == current_user.id)),
        Friendship.status == "pending"
    ).all()

    pending_ids = set()
    for request in pending_requests:
        pending_ids.add(request.requester_id)
        pending_ids.add(request.addressee_id)

    # Excluir próprio usuário, amigos, bloqueados e solicitações pendentes
    exclude_ids = set([current_user.id] + friend_ids + list(blocked_ids) + list(pending_ids))

    # Buscar usuários ativos que não estão na lista de exclusão
    # Priorizar usuários com mais informações no perfil
    discovered_users = db.query(User).filter(
        User.is_active == True,
        ~User.id.in_(exclude_ids),
        User.onboarding_completed == True  # Apenas usuários que completaram o onboarding
    ).order_by(User.created_at.desc()).limit(limit).all()

    result = []
    for user in discovered_users:
        result.append({
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "bio": user.bio,
            "avatar": user.avatar,
            "location": user.location,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat(),
            "mutual_friends": 0  # Será calculado pelo frontend se necessário
        })

    return result

@router.get("/{user_id}")
async def get_user_by_id(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "bio": getattr(user, 'bio', None),
        "avatar": getattr(user, 'avatar', None),
        "birth_date": user.birth_date.isoformat() if user.birth_date else None,
        "created_at": user.created_at.isoformat()
    }

@router.get("/{user_id}/profile")
async def get_user_profile(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Obter perfil completo do usuário com configurações de privacidade"""
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verificar se são amigos para mostrar informações privadas
    friendship = db.query(Friendship).filter(
        ((Friendship.requester_id == current_user.id) & (Friendship.addressee_id == user_id)) |
        ((Friendship.requester_id == user_id) & (Friendship.addressee_id == current_user.id)),
        Friendship.status == "accepted"
    ).first()

    is_friend = friendship is not None
    is_own_profile = current_user.id == user_id

    # Calcular estatísticas
    friends_count = db.query(Friendship).filter(
        ((Friendship.requester_id == user_id) | (Friendship.addressee_id == user_id)),
        Friendship.status == "accepted"
    ).count()

    posts_count = db.query(Post).filter(Post.author_id == user_id).count()

    # Calcular contadores de seguidor
    from models import Follow
    followers_count = db.query(Follow).filter(Follow.followed_id == user_id).count()
    following_count = db.query(Follow).filter(Follow.follower_id == user_id).count()

    # Determinar visibilidade das informações com base nas configurações de privacidade
    def can_see_field(field_visibility):
        if is_own_profile:
            return True
        if field_visibility == "public":
            return True
        if field_visibility == "friends" and is_friend:
            return True
        return False

    response_data = {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "username": user.username,
        "nickname": user.nickname,
        "bio": user.bio,
        "avatar": user.avatar,
        "cover_photo": user.cover_photo,
        "location": user.location,
        "website": user.website,
        "relationship_status": user.relationship_status,
        "work": user.work,
        "education": user.education,
        "is_verified": user.is_verified,
        "created_at": user.created_at.isoformat(),
        "friends_count": friends_count,
        "posts_count": posts_count,
        "followers_count": followers_count,
        "following_count": following_count,
        "is_own_profile": is_own_profile,
        "is_friend": is_friend
    }

    # Adicionar campos sensíveis apenas se permitido pelas configurações de privacidade
    if can_see_field(user.email_visibility):
        response_data["email"] = user.email

    if can_see_field(user.phone_visibility):
        response_data["phone"] = user.phone

    if can_see_field(user.birth_date_visibility):
        response_data["birth_date"] = user.birth_date.isoformat() if user.birth_date else None
        response_data["gender"] = user.gender

    return response_data

@router.get("/{user_id}/posts", response_model=List[PostResponse])
async def get_user_posts(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    posts = db.query(Post).filter(
        Post.author_id == user_id,
        Post.post_type == "post"
    ).order_by(Post.created_at.desc()).limit(50).all()
    
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
            reactions_count=0,
            comments_count=0,
            shares_count=0,
            is_profile_update=post.is_profile_update,
            is_cover_update=post.is_cover_update
        )
        for post in posts
    ]

@router.get("/{user_id}/testimonials", response_model=List[PostResponse])
async def get_user_testimonials(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    testimonials = db.query(Post).filter(
        Post.author_id == user_id,
        Post.post_type == "testimonial"
    ).order_by(Post.created_at.desc()).limit(50).all()
    
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
            reactions_count=0,
            comments_count=0,
            shares_count=0,
            is_profile_update=post.is_profile_update,
            is_cover_update=post.is_cover_update
        )
        for post in testimonials
    ]

@router.post("/me/avatar")
async def upload_user_avatar(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Upload e definir avatar do usuário"""
    
    # Validar se é imagem
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Validar tamanho (5MB max para avatar)
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 5MB)")

    try:
        # Criar diretório se não existe
        upload_dir = Path("uploads") / "image"
        upload_dir.mkdir(parents=True, exist_ok=True)

        # Gerar nome único
        file_extension = Path(file.filename).suffix if file.filename else ".jpg"
        unique_filename = f"avatar_{current_user.id}_{uuid.uuid4()}{file_extension}"
        file_path = upload_dir / unique_filename

        # Salvar arquivo
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Atualizar avatar do usuário
        avatar_url = f"/uploads/image/{unique_filename}"
        current_user.avatar = avatar_url

        # Criar post automático sobre a atualização da foto de perfil
        from models.post import Post
        profile_post = Post(
            author_id=current_user.id,
            content="atualizou a foto do perfil",
            post_type="post",
            media_type="photo",
            media_url=avatar_url,
            privacy="public",
            is_profile_update=True
        )
        db.add(profile_post)
        db.commit()

        return {
            "message": "Avatar updated successfully",
            "avatar_url": avatar_url,
            "post_created": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload avatar: {str(e)}")

@router.post("/me/cover")
async def upload_user_cover_photo(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Upload e definir foto de capa do usuário"""
    
    # Validar se é imagem
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Validar tamanho (10MB max para capa)
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 10MB)")

    try:
        # Criar diretório se não existe
        upload_dir = Path("uploads") / "image"
        upload_dir.mkdir(parents=True, exist_ok=True)

        # Gerar nome único
        file_extension = Path(file.filename).suffix if file.filename else ".jpg"
        unique_filename = f"cover_{current_user.id}_{uuid.uuid4()}{file_extension}"
        file_path = upload_dir / unique_filename

        # Salvar arquivo
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Atualizar foto de capa do usuário
        cover_url = f"/uploads/image/{unique_filename}"
        current_user.cover_photo = cover_url

        # Criar post automático sobre a atualização da foto de capa
        from models.post import Post
        cover_post = Post(
            author_id=current_user.id,
            content="atualizou a foto de capa",
            post_type="post",
            media_type="photo",
            media_url=cover_url,
            privacy="public",
            is_cover_update=True
        )
        db.add(cover_post)
        db.commit()

        return {
            "message": "Cover photo updated successfully",
            "cover_photo_url": cover_url,
            "post_created": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload cover photo: {str(e)}")
