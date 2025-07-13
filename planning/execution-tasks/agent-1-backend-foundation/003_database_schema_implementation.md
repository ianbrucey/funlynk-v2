# Task 003: Database Schema Implementation
**Agent**: Backend Foundation & Infrastructure Lead  
**Estimated Time**: 5-6 hours  
**Priority**: High  
**Dependencies**: Task 002 (Authentication System Setup)  

## Overview
Implement the complete database schema for both Core Funlynk and Spark applications based on the database design document. Create all migrations, relationships, and indexes.

## Prerequisites
- Task 002 completed successfully
- Database connection established
- Laravel migrations system working
- Access to planning/03_database_schema_design.md

## Step-by-Step Implementation

### Step 1: Create Core Funlynk Migrations (120 minutes)

**Create User-related migrations:**
```bash
# Core profile extension
php artisan make:migration create_core_profiles_table

# User interests and following
php artisan make:migration create_user_interests_table
php artisan make:migration create_user_follows_table
```

**Core Profiles Migration:**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('core_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('username')->unique()->nullable();
            $table->text('bio')->nullable();
            $table->string('website')->nullable();
            $table->json('social_links')->nullable();
            $table->enum('visibility', ['public', 'friends', 'private'])->default('public');
            $table->boolean('is_host')->default(false);
            $table->decimal('host_rating', 3, 2)->nullable();
            $table->integer('events_hosted')->default(0);
            $table->integer('events_attended')->default(0);
            $table->timestamps();
            
            $table->index(['user_id']);
            $table->index(['username']);
            $table->index(['is_host']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('core_profiles');
    }
};
```

**Events Migration:**
```bash
php artisan make:migration create_events_table
php artisan make:migration create_event_categories_table
php artisan make:migration create_event_tags_table
php artisan make:migration create_event_attendees_table
```

**Events Table Migration:**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('host_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('event_categories');
            $table->string('title');
            $table->text('description');
            $table->string('location');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->datetime('start_time');
            $table->datetime('end_time');
            $table->integer('max_attendees')->nullable();
            $table->decimal('price', 8, 2)->default(0);
            $table->enum('status', ['draft', 'published', 'cancelled', 'completed'])->default('draft');
            $table->enum('visibility', ['public', 'friends', 'private'])->default('public');
            $table->json('images')->nullable();
            $table->json('requirements')->nullable();
            $table->boolean('requires_approval')->default(false);
            $table->string('contact_info')->nullable();
            $table->timestamps();
            
            $table->index(['host_id']);
            $table->index(['category_id']);
            $table->index(['status']);
            $table->index(['start_time']);
            $table->index(['location']);
            $table->index(['latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
```

### Step 2: Create Spark Migrations (120 minutes)

**Create Spark-specific migrations:**
```bash
# School management
php artisan make:migration create_districts_table
php artisan make:migration create_schools_table
php artisan make:migration create_spark_profiles_table

# Program management
php artisan make:migration create_spark_programs_table
php artisan make:migration create_character_topics_table
php artisan make:migration create_program_availability_table

# Class and student management
php artisan make:migration create_classes_table
php artisan make:migration create_students_table
php artisan make:migration create_class_student_table
```

**Districts Migration:**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('districts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('address');
            $table->string('city');
            $table->string('state');
            $table->string('zip_code');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->json('contact_info')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['code']);
            $table->index(['state']);
            $table->index(['is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('districts');
    }
};
```

**Schools Migration:**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code')->unique();
            $table->text('address');
            $table->string('city');
            $table->string('state');
            $table->string('zip_code');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('principal_name')->nullable();
            $table->string('principal_email')->nullable();
            $table->json('grade_levels')->nullable();
            $table->integer('student_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['district_id']);
            $table->index(['code']);
            $table->index(['state']);
            $table->index(['is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
```

**Spark Programs Migration:**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spark_programs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->json('grade_levels');
            $table->integer('duration_minutes');
            $table->integer('max_students');
            $table->decimal('price_per_student', 8, 2);
            $table->json('character_topics');
            $table->json('learning_objectives');
            $table->json('materials_needed');
            $table->json('resource_files')->nullable();
            $table->text('special_requirements')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['is_active']);
            $table->fullText(['title', 'description']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spark_programs');
    }
};
```

### Step 3: Create Booking and Permission Slip Migrations (90 minutes)

**Create booking-related migrations:**
```bash
php artisan make:migration create_bookings_table
php artisan make:migration create_booking_students_table
php artisan make:migration create_permission_slips_table
```

**Bookings Migration:**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('program_id')->constrained('spark_programs')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->string('booking_reference')->unique();
            $table->date('preferred_date');
            $table->time('preferred_time');
            $table->date('confirmed_date')->nullable();
            $table->time('confirmed_time')->nullable();
            $table->integer('student_count');
            $table->decimal('total_cost', 10, 2);
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
            $table->text('special_requests')->nullable();
            $table->json('contact_info');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
            
            $table->index(['school_id']);
            $table->index(['program_id']);
            $table->index(['teacher_id']);
            $table->index(['booking_reference']);
            $table->index(['status']);
            $table->index(['preferred_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
```

