from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database.database import get_db
from app.models.user import User
from app.services.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/conversations", tags=["conversations"])

class StartConversationRequest(BaseModel):
    provider_id: int
    request_id: int

class SendMessageRequest(BaseModel):
    conversation_id: int
    message: str

class MessageResponse(BaseModel):
    id: int
    sender_type: str  # 'client' or 'provider'
    sender_name: str
    message: str
    timestamp: datetime
    
class ConversationResponse(BaseModel):
    id: int
    request_id: int
    client_id: int
    provider_id: int
    client_name: str
    provider_name: str
    service_category: str
    last_message: str
    last_message_time: datetime
    unread_count: int = 0

@router.post("/start")
async def start_conversation(
    request: StartConversationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a conversation between client and provider"""
    
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients can start conversations")
    
    # Check if conversation already exists
    # Implementation placeholder - check for existing conversation
    
    # Create new conversation
    # Implementation placeholder - create conversation record
    
    conversation = {
        "id": 1,  # Placeholder
        "request_id": request.request_id,
        "client_id": current_user.id,
        "provider_id": request.provider_id,
        "created_at": datetime.utcnow()
    }
    
    return conversation

@router.get("/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[MessageResponse]:
    """Get messages for a conversation"""
    
    # Verify user has access to this conversation
    # Implementation placeholder
    
    # Get messages
    # Implementation placeholder
    messages = []
    
    return messages

@router.post("/send-message")
async def send_message(
    request: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message in a conversation"""
    
    # Verify user has access to this conversation
    # Implementation placeholder
    
    # Save message
    # Implementation placeholder
    
    # Return success
    return {"message": "Message sent successfully"}

@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ConversationResponse:
    """Get conversation details"""
    
    # Verify access and get conversation
    # Implementation placeholder
    
    conversation = ConversationResponse(
        id=conversation_id,
        request_id=1,
        client_id=1,
        provider_id=1,
        client_name="Client Name",
        provider_name="Provider Name",
        service_category="Category",
        last_message="Last message",
        last_message_time=datetime.utcnow(),
        unread_count=0
    )
    
    return conversation
