from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.database.database import get_db
from app.models.user import User
from app.services.auth import (
    get_password_hash, 
    authenticate_user, 
    create_access_token,
    get_current_user
)

router = APIRouter()

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    address: Optional[str] = None
    # Kenyan location fields
    county: Optional[str] = None
    subCounty: Optional[str] = None
    ward: Optional[str] = None
    postalCode: Optional[str] = None
    landmark: Optional[str] = None
    fullAddress: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    # Legacy fields for backward compatibility
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    # Kenyan location fields
    county: Optional[str] = None
    sub_county: Optional[str] = None
    ward: Optional[str] = None
    postal_code: Optional[str] = None
    landmark: Optional[str] = None
    full_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    # Legacy fields for backward compatibility
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    user_type: str = "client"  # Include user_type for proper frontend handling
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

@router.post("/register", response_model=TokenResponse)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
        phone=user_data.phone,
        address=user_data.address,
        # Kenyan location fields
        county=user_data.county,
        sub_county=user_data.subCounty,
        ward=user_data.ward,
        postal_code=user_data.postalCode,
        landmark=user_data.landmark,
        full_address=user_data.fullAddress,
        latitude=user_data.latitude,
        longitude=user_data.longitude,
        # Legacy fields for backward compatibility (map from Kenyan fields)
        city=user_data.county or user_data.city,  # Use county if available, fallback to city
        state=user_data.subCounty or user_data.state,  # Use sub_county if available, fallback to state
        zip_code=user_data.postalCode or user_data.zip_code  # Use postalCode if available, fallback to zip_code
    )
    
    # Use provided coordinates if available, otherwise generate mock coordinates for Kenya
    if not new_user.latitude and new_user.county:
        # Mock coordinates for Kenya (Nairobi area as default)
        new_user.latitude = -1.2921 + (hash(user_data.email) % 100) * 0.01
        new_user.longitude = 36.8219 + (hash(user_data.email) % 100) * 0.01
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(new_user)
    )

@router.post("/login", response_model=TokenResponse)
async def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse.from_orm(current_user)

@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    
    current_user.name = user_update.name
    current_user.phone = user_update.phone
    current_user.address = user_update.address
    current_user.city = user_update.city
    current_user.state = user_update.state
    current_user.zip_code = user_update.zip_code
    
    # Update coordinates if location changed
    if user_update.city and user_update.state:
        current_user.latitude = 39.7817 + (hash(user_update.email) % 100) * 0.001
        current_user.longitude = -89.6501 + (hash(user_update.email) % 100) * 0.001
    
    db.commit()
    db.refresh(current_user)
    
    return UserResponse.from_orm(current_user)
