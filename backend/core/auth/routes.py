"""
Authentication Routes Module

This module defines API endpoints for Firebase authentication operations.
All routes are documented with OpenAPI/Swagger specifications.
"""

from fastapi import APIRouter, Depends, status, Query, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import HTMLResponse, RedirectResponse
from typing import Dict, Any, Optional
import logging
from backend.core.config import settings
from backend.core.auth.schemas import (
    UserRegistrationRequest,
    UserLoginRequest,
    TokenRefreshRequest,
    PasswordResetRequest,
    PasswordUpdateRequest,
    EmailVerificationRequest,
    AuthResponse,
    UserResponse,
    MessageResponse,
    ErrorResponse
)
from backend.core.auth.service import FirebaseAuthService
from backend.core.auth.dependecies import (
    get_current_user,
    get_current_user_from_db,
    require_verified_email,
    get_auth_service
)
from backend.db.models import Users
from backend.core.errors import (
    InvalidPasswordException,
    InvalidCredentialsException,
    OperationException,
    UserNotFoundException
)

logger = logging.getLogger(__name__)

# HTTP Bearer token security scheme
security = HTTPBearer()


# Create router with prefix and tags
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Internal Server Error"}
    }
)


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with Firebase authentication and store user data in the database.",
    responses={
        201: {"description": "User successfully registered"},
        400: {"description": "Bad request - Email or username already exists"}
    }
)
async def register(
    registration_data: UserRegistrationRequest,
    auth_service: FirebaseAuthService = Depends(get_auth_service)
) -> AuthResponse:
    """
    Register a new user.
    
    This endpoint creates a new user account in Firebase Authentication
    and stores the user's profile information in the database.
    
    - **email**: Valid email address (must be unique)
    - **password**: Password with minimum 6 characters
    - **username**: Unique username (3-30 characters, alphanumeric and underscores only)
    - **first_name**: User's first name
    - **last_name**: User's last name
    
    Returns authentication tokens and user information upon successful registration.
    An email verification link is automatically sent to the provided email address.
    """
    return await auth_service.register_user(registration_data)


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="User login",
    description="Authenticate user with email and password.",
    responses={
        200: {"description": "Successfully authenticated"},
        401: {"description": "Invalid credentials"}
    }
)
async def login(
    login_data: UserLoginRequest,
    auth_service: FirebaseAuthService = Depends(get_auth_service)
) -> AuthResponse:
    """
    Authenticate user and get access tokens.
    
    This endpoint authenticates a user using their email and password,
    returning Firebase authentication tokens upon success.
    
    - **email**: User's registered email address
    - **password**: User's password
    
    Returns ID token, refresh token, and user information.
    The ID token should be included in the Authorization header for protected endpoints.
    """
    return await auth_service.login_user(login_data)


@router.post(
    "/refresh",
    response_model=AuthResponse,
    summary="Refresh access token",
    description="Get a new ID token using a refresh token.",
    responses={
        200: {"description": "Token successfully refreshed"},
        401: {"description": "Invalid refresh token"}
    }
)
async def refresh_token(
    token_data: TokenRefreshRequest,
    auth_service: FirebaseAuthService = Depends(get_auth_service)
) -> AuthResponse:
    """
    Refresh authentication token.
    
    This endpoint exchanges a refresh token for a new ID token.
    Use this when the current ID token expires.
    
    - **refresh_token**: Valid Firebase refresh token
    
    Returns new ID token and refresh token.
    """
    return await auth_service.refresh_token(token_data.refresh_token)


@router.post(
    "/password-reset",
    response_model=MessageResponse,
    summary="Request password reset",
    description="Send password reset email to user.",
    responses={
        200: {"description": "Password reset email sent"},
        400: {"description": "Invalid email address"}
    }
)
async def request_password_reset(
    reset_data: PasswordResetRequest,
    auth_service: FirebaseAuthService = Depends(get_auth_service)
) -> MessageResponse:
    """
    Send password reset email.
    
    This endpoint sends a password reset link to the specified email address.
    The link allows the user to reset their password securely.
    
    - **email**: User's registered email address
    
    Returns success message if email is sent.
    """
    return await auth_service.send_password_reset_email(reset_data.email)


