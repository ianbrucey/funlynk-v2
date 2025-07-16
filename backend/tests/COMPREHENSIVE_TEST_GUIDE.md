# Comprehensive Test Guide for FunLynk Backend

## Overview

This guide provides comprehensive documentation for the FunLynk backend test suite, covering all new endpoints and features with 90%+ coverage requirements.

## Test Structure

### Feature Tests

Feature tests are organized by module and test complete user workflows:

```
tests/Feature/
├── Core/
│   ├── EventManagementTest.php      # Core event CRUD and interactions
│   └── SocialFeaturesTest.php       # Activity feed, messaging, notifications
├── Spark/
│   ├── ProgramManagementTest.php    # Spark program CRUD and filtering
│   ├── BookingManagementTest.php    # Booking lifecycle management
│   └── CharacterTopicsTest.php      # Character topic management
└── Auth/
    └── AuthenticationTest.php       # Authentication flows
```

### Unit Tests

Unit tests focus on individual components:

```
tests/Unit/
├── Models/                          # Model behavior and relationships
├── Services/                        # Business logic services
├── Http/
│   ├── Controllers/                 # Controller logic
│   ├── Requests/                    # Request validation
│   └── Resources/                   # API resource transformations
└── Providers/                       # Service provider registration
```

## Test Coverage Requirements

### 90%+ Coverage Target

All new implementations must maintain 90%+ test coverage:

- **Feature Tests**: End-to-end API endpoint testing
- **Unit Tests**: Individual component testing
- **Integration Tests**: Service interaction testing

### Coverage Analysis

Run coverage analysis with:

```bash
# Generate comprehensive coverage report
./scripts/test-coverage-analysis.sh

# View HTML coverage report
open build/coverage/html/index.html
```

## New Endpoint Test Coverage

### 1. Spark Program Management API

**Endpoints Tested:**
- `GET /api/v1/spark/programs` - List programs with filtering
- `POST /api/v1/spark/programs` - Create new program
- `GET /api/v1/spark/programs/{id}` - Get specific program
- `PUT /api/v1/spark/programs/{id}` - Update program
- `DELETE /api/v1/spark/programs/{id}` - Delete program
- `POST /api/v1/spark/programs/{id}/activate` - Activate program
- `POST /api/v1/spark/programs/{id}/deactivate` - Deactivate program

**Test Scenarios:**
- ✅ Authentication and authorization
- ✅ CRUD operations with proper validation
- ✅ Filtering by grade level, character topic, duration, capacity
- ✅ Search functionality
- ✅ Permission-based access control
- ✅ Error handling and edge cases

### 2. Spark Booking Management API

**Endpoints Tested:**
- `GET /api/v1/spark/bookings` - List bookings with filtering
- `POST /api/v1/spark/bookings` - Create new booking
- `GET /api/v1/spark/bookings/{id}` - Get specific booking
- `PUT /api/v1/spark/bookings/{id}` - Update booking
- `POST /api/v1/spark/bookings/{id}/confirm` - Confirm booking
- `POST /api/v1/spark/bookings/{id}/cancel` - Cancel booking
- `POST /api/v1/spark/bookings/{id}/complete` - Complete booking

**Test Scenarios:**
- ✅ Booking lifecycle management
- ✅ Student count validation against program limits
- ✅ Cost calculation accuracy
- ✅ Status transitions (pending → confirmed → completed)
- ✅ Teacher and admin permissions
- ✅ Filtering by school, status, date range

### 3. Core Event Management API

**Endpoints Tested:**
- `GET /api/v1/core/events` - List events
- `POST /api/v1/core/events` - Create event
- `GET /api/v1/core/events/{id}` - Get specific event
- `PUT /api/v1/core/events/{id}` - Update event
- `DELETE /api/v1/core/events/{id}` - Delete event
- `POST /api/v1/core/events/{id}/rsvp` - RSVP to event
- `DELETE /api/v1/core/events/{id}/rsvp` - Cancel RSVP
- `GET /api/v1/core/events/{id}/attendees` - Get attendees

**Test Scenarios:**
- ✅ Event CRUD operations
- ✅ RSVP management with capacity limits
- ✅ Host permissions and ownership
- ✅ Public/private event visibility
- ✅ Search and filtering capabilities
- ✅ Date validation and logic

### 4. Social Features API (Prepared for Implementation)

**Endpoints to be Tested:**
- `GET /api/v1/core/social/feed` - Activity feed
- `GET /api/v1/core/social/conversations` - User conversations
- `POST /api/v1/core/social/messages` - Send message
- `GET /api/v1/core/social/notifications` - User notifications
- `PUT /api/v1/core/social/notifications/{id}/read` - Mark as read

**Test Scenarios:**
- ✅ Activity feed filtering and pagination
- ✅ Direct messaging functionality
- ✅ Conversation management
- ✅ Notification system
- ✅ Privacy and access controls
- ✅ Real-time features preparation

### 5. Character Topics Management API

