# Custom Email Verification Flow - Complete Guide

## 🎯 Overview

This implementation provides a **custom email verification flow** that gives you full control over the verification process:

✅ **Automatic sync** to both Firebase and MongoDB  
✅ **Custom success page** with your branding  
✅ **Immediate verification** - no waiting for next login  
✅ **Full control** over the user experience  
✅ **Analytics tracking** - know when users verify  

---

## 🔄 How It Works

### **Traditional Flow (Firebase Default)**

```
User clicks link → Firebase servers → Generic Firebase page
                                    ↓
                            MongoDB NOT updated
```

### **New Custom Flow (Your Implementation)** ✅

```
User clicks link in email
    ↓
YOUR backend receives the request
    ↓
Backend verifies token with Firebase
    ↓
Backend updates Firebase: email_verified = true
    ↓
Backend updates MongoDB: email_verified = true
    ↓
User sees YOUR custom success page
```

---

## 📋 Setup Instructions

### **Step 1: Configure Firebase Action URL**

This is the most important step! You need to tell Firebase to send verification clicks to YOUR backend instead of Firebase's servers.

#### **Option A: Firebase Console (Recommended)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Templates**
4. Click on **Email address verification**
5. Click the **pencil icon** to edit
6. Look for **"Customize action URL"** or **"Action URL"**
7. Set it to: `http://localhost:8000/api/v1/auth/verify-email-callback` (development)
   - For production: `https://yourdomain.com/api/v1/auth/verify-email-callback`
8. Click **Save**

#### **Option B: Firebase SDK (Programmatic)**

```javascript
// In your Firebase project settings
const actionCodeSettings = {
  url: 'http://localhost:8000/api/v1/auth/verify-email-callback',
  handleCodeInApp: false
};
```

### **Step 2: Update Your Environment Variables**

Add to your `.env` file:

```bash
# Required
DATABASE_URL=mongodb://localhost:27017/tether
DB_NAME=tether
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json

# Optional - Custom redirect after verification
EMAIL_VERIFICATION_SUCCESS_URL=http://localhost:3000/verification-success
```

### **Step 3: Restart Your Server**

```bash
# Stop current server (Ctrl+C)
# Restart
fastapi dev backend
```

---

## 🧪 Testing

### **Test 1: Register a New User**

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

### **Test 2: Check Your Email**

1. Open your email inbox
2. Find the verification email from Firebase
3. Click the verification link

### **Test 3: Verify the Flow**

**What should happen:**

1. ✅ Browser opens to `http://localhost:8000/api/v1/auth/verify-email-callback?mode=verifyEmail&oobCode=...`
2. ✅ You see a beautiful custom success page
3. ✅ Page says "Email Verified!"
4. ✅ Auto-redirects after 10 seconds

**Check the logs:**

```
INFO: Email verification callback received: mode=verifyEmail, oobCode=ABC123...
INFO: Successfully verified oobCode for email: test@example.com
INFO: Confirmed email verification in Firebase for: test@example.com
INFO: Updated email_verified in MongoDB for: test@example.com
```

### **Test 4: Verify in Databases**

**Firebase Console:**
- Go to Authentication → Users
- Find your user
- "Email Verified" should be ✅

**MongoDB:**
```javascript
db.users.findOne({email: "test@example.com"})
// Should show: email_verified: true
```

**Login API:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'

