from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi import Request
import uvicorn
from app.routers import problems, matching, users, provider_dashboard, conversations, providers
from app.core.config import settings
from app.database.database import engine, Base
from app.core.redis_client import redis_client

# Import models to ensure they're registered
from app.models.user import User
from app.models.service_provider import ServiceProvider, Review, ChatMessage

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Service Matching Platform",
    description="Connect users with service providers for household and construction needs",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Include routers
app.include_router(problems.router, prefix="/api/problems", tags=["problems"])
app.include_router(matching.router, prefix="/api/matching", tags=["matching"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(providers.router, tags=["providers"])
app.include_router(provider_dashboard.router)
app.include_router(conversations.router)

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/provider-signup", response_class=HTMLResponse)
async def provider_signup(request: Request):
    return templates.TemplateResponse("provider-signup.html", {"request": request})

@app.get("/provider-dashboard", response_class=HTMLResponse)
async def provider_dashboard(request: Request):
    return templates.TemplateResponse("provider-dashboard.html", {"request": request})

@app.get("/provider-services", response_class=HTMLResponse)
async def provider_services(request: Request):
    return templates.TemplateResponse("provider-services.html", {"request": request})

@app.get("/client-dashboard", response_class=HTMLResponse)
async def client_dashboard(request: Request):
    return templates.TemplateResponse("client-dashboard.html", {"request": request})

@app.get("/health")
async def health_check():
    return {"status": "healthy", "redis": await redis_client.ping()}

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

# Services API endpoints
@app.get("/api/services/categories")
async def get_service_categories():
    """Get all available service categories using the unified service catalog"""
    
    # Import and use the data from the unified service catalog
    # This mirrors the JavaScript structure for consistency
    
    categories = {
        "plumbing": "Plumbing",
        "electrical": "Electrical", 
        "hvac": "HVAC",
        "carpentry": "Carpentry",
        "painting": "Painting",
        "cleaning": "Cleaning",
        "appliance_repair": "Appliance Repair",
        "gardening": "Gardening & Landscaping",
        "security": "Security & Safety",
        "roofing": "Roofing",
        "flooring": "Flooring",
        "general_handyman": "General Handyman",
        "pest_control": "Pest Control",
        "moving": "Moving & Transport",
        "automotive": "Automotive Services",
        "wellness": "Health & Wellness",
        "business_services": "Business Services",
        "catering": "Catering & Events",
        "tutoring": "Education & Tutoring",
        "technology": "Tech Support"
    }
    
    # Use the comprehensive services from the unified catalog
    services = [
        # Plumbing Services
        {"id": "leak_repair", "name": "Leak Repair", "category": "plumbing", "description": "Fix water leaks in pipes, faucets, and fixtures", "typical_rate": 2500},
        {"id": "pipe_installation", "name": "Pipe Installation", "category": "plumbing", "description": "Install new water and sewer pipes", "typical_rate": 5000},
        {"id": "toilet_repair", "name": "Toilet Repair", "category": "plumbing", "description": "Fix toilet clogs, running water, and other issues", "typical_rate": 2000},
        {"id": "drain_cleaning", "name": "Drain Cleaning", "category": "plumbing", "description": "Clear blocked drains and sewers", "typical_rate": 3000},
        {"id": "water_heater_repair", "name": "Water Heater Repair", "category": "plumbing", "description": "Repair and maintain water heaters", "typical_rate": 4000},
        {"id": "faucet_installation", "name": "Faucet Installation", "category": "plumbing", "description": "Install kitchen and bathroom faucets", "typical_rate": 2500},
        
        # Electrical Services
        {"id": "wiring_installation", "name": "Wiring Installation", "category": "electrical", "description": "Install electrical wiring for homes and offices", "typical_rate": 6000},
        {"id": "outlet_repair", "name": "Outlet Repair", "category": "electrical", "description": "Fix electrical outlets and switches", "typical_rate": 1500},
        {"id": "lighting_installation", "name": "Lighting Installation", "category": "electrical", "description": "Install indoor and outdoor lighting", "typical_rate": 3500},
        {"id": "electrical_troubleshooting", "name": "Electrical Troubleshooting", "category": "electrical", "description": "Diagnose and fix electrical problems", "typical_rate": 2500},
        {"id": "panel_upgrade", "name": "Panel Upgrade", "category": "electrical", "description": "Upgrade electrical panels and circuits", "typical_rate": 15000},
        {"id": "ceiling_fan_installation", "name": "Ceiling Fan Installation", "category": "electrical", "description": "Install ceiling fans and controls", "typical_rate": 4000},
        
        # HVAC Services
        {"id": "ac_repair", "name": "AC Repair", "category": "hvac", "description": "Repair air conditioning units", "typical_rate": 4500},
        {"id": "ac_installation", "name": "AC Installation", "category": "hvac", "description": "Install new air conditioning systems", "typical_rate": 25000},
        {"id": "heating_repair", "name": "Heating Repair", "category": "hvac", "description": "Repair heating systems", "typical_rate": 5000},
        {"id": "duct_cleaning", "name": "Duct Cleaning", "category": "hvac", "description": "Clean air ducts and ventilation", "typical_rate": 8000},
        {"id": "thermostat_installation", "name": "Thermostat Installation", "category": "hvac", "description": "Install smart and programmable thermostats", "typical_rate": 3000},
        
        # Carpentry Services
        {"id": "furniture_repair", "name": "Furniture Repair", "category": "carpentry", "description": "Repair and restore wooden furniture", "typical_rate": 3000},
        {"id": "cabinet_installation", "name": "Cabinet Installation", "category": "carpentry", "description": "Install kitchen and bathroom cabinets", "typical_rate": 12000},
        {"id": "door_installation", "name": "Door Installation", "category": "carpentry", "description": "Install interior and exterior doors", "typical_rate": 5000},
        {"id": "window_installation", "name": "Window Installation", "category": "carpentry", "description": "Install windows and frames", "typical_rate": 8000},
        {"id": "custom_woodwork", "name": "Custom Woodwork", "category": "carpentry", "description": "Custom carpentry and woodworking projects", "typical_rate": 7000},
        {"id": "deck_construction", "name": "Deck Construction", "category": "carpentry", "description": "Build and repair outdoor decks", "typical_rate": 15000},
        
        # Cleaning Services
        {"id": "house_cleaning", "name": "House Cleaning", "category": "house_cleaning", "description": "Regular house cleaning services", "typical_rate": 3000},
        {"id": "deep_cleaning", "name": "Deep Cleaning", "category": "house_cleaning", "description": "Thorough deep cleaning of homes", "typical_rate": 5000},
        {"id": "carpet_cleaning", "name": "Carpet Cleaning", "category": "carpet_couch_cleaning", "description": "Professional carpet cleaning", "typical_rate": 2500},
        {"id": "upholstery_cleaning", "name": "Upholstery Cleaning", "category": "carpet_couch_cleaning", "description": "Clean couches, chairs, and fabric furniture", "typical_rate": 3000},
        {"id": "window_cleaning", "name": "Window Cleaning", "category": "house_cleaning", "description": "Clean windows inside and outside", "typical_rate": 1500},
        {"id": "office_cleaning", "name": "Office Cleaning", "category": "house_cleaning", "description": "Commercial office cleaning", "typical_rate": 4000},
        {"id": "move_out_cleaning", "name": "Move Out Cleaning", "category": "house_cleaning", "description": "Deep cleaning for moving out", "typical_rate": 6000},
        
        # Painting Services
        {"id": "interior_painting", "name": "Interior Painting", "category": "painting", "description": "Paint interior walls and rooms", "typical_rate": 15000},
        {"id": "exterior_painting", "name": "Exterior Painting", "category": "painting", "description": "Paint exterior walls and surfaces", "typical_rate": 25000},
        {"id": "wall_preparation", "name": "Wall Preparation", "category": "painting", "description": "Prepare walls for painting", "typical_rate": 5000},
        {"id": "decorative_painting", "name": "Decorative Painting", "category": "painting", "description": "Decorative and artistic painting", "typical_rate": 8000},
        {"id": "cabinet_painting", "name": "Cabinet Painting", "category": "painting", "description": "Paint kitchen and bathroom cabinets", "typical_rate": 10000},
        
        # Appliance Repair Services
        {"id": "refrigerator_repair", "name": "Refrigerator Repair", "category": "fridge_repair", "description": "Fix refrigerator cooling, electrical, and mechanical issues", "typical_rate": 4000},
        {"id": "freezer_repair", "name": "Freezer Repair", "category": "fridge_repair", "description": "Repair standalone and chest freezers", "typical_rate": 3500},
        {"id": "microwave_repair", "name": "Microwave Repair", "category": "microwave_repair", "description": "Fix microwave heating, turntable, and electrical issues", "typical_rate": 2500},
        {"id": "tv_repair", "name": "TV Repair", "category": "tv_display_repair", "description": "Repair television screens, speakers, and electronics", "typical_rate": 4000},
        {"id": "sound_system_repair", "name": "Sound System Repair", "category": "sound_systems_repair", "description": "Fix audio systems, speakers, and amplifiers", "typical_rate": 3000},
        {"id": "washing_machine_repair", "name": "Washing Machine Repair", "category": "washing_machine_repair", "description": "Repair washers, dryers, and laundry equipment", "typical_rate": 3500},
        
        # Additional services from the unified catalog...
        {"id": "general_pest_control", "name": "General Pest Control", "category": "pest_control", "description": "Control ants, roaches, and common pests", "typical_rate": 4000},
        {"id": "lawn_mowing", "name": "Lawn Mowing", "category": "lawn_trimming", "description": "Regular lawn cutting and maintenance", "typical_rate": 2000},
        {"id": "pet_sitting", "name": "Pet Sitting", "category": "sitters", "description": "Care for pets in your home", "typical_rate": 1500},
        {"id": "home_renovation", "name": "Home Renovation", "category": "construction", "description": "Complete home renovation projects", "typical_rate": 50000},
        {"id": "hardwood_installation", "name": "Hardwood Installation", "category": "flooring", "description": "Install hardwood flooring", "typical_rate": 20000},
        {"id": "roof_repair", "name": "Roof Repair", "category": "roofing", "description": "Fix roof leaks and damage", "typical_rate": 8000}
    ]
    
    return {
        "services": services,
        "categories": categories
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)