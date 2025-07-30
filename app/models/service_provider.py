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
    
    # Location details (Kenya-specific administrative hierarchy)
    location = Column(String, nullable=True)  # Combined location string
    county = Column(String, nullable=False)
    sub_county = Column(String, nullable=False)
    ward = Column(String, nullable=False)
    specific_location = Column(String, nullable=True)  # Estate/area
    service_radius = Column(String, default="20")  # Service radius in km or "county"
    travel_fee = Column(Float, nullable=True)  # Travel fee per km in KSH
    landmark = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    service_areas_description = Column(Text, nullable=True)
    
    # Map coordinates
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    full_address = Column(String, nullable=True)  # From map/geocoding
    manual_address = Column(Text, nullable=True)  # Manual address entry
    
    # Legacy location fields (for backward compatibility)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)  # Maps to county for Kenya
    state = Column(String, nullable=True)  # Maps to sub_county for Kenya  
    zip_code = Column(String, nullable=True)  # Maps to postal_code
    primary_location = Column(String, nullable=True)
    
    # Service details
    services = Column(Text, nullable=True)  # JSON string of selected services
    categories = Column(String, nullable=True)  # JSON string of categories (legacy)
    specialties = Column(String, nullable=True)  # JSON string of specialties (legacy)
    description = Column(Text, nullable=True)
    response_time = Column(String, default="within_week")  # same_day, within_48h, within_week
    availability = Column(String, default="same_day")  # For matching service compatibility
    
    # Business details (KSH pricing)
    hourly_rate_min = Column(Float, nullable=True)  # KSH per hour
    hourly_rate_max = Column(Float, nullable=True)  # KSH per hour
    pricing_notes = Column(Text, nullable=True)
    
    # Ratings and reviews
    average_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    
    # Status and verification
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    availability_status = Column(String, default="pending")  # pending, approved, rejected, available, busy
    application_status = Column(String, default="pending")  # pending, approved, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    reviews = relationship("Review", back_populates="provider")

    def save_to_db(self, db):
        """Save provider to database"""
        try:
            db.add(self)
            db.commit()
            db.refresh(self)
            return {
                'id': self.id,
                'full_name': self.full_name,
                'email': self.email,
                'status': self.status
            }
        except Exception as e:
            db.rollback()
            raise e
    
    @classmethod
    def get_all(cls, db):
        """Get all providers"""
        try:
            providers = db.query(cls).all()
            return [
                {
                    'id': p.id,
                    'full_name': p.full_name,
                    'business_name': p.business_name,
                    'email': p.email,
                    'phone': p.phone,
                    'county': p.county,
                    'sub_county': p.sub_county,
                    'ward': p.ward,
                    'status': p.status,
                    'created_at': p.created_at.isoformat() if p.created_at else None
                }
                for p in providers
            ]
        except Exception as e:
            raise e
    
    @classmethod
    def get_by_id(cls, provider_id: int, db):
        """Get provider by ID"""
        try:
            provider = db.query(cls).filter(cls.id == provider_id).first()
            if provider:
                return {
                    'id': provider.id,
                    'full_name': provider.full_name,
                    'business_name': provider.business_name,
                    'email': provider.email,
                    'phone': provider.phone,
                    'description': provider.description,
                    'county': provider.county,
                    'sub_county': provider.sub_county,
                    'ward': provider.ward,
                    'specific_location': provider.specific_location,
                    'service_radius': provider.service_radius,
                    'selected_categories': provider.selected_categories,
                    'selected_services': provider.selected_services,
                    'min_rate': provider.min_rate,
                    'max_rate': provider.max_rate,
                    'status': provider.status,
                    'created_at': provider.created_at.isoformat() if provider.created_at else None
                }
            return None
        except Exception as e:
            raise e
    
    @classmethod
    def update_status(cls, provider_id: int, status: str, db):
        """Update provider status"""
        try:
            provider = db.query(cls).filter(cls.id == provider_id).first()
            if provider:
                provider.status = status
                provider.updated_at = func.now()
                db.commit()
                db.refresh(provider)
                return cls.get_by_id(provider_id, db)
            return None
        except Exception as e:
            db.rollback()
            raise e

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
