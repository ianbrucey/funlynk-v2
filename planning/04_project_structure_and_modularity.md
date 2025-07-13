# Project Structure & Modularity
## Funlynk & Funlynk Spark MVP

### Overview
This document defines the complete folder structure and modularity approach for the project, enabling parallel development across multiple agents.

## Root Project Structure

```
funlynk-v2/
├── backend/                    # Laravel API Backend
├── mobile/                     # React Native Mobile App
├── web-admin/                  # React.js Web Admin Interface (Spark)
├── shared/                     # Shared resources and documentation
├── docker/                     # Docker configuration files
├── docs/                       # Project documentation
├── planning/                   # Planning documents (current folder)
└── scripts/                    # Deployment and utility scripts
```

## Backend Structure (Laravel)

```
backend/
├── app/
│   ├── Console/
│   ├── Exceptions/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Core/           # Core Funlynk controllers
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── EventController.php
│   │   │   │   ├── UserController.php
│   │   │   │   └── SocialController.php
│   │   │   ├── Spark/          # Spark-specific controllers
│   │   │   │   ├── ProgramController.php
│   │   │   │   ├── SchoolController.php
│   │   │   │   ├── BookingController.php
│   │   │   │   └── PermissionSlipController.php
│   │   │   └── Admin/          # Admin panel controllers
│   │   ├── Middleware/
│   │   ├── Requests/
│   │   │   ├── Core/           # Core validation requests
│   │   │   └── Spark/          # Spark validation requests
│   │   └── Resources/
│   │       ├── Core/           # Core API resources
│   │       └── Spark/          # Spark API resources
│   ├── Models/
│   │   ├── Core/               # Core models
│   │   │   ├── User.php
│   │   │   ├── Event.php
│   │   │   ├── EventAttendee.php
│   │   │   └── UserFollow.php
│   │   ├── Spark/              # Spark models
│   │   │   ├── District.php
│   │   │   ├── School.php
│   │   │   ├── SparkProgram.php
│   │   │   ├── Student.php
│   │   │   ├── TripBooking.php
│   │   │   └── PermissionSlip.php
│   │   └── Shared/             # Shared models
│   │       └── Notification.php
│   ├── Services/
│   │   ├── Core/               # Core business logic
│   │   │   ├── EventService.php
│   │   │   ├── UserService.php
│   │   │   └── SocialService.php
│   │   ├── Spark/              # Spark business logic
│   │   │   ├── ProgramService.php
│   │   │   ├── BookingService.php
│   │   │   ├── PermissionSlipService.php
│   │   │   └── StudentRosterService.php
│   │   └── Shared/             # Shared services
│   │       ├── NotificationService.php
│   │       ├── EmailService.php
│   │       └── FileUploadService.php
│   ├── Repositories/
│   │   ├── Core/
│   │   ├── Spark/
│   │   └── Contracts/          # Repository interfaces
│   └── Providers/
├── bootstrap/
├── config/
├── database/
│   ├── factories/
│   ├── migrations/
│   │   ├── core/               # Core-related migrations
│   │   ├── spark/              # Spark-related migrations
│   │   └── shared/             # Shared migrations
│   └── seeders/
├── public/
├── resources/
│   ├── lang/
│   └── views/
├── routes/
│   ├── api.php                 # Main API routes
│   ├── core.php               # Core-specific routes
│   ├── spark.php              # Spark-specific routes
│   └── web.php                # Web routes (admin panel)
├── storage/
├── tests/
│   ├── Feature/
│   │   ├── Core/
│   │   └── Spark/
│   └── Unit/
│       ├── Core/
│       └── Spark/
├── vendor/
├── .env.example
├── composer.json
├── phpunit.xml
└── README.md
```

## Mobile App Structure (React Native)

