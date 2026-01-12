# Password Update Feature - Production Implementation

## Overview

The password update feature allows authenticated users to change their password while logged in. This is different from password reset (for forgotten passwords).

## Use Cases

### Password Update (This Feature) ✅
**When to use:**
- User is logged in and knows their current password
- User wants to change password for security reasons
- User wants to update to a stronger password
- Regular password rotation policy

**Example scenarios:**
- "Change Password" in user settings
- Security settings page
- After a security audit
- Periodic password updates

**Requirements:**
- User must be authenticated (logged in)
- Must provide current password
- Must provide new password

### Password Reset (Already Implemented) 📧
**When to use:**
- User forgot their password
- User can't log in
- Account recovery

**Example scenarios:**
- "Forgot Password" link on login page
- Account locked out
- Password recovery flow

**Requirements:**
- Only email address needed
- Receives email with reset link

---

## API Endpoint

### POST /api/v1/auth/password-update

**Description:** Update authenticated user's password

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "current_password": "old_password123",
  "new_password": "new_secure_password456"
}
```

**Request Headers:**
```
Authorization: Bearer <id_token>
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "message": "Password updated successfully",
  "success": true
}
```

**Error Responses:**

**401 - Invalid Current Password:**
```json
{
  "error": "Current password is incorrect",
  "error_code": "INVALID_PASSWORD",
  "details": {}
}
```

**401 - Invalid Token:**
```json
{
  "error": "Invalid authentication token",
  "error_code": "INVALID_TOKEN",
  "details": {}
}
```

**400 - Weak Password:**
```json
{
  "error": "Password is too weak. Please use at least 6 characters",
  "error_code": "WEAK_PASSWORD",
  "details": {}
}
```

---

## How It Works

### Flow Diagram

```
User (Logged In)
    ↓
Provides Current Password + New Password
    ↓
Backend Verifies Current Password
    ↓
    ├─ ❌ Incorrect → Return 401 Error
    └─ ✅ Correct
        ↓
    Update Password in Firebase
        ↓
        ├─ ❌ Failed → Return Error
        └─ ✅ Success
            ↓
        Return Success Message
            ↓
        User Must Login Again with New Password
```

### Step-by-Step Process

1. **User Authentication**
   - User must be logged in with valid Bearer token
   - Token is extracted from Authorization header

2. **Current Password Verification**
   - System attempts to login with email + current password
   - If login fails → current password is incorrect
   - If login succeeds → proceed to update

3. **Password Update**
   - Use Firebase REST API to update password
   - Requires the user's ID token
   - Firebase validates and updates the password

4. **Token Invalidation**
   - After password change, old tokens become invalid
   - User must login again with new password
   - This is a security feature

---

## Implementation Details

### Backend Code

```python
@router.post("/password-update")
async def update_password(
    password_data: PasswordUpdateRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    current_user: Dict[str, Any] = Depends(get_current_user),
    auth_service: FirebaseAuthService = Depends(get_auth_service)
) -> MessageResponse:
    # Get user from database
    user = await get_current_user_from_db(current_user)
    
    # Verify current password
    try:
        login_data = UserLoginRequest(
            email=user.email,
            password=password_data.current_password
        )
        await auth_service.login_user(login_data)
    except (InvalidPasswordException, InvalidCredentialsException):
        raise InvalidPasswordException(message="Current password is incorrect")
    
    # Extract ID token from Authorization header
    id_token = credentials.credentials
    
    # Update password in Firebase
    return await auth_service.update_password(id_token, password_data.new_password)
