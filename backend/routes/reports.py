"""
Rotas para sistema de denúncias
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from core.database import get_db
from core.security import get_current_user
from models import User
from models.report import Report, ReportType, ReportStatus

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/user/{user_id}")
async def report_user(
    user_id: int,
    report_type: ReportType,
    description: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Denunciar um usuário"""
    # Verificar se não está tentando denunciar a si mesmo
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot report yourself")
    
    # Verificar se o usuário existe
    reported_user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not reported_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verificar se já existe uma denúncia pendente do mesmo usuário
    existing_report = db.query(Report).filter(
        Report.reporter_id == current_user.id,
        Report.reported_user_id == user_id,
        Report.status.in_([ReportStatus.pending, ReportStatus.under_review])
    ).first()
    
    if existing_report:
        raise HTTPException(status_code=400, detail="You already have a pending report for this user")
    
    # Criar nova denúncia
    report = Report(
        reporter_id=current_user.id,
        reported_user_id=user_id,
        report_type=report_type,
        description=description
    )
    
    db.add(report)
    db.commit()
    
    return {"message": "Report submitted successfully", "report_id": report.id}

@router.get("/my-reports")
async def get_my_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter denúncias feitas pelo usuário atual"""
    reports = db.query(Report).filter(Report.reporter_id == current_user.id).all()
    
    result = []
    for report in reports:
        reported_user = db.query(User).filter(User.id == report.reported_user_id).first()
        result.append({
            "id": report.id,
            "reported_user": {
                "id": reported_user.id,
                "first_name": reported_user.first_name,
                "last_name": reported_user.last_name,
                "username": reported_user.username,
                "avatar": reported_user.avatar
            },
            "report_type": report.report_type.value,
            "description": report.description,
            "status": report.status.value,
            "created_at": report.created_at.isoformat(),
            "updated_at": report.updated_at.isoformat()
        })
    
    return result

@router.get("/types")
async def get_report_types():
    """Obter tipos de denúncia disponíveis"""
    return [
        {"value": "spam", "label": "Spam"},
        {"value": "harassment", "label": "Assédio"},
        {"value": "inappropriate_content", "label": "Conteúdo inapropriado"},
        {"value": "fake_profile", "label": "Perfil falso"},
        {"value": "violence", "label": "Violência"},
        {"value": "hate_speech", "label": "Discurso de ódio"},
        {"value": "other", "label": "Outro"}
    ]

@router.post("/block/{user_id}")
async def block_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bloquear um usuário"""
    from models import Block
    
    # Verificar se não está tentando bloquear a si mesmo
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot block yourself")
    
    # Verificar se o usuário existe
    user_to_block = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user_to_block:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verificar se já está bloqueado
    existing_block = db.query(Block).filter(
        Block.blocker_id == current_user.id,
        Block.blocked_id == user_id
    ).first()
    
    if existing_block:
        raise HTTPException(status_code=400, detail="User already blocked")
    
    # Criar bloqueio
    block = Block(
        blocker_id=current_user.id,
        blocked_id=user_id
    )
    
    db.add(block)
    
    # Remover amizade se existir
    from models import Friendship
    friendship = db.query(Friendship).filter(
        ((Friendship.requester_id == current_user.id) & (Friendship.addressee_id == user_id)) |
        ((Friendship.requester_id == user_id) & (Friendship.addressee_id == current_user.id))
    ).first()
    
    if friendship:
        db.delete(friendship)
    
    # Remover follows se existir
    from models import Follow
    follow1 = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.followed_id == user_id
    ).first()
    
    follow2 = db.query(Follow).filter(
        Follow.follower_id == user_id,
        Follow.followed_id == current_user.id
    ).first()
    
    if follow1:
        db.delete(follow1)
    if follow2:
        db.delete(follow2)
    
    db.commit()
    
    return {"message": "User blocked successfully"}

@router.delete("/block/{user_id}")
async def unblock_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Desbloquear um usuário"""
    from models import Block
    
    block = db.query(Block).filter(
        Block.blocker_id == current_user.id,
        Block.blocked_id == user_id
    ).first()
    
    if not block:
        raise HTTPException(status_code=404, detail="User is not blocked")
    
    db.delete(block)
    db.commit()
    
    return {"message": "User unblocked successfully"}

@router.get("/blocked-users")
async def get_blocked_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter lista de usuários bloqueados"""
    from models import Block
    
    blocks = db.query(Block).filter(Block.blocker_id == current_user.id).all()
    
    blocked_users = []
    for block in blocks:
        blocked_user = db.query(User).filter(User.id == block.blocked_id).first()
        if blocked_user:
            blocked_users.append({
                "id": blocked_user.id,
                "first_name": blocked_user.first_name,
                "last_name": blocked_user.last_name,
                "username": blocked_user.username,
                "avatar": blocked_user.avatar,
                "blocked_at": block.created_at.isoformat()
            })
    
    return blocked_users
