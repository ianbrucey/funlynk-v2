# FunLynk API Integration Guide

This comprehensive guide provides step-by-step integration examples for frontend teams working with the FunLynk API, including authentication flows, error handling, and best practices.

## Table of Contents

- [Authentication](#authentication)
- [API Endpoints Overview](#api-endpoints-overview)
- [Request/Response Patterns](#requestresponse-patterns)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)
- [File Uploads](#file-uploads)
- [Real-time Features](#real-time-features)
- [Integration Examples](#integration-examples)

## Authentication

### Overview

FunLynk uses Laravel Sanctum for API authentication with bearer tokens. All API requests require authentication except for registration and password reset endpoints.

### Authentication Flow

#### 1. User Registration

```javascript
// POST /api/v1/auth/register
const registerUser = async (userData) => {
  const response = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.password_confirmation,
      role: userData.role // 'parent', 'teacher', 'school_admin', etc.
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store token securely
    localStorage.setItem('auth_token', data.data.token);
    return data.data.user;
  } else {
    throw new Error(data.message);
  }
};
```

#### 2. User Login

```javascript
// POST /api/v1/auth/login
const loginUser = async (credentials) => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
      remember: credentials.remember || false
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('auth_token', data.data.token);
    return data.data.user;
  } else {
    throw new Error(data.message);
  }
};
```

#### 3. Authenticated Requests

```javascript
// Helper function for authenticated requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(`/api/v1${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });
  
  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    return;
  }
  
  return response;
};
```

#### 4. Logout

```javascript
// POST /api/v1/auth/logout
const logoutUser = async () => {
  const response = await apiRequest('/auth/logout', {
    method: 'POST'
  });
  
  if (response.ok) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }
};
```

## API Endpoints Overview

### Core FunLynk APIs

- **Authentication**: `/api/v1/auth/*` - User authentication and management
- **Users**: `/api/v1/users/*` - User profiles and social features
- **Events**: `/api/v1/events/*` - Event management and interactions
- **Activity Feed**: `/api/v1/activity/*` - Social activity tracking
- **Messages**: `/api/v1/messages/*` - Direct messaging

### Spark Educational Programs APIs

- **Districts**: `/api/v1/spark/districts/*` - School district management
- **Schools**: `/api/v1/spark/schools/*` - Individual school management
- **Programs**: `/api/v1/spark/programs/*` - Educational program management
- **Bookings**: `/api/v1/spark/bookings/*` - Program booking and scheduling
- **Character Topics**: `/api/v1/spark/character-topics/*` - Character development topics

## Request/Response Patterns

### Standard Response Format

All API responses follow a consistent JSON structure:

```json
{
  "data": {}, // or [] for collections
  "message": "Operation completed successfully",
  "meta": {    // Only for paginated responses
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7
  }
}
```

### Success Response Examples

#### Single Resource

```json
{
  "data": {
    "id": 1,
    "title": "Character Building Adventure",
    "description": "An interactive program focusing on respect and responsibility",
    "duration_minutes": 60,
    "price_per_student": 15.00,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Program retrieved successfully"
}
```

#### Collection Response

```json
{
  "data": [
    {
      "id": 1,
      "title": "Character Building Adventure",
      "duration_minutes": 60
    },
    {
      "id": 2,
      "title": "Leadership Workshop",
      "duration_minutes": 90
    }
  ],
  "message": "Programs retrieved successfully",
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 2,
    "last_page": 1
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "message": "The given data was invalid",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required or token invalid
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation failed
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Error Handling Implementation

```javascript
const handleApiError = (response, data) => {
  switch (response.status) {
    case 400:
      throw new Error(data.message || 'Bad request');
    case 401:
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      break;
    case 403:
      throw new Error('You do not have permission to perform this action');
    case 404:
      throw new Error('Resource not found');
    case 422:
      // Validation errors
      const validationErrors = {};
      Object.keys(data.errors).forEach(field => {
        validationErrors[field] = data.errors[field][0]; // First error message
      });
      throw { type: 'validation', errors: validationErrors };
    case 429:
      throw new Error('Too many requests. Please try again later.');
    default:
      throw new Error(data.message || 'An unexpected error occurred');
  }
};

// Usage in API calls
const createProgram = async (programData) => {
  const response = await apiRequest('/spark/programs', {
    method: 'POST',
    body: JSON.stringify(programData)
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    handleApiError(response, data);
  }
  
  return data;
};
```

## Rate Limiting

### Limits

- **General API**: 120 requests per minute per authenticated user
- **Authentication endpoints**: 60 requests per minute per IP address
- **File upload endpoints**: 30 requests per minute per authenticated user

### Rate Limit Headers

The API includes rate limiting information in response headers:

```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 119
X-RateLimit-Reset: 1640995200
```

### Handling Rate Limits

```javascript
const checkRateLimit = (response) => {
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  
  if (remaining && parseInt(remaining) < 10) {
    console.warn(`Rate limit warning: ${remaining} requests remaining`);
  }
  
  if (response.status === 429) {
    const resetTime = new Date(parseInt(reset) * 1000);
    throw new Error(`Rate limit exceeded. Try again at ${resetTime.toLocaleTimeString()}`);
  }
};
```

## Pagination

### Request Parameters

```javascript
const getPrograms = async (page = 1, perPage = 15, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    ...filters
  });
  
  const response = await apiRequest(`/spark/programs?${params}`);
  return response.json();
};
```

### Pagination Component Example (React)

```jsx
const PaginationComponent = ({ meta, onPageChange }) => {
  const { current_page, last_page, total } = meta;
  
  return (
    <div className="pagination">
      <button 
        disabled={current_page === 1}
        onClick={() => onPageChange(current_page - 1)}
      >
        Previous
      </button>
      
      <span>
        Page {current_page} of {last_page} ({total} total items)
      </span>
      
      <button 
        disabled={current_page === last_page}
        onClick={() => onPageChange(current_page + 1)}
      >
        Next
      </button>
    </div>
  );
};
```
