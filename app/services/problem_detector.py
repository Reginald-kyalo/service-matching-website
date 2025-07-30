from enum import Enum
from typing import List, Dict, Optional
import re
import json
from dataclasses import dataclass

class ServiceCategory(str, Enum):
    # Home Systems
    PLUMBING = "plumbing"
    ELECTRICAL = "electrical"
    HVAC = "hvac"
    
    # Home Improvement
    CONSTRUCTION = "construction"
    CARPENTRY = "carpentry"
    PAINTING = "painting"
    FLOORING = "flooring"
    ROOFING = "roofing"
    
    # Home Services
    HOUSE_CLEANING = "house_cleaning"
    CARPET_COUCH_CLEANING = "carpet_couch_cleaning"
    PEST_CONTROL = "pest_control"
    LAWN_TRIMMING = "lawn_trimming"
    SITTERS = "sitters"
    
    # Repairs & Maintenance
    FRIDGE_REPAIR = "fridge_repair"
    MICROWAVE_REPAIR = "microwave_repair"
    TV_DISPLAY_REPAIR = "tv_display_repair"
    SOUND_SYSTEMS_REPAIR = "sound_systems_repair"
    WASHING_MACHINE_REPAIR = "washing_machine_repair"
    
    # Other
    UNKNOWN = "unknown"

@dataclass
class CategorySuggestion:
    category: ServiceCategory
    confidence: float
    reasoning: str
    keywords_found: List[str]

@dataclass
class ProblemDetectionResult:
    suggested_categories: List[CategorySuggestion]
    urgency_level: str  # low, medium, high, emergency
    analysis_summary: str
    needs_clarification: bool

class CategoryOrganizer:
    """
    Organizes service categories into logical groups for UI display.
    """
    
    @staticmethod
    def get_category_groups() -> Dict[str, Dict]:
        return {
            "Home Services": {
                "icon": "fas fa-home",
                "description": "Home maintenance and care",
                "color": "blue",
                "categories": [
                    {
                        "category": ServiceCategory.HOUSE_CLEANING,
                        "name": "House Cleaning",
                        "icon": "fas fa-broom",
                        "description": "Regular and deep house cleaning services"
                    },
                    {
                        "category": ServiceCategory.CARPET_COUCH_CLEANING,
                        "name": "Carpet, Couch Cleaning",
                        "icon": "fas fa-couch",
                        "description": "Professional furniture and carpet cleaning"
                    },
                    {
                        "category": ServiceCategory.PEST_CONTROL,
                        "name": "Pest Control",
                        "icon": "fas fa-bug",
                        "description": "Extermination and pest prevention services"
                    },
                    {
                        "category": ServiceCategory.LAWN_TRIMMING,
                        "name": "Lawn & Trimming Services",
                        "icon": "fas fa-leaf",
                        "description": "Garden maintenance, lawn care and trimming"
                    },
                    {
                        "category": ServiceCategory.SITTERS,
                        "name": "Sitters - Pets, Baby & House",
                        "icon": "fas fa-heart",
                        "description": "Professional sitting services for pets, babies and houses"
                    }
                ]
            },
            "Repairs & Maintenance": {
                "icon": "fas fa-tools",
                "description": "Appliances repair & maintenance",
                "color": "orange",
                "categories": [
                    {
                        "category": ServiceCategory.FRIDGE_REPAIR,
                        "name": "Fridge Repair",
                        "icon": "fas fa-snowflake",
                        "description": "Refrigerator and freezer repair services"
                    },
                    {
                        "category": ServiceCategory.MICROWAVE_REPAIR,
                        "name": "Microwave",
                        "icon": "fas fa-microchip",
                        "description": "Microwave oven repair and maintenance"
                    },
                    {
                        "category": ServiceCategory.TV_DISPLAY_REPAIR,
                        "name": "TV, Display Systems",
                        "icon": "fas fa-tv",
                        "description": "Television and display equipment repair"
                    },
                    {
                        "category": ServiceCategory.SOUND_SYSTEMS_REPAIR,
                        "name": "Sound Systems eg Radio",
                        "icon": "fas fa-volume-up",
                        "description": "Audio equipment and radio repair"
                    },
                    {
                        "category": ServiceCategory.WASHING_MACHINE_REPAIR,
                        "name": "Washing Machines",
                        "icon": "fas fa-tshirt",
                        "description": "Washing machine and dryer repair"
                    }
                ]
            },
            "Home Improvement": {
                "icon": "fas fa-hammer",
                "description": "Home renovation and improvement",
                "color": "green",
                "categories": [
                    {
                        "category": ServiceCategory.CONSTRUCTION,
                        "name": "Construction",
                        "icon": "fas fa-hard-hat",
                        "description": "Building, renovations and major construction projects"
                    },
                    {
                        "category": ServiceCategory.CARPENTRY,
                        "name": "Carpentry",
                        "icon": "fas fa-hammer",
                        "description": "Woodwork, furniture and cabinet making"
                    },
                    {
                        "category": ServiceCategory.PAINTING,
                        "name": "Painting",
                        "icon": "fas fa-paint-roller",
                        "description": "Interior and exterior painting services"
                    },
                    {
                        "category": ServiceCategory.FLOORING,
                        "name": "Flooring",
                        "icon": "fas fa-th-large",
                        "description": "Floor installation, repair and refinishing"
                    },
                    {
                        "category": ServiceCategory.ROOFING,
                        "name": "Roofing",
                        "icon": "fas fa-home",
                        "description": "Roof repairs, installation and maintenance"
                    }
                ]
            },
            "Home Systems": {
                "icon": "fas fa-cogs",
                "description": "Home general repairs",
                "color": "purple",
                "categories": [
                    {
                        "category": ServiceCategory.PLUMBING,
                        "name": "Plumbing",
                        "icon": "fas fa-wrench",
                        "description": "Water systems, pipes and fixtures"
                    },
                    {
                        "category": ServiceCategory.ELECTRICAL,
                        "name": "Electrical",
                        "icon": "fas fa-bolt",
                        "description": "Wiring, outlets and electrical systems"
                    },
                    {
                        "category": ServiceCategory.HVAC,
                        "name": "Heating & Cooling",
                        "icon": "fas fa-thermometer-half",
                        "description": "HVAC systems and climate control"
                    }
                ]
            }
        }

