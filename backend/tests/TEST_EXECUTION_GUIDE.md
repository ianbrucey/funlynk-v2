# Test Execution Guide for FunLynk Backend

## Quick Start

### Prerequisites

1. **Environment Setup**
   ```bash
   # Copy test environment file
   cp .env.testing.example .env.testing
   
   # Install dependencies
   composer install
   
   # Generate application key
   php artisan key:generate --env=testing
   ```

2. **Database Setup**
   ```bash
   # Run migrations for testing
   php artisan migrate --env=testing
   
   # Seed test data if needed
   php artisan db:seed --env=testing
   ```

## Test Execution Commands

### Basic Test Execution

```bash
# Run all tests
php artisan test

# Run tests with verbose output
php artisan test -v

# Run tests and stop on first failure
php artisan test --stop-on-failure

# Run tests in parallel (faster)
php artisan test --parallel
```

### Test Suite Execution

```bash
# Run only feature tests
php artisan test --testsuite=Feature

# Run only unit tests
php artisan test --testsuite=Unit

# Run specific test directory
php artisan test tests/Feature/Spark/

# Run specific test file
php artisan test tests/Feature/Spark/ProgramManagementTest.php
```

### Filtered Test Execution

```bash
# Run tests matching pattern
php artisan test --filter ProgramManagement

# Run specific test method
php artisan test --filter test_user_can_create_program

# Run tests with specific group
php artisan test --group spark

# Exclude specific group
php artisan test --exclude-group slow
```

## Coverage Analysis

### Generate Coverage Reports

```bash
# Run comprehensive coverage analysis
./scripts/test-coverage-analysis.sh

# Generate HTML coverage report
vendor/bin/phpunit --coverage-html build/coverage/html

# Generate text coverage report
vendor/bin/phpunit --coverage-text

# Generate Clover XML for CI
vendor/bin/phpunit --coverage-clover build/coverage/clover.xml
```

### Coverage Thresholds

The project maintains these coverage requirements:

- **Overall Coverage**: 90%+
- **New Features**: 95%+
- **Critical Paths**: 100%

### View Coverage Reports

```bash
# Open HTML coverage report
open build/coverage/html/index.html

# View text coverage summary
cat build/coverage/coverage.txt
```

## Test Categories and Execution

### 1. Spark Backend Tests

```bash
# All Spark tests
php artisan test tests/Feature/Spark/

# Program Management tests
php artisan test tests/Feature/Spark/ProgramManagementTest.php

# Booking Management tests
php artisan test tests/Feature/Spark/BookingManagementTest.php

# Character Topics tests
php artisan test tests/Feature/Spark/CharacterTopicsTest.php
```

**Expected Results:**
- ✅ All CRUD operations tested
- ✅ Authorization and permissions verified
- ✅ Validation rules confirmed
- ✅ Business logic validated

### 2. Core Backend Tests

```bash
# All Core tests
php artisan test tests/Feature/Core/

# Event Management tests
php artisan test tests/Feature/Core/EventManagementTest.php

# Social Features tests (when implemented)
php artisan test tests/Feature/Core/SocialFeaturesTest.php
```

**Expected Results:**
- ✅ Event lifecycle management tested
- ✅ RSVP functionality verified
- ✅ Social features prepared for implementation

### 3. Authentication Tests

```bash
# Authentication flow tests
php artisan test tests/Feature/Auth/AuthenticationTest.php

# User management tests
php artisan test tests/Unit/Models/UserTest.php

# Auth service tests
php artisan test tests/Unit/Services/AuthServiceTest.php
```

**Expected Results:**
- ✅ Login/logout flows tested
- ✅ Token management verified
- ✅ Role-based access confirmed

## Dataset-Driven Testing Approach

### Using Factories for Test Data

```php
// Create consistent test data
$programs = SparkProgram::factory()->count(5)->create([
    'is_active' => true,
    'grade_levels' => ['K', '1', '2'],
]);

// Create related data
$booking = Booking::factory()->create([
    'program_id' => $programs->first()->id,
    'student_count' => 25,
]);
```

### Test Data Scenarios

