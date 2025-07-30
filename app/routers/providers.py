"""
Provider application and management routes
"""

from fastapi import APIRouter, HTTPException, Depends, Form, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import json
from datetime import datetime

from app.database.database import get_db
from app.models.service_provider import ServiceProvider
from app.models.user import User

router = APIRouter()

class ProviderApplicationData(BaseModel):
    fullName: str
    businessName: Optional[str] = None
    email: str
    phone: str
    description: Optional[str] = None
    selectedCategories: List[str]
    selectedServices: List[str]
    responseTime: str
    county: str
    subCounty: str
    ward: str
    specificLocation: Optional[str] = None
    serviceRadius: str
    travelFee: Optional[float] = None
    landmark: Optional[str] = None
    postalCode: Optional[str] = None
    serviceAreasDescription: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    fullAddress: Optional[str] = None
    manualAddress: Optional[str] = None
    minRate: float
    maxRate: float
    pricingNotes: Optional[str] = None

@router.post("/api/provider/apply")
async def submit_provider_application(
    request: Request,
    fullName: str = Form(...),
    businessName: Optional[str] = Form(None),
    email: str = Form(...),
    phone: str = Form(...),
    description: Optional[str] = Form(None),
    selectedCategories: str = Form(...),
    selectedServices: str = Form(...),
    responseTime: str = Form(...),
    county: str = Form(...),
    subCounty: str = Form(...),
    ward: str = Form(...),
    specificLocation: Optional[str] = Form(None),
    serviceRadius: str = Form(...),
    travelFee: Optional[str] = Form(None),
    landmark: Optional[str] = Form(None),
    postalCode: Optional[str] = Form(None),
    serviceAreasDescription: Optional[str] = Form(None),
    latitude: Optional[str] = Form(None),
    longitude: Optional[str] = Form(None),
    fullAddress: Optional[str] = Form(None),
    manualAddress: Optional[str] = Form(None),
    minRate: str = Form(...),
    maxRate: str = Form(...),
    pricingNotes: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Submit a provider application
    """
    try:
        # Debug: Log received data
        print(f"DEBUG: Received application from {fullName}")
        print(f"DEBUG: Email: {email}")
        print(f"DEBUG: Phone: {phone}")
        print(f"DEBUG: County: {county}, SubCounty: {subCounty}, Ward: {ward}")
        print(f"DEBUG: Selected Categories: {selectedCategories}")
        print(f"DEBUG: Selected Services: {selectedServices}")
        print(f"DEBUG: Min Rate: {minRate}, Max Rate: {maxRate}")
        
        # Parse JSON fields
        try:
            selected_categories = json.loads(selectedCategories) if selectedCategories else []
        except json.JSONDecodeError:
            selected_categories = []
            
        try:
            selected_services = json.loads(selectedServices) if selectedServices else []
        except json.JSONDecodeError:
            selected_services = []
        
        # Convert numeric fields
        try:
            travel_fee_float = float(travelFee) if travelFee else None
        except (ValueError, TypeError):
            travel_fee_float = None
            
        try:
            latitude_float = float(latitude) if latitude else None
        except (ValueError, TypeError):
            latitude_float = None
            
        try:
            longitude_float = float(longitude) if longitude else None
        except (ValueError, TypeError):
            longitude_float = None
            
        try:
            min_rate_float = float(minRate)
            max_rate_float = float(maxRate)
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Invalid rate values")
        
        # Validate rate range
        if min_rate_float >= max_rate_float:
            raise HTTPException(status_code=400, detail="Maximum rate must be higher than minimum rate")
        
        # Create provider application data
        application_data = {
            'fullName': fullName,
            'businessName': businessName,
            'email': email,
            'phone': phone,
            'description': description,
            'selectedCategories': selected_categories,
            'selectedServices': selected_services,
            'responseTime': responseTime,
            'county': county,
            'subCounty': subCounty,
            'ward': ward,
            'specificLocation': specificLocation,
            'serviceRadius': serviceRadius,
            'travelFee': travel_fee_float,
            'landmark': landmark,
            'postalCode': postalCode,
            'serviceAreasDescription': serviceAreasDescription,
            'latitude': latitude_float,
            'longitude': longitude_float,
            'fullAddress': fullAddress,
            'manualAddress': manualAddress,
            'minRate': min_rate_float,
            'maxRate': max_rate_float,
            'pricingNotes': pricingNotes
        }
        
        # Check if user is currently logged in (existing client becoming provider)
        existing_user = db.query(User).filter(User.email == email).first()
        user_transition = False
        
        # Check if email already exists as a provider
        existing_provider = db.query(ServiceProvider).filter(
            ServiceProvider.email == email
        ).first()
        
        if existing_provider:
            return JSONResponse(
                status_code=400,
                content={"error": "A provider with this email already exists"}
            )
        
        # Create location string
        location_parts = [
            specificLocation,
            ward,
            subCounty,
            county
        ]
        location = ', '.join([part for part in location_parts if part])
        
        # Combine service categories and specific services
        all_services = []
        if selected_categories:
            all_services.extend(selected_categories)
        if selected_services:
            # Extract service names from "category:service" format
            service_names = [service.split(':', 1)[1] for service in selected_services if ':' in service]
            all_services.extend(service_names)
        
        # Create new provider application
        new_provider = ServiceProvider(
            name=fullName,
            business_name=businessName,
            email=email,
            phone=phone,
            description=description or '',
            services=json.dumps(all_services),
            location=location,
            county=county,
            sub_county=subCounty,
            ward=ward,
            specific_location=specificLocation,
            service_radius=serviceRadius,
            travel_fee=travel_fee_float,
            landmark=landmark,
            postal_code=postalCode,
            service_areas_description=serviceAreasDescription,
            latitude=latitude_float,
            longitude=longitude_float,
            full_address=fullAddress,
            manual_address=manualAddress,
            hourly_rate_min=min_rate_float,
            hourly_rate_max=max_rate_float,
            pricing_notes=application_data.get('pricingNotes'),
            response_time=application_data['responseTime'],
            availability_status='pending',  # Application needs to be reviewed
            is_verified=False,
            created_at=datetime.utcnow()
        )
        
        # Save to database
        db.add(new_provider)
        db.commit()
        db.refresh(new_provider)
        
        # Handle user account transition if existing user
        if existing_user:
            # Update existing user to provider status
            existing_user.user_type = 'provider'
            existing_user.name = fullName  # Update name if different
            existing_user.phone = phone    # Update phone if different
            db.commit()
            user_transition = True
            print(f"DEBUG: Transitioned existing user {email} to provider")
        
        response_data = {
            "message": "Provider application submitted successfully",
            "provider_id": new_provider.id,
            "status": "pending_review",
            "user_transition": user_transition,
            "redirect_to": "/provider-dashboard" if user_transition else None
        }
        
        # Set session data for immediate provider access if user transitioned
        if user_transition and existing_user:
            response_data["user_data"] = {
                "id": existing_user.id,
                "email": existing_user.email,
                "name": existing_user.name,
                "user_type": "provider",
                "provider_id": new_provider.id,
                "phone": existing_user.phone,
                "address": existing_user.address,
                "city": existing_user.city,
                "state": existing_user.state,
                "zip_code": existing_user.zip_code
            }
        
        return JSONResponse(
            status_code=201,
            content=response_data
        )
        
    except Exception as e:
        db.rollback()
        print(f"Error submitting provider application: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": "An error occurred while submitting your application. Please try again."}
        )

@router.get("/api/provider/application/{provider_id}")
async def get_provider_application(
    provider_id: int,
    db: Session = Depends(get_db)
):
    """
    Get provider application details
    """
    try:
        provider = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
        
        if not provider:
            raise HTTPException(status_code=404, detail="Provider application not found")
        
        return {
            "id": provider.id,
            "name": provider.name,
            "email": provider.email,
            "status": provider.availability_status,
            "is_verified": provider.is_verified,
            "created_at": provider.created_at,
            "location": provider.location
        }
        
    except Exception as e:
        print(f"Error getting provider application: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching application details")
