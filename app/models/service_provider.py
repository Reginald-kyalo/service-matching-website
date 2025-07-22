from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base

class ServiceProvider(Base):
    __tablename__ = "service_providers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    business_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)
    
    # Location details
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Service details
    categories = Column(String, nullable=False)  # JSON string of categories
    specialties = Column(String, nullable=True)  # JSON string of specialties
    description = Column(Text, nullable=True)
    
    # Business details
    hourly_rate_min = Column(Float, nullable=True)
    hourly_rate_max = Column(Float, nullable=True)
    availability = Column(String, default="within_week")  # same_day, within_24h, within_week
    
    # Ratings and reviews
    average_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("service_providers.id"), nullable=False)
    session_id = Column(String, nullable=True)
    
    rating = Column(Integer, nullable=False)  # 1-5 stars
    review_text = Column(Text, nullable=True)
    service_category = Column(String, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="reviews")  
    provider = relationship("ServiceProvider", back_populates="reviews")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("service_providers.id"), nullable=False)
    
    sender_type = Column(String, nullable=False)  # 'user' or 'provider'
    message_text = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    provider = relationship("ServiceProvider")