```

### Service Method

```python
async def update_password(self, id_token: str, new_password: str) -> MessageResponse:
    """Update user's password in Firebase."""
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
```

---

## Frontend Implementation

### React Example

```javascript
import { useState } from 'react';

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    // Validate password strength
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      const token = localStorage.getItem('id_token');
      
      const response = await fetch('http://localhost:8000/api/v1/auth/password-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update password');
      }
      
      setSuccess(true);
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        localStorage.removeItem('id_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="change-password-form">
      <h2>Change Password</h2>
      
      {error && <div className="error">{error}</div>}
      {success && (
        <div className="success">
          Password updated successfully! Redirecting to login...
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        
        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}

export default ChangePasswordForm;
```

### Vue.js Example

```vue
<template>
  <div class="change-password">
    <h2>Change Password</h2>
    
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">
      Password updated successfully! Redirecting to login...
    </div>
    
    <form @submit.prevent="updatePassword">
      <div class="form-group">
        <label>Current Password</label>
        <input 
          v-model="currentPassword" 
          type="password" 
          required 
        />
      </div>
      
      <div class="form-group">
        <label>New Password</label>
        <input 
          v-model="newPassword" 
          type="password" 
          required 
          minlength="6"
        />
      </div>
      
      <div class="form-group">
        <label>Confirm New Password</label>
        <input 
          v-model="confirmPassword" 
          type="password" 
          required 
          minlength="6"
        />
      </div>
      
      <button type="submit">Update Password</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      error: '',
      success: false
    };
  },
  methods: {
    async updatePassword() {
      this.error = '';
      
      if (this.newPassword !== this.confirmPassword) {
        this.error = 'New passwords do not match';
        return;
      }
      
      try {
        const token = localStorage.getItem('id_token');
        
        const response = await fetch('http://localhost:8000/api/v1/auth/password-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            current_password: this.currentPassword,
            new_password: this.newPassword
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update password');
        }
        
        this.success = true;
        
        // Redirect to login
        setTimeout(() => {
          localStorage.removeItem('id_token');
          localStorage.removeItem('refresh_token');
          this.$router.push('/login');
        }, 2000);
        
      } catch (err) {
        this.error = err.message;
      }
    }
  }
};
</script>
```

---

## Testing

### Manual Testing with cURL

```bash
# 1. Login to get token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "old_password123"
  }'

# Copy the id_token from response

# 2. Update password
curl -X POST http://localhost:8000/api/v1/auth/password-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -d '{
    "current_password": "old_password123",
    "new_password": "new_secure_password456"
  }'

# 3. Login with new password
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "new_secure_password456"
  }'
```

### Test Cases

1. **✅ Successful Password Update**
   - Provide correct current password
   - Provide valid new password
   - Expect: 200 success

2. **❌ Incorrect Current Password**
   - Provide wrong current password
   - Expect: 401 error "Current password is incorrect"

3. **❌ Weak New Password**
   - Provide password < 6 characters
   - Expect: 400 error "Password is too weak"

4. **❌ Invalid Token**
   - Use expired or invalid token
   - Expect: 401 error "Invalid authentication token"

5. **❌ Missing Token**
   - Don't provide Authorization header
   - Expect: 401 error "Missing authentication token"

---

## Security Considerations

### ✅ Best Practices Implemented

1. **Current Password Verification**
   - Prevents unauthorized password changes
   - Even if someone steals the token, they can't change password without knowing current password

2. **Token Invalidation**
   - After password change, user must login again
   - Old tokens become invalid
   - Prevents session hijacking

3. **Password Strength Validation**
   - Minimum 6 characters (Firebase requirement)
   - Can add custom validation for stronger passwords

4. **Secure Communication**
   - Always use HTTPS in production
   - Tokens transmitted securely

### 🔒 Additional Security Recommendations

1. **Add Password Strength Requirements**
   ```python
   # In schemas.py
   @validator('new_password')
   def validate_password_strength(cls, v):
       if len(v) < 8:
           raise ValueError('Password must be at least 8 characters')
       if not any(c.isupper() for c in v):
           raise ValueError('Password must contain uppercase letter')
       if not any(c.isdigit() for c in v):
           raise ValueError('Password must contain a number')
       return v
   ```

2. **Rate Limiting**
   - Limit password update attempts
   - Prevent brute force attacks

3. **Email Notification**
   - Send email when password is changed
   - Alert user of unauthorized changes

4. **Password History**
   - Prevent reusing recent passwords
   - Store hashed password history

---

## Comparison: Password Update vs Password Reset

| Feature | Password Update | Password Reset |
|---------|----------------|----------------|
| **User State** | Logged in | Not logged in |
| **Requires** | Current password | Email address |
| **Authentication** | Bearer token | Email link |
| **Use Case** | Change password | Forgot password |
| **Endpoint** | `/api/v1/auth/password-update` | `/api/v1/auth/password-reset` |
| **Security** | Verifies current password | Email verification |
| **After Action** | Must login again | Can login with new password |

---

## Summary

✅ **Implemented**: Production-ready password update feature
✅ **Security**: Verifies current password before update
✅ **User Experience**: Clear error messages and success flow
✅ **Documentation**: Complete API docs and examples

**The feature is now ready for production use!** 🎉
