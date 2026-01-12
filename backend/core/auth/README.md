# Firebase Authentication Module

This module provides comprehensive Firebase authentication for the Tether application.

## Overview

The authentication system integrates Firebase Authentication with FastAPI and MongoDB, providing:

- User registration and login
- Token-based authentication (JWT)
- Password management (reset, update)
- Email verification
- User profile management
- Secure dependency injection for protected routes

## Architecture

### Components

1. **schemas.py** - Pydantic models for request/response validation
2. **service.py** - FirebaseAuthService class with all authentication logic
3. **dependecies.py** - Dependency injection functions for route protection
4. **routes.py** - API endpoints for authentication operations

## Setup

### 1. Install Dependencies

Add the following to your `requirements.txt`:

```txt
firebase-admin>=6.0.0
```

Then install:

```bash
pip install firebase-admin
```

### 2. Firebase Configuration

#### Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file securely

#### Get Firebase Web API Key

1. In Firebase Console, go to **Project Settings** > **General**
2. Under "Your apps", find "Web API Key"
3. Copy this key

### 3. Environment Variables

Add the following to your `.env` file:

```env
# Database
DATABASE_URL=mongodb://localhost:27017/tether

# Firebase Configuration
FIREBASE_API_KEY=your_web_api_key_here
FIREBASE_CREDENTIALS_PATH=/path/to/your/firebase-credentials.json
```

**Important**: Never commit your Firebase credentials file or API key to version control!

### 4. Update .gitignore

Add to your `.gitignore`:

```
# Firebase
firebase-credentials.json
*-firebase-adminsdk-*.json
```

## API Endpoints

### Public Endpoints (No Authentication Required)

#### POST /api/v1/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "AMf-vBzKhF...",
  "expires_in": 3600,
  "user_id": "firebase_uid",
  "email": "user@example.com",
  "email_verified": false
}
```

#### POST /api/v1/auth/login
Authenticate with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** Same as registration

#### POST /api/v1/auth/refresh
Refresh an expired ID token.

**Request Body:**
```json
{
  "refresh_token": "AMf-vBzKhF..."
}
```

#### POST /api/v1/auth/password-reset
Request a password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### GET /api/v1/auth/health
Health check endpoint.

### Protected Endpoints (Authentication Required)

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <id_token>
```

#### GET /api/v1/auth/me
Get current user's profile.

**Response:**
```json
{
  "user_id": "firebase_uid",
  "email": "user@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "email_verified": true,
  "created_at": "2024-01-01T00:00:00",
  "last_login": "2024-01-11T20:00:00"
}
```

#### GET /api/v1/auth/user/{user_id}
Get any user's profile by their Firebase UID.

#### GET /api/v1/auth/verify-token
Verify that a token is valid and get user claims.

#### DELETE /api/v1/auth/me
Delete the current user's account (requires verified email).

## Usage Examples

### Client-Side Authentication Flow

#### 1. Registration

```javascript
const response = await fetch('http://localhost:8000/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    username: 'johndoe',
    first_name: 'John',
    last_name: 'Doe'
  })
});

const data = await response.json();
// Store tokens securely
localStorage.setItem('id_token', data.id_token);
localStorage.setItem('refresh_token', data.refresh_token);
```

#### 2. Login

```javascript
const response = await fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
localStorage.setItem('id_token', data.id_token);
localStorage.setItem('refresh_token', data.refresh_token);
```

#### 3. Making Authenticated Requests

```javascript
const idToken = localStorage.getItem('id_token');

const response = await fetch('http://localhost:8000/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});

const userData = await response.json();
```

#### 4. Token Refresh

```javascript
const refreshToken = localStorage.getItem('refresh_token');

const response = await fetch('http://localhost:8000/api/v1/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    refresh_token: refreshToken
  })
});

const data = await response.json();
localStorage.setItem('id_token', data.id_token);
localStorage.setItem('refresh_token', data.refresh_token);
```

### Backend Usage

#### Protecting Routes

```python
from fastapi import APIRouter, Depends
from backend.core.auth.dependecies import get_current_user, require_verified_email
from typing import Dict, Any

router = APIRouter()

# Require authentication
@router.get("/protected")
async def protected_route(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    return {"message": f"Hello {current_user['email']}"}

# Require verified email
@router.post("/sensitive")
async def sensitive_route(
    current_user: Dict[str, Any] = Depends(require_verified_email)
):
    return {"message": "Only verified users can access this"}
```

#### Getting User from Database

```python
from backend.core.auth.dependecies import get_current_user_from_db
from backend.db.models import Users

@router.get("/profile")
async def get_profile(
    user: Users = Depends(get_current_user_from_db)
):
    return {
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name
    }
```

#### Optional Authentication

```python
from backend.core.auth.dependecies import get_optional_user
from typing import Optional

@router.get("/posts")
async def get_posts(
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    if current_user:
        # Show personalized content
        return {"posts": "personalized"}
    else:
        # Show public content
        return {"posts": "public"}
```

## Security Best Practices

1. **Never expose Firebase credentials**
   - Keep `firebase-credentials.json` secure
   - Don't commit to version control
   - Use environment variables

2. **Token Storage**
   - Store tokens securely on the client
   - Use httpOnly cookies for web apps
   - Implement token refresh before expiration

3. **HTTPS Only**
   - Always use HTTPS in production
   - Firebase tokens should never be sent over HTTP

4. **Validate Input**
   - All inputs are validated using Pydantic schemas
   - Additional validation in service layer

5. **Error Handling**
   - Don't expose sensitive error details
   - Log errors server-side
   - Return user-friendly messages

## Testing

### Manual Testing with cURL

#### Register
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser",
    "first_name": "Test",
    "last_name": "User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Get Profile
```bash
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ID_TOKEN"
```

## Troubleshooting

### Common Issues

1. **"Firebase app already initialized"**
   - This is normal on hot reload
   - The code handles this automatically

2. **"Invalid credentials"**
   - Check your `FIREBASE_CREDENTIALS_PATH`
   - Ensure the JSON file is valid
   - Verify file permissions

3. **"Invalid API key"**
   - Verify `FIREBASE_API_KEY` in .env
   - Check Firebase Console for correct key

4. **"User not found in database"**
   - Ensure MongoDB is running
   - Check database connection string
   - Verify user was created in both Firebase and MongoDB

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These provide interactive API documentation with the ability to test endpoints.

## Future Enhancements

Potential improvements:

1. OAuth providers (Google, Facebook, etc.)
2. Multi-factor authentication (MFA)
3. Rate limiting for auth endpoints
4. Session management
5. Role-based access control (RBAC)
6. Audit logging for security events

## Support

For issues or questions:
1. Check the Firebase documentation
2. Review the code comments
3. Check application logs
4. Verify environment configuration
