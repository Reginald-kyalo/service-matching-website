# This file is deprecated as per user request
# Survey generation has been removed from the system
# The system now uses simple matching with organized category selection only

"""
DEPRECATED: Survey Generator Module

This module has been removed as the system has been simplified to focus on:
1. AI-powered category detection from user descriptions
2. Manual category selection with organized umbrella groups
3. Direct matching to service providers without complex surveys

The category organization is now handled by CategoryOrganizer in problem_detector.py
"""

# Placeholder imports for backward compatibility
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from enum import Enum
from app.services.problem_detector import ServiceCategory

# Deprecated classes - kept for backward compatibility but not used
class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    SINGLE_CHOICE = "single_choice"
    TEXT = "text"

@dataclass
class SurveyQuestion:
    id: str
    question: str
    type: QuestionType

@dataclass  
class Survey:
    id: str
    title: str
    category: ServiceCategory

class SurveyGenerator:
    """DEPRECATED: No longer generates surveys. System uses direct category matching."""
    
    def __init__(self):
        pass
    
    def generate_survey(self, category: ServiceCategory, urgency_level: str, 
                       detected_keywords: List[str]) -> Survey:
        """DEPRECATED: Returns minimal survey object for compatibility."""
        return Survey(
            id=f"deprecated_{category.value}",
            title="Direct Service Matching",
            category=category
        )

