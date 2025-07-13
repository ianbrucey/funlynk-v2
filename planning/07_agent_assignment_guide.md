# Agent Assignment Guide
## Funlynk & Funlynk Spark MVP

### Overview
This document provides specific guidance for each development agent, including their responsibilities, dependencies, and coordination requirements.

## Agent 1: Backend Foundation & Infrastructure Lead

### Primary Responsibilities
- Laravel project setup and configuration
- Authentication and authorization system
- Database schema implementation
- Shared services (file upload, email, SMS, notifications)
- API foundation and standards
- Error handling and logging implementation

### Key Deliverables
1. **Fully configured Laravel backend** with proper folder structure
2. **Complete authentication system** using Laravel Sanctum
3. **Database schema** with all tables, relationships, and indexes
4. **Shared service layer** for common functionality
5. **API foundation** with consistent response formats and error handling
6. **Documentation** for API standards and backend architecture

### Dependencies
- **None** - Can start immediately with planning documents
- Must coordinate with other agents on API contracts

### Coordination Points
- **Daily standups** with all backend agents (Agent 2 & 3)
- **API contract reviews** with frontend agents (Agent 4, 5, 6, 7)
- **Database schema validation** with all agents
- **Authentication flow coordination** with mobile and web teams

### Success Criteria
- [ ] Laravel backend running with all core services
- [ ] Authentication endpoints working and tested
- [ ] Database fully migrated and seeded
- [ ] Shared services operational (email, file upload, etc.)
- [ ] API documentation complete and accessible
- [ ] Error handling and logging functional

---

## Agent 2: Core Funlynk Backend Developer

### Primary Responsibilities
- Core Funlynk API development (events, users, social features)
- User management and profile system
- Event creation, management, and discovery
- Social features (following, feed, messaging)
- Payment integration with Stripe Connect

### Key Deliverables
1. **User Management API** - Complete CRUD operations for user profiles
2. **Event Management API** - Full event lifecycle management
3. **Event Interaction API** - RSVP, comments, sharing functionality
4. **Social Features API** - Following system, feed generation, messaging
5. **Payment Integration** - Stripe Connect for event monetization

### Dependencies
- **Agent 1**: Authentication system, database schema, shared services
- **Agent 4**: API contracts validation with mobile team
- **Agent 5**: Coordination on Core mobile UI requirements

### Coordination Points
- **Weekly API reviews** with Agent 1 for consistency
- **Bi-weekly demos** with Agent 5 (Core Mobile UI)
- **Payment integration testing** with Agent 1's shared services
- **Performance optimization** coordination with Agent 1

### Success Criteria
- [ ] All Core API endpoints implemented and tested
- [ ] User management system fully functional
- [ ] Event system supporting full lifecycle
- [ ] Social features operational
- [ ] Payment integration working end-to-end
- [ ] API performance meeting requirements (<500ms response time)

---

## Agent 3: Spark Backend Developer

### Primary Responsibilities
- Spark-specific API development
- School and district management system
- Field trip program management
- Booking and enrollment system
- Permission slip digital workflow
- Reporting and analytics

### Key Deliverables
1. **School Management API** - District, school, and user management
2. **Program Management API** - Field trip programs and availability
3. **Class and Student Management API** - Roster management and CSV import
4. **Booking Management API** - Trip booking and enrollment system
5. **Permission Slip System** - Digital signature workflow
6. **Reporting and Analytics** - Comprehensive reporting system

### Dependencies
- **Agent 1**: Authentication system, database schema, shared services
- **Agent 6**: API contracts validation with Spark mobile team
- **Agent 7**: Coordination on web admin interface requirements

### Coordination Points
- **Weekly API reviews** with Agent 1 for consistency
- **Bi-weekly demos** with Agent 6 (Spark Mobile UI) and Agent 7 (Web Admin)
- **Permission slip workflow testing** with Agent 1's email/SMS services
- **Reporting requirements** coordination with Agent 7

### Success Criteria
- [ ] All Spark API endpoints implemented and tested
- [ ] School management system operational
- [ ] Program management with availability tracking
- [ ] Booking system handling full workflow
- [ ] Permission slip system with digital signatures
- [ ] Reporting system generating required reports

---

## Agent 4: Mobile App Foundation Developer

### Primary Responsibilities
- React Native project setup and configuration
- Navigation system implementation
- State management setup (Redux Toolkit)
- Shared component library
- API integration layer
- Authentication flow implementation

### Key Deliverables
1. **React Native Project Setup** - Fully configured development environment
2. **Navigation System** - Complete navigation structure for Core and Spark
3. **State Management** - Redux store with authentication and API slices
4. **Shared Component Library** - Reusable UI components following design system
5. **API Integration Layer** - HTTP client with error handling and interceptors
6. **Authentication Flow** - Login, registration, and session management

### Dependencies
- **Agent 1**: Basic API contracts and authentication endpoints
- **Planning documents**: API contracts and component specifications

### Coordination Points
- **Daily coordination** with Agent 5 and Agent 6 on component library
- **Weekly API integration reviews** with backend agents
- **Design system validation** with all frontend agents
- **Navigation flow coordination** with Agent 5 and Agent 6

### Success Criteria
- [ ] React Native app running on iOS and Android
- [ ] Navigation system supporting both Core and Spark flows
- [ ] State management operational with persistence
- [ ] Shared component library documented and tested
- [ ] API integration working with authentication
- [ ] Development environment fully documented

