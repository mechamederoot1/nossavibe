"""
Reports and moderation routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta

from backend.core.database import get_db
from backend.utils.auth import get_current_user
from backend.models.user import User
from backend.models.post import Post
from backend.models.comment import Comment
from backend.models.report import Report
from backend.utils.realtime_notifications import RealtimeNotificationService

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/create")
async def create_report(
    report_type: str = Form(...),
    reason: str = Form(...),
    reported_user_id: Optional[int] = Form(None),
    reported_post_id: Optional[int] = Form(None),
    reported_comment_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new report"""
    
    # Validate that at least one target is specified
    if not any([reported_user_id, reported_post_id, reported_comment_id]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deve especificar pelo menos um item para reportar"
        )
    
    # Validate that only one target is specified
    targets = [reported_user_id, reported_post_id, reported_comment_id]
    if sum(1 for target in targets if target is not None) > 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pode reportar apenas um item por vez"
        )
    
    # Validate report type
    valid_types = ['spam', 'harassment', 'hate_speech', 'violence', 'nudity', 'fake_account', 'intellectual_property', 'other']
    if report_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de relatório inválido"
        )
    
    try:
        # Check if user already reported this item
        existing_report = db.query(Report).filter(
            Report.reporter_id == current_user.id,
            or_(
                Report.reported_user_id == reported_user_id,
                Report.reported_post_id == reported_post_id,
                Report.reported_comment_id == reported_comment_id
            )
        ).first()
        
        if existing_report:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Você já reportou este item"
            )
        
        # Validate that the reported items exist
        if reported_user_id:
            user = db.query(User).filter(User.id == reported_user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        if reported_post_id:
            post = db.query(Post).filter(Post.id == reported_post_id).first()
            if not post:
                raise HTTPException(status_code=404, detail="Post não encontrado")
        
        if reported_comment_id:
            comment = db.query(Comment).filter(Comment.id == reported_comment_id).first()
            if not comment:
                raise HTTPException(status_code=404, detail="Comentário não encontrado")
        
        # Create report
        report = Report(
            reporter_id=current_user.id,
            reported_user_id=reported_user_id,
            reported_post_id=reported_post_id,
            reported_comment_id=reported_comment_id,
            report_type=report_type,
            reason=reason
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        return {
            "success": True,
            "message": "Relatório enviado com sucesso",
            "report": {
                "id": report.id,
                "report_type": report.report_type,
                "status": report.status,
                "created_at": report.created_at
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar relatório: {str(e)}")

@router.get("/my-reports")
async def get_my_reports(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's reports"""
    
    query = db.query(Report).filter(Report.reporter_id == current_user.id)
    
    if status_filter:
        query = query.filter(Report.status == status_filter)
    
    total = query.count()
    reports = query.order_by(desc(Report.created_at)).offset((page - 1) * limit).limit(limit).all()
    
    result = []
    for report in reports:
        report_data = {
            "id": report.id,
            "report_type": report.report_type,
            "reason": report.reason,
            "status": report.status,
            "action_taken": report.action_taken,
            "created_at": report.created_at,
            "resolved_at": report.resolved_at
        }
        
        # Add target information
        if report.reported_user_id:
            user = db.query(User).filter(User.id == report.reported_user_id).first()
            report_data["target"] = {
                "type": "user",
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name
            }
        elif report.reported_post_id:
            post = db.query(Post).filter(Post.id == report.reported_post_id).first()
            report_data["target"] = {
                "type": "post",
                "id": post.id,
                "content": post.content[:100] + "..." if len(post.content) > 100 else post.content
            }
        elif report.reported_comment_id:
            comment = db.query(Comment).filter(Comment.id == report.reported_comment_id).first()
            report_data["target"] = {
                "type": "comment",
                "id": comment.id,
                "content": comment.content[:100] + "..." if len(comment.content) > 100 else comment.content
            }
        
        result.append(report_data)
    
    return {
        "success": True,
        "reports": result,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }

# MODERATION ENDPOINTS (Admin/Moderator only)
@router.get("/moderate/pending")
async def get_pending_reports(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    report_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get pending reports for moderation (admin/moderator only)"""
    
    # TODO: Add proper role checking for moderators/admins
    # For now, any user can access this (should be restricted in production)
    
    query = db.query(Report).filter(Report.status == 'pending')
    
    if report_type:
        query = query.filter(Report.report_type == report_type)
    
    total = query.count()
    reports = query.order_by(asc(Report.created_at)).offset((page - 1) * limit).limit(limit).all()
    
    result = []
    for report in reports:
        # Get reporter info
        reporter = db.query(User).filter(User.id == report.reporter_id).first()
        
        report_data = {
            "id": report.id,
            "report_type": report.report_type,
            "reason": report.reason,
            "status": report.status,
            "created_at": report.created_at,
            "reporter": {
                "id": reporter.id,
                "username": reporter.username,
                "full_name": reporter.full_name
            }
        }
        
        # Add detailed target information for moderation
        if report.reported_user_id:
            user = db.query(User).filter(User.id == report.reported_user_id).first()
            report_data["target"] = {
                "type": "user",
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "email": user.email,
                "created_at": user.created_at,
                "is_verified": user.is_verified
            }
        elif report.reported_post_id:
            post = db.query(Post).filter(Post.id == report.reported_post_id).first()
            post_author = db.query(User).filter(User.id == post.user_id).first()
            report_data["target"] = {
                "type": "post",
                "id": post.id,
                "content": post.content,
                "image_urls": post.image_urls,
                "created_at": post.created_at,
                "author": {
                    "id": post_author.id,
                    "username": post_author.username,
                    "full_name": post_author.full_name
                }
            }
        elif report.reported_comment_id:
            comment = db.query(Comment).filter(Comment.id == report.reported_comment_id).first()
            comment_author = db.query(User).filter(User.id == comment.user_id).first()
            report_data["target"] = {
                "type": "comment",
                "id": comment.id,
                "content": comment.content,
                "created_at": comment.created_at,
                "author": {
                    "id": comment_author.id,
                    "username": comment_author.username,
                    "full_name": comment_author.full_name
                }
            }
        
        result.append(report_data)
    
    return {
        "success": True,
        "reports": result,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }

@router.put("/moderate/{report_id}")
async def moderate_report(
    report_id: int,
    action: str = Form(...),
    moderator_notes: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Take moderation action on a report (admin/moderator only)"""
    
    # TODO: Add proper role checking for moderators/admins
    
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")
    
    if report.status != 'pending':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este relatório já foi processado"
        )
    
    # Validate action
    valid_actions = ['none', 'warning', 'content_removed', 'account_suspended', 'account_banned', 'dismiss']
    if action not in valid_actions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ação inválida"
        )
    
    try:
        # Update report
        if action == 'dismiss':
            report.status = 'dismissed'
            report.action_taken = 'none'
        else:
            report.status = 'resolved'
            report.action_taken = action
        
        report.moderator_id = current_user.id
        report.moderator_notes = moderator_notes
        report.resolved_at = datetime.utcnow()
        
        # Take the actual moderation action
        if action == 'content_removed':
            if report.reported_post_id:
                # Soft delete post (you might want to add a deleted flag to Post model)
                post = db.query(Post).filter(Post.id == report.reported_post_id).first()
                if post:
                    # For now, we'll just mark it in the content
                    post.content = "[CONTEÚDO REMOVIDO POR MODERAÇÃO]"
            elif report.reported_comment_id:
                comment = db.query(Comment).filter(Comment.id == report.reported_comment_id).first()
                if comment:
                    comment.content = "[COMENTÁRIO REMOVIDO POR MODERAÇÃO]"
        
        elif action == 'account_suspended':
            if report.reported_user_id:
                # TODO: Implement user suspension logic
                # You might want to add suspension fields to User model
                pass
        
        elif action == 'account_banned':
            if report.reported_user_id:
                # TODO: Implement user banning logic
                # You might want to add banned fields to User model
                pass
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Relatório {('resolvido' if action != 'dismiss' else 'rejeitado')} com sucesso",
            "report": {
                "id": report.id,
                "status": report.status,
                "action_taken": report.action_taken,
                "resolved_at": report.resolved_at
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao processar relatório: {str(e)}")

@router.get("/moderate/stats")
async def get_moderation_stats(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get moderation statistics (admin/moderator only)"""
    
    # TODO: Add proper role checking for moderators/admins
    
    since_date = datetime.utcnow() - timedelta(days=days)
    
    # Total reports in period
    total_reports = db.query(Report).filter(Report.created_at >= since_date).count()
    
    # Reports by status
    pending_reports = db.query(Report).filter(
        Report.created_at >= since_date,
        Report.status == 'pending'
    ).count()
    
    resolved_reports = db.query(Report).filter(
        Report.created_at >= since_date,
        Report.status == 'resolved'
    ).count()
    
    dismissed_reports = db.query(Report).filter(
        Report.created_at >= since_date,
        Report.status == 'dismissed'
    ).count()
    
    # Reports by type
    type_stats = db.query(Report.report_type, db.func.count(Report.id)).filter(
        Report.created_at >= since_date
    ).group_by(Report.report_type).all()
    
    # Reports by action taken
    action_stats = db.query(Report.action_taken, db.func.count(Report.id)).filter(
        Report.created_at >= since_date,
        Report.status == 'resolved'
    ).group_by(Report.action_taken).all()
    
    return {
        "success": True,
        "stats": {
            "period_days": days,
            "total_reports": total_reports,
            "by_status": {
                "pending": pending_reports,
                "resolved": resolved_reports,
                "dismissed": dismissed_reports
            },
            "by_type": [{"type": type_name, "count": count} for type_name, count in type_stats],
            "by_action": [{"action": action_name, "count": count} for action_name, count in action_stats]
        }
    }

@router.get("/user/{user_id}/history")
async def get_user_report_history(
    user_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get report history for a specific user (admin/moderator only)"""
    
    # TODO: Add proper role checking for moderators/admins
    
    # Reports made by the user
    reports_made = db.query(Report).filter(Report.reporter_id == user_id).order_by(desc(Report.created_at)).all()
    
    # Reports against the user
    reports_received = db.query(Report).filter(Report.reported_user_id == user_id).order_by(desc(Report.created_at)).all()
    
    return {
        "success": True,
        "user_id": user_id,
        "reports_made": len(reports_made),
        "reports_received": len(reports_received),
        "recent_reports_made": [
            {
                "id": report.id,
                "report_type": report.report_type,
                "status": report.status,
                "created_at": report.created_at
            }
            for report in reports_made[:10]
        ],
        "recent_reports_received": [
            {
                "id": report.id,
                "report_type": report.report_type,
                "status": report.status,
                "action_taken": report.action_taken,
                "created_at": report.created_at
            }
            for report in reports_received[:10]
        ]
    }