@router.post(
    "/password-update",
    response_model=MessageResponse,
    summary="Update password",
    description="Update user's password (requires authentication).",
    responses={
        200: {"description": "Password successfully updated"},
        401: {"description": "Unauthorized - Invalid token or incorrect current password"}
    }
)
async def update_password(
    password_data: PasswordUpdateRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    current_user: Dict[str, Any] = Depends(get_current_user),
    auth_service: FirebaseAuthService = Depends(get_auth_service)
) -> MessageResponse:
    """
    Update user's password.
    
    This endpoint allows authenticated users to change their password.
    The user must provide their current password for verification,
    then can set a new password.
    
    **Use Case:**
    - User is logged in and wants to change their password
    - Different from password reset (which is for forgotten passwords)
    - Requires knowing the current password
    
    **Flow:**
    1. Verify current password is correct
    2. Update to new password in Firebase
    3. Return success message
    
    **Request Body:**
    - **current_password**: User's current password (for verification)
    - **new_password**: New password (minimum 6 characters)
    
    **Authentication required**: Bearer token in Authorization header
    
    **Note:** After password update, the user will need to login again
    with the new password to get fresh tokens.
    """
    # Get user from database
    user = await get_current_user_from_db(current_user)
    
    # Verify current password by attempting to login
    try:
        login_data = UserLoginRequest(
            email=user.email,
            password=password_data.current_password
        )
        await auth_service.login_user(login_data)
    except (InvalidPasswordException, InvalidCredentialsException):
        raise InvalidPasswordException(message="Current password is incorrect")
    
    # Extract the ID token from the Authorization header
    id_token = credentials.credentials
    
    # Update password using the ID token
    return await auth_service.update_password(id_token, password_data.new_password)



@router.post(
    "/verify-email",
    response_model=MessageResponse,
    summary="Send email verification",
    description="Send verification email to user (requires authentication).",
    responses={
        200: {"description": "Verification email sent"},
        401: {"description": "Unauthorized - Invalid token"}
    }
)
async def send_verification_email(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: FirebaseAuthService = Depends(get_auth_service)
) -> MessageResponse:
    """
    Send email verification link.
    
    This endpoint sends an email verification link to the authenticated user's email.
    The user must click the link to verify their email address.
    
    Returns success message if verification email is sent.
    
    **Authentication required**: Bearer token in Authorization header
    """
    # Extract the ID token from the Authorization header
    id_token = credentials.credentials
    
    # Send the verification email using the ID token
    return await auth_service.send_email_verification(id_token)


@router.post(
    "/sync-verification",
    response_model=MessageResponse,
    summary="Sync email verification status",
    description="Sync email verification status from Firebase to database (requires authentication).",
    responses={
        200: {"description": "Verification status synced"},
        401: {"description": "Unauthorized - Invalid token"}
    }
)
async def sync_verification_status(
    current_user: Dict[str, Any] = Depends(get_current_user),
    auth_service: FirebaseAuthService = Depends(get_auth_service)
) -> MessageResponse:
    """
    Sync email verification status from Firebase to database.
    
    This endpoint manually syncs the email verification status from Firebase
    to your local database. Use this if you verified your email but the
    database still shows it as unverified.
    
    Returns success message with current verification status.
    
    **Authentication required**: Bearer token in Authorization header
    """
    uid = current_user.get("uid")
    is_verified = await auth_service.sync_email_verification_status(uid)
    
    return MessageResponse(
        message=f"Email verification status synced. Email is {'verified' if is_verified else 'not verified'}.",
        success=True
    )



