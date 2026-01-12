# Email Verification Troubleshooting Guide

## Issue: Not Receiving Verification Emails After Signup

### What I Fixed

1. **Made email verification non-blocking during registration**
   - Previously, if email sending failed, the entire registration would fail
   - Now registration succeeds even if email sending fails
   - Email errors are logged but don't prevent user creation

2. **Added detailed logging**
   - You can now see exactly what's happening with email verification
   - Check your server logs for messages like:
     - "Attempting to send verification email to Firebase API"
     - "Verification email sent successfully" (success)
     - "Firebase email verification failed: ..." (failure with details)

### Common Reasons Email Verification Fails

#### 1. **Firebase Email Templates Not Configured**

Firebase needs to be configured to send emails. Check:

1. Go to Firebase Console → Authentication → Templates
2. Click on "Email address verification"
3. Make sure the template is enabled and configured
4. Check the "From" email address is set

#### 2. **Firebase API Key Issues**

Verify your `.env` file has the correct Firebase Web API Key:

```env
FIREBASE_API_KEY=AIzaSy...your_actual_key
```

Get it from: Firebase Console → Project Settings → General → Web API Key

#### 3. **Firebase Project Not Configured for Email**

In Firebase Console:
1. Go to Authentication → Sign-in method
2. Ensure "Email/Password" is enabled
3. Check "Email enumeration protection" settings

#### 4. **Emails Going to Spam**

Check your spam/junk folder! Firebase emails often end up there initially.

#### 5. **Firebase Quota Limits**

Free tier has limits on emails sent per day. Check Firebase Console → Usage.

### How to Debug

#### Step 1: Check Server Logs

After registering, check your FastAPI server logs for:

```
INFO: Attempting to send verification email to Firebase API
INFO: Verification email sent successfully
```

Or if there's an error:

```
ERROR: Firebase email verification failed: [error message]
```

#### Step 2: Test Email Verification Manually

Use the `/api/v1/auth/verify-email` endpoint after logging in:

```bash
POST /api/v1/auth/verify-email
Authorization: Bearer <your_id_token>
```

This will trigger email sending and you can see the detailed error.

#### Step 3: Check Firebase Console

1. Go to Firebase Console → Authentication → Users
2. Verify the user was created
3. Check if "Email Verified" column shows false

#### Step 4: Verify Firebase Configuration

Run this test in your Python environment:

```python
import requests

FIREBASE_API_KEY = "your_api_key"
ID_TOKEN = "your_id_token_from_login"

url = f"https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={{FIREBASE_API_KEY}}"
payload = {{
    "requestType": "VERIFY_EMAIL",
    "idToken": ID_TOKEN
}}

response = requests.post(url, json=payload)
print(f"Status: {{response.status_code}}")
print(f"Response: {{response.text}}")
```

### Solutions

#### Solution 1: Configure Firebase Email Templates

1. Firebase Console → Authentication → Templates
2. Click "Email address verification"
3. Customize the template:
   - Subject: "Verify your email for Tether"
   - Body: Include the verification link
4. Set the "From" email (must be a verified sender)
5. Save changes

#### Solution 2: Use Custom Email Service (Alternative)

If Firebase emails don't work, you can implement custom email sending:

1. Use a service like SendGrid, Mailgun, or AWS SES
2. Modify the `send_email_verification` method to use your email service
3. Generate a custom verification token and link

#### Solution 3: Verify Email Manually (Development Only)

For testing, you can manually verify emails in Firebase:

1. Firebase Console → Authentication → Users
2. Click on the user
3. Click "Edit" → Check "Email verified" → Save

### Testing the Fix

1. **Register a new user**
   ```bash
   POST /api/v1/auth/register
   {
     "email": "test@example.com",
     "password": "test123456",
     "username": "testuser",
     "first_name": "Test",
     "last_name": "User"
   }
   ```

2. **Check server logs** for email verification status

3. **Check your email** (including spam folder)

4. **If no email**, check Firebase Console → Authentication → Templates

### Next Steps

1. ✅ **Fixed**: Registration now succeeds even if email fails
2. ✅ **Added**: Detailed logging for debugging
3. 🔧 **Action Required**: Configure Firebase email templates
4. 🔧 **Action Required**: Verify Firebase API key is correct

### Alternative: Manual Verification Endpoint

I can add an admin endpoint to manually verify emails if needed for testing. Let me know if you want this.

### Questions to Answer

1. Are you seeing any errors in the server logs when registering?
2. Is the user being created in Firebase Console → Authentication?
3. Have you configured email templates in Firebase Console?
4. What's in your spam folder?

Check the server logs after your next registration attempt and let me know what you see!
