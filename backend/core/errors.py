"""
Custom Exception Classes and Handlers Module

This module defines custom exception classes for the Tether application
and provides exception handlers for FastAPI.

All custom exceptions inherit from a base TetherException class and
are automatically converted to appropriate HTTP responses.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
import logging

# Configure logger
logger = logging.getLogger(__name__)


# ============================================================================
# Base Exception Classes
# ============================================================================

class TetherException(Exception):
    """
    Base exception class for all Tether application exceptions.
    
    Attributes:
        message: Human-readable error message
        status_code: HTTP status code
        error_code: Application-specific error code
        details: Additional error details
    """
    
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or self.__class__.__name__
        self.details = details or {}
        super().__init__(self.message)


# ============================================================================
# Authentication Exception Classes
# ============================================================================

class AuthenticationException(TetherException):
    """Base class for all authentication-related exceptions."""
    
    def __init__(
        self,
        message: str = "Authentication failed",
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code=error_code,
            details=details
        )


class InvalidCredentialsException(AuthenticationException):
    """Raised when user provides invalid login credentials."""
    
    def __init__(self, message: str = "Invalid email or password"):
        super().__init__(
            message=message,
            error_code="INVALID_CREDENTIALS"
        )


class InvalidTokenException(AuthenticationException):
    """Raised when authentication token is invalid."""
    
    def __init__(self, message: str = "Invalid authentication token"):
        super().__init__(
            message=message,
            error_code="INVALID_TOKEN"
        )


class ExpiredTokenException(AuthenticationException):
    """Raised when authentication token has expired."""
    
    def __init__(self, message: str = "Authentication token has expired"):
        super().__init__(
            message=message,
            error_code="EXPIRED_TOKEN"
        )


class MissingTokenException(AuthenticationException):
    """Raised when authentication token is missing from request."""
    
    def __init__(self, message: str = "Missing authentication token"):
        super().__init__(
            message=message,
            error_code="MISSING_TOKEN"
        )


class InvalidRefreshTokenException(AuthenticationException):
    """Raised when refresh token is invalid."""
    
    def __init__(self, message: str = "Invalid refresh token"):
        super().__init__(
            message=message,
            error_code="INVALID_REFRESH_TOKEN"
        )


# ============================================================================
# Authorization Exception Classes
# ============================================================================

class AuthorizationException(TetherException):
    """Base class for all authorization-related exceptions."""
    
    def __init__(
        self,
        message: str = "Access forbidden",
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code=error_code,
            details=details
        )


class EmailNotVerifiedException(AuthorizationException):
    """Raised when user's email is not verified but verification is required."""
    
    def __init__(
        self,
        message: str = "Email verification required. Please verify your email to access this resource."
    ):
        super().__init__(
            message=message,
            error_code="EMAIL_NOT_VERIFIED"
        )


class InsufficientPermissionsException(AuthorizationException):
    """Raised when user lacks required permissions."""
    
    def __init__(self, message: str = "Insufficient permissions to access this resource"):
        super().__init__(
            message=message,
            error_code="INSUFFICIENT_PERMISSIONS"
        )


# ============================================================================
# Resource Exception Classes
# ============================================================================

class ResourceException(TetherException):
    """Base class for resource-related exceptions."""
    pass


class ResourceNotFoundException(ResourceException):
    """Raised when a requested resource is not found."""
    
    def __init__(
        self,
        resource_type: str = "Resource",
        message: Optional[str] = None
    ):
        message = message or f"{resource_type} not found"
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="RESOURCE_NOT_FOUND",
            details={"resource_type": resource_type}
        )


class UserNotFoundException(ResourceNotFoundException):
    """Raised when a user is not found."""
    
    def __init__(self, message: str = "User not found"):
        super().__init__(
            resource_type="User",
            message=message
        )


class UserNotFoundInDatabaseException(UserNotFoundException):
    """Raised when user exists in Firebase but not in database."""
    
    def __init__(self, message: str = "User not found in database"):
        super().__init__(message=message)


# ============================================================================
# Validation Exception Classes
# ============================================================================

class ValidationException(TetherException):
    """Base class for validation-related exceptions."""
    
    def __init__(
        self,
        message: str = "Validation failed",
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=error_code,
            details=details
        )


class EmailAlreadyExistsException(ValidationException):
    """Raised when attempting to register with an email that already exists."""
    
    def __init__(self, message: str = "Email already registered"):
        super().__init__(
            message=message,
            error_code="EMAIL_ALREADY_EXISTS"
        )


class UsernameAlreadyExistsException(ValidationException):
    """Raised when attempting to register with a username that already exists."""
    
    def __init__(self, message: str = "Username already exists"):
        super().__init__(
            message=message,
            error_code="USERNAME_ALREADY_EXISTS"
        )


class InvalidEmailException(ValidationException):
    """Raised when email format is invalid."""
    
    def __init__(self, message: str = "Invalid email address"):
        super().__init__(
            message=message,
            error_code="INVALID_EMAIL"
        )


class WeakPasswordException(ValidationException):
    """Raised when password doesn't meet security requirements."""
    
    def __init__(
        self,
        message: str = "Password is too weak. Please use at least 6 characters"
    ):
        super().__init__(
            message=message,
            error_code="WEAK_PASSWORD"
        )