@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
    description="Get the authenticated user's profile information.",
    responses={
        200: {"description": "User profile retrieved"},
        401: {"description": "Unauthorized - Invalid token"},
        404: {"description": "User not found"}
    }
)
async def get_current_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_user),
    auth_service: FirebaseAuthService = Depends(get_auth_service)
) -> UserResponse:
    """
    Get current user's profile.
    
    This endpoint returns the authenticated user's profile information
    from both Firebase and the database.
    
    Returns complete user profile including:
    - User ID
    - Email and verification status
    - Username
    - First and last name
    - Account creation and last login timestamps
    
    **Authentication required**: Bearer token in Authorization header
    """
    uid = current_user.get("uid")
    return await auth_service.get_user_by_uid(uid)


@router.get(
    "/user/{user_id}",
    response_model=UserResponse,
    summary="Get user by ID",
    description="Get a user's profile by their Firebase UID (requires authentication).",
    responses={
        200: {"description": "User profile retrieved"},
        401: {"description": "Unauthorized - Invalid token"},
        404: {"description": "User not found"}
    }
)
async def get_user_by_id(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    auth_service: FirebaseAuthService = Depends(get_auth_service)
) -> UserResponse:
    """
    Get user profile by ID.
    
    This endpoint returns a user's profile information by their Firebase UID.
    Requires authentication to access.
    
    - **user_id**: Firebase user ID (UID)
    
    Returns user profile information.
    
    **Authentication required**: Bearer token in Authorization header
    """
    return await auth_service.get_user_by_uid(user_id)


@router.delete(
    "/me",
    response_model=MessageResponse,
    summary="Delete current user account",
    description="Delete the authenticated user's account (requires email verification).",
    responses={
        200: {"description": "Account successfully deleted"},
        401: {"description": "Unauthorized - Invalid token"},
        403: {"description": "Forbidden - Email not verified"}
    }
)
async def delete_current_user(
    current_user: Dict[str, Any] = Depends(require_verified_email),
    auth_service: FirebaseAuthService = Depends(get_auth_service)
) -> MessageResponse:
    """
    Delete user account.
    
    This endpoint permanently deletes the authenticated user's account
    from both Firebase and the database.
    
    **Warning**: This action is irreversible!
    
    Returns success message if account is deleted.
    
    **Authentication required**: Bearer token in Authorization header
    **Email verification required**: User must have a verified email
    """
    uid = current_user.get("uid")
    return await auth_service.delete_user(uid)


@router.post(
    "/admin/verify-email/{email}",
    response_model=MessageResponse,
    summary="Admin: Manually verify user email",
    description="Manually verify a user's email in Firebase and sync to database (for development/testing).",
    responses={
        200: {"description": "Email verified successfully"},
        404: {"description": "User not found"}
    },
    tags=["Admin"]
)
async def admin_verify_email(
    email: str,
    auth_service: FirebaseAuthService = Depends(get_auth_service)
) -> MessageResponse:
    """
    Admin endpoint to manually verify a user's email.
    
    **WARNING: This is for development/testing only!**
    
    This endpoint bypasses the email verification process and directly
    marks a user's email as verified in both Firebase and MongoDB.
    
    Use this when:
    - Testing in development
    - Email delivery is not working
    - You need to quickly verify an account
    
    **DO NOT use in production without proper admin authentication!**
    
    Args:
        email: User's email address to verify
        
    Returns:
        Success message with verification status
        
    **Note:** In production, add admin authentication to this endpoint!
    """
    import logging
    from firebase_admin import auth as firebase_auth
    
    logger = logging.getLogger(__name__)
    
    try:
        # Find user in database
        user = await Users.find_one(Users.email == email)
        if not user:
            raise UserNotFoundException(message=f"User with email {email} not found")
        
        # Update in Firebase
        firebase_auth.update_user(
            user.firebase_uid,
            email_verified=True
        )
        logger.info(f"Verified email in Firebase for user: {email}")
        
        # Sync to MongoDB
        await auth_service.sync_email_verification_status(user.firebase_uid)
        logger.info(f"Synced verification status to MongoDB for user: {email}")
        
        return MessageResponse(
            message=f"Email {email} has been verified in Firebase and MongoDB",
            success=True
        )
        
    except UserNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify email {email}: {str(e)}")
        raise OperationException(
            message=f"Failed to verify email: {str(e)}",
            error_code="VERIFICATION_FAILED"
        )



