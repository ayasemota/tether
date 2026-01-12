"""
Authentication Dependencies Module

This module provides dependency injection functions for Firebase authentication.
These dependencies are used in route handlers to authenticate and authorize requests.
"""

from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
from backend.core.auth.service import FirebaseAuthService
from backend.db.models import Users
from backend.core.errors import (
    MissingTokenException,
    InvalidTokenException,
    ExpiredTokenException,
    UserNotFoundInDatabaseException,
    EmailNotVerifiedException
)


# HTTP Bearer token security scheme
security = HTTPBearer()


class FirebaseAuthDependency:
    """
    Dependency class for Firebase authentication.
    
    This class provides methods to inject authentication dependencies
    into route handlers.
    """
    
    def __init__(self):
        """Initialize Firebase authentication service."""
        self.auth_service = FirebaseAuthService()
    
    async def get_current_user(
        self,
        credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> Dict[str, Any]:
        """
        Dependency to get the current authenticated user from Firebase token.
        
        This dependency extracts the Bearer token from the Authorization header,
        verifies it with Firebase, and returns the decoded token claims.
        
        Args:
            credentials: HTTP Bearer token credentials from request header
            
        Returns:
            Dict containing user claims from the verified token
            
        Raises:
            HTTPException: If token is missing, invalid, or expired
            
        Usage:
            @app.get("/protected")
            async def protected_route(
                current_user: dict = Depends(firebase_auth.get_current_user)
            ):
                return {"user_id": current_user["uid"]}
        """
        if not credentials:
            raise MissingTokenException()
        
        token = credentials.credentials
        
        # Verify token and get user claims
        user_claims = await self.auth_service.verify_token(token)
        
        # Sync email verification status from Firebase to database
        # This ensures the database is always up-to-date with Firebase
        try:
            await self.auth_service.sync_email_verification_status(user_claims.get("uid"))
        except Exception:
            # Don't fail authentication if sync fails
            pass
        
        return user_claims
    
    async def get_current_user_from_db(
        self,
        current_user: Dict[str, Any] = Depends(get_current_user)
    ) -> Users:
        """
        Dependency to get the current user's database record.
        
        This dependency builds on get_current_user by fetching the complete
        user record from the database using the Firebase UID.
        
        Args:
            current_user: User claims from Firebase token (injected dependency)
            
        Returns:
            Users: Complete user database record
            
        Raises:
            HTTPException: If user not found in database
            
        Usage:
            @app.get("/profile")
            async def get_profile(
                user: Users = Depends(firebase_auth.get_current_user_from_db)
            ):
                return {"username": user.username}
        """
        uid = current_user.get("uid")
        
        if not uid:
            raise InvalidTokenException(message="Invalid token: missing user ID")
        
        # Fetch user from database
        db_user = await Users.find_one(Users.firebase_uid == uid)
        
        if not db_user:
            raise UserNotFoundInDatabaseException()
        
        return db_user
    
    async def get_optional_user(
        self,
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
    ) -> Optional[Dict[str, Any]]:
        """
        Dependency to optionally get the current user.
        
        This dependency is useful for endpoints that work both with
        authenticated and unauthenticated users, providing different
        functionality based on authentication status.
        
        Args:
            credentials: Optional HTTP Bearer token credentials
            
        Returns:
            Dict containing user claims if authenticated, None otherwise
            
        Usage:
            @app.get("/posts")
            async def get_posts(
                current_user: Optional[dict] = Depends(firebase_auth.get_optional_user)
            ):
                if current_user:
                    # Show personalized posts
                    pass
                else:
                    # Show public posts
                    pass
        """
        if not credentials:
            return None
        
        try:
            token = credentials.credentials
            user_claims = await self.auth_service.verify_token(token)
            return user_claims
        except (InvalidTokenException, ExpiredTokenException, MissingTokenException):
            return None
    
    async def require_verified_email(
        self,
        current_user: Dict[str, Any] = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """
        Dependency to ensure the current user has a verified email.
        
        This dependency checks if the user's email is verified and
        raises an exception if not.
        
        Args:
            current_user: User claims from Firebase token (injected dependency)
            
        Returns:
            Dict containing user claims if email is verified
            
        Raises:
            HTTPException: If email is not verified
            
        Usage:
            @app.post("/sensitive-action")
            async def sensitive_action(
                user: dict = Depends(firebase_auth.require_verified_email)
            ):
                # Only users with verified emails can access this
                pass
        """
        if not current_user.get("email_verified", False):
            raise EmailNotVerifiedException()
        
        return current_user
    
    async def get_auth_service(self) -> FirebaseAuthService:
        """
        Dependency to inject the Firebase authentication service.
        
        This dependency provides direct access to the authentication service
        for operations that need more control than the standard dependencies.
        
        Returns:
            FirebaseAuthService: Instance of the authentication service
            
        Usage:
            @app.post("/custom-auth")
            async def custom_auth(
                auth_service: FirebaseAuthService = Depends(firebase_auth.get_auth_service)
            ):
                # Use auth_service methods directly
                pass
        """
        return self.auth_service


# Create a singleton instance for dependency injection
firebase_auth = FirebaseAuthDependency()


# Convenience functions for direct use in route dependencies
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """
    Convenience function to get current authenticated user.
    
    This is a shorthand for firebase_auth.get_current_user that can be
    used directly in Depends() without accessing the instance.
    
    Args:
        credentials: HTTP Bearer token credentials
        
    Returns:
        Dict containing user claims from verified token
    """
    return await firebase_auth.get_current_user(credentials)


async def get_current_user_from_db(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Users:
    """
    Convenience function to get current user's database record.
    
    Args:
        current_user: User claims from Firebase token
        
    Returns:
        Users: Complete user database record
    """
    return await firebase_auth.get_current_user_from_db(current_user)


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[Dict[str, Any]]:
    """
    Convenience function to optionally get current user.
    
    Args:
        credentials: Optional HTTP Bearer token credentials
        
    Returns:
        Dict containing user claims if authenticated, None otherwise
    """
    return await firebase_auth.get_optional_user(credentials)


async def require_verified_email(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Convenience function to require verified email.
    
    Args:
        current_user: User claims from Firebase token
        
    Returns:
        Dict containing user claims if email is verified
    """
    return await firebase_auth.require_verified_email(current_user)


async def get_auth_service() -> FirebaseAuthService:
    """
    Convenience function to get authentication service.
    
    Returns:
        FirebaseAuthService: Instance of the authentication service
    """
    return await firebase_auth.get_auth_service()