```
mobile/
├── src/
│   ├── components/
│   │   ├── core/               # Core Funlynk components
│   │   │   ├── atoms/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── Avatar.tsx
│   │   │   ├── molecules/
│   │   │   │   ├── EventCard.tsx
│   │   │   │   ├── UserCard.tsx
│   │   │   │   └── SearchBar.tsx
│   │   │   └── organisms/
│   │   │       ├── EventList.tsx
│   │   │       ├── UserProfile.tsx
│   │   │       └── EventForm.tsx
│   │   ├── spark/              # Spark-specific components
│   │   │   ├── atoms/
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   └── GradeSelector.tsx
│   │   │   ├── molecules/
│   │   │   │   ├── ProgramCard.tsx
│   │   │   │   ├── StudentCard.tsx
│   │   │   │   └── PermissionSlipForm.tsx
│   │   │   └── organisms/
│   │   │       ├── ProgramList.tsx
│   │   │       ├── StudentRoster.tsx
│   │   │       └── TripDashboard.tsx
│   │   └── shared/             # Shared components
│   │       ├── atoms/
│   │       ├── molecules/
│   │       └── organisms/
│   ├── screens/
│   │   ├── core/               # Core app screens
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── RegisterScreen.tsx
│   │   │   │   └── ForgotPasswordScreen.tsx
│   │   │   ├── events/
│   │   │   │   ├── EventListScreen.tsx
│   │   │   │   ├── EventDetailScreen.tsx
│   │   │   │   └── CreateEventScreen.tsx
│   │   │   ├── profile/
│   │   │   │   ├── ProfileScreen.tsx
│   │   │   │   ├── EditProfileScreen.tsx
│   │   │   │   └── SettingsScreen.tsx
│   │   │   └── social/
│   │   │       ├── FeedScreen.tsx
│   │   │       ├── FollowersScreen.tsx
│   │   │       └── MessagesScreen.tsx
│   │   ├── spark/              # Spark app screens
│   │   │   ├── teacher/
│   │   │   │   ├── TeacherDashboardScreen.tsx
│   │   │   │   ├── ClassManagementScreen.tsx
│   │   │   │   ├── TripBookingScreen.tsx
│   │   │   │   └── AttendanceScreen.tsx
│   │   │   ├── parent/
│   │   │   │   ├── PermissionSlipScreen.tsx
│   │   │   │   ├── TripDetailsScreen.tsx
│   │   │   │   └── NotificationsScreen.tsx
│   │   │   └── admin/
│   │   │       ├── SchoolDashboardScreen.tsx
│   │   │       └── ReportsScreen.tsx
│   │   └── shared/             # Shared screens
│   │       ├── SplashScreen.tsx
│   │       ├── OnboardingScreen.tsx
│   │       └── ErrorScreen.tsx
│   ├── navigation/
│   │   ├── CoreNavigator.tsx
│   │   ├── SparkNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── RootNavigator.tsx
│   ├── services/
│   │   ├── api/
│   │   │   ├── core/
│   │   │   │   ├── authApi.ts
│   │   │   │   ├── eventsApi.ts
│   │   │   │   └── usersApi.ts
│   │   │   ├── spark/
│   │   │   │   ├── programsApi.ts
│   │   │   │   ├── bookingsApi.ts
│   │   │   │   └── permissionSlipsApi.ts
│   │   │   └── shared/
│   │   │       ├── httpClient.ts
│   │   │       └── apiConfig.ts
│   │   ├── storage/
│   │   │   ├── secureStorage.ts
│   │   │   └── asyncStorage.ts
│   │   └── notifications/
│   │       ├── pushNotifications.ts
│   │       └── localNotifications.ts
│   ├── hooks/
│   │   ├── core/
│   │   │   ├── useAuth.ts
│   │   │   ├── useEvents.ts
│   │   │   └── useUsers.ts
│   │   ├── spark/
│   │   │   ├── usePrograms.ts
│   │   │   ├── useBookings.ts
│   │   │   └── usePermissionSlips.ts
│   │   └── shared/
│   │       ├── useApi.ts
│   │       ├── useLocation.ts
│   │       └── useNotifications.ts
│   ├── store/
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── eventsSlice.ts
│   │   │   ├── sparkSlice.ts
│   │   │   └── uiSlice.ts
│   │   ├── middleware/
│   │   └── store.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   ├── types/
│   │   ├── core/
│   │   ├── spark/
│   │   └── shared/
│   └── assets/
│       ├── images/
│       ├── icons/
│       └── fonts/
├── android/
├── ios/
├── __tests__/
├── .env.example
├── package.json
├── metro.config.js
├── babel.config.js
└── README.md
```

