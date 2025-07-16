# FunLynk Backend API

<p align="center">
  <img src="https://via.placeholder.com/400x100/4F46E5/FFFFFF?text=FunLynk" alt="FunLynk Logo" width="400">
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Laravel-10.x-red.svg" alt="Laravel Version"></a>
  <a href="#"><img src="https://img.shields.io/badge/PHP-8.2+-blue.svg" alt="PHP Version"></a>
  <a href="#"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
</p>

## About FunLynk

FunLynk is a comprehensive educational platform that connects schools with engaging educational programs, with a special focus on character development through the **Spark** educational programs module. The platform facilitates seamless booking, management, and coordination of educational experiences for students.

### Key Features

- **🏫 School & District Management**: Comprehensive administration tools for educational institutions
- **📚 Spark Educational Programs**: Character development programs with topics like respect, responsibility, integrity, and leadership
- **📅 Booking Management**: Streamlined booking system for educational programs with availability tracking
- **👥 User Management**: Role-based access control for administrators, teachers, and parents
- **📊 Analytics & Reporting**: Detailed insights into program effectiveness and usage
- **🔐 Secure Authentication**: Laravel Sanctum-based API authentication
- **☁️ Cloud Storage**: AWS S3 integration for file management
- **📱 Mobile-Ready API**: RESTful API designed for mobile and web applications

## Quick Start

### Prerequisites

