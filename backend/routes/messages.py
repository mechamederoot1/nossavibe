"""
Message routes for real-time chat functionality
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from typing import List, Optional
from datetime import datetime

from core.database import get_db
from models.message import Message
from models.user import User
from utils.auth import get_current_user
from schemas.misc import MessageCreate, MessageResponse, ConversationResponse

router = APIRouter(prefix="/messages", tags=["messages"])


@router.post("/", response_model=MessageResponse)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a new message"""
    
    # Verify recipient exists
    recipient = db.query(User).filter(User.id == message_data.recipient_id).first()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found"
        )
    
    # Create message
    message = Message(
        sender_id=current_user.id,
        recipient_id=message_data.recipient_id,
        content=message_data.content,
        message_type=message_data.message_type or "text",
        media_url=message_data.media_url
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Load sender info for response
    message.sender = current_user
    message.recipient = recipient
    
    return {
        "id": message.id,
        "sender": {
            "id": current_user.id,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "avatar": current_user.avatar
        },
        "content": message.content,
        "message_type": message.message_type,
        "media_url": message.media_url,
        "is_read": message.is_read,
        "created_at": message.created_at.isoformat(),
        "is_own": True
    }


@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for current user"""
    
    # Get all unique users that have conversations with current user
    conversations_query = db.query(
        User,
        func.max(Message.created_at).label('last_message_time'),
        func.count(
            Message.id.filter(
                and_(
                    Message.recipient_id == current_user.id,
                    Message.is_read == False
                )
            )
        ).label('unread_count')
    ).join(
        Message,
        or_(
            and_(Message.sender_id == User.id, Message.recipient_id == current_user.id),
            and_(Message.recipient_id == User.id, Message.sender_id == current_user.id)
        )
    ).filter(
        User.id != current_user.id
    ).group_by(User.id).order_by(desc('last_message_time'))
    
    conversations = conversations_query.all()
    
    result = []
    for user, last_message_time, unread_count in conversations:
        # Get last message for this conversation
        last_message = db.query(Message).filter(
            or_(
                and_(Message.sender_id == user.id, Message.recipient_id == current_user.id),
                and_(Message.sender_id == current_user.id, Message.recipient_id == user.id)
            )
        ).order_by(desc(Message.created_at)).first()
        
        conversation = {
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "avatar": user.avatar
            },
            "unread_count": unread_count,
            "last_message": None
        }
        
        if last_message:
            conversation["last_message"] = {
                "content": last_message.content,
                "message_type": last_message.message_type,
                "created_at": last_message.created_at.isoformat(),
                "is_read": last_message.is_read,
                "is_own": last_message.sender_id == current_user.id
            }
        
        result.append(conversation)
    
    return result


@router.get("/conversation/{user_id}", response_model=List[MessageResponse])
async def get_conversation_messages(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    """Get messages in a conversation with specific user"""
    
    # Verify the other user exists
    other_user = db.query(User).filter(User.id == user_id).first()
    if not other_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get messages between current user and specified user
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.recipient_id == user_id),
            and_(Message.sender_id == user_id, Message.recipient_id == current_user.id)
        )
    ).order_by(Message.created_at).offset(offset).limit(limit).all()
    
    result = []
    for message in messages:
        # Load sender info
        sender = db.query(User).filter(User.id == message.sender_id).first()
        
        result.append({
            "id": message.id,
            "sender": {
                "id": sender.id,
                "first_name": sender.first_name,
                "last_name": sender.last_name,
                "avatar": sender.avatar
            },
            "content": message.content,
            "message_type": message.message_type,
            "media_url": message.media_url,
            "is_read": message.is_read,
            "created_at": message.created_at.isoformat(),
            "is_own": message.sender_id == current_user.id
        })
    
    return result


@router.put("/{message_id}/read")
async def mark_message_as_read(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a message as read"""
    
    message = db.query(Message).filter(
        Message.id == message_id,
        Message.recipient_id == current_user.id
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    message.is_read = True
    message.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Message marked as read"}


@router.get("/unread/count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get total unread messages count"""
    
    unread_count = db.query(Message).filter(
        Message.recipient_id == current_user.id,
        Message.is_read == False
    ).count()
    
    return {"unread_count": unread_count}


@router.delete("/{message_id}")
async def delete_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a message (only sender can delete)"""
    
    message = db.query(Message).filter(
        Message.id == message_id,
        Message.sender_id == current_user.id
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found or you don't have permission to delete it"
        )
    
    db.delete(message)
    db.commit()
    
    return {"message": "Message deleted successfully"}
