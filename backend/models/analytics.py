"""
Analytics and insights models
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, BigInteger, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class UserAnalytics(Base):
    __tablename__ = "user_analytics"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, nullable=False)  # Daily analytics
    profile_views = Column(Integer, default=0)
    posts_created = Column(Integer, default=0)
    stories_created = Column(Integer, default=0)
    likes_received = Column(Integer, default=0)
    comments_received = Column(Integer, default=0)
    shares_received = Column(Integer, default=0)
    followers_gained = Column(Integer, default=0)
    followers_lost = Column(Integer, default=0)
    messages_sent = Column(Integer, default=0)
    messages_received = Column(Integer, default=0)
    active_minutes = Column(Integer, default=0)
    
    user = relationship("User", backref="analytics")

class PostAnalytics(Base):
    __tablename__ = "post_analytics"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    views = Column(BigInteger, default=0)
    unique_views = Column(BigInteger, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    bookmarks = Column(Integer, default=0)
    reach = Column(BigInteger, default=0)  # Number of unique users who saw this post
    impressions = Column(BigInteger, default=0)  # Total times post was displayed
    engagement_rate = Column(Float, default=0.0)
    click_through_rate = Column(Float, default=0.0)
    
    post = relationship("Post", backref="analytics")

class StoryAnalytics(Base):
    __tablename__ = "story_analytics"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=False)
    views = Column(BigInteger, default=0)
    unique_views = Column(BigInteger, default=0)
    completion_rate = Column(Float, default=0.0)  # Percentage who viewed entire story
    replies = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    reach = Column(BigInteger, default=0)
    impressions = Column(BigInteger, default=0)
    
    story = relationship("Story", backref="analytics")

class EngagementEvent(Base):
    __tablename__ = "engagement_events"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # view, like, comment, share, follow, etc.
    target_type = Column(String(20), nullable=False)  # post, story, user, profile
    target_id = Column(Integer, nullable=False)  # ID of the target (post_id, user_id, etc.)
    metadata = Column(String(500))  # JSON with additional event data
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", backref="engagement_events")