---

## Agent 5: Core Mobile UI Developer

### Primary Responsibilities
- Core Funlynk mobile screens and features
- Event management user interface
- User profile and social features
- Event discovery and interaction
- Payment flow implementation

### Key Deliverables
1. **Authentication Screens** - Login, registration, onboarding
2. **Event Management Screens** - List, detail, create/edit, search, map, calendar
3. **User Profile Screens** - Profile, edit, settings, following, activity
4. **Social Features** - Feed, messaging, notifications, friend suggestions
5. **Event Interaction Features** - RSVP, comments, sharing, QR codes, check-in

### Dependencies
- **Agent 4**: Mobile foundation, navigation, shared components
- **Agent 2**: Core API endpoints and functionality
- **Agent 1**: Authentication system

### Coordination Points
- **Daily coordination** with Agent 4 on shared components
- **Bi-weekly API integration** with Agent 2
- **Weekly UI/UX reviews** with Agent 6 for consistency
- **Payment flow testing** with Agent 2's Stripe integration

### Success Criteria
- [ ] All Core mobile screens implemented and functional
- [ ] Event management workflow complete
- [ ] User profile and social features operational
- [ ] Event discovery and interaction working
- [ ] Payment flow integrated and tested
- [ ] UI/UX consistent with design system

---

## Agent 6: Spark Mobile UI Developer

### Primary Responsibilities
- Spark mobile screens for teachers, parents, and administrators
- Teacher dashboard and class management
- Parent permission slip interface
- Attendance tracking and check-in
- School admin functionality

### Key Deliverables
1. **Teacher Dashboard** - Dashboard, class management, roster, booking, permission tracking, attendance
2. **Parent Interface** - Permission slip signing, trip details, student info, notifications, emergency contacts
3. **School Admin Interface** - Dashboard, teacher management, reporting, program overview, approvals
4. **Attendance and Check-in** - Student check-in, QR scanning, attendance reporting, emergency contacts

### Dependencies
- **Agent 4**: Mobile foundation, navigation, shared components
- **Agent 3**: Spark API endpoints and functionality
- **Agent 1**: Authentication system

### Coordination Points
- **Daily coordination** with Agent 4 on shared components
- **Bi-weekly API integration** with Agent 3
- **Weekly UI/UX reviews** with Agent 5 for consistency
- **Permission slip workflow testing** with Agent 3

### Success Criteria
- [ ] All Spark mobile screens implemented and functional
- [ ] Teacher workflow complete and tested
- [ ] Parent permission slip process operational
- [ ] Attendance tracking system working
- [ ] School admin functionality complete
- [ ] Offline functionality for attendance tracking

---

## Agent 7: Web Admin Interface Developer

### Primary Responsibilities
- React.js web admin interface for Spark management
- Program management interface
- School and district administration
- Booking and trip management
- Reporting and analytics dashboard

### Key Deliverables
1. **Admin Dashboard** - Main dashboard with metrics, program management, school/district management, user management, settings, analytics
2. **Program Management** - Creation/editing forms, character topic management, availability slots, resource uploads, preview/testing
3. **Booking and Trip Management** - Booking overview, trip scheduling, capacity management, approvals, status tracking, communication
4. **Reporting Interface** - Report generation, data visualization, export functionality, custom reports, scheduled reports

### Dependencies
- **Agent 3**: Spark API endpoints and functionality
- **Agent 1**: Authentication system and shared services

### Coordination Points
- **Bi-weekly API integration** with Agent 3
- **Weekly progress reviews** with Agent 3 on reporting requirements
- **UI/UX consistency** coordination with mobile agents
- **Admin workflow validation** with stakeholders

### Success Criteria
- [ ] Web admin interface fully functional
- [ ] Program management workflow complete
- [ ] Booking and trip management operational
- [ ] Reporting system generating all required reports
- [ ] Admin dashboard providing comprehensive overview
- [ ] Export functionality working for all reports

---

## Cross-Agent Coordination

### Daily Standups
- **Time**: 9:00 AM EST
- **Participants**: All agents
- **Duration**: 15 minutes
- **Format**: Progress, blockers, dependencies

### Weekly Integration Reviews
- **Time**: Fridays 2:00 PM EST
- **Participants**: All agents
- **Duration**: 60 minutes
- **Focus**: API integration, cross-module testing, issue resolution

### Bi-weekly Demos
- **Time**: Every other Wednesday 3:00 PM EST
- **Participants**: All agents + stakeholders
- **Duration**: 90 minutes
- **Focus**: Feature demonstrations, feedback collection, planning adjustments

### Communication Channels
- **Slack**: #funlynk-development (general), #backend-team, #frontend-team
- **GitHub**: Issue tracking, pull requests, code reviews
- **Confluence**: Documentation, meeting notes, decisions
- **Zoom**: Video calls for complex discussions

### Code Review Process
- **All pull requests** require review from at least one other agent
- **Cross-module changes** require review from affected module owners
- **API changes** require review from all dependent agents
- **Database changes** require review from Agent 1

### Integration Testing Schedule
- **Week 4**: Backend foundation integration
- **Week 6**: Core API integration testing
- **Week 8**: Spark API integration testing
- **Week 10**: Mobile app integration testing
- **Week 12**: Full system integration testing
- **Week 14**: User acceptance testing and bug fixes
