"""
Rotas para gerenciamento de amizades
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from core.database import get_db
from core.security import get_current_user
from models import User, Friendship, Block
from schemas import UserResponse
from utils.notification_helpers import create_friend_request_notification, create_friend_request_accepted_notification

router = APIRouter(prefix="/friendships", tags=["friendships"])

from pydantic import BaseModel

class FriendRequest(BaseModel):
    addressee_id: int

@router.post("/")
async def send_friend_request(
    request: FriendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enviar solicitação de amizade"""
    addressee_id = request.addressee_id

    # Verificar se não está tentando adicionar a si mesmo
    if current_user.id == addressee_id:
        raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")

    # Verificar se o usuário existe
    addressee = db.query(User).filter(User.id == addressee_id, User.is_active == True).first()
    if not addressee:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verificar se há bloqueio entre os usuários
    block = db.query(Block).filter(
        ((Block.blocker_id == current_user.id) & (Block.blocked_id == addressee_id)) |
        ((Block.blocker_id == addressee_id) & (Block.blocked_id == current_user.id))
    ).first()
    
    if block:
        raise HTTPException(status_code=403, detail="Cannot send friend request due to blocking")
    
    # Verificar se já existe uma amizade
    existing_friendship = db.query(Friendship).filter(
        ((Friendship.requester_id == current_user.id) & (Friendship.addressee_id == addressee_id)) |
        ((Friendship.requester_id == addressee_id) & (Friendship.addressee_id == current_user.id))
    ).first()
    
    if existing_friendship:
        if existing_friendship.status == "accepted":
            raise HTTPException(status_code=400, detail="Already friends")
        elif existing_friendship.status == "pending":
            raise HTTPException(status_code=400, detail="Friend request already sent")
        elif existing_friendship.status == "rejected":
            # Permitir reenvio após rejeição
            existing_friendship.status = "pending"
            existing_friendship.requester_id = current_user.id
            existing_friendship.addressee_id = addressee_id
            existing_friendship.updated_at = datetime.utcnow()
            db.commit()
            return {"message": "Friend request sent successfully"}
    
    # Criar nova solicitação de amizade
    friendship = Friendship(
        requester_id=current_user.id,
        addressee_id=addressee_id,
        status="pending"
    )
    
    db.add(friendship)
    db.commit()
    db.refresh(friendship)

    # Criar notificação para o destinatário
    await create_friend_request_notification(
        db=db,
        requester_id=current_user.id,
        addressee_id=addressee_id,
        friendship_id=friendship.id
    )

    return {"message": "Friend request sent successfully"}

@router.get("/requests")
async def get_friend_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter solicitações de amizade recebidas"""
    requests = db.query(Friendship).filter(
        Friendship.addressee_id == current_user.id,
        Friendship.status == "pending"
    ).all()
    
    result = []
    for request in requests:
        requester = request.requester
        result.append({
            "id": request.id,
            "requester": {
                "id": requester.id,
                "first_name": requester.first_name,
                "last_name": requester.last_name,
                "username": requester.username,
                "avatar": requester.avatar
            },
            "created_at": request.created_at.isoformat()
        })
    
    return result

@router.post("/requests/{request_id}/accept")
async def accept_friend_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aceitar solicitação de amizade"""
    friendship = db.query(Friendship).filter(
        Friendship.id == request_id,
        Friendship.addressee_id == current_user.id,
        Friendship.status == "pending"
    ).first()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    friendship.status = "accepted"
    friendship.updated_at = datetime.utcnow()
    db.commit()

    # Criar notificação para quem enviou a solicitação
    await create_friend_request_accepted_notification(
        db=db,
        requester_id=friendship.requester_id,
        addressee_id=current_user.id,
        friendship_id=friendship.id
    )

    return {"message": "Friend request accepted"}

@router.post("/requests/{request_id}/reject")
async def reject_friend_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Rejeitar solicitação de amizade"""
    friendship = db.query(Friendship).filter(
        Friendship.id == request_id,
        Friendship.addressee_id == current_user.id,
        Friendship.status == "pending"
    ).first()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    friendship.status = "rejected"
    friendship.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Friend request rejected"}

@router.get("/")
async def get_friends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter lista de amigos"""
    friendships = db.query(Friendship).filter(
        ((Friendship.requester_id == current_user.id) | (Friendship.addressee_id == current_user.id)),
        Friendship.status == "accepted"
    ).all()
    
    friends = []
    for friendship in friendships:
        friend = friendship.addressee if friendship.requester_id == current_user.id else friendship.requester
        friends.append({
            "id": friend.id,
            "first_name": friend.first_name,
            "last_name": friend.last_name,
            "username": friend.username,
            "avatar": friend.avatar,
            "bio": friend.bio,
            "location": friend.location,
            "is_verified": friend.is_verified,
            "friendship_date": friendship.updated_at.isoformat()
        })
    
    return friends

@router.delete("/{friend_id}")
async def remove_friend(
    friend_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remover amigo"""
    friendship = db.query(Friendship).filter(
        ((Friendship.requester_id == current_user.id) & (Friendship.addressee_id == friend_id)) |
        ((Friendship.requester_id == friend_id) & (Friendship.addressee_id == current_user.id)),
        Friendship.status == "accepted"
    ).first()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship not found")
    
    db.delete(friendship)
    db.commit()
    
    return {"message": "Friend removed successfully"}

@router.get("/status/{user_id}")
async def get_friendship_status(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter status da amizade com um usuário"""
    if current_user.id == user_id:
        return {"status": "self"}
    
    friendship = db.query(Friendship).filter(
        ((Friendship.requester_id == current_user.id) & (Friendship.addressee_id == user_id)) |
        ((Friendship.requester_id == user_id) & (Friendship.addressee_id == current_user.id))
    ).first()
    
    if not friendship:
        return {"status": "none"}
    
    # Verificar se o usuário atual é quem enviou a solicitação
    is_requester = friendship.requester_id == current_user.id
    
    return {
        "status": friendship.status,
        "is_requester": is_requester,
        "friendship_id": friendship.id,
        "created_at": friendship.created_at.isoformat()
    }

@router.get("/suggestions")
async def get_friend_suggestions(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter sugestões de amizade baseadas em amigos em comum"""
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
    suggested_users = db.query(User).filter(
        User.is_active == True,
        ~User.id.in_(exclude_ids)
    ).limit(limit * 2).all()  # Buscar mais para filtrar depois
    
    # Calcular amigos em comum para cada sugestão
    suggestions = []
    for user in suggested_users:
        # Contar amigos em comum
        user_friends_query = db.query(Friendship).filter(
            ((Friendship.requester_id == user.id) | (Friendship.addressee_id == user.id)),
            Friendship.status == "accepted"
        )
        
        user_friend_ids = []
        for friendship in user_friends_query:
            if friendship.requester_id == user.id:
                user_friend_ids.append(friendship.addressee_id)
            else:
                user_friend_ids.append(friendship.requester_id)
        
        mutual_friends = len(set(friend_ids) & set(user_friend_ids))
        
        suggestions.append({
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "avatar": user.avatar,
            "bio": user.bio,
            "location": user.location,
            "is_verified": user.is_verified,
            "mutual_friends": mutual_friends
        })
    
    # Ordenar por número de amigos em comum e depois por data de criação
    suggestions.sort(key=lambda x: (-x["mutual_friends"], x["id"]))
    
    return suggestions[:limit]
