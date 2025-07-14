# Funlynk V2

Modern platform for school event management and social engagement, with specialized "Spark" programs for transformative educational experiences.

## 🏗️ Project Structure

```
funlynk-v2/
├── backend/                 # Laravel 10.x API
├── mobile/                  # React Native mobile app (planned)
├── admin-dashboard/         # React admin web app (planned)
├── .github/                 # GitHub Actions CI/CD
├── docker/                  # Docker configurations (planned)
├── infrastructure/          # Infrastructure as Code (planned)
├── scripts/                 # Deployment and utility scripts (planned)
└── docs/                    # Documentation (planned)
```

## 🚀 Quick Start

### Backend Setup

1. **Prerequisites**
   - PHP 8.1+
   - Composer
   - MySQL 8.0+ (or SQLite for development)
   - Git

2. **Installation**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   ```

3. **Database Setup**
   ```bash
   # For MySQL
   mysql -u root -p -e "CREATE DATABASE funlynk_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   
   # For SQLite (development)
   touch database/database.sqlite
   ```

4. **Run Migrations**
   ```bash
   php artisan migrate
   ```

5. **Start Development Server**
   ```bash
   php artisan serve --port=8000
   ```

## 🔧 Development

### Code Standards
- PSR-12 coding standards
- Laravel best practices
- PHPStan level 6 analysis
- Comprehensive testing

### Available Commands
```bash
# Code formatting
vendor/bin/pint

# Static analysis
vendor/bin/phpstan analyse

# Run tests
vendor/bin/phpunit

# Generate IDE helpers
php artisan ide-helper:generate
```

## 🏗️ Architecture

### Backend (Laravel)
- **Core**: User management, events, social features
- **Spark**: School programs, bookings, permissions
- **Shared**: Common services and utilities

### Frontend Applications
- **Mobile**: React Native app for students/parents
- **Admin**: React web dashboard for administrators

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows
- **Backend CI/CD**: Laravel testing, building, deployment
- **Quality Gates**: Code quality, security scanning
- **Future**: Frontend and mobile app pipelines

### Deployment Environments
- **Development**: Local development with file/SQLite
- **Staging**: Staging environment for testing
- **Production**: Production environment

## 📚 Development Tasks

### Phase 1: Foundation (Weeks 1-2)
- ✅ Laravel project setup
- ✅ CI/CD pipeline configuration
- 🔄 Authentication system
- 🔄 Core API endpoints

### Phase 2: Backend Development (Weeks 3-4)
- 🔄 Event management API
- 🔄 Social features API
- 🔄 User profile management
- 🔄 School management API

### Phase 3: Specialized Features (Week 5)
- 🔄 Spark backend features
- 🔄 Mobile foundation
- 🔄 Payment integration

### Phase 4: Frontend Development (Weeks 6-7)
- 🔄 React Native mobile app
- 🔄 Admin dashboard
- 🔄 UI component library

### Phase 5: Integration (Week 8)
- 🔄 End-to-end testing
- 🔄 Performance optimization
- 🔄 Security hardening

## 🛠️ Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and quality checks
5. Submit a pull request

## 📋 Environment Variables

### Backend (.env)
```env
APP_NAME="Funlynk API"
APP_ENV=local
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_DATABASE=funlynk_local

# Funlynk Configuration
FRONTEND_URL=http://localhost:3000
SPARK_FRONTEND_URL=http://localhost:3001
API_VERSION=v1
```

## 🔒 Security

- JWT authentication via Laravel Sanctum
- CORS configuration for frontend apps
- Input validation and sanitization
- Security headers and CSP
- Regular dependency updates

## 📊 Monitoring

- Application logs via Laravel logging
- Performance monitoring (planned)
- Error tracking (planned)
- Health checks (planned)

## 📞 Support

For development questions and issues, please refer to the planning documents in `/planning/` or create an issue in the repository.

---

**Status**: 🚧 In Active Development
**Version**: 2.0.0-dev
**Laravel**: 10.x
**PHP**: 8.1+