class ProblemDetector:
    """
    Detects service category from user problem descriptions.
    This is a rule-based system that can be enhanced with ML later.
    """
    
    def __init__(self):
        self.category_keywords = {
            ServiceCategory.PLUMBING: {
                "keywords": [
                    "tap", "faucet", "sink", "toilet", "flush", "water", "leak", "pipe", "drain", 
                    "shower", "bath", "plumber", "valve", "pressure", "hot water", "cold water",
                    "blockage", "clog", "overflow", "drip", "burst", "sewage", "bathroom", "kitchen sink"
                ],
                "emergency_keywords": ["burst", "flooding", "overflow", "sewage backup", "no water"],
                "urgency_indicators": ["urgent", "emergency", "flooding", "burst", "immediately"]
            },
            ServiceCategory.ELECTRICAL: {
                "keywords": [
                    "electric", "electricity", "power", "outlet", "switch", "light", "lights", "bulb", "wire",
                    "circuit", "breaker", "fuse", "electrician", "voltage", "shock", "spark", "sparks",
                    "blackout", "surge", "installation", "repair electrical", "no power", "flickering"
                ],
                "emergency_keywords": ["spark", "sparks", "shock", "burning smell", "no power", "electrical fire"],
                "urgency_indicators": ["dangerous", "spark", "sparks", "shock", "burning", "fire"]
            },
            ServiceCategory.HVAC: {
                "keywords": [
                    "heating", "cooling", "air conditioning", "ac", "hvac", "furnace", "boiler",
                    "thermostat", "vent", "duct", "filter", "temperature", "hot", "cold",
                    "air conditioner", "heat pump", "ventilation"
                ],
                "emergency_keywords": ["no heat", "no cooling", "carbon monoxide"],
                "urgency_indicators": ["freezing", "overheating", "carbon monoxide"]
            },
            ServiceCategory.HOUSE_CLEANING: {
                "keywords": [
                    "clean", "cleaning", "house cleaning", "maid", "housekeeping", "vacuum",
                    "mop", "dust", "sanitize", "deep clean", "spring cleaning", "maintenance clean",
                    "domestic", "housekeeper", "sweep", "polish"
                ],
                "emergency_keywords": [],
                "urgency_indicators": []
            },
            ServiceCategory.CARPET_COUCH_CLEANING: {
                "keywords": [
                    "carpet", "couch", "sofa", "upholstery", "furniture cleaning", "steam clean",
                    "stain removal", "fabric cleaning", "rug cleaning", "chair cleaning"
                ],
                "emergency_keywords": [],
                "urgency_indicators": []
            },
            ServiceCategory.PEST_CONTROL: {
                "keywords": [
                    "pest", "bug", "insect", "rat", "mouse", "cockroach", "ant", "spider",
                    "termite", "bee", "wasp", "exterminator", "infestation", "rodent",
                    "fumigation", "spray"
                ],
                "emergency_keywords": ["infestation", "bees", "wasps", "aggressive"],
                "urgency_indicators": ["infestation", "swarm", "aggressive", "stinging"]
            },
            ServiceCategory.LAWN_TRIMMING: {
                "keywords": [
                    "lawn", "grass", "garden", "trim", "trimming", "hedge", "bushes", "shrubs",
                    "mowing", "landscaping", "yard work", "pruning", "weeding", "gardener"
                ],
                "emergency_keywords": [],
                "urgency_indicators": []
            },
            ServiceCategory.SITTERS: {
                "keywords": [
                    "sitter", "babysitter", "nanny", "pet sitter", "house sitter", "childcare",
                    "pet care", "dog walker", "cat sitter", "house sitting", "child minder"
                ],
                "emergency_keywords": [],
                "urgency_indicators": []
            },
            ServiceCategory.FRIDGE_REPAIR: {
                "keywords": [
                    "fridge", "refrigerator", "freezer", "cooling", "not cold", "ice maker",
                    "compressor", "thermostat", "fridge repair", "refrigerator repair"
                ],
                "emergency_keywords": ["not cooling", "spoiled food", "water leaking"],
                "urgency_indicators": ["urgent", "food spoiling", "leaking water"]
            },
            ServiceCategory.MICROWAVE_REPAIR: {
                "keywords": [
                    "microwave", "microwave oven", "heating", "not heating", "sparks",
                    "turntable", "microwave repair", "oven repair"
                ],
                "emergency_keywords": ["sparks", "burning smell", "not working"],
                "urgency_indicators": ["sparks", "burning", "smoke"]
            },
            ServiceCategory.TV_DISPLAY_REPAIR: {
                "keywords": [
                    "tv", "television", "screen", "display", "monitor", "no picture", "black screen",
                    "lines on screen", "tv repair", "display repair", "lcd", "led"
                ],
                "emergency_keywords": [],
                "urgency_indicators": []
            },
            ServiceCategory.SOUND_SYSTEMS_REPAIR: {
                "keywords": [
                    "radio", "speakers", "sound system", "audio", "stereo", "music system",
                    "no sound", "distorted sound", "amplifier", "speaker repair"
                ],
                "emergency_keywords": [],
                "urgency_indicators": []
            },
            ServiceCategory.WASHING_MACHINE_REPAIR: {
                "keywords": [
                    "washing machine", "washer", "dryer", "laundry", "not spinning", "not draining",
                    "leaking", "washing machine repair", "dryer repair", "spin cycle"
                ],
                "emergency_keywords": ["flooding", "water everywhere", "major leak"],
                "urgency_indicators": ["flooding", "water damage", "urgent"]
            },
            ServiceCategory.PEST_CONTROL: {
                "keywords": [
                    "pest", "bug", "insect", "rat", "mouse", "cockroach", "ant", "spider",
                    "termite", "bee", "wasp", "exterminator", "infestation", "rodent"
                ],
                "emergency_keywords": ["infestation", "bees", "wasps", "aggressive"],
                "urgency_indicators": ["infestation", "swarm", "aggressive", "stinging"]
            },
            ServiceCategory.CARPENTRY: {
                "keywords": [
                    "wood", "carpenter", "door", "window", "cabinet", "shelf", "deck",
                    "fence", "repair wood", "install", "frame", "trim", "molding", "woodwork"
                ],
                "emergency_keywords": ["broken door", "security"],
                "urgency_indicators": ["security", "broken door", "unsafe"]
            },
            ServiceCategory.CONSTRUCTION: {
                "keywords": [
                    "build", "construction", "contractor", "renovation", "remodel", "addition",
                    "foundation", "roof", "wall", "extension", "new house", "building",
                    "deck", "patio", "garage", "shed", "fence", "driveway", "walkway",
                    "concrete", "masonry", "framing", "siding", "basement", "attic"
                ],
                "emergency_keywords": [],
                "urgency_indicators": []
            },
            ServiceCategory.PAINTING: {
                "keywords": [
                    "paint", "painting", "painter", "interior paint", "exterior paint", "wall paint",
                    "ceiling paint", "primer", "brush", "roller", "spray paint", "touch up"
                ],
                "emergency_keywords": [],
                "urgency_indicators": []
            },
            ServiceCategory.FLOORING: {
                "keywords": [
                    "floor", "flooring", "carpet", "tile", "hardwood", "laminate", "vinyl",
                    "rug", "installation", "refinish", "repair floor", "subfloor"
                ],
                "emergency_keywords": [],
                "urgency_indicators": []
            },
            ServiceCategory.ROOFING: {
                "keywords": [
                    "roof", "roofing", "shingle", "gutter", "downspout", "leak roof", "roof repair",
                    "roof replacement", "chimney", "skylight", "flashing"
                ],
                "emergency_keywords": ["roof leak", "missing shingles", "storm damage"],
                "urgency_indicators": ["leak", "storm", "damage", "missing"]
            }
        }
    
    def detect_problem(self, description: str, images: Optional[List[str]] = None) -> ProblemDetectionResult:
        """
        Detect the service category from problem description and return single best match.
        """
        description_lower = description.lower()
        
        # Score each category
        category_scores = {}
        matched_keywords = {}
        
        for category, data in self.category_keywords.items():
            score = 0
            keywords_found = []
            
            # Check regular keywords with word boundary detection
            for keyword in data["keywords"]:
                pattern = r'\b' + re.escape(keyword) + r'\b'
                if re.search(pattern, description_lower, re.IGNORECASE):
                    score += 1
                    keywords_found.append(keyword)
            
            # Boost score for emergency keywords
            for emergency_keyword in data["emergency_keywords"]:
                pattern = r'\b' + re.escape(emergency_keyword) + r'\b'
                if re.search(pattern, description_lower, re.IGNORECASE):
                    score += 3
                    keywords_found.append(f"EMERGENCY: {emergency_keyword}")
            
            category_scores[category] = score
            matched_keywords[category] = keywords_found
        
        # Find best match
        best_category = max(category_scores, key=category_scores.get)
        best_score = category_scores[best_category]
        
        # Calculate confidence
        confidence = min(best_score / 5.0, 1.0) if best_score > 0 else 0.0
        
        # Determine urgency
        urgency = self._determine_urgency(description_lower, best_category)
        
        # Create suggestions (top 3)
        sorted_categories = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
        suggestions = []
        
        for category, score in sorted_categories[:3]:
            if score > 0:
                category_confidence = min(score / 5.0, 1.0)
                reasoning = f"Found {score} relevant keywords"
                suggestions.append(CategorySuggestion(
                    category=category,
                    confidence=category_confidence,
                    reasoning=reasoning,
                    keywords_found=matched_keywords[category]
                ))
        
        # If no clear match, mark as unknown
        if best_score == 0:
            best_category = ServiceCategory.UNKNOWN
            confidence = 0.0
            matched_keywords[ServiceCategory.UNKNOWN] = []
            suggestions = [CategorySuggestion(
                category=ServiceCategory.UNKNOWN,
                confidence=0.0,
                reasoning="No specific keywords found",
                keywords_found=[]
            )]
        
        return ProblemDetectionResult(
            suggested_categories=suggestions,
            urgency_level=urgency,
            analysis_summary=f"Best match: {best_category.value} ({confidence:.0%} confidence)",
            needs_clarification=confidence < 0.6
        )
    
    def _determine_urgency(self, description: str, category: ServiceCategory) -> str:
        """Determine urgency level based on keywords and category."""
        
        # Emergency indicators
        emergency_words = ["emergency", "urgent", "immediately", "asap", "dangerous"]
        if any(word in description for word in emergency_words):
            return "emergency"
        
        # Category-specific emergency keywords
        if category in self.category_keywords:
            emergency_keywords = self.category_keywords[category]["emergency_keywords"]
            if any(keyword in description for keyword in emergency_keywords):
                return "emergency"
        
        # High urgency indicators
        high_urgency = ["broken", "not working", "stopped", "failed", "damaged"]
        if any(word in description for word in high_urgency):
            return "high"
        
        # Medium urgency indicators
        medium_urgency = ["slow", "intermittent", "sometimes", "occasionally"]
        if any(word in description for word in medium_urgency):
            return "medium"
        
        return "low"
    
    def _generate_questions(self, category: ServiceCategory, description: str) -> List[str]:
        """Generate follow-up questions based on detected category."""
        
        question_templates = {
            ServiceCategory.PLUMBING: [
                "Where exactly is the water issue located?",
                "How long has this problem been occurring?",
                "Is there any visible water damage?",
                "What is the water pressure like?",
                "Are multiple fixtures affected?"
            ],
            ServiceCategory.ELECTRICAL: [
                "Which room or area is affected?",
                "When did you first notice this issue?",
                "Are there any burning smells or sparks?",
                "How many outlets/switches are affected?",
                "When was your electrical system last inspected?"
            ],
            ServiceCategory.HVAC: [
                "What type of heating/cooling system do you have?",
                "What temperature issues are you experiencing?",
                "When was your system last serviced?",
                "Are all rooms affected equally?",
                "Do you hear any unusual noises?"
            ],
            ServiceCategory.HOUSE_CLEANING: [
                "What type of cleaning service do you need?",
                "How large is the area to be cleaned?",
                "Do you have any specific cleaning preferences?",
                "How often would you like cleaning service?",
                "Are there any special requirements or restrictions?"
            ],
            ServiceCategory.CARPET_COUCH_CLEANING: [
                "What type of furniture or carpet needs cleaning?",
                "What kind of stains or issues are you dealing with?",
                "How large is the area to be cleaned?",
                "When was it last professionally cleaned?",
                "Do you have any fabric care preferences?"
            ],
            ServiceCategory.PEST_CONTROL: [
                "What type of pests have you seen?",
                "Where have you noticed pest activity?",
                "How long have you been seeing pests?",
                "Have you tried any treatments already?",
                "Do you have pets or small children?"
            ],
            ServiceCategory.LAWN_TRIMMING: [
                "What type of lawn or garden work do you need?",
                "How large is your yard or garden area?",
                "How often do you need maintenance?",
                "Do you have specific plants or areas of concern?",
                "What is your preferred schedule?"
            ],
            ServiceCategory.SITTERS: [
                "What type of sitting service do you need?",
                "What are the dates and times you need coverage?",
                "Do you have any specific requirements or instructions?",
                "What is the age of children or type of pets?",
                "Do you need any additional services?"
            ],
            ServiceCategory.FRIDGE_REPAIR: [
                "What specific issue is your refrigerator having?",
                "How old is your refrigerator?",
                "Is it still under warranty?",
                "What brand and model is it?",
                "When did the problem start?"
            ],
            ServiceCategory.MICROWAVE_REPAIR: [
                "What issue is your microwave experiencing?",
                "How old is your microwave?",
                "What brand and model is it?",
                "Is it a built-in or countertop model?",
                "When did the problem start?"
            ],
            ServiceCategory.TV_DISPLAY_REPAIR: [
                "What type of display issue are you experiencing?",
                "What brand and model is your TV?",
                "How old is your TV/display?",
                "Is it still under warranty?",
                "When did the problem start?"
            ],
            ServiceCategory.SOUND_SYSTEMS_REPAIR: [
                "What type of audio equipment needs repair?",
                "What specific issue are you experiencing?",
                "What brand and model is it?",
                "How old is the equipment?",
                "When did the problem start?"
            ],
            ServiceCategory.WASHING_MACHINE_REPAIR: [
                "What issue is your washing machine having?",
                "Is it a front-load or top-load machine?",
                "What brand and model is it?",
                "How old is your machine?",
                "When did the problem start?"
            ],
            ServiceCategory.CONSTRUCTION: [
                "What type of construction work do you need?",
                "What is your estimated timeline?",
                "Do you have permits or need help obtaining them?",
                "What is your approximate budget range?",
                "Do you have architectural plans or designs?"
            ]
        }
        
        return question_templates.get(category, [
            "Can you provide more details about the issue?",
            "When did this problem start?",
            "Have you attempted any fixes?",
            "How urgent is this repair?",
            "Do you have any preferences for timing?"
        ])
