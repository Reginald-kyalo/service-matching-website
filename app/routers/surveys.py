from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
import json
from app.core.redis_client import redis_client

router = APIRouter()

class SurveyResponse(BaseModel):
    session_id: str
    answers: Dict[str, Any]

class SurveySubmissionResponse(BaseModel):
    success: bool
    message: str
    next_steps: List[str]
    estimated_quotes: List[Dict[str, Any]]

@router.get("/{session_id}")
async def get_survey(session_id: str):
    """
    Get the survey for a specific session.
    """
    try:
        session_data = await redis_client.get(f"session:{session_id}")
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found or expired")
        
        data = json.loads(session_data)
        return {
            "survey": data.get("survey"),
            "detection_result": data.get("detection_result"),
            "problem_description": data.get("problem_description")
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid session data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving survey: {str(e)}")

@router.post("/submit")
async def submit_survey(response: SurveyResponse):
    """
    Submit survey responses and generate service provider recommendations.
    """
    try:
        # Get session data
        session_data = await redis_client.get(f"session:{response.session_id}")
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found or expired")
        
        data = json.loads(session_data)
        
        # Add survey responses to session
        data["survey_responses"] = response.answers
        data["status"] = "survey_completed"
        
        # Store updated session
        await redis_client.setex(
            f"session:{response.session_id}",
            86400,  # 24 hours
            json.dumps(data)
        )
        
        # Generate recommendations based on responses
        recommendations = await _generate_recommendations(data)
        
        return SurveySubmissionResponse(
            success=True,
            message="Survey completed successfully! We're matching you with service providers.",
            next_steps=[
                "Review recommended service providers",
                "Contact providers for detailed quotes",
                "Schedule service appointments",
                "Leave reviews after service completion"
            ],
            estimated_quotes=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting survey: {str(e)}")

async def _generate_recommendations(session_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate service provider recommendations based on survey responses.
    This is a simplified version - in production, this would query a database of providers.
    """
    
    detection = session_data.get("detection_result", {})
    responses = session_data.get("survey_responses", {})
    category = detection.get("category", "unknown")
    urgency = detection.get("urgency_level", "medium")
    
    # Mock service provider recommendations
    # In production, this would be a sophisticated matching algorithm
    
    base_recommendations = {
        "plumbing": [
            {
                "provider_id": "plumber_001",
                "name": "Quick Fix Plumbing",
                "rating": 4.8,
                "reviews": 234,
                "specialties": ["Emergency Repairs", "Leak Detection", "Pipe Replacement"],
                "estimated_cost": "$150-$400",
                "availability": "Same day" if urgency == "emergency" else "Within 2 days",
                "contact": "+1-555-PLUMBER",
                "distance": "2.3 miles"
            },
            {
                "provider_id": "plumber_002", 
                "name": "Reliable Plumbing Services",
                "rating": 4.6,
                "reviews": 189,
                "specialties": ["Residential Plumbing", "Bathroom Repairs", "Water Heaters"],
                "estimated_cost": "$125-$350",
                "availability": "Within 1-2 days",
                "contact": "+1-555-PIPES",
                "distance": "3.7 miles"
            }
        ],
        "electrical": [
            {
                "provider_id": "electric_001",
                "name": "SafeWire Electrical",
                "rating": 4.9,
                "reviews": 156,
                "specialties": ["Emergency Electrical", "Panel Upgrades", "Safety Inspections"],
                "estimated_cost": "$200-$500",
                "availability": "Same day" if urgency == "emergency" else "Within 1 day",
                "contact": "+1-555-ELECTRIC",
                "distance": "1.8 miles"
            }
        ],
        "cleaning": [
            {
                "provider_id": "clean_001",
                "name": "Sparkling Clean Services",
                "rating": 4.7,
                "reviews": 312,
                "specialties": ["Deep Cleaning", "Regular Maintenance", "Eco-Friendly"],
                "estimated_cost": "$100-$250",
                "availability": "Within 3-5 days",
                "contact": "+1-555-CLEAN",
                "distance": "4.2 miles"
            }
        ],
        "construction": [
            {
                "provider_id": "construct_001",
                "name": "Premier Construction Co.",
                "rating": 4.5,
                "reviews": 89,
                "specialties": ["Home Additions", "Renovations", "Custom Builds"],
                "estimated_cost": "$5,000-$50,000+",
                "availability": "2-4 weeks for consultation",
                "contact": "+1-555-BUILD",
                "distance": "5.1 miles"
            }
        ]
    }
    
    # Get recommendations for the category
    recommendations = base_recommendations.get(category, [
        {
            "provider_id": "general_001",
            "name": "General Services Pro",
            "rating": 4.4,
            "reviews": 67,
            "specialties": ["General Repairs", "Maintenance", "Consultations"],
            "estimated_cost": "Varies by service",
            "availability": "Within 3-5 days",
            "contact": "+1-555-GENERAL",
            "distance": "3.9 miles"
        }
    ])
    
    # Sort by urgency and rating
    if urgency == "emergency":
        # Prioritize availability for emergencies
        recommendations.sort(key=lambda x: (
            0 if "same day" in x["availability"].lower() else 1,
            -x["rating"]
        ))
    else:
        # Prioritize rating for non-emergency
        recommendations.sort(key=lambda x: -x["rating"])
    
    return recommendations[:3]  # Return top 3 matches
