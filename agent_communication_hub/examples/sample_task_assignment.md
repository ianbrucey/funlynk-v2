# Sample Task Assignment Example

This document demonstrates how the Technical Lead would assign a task to the Warp Agent using the communication system.

## Example: Assigning Laravel Authentication Setup

### Step 1: Technical Lead Updates instructions.md

```markdown
# Agent Communication Hub - Instructions
**Technical Lead Communication Center**  
**Last Updated**: 2025-01-16 14:30:00  
**Status**: Active  

## 🎯 Current Mission
Starting Funlynk V2 development with Agent 1 Backend Foundation tasks.

## 📝 Task Queue

### Task Assignment: Laravel Authentication Setup

```json
{
  "task_id": "auth_setup_001",
  "assigned_to": "warp_agent",
  "priority": "high",
  "estimated_hours": "6-7",
  "dependencies": ["laravel_project_init"],
  "description": "Implement Laravel authentication system with JWT tokens, user registration, login, and password reset functionality",
  "deliverables": [
    "JWT authentication middleware",
    "User registration API endpoint",
    "Login/logout API endpoints", 
    "Password reset functionality",
    "Unit tests for auth system",
    "API documentation"
  ],
  "coding_standards": "php_laravel_standards",
  "context": "This is part of Agent 1 Task 002 from the execution plan. Follow PSR-12 standards and implement service layer pattern. Reference /planning/execution-tasks/agent-1-backend-foundation/002_authentication_system_setup.md for detailed requirements."
}
```

### Instructions for Warp Agent:
1. Review the detailed task specification in `/planning/execution-tasks/agent-1-backend-foundation/002_authentication_system_setup.md`
2. Follow coding standards in `/planning/01_coding_standards_and_style_guide.md`
3. Update your status to 'working' when you start
4. Create the authentication system following Laravel best practices
5. Ensure all tests pass before marking complete
6. Update progress in your agent files

(TASK_ASSIGNED)

---

## 💬 Agent Communication
*Warp agent can respond here with questions or status updates*

---

(COMMUNICATION_OVER)
```

### Step 2: Warp Agent Response Process

1. **Agent Monitor Detects Change**: The `agent_monitor.py` script detects the file change
2. **Task Parsing**: Extracts the JSON task assignment
3. **Status Update**: Updates `agent_status.json` to show 'working' status
4. **Focus Update**: Updates `agents/warp_agent/current_focus.md` with task details
5. **Standards Check**: Reviews coding standards and pre-task checklist

### Step 3: Warp Agent Updates Current Focus

```markdown
# Warp Agent - Current Focus
**Agent**: Warp Agent  
**Last Updated**: 2025-01-16 14:35:00  
**Status**: Working  

## 🎯 Current Task
**Task ID**: auth_setup_001  
**Priority**: High  
**Started**: 2025-01-16 14:35:00  
**Estimated Completion**: 2025-01-16 20:35:00  

### Description
Implement Laravel authentication system with JWT tokens, user registration, login, and password reset functionality

### Deliverables
- JWT authentication middleware
- User registration API endpoint
- Login/logout API endpoints
- Password reset functionality
- Unit tests for auth system
- API documentation

### Progress
- ✅ Task received and parsed
- ✅ Coding standards reviewed
- ✅ Detailed requirements reviewed
- 🔄 Setting up JWT package
- ⏳ Implementing authentication middleware

### Dependencies
- ✅ laravel_project_init (confirmed complete)

### Coding Standards Reference
php_laravel_standards - PSR-12, service layer pattern, dependency injection
```

### Step 4: Progress Updates

As the Warp Agent works, it updates its status and can communicate back:

```markdown
## 💬 Agent Communication

### Warp Agent Update - 2025-01-16 16:00:00
**Status**: 50% complete  
**Progress**: JWT middleware implemented, working on registration endpoint  
**Blockers**: None  
**ETA**: On track for 20:35:00 completion  

### Warp Agent Question - 2025-01-16 17:30:00
**Question**: Should password reset emails use the default Laravel mail templates or custom Funlynk-branded templates?  
**Context**: Working on password reset functionality, need clarification on email styling  
**Priority**: Medium - can proceed with default for now  

(QUESTION)
```

### Step 5: Technical Lead Response

```markdown
### Technical Lead Response - 2025-01-16 17:45:00
**Re**: Password reset email templates  
**Answer**: Use default Laravel templates for now. We'll implement custom Funlynk branding in a later task focused on email templates.  
**Action**: Continue with default templates, add TODO comment for future customization  

(COMMUNICATION_OVER)
```

### Step 6: Task Completion

When complete, Warp Agent updates:

```markdown
### Warp Agent Completion - 2025-01-16 20:15:00
**Status**: ✅ COMPLETE  
**Deliverables**: All items delivered and tested  
**Test Results**: 15/15 tests passing, 85% code coverage  
**Documentation**: API endpoints documented in Swagger  
**Files Created**:
- app/Http/Middleware/JWTAuth.php
- app/Http/Controllers/Auth/AuthController.php
- app/Services/Core/AuthService.php
- tests/Unit/AuthServiceTest.php
- tests/Feature/AuthControllerTest.php

**Ready for code review**

(TASK_COMPLETE)
```

## Key Benefits Demonstrated

1. **Clear Communication**: Structured task assignment with all necessary details
2. **Standards Enforcement**: Built-in references to coding standards
3. **Progress Tracking**: Real-time status updates and progress visibility
4. **Question Handling**: Clear mechanism for asking and answering questions
5. **Completion Signaling**: Definitive task completion with deliverables
6. **Documentation**: All communication is logged and trackable