@router.get(
    "/verify-token",
    response_model=Dict[str, Any],
    summary="Verify authentication token",
    description="Verify that an authentication token is valid.",
    responses={
        200: {"description": "Token is valid"},
        401: {"description": "Invalid or expired token"}
    }
)
async def verify_token(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Verify authentication token.
    
    This endpoint verifies that the provided authentication token is valid
    and returns the decoded token claims.
    
    Useful for:
    - Checking if a token is still valid
    - Getting user information from a token
    - Validating tokens on the client side
    
    Returns decoded token claims including user ID, email, and other metadata.
    
    **Authentication required**: Bearer token in Authorization header
    """
    return {
        "valid": True,
        "user_id": current_user.get("uid"),
        "email": current_user.get("email"),
        "email_verified": current_user.get("email_verified", False),
        "claims": current_user
    }


@router.get(
    "/health",
    response_model=MessageResponse,
    summary="Health check",
    description="Check if the authentication service is running.",
    responses={
        200: {"description": "Service is healthy"}
    }
)
async def health_check() -> MessageResponse:
    """
    Authentication service health check.
    
    This endpoint returns the health status of the authentication service.
    Useful for monitoring and load balancer health checks.
    
    Returns success message if service is running.
    """
    return MessageResponse(
        message="Authentication service is running",
        success=True
    )


@router.get("/verify-email-callback")
async def verify_email_callback(
    mode: str = Query(..., description="Action mode from Firebase"),
    oobCode: str = Query(..., description="One-time code from Firebase"),
    apiKey: Optional[str] = Query(None, description="Firebase API key"),
    lang: Optional[str] = Query(None, description="Language code"),
    auth_service: FirebaseAuthService = Depends(get_auth_service)
):
    """
    Firebase authentication action callback endpoint.
    
    This endpoint handles various Firebase authentication actions such as
    email verification and password resets.
    """
    logger.info(f"Auth callback received: mode={mode}, oobCode={oobCode[:10]}...")
    
    # Branch based on mode
    if mode == "verifyEmail":
        # Handle email verification
        html_content = await auth_service.handle_email_verification_callback(oobCode)
        
        # Check if we should redirect instead of returning the success page
        success_url = settings.EMAIL_VERIFICATION_SUCCESS_URL if hasattr(settings, 'EMAIL_VERIFICATION_SUCCESS_URL') else None
        if success_url and "Email Verified!" in html_content:
            return RedirectResponse(url=success_url)
        
        return HTMLResponse(content=html_content)
        
    elif mode == "resetPassword":
        # Handle password reset
        # Check for custom frontend redirect
        reset_url = settings.PASSWORD_RESET_URL if hasattr(settings, 'PASSWORD_RESET_URL') else None
        if reset_url:
            # Redirect to custom frontend with oobCode
            separator = "&" if "?" in reset_url else "?"
            return RedirectResponse(url=f"{reset_url}{separator}oobCode={oobCode}&mode={mode}")
            
        # Fallback to built-in backend form
        html_content = await auth_service.handle_password_reset_callback(oobCode)
        return HTMLResponse(content=html_content)
        
    else:
        logger.warning(f"Unsupported auth mode received: {mode}")
        return HTMLResponse(
            content=auth_service.get_error_page(f"Invalid or unsupported auth mode: {mode}"),
            status_code=400
        )


@router.post("/reset-password-confirm")
async def reset_password_confirm(
    oob_code: str = Form(...),
    new_password: str = Form(...),
    auth_service: FirebaseAuthService = Depends(get_auth_service)
):
    """
    Handle the password reset form submission.
    """
    logger.info("Password reset confirmation received")
    html_content = await auth_service.reset_password_with_oob_code(oob_code, new_password)
    return HTMLResponse(content=html_content)

