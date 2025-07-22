from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi import Request
import uvicorn
from app.routers import problems, matching, users
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

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/health")
async def health_check():
    return {"status": "healthy", "redis": await redis_client.ping()}

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
