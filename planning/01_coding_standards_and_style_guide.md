# Coding Standards & Style Guide
## Funlynk & Funlynk Spark MVP

### Overview
This document establishes unified coding standards for the Funlynk project to ensure consistency, maintainability, and enable parallel development across multiple agents.

## PHP (Laravel) Standards

### PSR-12 Compliance
- **Strict adherence to PSR-12** coding standard
- Use 4 spaces for indentation (no tabs)
- Line length limit: 120 characters
- Opening braces for classes and methods on new line

### Laravel-Specific Conventions

#### Naming Conventions
- **Controllers**: PascalCase with `Controller` suffix
  - Core: `App\Http\Controllers\Core\EventController`
  - Spark: `App\Http\Controllers\Spark\ProgramController`
- **Models**: PascalCase, singular
  - `User`, `Event`, `Program`, `PermissionSlip`
- **Database Tables**: snake_case, plural
  - `users`, `events`, `programs`, `permission_slips`
- **Migrations**: descriptive with timestamp
  - `2024_01_01_000000_create_users_table.php`

#### Service Layer Pattern
- Business logic in dedicated service classes
- Location: `app/Services/Core/` and `app/Services/Spark/`
- Example: `EventService`, `PermissionSlipService`

#### Dependency Injection
- Constructor injection for dependencies
- Use Laravel's service container
- Type-hint all dependencies

#### API Resources
- Use Eloquent API Resources for consistent JSON responses
- Location: `app/Http/Resources/Core/` and `app/Http/Resources/Spark/`

### Code Structure Example
```php
<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Services\Core\EventService;
use App\Http\Requests\Core\CreateEventRequest;
use App\Http\Resources\Core\EventResource;

class EventController extends Controller
{
    public function __construct(
        private EventService $eventService
    ) {}

    public function store(CreateEventRequest $request): EventResource
    {
        $event = $this->eventService->createEvent($request->validated());
        
        return new EventResource($event);
    }
}
```

## JavaScript (React Native/React.js) Standards

### ESLint Configuration
```json
{
  "extends": [
    "@react-native-community",
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Component Structure (Atomic Design)
- **Atoms**: Basic UI elements (`Button`, `Input`, `Text`)
- **Molecules**: Simple component combinations (`SearchBar`, `EventCard`)
- **Organisms**: Complex UI sections (`EventList`, `UserProfile`)
- **Templates**: Page layouts
- **Pages**: Complete screens

### Naming Conventions
- **Components**: PascalCase (`EventCard`, `UserProfile`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Hooks**: prefix with `use` (`useAuth`, `useEvents`)

### Folder Structure
```
src/
├── components/
│   ├── core/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   └── spark/
│       ├── atoms/
│       ├── molecules/
│       └── organisms/
├── screens/
│   ├── core/
│   └── spark/
├── hooks/
├── services/
├── utils/
└── types/
```

### TypeScript Usage
- Strict TypeScript configuration
- Define interfaces for all API responses
- Use proper typing for props and state

## Git Commit Message Convention

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Scopes
- **core**: Core Funlynk features
- **spark**: Funlynk Spark features
- **auth**: Authentication
- **api**: API changes
- **ui**: User interface
- **db**: Database changes

### Examples
```
feat(core): add event creation functionality

Implement event creation with location mapping and tag support.
Includes validation and image upload capabilities.

Closes #123

fix(spark): resolve permission slip email delivery issue

Update email service configuration to handle bulk notifications
for permission slip distribution.

Refs #456
```

## Code Quality Standards

### Testing Requirements
- Unit tests for all service classes
- Feature tests for API endpoints
- Component tests for React components
- Minimum 80% code coverage

### Documentation
- PHPDoc for all public methods
- JSDoc for complex functions
- README files for each major module
- API documentation using OpenAPI/Swagger

### Security Standards
- Input validation on all endpoints
- CSRF protection enabled
- Rate limiting on API endpoints
- Proper authentication and authorization
- SQL injection prevention (use Eloquent ORM)
- XSS protection

### Performance Guidelines
- Database query optimization
- Proper indexing strategy
- Image optimization and compression
- Lazy loading for mobile components
- API response caching where appropriate

## Development Workflow

### Branch Naming
- **Feature branches**: `feature/core-event-creation`
- **Bug fixes**: `fix/spark-permission-slip-email`
- **Hotfixes**: `hotfix/security-patch`

### Code Review Requirements
- All code must be reviewed before merging
- Automated tests must pass
- No direct commits to main branch
- Use pull request templates

### Environment Configuration
- Separate configurations for development, staging, production
- Environment variables for all sensitive data
- Docker containers for consistent development environment
