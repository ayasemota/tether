from beanie import Document, Indexed
from typing import Optional
from datetime import datetime


class Users(Document):
    """
    User model for storing user information.
    
    This model integrates with Firebase Authentication and stores
    additional user profile data in MongoDB.
    """
    username: Indexed(str, unique=True)  # Unique username
    email: Indexed(str, unique=True)  # User's email address
    password: str  # Deprecated - password managed by Firebase (kept for compatibility)
    first_name: str  # User's first name
    lastname: str  # User's last name
    firebase_uid: Indexed(str, unique=True)  # Firebase user ID
    email_verified: bool = False  # Email verification status
    is_active: bool = True  # Account active status
    created_at: Optional[datetime] = None  # Account creation timestamp
    last_login: Optional[datetime] = None  # Last login timestamp
    
    class Settings:
        name = "users"
        
    class Config:
        """Pydantic model configuration."""
        json_schema_extra = {
            "example": {
                "username": "johndoe",
                "email": "john.doe@example.com",
                "first_name": "John",
                "lastname": "Doe",
                "firebase_uid": "firebase_unique_id",
                "email_verified": False,
                "is_active": True
            }
        }
    