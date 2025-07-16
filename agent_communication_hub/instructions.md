# Agent Communication Hub - Instructions

## Current Task: Payment Integration Implementation
**Status**: READY TO BEGIN
**Task**: Agent 2 Core Backend - Task 005: Payment Integration
**Estimated Time**: 4-5 hours
**Priority**: Medium
**Dependencies**: Core Social Features (COMPLETED ✅)

---

## WORK DISTRIBUTION PLAN

### 🎯 OBJECTIVE
Implement comprehensive Stripe Connect integration for event monetization including payment processing, payout management, and transaction tracking.

### 📋 TASK BREAKDOWN

#### **PHASE 1: Foundation & Models** (Technical Lead Agent)
**Estimated Time**: 90 minutes
**Status**: ASSIGNED TO TECHNICAL LEAD

**Tasks:**
1. **Stripe Configuration Setup** (15 minutes)
   - Install Stripe PHP SDK via Composer
   - Configure Stripe settings in `config/services.php`
   - Add environment variables template

2. **Database Migrations** (30 minutes)
   - Create `stripe_accounts` table migration
   - Create `payments` table migration
   - Create `payouts` table migration
   - Add Stripe customer ID to users table

3. **Core Models Implementation** (45 minutes)
   - Create `StripeAccount` model with relationships and accessors
   - Create `Payment` model with scopes and relationships
   - Create `Payout` model with status management
   - Update `User` model with Stripe relationships

**Deliverables:**
- ✅ Stripe SDK installed and configured
- ✅ Database schema for payment system
- ✅ Core payment models with proper relationships
6. **Service Registration**: Dependency injection setup for social services

#### 📋 Detailed Tasks
**Phase 1: Database Foundation (2 hours)**
- Create activity_feeds table migration (polymorphic relationships, activity types, privacy settings)
- Create direct_messages table migration (conversations, message threads, read status)
- Create friend_suggestions table migration (suggestion algorithms, scoring, dismissal tracking)
- Run migrations and verify schema with proper indexes

**Phase 2: Model Implementation (2 hours)**
- ActivityFeed model with polymorphic relationships (events, follows, comments)
- DirectMessage model with conversation threading and read status
- FriendSuggestion model with scoring algorithms and user preferences
- User model enhancements for social features

**Phase 3: Controller Architecture (2.5 hours)**
- ActivityFeedController: feed generation, filtering, privacy controls
- DirectMessageController: conversations, sending, reading, search
- SocialController: friend suggestions, mutual connections, social graph
- Proper validation, authorization, and error handling

**Phase 4: Routes & Resources (0.5 hours)**
- Social feature routes in core.php with authentication middleware
- Resource classes for consistent API responses
- Service registration in CoreServiceProvider

---

### 🚀 Auggie-2 Agent
**Task ID**: `social_features_services_auggie2`
**Estimated Hours**: 6-7
**Priority**: High

#### 📁 Your Files & Responsibilities
**Business Logic**:
- `app/Services/Core/ActivityFeedService.php` - Activity feed generation and filtering service
- `app/Services/Core/DirectMessageService.php` - Messaging service with real-time features
- `app/Services/Core/FriendSuggestionService.php` - Friend suggestion algorithms and scoring
- `app/Services/Core/SocialGraphService.php` - Social network analysis and connections

**Validation**:
- `app/Http/Requests/Core/CreateActivityRequest.php` - Activity creation validation
- `app/Http/Requests/Core/SendMessageRequest.php` - Direct message validation
- `app/Http/Requests/Core/UpdateFeedPreferencesRequest.php` - Feed customization validation

**Testing Suite**:
- `tests/Feature/Core/ActivityFeedApiTest.php` - Complete activity feed API testing
- `tests/Feature/Core/DirectMessageApiTest.php` - Messaging API workflow tests
- `tests/Feature/Core/SocialFeaturesApiTest.php` - Social features integration tests
- `tests/Unit/Core/ActivityFeedServiceTest.php` - Activity feed service unit tests
- `tests/Unit/Core/DirectMessageServiceTest.php` - Messaging service unit tests
- `tests/Unit/Core/FriendSuggestionServiceTest.php` - Friend suggestion algorithm tests

**Notification Integration**:
- Real-time notifications for messages, mentions, and social activities
- Push notification templates for mobile apps
- Email digest generation for activity summaries

#### 🎯 Your Deliverables
1. **Core Social Services**: ActivityFeedService, DirectMessageService, FriendSuggestionService, SocialGraphService
2. **Real-time Features**: WebSocket integration for live messaging and notifications
3. **Algorithm Implementation**: Friend suggestion algorithms with machine learning scoring
4. **Validation Layer**: Comprehensive request validation for all social operations
5. **Testing Suite**: 90%+ test coverage with feature and unit tests
6. **Notification System**: Real-time and batch notifications for social activities

