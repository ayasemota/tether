# Custom Exception System Documentation

## Overview

The Tether application uses a comprehensive custom exception system to provide consistent, user-friendly error handling across all API endpoints. This system replaces generic `HTTPException` instances with domain-specific exception classes.

## Architecture

### Base Exception Class

All custom exceptions inherit from `TetherException`:

```python
class TetherException(Exception):
    """Base exception for all Tether application exceptions."""
    
    def __init__(self, message, status_code, error_code, details):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details
```

### Exception Categories

#### 1. Authentication Exceptions (`401 Unauthorized`)
- `AuthenticationException` - Base class
- `InvalidCredentialsException` - Invalid email/password
- `InvalidTokenException` - Invalid authentication token
- `ExpiredTokenException` - Expired authentication token
- `MissingTokenException` - Missing authentication token
- `InvalidRefreshTokenException` - Invalid refresh token

#### 2. Authorization Exceptions (`403 Forbidden`)
- `AuthorizationException` - Base class
- `EmailNotVerifiedException` - Email verification required
- `InsufficientPermissionsException` - Insufficient permissions

#### 3. Resource Exceptions (`404 Not Found`)
- `ResourceNotFoundException` - Base class
- `UserNotFoundException` - User not found
- `UserNotFoundInDatabaseException` - User not in database

#### 4. Validation Exceptions (`400 Bad Request`)
- `ValidationException` - Base class
- `EmailAlreadyExistsException` - Email already registered
- `UsernameAlreadyExistsException` - Username already exists
- `InvalidEmailException` - Invalid email format
- `WeakPasswordException` - Password too weak
- `InvalidPasswordException` - Incorrect current password

#### 5. Operation Exceptions (`500 Internal Server Error` or specific)
- `OperationException` - Base class
- `RegistrationFailedException` - Registration failed
- `LoginFailedException` - Login failed
- `TokenRefreshFailedException` - Token refresh failed
- `PasswordResetFailedException` - Password reset failed
- `EmailVerificationFailedException` - Email verification failed
- `PasswordUpdateFailedException` - Password update failed
- `UserDeletionFailedException` - User deletion failed
- `UserRetrievalFailedException` - User retrieval failed

#### 6. Rate Limiting Exceptions (`429 Too Many Requests`)
- `RateLimitException` - Rate limit exceeded

#### 7. Account Status Exceptions (`403 Forbidden`)
- `AccountDisabledException` - Account disabled

## Usage

### Raising Exceptions

In your service or route handlers:

```python
from backend.core.errors import UsernameAlreadyExistsException

# Simple usage
if existing_user:
    raise UsernameAlreadyExistsException()

# With custom message
raise InvalidCredentialsException(message="Invalid email or password")

# With additional details
raise RegistrationFailedException(
    message="Registration failed",
    details={"error": str(e)}
)
```

### Exception Handlers

The application automatically handles all custom exceptions through registered handlers:

1. **TetherException Handler** - Catches all custom exceptions
2. **Validation Exception Handler** - Handles Pydantic validation errors
3. **Generic Exception Handler** - Fallback for unexpected errors

### Error Response Format

All exceptions return a consistent JSON format:

```json
{
  "error": "Human-readable error message",
  "error_code": "MACHINE_READABLE_CODE",
  "details": {
    "additional": "context"
  }
}
```

## Examples

### Example 1: Authentication Error

**Request:**
```bash
POST /auth/login
{
  "email": "user@example.com",
  "password": "wrong_password"
}
```

**Response (401):**
```json
{
  "error": "Invalid email or password",
  "error_code": "INVALID_CREDENTIALS",
  "details": {}
}
```

### Example 2: Validation Error

**Request:**
```bash
POST /auth/register
{
  "email": "existing@example.com",
  "username": "newuser",
  ...
}
```

**Response (400):**
```json
{
  "error": "Email already registered",
  "error_code": "EMAIL_ALREADY_EXISTS",
  "details": {}
}
```

