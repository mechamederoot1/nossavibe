"""
Two-factor authentication models
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from core.database import Base

class TwoFactorAuth(Base):
    __tablename__ = "two_factor_auth"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    secret_key = Column(String(32), nullable=False)  # Base32 encoded secret
    backup_codes = Column(Text)  # JSON array of backup codes
    enabled = Column(Boolean, default=False)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime)
    
    user = relationship("User", backref="two_factor_auth")

class TwoFactorCode(Base):
    __tablename__ = "two_factor_codes"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    code = Column(String(10), nullable=False)
    code_type = Column(String(20), default="login")  # login, setup, recovery
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(minutes=5))
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", backref="two_factor_codes")

class LoginSession(Base):
    __tablename__ = "login_sessions"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_token = Column(String(128), unique=True, nullable=False)
    device_info = Column(Text)  # JSON with device details
    ip_address = Column(String(45))  # IPv6 support
    user_agent = Column(Text)
    expires_at = Column(DateTime, nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", backref="login_sessions")
