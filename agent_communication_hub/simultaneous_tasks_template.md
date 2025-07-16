# Simultaneous Task Assignment Template

## Format for Technical Lead to Create Parallel Tasks

### Human Request Processing
When processing human input, create **two complementary tasks** that can be executed simultaneously without conflicts.

### Task Assignment Format

```markdown
# Simultaneous Task Assignment
**Date**: [Date]
**Human Request**: [Summary of human request]
**Estimated Total Time**: [X-Y hours]

## Task Breakdown Strategy
**Approach**: [Brief explanation of how work is divided]
**Integration Point**: [How the work will come together]

---

## Technical Lead Task
**Task ID**: [unique_id]_lead
**Assigned To**: Technical Lead (VS Code Agent)
**Priority**: [High/Medium/Low]
**Estimated Hours**: [X-Y]

### Scope
**Files/Directories**: 
- [Specific files or directories to work on]
- [Another file/directory]

**Responsibilities**:
- [Specific responsibility 1]
- [Specific responsibility 2]

### Deliverables
- [Deliverable 1]
- [Deliverable 2]

### Coding Standards
[Reference to specific standards section]

### Dependencies
- [Any dependencies or prerequisites]

---

## Warp Agent Task  
**Task ID**: [unique_id]_warp
**Assigned To**: Warp Agent (Senior Developer)
**Priority**: [High/Medium/Low]
**Estimated Hours**: [X-Y]

### Scope
**Files/Directories**:
- [Specific files or directories to work on]
- [Another file/directory]

**Responsibilities**:
- [Specific responsibility 1] 
- [Specific responsibility 2]

### Deliverables
- [Deliverable 1]
- [Deliverable 2]

### Coding Standards
[Reference to specific standards section]

### Dependencies
- [Any dependencies or prerequisites]

---

## Integration Notes
**How work combines**: [Explanation of how both tasks integrate]
**Coordination points**: [Any points where agents need to coordinate]
**Testing strategy**: [How testing will be handled across both tasks]

---

## Success Criteria
- [ ] Both tasks completed without file conflicts
- [ ] Code integrates properly
- [ ] All tests pass
- [ ] Coding standards followed
- [ ] Documentation updated

(SIMULTANEOUS_TASKS_ASSIGNED)
```

## Example: Laravel Authentication System

```markdown
# Simultaneous Task Assignment
**Date**: 2025-01-16
**Human Request**: Set up Laravel authentication system with JWT
**Estimated Total Time**: 8-10 hours

## Task Breakdown Strategy
**Approach**: Technical Lead handles architecture/controllers, Warp Agent handles services/tests
**Integration Point**: AuthController will use AuthService, both will be tested together

---

## Technical Lead Task
**Task ID**: auth_system_lead
**Assigned To**: Technical Lead (VS Code Agent)
**Priority**: High
**Estimated Hours**: 4-5

### Scope
**Files/Directories**: 
- `app/Http/Controllers/Auth/AuthController.php`
- `app/Http/Middleware/JWTAuth.php`
- `routes/api.php` (auth routes)
- `config/auth.php` (configuration)

**Responsibilities**:
- Create main AuthController with login/logout endpoints
- Implement JWT authentication middleware
- Set up authentication routes
- Configure JWT settings

### Deliverables
- AuthController with login/logout methods
- JWT middleware implementation
- API routes for authentication
- Configuration files updated

### Coding Standards
php_laravel_standards (PSR-12, service layer pattern)

### Dependencies
- Laravel project initialized
- JWT package installed

---

## Warp Agent Task  
**Task ID**: auth_system_warp
**Assigned To**: Warp Agent (Senior Developer)
**Priority**: High
**Estimated Hours**: 4-5

### Scope
**Files/Directories**:
- `app/Services/Core/AuthService.php`
- `app/Http/Requests/Auth/LoginRequest.php`
- `app/Http/Requests/Auth/RegisterRequest.php`
- `tests/Feature/AuthControllerTest.php`
- `tests/Unit/AuthServiceTest.php`

**Responsibilities**:
- Implement AuthService business logic
- Create form request validation classes
- Write comprehensive tests for authentication
- Handle password reset functionality

### Deliverables
- AuthService with authentication business logic
- Form request validation classes
- Unit and feature tests (80%+ coverage)
- Password reset implementation

### Coding Standards
php_laravel_standards (PSR-12, dependency injection, testing)

### Dependencies
- AuthController structure from Technical Lead
- JWT middleware available

---

## Integration Notes
**How work combines**: AuthController will inject and use AuthService methods
**Coordination points**: AuthService public method signatures must match controller expectations
**Testing strategy**: Feature tests will test full flow, unit tests will test service logic

---

## Success Criteria
- [ ] AuthController and AuthService integrate seamlessly
- [ ] All authentication endpoints work
- [ ] Tests pass with 80%+ coverage
- [ ] JWT tokens generated and validated correctly
- [ ] Password reset functionality works
```
