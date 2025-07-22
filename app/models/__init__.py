from sqlalchemy.orm import relationship
from app.models.user import User
from app.models.service_provider import ServiceProvider, Review, ChatMessage

# Update relationships
User.reviews = relationship("Review", back_populates="user")
ServiceProvider.reviews = relationship("Review", back_populates="provider")