**Permission Slips Migration:**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permission_slips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('token')->unique();
            $table->string('parent_name')->nullable();
            $table->string('parent_email')->nullable();
            $table->string('parent_phone')->nullable();
            $table->json('emergency_contacts')->nullable();
            $table->json('medical_info')->nullable();
            $table->text('special_instructions')->nullable();
            $table->boolean('photo_permission')->default(false);
            $table->boolean('is_signed')->default(false);
            $table->string('signature_data')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->string('signed_ip')->nullable();
            $table->timestamps();
            
            $table->index(['booking_id']);
            $table->index(['student_id']);
            $table->index(['token']);
            $table->index(['is_signed']);
            $table->index(['parent_email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permission_slips');
    }
};
```

### Step 4: Create Relationship Tables (45 minutes)

**Create pivot and relationship tables:**
```bash
php artisan make:migration create_event_attendees_table
php artisan make:migration create_event_tags_table
php artisan make:migration create_user_follows_table
php artisan make:migration create_class_student_table
```

**Event Attendees Migration:**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_attendees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['interested', 'going', 'not_going', 'maybe'])->default('interested');
            $table->timestamp('rsvp_at')->nullable();
            $table->timestamp('checked_in_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['event_id', 'user_id']);
            $table->index(['event_id']);
            $table->index(['user_id']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_attendees');
    }
};
```

### Step 5: Create Indexes and Constraints (30 minutes)

**Create additional indexes migration:**
```bash
php artisan make:migration add_additional_indexes
```

**Additional Indexes Migration:**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->index(['email_verified_at']);
            $table->index(['is_active']);
            $table->index(['created_at']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->index(['created_at']);
            $table->index(['price']);
            $table->index(['max_attendees']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->index(['created_at']);
            $table->index(['total_cost']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['email_verified_at']);
            $table->dropIndex(['is_active']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['price']);
            $table->dropIndex(['max_attendees']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['total_cost']);
        });
    }
};
```

### Step 6: Create Database Seeders (45 minutes)

**Create seeders:**
```bash
php artisan make:seeder DatabaseSeeder
php artisan make:seeder EventCategorySeeder
php artisan make:seeder CharacterTopicSeeder
php artisan make:seeder TestDataSeeder
```

**Event Category Seeder:**
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Social', 'description' => 'Social gatherings and meetups', 'icon' => 'users'],
            ['name' => 'Sports', 'description' => 'Sports and fitness activities', 'icon' => 'activity'],
            ['name' => 'Education', 'description' => 'Learning and educational events', 'icon' => 'book'],
            ['name' => 'Entertainment', 'description' => 'Entertainment and shows', 'icon' => 'music'],
            ['name' => 'Food & Drink', 'description' => 'Food and beverage events', 'icon' => 'coffee'],
            ['name' => 'Arts & Culture', 'description' => 'Arts, culture, and creative events', 'icon' => 'palette'],
            ['name' => 'Business', 'description' => 'Business and networking events', 'icon' => 'briefcase'],
            ['name' => 'Outdoor', 'description' => 'Outdoor and adventure activities', 'icon' => 'mountain'],
        ];

        foreach ($categories as $category) {
            DB::table('event_categories')->insert([
                'name' => $category['name'],
                'description' => $category['description'],
                'icon' => $category['icon'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
```

### Step 7: Run Migrations and Seeders (15 minutes)

**Execute migrations:**
```bash
# Run all migrations
php artisan migrate

# Seed the database
php artisan db:seed --class=RolePermissionSeeder
php artisan db:seed --class=EventCategorySeeder
php artisan db:seed --class=CharacterTopicSeeder

# Verify migrations
php artisan migrate:status
```

## Acceptance Criteria

### Database Structure
- [ ] All tables created successfully
- [ ] Foreign key constraints properly set
- [ ] Indexes created for performance optimization
- [ ] Soft deletes implemented where appropriate

### Data Integrity
- [ ] All relationships properly defined
- [ ] Cascade deletes configured correctly
- [ ] Unique constraints enforced
- [ ] Default values set appropriately

### Performance
- [ ] Proper indexing on frequently queried columns
- [ ] Composite indexes for complex queries
- [ ] Full-text search indexes where needed

### Seeding
- [ ] Basic reference data seeded
- [ ] Role and permission data populated
- [ ] Test data available for development

## Testing Instructions

### Database Verification
```bash
# Check table structure
php artisan tinker
>>> Schema::hasTable('users');
>>> Schema::hasTable('events');
>>> Schema::hasTable('bookings');

# Verify relationships
>>> $user = App\Models\User::first();
>>> $user->coreProfile;
>>> $user->roles;

# Check indexes
SHOW INDEX FROM events;
SHOW INDEX FROM bookings;
```

### Data Integrity Tests
```bash
# Test foreign key constraints
>>> App\Models\Event::create(['host_id' => 999, 'title' => 'Test']);
# Should fail with foreign key constraint error

# Test unique constraints
>>> App\Models\User::create(['email' => 'existing@email.com']);
# Should fail if email already exists
```

## Next Steps
After completion, proceed to:
- Task 004: Shared Services Implementation
- Share database models with Agent 2 and Agent 3
- Coordinate with all agents on model relationships

## Documentation
- Update database documentation with final schema
- Document all relationships and constraints
- Create model relationship diagrams