### Example 3: Authorization Error

**Request:**
```bash
DELETE /auth/me
Authorization: Bearer <token_with_unverified_email>
```

**Response (403):**
```json
{
  "error": "Email verification required. Please verify your email to access this resource.",
  "error_code": "EMAIL_NOT_VERIFIED",
  "details": {}
}
```

## Benefits

1. **Consistency** - All errors follow the same format
2. **Type Safety** - Specific exception classes for different scenarios
3. **Better Error Messages** - User-friendly, actionable messages
4. **Easier Debugging** - Clear error codes and logging
5. **Maintainability** - Centralized error handling logic
6. **API Documentation** - Clear error responses in OpenAPI docs

## Adding New Exceptions

To add a new exception:

1. **Define the exception class** in `backend/core/errors.py`:

```python
class MyCustomException(TetherException):
    """Description of when this exception is raised."""
    
    def __init__(self, message: str = "Default message"):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="MY_CUSTOM_ERROR"
        )
```

2. **Import and use** in your service/route:

```python
from backend.core.errors import MyCustomException

def my_function():
    if error_condition:
        raise MyCustomException()
```

3. **The exception handler automatically catches it** - No additional configuration needed!

## Error Codes Reference

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `INVALID_TOKEN` | 401 | Invalid authentication token |
| `EXPIRED_TOKEN` | 401 | Authentication token expired |
| `MISSING_TOKEN` | 401 | Missing authentication token |
| `INVALID_REFRESH_TOKEN` | 401 | Invalid refresh token |
| `EMAIL_NOT_VERIFIED` | 403 | Email verification required |
| `INSUFFICIENT_PERMISSIONS` | 403 | Insufficient permissions |
| `ACCOUNT_DISABLED` | 403 | Account has been disabled |
| `RESOURCE_NOT_FOUND` | 404 | Resource not found |
| `USER_NOT_FOUND` | 404 | User not found |
| `EMAIL_ALREADY_EXISTS` | 400 | Email already registered |
| `USERNAME_ALREADY_EXISTS` | 400 | Username already exists |
| `INVALID_EMAIL` | 400 | Invalid email format |
| `WEAK_PASSWORD` | 400 | Password too weak |
| `INVALID_PASSWORD` | 400 | Incorrect password |
| `REGISTRATION_FAILED` | 500 | Registration failed |
| `LOGIN_FAILED` | 401 | Login failed |
| `TOKEN_REFRESH_FAILED` | 401 | Token refresh failed |
| `PASSWORD_RESET_FAILED` | 400 | Password reset failed |
| `EMAIL_VERIFICATION_FAILED` | 400 | Email verification failed |
| `PASSWORD_UPDATE_FAILED` | 400 | Password update failed |
| `USER_DELETION_FAILED` | 500 | User deletion failed |
| `USER_RETRIEVAL_FAILED` | 500 | User retrieval failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

## Logging

All exceptions are automatically logged with relevant context:

```python
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
```

## Best Practices

1. **Use specific exceptions** - Don't use the base classes directly
2. **Provide helpful messages** - Make errors actionable for users
3. **Include context in details** - Add relevant information for debugging
4. **Don't expose sensitive data** - Never include passwords, tokens, etc.
5. **Log appropriately** - Use different log levels for different severities
6. **Document new exceptions** - Update this file when adding new exceptions

## Testing

Test exception handling in your tests:

```python
import pytest
from backend.core.errors import UsernameAlreadyExistsException

def test_duplicate_username():
    with pytest.raises(UsernameAlreadyExistsException):
        # Code that should raise the exception
        pass
```

## Migration from HTTPException

The codebase has been migrated from `HTTPException` to custom exceptions:

**Before:**
```python
raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Username already exists"
)
```

**After:**
```python
raise UsernameAlreadyExistsException()
```

This provides better type safety, consistency, and maintainability.
