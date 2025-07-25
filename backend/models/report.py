"""
Modelo para sistema de denúncias
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from datetime import datetime
import enum

from core.database import Base

class ReportType(enum.Enum):
    spam = "spam"
    harassment = "harassment"
    inappropriate_content = "inappropriate_content"
    fake_profile = "fake_profile"
    violence = "violence"
    hate_speech = "hate_speech"
    other = "other"

class ReportStatus(enum.Enum):
    pending = "pending"
    under_review = "under_review"
    resolved = "resolved"
    dismissed = "dismissed"

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reported_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_type = Column(Enum(ReportType), nullable=False)
    description = Column(Text)
    status = Column(Enum(ReportStatus), default=ReportStatus.pending)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    admin_notes = Column(Text, nullable=True)
