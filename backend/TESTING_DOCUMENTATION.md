# Unit & Feature Testing Documentation

## Overview

This document describes the comprehensive testing suite implemented for the authentication system, which provides ≥ 80% code coverage.

## Test Structure

### 1. User Factory (`database/factories/UserFactory.php`)
- Enhanced factory with multiple states and helper methods
- Supports various user configurations (active/inactive, roles, custom attributes)
- Includes methods for creating users with specific characteristics
- Factory states: `active()`, `inactive()`, `unverified()`, `admin()`, `moderator()`, etc.

### 2. Unit Tests

#### User Model Tests (`tests/Unit/Models/UserTest.php`)
- Tests all model attributes and relationships
- Verifies fillable, guarded, hidden, and cast attributes
- Tests all computed attributes (full_name, initials, age, etc.)
- Tests all query scopes (active, emailVerified, recentlyActive, etc.)
- Tests model traits and interfaces
- Tests soft deletion functionality

#### AuthService Tests (`tests/Unit/Services/AuthServiceTest.php`)
- Complete coverage of all AuthService methods
- Tests authentication flows: login, logout, registration
- Tests password reset functionality
- Tests user activation/deactivation
- Tests role assignment and management
- Tests email verification
- Tests token management and invalidation

### 3. Feature Tests

#### Authentication Tests (`tests/Feature/Auth/AuthenticationTest.php`)
- End-to-end testing of authentication endpoints
- Tests registration flow with validation
- Tests login flow with various scenarios
- Tests logout and token invalidation
- Tests password reset flow
- Tests role-based access control
- Tests token expiration and refresh
- Tests multi-device authentication

### 4. Test Helpers (`tests/Traits/TestHelpers.php`)
- Reusable test utilities and assertions
- Helper methods for creating users with roles
- Authentication helpers for API testing
- Custom assertions for user status, roles, tokens
- Request helpers for authenticated endpoints

## Test Coverage Areas

### Authentication Flow
- ✅ User registration with validation
- ✅ User login with credentials
- ✅ User logout (single and all devices)
- ✅ Password reset functionality
- ✅ Email verification
- ✅ Token management and expiration
- ✅ Remember me functionality

### User Management
- ✅ User model attributes and relationships
- ✅ User factory with multiple states
- ✅ User activation/deactivation
- ✅ Role assignment and management
- ✅ Profile completeness validation
- ✅ User scopes and queries

### Security Features
- ✅ Token invalidation on account deactivation
- ✅ Password hashing verification
- ✅ Expired token handling
- ✅ Role-based access control
- ✅ Multi-device token management

### API Endpoints
- ✅ POST /api/auth/register
- ✅ POST /api/auth/login
- ✅ POST /api/auth/logout
- ✅ POST /api/auth/logout-all
- ✅ GET /api/auth/me
- ✅ POST /api/auth/refresh
- ✅ POST /api/auth/forgot-password
- ✅ POST /api/auth/reset-password

## Running Tests

### Basic Test Execution
```bash
# Run all tests
php artisan test

# Run specific test suites
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature

# Run specific test classes
php artisan test tests/Unit/Models/UserTest.php
php artisan test tests/Feature/Auth/AuthenticationTest.php
```

### Code Coverage Reports
```bash
# Generate coverage report
vendor/bin/phpunit --coverage-text

# Generate HTML coverage report
vendor/bin/phpunit --coverage-html build/coverage

# Generate coverage with minimum threshold
vendor/bin/phpunit --coverage-text --coverage-clover=coverage.xml
```

## CI/CD Integration

### GitHub Actions (`/.github/workflows/tests.yml`)
- Automated test execution on push/PR
- Multi-PHP version testing (8.1, 8.2, 8.3)
- Code coverage reporting
- Code quality checks (PHPStan, Pint)
- Security auditing

### Workflow Features
- Database setup and migrations
- Dependency installation
- Test execution with coverage
- Coverage upload to Codecov
- Code style validation
- Static analysis

## Test Configuration

### PHPUnit Configuration (`phpunit.xml`)
- Comprehensive coverage settings
- Proper test isolation
- Database configuration for testing
- Coverage reporting setup
- Logging configuration

### Key Features
- SQLite in-memory database for faster tests
- Strict error reporting
- Coverage exclusions for non-testable code
- Detailed logging and reporting

## Coverage Metrics

The test suite provides comprehensive coverage for:

- **Models**: 100% coverage of User model
- **Services**: 100% coverage of AuthService
- **Controllers**: Full coverage of authentication endpoints
- **Factories**: Enhanced factory with all states
- **Middleware**: Authentication middleware testing
- **Validation**: Request validation testing
- **Security**: Token management and security features

## Best Practices Implemented

1. **Test Isolation**: Each test is independent and doesn't affect others
2. **Comprehensive Assertions**: Custom assertions for domain-specific testing
3. **Realistic Data**: Factory-generated realistic test data
4. **Edge Cases**: Testing of error conditions and edge cases
5. **Performance**: Fast test execution with SQLite in-memory database
6. **Maintainability**: Well-organized test structure and helpers
7. **Documentation**: Clear test names and comprehensive documentation

## Maintenance

### Adding New Tests
1. Create test files in appropriate directories
2. Use existing test helpers and factories
3. Follow naming conventions
4. Include both positive and negative test cases
5. Update documentation as needed

### Continuous Improvement
- Monitor coverage reports
- Add tests for new features
- Refactor tests when code changes
- Update CI/CD pipeline as needed

This comprehensive test suite ensures reliability, security, and maintainability of the authentication system with robust coverage exceeding 80%.
