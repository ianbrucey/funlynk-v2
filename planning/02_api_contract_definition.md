# API Contract Definition
## Funlynk & Funlynk Spark MVP

### Overview
This document defines all API endpoints required for the MVP, enabling independent backend and frontend development.

## Authentication Endpoints

### POST /api/auth/register
**Description**: User registration
**Request**:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "password_confirmation": "string",
  "role": "user|teacher|school_admin|funlynk_admin"
}
```
**Response (201)**:
```json
{
  "data": {
    "user": {
      "id": "integer",
      "name": "string",
      "email": "string",
      "role": "string",
      "created_at": "datetime"
    },
    "token": "string"
  }
}
```

### POST /api/auth/login
**Description**: User authentication
**Request**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Response (200)**:
```json
{
  "data": {
    "user": {
      "id": "integer",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "token": "string"
  }
}
```

### POST /api/auth/logout
**Description**: User logout
**Headers**: `Authorization: Bearer {token}`
**Response (200)**:
```json
{
  "message": "Successfully logged out"
}
```

## Core Funlynk Endpoints

### Events

#### GET /api/core/events
**Description**: Get paginated list of events
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `page`: integer (default: 1)
- `per_page`: integer (default: 15, max: 50)
- `search`: string
- `category`: string
- `location`: string
- `radius`: integer (km)
- `date_from`: date
- `date_to`: date

**Response (200)**:
```json
{
  "data": [
    {
      "id": "integer",
      "title": "string",
      "description": "string",
      "start_date": "datetime",
      "end_date": "datetime",
      "location": {
        "address": "string",
        "latitude": "float",
        "longitude": "float"
      },
      "category": "string",
      "tags": ["string"],
      "host": {
        "id": "integer",
        "name": "string",
        "avatar": "string"
      },
      "attendees_count": "integer",
      "max_capacity": "integer|null",
      "price": "decimal|null",
      "image": "string|null"
    }
  ],
  "meta": {
    "current_page": "integer",
    "last_page": "integer",
    "per_page": "integer",
    "total": "integer"
  }
}
```

#### POST /api/core/events
**Description**: Create new event
**Headers**: `Authorization: Bearer {token}`
**Request**:
```json
{
  "title": "string",
  "description": "string",
  "start_date": "datetime",
  "end_date": "datetime",
  "location": {
    "address": "string",
    "latitude": "float",
    "longitude": "float"
  },
  "category": "string",
  "tags": ["string"],
  "visibility": "public|friends|private",
  "max_capacity": "integer|null",
  "price": "decimal|null",
  "image": "file|null"
}
```

#### GET /api/core/events/{id}
**Description**: Get specific event details
**Headers**: `Authorization: Bearer {token}`
**Response (200)**:
```json
{
  "data": {
    "id": "integer",
    "title": "string",
    "description": "string",
    "start_date": "datetime",
    "end_date": "datetime",
    "location": {
      "address": "string",
      "latitude": "float",
      "longitude": "float"
    },
    "category": "string",
    "tags": ["string"],
    "host": {
      "id": "integer",
      "name": "string",
      "avatar": "string"
    },
    "attendees": [
      {
        "id": "integer",
        "name": "string",
        "avatar": "string"
      }
    ],
    "is_attending": "boolean",
    "can_edit": "boolean"
  }
}
```

#### POST /api/core/events/{id}/join
**Description**: Join an event
**Headers**: `Authorization: Bearer {token}`
**Response (200)**:
```json
{
  "message": "Successfully joined event"
}
```

### User Profiles

#### GET /api/core/users/{id}
**Description**: Get user profile
**Headers**: `Authorization: Bearer {token}`
**Response (200)**:
```json
{
  "data": {
    "id": "integer",
    "name": "string",
    "bio": "string",
    "avatar": "string",
    "interests": ["string"],
    "events_hosted": "integer",
    "events_attended": "integer",
    "followers_count": "integer",
    "following_count": "integer",
    "is_following": "boolean"
  }
}
```

## Spark Endpoints

### Programs

#### GET /api/spark/programs
**Description**: Get available field trip programs
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `character_topic`: string
- `grade_level`: string
- `location`: string
- `date_from`: date
- `date_to`: date

**Response (200)**:
```json
{
  "data": [
    {
      "id": "integer",
      "title": "string",
      "description": "string",
      "short_summary": "string",
      "duration_minutes": "integer",
      "cost": "decimal",
      "character_topics": ["string"],
      "grade_levels": ["string"],
      "location": {
        "address": "string",
        "city": "string",
        "state": "string",
        "latitude": "float",
        "longitude": "float"
      },
      "available_slots": [
        {
          "id": "integer",
          "date": "date",
          "start_time": "time",
          "end_time": "time",
          "max_capacity": "integer",
          "booked_capacity": "integer"
        }
      ]
    }
  ]
}
```

#### POST /api/spark/programs
**Description**: Create new field trip program (Admin only)
**Headers**: `Authorization: Bearer {token}`
**Authorization**: `funlynk_admin` role required
**Request**:
```json
{
  "title": "string",
  "description": "string",
  "short_summary": "string",
  "duration_minutes": "integer",
  "cost": "decimal",
  "character_topics": ["string"],
  "grade_levels": ["string"],
  "location": {
    "address": "string",
    "city": "string",
    "state": "string",
    "zip": "string"
  },
  "what_to_bring": "string",
  "special_instructions": "string",
  "images": ["file"]
}
```

### School Management

#### POST /api/spark/schools
**Description**: Create school profile
**Headers**: `Authorization: Bearer {token}`
**Authorization**: `school_admin` or `funlynk_admin` role required
**Request**:
```json
{
  "district_name": "string",
  "school_name": "string",
  "address": "string",
  "contact_person": "string",
  "contact_email": "string",
  "contact_phone": "string"
}
```

#### POST /api/spark/schools/{id}/classes
**Description**: Create class
**Headers**: `Authorization: Bearer {token}`
**Authorization**: `teacher` or `school_admin` role required
**Request**:
```json
{
  "class_name": "string",
  "grade_level": "string",
  "teacher_id": "integer"
}
```

#### POST /api/spark/classes/{id}/students/upload
**Description**: Upload student roster via CSV
**Headers**: `Authorization: Bearer {token}`
**Authorization**: `teacher` or `school_admin` role required
**Request**: `multipart/form-data`
- `file`: CSV file with columns: first_name, last_name, student_id, date_of_birth, parent_email, parent_phone

**Response (200)**:
```json
{
  "data": {
    "imported": "integer",
    "failed": "integer",
    "errors": [
      {
        "row": "integer",
        "message": "string"
      }
    ]
  }
}
```

### Trip Bookings

#### POST /api/spark/bookings
**Description**: Book field trip slot
**Headers**: `Authorization: Bearer {token}`
**Authorization**: `teacher` or `school_admin` role required
**Request**:
```json
{
  "program_id": "integer",
  "slot_id": "integer",
  "class_ids": ["integer"],
  "student_ids": ["integer"]
}
```

#### GET /api/spark/bookings
**Description**: Get school's trip bookings
**Headers**: `Authorization: Bearer {token}`
**Response (200)**:
```json
{
  "data": [
    {
      "id": "integer",
      "program": {
        "title": "string",
        "location": "string"
      },
      "date": "date",
      "time": "time",
      "students_count": "integer",
      "permission_slips_signed": "integer",
      "status": "pending|confirmed|completed"
    }
  ]
}
```

### Permission Slips

#### GET /api/spark/permission-slips/{token}
**Description**: Get permission slip for parent (public endpoint)
**Response (200)**:
```json
{
  "data": {
    "student_name": "string",
    "program_title": "string",
    "trip_date": "date",
    "trip_time": "time",
    "location": "string",
    "what_to_bring": "string",
    "school_name": "string",
    "teacher_name": "string",
    "is_signed": "boolean"
  }
}
```

#### POST /api/spark/permission-slips/{token}/sign
**Description**: Sign permission slip (public endpoint)
**Request**:
```json
{
  "parent_name": "string",
  "emergency_contact_name": "string",
  "emergency_contact_phone": "string",
  "emergency_contact_relationship": "string",
  "medical_notes": "string",
  "consent_given": "boolean"
}
```

## Error Response Format

All endpoints return errors in consistent format:

**4xx/5xx Response**:
```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **General API**: 60 requests per minute
- **File uploads**: 10 requests per minute

## Pagination

All list endpoints support pagination with consistent meta format:
```json
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 15,
    "total": 150
  },
  "links": {
    "first": "url",
    "last": "url",
    "prev": "url",
    "next": "url"
  }
}
```
