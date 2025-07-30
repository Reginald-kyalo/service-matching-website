"""
Provider registration and management routes
"""

from fastapi import APIRouter, HTTPException, Form, Depends
from fastapi.responses import JSONResponse
import json
import logging
from typing import Optional, List
from datetime import datetime

from ..database.database import get_db
from ..models.service_provider import ServiceProvider

router = APIRouter()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/apply")
async def submit_provider_application(
    fullName: str = Form(...),
    businessName: Optional[str] = Form(None),
    email: str = Form(...),
    phone: str = Form(...),
    description: Optional[str] = Form(None),
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
    selectedCategories: str = Form(...),
    selectedServices: str = Form(...),
    minRate: str = Form(...),
    maxRate: str = Form(...),
    pricingNotes: Optional[str] = Form(None),
    db = Depends(get_db)
):
    """
    Submit a new provider application
    """
    try:
        logger.info(f"Processing provider application for: {fullName}")
        
        # Parse JSON fields
        try:
            categories = json.loads(selectedCategories) if selectedCategories else []
            services = json.loads(selectedServices) if selectedServices else []
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            raise HTTPException(status_code=400, detail="Invalid service selection format")
        
        # Validate required fields
        if not fullName or not email or not phone:
            raise HTTPException(status_code=400, detail="Missing required fields: fullName, email, or phone")
        
        if not county or not subCounty or not ward:
            raise HTTPException(status_code=400, detail="Missing required location fields")
        
        if not categories and not services:
            raise HTTPException(status_code=400, detail="At least one service category or specific service must be selected")
        
        # Validate rates
        try:
            min_rate = float(minRate) if minRate else 0
            max_rate = float(maxRate) if maxRate else 0
            travel_fee = float(travelFee) if travelFee else 0
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid rate values")
        
        # Create provider record
        provider_data = {
            'name': fullName,  # Use 'name' instead of 'full_name' to match model
            'business_name': businessName,
            'email': email,
            'phone': phone,
            'description': description,
            'response_time': responseTime,
            'county': county,
            'sub_county': subCounty,
            'ward': ward,
            'specific_location': specificLocation,
            'service_radius': serviceRadius,
            'travel_fee': travel_fee,
            'landmark': landmark,
            'postal_code': postalCode,
            'service_areas_description': serviceAreasDescription,
            'latitude': float(latitude) if latitude else None,
            'longitude': float(longitude) if longitude else None,
            'full_address': fullAddress,
            'manual_address': manualAddress,
            # Compatibility fields for matching service
            'city': county,  # Map county to city for matching compatibility
            'state': subCounty,  # Map sub_county to state for matching compatibility
            'zip_code': postalCode,  # Map postal_code to zip_code 
            'address': specificLocation or fullAddress or f"{ward}, {subCounty}",
            'categories': json.dumps(categories),  # Use 'categories' for matching
            'services': json.dumps(services),  # Use 'services' instead of 'selected_services'
            'specialties': json.dumps([]),  # Initialize empty specialties
            'hourly_rate_min': min_rate,  # Use correct field names
            'hourly_rate_max': max_rate,
            'pricing_notes': pricingNotes,
            'application_status': 'pending',  # Use correct field name
            'availability': responseTime  # Map response time to availability for matching
        }
        
        # Create new provider
        provider = ServiceProvider(**provider_data)
        
        # Save to database
        db_provider = provider.save_to_db(db)
        
        logger.info(f"Provider application submitted successfully for: {fullName}")
        
        return JSONResponse(
            status_code=201,
            content={
                "success": True,
                "message": "Application submitted successfully",
                "provider_id": db_provider.get('id') if db_provider else None
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing provider application: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your application. Please try again."
        )

@router.get("/applications")
async def get_provider_applications(db = Depends(get_db)):
    """
    Get all provider applications (admin endpoint)
    """
    try:
        # This would typically require admin authentication
        providers = ServiceProvider.get_all(db)
        return JSONResponse(content={"providers": providers})
    except Exception as e:
        logger.error(f"Error fetching provider applications: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching applications")

@router.get("/application/{provider_id}")
async def get_provider_application(provider_id: int, db = Depends(get_db)):
    """
    Get a specific provider application
    """
    try:
        provider = ServiceProvider.get_by_id(provider_id, db)
        if not provider:
            raise HTTPException(status_code=404, detail="Provider application not found")
        return JSONResponse(content={"provider": provider})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching provider application: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching application")

@router.put("/application/{provider_id}/status")
async def update_provider_status(
    provider_id: int,
    status: str = Form(...),
    db = Depends(get_db)
):
    """
    Update provider application status (admin endpoint)
    """
    try:
        valid_statuses = ['pending', 'approved', 'rejected', 'under_review']
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        provider = ServiceProvider.get_by_id(provider_id, db)
        if not provider:
            raise HTTPException(status_code=404, detail="Provider application not found")
        
        # Update status
        updated_provider = ServiceProvider.update_status(provider_id, status, db)
        
        return JSONResponse(content={
            "success": True,
            "message": "Provider status updated successfully",
            "provider": updated_provider
        })
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating provider status: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating provider status")