```php
// Test multiple scenarios with datasets
public function gradeLevel_provider(): array
{
    return [
        'elementary' => [['K', '1', '2'], 'elementary'],
        'middle' => [['6', '7', '8'], 'middle'],
        'high' => [['9', '10', '11', '12'], 'high'],
    ];
}

/**
 * @dataProvider gradeLevel_provider
 */
public function test_program_filtering_by_grade_level($grades, $category)
{
    // Test implementation
}
```

## Performance Testing

### Benchmark Critical Endpoints

```bash
# Run performance tests
php artisan test --group performance

# Benchmark specific endpoints
php artisan test tests/Performance/BookingPerformanceTest.php
```

### Load Testing Preparation

```bash
# Generate test data for load testing
php artisan db:seed --class=LoadTestSeeder

# Run memory usage tests
php artisan test --filter memory
```

## Continuous Integration Testing

### GitHub Actions Integration

Tests run automatically on:
- Pull requests
- Push to main branch
- Scheduled daily runs

### CI Test Commands

```bash
# CI test execution
vendor/bin/phpunit --coverage-xml=coverage/coverage-xml --log-junit=coverage/junit.xml

# Code quality checks
vendor/bin/pint --test
vendor/bin/phpstan analyse
```

## Debugging Tests

### Debug Failed Tests

```bash
# Run with debug output
php artisan test --filter failing_test --debug

# Show detailed error information
php artisan test -v --stop-on-failure

# Run single test with maximum verbosity
php artisan test tests/Feature/Spark/ProgramManagementTest.php::test_user_can_create_program -vvv
```

### Common Debug Techniques

```php
// Add debug output in tests
dump($response->json());
dd($response->getContent());

// Check database state
$this->assertDatabaseHas('table', ['field' => 'value']);
dump(DB::table('table')->get());

// Verify authentication
dump(auth()->user());
dump($this->user->roles->pluck('name'));
```

## Test Environment Management

### Database Management

```bash
# Fresh test database
php artisan migrate:fresh --env=testing

# Reset database between test runs
php artisan migrate:refresh --env=testing

# Seed specific data for tests
php artisan db:seed --class=TestDataSeeder --env=testing
```

### Cache and Storage

```bash
# Clear test caches
php artisan cache:clear --env=testing
php artisan config:clear --env=testing

# Reset file storage for tests
rm -rf storage/app/testing/*
```

## Test Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Run full test suite with coverage
2. **Before releases**: Execute comprehensive test analysis
3. **After new features**: Update test documentation
4. **Monthly**: Review and update test data factories

### Test Health Checks

```bash
# Check test configuration
php artisan test --list-tests | wc -l

# Verify test database
php artisan migrate:status --env=testing

# Check test dependencies
composer show --dev | grep test
```

## Troubleshooting Common Issues

### Database Issues

```bash
# Reset test database
php artisan migrate:fresh --seed --env=testing

# Check database connection
php artisan tinker --env=testing
>>> DB::connection()->getPdo();
```

### Permission Issues

```bash
# Reset roles and permissions
php artisan db:seed --class=RolesAndPermissionsSeeder --env=testing

# Check user roles in tests
dump($user->roles->pluck('name'));
```

### Memory Issues

```bash
# Run tests with memory limit
php -d memory_limit=512M artisan test

# Monitor memory usage
php artisan test --filter memory_intensive --debug
```

## Best Practices

### Test Organization

1. **Group related tests** in the same file
2. **Use descriptive test names** that explain the scenario
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Keep tests independent** and isolated

### Performance Considerations

1. **Use database transactions** for faster test execution
2. **Mock external services** to avoid network calls
3. **Use factories** instead of manual data creation
4. **Run tests in parallel** when possible

### Maintenance

1. **Update tests** when API changes
2. **Remove obsolete tests** for deprecated features
3. **Refactor common test logic** into helper methods
4. **Document complex test scenarios**

## Next Steps

1. **Pest Migration**: Convert to Pest syntax when dependencies allow
2. **API Contract Testing**: Add OpenAPI validation
3. **E2E Testing**: Implement browser-based tests
4. **Performance Benchmarks**: Add automated performance testing
5. **Load Testing**: Implement stress testing for critical endpoints
