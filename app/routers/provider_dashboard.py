from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import json
from datetime import datetime, timedelta

from app.database.database import get_db
from app.models.service_provider import ServiceProvider
from app.models.user import User
from app.services.auth import get_current_user, create_access_token
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/providers", tags=["providers"])

class ProviderApplicationSchema(BaseModel):
    fullName: str
    businessName: str = None
    email: EmailStr
    phone: str
    description: str = None
    serviceCategories: List[str]
    responseTime: str
    primaryLocation: str
    address: str = None
    serviceRadius: str
    minRate: int
    maxRate: int
    pricingNotes: str = None

class ProviderStatsSchema(BaseModel):
    newRequests: int = 0
    activeChats: int = 0
    averageRating: float = 0.0
    completedJobs: int = 0

class ProviderProfileUpdateSchema(BaseModel):
    fullName: Optional[str] = None
    businessName: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    minRate: Optional[float] = None
    maxRate: Optional[float] = None
    pricingNotes: Optional[str] = None
    responseTime: Optional[str] = None
    serviceRadius: Optional[str] = None
    travelFee: Optional[float] = None

class ServiceCategoryUpdateSchema(BaseModel):
    service_ids: List[str]

@router.post("/apply")
async def apply_as_provider(
    application: ProviderApplicationSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Submit provider application"""
    
    # Check if user already exists with this email
    existing_user = db.query(User).filter(User.email == application.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if provider application already exists
    existing_provider = db.query(ServiceProvider).filter(
        ServiceProvider.email == application.email
    ).first()
    if existing_provider:
        raise HTTPException(status_code=400, detail="Application already submitted")
    
    try:
        # Create provider application
        provider = ServiceProvider(
            name=application.fullName,
            business_name=application.businessName,
            email=application.email,
            phone=application.phone,
            description=application.description,
            categories=json.dumps(application.serviceCategories),
            response_time=application.responseTime,
            primary_location=application.primaryLocation,
            address=application.address,
            service_radius=application.serviceRadius,
            hourly_rate_min=application.minRate,
            hourly_rate_max=application.maxRate,
            pricing_notes=application.pricingNotes,
            application_status="pending"
        )
        
        db.add(provider)
        db.commit()
        db.refresh(provider)
        
        # Send confirmation email (background task)
        background_tasks.add_task(
            send_application_confirmation_email,
            application.email,
            application.fullName
        )
        
        return {
            "message": "Application submitted successfully",
            "application_id": provider.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to submit application")

@router.get("/dashboard/stats")
async def get_provider_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ProviderStatsSchema:
    """Get provider dashboard statistics"""
    
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")
    
    # Get provider record
    provider = db.query(ServiceProvider).filter(
        ServiceProvider.email == current_user.email
    ).first()
    
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Calculate stats (placeholder - implement actual logic)
    stats = ProviderStatsSchema(
        newRequests=0,  # Count of new service requests
        activeChats=0,  # Count of active conversations
        averageRating=provider.average_rating,
        completedJobs=0  # Count of completed jobs
    )
    
    return stats

@router.get("/requests")
async def get_provider_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get service requests for provider"""
    
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")
    
    # Get provider record
    provider = db.query(ServiceProvider).filter(
        ServiceProvider.email == current_user.email
    ).first()
    
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Get matching requests based on provider's categories and location
    # This is a placeholder - implement actual matching logic
    requests = []
    
    return requests

@router.get("/conversations")
async def get_provider_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get active conversations for provider"""
    
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")
    
    # Get provider record
    provider = db.query(ServiceProvider).filter(
        ServiceProvider.email == current_user.email
    ).first()
    
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Get conversations - placeholder
    conversations = []
    
    return conversations

@router.post("/requests/{request_id}/accept")
async def accept_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept a service request"""
    
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")
    
    # Implementation placeholder
    return {"message": "Request accepted successfully"}

@router.post("/requests/{request_id}/decline")
async def decline_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Decline a service request"""
    
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")
    
    # Implementation placeholder
    return {"message": "Request declined"}

@router.get("/profile")
async def get_provider_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current provider's profile"""
    
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")
    
    # Get provider record
    provider = db.query(ServiceProvider).filter(ServiceProvider.email == current_user.email).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    
    # Return profile data with correct field names
    return {
        "full_name": provider.name,
        "business_name": provider.business_name,
        "email": provider.email,
        "phone": provider.phone,
        "description": provider.description,
        "min_rate": provider.hourly_rate_min,
        "max_rate": provider.hourly_rate_max,
        "pricing_notes": provider.pricing_notes,
        "response_time": provider.response_time,
        "service_radius": provider.service_radius,
        "travel_fee": provider.travel_fee,
        "county": provider.county,
        "sub_county": provider.sub_county,
        "ward": provider.ward,
        "specific_location": provider.specific_location,
        "created_at": provider.created_at
    }

@router.put("/profile")
async def update_provider_profile(
    profile_data: ProviderProfileUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current provider's profile"""
    
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")
    
    # Debug: Print received data
    print(f"Received profile data: {profile_data.dict()}")
    
    # Get provider record
    provider = db.query(ServiceProvider).filter(ServiceProvider.email == current_user.email).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    
    # Update fields that are provided with correct field mapping
    update_data = profile_data.dict(exclude_unset=True)
    print(f"Update data (exclude_unset): {update_data}")
    
    # Map frontend field names to model field names
    field_mapping = {
        'fullName': 'name',
        'businessName': 'business_name',
        'minRate': 'hourly_rate_min',
        'maxRate': 'hourly_rate_max',
        'pricingNotes': 'pricing_notes',
        'responseTime': 'response_time',
        'serviceRadius': 'service_radius',
        'travelFee': 'travel_fee'
    }
    
    for frontend_field, model_field in field_mapping.items():
        if frontend_field in update_data:
            setattr(provider, model_field, update_data[frontend_field])
    
    # Handle fields that don't need mapping
    for field in ['phone', 'description']:
        if field in update_data:
            setattr(provider, field, update_data[field])
    
    try:
        db.commit()
        db.refresh(provider)
        
        return {"message": "Profile updated successfully", "provider": {
            "full_name": provider.name,
            "business_name": provider.business_name,
            "email": provider.email,
            "phone": provider.phone,
            "description": provider.description,
            "min_rate": provider.hourly_rate_min,
            "max_rate": provider.hourly_rate_max,
            "pricing_notes": provider.pricing_notes,
            "response_time": provider.response_time,
            "service_radius": provider.service_radius,
            "travel_fee": provider.travel_fee
        }}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update profile")

@router.get("/services")
async def get_provider_services(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get provider's current services"""
    
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")
    
    # Get provider record
    provider = db.query(ServiceProvider).filter(ServiceProvider.email == current_user.email).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    
    # Parse services from provider record
    services = []
    if provider.services:
        try:
            # If services is stored as JSON string
            if isinstance(provider.services, str):
                service_list = json.loads(provider.services)
            else:
                service_list = provider.services
            
            # Convert to service objects
            for service_id in service_list:
                services.append({
                    "id": service_id,
                    "name": service_id.replace('_', ' ').title(),
                    "category": service_id,
                    "service_name": service_id.replace('_', ' ').title()
                })
        except (json.JSONDecodeError, TypeError):
            # If it's a simple string, split by comma
            service_list = provider.services.split(',') if provider.services else []
            for service_id in service_list:
                service_id = service_id.strip()
                if service_id:
                    services.append({
                        "id": service_id,
                        "name": service_id.replace('_', ' ').title(),
                        "category": service_id,
                        "service_name": service_id.replace('_', ' ').title()
                    })
    
    return services

@router.put("/services")
async def update_provider_services(
    services_data: ServiceCategoryUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update provider's services"""
    
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")
    
    # Get provider record
    provider = db.query(ServiceProvider).filter(ServiceProvider.email == current_user.email).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    
    try:
        # Update services field
        provider.services = json.dumps(services_data.service_ids)
        
        db.commit()
        db.refresh(provider)
        
        return {"message": "Services updated successfully", "service_count": len(services_data.service_ids)}
        
    except Exception as e:
        db.rollback()
        print(f"Error updating services: {e}")
        raise HTTPException(status_code=500, detail="Failed to update services")

# Client dashboard routes
@router.get("/clients/dashboard/stats", tags=["clients"])
async def get_client_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get client dashboard statistics"""
    
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Client access required")
    
    # Calculate stats - placeholder
    stats = {
        "activeRequests": 0,
        "activeChats": 0,
        "completed": 0,
        "totalSpent": 0
    }
    
    return stats

@router.get("/clients/requests", tags=["clients"])
async def get_client_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get client's service requests"""
    
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Client access required")
    
    # Get user's requests - placeholder
    requests = []
    
    return requests

@router.get("/clients/conversations", tags=["clients"])
async def get_client_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get client's conversations"""
    
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Client access required")
    
    # Get conversations - placeholder
    conversations = []
    
    return conversations

@router.get("/clients/activity", tags=["clients"])
async def get_client_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get client's recent activity"""
    
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Client access required")
    
    # Get activity - placeholder
    activity = []
    
    return activity

@router.post("/clients/requests/{request_id}/cancel", tags=["clients"])
async def cancel_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a service request"""
    
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Client access required")
    
    # Implementation placeholder
    return {"message": "Request cancelled successfully"}

def send_application_confirmation_email(email: str, name: str):
    """Send confirmation email to provider after application submission"""
    
    # Email content
    subject = "ServiceMatch Provider Application Received"
    body = f"""
    Dear {name},

    Thank you for applying to become a ServiceMatch provider!

    We have received your application and our team will review it within 24-48 hours. 
    You'll receive an email notification once your application has been processed.

    What happens next?
    1. Our team reviews your application
    2. We may contact you for additional information
    3. Once approved, you'll receive login credentials and access to your provider dashboard

    If you have any questions, please don't hesitate to contact our support team.

    Best regards,
    The ServiceMatch Team
    """
    
    # TODO: Implement actual email sending
    # For now, just log the email content
    print(f"Email to {email}: {subject}")
    print(body)
