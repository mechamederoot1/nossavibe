"""
User verification model
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class UserVerification(Base):
    __tablename__ = "user_verifications"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    verification_type = Column(String(20), default="profile")  # profile, business, celebrity
    status = Column(String(20), default="pending")  # pending, approved, rejected
    requested_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime)
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    documentation_url = Column(String(500))  # Documents provided for verification
    notes = Column(Text)  # Admin notes
    
    user = relationship("User", foreign_keys=[user_id], backref="verification_requests")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
