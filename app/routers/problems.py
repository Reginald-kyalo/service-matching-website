from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from pydantic import BaseModel
import json
import uuid
from app.services.problem_detector import ProblemDetector, ProblemDetectionResult, CategoryOrganizer
from app.core.redis_client import redis_client
import logging

router = APIRouter()

# Pydantic models
class ProblemSubmission(BaseModel):
    description: Optional[str] = ""  # Allow empty description when category is selected directly
    selected_category: Optional[str] = None  # User can override AI detection
    images: Optional[List[str]] = None
    user_id: Optional[str] = None

class ProblemDetectionResponse(BaseModel):
    session_id: str
    ai_suggested_category: str
    confidence: float
    keywords_matched: List[str]
    urgency_level: str
    final_category: str  # Either AI suggested or user selected
    next_steps: List[str]

# Initialize services
problem_detector = ProblemDetector()
category_organizer = CategoryOrganizer()

@router.post("/detect", response_model=ProblemDetectionResponse)
async def detect_problem(problem: ProblemSubmission):
    """
    Detect the service category from a problem description or use user selection.
    """
    try:
        # Log the incoming request data
        logging.info(f"Received request data: {problem}")
        
        # Use a generic description if none provided
        description = problem.description or "General service request"
        
        # Detect the problem category using AI
        detection_result = problem_detector.detect_problem(
            description=description,
            images=problem.images
        )
        
        # Use user selection if provided, otherwise use AI suggestion
        if problem.selected_category:
            final_category = problem.selected_category
            ai_category = detection_result.suggested_categories[0].category.value if detection_result.suggested_categories else "unknown"
        else:
            final_category = detection_result.suggested_categories[0].category.value if detection_result.suggested_categories else "unknown"
            ai_category = final_category
        
        # Create session
        session_id = str(uuid.uuid4())
        
        # Store in Redis for session management
        session_data = {
            "problem_description": problem.description,
            "ai_suggested_category": ai_category,
            "final_category": final_category,
            "confidence": detection_result.suggested_categories[0].confidence if detection_result.suggested_categories else 0.0,
            "urgency_level": detection_result.urgency_level,
            "user_id": problem.user_id,
            "status": "ready_for_matching"
        }
        
        # Store session with 24-hour expiry
        await redis_client.setex(
            f"session:{session_id}",
            86400,  # 24 hours
            json.dumps(session_data)
        )
        
        # Generate next steps based on category and urgency
        next_steps = generate_next_steps(final_category, detection_result.urgency_level)
        
        return ProblemDetectionResponse(
            session_id=session_id,
            ai_suggested_category=ai_category,
            confidence=detection_result.suggested_categories[0].confidence if detection_result.suggested_categories else 0.0,
            keywords_matched=detection_result.suggested_categories[0].keywords_found if detection_result.suggested_categories else [],
            urgency_level=detection_result.urgency_level,
            final_category=final_category,
            next_steps=next_steps
        )
        
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/categories")
async def get_service_categories():
    """
    Get all available service categories organized by groups.
    """
    return category_organizer.get_category_groups()

@router.get("/session/{session_id}")
async def get_session_data(session_id: str):
    """
    Retrieve session data.
    """
    try:
        session_data = await redis_client.get(f"session:{session_id}")
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found or expired")
        
        return json.loads(session_data)
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid session data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving session: {str(e)}")

@router.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze uploaded image for additional problem detection context.
    """
    try:
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(await file.read()),
            "analysis": "Image received - AI analysis coming soon",
            "suggestions": [
                "Clear, well-lit photos help professionals provide accurate quotes",
                "Include photos of the problem area from multiple angles"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")

def generate_next_steps(category: str, urgency: str) -> List[str]:
    """Generate next steps based on category and urgency."""
    
    base_steps = [
        "Review recommended professionals",
        "Contact professionals for quotes", 
        "Schedule service appointments"
    ]
    
    if urgency == "emergency":
        return [
            "Emergency professionals will contact you within 30 minutes",
            "If no response, call emergency services",
            "Document the issue with photos if safe to do so"
        ]
    elif urgency == "high":
        return [
            "Priority professionals will respond within 2 hours",
            "Get quotes from multiple professionals",
            "Schedule service within 24-48 hours"
        ]
    else:
        return base_steps
