# API Contract Example

## Response Structure

All API responses follow a consistent structure:

```json
{
  "success": boolean,
  "data": object|array|null,
  "message": string,
  "errors": object (only for validation errors)
}
```

## Authentication Endpoints

### POST /api/auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "remember": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "name": "John Doe",
      "full_name": "John Doe",
      "initials": "JD",
      "email": "user@example.com",
      "phone": "+1234567890",
      "formatted_phone": "+1 234567890",
      "country_code": "1",
      "date_of_birth": "1990-01-01",
      "age": 34,
      "gender": "male",
      "bio": "Sample bio",
      "avatar": "avatars/user.jpg",
      "avatar_url": "https://example.com/storage/avatars/user.jpg",
      "timezone": "UTC",
      "timezone_display": "UTC",
      "language": "en",
      "is_active": true,
      "is_profile_complete": true,
      "is_recently_active": true,
      "status": "online",
      "email_verified_at": "2024-01-01T00:00:00.000000Z",
      "last_login_at": "2024-01-01T00:00:00.000000Z",
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z",
      "roles": ["user"],
      "permissions": ["read", "write"]
    },
    "token": "1|abc123...",
    "token_type": "Bearer",
    "expires_at": "2024-02-01T00:00:00.000000Z"
  },
  "message": "Login successful"
}
```

### GET /api/auth/me

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "name": "John Doe",
    "full_name": "John Doe",
    "initials": "JD",
    "email": "user@example.com",
    "phone": "+1234567890",
    "formatted_phone": "+1 234567890",
    "country_code": "1",
    "date_of_birth": "1990-01-01",
    "age": 34,
    "gender": "male",
    "bio": "Sample bio",
    "avatar": "avatars/user.jpg",
    "avatar_url": "https://example.com/storage/avatars/user.jpg",
    "timezone": "UTC",
    "timezone_display": "UTC",
    "language": "en",
    "is_active": true,
    "is_profile_complete": true,
    "is_recently_active": true,
    "status": "online",
    "email_verified_at": "2024-01-01T00:00:00.000000Z",
    "last_login_at": "2024-01-01T00:00:00.000000Z",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z",
    "roles": ["user"],
    "permissions": ["read", "write"]
  },
  "message": "User retrieved successfully"
}
```

### POST /api/auth/logout

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Successfully logged out."
}
```

### Error Response Example

```json
{
  "success": false,
  "data": null,
  "message": "Login failed",
  "errors": {
    "email": ["The provided credentials do not match our records."]
  }
}
```

## Features Implemented

1. **UserResource** - Comprehensive user data formatting
2. **Consistent Response Structure** - All responses follow `{ success, data, message }` format
3. **Proper Error Handling** - Validation errors include detailed error messages
4. **Token Management** - Support for remember me functionality
5. **User Status Management** - Active/inactive status and recent activity tracking
6. **Role and Permission Support** - Integration with Spatie/Laravel-Permission
7. **Comprehensive User Information** - Full name, initials, age, formatted phone, etc.
