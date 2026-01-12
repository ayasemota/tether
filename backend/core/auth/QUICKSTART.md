# Firebase Authentication - Quick Start Guide

This guide will help you get Firebase authentication up and running quickly.

## Prerequisites

- Python 3.8+
- MongoDB running locally or remotely
- Firebase project (free tier is fine)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install `firebase-admin` and all other required packages.

### 2. Set Up Firebase Project

1. **Go to Firebase Console**
   - Visit https://console.firebase.google.com/
   - Click "Add project" or select existing project

2. **Enable Authentication**
   - In your Firebase project, go to **Authentication**
   - Click "Get started"
   - Enable "Email/Password" sign-in method

3. **Get Service Account Credentials**
   - Go to **Project Settings** (gear icon) > **Service Accounts**
   - Click "Generate new private key"
   - Save the JSON file as `firebase-credentials.json` in your project root
   - **IMPORTANT**: Add this file to `.gitignore`!

4. **Get Web API Key**
   - Go to **Project Settings** > **General**
   - Scroll to "Your apps" section
   - Copy the "Web API Key"

### 3. Configure Environment Variables

Create a `.env` file in your project root:

```env
# Database
DATABASE_URL=mongodb://localhost:27017/tether

# Firebase
FIREBASE_API_KEY=AIzaSyC...your_actual_api_key_here
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
```

Replace `AIzaSyC...` with your actual Firebase Web API Key.

### 4. Update .gitignore

Add these lines to `.gitignore`:

```
# Environment
.env

# Firebase
firebase-credentials.json
*-firebase-adminsdk-*.json
```

### 5. Run the Application

```bash
# Start MongoDB (if running locally)
# On Windows:
net start MongoDB

# On Mac/Linux:
sudo systemctl start mongod

# Run the FastAPI application
uvicorn backend:app --reload
```

The server will start at `http://localhost:8000`

### 6. Test the API

Visit the interactive API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Quick Test

### Using the Swagger UI

1. Go to http://localhost:8000/docs
2. Find the `POST /api/v1/auth/register` endpoint
3. Click "Try it out"
4. Fill in the request body:
   ```json
   {
     "email": "test@example.com",
     "password": "test123456",
     "username": "testuser",
     "first_name": "Test",
     "last_name": "User"
   }
   ```
5. Click "Execute"
6. Copy the `id_token` from the response
7. Click the "Authorize" button at the top
8. Enter: `Bearer <your_id_token>`
9. Now you can test protected endpoints like `GET /api/v1/auth/me`

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "username": "testuser",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

Save the `id_token` from the response, then:

**Get Profile:**
```bash
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ID_TOKEN_HERE"
```

## Common Issues

### "Firebase app already initialized"
- This is normal during development with hot reload
- The code handles this automatically

### "Invalid credentials"
- Check that `FIREBASE_CREDENTIALS_PATH` points to the correct file
- Verify the JSON file is valid
- Ensure the file has proper read permissions

### "Connection refused" to MongoDB
- Make sure MongoDB is running
- Check your `DATABASE_URL` in `.env`
- Try: `mongodb://localhost:27017/tether`

### "Invalid API key"
- Verify `FIREBASE_API_KEY` in `.env`
- Make sure you copied the Web API Key (not other keys)
- Check for extra spaces or quotes

## Next Steps

1. **Read the full README**: `backend/core/auth/README.md`
2. **Implement frontend**: Use the API endpoints in your React/Vue/etc. app
3. **Add protected routes**: Use the dependency injection in your other routes
4. **Customize**: Extend the User model with additional fields

## Example: Protecting Your Routes

```python
from fastapi import APIRouter, Depends
from backend.core.auth.dependecies import get_current_user
from typing import Dict, Any

router = APIRouter()

@router.get("/my-protected-route")
async def my_route(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "message": f"Hello {current_user['email']}!",
        "user_id": current_user['uid']
    }
```

## Support

- Check the main README: `backend/core/auth/README.md`
- Review code comments in the source files
- Check Firebase documentation: https://firebase.google.com/docs/auth

Happy coding! 🚀
