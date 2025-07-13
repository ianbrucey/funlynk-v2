# Task 001: Laravel Project Initialization
**Agent**: Backend Foundation & Infrastructure Lead  
**Estimated Time**: 3-4 hours  
**Priority**: High  
**Dependencies**: None  

## Overview
Initialize the Laravel backend project with proper structure, configuration, and development environment setup. This task establishes the foundation for all backend development.

## Prerequisites
- PHP 8.1+ installed
- Composer installed
- MySQL 8.0+ installed
- Git configured
- Access to project repository

## Step-by-Step Implementation

### Step 1: Create Laravel Project (30 minutes)
```bash
# Navigate to project root
cd /path/to/funlynk-v2

# Create Laravel project in backend directory
composer create-project laravel/laravel backend "10.*"

# Navigate to backend directory
cd backend
```

### Step 2: Configure Environment Files (45 minutes)
```bash
# Copy environment template
cp .env.example .env.local
cp .env.example .env.staging
cp .env.example .env.production
```

**Edit .env.local with these specific values:**
```env
APP_NAME="Funlynk API"
APP_ENV=local
APP_KEY=base64:YOUR_KEY_HERE
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=funlynk_local
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@funlynk.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"

# Funlynk specific configurations
FRONTEND_URL=http://localhost:3000
MOBILE_APP_URL=funlynk://
SPARK_FRONTEND_URL=http://localhost:3001

# API Configuration
API_VERSION=v1
API_RATE_LIMIT=60
API_RATE_LIMIT_WINDOW=1

# File Upload Configuration
MAX_FILE_SIZE=10240
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,gif,webp
ALLOWED_DOCUMENT_TYPES=pdf,doc,docx
```

### Step 3: Install Required Packages (30 minutes)
```bash
# Install Laravel Sanctum for API authentication
composer require laravel/sanctum

# Install additional packages
composer require spatie/laravel-permission
composer require intervention/image
composer require league/flysystem-aws-s3-v3
composer require pusher/pusher-php-server

# Install development packages
composer require --dev laravel/telescope
composer require --dev barryvdh/laravel-ide-helper
composer require --dev nunomaduro/larastan
```

### Step 4: Configure Project Structure (45 minutes)

**Create app directory structure:**
```bash
mkdir -p app/Http/Controllers/Api/V1/{Auth,Core,Spark}
mkdir -p app/Http/Requests/{Auth,Core,Spark}
mkdir -p app/Http/Resources/{Auth,Core,Spark}
mkdir -p app/Services/{Auth,Core,Spark,Shared}
mkdir -p app/Models/{Core,Spark}
mkdir -p app/Traits
mkdir -p app/Exceptions
```

**Create routes structure:**
```bash
# Create API route files
touch routes/api/auth.php
touch routes/api/core.php
touch routes/api/spark.php
```

### Step 5: Configure CORS (30 minutes)
```bash
# Publish CORS configuration
php artisan config:publish cors
```

**Edit config/cors.php:**
```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:3000',  // Core frontend
        'http://localhost:3001',  // Spark frontend
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### Step 6: Configure Service Providers (30 minutes)

**Create custom service providers:**
```bash
php artisan make:provider CoreServiceProvider
php artisan make:provider SparkServiceProvider
php artisan make:provider SharedServiceProvider
```

**Register providers in config/app.php:**
```php
'providers' => [
    // ... existing providers
    App\Providers\CoreServiceProvider::class,
    App\Providers\SparkServiceProvider::class,
    App\Providers\SharedServiceProvider::class,
],
```

### Step 7: Configure Database (30 minutes)
```bash
# Create databases
mysql -u root -p -e "CREATE DATABASE funlynk_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE DATABASE funlynk_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Generate application key
php artisan key:generate

# Test database connection
php artisan migrate:status
```

### Step 8: Configure IDE Helper (15 minutes)
```bash
# Generate IDE helper files
php artisan ide-helper:generate
php artisan ide-helper:models
php artisan ide-helper:meta
```

## Code Templates to Use

### Base Controller Template
Use: `planning/code-templates/laravel/controller_template.php`

### Base Model Template  
Use: `planning/code-templates/laravel/model_template.php`

### Base Service Template
Use: `planning/code-templates/laravel/service_template.php`

## Acceptance Criteria

### Functional Requirements
- [ ] Laravel project successfully created and configured
- [ ] Environment files properly configured for all environments
- [ ] All required packages installed and configured
- [ ] Project directory structure matches specification
- [ ] CORS properly configured for frontend applications
- [ ] Database connection established and tested
- [ ] Service providers registered and functional

### Technical Requirements
- [ ] PHP 8.1+ compatibility verified
- [ ] Composer autoloading working correctly
- [ ] Environment variables loading properly
- [ ] IDE helper files generated successfully
- [ ] No configuration errors in logs

### Quality Requirements
- [ ] Code follows PSR-12 coding standards
- [ ] All configuration files properly documented
- [ ] Environment-specific configurations separated
- [ ] Security best practices implemented

## Testing Instructions

### Manual Testing
```bash
# Test Laravel installation
php artisan --version

# Test environment configuration
php artisan config:show app
php artisan config:show database

# Test database connection
php artisan migrate:status

# Start development server
php artisan serve
```

### Verification Checklist
- [ ] Application starts without errors
- [ ] Database connection successful
- [ ] Environment variables loaded correctly
- [ ] CORS headers present in responses
- [ ] IDE helper files generated
- [ ] All service providers loaded

## Troubleshooting

### Common Issues
1. **Database connection failed**: Check MySQL service and credentials
2. **Permission denied**: Ensure proper file permissions on storage/bootstrap directories
3. **Composer memory limit**: Increase PHP memory limit
4. **Missing extensions**: Install required PHP extensions (mbstring, xml, etc.)

### Debug Commands
```bash
# Check configuration
php artisan config:cache
php artisan config:clear

# Check routes
php artisan route:list

# Check environment
php artisan env

# Clear all caches
php artisan optimize:clear
```

## Next Steps
After completion, proceed to:
- Task 002: Authentication System Setup
- Coordinate with Agent 2 and Agent 3 on API contracts
- Share database configuration with all backend agents

## Documentation
- Update project README with setup instructions
- Document environment configuration requirements
- Create development environment setup guide