## Web Admin Structure (React.js)

```
web-admin/
├── public/
├── src/
│   ├── components/
│   │   ├── common/             # Shared components
│   │   │   ├── Layout/
│   │   │   ├── Forms/
│   │   │   └── Tables/
│   │   ├── spark/              # Spark-specific components
│   │   │   ├── Programs/
│   │   │   ├── Schools/
│   │   │   ├── Bookings/
│   │   │   └── Reports/
│   │   └── admin/              # Admin panel components
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── programs/
│   │   ├── schools/
│   │   ├── bookings/
│   │   └── reports/
│   ├── services/
│   │   ├── api/
│   │   ├── auth/
│   │   └── utils/
│   ├── hooks/
│   ├── store/
│   ├── utils/
│   ├── types/
│   └── styles/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Shared Resources

```
shared/
├── docs/
│   ├── api/                    # API documentation
│   ├── deployment/             # Deployment guides
│   └── user-guides/            # User documentation
├── assets/
│   ├── images/                 # Shared images
│   ├── icons/                  # Icon sets
│   └── branding/               # Brand assets
├── configs/
│   ├── eslint/                 # Shared ESLint configs
│   ├── prettier/               # Shared Prettier configs
│   └── typescript/             # Shared TypeScript configs
└── types/
    ├── api.ts                  # Shared API types
    ├── core.ts                 # Core domain types
    └── spark.ts                # Spark domain types
```

## Development Environment

```
docker/
├── development/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.web-admin
│   └── nginx.conf
├── production/
│   ├── docker-compose.prod.yml
│   └── kubernetes/
└── scripts/
    ├── setup.sh
    ├── migrate.sh
    └── seed.sh
```

## Modularity Principles

### Core vs Spark Separation
- **Clear namespace separation** in all layers
- **Shared components** in dedicated folders
- **Independent routing** for each module
- **Separate API endpoints** with clear prefixes

### Component Reusability
- **Atomic design** for component hierarchy
- **Shared UI components** in common folders
- **Consistent prop interfaces** across modules
- **Theme-based styling** for consistency

### Service Layer Separation
- **Domain-specific services** for business logic
- **Shared utilities** for common functionality
- **Repository pattern** for data access
- **Interface-based** dependency injection

### Testing Structure
- **Mirror source structure** in test folders
- **Separate test suites** for Core and Spark
- **Shared test utilities** and fixtures
- **Integration tests** for cross-module functionality

## Agent Assignment Strategy

### Backend Agent Areas
1. **Core API Development**: Core controllers, services, models
2. **Spark API Development**: Spark controllers, services, models
3. **Shared Infrastructure**: Auth, notifications, file handling

### Frontend Agent Areas
1. **Core Mobile UI**: Core screens and components
2. **Spark Mobile UI**: Spark screens and components
3. **Web Admin Interface**: React.js admin panel
4. **Shared Components**: Common UI elements and utilities

### DevOps Agent Areas
1. **Infrastructure Setup**: Docker, CI/CD, deployment
2. **Database Management**: Migrations, seeding, optimization
3. **Testing Framework**: Test setup, automation, coverage

This structure ensures that multiple agents can work simultaneously without conflicts while maintaining clear separation of concerns and enabling code reuse where appropriate.