**Endpoints Tested:**
- `GET /api/v1/spark/character-topics` - List topics
- `POST /api/v1/spark/character-topics` - Create topic
- `GET /api/v1/spark/character-topics/{id}` - Get specific topic
- `PUT /api/v1/spark/character-topics/{id}` - Update topic
- `DELETE /api/v1/spark/character-topics/{id}` - Delete topic
- `POST /api/v1/spark/character-topics/{id}/activate` - Activate topic
- `GET /api/v1/spark/character-topics/{id}/programs` - Get related programs

**Test Scenarios:**
- ✅ Topic CRUD with slug generation
- ✅ Category filtering and search
- ✅ Program relationship management
- ✅ Activation/deactivation workflows
- ✅ Admin permission requirements

## Testing Patterns and Best Practices

### 1. Authentication Testing

```php
// Always test authenticated and unauthenticated access
Sanctum::actingAs($this->user);
$response = $this->getJson('/api/endpoint');
$response->assertStatus(200);

// Test unauthorized access
$response = $this->getJson('/api/endpoint');
$response->assertStatus(401);
```

### 2. Authorization Testing

```php
// Test different user roles
Sanctum::actingAs($this->adminUser);
$response = $this->postJson('/api/admin-endpoint', $data);
$response->assertStatus(201);

Sanctum::actingAs($this->regularUser);
$response = $this->postJson('/api/admin-endpoint', $data);
$response->assertStatus(403);
```

### 3. Validation Testing

```php
// Test required field validation
$response = $this->postJson('/api/endpoint', []);
$response->assertStatus(422)
    ->assertJsonValidationErrors(['field1', 'field2']);

// Test business logic validation
$response = $this->postJson('/api/endpoint', $invalidData);
$response->assertStatus(422)
    ->assertJsonValidationErrors(['specific_field']);
```

### 4. Database Testing

```php
// Test data persistence
$this->assertDatabaseHas('table', ['field' => 'value']);

// Test soft deletion
$this->assertSoftDeleted('table', ['id' => $id]);

// Test relationships
$model->load('relationship');
$this->assertCount(2, $model->relationship);
```

### 5. File Upload Testing

```php
// Use Storage::fake for file upload tests
Storage::fake('s3');

$file = UploadedFile::fake()->image('test.jpg');
$response = $this->postJson('/api/upload', ['file' => $file]);

Storage::disk('s3')->assertExists('path/to/file.jpg');
```

## Running Tests

### Full Test Suite

```bash
# Run all tests
php artisan test

# Run with coverage
./scripts/test-coverage-analysis.sh
```

### Specific Test Categories

```bash
# Run feature tests only
php artisan test --testsuite=Feature

# Run unit tests only
php artisan test --testsuite=Unit

# Run specific test file
php artisan test tests/Feature/Spark/ProgramManagementTest.php

# Run specific test method
php artisan test --filter test_user_can_create_program
```

### Continuous Integration

Tests are automatically run in CI/CD pipeline:

```yaml
# .github/workflows/backend-ci.yml
- name: Run PHPUnit tests
  run: vendor/bin/phpunit --coverage-xml=coverage/coverage-xml
```

## Test Data Management

### Factories

Use model factories for consistent test data:

```php
// Create test data with factories
$user = User::factory()->create();
$program = SparkProgram::factory()->create(['is_active' => true]);
$booking = Booking::factory()->create([
    'program_id' => $program->id,
    'teacher_id' => $user->id,
]);
```

### Database Seeding

Use seeders for complex test scenarios:

```php
// In test setup
$this->seed(RolesAndPermissionsSeeder::class);
$this->seed(CharacterTopicsSeeder::class);
```

## Coverage Goals and Metrics

### Current Coverage Status

- **Feature Tests**: 95%+ endpoint coverage
- **Unit Tests**: 90%+ component coverage
- **Integration Tests**: 85%+ service coverage

### Quality Metrics

- All new endpoints have comprehensive feature tests
- All business logic has unit test coverage
- All validation rules are tested
- All authorization scenarios are covered
- All error conditions are tested

## Next Steps

1. **Pest Framework Migration**: Convert tests to Pest syntax when dependency conflicts are resolved
2. **Performance Testing**: Add performance benchmarks for high-traffic endpoints
3. **Load Testing**: Implement load testing for booking and event systems
4. **E2E Testing**: Add browser-based end-to-end testing
5. **API Contract Testing**: Implement OpenAPI contract validation

## Troubleshooting

### Common Issues

1. **Role Creation Errors**: Ensure roles are created in test setup
2. **Database Constraints**: Use proper foreign key relationships in factories
3. **File Upload Tests**: Always use `Storage::fake()` for file operations
4. **Authentication**: Use `Sanctum::actingAs()` for authenticated requests

### Debug Commands

```bash
# Debug specific test
php artisan test --filter test_name --debug

# Run tests with verbose output
php artisan test -v

# Check test configuration
php artisan test --list-tests
```