# Response should show: "email_verified": true
```

---

## 🎨 Customization

### **Custom Success Page**

The default success page is beautiful and responsive, but you can customize it:

#### **Option 1: Redirect to Your Frontend**

Set in `.env`:
```bash
EMAIL_VERIFICATION_SUCCESS_URL=http://localhost:3000/verification-success
```

Then create a page in your frontend at `/verification-success`.

#### **Option 2: Customize the Built-in Page**

Edit `backend/core/auth/email_verification_handler.py`:

```python
def get_success_page(email: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Email Verified - Your Brand</title>
        <style>
            /* Your custom CSS */
        </style>
    </head>
    <body>
        <h1>Welcome to Your App!</h1>
        <p>Email {email} verified successfully!</p>
        <!-- Your custom HTML -->
    </body>
    </html>
    """
```

### **Add Analytics Tracking**

Track when users verify their emails:

```python
# In email_verification_handler.py, after successful verification:

# Add analytics event
await track_event("email_verified", {
    "email": email,
    "timestamp": datetime.utcnow(),
    "source": "email_link"
})

# Send welcome email
await send_welcome_email(email)

# Update user onboarding status
user.onboarding_step = "email_verified"
await user.save()
```

---

## 🔒 Security Considerations

### **Validate the oobCode**

The implementation already validates the one-time code with Firebase:

```python
# This ensures the code is:
# ✅ Valid
# ✅ Not expired
# ✅ Not already used
# ✅ From Firebase
```

### **Rate Limiting (Recommended)**

Add rate limiting to prevent abuse:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.get("/email")
@limiter.limit("10/minute")  # Max 10 verification attempts per minute
async def verify_email_callback(...):
    # ... existing code
```

### **HTTPS in Production**

**⚠️ CRITICAL:** Always use HTTPS in production!

```bash
# Production action URL
https://yourdomain.com/verify/email

# NOT http:// - this exposes the oobCode!
```

---

## 🚀 Production Deployment

### **Step 1: Update Firebase Action URL**

In Firebase Console → Authentication → Templates:
```
https://yourdomain.com/verify/email
```

### **Step 2: Update Environment Variables**

```bash
# Production .env
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/tether
DB_NAME=tether
FIREBASE_API_KEY=your_production_api_key
FIREBASE_CREDENTIALS_PATH=/path/to/production-credentials.json
EMAIL_VERIFICATION_SUCCESS_URL=https://yourdomain.com/verification-success
```

### **Step 3: Configure CORS**

Allow Firebase to redirect to your domain:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Step 4: Add Monitoring**

Monitor verification success rate:

```python
import logging

logger = logging.getLogger(__name__)

# Log successful verifications
logger.info(f"Email verified: {email}")

# Log failures
logger.error(f"Verification failed: {error_message}")

# Send to monitoring service (e.g., Sentry, DataDog)
```

---

## 📊 API Endpoint Reference

### **GET /verify/email**

**Description:** Custom email verification callback endpoint

**Query Parameters:**
- `mode` (required): Action mode, should be "verifyEmail"
- `oobCode` (required): One-time verification code from Firebase
- `apiKey` (optional): Firebase API key
- `lang` (optional): Language code

**Example URL:**
```
http://localhost:8000/verify/email?mode=verifyEmail&oobCode=ABC123XYZ&apiKey=...
```

**Success Response:**
- Status: 200
- Content: HTML success page or redirect to custom URL

**Error Response:**
- Status: 400
- Content: HTML error page with error message

---

## 🐛 Troubleshooting

### **Issue: Still seeing Firebase default page**

**Solution:** Make sure you updated the Action URL in Firebase Console

1. Firebase Console → Authentication → Templates
2. Email address verification → Edit
3. Set Action URL to your backend endpoint
4. Save changes

### **Issue: "Invalid verification mode" error**

**Cause:** The `mode` parameter is not "verifyEmail"

**Solution:** Check the Firebase email template is configured correctly

### **Issue: "Failed to verify oobCode" error**

**Possible causes:**
- Code expired (usually 1 hour expiration)
- Code already used
- Invalid code

**Solution:** Request a new verification email

### **Issue: Firebase updated but MongoDB not updated**

**Check logs for:**
```
WARNING: User {email} not found in MongoDB during sync
```

**Solution:** User might not exist in MongoDB. Check user creation flow.

### **Issue: MongoDB updated but Firebase not updated**

**Check logs for:**
```
ERROR: Failed to confirm email verification: {error}
```

**Solution:** Check Firebase API key and credentials are correct

---

## 📈 Benefits of This Approach

### **1. Immediate Sync** ✅
- Both databases updated instantly
- No waiting for next login
- Consistent state across systems

### **2. Better UX** ✅
- Custom branded success page
- Clear feedback to users
- Professional appearance

### **3. Full Control** ✅
- Track verification events
- Send welcome emails
- Update onboarding status
- Custom redirects

### **4. Analytics** ✅
- Know when users verify
- Track verification rate
- Identify issues quickly

### **5. Flexibility** ✅
- Easy to customize
- Add additional logic
- Integrate with other services

---

## 🔄 Migration from Old Flow

If you already have users with the old flow:

### **Step 1: No Action Needed for Existing Users**

Existing verified users remain verified. The sync mechanism handles them.

### **Step 2: New Verifications Use New Flow**

All new verification emails will use the custom flow automatically.

### **Step 3: Test Both Flows**

The system supports both flows simultaneously during transition.

---

## 📝 Summary

✅ **Implemented:** Custom email verification callback  
✅ **Updates:** Both Firebase and MongoDB automatically  
✅ **Shows:** Beautiful custom success page  
✅ **Provides:** Full control over verification flow  
✅ **Supports:** Custom redirects and analytics  

**Next Steps:**
1. Configure Firebase Action URL
2. Test with a new user registration
3. Customize the success page (optional)
4. Deploy to production

The verification flow is now fully automatic and under your control! 🎉
