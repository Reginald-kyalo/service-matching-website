import math
import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.models.service_provider import ServiceProvider
from app.models.user import User
from dataclasses import dataclass

@dataclass
class MatchedProvider:
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

class ServiceMatchingService:
    """Service for matching users with service providers based on location and preferences."""
    
    def __init__(self):
        pass
    
    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points in miles using Haversine formula."""
        if not all([lat1, lon1, lat2, lon2]):
            return 999.0  # Return large distance if coordinates missing
            
        R = 3959  # Earth's radius in miles
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_lat/2) * math.sin(delta_lat/2) +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lon/2) * math.sin(delta_lon/2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    def find_providers(
        self, 
        db: Session, 
        user: User, 
        category: str,
        max_distance: float = 50.0,
        min_rating: float = 0.0,
        max_rate: Optional[float] = None,
        availability: Optional[str] = None
    ) -> List[MatchedProvider]:
        """Find service providers matching criteria, sorted by distance."""
        
        query = db.query(ServiceProvider).filter(
            ServiceProvider.is_active == True,
            ServiceProvider.categories.contains(category)
        )
        
        # Apply filters
        if min_rating > 0:
            query = query.filter(ServiceProvider.average_rating >= min_rating)
            
        if max_rate:
            query = query.filter(
                or_(
                    ServiceProvider.hourly_rate_max <= max_rate,
                    ServiceProvider.hourly_rate_max.is_(None)
                )
            )
            
        if availability:
            query = query.filter(ServiceProvider.availability == availability)
        
        providers = query.all()
        
        # Calculate distances and create matched providers
        matched_providers = []
        for provider in providers:
            if user.latitude and user.longitude:
                distance = self.calculate_distance(
                    user.latitude, user.longitude,
                    provider.latitude, provider.longitude
                )
                
                # Skip providers beyond max distance
                if distance > max_distance:
                    continue
            else:
                distance = 0.0  # Default if user location not available
            
            # Parse specialties from JSON string
            try:
                specialties = json.loads(provider.specialties) if provider.specialties else []
            except (json.JSONDecodeError, TypeError):
                specialties = []
            
            matched_provider = MatchedProvider(
                id=provider.id,
                name=provider.name,
                business_name=provider.business_name or provider.name,
                phone=provider.phone,
                email=provider.email,
                address=f"{provider.address}, {provider.city}, {provider.state} {provider.zip_code}",
                city=provider.city,
                state=provider.state,
                distance_miles=round(distance, 1),
                average_rating=provider.average_rating,
                total_reviews=provider.total_reviews,
                hourly_rate_min=provider.hourly_rate_min or 0.0,
                hourly_rate_max=provider.hourly_rate_max or 0.0,
                availability=provider.availability,
                specialties=specialties,
                description=provider.description or ""
            )
            
            matched_providers.append(matched_provider)
        
        # Sort by distance
        matched_providers.sort(key=lambda x: x.distance_miles)
        
        return matched_providers
    
    def seed_sample_providers(self, db: Session):
        """Seed database with sample service providers for testing."""
        
        sample_providers = [
            {
                "name": "Quick Fix Plumbing",
                "business_name": "Quick Fix Plumbing LLC",
                "email": "contact@quickfixplumbing.com",
                "phone": "(555) 123-4567",
                "address": "123 Main St",
                "city": "Springfield",
                "state": "IL",
                "zip_code": "62701",
                "latitude": 39.7817,
                "longitude": -89.6501,
                "categories": '["plumbing"]',
                "specialties": '["Emergency Repairs", "Leak Detection", "Pipe Replacement"]',
                "description": "Professional plumbing services with 24/7 emergency support",
                "hourly_rate_min": 75.0,
                "hourly_rate_max": 150.0,
                "availability": "same_day",
                "average_rating": 4.8,
                "total_reviews": 234,
                "is_verified": True
            },
            {
                "name": "SafeWire Electrical",
                "business_name": "SafeWire Electrical Services",
                "email": "info@safewireelectric.com", 
                "phone": "(555) 234-5678",
                "address": "456 Oak Ave",
                "city": "Springfield",
                "state": "IL",
                "zip_code": "62702",
                "latitude": 39.7901,
                "longitude": -89.6440,
                "categories": '["electrical"]',
                "specialties": '["Emergency Electrical", "Panel Upgrades", "Wiring"]',
                "description": "Licensed electricians providing safe and reliable electrical work",
                "hourly_rate_min": 85.0,
                "hourly_rate_max": 180.0,
                "availability": "same_day",
                "average_rating": 4.9,
                "total_reviews": 156,
                "is_verified": True
            },
            {
                "name": "Sparkling Clean",
                "business_name": "Sparkling Clean Services",
                "email": "hello@sparklingclean.com",
                "phone": "(555) 345-6789", 
                "address": "789 Pine St",
                "city": "Springfield",
                "state": "IL",
                "zip_code": "62703",
                "latitude": 39.7990,
                "longitude": -89.6350,
                "categories": '["cleaning"]',
                "specialties": '["Deep Cleaning", "Regular Maintenance", "Move-in/out"]',
                "description": "Professional house cleaning with eco-friendly products",
                "hourly_rate_min": 25.0,
                "hourly_rate_max": 45.0,
                "availability": "within_week",
                "average_rating": 4.7,
                "total_reviews": 312,
                "is_verified": True
            }
        ]
        
        for provider_data in sample_providers:
            existing = db.query(ServiceProvider).filter(
                ServiceProvider.email == provider_data["email"]
            ).first()
            
            if not existing:
                provider = ServiceProvider(**provider_data)
                db.add(provider)
        
        db.commit()
        return len(sample_providers)
