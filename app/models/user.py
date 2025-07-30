from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean
from sqlalchemy.sql import func
from app.database.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    user_type = Column(String, default="client")  # 'client' or 'provider'
    
    # Location details (Kenyan administrative hierarchy)
    address = Column(String, nullable=True)  # Street address/estate/building
    county = Column(String, nullable=True)
    sub_county = Column(String, nullable=True)
    ward = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    landmark = Column(String, nullable=True)
    full_address = Column(String, nullable=True)  # From Google Maps
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Legacy location fields (for backward compatibility)
    city = Column(String, nullable=True)  # Maps to county
    state = Column(String, nullable=True)  # Maps to sub_county
    zip_code = Column(String, nullable=True)  # Maps to postal_code
    
    # Profile
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())