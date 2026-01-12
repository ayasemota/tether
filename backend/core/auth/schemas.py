"""
Authentication Schemas Module

This module defines Pydantic schemas for authentication-related requests and responses.
All schemas include validation rules and documentation for API endpoints.
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime


class UserRegistrationRequest(BaseModel):
    """
    Schema for user registration requests.
    
    Attributes:
        email: User's email address (must be valid email format)
        password: User's password (minimum 6 characters)
        username: Unique username for the user
        first_name: User's first name
        last_name: User's last name
    """
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=6, description="User's password (minimum 6 characters)")
    username: str = Field(..., min_length=3, max_length=30, description="Unique username")
    first_name: str = Field(..., min_length=1, max_length=50, description="User's first name")
    last_name: str = Field(..., min_length=1, max_length=50, description="User's last name")
    
    @validator('username')
    def validate_username(cls, v):
        """Validate username contains only alphanumeric characters and underscores."""
        if not v.replace('_', '').isalnum():
            raise ValueError('Username must contain only letters, numbers, and underscores')
        return v.lower()


class UserLoginRequest(BaseModel):
    """
    Schema for user login requests.
    
    Attributes:
        email: User's email address
        password: User's password
    """
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class TokenRefreshRequest(BaseModel):
    """
    Schema for token refresh requests.
    
    Attributes:
        refresh_token: Firebase refresh token
    """
    refresh_token: str = Field(..., description="Firebase refresh token")


class PasswordResetRequest(BaseModel):
    """
    Schema for password reset requests.
    
    Attributes:
        email: User's email address to send reset link
    """
    email: EmailStr = Field(..., description="User's email address")


class PasswordUpdateRequest(BaseModel):
    """
    Schema for password update requests.
    
    Attributes:
        current_password: User's current password
        new_password: User's new password (minimum 6 characters)
    """
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=6, description="New password (minimum 6 characters)")


class EmailVerificationRequest(BaseModel):
    """
    Schema for email verification requests.
    
    Attributes:
        id_token: Firebase ID token from the user
    """
    id_token: str = Field(..., description="Firebase ID token")


class AuthResponse(BaseModel):
    """
    Schema for authentication response.
    
    Attributes:
        id_token: Firebase ID token (JWT)
        refresh_token: Firebase refresh token
        expires_in: Token expiration time in seconds
        user_id: Firebase user ID
        email: User's email address
        email_verified: Whether email is verified
    """
    id_token: str = Field(..., description="Firebase ID token (JWT)")
    refresh_token: str = Field(..., description="Firebase refresh token")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    user_id: str = Field(..., description="Firebase user ID")
    email: str = Field(..., description="User's email address")
    email_verified: bool = Field(default=False, description="Email verification status")


class UserResponse(BaseModel):
    """
    Schema for user profile response.
    
    Attributes:
        user_id: Firebase user ID
        email: User's email address
        username: User's username
        first_name: User's first name
        last_name: User's last name
        email_verified: Whether email is verified
        created_at: Account creation timestamp
        last_login: Last login timestamp
    """
    user_id: str = Field(..., description="Firebase user ID")
    email: str = Field(..., description="User's email address")
    username: str = Field(..., description="User's username")
    first_name: str = Field(..., description="User's first name")
    last_name: str = Field(..., description="User's last name")
    email_verified: bool = Field(default=False, description="Email verification status")
    created_at: Optional[datetime] = Field(None, description="Account creation timestamp")
    last_login: Optional[datetime] = Field(None, description="Last login timestamp")
    
    class Config:
        """Pydantic model configuration."""
        from_attributes = True


class MessageResponse(BaseModel):
    """
    Schema for simple message responses.
    
    Attributes:
        message: Response message
        success: Whether the operation was successful
    """
    message: str = Field(..., description="Response message")
    success: bool = Field(default=True, description="Operation success status")


class ErrorResponse(BaseModel):
    """
    Schema for error responses.
    
    Attributes:
        error: Error message
        error_code: Optional error code
        details: Optional additional error details
    """
    error: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Error code")
    details: Optional[dict] = Field(None, description="Additional error details")