- PHP 8.2 or higher
- Composer
- MySQL 8.0 or higher
- Node.js 18+ (for asset compilation)
- AWS S3 account (for file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/funlynk/funlynk-backend.git
   cd funlynk-backend/backend
   ```

2. **Install dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Configure your `.env` file**
   ```env
   # Database Configuration
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=funlynk
   DB_USERNAME=your_username
   DB_PASSWORD=your_password

   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_DEFAULT_REGION=us-east-1
   AWS_BUCKET=your_bucket_name
   AWS_USE_PATH_STYLE_ENDPOINT=false

   # Mail Configuration
   MAIL_MAILER=smtp
   MAIL_HOST=your_smtp_host
   MAIL_PORT=587
   MAIL_USERNAME=your_email
   MAIL_PASSWORD=your_password
   MAIL_ENCRYPTION=tls
   ```

5. **Database setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Start the development server**
   ```bash
   php artisan serve
   ```

The API will be available at `http://localhost:8000`

## API Documentation

### Authentication

All API endpoints require authentication using Laravel Sanctum tokens. Include the token in the Authorization header:

```
Authorization: Bearer {your-token}
```

### Available APIs

- **Authentication API**: User login, registration, and token management
- **Spark Programs API**: Educational program management and booking
- **District Management API**: School district administration
- **School Management API**: Individual school administration
- **Booking Management API**: Program booking and scheduling
- **Character Topics API**: Character development topic management

### API Documentation Files

- **Authentication API**: [`docs/auth.yaml`](docs/auth.yaml)
- **Spark Programs API**: [`docs/spark.yaml`](docs/spark.yaml)

### Interactive API Documentation

You can view the interactive API documentation by opening the YAML files in tools like:
- [Swagger Editor](https://editor.swagger.io/)
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)

## Environment Configuration

### Required Environment Variables

```env
# Application
APP_NAME=FunLynk
APP_ENV=local
APP_KEY=base64:your_app_key
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=funlynk
DB_USERNAME=your_username
DB_PASSWORD=your_password

# AWS S3 Storage
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your_bucket_name

# Mail
MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@funlynk.com
MAIL_FROM_NAME="${APP_NAME}"

# Queue (for background jobs)
QUEUE_CONNECTION=database

# Cache
CACHE_DRIVER=file
SESSION_DRIVER=file
```

### S3 Configuration

FunLynk uses AWS S3 for file storage. Configure your S3 bucket with the following settings:

1. **Create an S3 bucket** in your AWS account
2. **Set up IAM user** with S3 access permissions
3. **Configure CORS** for your bucket:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

4. **Update your `.env` file** with the S3 credentials

## Testing

FunLynk includes comprehensive test suites to ensure code quality and reliability.

### Running Tests

```bash
# Run all tests
php artisan test

# Run tests with coverage
./vendor/bin/pest --coverage

# Run specific test suite
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit

# Run tests for specific module
php artisan test tests/Feature/Spark/
```

### Test Structure

- **Unit Tests**: Located in `tests/Unit/` - Test individual classes and methods
- **Feature Tests**: Located in `tests/Feature/` - Test complete API endpoints and workflows
- **Spark Tests**: Located in `tests/Feature/Spark/` - Comprehensive tests for Spark educational programs

### Test Coverage Requirements

- Minimum 90% code coverage for new features
- All API endpoints must have feature tests
- Critical business logic must have unit tests
- File upload functionality uses `Storage::fake('s3')` for testing

### Example Test Commands

```bash
# Test specific controller
php artisan test tests/Feature/Spark/ProgramControllerTest.php

# Test with detailed output
php artisan test --verbose

# Test with coverage report
./vendor/bin/pest --coverage --min=90
```

## Database

### Migrations

```bash
# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Reset and re-run all migrations
php artisan migrate:fresh

# Run migrations with seeding
php artisan migrate:fresh --seed
```

### Seeders

The application includes comprehensive seeders for development and testing:

```bash
# Run all seeders
php artisan db:seed

# Run specific seeder
php artisan db:seed --class=SparkSeeder
php artisan db:seed --class=UserSeeder

# Seed with sample data for development
php artisan db:seed --class=DevelopmentSeeder
```

### Database Schema

Key database tables:
- `users` - User accounts with role-based permissions
- `spark_districts` - School districts
- `spark_schools` - Individual schools
- `spark_programs` - Educational programs
- `spark_character_topics` - Character development topics
- `spark_program_availability` - Program scheduling slots
- `spark_bookings` - Program bookings and reservations

## Development

### Code Standards

Follow the coding standards defined in [`planning/01_coding_standards_and_style_guide.md`](../planning/01_coding_standards_and_style_guide.md).

### Code Quality Tools

```bash
# PHP CS Fixer (code formatting)
./vendor/bin/pint

# PHPStan (static analysis)
./vendor/bin/phpstan analyse

# Run all quality checks
composer check-code
```

### Git Workflow

1. Create feature branches from `main`
2. Follow conventional commit messages
3. Ensure all tests pass before merging
4. Require code review for all changes

## Deployment

### Production Requirements

- PHP 8.2+ with required extensions
- MySQL 8.0+ or PostgreSQL 13+
- Redis (for caching and queues)
- AWS S3 bucket for file storage
- SSL certificate for HTTPS

### Environment Variables for Production

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.funlynk.com

# Database (use production credentials)
DB_CONNECTION=mysql
DB_HOST=your_production_host
DB_DATABASE=funlynk_production

# Cache and Sessions
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Redis
REDIS_HOST=your_redis_host
REDIS_PASSWORD=your_redis_password
REDIS_PORT=6379

# Mail (production SMTP)
MAIL_MAILER=smtp
MAIL_HOST=your_production_smtp
```

### Deployment Steps

1. **Clone repository** on production server
2. **Install dependencies**: `composer install --no-dev --optimize-autoloader`
3. **Configure environment**: Copy and configure `.env` file
4. **Generate application key**: `php artisan key:generate`
5. **Run migrations**: `php artisan migrate --force`
6. **Cache configuration**: `php artisan config:cache`
7. **Cache routes**: `php artisan route:cache`
8. **Cache views**: `php artisan view:cache`
9. **Set permissions**: Ensure `storage/` and `bootstrap/cache/` are writable
10. **Configure web server**: Point document root to `public/` directory

### Queue Workers

For production, set up queue workers to handle background jobs:

```bash
# Start queue worker
php artisan queue:work --daemon

# Use supervisor for process management
sudo supervisorctl start funlynk-worker:*
```

## Security

### Security Features

- **Authentication**: Laravel Sanctum for API token management
- **Authorization**: Role-based permissions using Spatie Laravel Permission
- **Rate Limiting**: API rate limiting (120 requests/minute)
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Eloquent ORM with parameter binding
- **XSS Protection**: Output escaping and Content Security Policy
- **CSRF Protection**: Built-in CSRF token validation

### Security Best Practices

- Keep dependencies updated
- Use HTTPS in production
- Implement proper error handling
- Log security events
- Regular security audits
- Follow OWASP guidelines

## Support

### Documentation

- **Environment Setup**: [`docs/README_ENVIRONMENT_SEEDING.md`](docs/README_ENVIRONMENT_SEEDING.md)
- **API Documentation**: [`docs/auth.yaml`](docs/auth.yaml) and [`docs/spark.yaml`](docs/spark.yaml)
- **Testing Guide**: [`TESTING_DOCUMENTATION.md`](TESTING_DOCUMENTATION.md)

### Getting Help

- **Issues**: Report bugs and feature requests on GitHub
- **Development Team**: Contact the FunLynk development team
- **Documentation**: Check the comprehensive documentation in the `docs/` directory

## License

FunLynk is proprietary software. All rights reserved.

## Contributing

Please read our contributing guidelines and code of conduct before submitting pull requests.

---

**Built with ❤️ by the FunLynk Team**
