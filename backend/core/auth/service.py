"""
Firebase Authentication Service Module

This module provides a comprehensive service class for handling Firebase authentication operations.
It includes methods for user registration, login, token management, password operations, and more.
"""

import firebase_admin
from firebase_admin import auth, credentials
from typing import Optional, Dict, Any
from datetime import datetime
import requests
import json
from backend.core.config import settings
from backend.core.auth.schemas import (
    UserRegistrationRequest,
    UserLoginRequest,
    AuthResponse,
    UserResponse,
    MessageResponse
)
from backend.db.models import Users
from backend.core.errors import (
    UsernameAlreadyExistsException,
    EmailAlreadyExistsException,
    RegistrationFailedException,
    InvalidCredentialsException,
    LoginFailedException,
    InvalidTokenException,
    ExpiredTokenException,
    InvalidRefreshTokenException,
    TokenRefreshFailedException,
    PasswordResetFailedException,
    EmailVerificationFailedException,
    PasswordUpdateFailedException,
    UserNotFoundException,
    UserNotFoundInDatabaseException,
    UserDeletionFailedException,
    UserRetrievalFailedException,
    AccountDisabledException,
    RateLimitException
)
from backend.core.config import settings


class FirebaseAuthService:
    """
    Service class for Firebase authentication operations.
    
    This class handles all Firebase authentication-related operations including:
    - User registration and login
    - Token verification and refresh
    - Password management
    - Email verification
    - User profile management
    """
    
    # Firebase REST API endpoints
    FIREBASE_API_KEY: str = settings.FIREBASE_API_KEY
    FIREBASE_AUTH_URL: str = "https://identitytoolkit.googleapis.com/v1/accounts"
    
    def __init__(self):
        """
        Initialize Firebase Admin SDK.
        
        This method initializes the Firebase Admin SDK using credentials from settings.
        It only initializes once to avoid duplicate app errors.
        """
        if not firebase_admin._apps:
            # Initialize Firebase Admin SDK with service account credentials
            if settings.FIREBASE_CREDENTIALS_JSON:
                try:
                    cred_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
                    cred = credentials.Certificate(cred_dict)
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to parse FIREBASE_CREDENTIALS_JSON: {str(e)}")
                    # Fallback to path if parsing fails
                    if settings.FIREBASE_CREDENTIALS_PATH:
                        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                    else:
                        raise e
            elif settings.FIREBASE_CREDENTIALS_PATH:
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            else:
                raise ValueError("Neither FIREBASE_CREDENTIALS_JSON nor FIREBASE_CREDENTIALS_PATH is provided.")
            
            firebase_admin.initialize_app(cred)
    
    async def register_user(self, registration_data: UserRegistrationRequest) -> AuthResponse:
        """
        Register a new user with Firebase and create a database record.
        
        Args:
            registration_data: User registration information
            
        Returns:
            AuthResponse: Authentication tokens and user information
            
        Raises:
            HTTPException: If registration fails or username already exists
        """
        try:
            # Check if username already exists in database
            existing_user = await Users.find_one(Users.username == registration_data.username)
            if existing_user:
                raise UsernameAlreadyExistsException()
            
            # Create user in Firebase Authentication
            firebase_user = auth.create_user(
                email=registration_data.email,
                password=registration_data.password,
                display_name=f"{registration_data.first_name} {registration_data.last_name}",
                email_verified=False
            )
            
            # Create user record in database
            new_user = Users(
                username=registration_data.username,
                email=registration_data.email,
                password="",  # Password is managed by Firebase
                first_name=registration_data.first_name,
                lastname=registration_data.last_name,
                firebase_uid=firebase_user.uid,
                email_verified=False,
                created_at=datetime.utcnow()
            )
            await new_user.insert()
            
            # Generate custom token for the user
            custom_token = auth.create_custom_token(firebase_user.uid)
            
            # Exchange custom token for ID token and refresh token
            auth_response = await self._exchange_custom_token(custom_token.decode('utf-8'))
            
            # Try to send email verification (non-blocking - don't fail registration if this fails)
            try:
                await self.send_email_verification(auth_response['idToken'])
            except EmailVerificationFailedException as e:
                # Log the error but don't fail registration
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to send verification email during registration: {str(e)}")
            
            return AuthResponse(
                id_token=auth_response['idToken'],
                refresh_token=auth_response['refreshToken'],
                expires_in=int(auth_response['expiresIn']),
                user_id=firebase_user.uid,
                email=firebase_user.email,
                email_verified=False
            )
            
        except auth.EmailAlreadyExistsError:
            raise EmailAlreadyExistsException()
        except (UsernameAlreadyExistsException, EmailAlreadyExistsException):
            raise
        except Exception as e:
            # Clean up Firebase user if database creation fails
            if 'firebase_user' in locals():
                try:
                    auth.delete_user(firebase_user.uid)
                except:
                    pass
            raise RegistrationFailedException(
                message=f"Registration failed: {str(e)}",
                details={"error": str(e)}
            )
    
    async def login_user(self, login_data: UserLoginRequest) -> AuthResponse:
        """
        Authenticate user with email and password.
        
        Args:
            login_data: User login credentials
            
        Returns:
            AuthResponse: Authentication tokens and user information
            
        Raises:
            HTTPException: If login fails
        """
        try:
            # Sign in with Firebase REST API
            url = f"{self.FIREBASE_AUTH_URL}:signInWithPassword?key={self.FIREBASE_API_KEY}"
            payload = {
                "email": login_data.email,
                "password": login_data.password,
                "returnSecureToken": True
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code != 200:
                error_data = response.json()
                error_message = error_data.get('error', {}).get('message', 'Login failed')
                formatted_error = self._format_firebase_error(error_message)
                raise InvalidCredentialsException(message=formatted_error)
            
            auth_data = response.json()
            uid = auth_data['localId']
            
            # Update last login in database
            user = await Users.find_one(Users.email == login_data.email)
            if user:
                user.last_login = datetime.utcnow()
                await user.save()
            
            # Sync verification status from Firebase to ensure we have the latest
            # This handles the case where the user verified their email but our DB is out of sync
            email_verified = await self.sync_email_verification_status(uid)
            
            return AuthResponse(
                id_token=auth_data['idToken'],
                refresh_token=auth_data['refreshToken'],
                expires_in=int(auth_data['expiresIn']),
                user_id=uid,
                email=auth_data['email'],
                email_verified=email_verified
            )
            
        except (InvalidCredentialsException, AccountDisabledException, RateLimitException):
            raise
        except Exception as e:
            raise LoginFailedException(
                message=f"Login failed: {str(e)}",
                details={"error": str(e)}
            )
    
    async def verify_token(self, id_token: str) -> Dict[str, Any]:
        """
        Verify Firebase ID token and return decoded claims.
        
        Args:
            id_token: Firebase ID token to verify
            
        Returns:
            Dict containing user claims from the token
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except auth.InvalidIdTokenError:
            raise InvalidTokenException()
        except auth.ExpiredIdTokenError:
            raise ExpiredTokenException()
        except Exception as e:
            raise InvalidTokenException(
                message=f"Token verification failed: {str(e)}"
            )
    
    async def refresh_token(self, refresh_token: str) -> AuthResponse:
        """
        Refresh Firebase ID token using refresh token.
        
        Args:
            refresh_token: Firebase refresh token
            
        Returns:
            AuthResponse: New authentication tokens
            
        Raises:
            HTTPException: If token refresh fails
        """
        try:
            url = f"https://securetoken.googleapis.com/v1/token?key={self.FIREBASE_API_KEY}"
            payload = {
                "grant_type": "refresh_token",
                "refresh_token": refresh_token
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code != 200:
                raise InvalidRefreshTokenException()
            
            token_data = response.json()
            
            # Verify the new token to get user info
            decoded_token = await self.verify_token(token_data['id_token'])
            
            return AuthResponse(
                id_token=token_data['id_token'],
                refresh_token=token_data['refresh_token'],
                expires_in=int(token_data['expires_in']),
                user_id=decoded_token['uid'],
                email=decoded_token.get('email', ''),
                email_verified=decoded_token.get('email_verified', False)
            )
            
        except InvalidRefreshTokenException:
            raise
        except Exception as e:
            raise TokenRefreshFailedException(
                message=f"Token refresh failed: {str(e)}"
            )
    
    async def send_password_reset_email(self, email: str) -> MessageResponse:
        """
        Send password reset email to user.
        
        Args:
            email: User's email address
            
        Returns:
            MessageResponse: Success message
            
        Raises:
            HTTPException: If sending email fails
        """
        try:
            url = f"{self.FIREBASE_AUTH_URL}:sendOobCode?key={self.FIREBASE_API_KEY}"
            payload = {
                "requestType": "PASSWORD_RESET",
                "email": email
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code != 200:
                error_data = response.json()
                error_message = error_data.get('error', {}).get('message', 'Failed to send reset email')
                formatted_error = self._format_firebase_error(error_message)
                raise PasswordResetFailedException(message=formatted_error)
            
            return MessageResponse(
                message="Password reset email sent successfully",
                success=True
            )
            
        except PasswordResetFailedException:
            raise
        except Exception as e:
            raise PasswordResetFailedException(
                message=f"Failed to send password reset email: {str(e)}"
            )
    
    async def send_email_verification(self, id_token: str) -> MessageResponse:
        """
        Send email verification link to user.
        
        Args:
            id_token: User's Firebase ID token
            
        Returns:
            MessageResponse: Success message
            
        Raises:
            EmailVerificationFailedException: If sending verification email fails
        """
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            url = f"{self.FIREBASE_AUTH_URL}:sendOobCode?key={self.FIREBASE_API_KEY}"
            payload = {
                "requestType": "VERIFY_EMAIL",
                "idToken": id_token
            }
            
            logger.info(f"Attempting to send verification email to Firebase API")
            response = requests.post(url, json=payload)
            
            if response.status_code != 200:
                error_data = response.json() if response.content else {}
                error_message = error_data.get('error', {}).get('message', 'Unknown error')
                logger.error(f"Firebase email verification failed: {error_message}, Status: {response.status_code}")
                logger.error(f"Response body: {response.text}")
                raise EmailVerificationFailedException(
                    message=f"Failed to send verification email: {error_message}"
                )
            
            logger.info("Verification email sent successfully")
            return MessageResponse(
                message="Verification email sent successfully",
                success=True
            )
            
        except EmailVerificationFailedException:
            raise
        except Exception as e:
            logger.exception(f"Unexpected error sending verification email: {str(e)}")
            raise EmailVerificationFailedException(
                message=f"Failed to send verification email: {str(e)}"
            )
    
    async def update_password(self, id_token: str, new_password: str) -> MessageResponse:
        """
        Update user's password.
        
        Args:
            id_token: User's Firebase ID token
            new_password: New password
            
        Returns:
            MessageResponse: Success message
            
        Raises:
            HTTPException: If password update fails
        """
        try:
            url = f"{self.FIREBASE_AUTH_URL}:update?key={self.FIREBASE_API_KEY}"
            payload = {
                "idToken": id_token,
                "password": new_password,
                "returnSecureToken": False
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code != 200:
                raise PasswordUpdateFailedException()
            
            return MessageResponse(
                message="Password updated successfully",
                success=True
            )
            
        except PasswordUpdateFailedException:
            raise
        except Exception as e:
            raise PasswordUpdateFailedException(
                message=f"Failed to update password: {str(e)}"
            )
    
    async def get_user_by_uid(self, uid: str) -> UserResponse:
        """
        Get user information by Firebase UID.
        
        Args:
            uid: Firebase user ID
            
        Returns:
            UserResponse: User profile information
            
        Raises:
            HTTPException: If user not found
        """
        try:
            # Get user from Firebase
            firebase_user = auth.get_user(uid)
            
            # Get user from database
            db_user = await Users.find_one(Users.firebase_uid == uid)
            
            if not db_user:
                raise UserNotFoundInDatabaseException()
            
            return UserResponse(
                user_id=firebase_user.uid,
                email=firebase_user.email,
                username=db_user.username,
                first_name=db_user.first_name,
                last_name=db_user.lastname,
                email_verified=firebase_user.email_verified,
                created_at=db_user.created_at if hasattr(db_user, 'created_at') else None,
                last_login=db_user.last_login if hasattr(db_user, 'last_login') else None
            )
            
        except auth.UserNotFoundError:
            raise UserNotFoundException()
        except (UserNotFoundException, UserNotFoundInDatabaseException):
            raise
        except Exception as e:
            raise UserRetrievalFailedException(
                message=f"Failed to retrieve user: {str(e)}"
            )
    
    async def delete_user(self, uid: str) -> MessageResponse:
        """
        Delete user from Firebase and database.
        
        Args:
            uid: Firebase user ID
            
        Returns:
            MessageResponse: Success message
            
        Raises:
            HTTPException: If deletion fails
        """
        try:
            # Delete from Firebase
            auth.delete_user(uid)
            
            # Delete from database
            db_user = await Users.find_one(Users.firebase_uid == uid)
            if db_user:
                await db_user.delete()
            
            return MessageResponse(
                message="User deleted successfully",
                success=True
            )
            
        except auth.UserNotFoundError:
            raise UserNotFoundException()
        except Exception as e:
            raise UserDeletionFailedException(
                message=f"Failed to delete user: {str(e)}"
            )

    async def _exchange_custom_token(self, custom_token: str) -> Dict[str, Any]:
        """
        Exchange custom token for ID token and refresh token.
        
        Args:
            custom_token: Firebase custom token
            
        Returns:
            Dict containing idToken, refreshToken, and expiresIn
            
        Raises:
            Exception: If token exchange fails
        """
        url = f"{self.FIREBASE_AUTH_URL}:signInWithCustomToken?key={self.FIREBASE_API_KEY}"
        payload = {
            "token": custom_token,
            "returnSecureToken": True
        }
        
        response = requests.post(url, json=payload)
        
        if response.status_code != 200:
            raise Exception("Failed to exchange custom token")
        
        return response.json()
    
    async def handle_email_verification_callback(self, oob_code: str) -> str:
        """
        Handle the email verification callback from Firebase.
        
        This method verifies the code, confirms verification in Firebase,
        and updates the local database.
        
        Args:
            oob_code: One-time verification code from Firebase
            
        Returns:
            str: HTML page (success or error)
        """
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # Step 1: Verify the oobCode with Firebase
            firebase_response = await self._verify_oob_code(oob_code)
            email = firebase_response.get("email")
            
            if not email:
                raise Exception("No email found in Firebase response")
            
            logger.info(f"Successfully verified oobCode for email: {email}")
            
            # Step 2: Confirm the email verification with Firebase
            await self._confirm_email_verification(oob_code)
            logger.info(f"Confirmed email verification in Firebase for: {email}")
            
            # Step 3: Update MongoDB
            user = await Users.find_one(Users.email == email)
            if user:
                user.email_verified = True
                await user.save()
                logger.info(f"Updated email_verified in MongoDB for: {email}")
            else:
                logger.warning(f"User not found in MongoDB during callback: {email}")
            
            return self.get_success_page(email)
            
        except Exception as e:
            logger.error(f"Email verification callback failed: {str(e)}", exc_info=True)
            return self.get_error_page(str(e))

    async def handle_password_reset_callback(self, oob_code: str) -> str:
        """
        Handle the password reset callback from Firebase.
        
        Verifies the code and returns the password reset form.
        
        Args:
            oob_code: One-time verification code from Firebase
            
        Returns:
            str: HTML form or error page
        """
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # Verify the oobCode
            firebase_response = await self._verify_oob_code(oob_code)
            email = firebase_response.get("email")
            
            if not email:
                raise Exception("Unable to identify email for this reset request.")
            
            # Return the reset form
            return self.get_password_reset_form(oob_code, email)
            
        except Exception as e:
            logger.error(f"Password reset callback failed: {str(e)}", exc_info=True)
            return self.get_error_page(str(e))

    async def reset_password_with_oob_code(self, oob_code: str, new_password: str) -> str:
        """
        Update user's password using the Firebase oobCode.
        
        Args:
            oob_code: One-time code from Firebase
            new_password: The new password to set
            
        Returns:
            str: Success page or error logic
        """
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # Step 1: Confirm the password reset with Firebase
            url = f"https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key={self.FIREBASE_API_KEY}"
            payload = {
                "oobCode": oob_code,
                "newPassword": new_password
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code != 200:
                error_data = response.json()
                error_message = error_data.get('error', {}).get('message', 'Failed to reset password')
                raise Exception(f"Firebase error: {error_message}")
            
            # Step 2: Return success page
            return self.get_password_reset_success_page()
            
        except Exception as e:
            logger.error(f"Password reset confirmation failed: {str(e)}", exc_info=True)
            return self.get_error_page(str(e))

    def get_password_reset_form(self, oob_code: str, email: str) -> str:
        """Generate a beautiful HTML password reset form."""
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Password - Tether</title>
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex; align-items: center; justify-content: center; padding: 20px;
                }}
                .container {{
                    background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    padding: 40px; max-width: 450px; width: 100%; text-align: center;
                }}
                h1 {{ color: #1a202c; font-size: 28px; margin-bottom: 12px; font-weight: 700; }}
                p {{ color: #4a5568; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }}
                .email {{ color: #667eea; font-weight: 600; }}
                form {{ text-align: left; }}
                .form-group {{ margin-bottom: 20px; }}
                label {{ display: block; margin-bottom: 8px; font-weight: 600; color: #4a5568; font-size: 14px; }}
                input {{
                    width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px;
                    font-size: 16px; transition: border-color 0.2s; outline: none;
                }}
                input:focus {{ border-color: #667eea; }}
                .button {{
                    width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; padding: 14px; border-radius: 8px; border: none;
                    text-decoration: none; font-weight: 600; font-size: 16px; cursor: pointer;
                    margin-top: 10px; transition: transform 0.2s, box-shadow 0.2s;
                }}
                .button:hover {{ transform: translateY(-1px); box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); }}
                .error {{ color: #e53e3e; font-size: 13px; margin-top: 5px; display: none; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Reset Password</h1>
                <p>Set a new password for <span class="email">{email}</span></p>
                
                <form id="resetForm" action="/api/v1/auth/reset-password-confirm" method="POST">
                    <input type="hidden" name="oob_code" value="{oob_code}">
                    
                    <div class="form-group">
                        <label for="new_password">New Password</label>
                        <input type="password" id="new_password" name="new_password" placeholder="At least 6 characters" required minlength="6">
                    </div>
                    
                    <div class="form-group">
                        <label for="confirm_password">Confirm New Password</label>
                        <input type="password" id="confirm_password" placeholder="Verify your password" required>
                        <div id="mismatchError" class="error">Passwords do not match</div>
                    </div>
                    
                    <button type="submit" class="button">Update Password</button>
                </form>
            </div>
            
            <script>
                const form = document.getElementById('resetForm');
                const password = document.getElementById('new_password');
                const confirm = document.getElementById('confirm_password');
                const error = document.getElementById('mismatchError');
                
                form.onsubmit = (e) => {{
                    if (password.value !== confirm.value) {{
                        e.preventDefault();
                        error.style.display = 'block';
                        return false;
                    }}
                    error.style.display = 'none';
                }};
                
                confirm.oninput = () => {{
                    if (password.value === confirm.value) error.style.display = 'none';
                }};
            </script>
        </body>
        </html>
        """

    def get_password_reset_success_page(self) -> str:
        """Generate success page after password reset."""
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Updated - Tether</title>
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex; align-items: center; justify-content: center; padding: 20px;
                }}
                .container {{
                    background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    padding: 48px; max-width: 500px; width: 100%; text-align: center;
                }}
                .success-icon {{
                    width: 70px; height: 70px; background: #48bb78; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;
                    color: white; font-size: 32px;
                }}
                h1 {{ color: #1a202c; font-size: 32px; margin-bottom: 16px; font-weight: 700; }}
                p {{ color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }}
                .button {{
                    display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; padding: 14px 32px; border-radius: 8px;
                    text-decoration: none; font-weight: 600; transition: transform 0.2s;
                }}
                .button:hover {{ transform: translateY(-2px); }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success-icon">✓</div>
                <h1>Password Reset!</h1>
                <p>Your password has been successfully updated. You can now log in with your new password.</p>
                <a href="/" class="button">Back to Login</a>
            </div>
        </body>
        </html>
        """

    async def _verify_oob_code(self, oob_code: str) -> dict:
        """Internal method to verify oobCode."""
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key={self.FIREBASE_API_KEY}"
        payload = {"oobCode": oob_code}
        response = requests.post(url, json=payload)
        
        if response.status_code != 200:
            error_data = response.json()
            error_message = error_data.get('error', {}).get('message', 'Unknown error')
            raise Exception(f"Failed to verify verification code: {error_message}")
        
        return response.json()

    async def _confirm_email_verification(self, oob_code: str) -> dict:
        """Internal method to confirm email verification."""
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:update?key={self.FIREBASE_API_KEY}"
        payload = {"oobCode": oob_code}
        response = requests.post(url, json=payload)
        
        if response.status_code != 200:
            error_data = response.json()
            error_message = error_data.get('error', {}).get('message', 'Unknown error')
            raise Exception(f"Failed to confirm email verification: {error_message}")
        
        return response.json()

    def get_success_page(self, email: str) -> str:
        """Generate HTML success page."""
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verified - Tether</title>
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }}
                .container {{
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    padding: 48px;
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                    animation: slideUp 0.5s ease-out;
                }}
                @keyframes slideUp {{
                    from {{ opacity: 0; transform: translateY(30px); }}
                    to {{ opacity: 1; transform: translateY(0); }}
                }}
                .success-icon {{
                    width: 80px; height: 80px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 24px;
                    animation: scaleIn 0.5s ease-out 0.2s both;
                }}
                @keyframes scaleIn {{ from {{ transform: scale(0); }} to {{ transform: scale(1); }} }}
                .checkmark {{
                    width: 40px; height: 40px;
                    border: 4px solid white; border-top: none; border-right: none;
                    transform: rotate(-45deg); margin-top: -8px;
                }}
                h1 {{ color: #1a202c; font-size: 32px; margin-bottom: 16px; font-weight: 700; }}
                p {{ color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 12px; }}
                .email {{ color: #667eea; font-weight: 600; }}
                .button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; padding: 14px 32px; border-radius: 8px;
                    text-decoration: none; font-weight: 600; margin-top: 24px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }}
                .button:hover {{ transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4); }}
                .info {{ margin-top: 32px; padding: 16px; background: #f7fafc; border-radius: 8px; font-size: 14px; color: #718096; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success-icon"><div class="checkmark"></div></div>
                <h1>Email Verified!</h1>
                <p>Your email address has been successfully verified.</p>
                <p class="email">{email}</p>
                <a href="/" class="button">Continue to App</a>
                <div class="info">
                    <p>You can now access all features of your account.</p>
                    <p>This window will close automatically in <span id="countdown">10</span> seconds.</p>
                </div>
            </div>
            <script>
                let seconds = 10;
                const countdown = document.getElementById('countdown');
                const timer = setInterval(() => {{
                    seconds--;
                    countdown.textContent = seconds;
                    if (seconds <= 0) {{
                        clearInterval(timer);
                        window.close();
                        setTimeout(() => {{ window.location.href = '/'; }}, 100);
                    }}
                }}, 1000);
            </script>
        </body>
        </html>
        """

    def get_error_page(self, error_message: str) -> str:
        """Generate HTML error page."""
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Failed - Tether</title>
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    min-height: 100vh;
                    display: flex; align-items: center; justify-content: center; padding: 20px;
                }}
                .container {{
                    background: white; border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    padding: 48px; max-width: 500px; width: 100%; text-align: center;
                }}
                .error-icon {{
                    width: 80px; height: 80px;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 24px; font-size: 48px; color: white;
                }}
                h1 {{ color: #1a202c; font-size: 32px; margin-bottom: 16px; font-weight: 700; }}
                p {{ color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 12px; }}
                .error-message {{
                    background: #fff5f5; border: 1px solid #fc8181; border-radius: 8px;
                    padding: 16px; margin: 24px 0; color: #c53030; font-size: 14px;
                }}
                .button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white; padding: 14px 32px; border-radius: 8px;
                    text-decoration: none; font-weight: 600; margin-top: 24px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }}
                .button:hover {{ transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245, 87, 108, 0.4); }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="error-icon">✕</div>
                <h1>Verification Failed</h1>
                <p>We couldn't verify your email address.</p>
                <div class="error-message">{error_message}</div>
                <p>Please try requesting a new verification email.</p>
                <a href="/" class="button">Back to Home</a>
            </div>
        </body>
        </html>
        """

    
    async def sync_email_verification_status(self, uid: str) -> bool:
        """
        Sync email verification status from Firebase to MongoDB.
        
        This method fetches the current email verification status from Firebase
        and updates the local database to match.
        
        Args:
            uid: Firebase user ID
            
        Returns:
            bool: Current email verification status
            
        Raises:
            UserNotFoundException: If user not found
        """
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # Get user from Firebase
            firebase_user = auth.get_user(uid)
            email_verified = firebase_user.email_verified
            
            # Update database
            db_user = await Users.find_one(Users.firebase_uid == uid)
            if db_user:
                if db_user.email_verified != email_verified:
                    db_user.email_verified = email_verified
                    await db_user.save()
                    logger.info(f"Synced email verification status for user {uid}: {email_verified}")
            else:
                logger.warning(f"User {uid} not found in database during sync")
            
            return email_verified
            
        except auth.UserNotFoundError:
            raise UserNotFoundException()
        except Exception as e:
            logger.error(f"Failed to sync email verification status: {str(e)}")
            # Don't raise exception, just return False
            return False
    
    def _format_firebase_error(self, error_message: str) -> str:
        """
        Format Firebase error messages to be user-friendly.
        
        Args:
            error_message: Raw Firebase error message
            
        Returns:
            Formatted error message
        """
        error_map = {
            "EMAIL_NOT_FOUND": "No user found with this email address",
            "INVALID_PASSWORD": "Incorrect password",
            "USER_DISABLED": "This account has been disabled",
            "TOO_MANY_ATTEMPTS_TRY_LATER": "Too many failed attempts. Please try again later",
            "EMAIL_EXISTS": "Email already registered",
            "INVALID_EMAIL": "Invalid email address",
            "WEAK_PASSWORD": "Password is too weak. Please use at least 6 characters"
        }
        
        return error_map.get(error_message, error_message)