class InvalidPasswordException(ValidationException):
    """Raised when current password is incorrect during password update."""
    
    def __init__(self, message: str = "Current password is incorrect"):
        super().__init__(
            message=message,
            error_code="INVALID_PASSWORD"
        )


# ============================================================================
# Operation Exception Classes
# ============================================================================

class OperationException(TetherException):
    """Base class for operation-related exceptions."""
    
    def __init__(
        self,
        message: str = "Operation failed",
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code=error_code,
            details=details
        )


class RegistrationFailedException(OperationException):
    """Raised when user registration fails."""
    
    def __init__(self, message: str = "Registration failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="REGISTRATION_FAILED",
            details=details
        )


class LoginFailedException(OperationException):
    """Raised when login operation fails."""
    
    def __init__(self, message: str = "Login failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="LOGIN_FAILED",
            details=details
        )


class TokenRefreshFailedException(OperationException):
    """Raised when token refresh operation fails."""
    
    def __init__(self, message: str = "Token refresh failed"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="TOKEN_REFRESH_FAILED"
        )


class PasswordResetFailedException(OperationException):
    """Raised when password reset email sending fails."""
    
    def __init__(self, message: str = "Failed to send password reset email"):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="PASSWORD_RESET_FAILED"
        )


class EmailVerificationFailedException(OperationException):
    """Raised when email verification sending fails."""
    
    def __init__(self, message: str = "Failed to send verification email"):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="EMAIL_VERIFICATION_FAILED"
        )


class PasswordUpdateFailedException(OperationException):
    """Raised when password update fails."""
    
    def __init__(self, message: str = "Failed to update password"):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="PASSWORD_UPDATE_FAILED"
        )


class UserDeletionFailedException(OperationException):
    """Raised when user deletion fails."""
    
    def __init__(self, message: str = "Failed to delete user"):
        super().__init__(
            message=message,
            error_code="USER_DELETION_FAILED"
        )


class UserRetrievalFailedException(OperationException):
    """Raised when user retrieval fails."""
    
    def __init__(self, message: str = "Failed to retrieve user"):
        super().__init__(
            message=message,
            error_code="USER_RETRIEVAL_FAILED"
        )


# ============================================================================
# Rate Limiting Exception Classes
# ============================================================================

class RateLimitException(TetherException):
    """Raised when rate limit is exceeded."""
    
    def __init__(
        self,
        message: str = "Too many failed attempts. Please try again later"
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            error_code="RATE_LIMIT_EXCEEDED"
        )


# ============================================================================
# Account Status Exception Classes
# ============================================================================

class AccountException(TetherException):
    """Base class for account status exceptions."""
    pass


class AccountDisabledException(AccountException):
    """Raised when attempting to access a disabled account."""
    
    def __init__(self, message: str = "This account has been disabled"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="ACCOUNT_DISABLED"
        )


# ============================================================================
# Exception Handlers
# ============================================================================

async def tether_exception_handler(request: Request, exc: TetherException) -> JSONResponse:
    """
    Global exception handler for all TetherException instances.
    
    This handler catches all custom exceptions and converts them to
    appropriate JSON responses with consistent error format.
    
    Args:
        request: FastAPI request object
        exc: The exception instance
        
    Returns:
        JSONResponse with error details
    """
    # Log the exception
    logger.error(
        f"TetherException occurred: {exc.error_code} - {exc.message}",
        extra={
            "error_code": exc.error_code,
            "status_code": exc.status_code,
            "details": exc.details,
            "path": request.url.path,
            "method": request.method
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "error_code": exc.error_code,
            "details": exc.details
        }
    )


async def validation_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handler for Pydantic validation errors.
    
    Args:
        request: FastAPI request object
        exc: The validation exception
        
    Returns:
        JSONResponse with validation error details
    """
    from fastapi.exceptions import RequestValidationError
    
    if isinstance(exc, RequestValidationError):
        logger.warning(
            f"Validation error occurred: {exc.errors()}",
            extra={
                "path": request.url.path,
                "method": request.method
            }
        )
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "Validation failed",
                "error_code": "VALIDATION_ERROR",
                "details": {
                    "errors": exc.errors()
                }
            }
        )
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": str(exc),
            "error_code": "VALIDATION_ERROR"
        }
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Fallback handler for unexpected exceptions.
    
    Args:
        request: FastAPI request object
        exc: The exception
        
    Returns:
        JSONResponse with generic error message
    """
    # Log the unexpected exception
    logger.exception(
        f"Unexpected exception occurred: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method
        }
    )
    
    # Don't expose internal error details in production
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "An unexpected error occurred. Please try again later.",
            "error_code": "INTERNAL_SERVER_ERROR"
        }
    )


# ============================================================================
# Exception Handler Registration Function
# ============================================================================

def register_exception_handlers(app):
    """
    Register all exception handlers with the FastAPI application.
    
    This function should be called during application initialization
    to set up global exception handling.
    
    Args:
        app: FastAPI application instance
        
    Usage:
        from backend.core.errors import register_exception_handlers
        
        app = FastAPI()
        register_exception_handlers(app)
    """
    from fastapi.exceptions import RequestValidationError
    
    # Register custom exception handler
    app.add_exception_handler(TetherException, tether_exception_handler)
    
    # Register validation exception handler
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    
    # Register generic exception handler as fallback
    app.add_exception_handler(Exception, generic_exception_handler)
    
    logger.info("Exception handlers registered successfully")
