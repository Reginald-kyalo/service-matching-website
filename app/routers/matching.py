from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database.database import get_db
from app.services.auth import get_current_user
from app.services.matching import ServiceMatchingService, MatchedProvider
from app.models.user import User
from app.models.service_provider import ChatMessage, ServiceProvider
from datetime import datetime

router = APIRouter()

# Pydantic models
class ProviderMatchRequest(BaseModel):
    category: str
    max_distance: Optional[float] = 50.0
    min_rating: Optional[float] = 0.0
    max_rate: Optional[float] = None
    availability: Optional[str] = None

class ProviderMatchResponse(BaseModel):
    id: int
    name: str
    business_name: str
    phone: str
    email: str
    address: str
    city: str
    state: str
    distance_miles: float
    average_rating: float
    total_reviews: int
    hourly_rate_min: float
    hourly_rate_max: float
    availability: str
    specialties: List[str]
    description: str

class ChatMessageCreate(BaseModel):
    provider_id: int
    message_text: str
    session_id: str

class ChatMessageResponse(BaseModel):
    id: int
    sender_type: str
    message_text: str
    created_at: datetime
    sender_name: str

class ReviewCreate(BaseModel):
    provider_id: int
    rating: int  # 1-5 stars
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    rating: int
    comment: str
    created_at: datetime
    user_name: str

# Initialize matching service
matching_service = ServiceMatchingService()

@router.post("/find-providers", response_model=List[ProviderMatchResponse])
async def find_service_providers(
    request: ProviderMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Find service providers based on location and filters"""
    
    if not current_user.city or not current_user.state:
        raise HTTPException(
            status_code=400,
            detail="Please update your profile with your location to find nearby providers"
        )
    
    # Seed sample data if no providers exist
    provider_count = db.query(ServiceProvider).count()
    if provider_count == 0:
        matching_service.seed_sample_providers(db)
    
    matched_providers = matching_service.find_providers(
        db=db,
        user=current_user,
        category=request.category,
        max_distance=request.max_distance,
        min_rating=request.min_rating,
        max_rate=request.max_rate,
        availability=request.availability
    )
    
    return [
        ProviderMatchResponse(
            id=provider.id,
            name=provider.name,
            business_name=provider.business_name,
            phone=provider.phone,
            email=provider.email,
            address=provider.address,
            city=provider.city,
            state=provider.state,
            distance_miles=provider.distance_miles,
            average_rating=provider.average_rating,
            total_reviews=provider.total_reviews,
            hourly_rate_min=provider.hourly_rate_min,
            hourly_rate_max=provider.hourly_rate_max,
            availability=provider.availability,
            specialties=provider.specialties,
            description=provider.description
        )
        for provider in matched_providers
    ]

@router.post("/chat/send")
async def send_chat_message(
    message: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a chat message to a service provider"""
    
    # Verify provider exists
    provider = db.query(ServiceProvider).filter(
        ServiceProvider.id == message.provider_id
    ).first()
    
    if not provider:
        raise HTTPException(status_code=404, detail="Service provider not found")
    
    # Create chat message
    chat_message = ChatMessage(
        session_id=message.session_id,
        user_id=current_user.id,
        provider_id=message.provider_id,
        sender_type="user",
        message_text=message.message_text
    )
    
    db.add(chat_message)
    db.commit()
    db.refresh(chat_message)
    
    return {
        "message": "Message sent successfully",
        "chat_id": chat_message.id
    }

@router.get("/chat/{session_id}", response_model=List[ChatMessageResponse])
async def get_chat_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get chat messages for a session"""
    
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id,
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    response_messages = []
    for msg in messages:
        if msg.sender_type == "user":
            sender_name = current_user.name
        else:
            provider = db.query(ServiceProvider).filter(
                ServiceProvider.id == msg.provider_id
            ).first()
            sender_name = provider.name if provider else "Provider"
        
        response_messages.append(
            ChatMessageResponse(
                id=msg.id,
                sender_type=msg.sender_type,
                message_text=msg.message_text,
                created_at=msg.created_at,
                sender_name=sender_name
            )
        )
    
    return response_messages

@router.get("/provider/{provider_id}")
async def get_provider_details(
    provider_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed information about a service provider"""
    
    provider = db.query(ServiceProvider).filter(
        ServiceProvider.id == provider_id
    ).first()
    
    if not provider:
        raise HTTPException(status_code=404, detail="Service provider not found")
    
    return {
        "id": provider.id,
        "name": provider.name,
        "business_name": provider.business_name,
        "phone": provider.phone,
        "email": provider.email,
        "address": f"{provider.address}, {provider.city}, {provider.state} {provider.zip_code}",
        "description": provider.description,
        "specialties": provider.specialties,
        "average_rating": provider.average_rating,
        "total_reviews": provider.total_reviews,
        "hourly_rate_min": provider.hourly_rate_min,
        "hourly_rate_max": provider.hourly_rate_max,
        "availability": provider.availability,
        "is_verified": provider.is_verified
    }

@router.post("/review")
async def submit_review(
    review: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a review for a service provider"""
    
    # Check if provider exists
    provider = db.query(ServiceProvider).filter(
        ServiceProvider.id == review.provider_id
    ).first()
    
    if not provider:
        raise HTTPException(status_code=404, detail="Service provider not found")
    
    # Check if user already reviewed this provider
    from app.models.service_provider import Review
    existing_review = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.provider_id == review.provider_id
    ).first()
    
    if existing_review:
        # Update existing review
        existing_review.rating = review.rating
        existing_review.review_text = review.comment or ""
        existing_review.created_at = datetime.utcnow()
    else:
        # Create new review
        new_review = Review(
            user_id=current_user.id,
            provider_id=review.provider_id,
            rating=review.rating,
            review_text=review.comment or "",
            service_category="general"  # Default category
        )
        db.add(new_review)
    
    db.commit()
    
    # Update provider's average rating
    reviews = db.query(Review).filter(Review.provider_id == review.provider_id).all()
    if reviews:
        avg_rating = sum(r.rating for r in reviews) / len(reviews)
        provider.average_rating = round(avg_rating, 1)
        provider.total_reviews = len(reviews)
        db.commit()
    
    return {"message": "Review submitted successfully"}

@router.get("/provider/{provider_id}/reviews", response_model=List[ReviewResponse])
async def get_provider_reviews(
    provider_id: int,
    db: Session = Depends(get_db)
):
    """Get reviews for a service provider"""
    
    from app.models.service_provider import Review
    reviews = db.query(Review).filter(
        Review.provider_id == provider_id
    ).order_by(Review.created_at.desc()).all()
    
    response_reviews = []
    for review in reviews:
        user = db.query(User).filter(User.id == review.user_id).first()
        response_reviews.append(
            ReviewResponse(
                id=review.id,
                rating=review.rating,
                comment=review.review_text or "",
                created_at=review.created_at,
                user_name=user.name if user else "Anonymous"
            )
        )
    
    return response_reviews