#### 📋 Detailed Tasks
**Phase 1: Core Social Services (3 hours)**
- ActivityFeedService: Feed generation algorithms, privacy filtering, content ranking
- DirectMessageService: Message threading, conversation management, real-time delivery
- FriendSuggestionService: Mutual friends, interest-based suggestions, ML scoring
- SocialGraphService: Connection analysis, network effects, social metrics

**Phase 2: Real-time & Notifications (2 hours)**
- WebSocket integration for live messaging and activity updates
- Push notification service integration for mobile apps
- Email digest service for activity summaries and social updates
- Real-time presence and typing indicators

**Phase 3: Validation & Testing (2 hours)**
- Request validation classes with comprehensive social feature rules
- Feature tests covering all social API endpoints and workflows
- Unit tests for all service methods with proper mocking and edge cases
- Integration tests for real-time features and notification delivery

---

## 🔗 Integration Strategy

### How Our Work Connects
- **Technical Lead's controllers** → **Auggie-2's services** (dependency injection)
- **Technical Lead's models** → **Auggie-2's business logic** (data manipulation)
- **Technical Lead's routes** → **Auggie-2's validation** (request processing)
- **Technical Lead's resources** → **Auggie-2's service responses** (data transformation)

### Critical Integration Points
1. **Service Method Signatures**: Controllers expect specific social service methods
2. **Model Relationships**: Services use model relationships for social graph analysis
3. **Validation Rules**: Requests must match controller parameter expectations
4. **Real-time Integration**: WebSocket events triggered by service methods
5. **Notification Strategy**: Consistent notification approach across all social features

---

## ✅ Success Criteria

### Functional Requirements
- [ ] Activity feed with personalized content ranking and privacy controls
- [ ] Direct messaging with conversation threading and real-time delivery
- [ ] Friend suggestions based on mutual connections and interests
- [ ] Social graph analysis with connection recommendations
- [ ] Real-time notifications for messages, mentions, and social activities
- [ ] Privacy controls for all social features and content visibility
- [ ] Search functionality for messages, activities, and social connections
- [ ] Bulk operations for managing social connections and preferences

### Technical Requirements
- [ ] Zero file conflicts between agents
- [ ] All API endpoints functional and tested
- [ ] 90%+ test coverage on new code
- [ ] Proper error handling and validation
- [ ] Real-time features working with WebSocket integration
- [ ] Database migrations run successfully
- [ ] Service registration and dependency injection working

### Quality Gates
- [ ] All existing tests continue to pass
- [ ] New code follows Laravel coding standards
- [ ] API responses are consistent and well-formatted
- [ ] Real-time features perform well under load
- [ ] Privacy controls properly implemented and tested
- [ ] Social algorithms provide relevant suggestions

---

## 🚨 Conflict Prevention

### File Boundaries (STRICT)
**Technical Lead ONLY**:
- All files in `backend/database/migrations/`
- All files in `backend/app/Models/Core/`
- All files in `backend/app/Http/Controllers/`
- All files in `backend/app/Http/Resources/`
- Route files (`backend/routes/api/core.php`)
- Service provider (`backend/app/Providers/CoreServiceProvider.php`)

**Auggie-2 ONLY**:
- All files in `app/Services/Core/`
- All files in `app/Http/Requests/Core/`
- All files in `tests/`
- Notification template integration

### Communication Protocol
- Update status in `agent_communication_hub/agents/{agent}/current_focus.md`
- No direct file editing of partner's files
- Report completion when all deliverables are done
- Ask for help if blocked or confused

---

## 📊 Progress Tracking

### Phase 1: Foundation (Hours 1-4)
- Technical Lead: Database migrations and models
- Auggie-2: Core social service implementation

### Phase 2: API Layer (Hours 5-9)
- Technical Lead: Controllers and routes
- Auggie-2: Real-time features and notification systems

### Phase 3: Integration (Hours 10-12)
- Technical Lead: Resources and service registration
- Auggie-2: Validation and comprehensive testing

### Phase 4: Validation (Hours 13-14)
- Both: Integration testing and real-time feature validation
- Both: Documentation and completion reporting

---

## 🎯 Ready to Start!

**Technical Lead**: Begin with database migrations for activity feeds, direct messages, and friend suggestions
**Auggie-2**: Start with ActivityFeedService core implementation

Reference specification: `/planning/execution-tasks/agent-2-core-backend/004_social_features_api.md`

*Let's build a comprehensive social platform with activity feeds, messaging, and intelligent friend suggestions!* 🚀

(TASK_ASSIGNED)
