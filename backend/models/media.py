"""
Media file model
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class MediaFile(Base):
    __tablename__ = "media_files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255))
    file_path = Column(String(500), nullable=False)
    file_size = Column(BigInteger)  # Size in bytes
    mime_type = Column(String(100))
    media_type = Column(String(20))  # image, video, audio, document
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="media_files")
