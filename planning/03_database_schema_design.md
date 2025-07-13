# Database Schema Design
## Funlynk & Funlynk Spark MVP

### Overview
This document defines the complete database schema supporting both Funlynk Core and Funlynk Spark functionality.

## Core Tables

### users
Primary user table for all user types
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'teacher', 'school_admin', 'funlynk_admin') DEFAULT 'user',
    avatar VARCHAR(255) NULL,
    bio TEXT NULL,
    location_address VARCHAR(255) NULL,
    location_latitude DECIMAL(10, 8) NULL,
    location_longitude DECIMAL(11, 8) NULL,
    phone VARCHAR(20) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_location (location_latitude, location_longitude)
);
```

### user_interests
User interests/activities for Core functionality
```sql
CREATE TABLE user_interests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    interest VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_interest (user_id, interest),
    INDEX idx_interest (interest)
);
```

### user_follows
Social following system
```sql
CREATE TABLE user_follows (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    follower_id BIGINT UNSIGNED NOT NULL,
    following_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (follower_id, following_id),
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id)
);
```

## Core Funlynk Tables

### events
Main events table for Core functionality
```sql
CREATE TABLE events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    host_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500) NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    location_address VARCHAR(255) NOT NULL,
    location_latitude DECIMAL(10, 8) NOT NULL,
    location_longitude DECIMAL(11, 8) NOT NULL,
    category VARCHAR(100) NOT NULL,
    visibility ENUM('public', 'friends', 'private') DEFAULT 'public',
    max_capacity INT UNSIGNED NULL,
    price DECIMAL(8, 2) NULL,
    image_url VARCHAR(255) NULL,
    is_virtual BOOLEAN DEFAULT FALSE,
    virtual_url VARCHAR(255) NULL,
    status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_host (host_id),
    INDEX idx_start_date (start_date),
    INDEX idx_location (location_latitude, location_longitude),
    INDEX idx_category (category),
    INDEX idx_visibility (visibility),
    INDEX idx_status (status)
);
```

### event_tags
Tags for events
```sql
CREATE TABLE event_tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT UNSIGNED NOT NULL,
    tag VARCHAR(100) NOT NULL,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_event (event_id),
    INDEX idx_tag (tag)
);
```

### event_attendees
Event attendance tracking
```sql
CREATE TABLE event_attendees (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    status ENUM('attending', 'maybe', 'not_attending') DEFAULT 'attending',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (event_id, user_id),
    INDEX idx_event (event_id),
    INDEX idx_user (user_id)
);
```

## Spark Tables

### districts
School districts for Spark
```sql
CREATE TABLE districts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_state (state)
);
```

### schools
Schools within districts
```sql
CREATE TABLE schools (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    district_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    INDEX idx_district (district_id),
    INDEX idx_name (name)
);
```

### user_schools
Link users to schools (for teachers/admins)
```sql
CREATE TABLE user_schools (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    school_id BIGINT UNSIGNED NOT NULL,
    role ENUM('teacher', 'school_admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_school (user_id, school_id),
    INDEX idx_user (user_id),
    INDEX idx_school (school_id)
);
```

### classes
School classes
```sql
CREATE TABLE classes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT UNSIGNED NOT NULL,
    teacher_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    grade_level VARCHAR(10) NOT NULL,
    academic_year VARCHAR(9) NOT NULL, -- e.g., "2024-2025"
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_school (school_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_grade (grade_level)
);
```

### students
Student records
```sql
CREATE TABLE students (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT UNSIGNED NOT NULL,
    class_id BIGINT UNSIGNED NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) NULL,
    date_of_birth DATE NULL,
    parent_email VARCHAR(255) NULL,
    parent_phone VARCHAR(20) NULL,
    parent_name VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_school (school_id),
    INDEX idx_class (class_id),
    INDEX idx_name (first_name, last_name),
    INDEX idx_parent_email (parent_email)
);
```

### spark_programs
Field trip programs
```sql
CREATE TABLE spark_programs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_summary VARCHAR(500) NOT NULL,
    duration_minutes INT UNSIGNED NOT NULL,
    cost DECIMAL(8, 2) DEFAULT 0.00,
    location_address VARCHAR(255) NOT NULL,
    location_city VARCHAR(100) NOT NULL,
    location_state VARCHAR(50) NOT NULL,
    location_zip VARCHAR(10) NOT NULL,
    location_latitude DECIMAL(10, 8) NOT NULL,
    location_longitude DECIMAL(11, 8) NOT NULL,
    what_to_bring TEXT NULL,
    special_instructions TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_location (location_latitude, location_longitude),
    INDEX idx_city_state (location_city, location_state),
    INDEX idx_active (is_active)
);
```

### spark_program_character_topics
Character topics for programs (many-to-many)
```sql
CREATE TABLE spark_program_character_topics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    program_id BIGINT UNSIGNED NOT NULL,
    character_topic VARCHAR(100) NOT NULL,
    
    FOREIGN KEY (program_id) REFERENCES spark_programs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_program_topic (program_id, character_topic),
    INDEX idx_program (program_id),
    INDEX idx_topic (character_topic)
);
```

### spark_program_grade_levels
Grade levels for programs (many-to-many)
```sql
CREATE TABLE spark_program_grade_levels (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    program_id BIGINT UNSIGNED NOT NULL,
    grade_level VARCHAR(10) NOT NULL,
    
    FOREIGN KEY (program_id) REFERENCES spark_programs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_program_grade (program_id, grade_level),
    INDEX idx_program (program_id),
    INDEX idx_grade (grade_level)
);
```

### spark_program_availability_slots
Available time slots for programs
```sql
CREATE TABLE spark_program_availability_slots (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    program_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INT UNSIGNED NOT NULL,
    booked_capacity INT UNSIGNED DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (program_id) REFERENCES spark_programs(id) ON DELETE CASCADE,
    INDEX idx_program (program_id),
    INDEX idx_date (date),
    INDEX idx_available (is_available)
);
```

### spark_trip_bookings
Trip bookings by schools
```sql
CREATE TABLE spark_trip_bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    program_id BIGINT UNSIGNED NOT NULL,
    slot_id BIGINT UNSIGNED NOT NULL,
    school_id BIGINT UNSIGNED NOT NULL,
    teacher_id BIGINT UNSIGNED NOT NULL,
    students_count INT UNSIGNED NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    booking_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (program_id) REFERENCES spark_programs(id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES spark_program_availability_slots(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_program (program_id),
    INDEX idx_slot (slot_id),
    INDEX idx_school (school_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_status (status)
);
```

### spark_student_trip_enrollments
Individual student enrollments in trips
```sql
CREATE TABLE spark_student_trip_enrollments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    attended BOOLEAN NULL,
    attendance_timestamp TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES spark_trip_bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking_student (booking_id, student_id),
    INDEX idx_booking (booking_id),
    INDEX idx_student (student_id)
);
```

### spark_permission_slips
Digital permission slips
```sql
CREATE TABLE spark_permission_slips (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    enrollment_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    parent_name VARCHAR(255) NULL,
    emergency_contact_name VARCHAR(255) NULL,
    emergency_contact_phone VARCHAR(20) NULL,
    emergency_contact_relationship VARCHAR(100) NULL,
    medical_notes TEXT NULL,
    consent_given BOOLEAN DEFAULT FALSE,
    signed_at TIMESTAMP NULL,
    status ENUM('sent', 'signed', 'overdue') DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (enrollment_id) REFERENCES spark_student_trip_enrollments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (enrollment_id),
    INDEX idx_token (token),
    INDEX idx_status (status)
);
```

## Support Tables

### notifications
System notifications
```sql
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_read (read_at)
);
```

### activity_logs
Audit trail for important actions
```sql
CREATE TABLE activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL,
    model_type VARCHAR(100) NULL,
    model_id BIGINT UNSIGNED NULL,
    changes JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_model (model_type, model_id),
    INDEX idx_created (created_at)
);
```

## Indexing Strategy

### Primary Indexes
- All primary keys are auto-incrementing BIGINT UNSIGNED
- Foreign key constraints with appropriate CASCADE actions

### Performance Indexes
- Location-based queries: Composite indexes on latitude/longitude
- Search functionality: Indexes on searchable text fields
- Date-based queries: Indexes on date/datetime fields
- Status filtering: Indexes on enum status fields

### Unique Constraints
- Email uniqueness in users table
- Unique combinations for relationship tables
- Unique tokens for permission slips

## Data Types & Constraints

### String Lengths
- Names/Titles: VARCHAR(255)
- Descriptions: TEXT
- Short descriptions: VARCHAR(500)
- Emails: VARCHAR(255)
- Phone numbers: VARCHAR(20)

### Decimal Precision
- Coordinates: DECIMAL(10,8) for latitude, DECIMAL(11,8) for longitude
- Money: DECIMAL(8,2) for prices/costs

### Boolean Fields
- Default FALSE for most boolean fields
- Use NULL for unknown states (e.g., attendance)

### Timestamps
- created_at: DEFAULT CURRENT_TIMESTAMP
- updated_at: DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

## Character Topics Reference

The following 27 character topics will be used in the Spark program:

1. Responsibility
2. Empathy
3. Integrity
4. Perseverance
5. Respect
6. Kindness
7. Courage
8. Honesty
9. Gratitude
10. Self-Control
11. Teamwork
12. Leadership
13. Compassion
14. Fairness
15. Patience
16. Humility
17. Forgiveness
18. Loyalty
19. Generosity
20. Optimism
21. Resilience
22. Trustworthiness
23. Cooperation
24. Citizenship
25. Diligence
26. Tolerance
27. Wisdom
