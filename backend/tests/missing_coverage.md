# Missing Coverage Details

**Generated:** 2025-07-14  
**Total Tests:** 150 tests (41 passing, 109 failing due to setup issues)

## Test Coverage Summary
- **Classes:** 1.10% (1/91)
- **Methods:** 2.12% (17/802)
- **Lines:** 2.55% (185/7267)

## Controllers Below 90% Coverage (Need Tests)

### Auth Controllers
- **AuthController** - NO TESTS (8 endpoints)
  - login, register, forgotPassword, resetPassword, me, logout, logoutAll, refresh
  - Status: ❌ **NEEDS TESTING**

### Core Controllers
- **UserController** - NO TESTS (11 endpoints)
  - profile, updateProfile, interests, updateInterests, search, follow, unfollow, followStatus, show, followers, following
  - Status: ❌ **NEEDS TESTING**

- **EventController** - NO TESTS (12 endpoints)
  - index, store, search, categories, myHostedEvents, myAttendedEvents, show, update, destroy, rsvp, cancelRsvp, attendees
  - Status: ❌ **NEEDS TESTING**

- **EventCommentController** - NO TESTS (9 endpoints)
  - index, store, show, update, destroy, reply, replies, approve, disapprove
  - Status: ❌ **NEEDS TESTING**

- **EventInteractionController** - NO TESTS (10 endpoints)
  - share, shareStats, generateQrCode, checkIn, checkOut, checkInStats, analytics, nearbyEvents, recommendations
  - Status: ❌ **NEEDS TESTING**

### Spark Controllers
- **DistrictController** - NO TESTS (11 endpoints)
  - index, store, show, update, destroy, activate, deactivate, statistics, schools, users
  - Status: ❌ **NEEDS TESTING**

- **SchoolController** - NO TESTS (12 endpoints)
  - index, store, show, update, destroy, activate, deactivate, statistics, programs, administrators, addAdministrator, removeAdministrator
  - Status: ❌ **NEEDS TESTING**

- **ProgramController** - NO TESTS (15 endpoints)
  - index, store, show, update, destroy, availability, addAvailability, updateAvailability, deleteAvailability, activate, deactivate, statistics
  - Status: ❌ **NEEDS TESTING**

- **CharacterTopicController** - NO TESTS (9 endpoints)
  - index, store, show, update, destroy, programs, activate, deactivate, categories
  - Status: ❌ **NEEDS TESTING**

- **ProgramAvailabilityController** - NO TESTS (8 endpoints)
  - index, store, show, update, destroy, programAvailability, bulkCreate, statistics
  - Status: ❌ **NEEDS TESTING**

- **BookingController** - NO TESTS (11 endpoints)
  - index, store, show, update, confirm, cancel, complete, students, addStudents, statistics
  - Status: ❌ **NEEDS TESTING**

## Service Classes Below 90% Coverage

### Critical Service Coverage Issues
- **CharacterTopicService** - 4.76% methods, 0.43% lines
- **NotificationService** - 10.00% methods, 0.86% lines
- **ProgramService** - 3.70% methods, 0.28% lines

## Request Classes (Well Tested) ✅
- **CreateCharacterTopicRequest** - 40% methods, 45% lines ✅ **DONE**
- **UpdateCharacterTopicRequest** - 40% methods, 63% lines ✅ **DONE**
- **UpdateProgramRequest** - 40% methods, 80% lines ✅ **DONE**
- **CreateProgramRequest** - 60% methods, 68% lines ✅ **DONE**

## Critical Issues to Address
1. **Test Setup Problems:**
   - `RoleAlreadyExists` exceptions in 109 tests
   - Missing database tables (`program_character_topics`)
   - Factory method issues for some models

2. **Missing Test Structure:**
   - No Feature tests for any controllers
   - No Unit tests for controller methods
   - No Integration tests for API endpoints

## Recommendations
1. **Fix Test Environment Setup** (Priority 1)
   - Resolve role creation conflicts
   - Ensure all database tables exist
   - Fix factory definitions

2. **Create Controller Tests** (Priority 2)
   - Start with Auth controllers (most critical)
   - Add CRUD tests for all Spark controllers
   - Add Feature tests for Core controllers

3. **Improve Service Coverage** (Priority 3)
   - Focus on CharacterTopicService, ProgramService, NotificationService
   - Add unit tests for business logic methods
   - Test error handling and edge cases

