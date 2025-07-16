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

---

#### **PHASE 2: Services & Business Logic** (Auggie-2 Agent)
**Estimated Time**: 150 minutes  
**Status**: ASSIGNED TO AUGGIE-2

**Tasks:**
1. **PaymentService Implementation** (90 minutes)
   - Create `PaymentService` class
   - Implement `createEventPaymentIntent()` method
   - Implement `confirmPayment()` method
   - Implement `processRefund()` method
   - Implement `getUserPayments()` method
   - Add Stripe customer management

2. **StripeConnectService Implementation** (45 minutes)
   - Create `StripeConnectService` class
   - Implement Connect account creation
   - Implement onboarding link generation
   - Implement dashboard link generation
   - Implement earnings summary calculation

3. **StripeWebhookService Implementation** (15 minutes)
   - Create `StripeWebhookService` class
   - Implement webhook event handling
   - Add payment status synchronization

**Deliverables:**
- ✅ Complete payment processing logic
- ✅ Stripe Connect integration
- ✅ Webhook handling system

---

#### **PHASE 3: Controllers & API Endpoints** (Technical Lead Agent)
**Estimated Time**: 75 minutes  
**Status**: ASSIGNED TO TECHNICAL LEAD

**Tasks:**
1. **PaymentController Implementation** (45 minutes)
   - Create `PaymentController` with all endpoints
   - Implement payment intent creation
   - Implement payment confirmation
   - Implement payment history
   - Implement refund requests

2. **StripeConnectController Implementation** (30 minutes)
   - Create `StripeConnectController`
   - Implement account management endpoints
   - Implement onboarding and dashboard links
   - Implement earnings endpoints

**Deliverables:**
- ✅ Complete payment API endpoints
- ✅ Stripe Connect management API

---

#### **PHASE 4: Validation & Resources** (Auggie-2 Agent)
**Estimated Time**: 45 minutes  
**Status**: ASSIGNED TO AUGGIE-2

**Tasks:**
1. **Request Validation Classes** (30 minutes)
   - Create `ProcessPaymentRequest`
   - Create `CreateStripeAccountRequest`
   - Create `RefundRequest`

2. **API Resource Classes** (15 minutes)
   - Create `PaymentResource`
   - Create `StripeAccountResource`

**Deliverables:**
- ✅ Input validation for all payment endpoints
- ✅ Consistent API response formatting

---

#### **PHASE 5: Routes & Webhook Handler** (Technical Lead Agent)
**Estimated Time**: 30 minutes  
**Status**: ASSIGNED TO TECHNICAL LEAD

**Tasks:**
1. **API Routes Setup** (15 minutes)
   - Add payment routes to `routes/api/core.php`
   - Add Stripe Connect routes
   - Configure route middleware

2. **Webhook Controller** (15 minutes)
   - Create `StripeWebhookController`
   - Configure webhook signature verification
   - Add webhook route (outside auth middleware)

**Deliverables:**
- ✅ Complete API routing
- ✅ Secure webhook handling

---

#### **PHASE 6: Testing & Documentation** (Both Agents - Parallel)
**Estimated Time**: 60 minutes  
**Status**: ASSIGNED TO BOTH

**Technical Lead Tasks:**
- Create feature tests for payment endpoints
- Create unit tests for PaymentService
- Update API documentation

**Auggie-2 Tasks:**
- Create feature tests for Stripe Connect endpoints
- Create unit tests for StripeConnectService
- Create model factories for testing

**Deliverables:**
- ✅ Comprehensive test coverage
- ✅ Updated documentation

---

## 🔄 EXECUTION SEQUENCE

### **SEQUENTIAL PHASES** (No Conflicts)
1. **Phase 1** → Technical Lead (Foundation)
2. **Phase 2** → Auggie-2 (Services) 
3. **Phase 3** → Technical Lead (Controllers)
4. **Phase 4** → Auggie-2 (Validation)
5. **Phase 5** → Technical Lead (Routes)
6. **Phase 6** → Both Agents (Testing - Parallel)

### **DEPENDENCIES**
- Phase 2 requires Phase 1 completion (models needed for services)
- Phase 3 requires Phase 2 completion (services needed for controllers)
- Phase 4 can run parallel with Phase 3 (no conflicts)
- Phase 5 requires Phase 3 completion (controllers needed for routes)
- Phase 6 requires all previous phases (testing everything)

---

## 📁 FILE OWNERSHIP

### **Technical Lead Agent Files:**
- `config/services.php` (Stripe configuration)
- Database migrations (3 files)
- Model files (3 files)
- `PaymentController.php`
- `StripeConnectController.php`
- `StripeWebhookController.php`
- `routes/api/core.php` (payment routes)
- Feature tests for payment endpoints
- Unit tests for PaymentService

### **Auggie-2 Agent Files:**
- `PaymentService.php`
- `StripeConnectService.php`
- `StripeWebhookService.php`
- Request validation classes (3 files)
- API resource classes (2 files)
- Feature tests for Stripe Connect
- Unit tests for services
- Model factories

---

## 🚀 CURRENT STATUS

**NEXT ACTION**: Technical Lead Agent should begin Phase 1 (Foundation & Models)

**READY TO START**: ✅ All dependencies met (Core Social Features completed)

**COORDINATION**: Sequential execution prevents conflicts - each agent waits for previous phase completion before starting their assigned phase.

---

## 📋 DETAILED IMPLEMENTATION REFERENCE

### Key Features to Implement:

**Payment Processing:**
- Create payment intents for paid events
- Process payments with Stripe
- Handle payment confirmation
- Support saved payment methods
- Platform fee calculation and collection

**Stripe Connect Integration:**
- Create Connect accounts for hosts
- Onboarding flow for account setup
- Transfer payments to host accounts
- Dashboard access for hosts
- Account status monitoring

**Refund Management:**
- Process full and partial refunds
- Refund eligibility validation
- Automatic refund processing
- Refund status tracking

**Transaction Management:**
- Payment history for users
- Earnings summary for hosts
- Transaction status tracking
- Webhook event handling

---

## ✅ SUCCESS CRITERIA

### Functional Requirements
- [ ] Create payment intents for paid events
- [ ] Process payments with Stripe
- [ ] Handle payment confirmation
- [ ] Support saved payment methods
- [ ] Platform fee calculation and collection
- [ ] Create Connect accounts for hosts
- [ ] Onboarding flow for account setup
- [ ] Transfer payments to host accounts
- [ ] Dashboard access for hosts
- [ ] Account status monitoring
- [ ] Process full and partial refunds
- [ ] Refund eligibility validation
- [ ] Payment history for users
- [ ] Earnings summary for hosts
- [ ] Transaction status tracking
- [ ] Webhook event handling

### Technical Requirements
- [ ] Zero file conflicts between agents
- [ ] All API endpoints functional and tested
- [ ] Proper error handling and validation
- [ ] Secure webhook handling
- [ ] Database migrations run successfully
- [ ] Service registration working

### Quality Gates
- [ ] All existing tests continue to pass
- [ ] New code follows Laravel coding standards
- [ ] API responses are consistent
- [ ] Payment flows work end-to-end
- [ ] Stripe Connect onboarding works
- [ ] Webhook events processed correctly

---

## 🎯 READY TO START!

**Technical Lead**: Begin Phase 1 - Stripe configuration, migrations, and models
**Auggie-2**: Wait for Phase 1 completion, then begin Phase 2 - Services implementation

Reference specification: `/planning/execution-tasks/agent-2-core-backend/005_payment_integration.md`

*Let's build a comprehensive payment system with Stripe Connect integration!* 💳🚀

(TASK_ASSIGNED)
