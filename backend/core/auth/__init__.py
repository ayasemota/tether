"""
Authentication Module

This module provides Firebase authentication for the Tether application.

Usage:
    from backend.core.auth import router, FirebaseAuthService, get_current_user
    
    # Include router in your FastAPI app
    app.include_router(router)
    
    # Use dependencies in your routes
    @app.get("/protected")
    async def protected(user = Depends(get_current_user)):
        return {"user_id": user["uid"]}
"""

from backend.core.auth.routes import router
from backend.core.auth.service import FirebaseAuthService
from backend.core.auth.dependecies import (
    get_current_user,
    get_current_user_from_db,
    get_optional_user,
    require_verified_email,
    get_auth_service,
    firebase_auth
)
from backend.core.auth.schemas import (
    UserRegistrationRequest,
    UserLoginRequest,
    TokenRefreshRequest,
    PasswordResetRequest,
    PasswordUpdateRequest,
    AuthResponse,
    UserResponse,
    MessageResponse,
    ErrorResponse
)

__all__ = [
    # Router
    "router",
    
    # Service
    "FirebaseAuthService",
    
    # Dependencies
    "get_current_user",
    "get_current_user_from_db",
    "get_optional_user",
    "require_verified_email",
    "get_auth_service",
    "firebase_auth",
    
    # Schemas
    "UserRegistrationRequest",
    "UserLoginRequest",
    "TokenRefreshRequest",
    "PasswordResetRequest",
    "PasswordUpdateRequest",
    "AuthResponse",
    "UserResponse",
    "MessageResponse",
    "ErrorResponse",
]
