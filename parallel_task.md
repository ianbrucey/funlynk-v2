Task Assignment: Spark Module Infrastructure Development

Project Context & Current Progress

Overall Project Status
This is Step 4 of a larger Spark module implementation plan. The project is a Laravel application with educational programs functionality.

Current State Assessment
•  ✅ Models: Program, CharacterTopic, and ProgramAvailability models are fully implemented
•  ✅ Base Infrastructure: BaseResource class exists with helper methods for privacy, lazy loading, and formatting
•  🔄 API Resources: Currently being updated by another agent to implement proper privacy controls and lazy loading
•  ❌ Testing Infrastructure: No resource tests exist yet
•  ❌ Supporting Infrastructure: Missing factories, seeders, form requests, controllers

What Another Agent is Currently Working On
•  Updating ProgramResource to use BaseResource privacy methods (whenAuthenticated, whenCan)
•  Implementing proper lazy loading with whenLoadedCollection and whenLoadedResource
•  Creating ProgramAvailabilityResource (currently missing)
•  Updating CharacterTopicResource for consistency
•  Creating comprehensive unit tests for all three resources with JSON snapshot testing

Database Schema (Existing)
•  spark_programs table with fields: title, description, grade_levels, duration_minutes, max_students, price_per_student, etc.
•  character_topics table with fields: name, slug, description, category, is_active, sort_order
•  program_availabilities table with fields: program_id, date, start_time, end_time, max_bookings, current_bookings, etc.
•  Pivot table program_character_topics (may need creation/verification)



Objective
Develop the foundational infrastructure for the Spark module, including database factories, seeders, form requests, controllers, and supporting utilities, while avoiding conflicts with concurrent API resource development.

Requirements

1. Database Factories & Seeders
Priority: High
•  Create comprehensive factories for existing models:
•  App\Models\Spark\Program
•  App\Models\Spark\CharacterTopic  
•  App\Models\Spark\ProgramAvailability
•  Implement realistic data generation that matches model structures
•  Create seeders to populate development/testing environments
•  Ensure factories support various states (active/inactive, available/unavailable, etc.)

2. Form Request Validation Classes
Priority: High
•  Create form request classes in app/Http/Requests/Spark/:
•  CreateProgramRequest
•  UpdateProgramRequest
•  CreateCharacterTopicRequest
•  UpdateCharacterTopicRequest
•  CreateProgramAvailabilityRequest
•  UpdateProgramAvailabilityRequest
•  Include comprehensive validation rules, authorization methods, and custom error messages
•  Follow Laravel best practices for form request validation

3. API Controller Stubs
Priority: Medium
•  Create controller classes in app/Http/Controllers/Api/Spark/:
•  ProgramController
•  CharacterTopicController
•  ProgramAvailabilityController
•  Implement basic CRUD method signatures only (index, show, store, update, destroy)
•  Add appropriate docblocks and type hints
•  Do NOT implement method logic - leave methods empty or with basic return statements

4. API Routes
Priority: Medium
•  Add route definitions in routes/api.php for the Spark module
•  Use proper RESTful conventions
•  Group routes with appropriate middleware and prefixes
•  Include route model binding where applicable

5. Database Enhancements
Priority: Low
•  Review existing migrations for optimization opportunities
•  Add missing database indexes for performance
•  Create migration for program_character_topics pivot table if missing
•  Ensure proper foreign key constraints

6. Configuration & Utilities
Priority: Low
•  Create config/spark.php configuration file with module settings
•  Add constants/enums for character topic categories
•  Create utility classes for common operations (date formatting, price calculations)
•  Add service classes for business logic that doesn't belong in models

Critical Constraints

Files to AVOID (Conflict Prevention)
•  Do NOT modify: /app/Http/Resources/Spark/ directory
•  Do NOT create: /tests/Unit/Http/Resources/ directory
•  Do NOT modify: Existing resource files being worked on by another agent

Files You CAN Work On
•  /database/factories/
•  /database/seeders/
•  /app/Http/Requests/Spark/
•  /app/Http/Controllers/Api/Spark/
•  /routes/api.php
•  /database/migrations/
•  /config/
•  /app/Services/
•  /app/Utils/

Success Criteria
•  All factories generate realistic test data
•  Form requests have comprehensive validation
•  Controllers have proper structure and documentation
•  Routes follow RESTful conventions
•  Database is optimized with proper indexes
•  Configuration is centralized and well-documented

Additional Notes
•  Follow Laravel coding standards and conventions
•  Use PHP 8.x features where appropriate
•  Include proper docblocks and type hints
•  Test your factories and seeders work correctly
•  Ensure all code is PSR-12 compliant
•  The models already have comprehensive business logic, relationships, and accessors implemented

Priority Order
1. Database Factories & Seeders (enables testing)
2. Form Request Classes (enables validation)
3. Controller stubs & Routes (enables API structure)
4. Database optimizations
5. Configuration & utilities