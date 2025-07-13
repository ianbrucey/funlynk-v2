Okay, understood. Let's outline the Minimum Viable Product (MVP) for Funlynk, encompassing both the core features and the Funlynk Spark program, with a general activity focus rather than just music. The goal is a highly granular outline suitable for a development team, including the tech stack decision.

sGiven your PHP/Laravel backend experience[cite: 5], we'll leverage that for efficiency. For the frontend, a hybrid mobile approach with React Native is highly recommended to target both iOS and Android from a single codebase, which is crucial for a social app that benefits from broad accessibility. This also allows for potential web app expansion if needed later, as React Native can share components with React.js for web.

---

### Funlynk MVP Outline for Development Team

**I. Overall Project Goals & Scope:**

* **Objective:** Develop a social activity network (Funlynk) and a curated field trip program (Funlynk Spark MVP) to enable users to find and participate in real-life activities, foster new connections, and facilitate hosted experiences.
* **Target Audience:** Individuals seeking to find activities and connect with like-minded people, and organizations/individuals looking to host public or private events/classes. For Funlynk Spark, initial focus on adults for curated experiences, with an eye towards a future B2B school program.
* **MVP Definition:** Focus on core functionality to prove the concept of activity discovery, event creation/joining, and basic hosted experiences.

**II. Technology Stack Decision:**

* **Backend:** PHP (Laravel Framework) [cite: 5]
    * **Reasoning:** Leveraging existing expertise for rapid development[cite: 5, 6]. Laravel provides robust features for API development, database management, and security.
* **Database:** MySQL (or PostgreSQL)
    * **Reasoning:** Reliable, scalable, and well-supported by Laravel.
* **Frontend (Mobile App):** React Native
    * **Reasoning:** Cross-platform development (iOS & Android) from a single codebase, accelerating time-to-market and reducing development costs compared to native. Excellent for UI/UX and rich interactive experiences common in social apps.
* **Search Engine:** MeiliSearch [cite: 31]
    * **Reasoning:** Specifically mentioned by the client[cite: 31]. Provides fast, relevant, typo-tolerant search for location-based and tag-based queries.
* **Payment Processing:** Stripe Connect [cite: 26]
    * **Reasoning:** Directly specified by the client[cite: 26]. Handles user onboarding for payments, payouts, and robust transaction management.
* **Cloud Hosting:** AWS (or Google Cloud, DigitalOcean)
    * **Reasoning:** Scalability, reliability, and global reach for application hosting, database, and file storage.

**III. Core Funlynk Features (MVP - General Activity Focus):**

**A. User & Profile Management:**

1.  **User Onboarding & Authentication:**
    * User Registration (Email & Password, with confirmation).
    * Login/Logout.
    * Password Reset/Forgot Password.
    * Social Sign-in (Google, Apple).
    * Basic Profile Setup (Display Name, Profile Picture, Location).
2.  **User Profiles:**
    * Editable "About Me" / Bio section.
    * Listing of "Interests/Activities" (e.g., Sports, Arts, Hobbies, Learning, Outdoors – user selectable tags).
    * Display of events they are hosting or attending (publicly visible).
3.  **Social Connections:**
    * **Follow System:** Users can "Follow" other users/profiles to see their public events and posts.
    * **Friend Request System:** Users can send/accept/decline friend requests.
    * Friends List/Following List view.
4.  **Notifications (Push & In-App):**
    * New event invites.
    * Friend requests/acceptances.
    * Event updates (time change, cancellation by host).
    * Comments on user's posts/events.

**B. Activity/Event Management:**

1.  **Post Creation:**
    * Ability to create a free-form "status" post on their timeline (e.g., "Looking for a tennis partner," "Anyone playing board games tonight?").
    * Text-based posts.
    * Ability to attach images to posts.
2.  **Event/Meetup Creation:**
    * **Event Title & Description.**
    * **Date & Time (Start & End).**
    * **Location:**
        * Physical Address input with map integration (e.g., Google Maps API).
        * Option for "Virtual" event (requires a URL field).
    * **Event Type:** Categorization (e.g., Sports, Hobby, Class, Social, Performance, Meetup).
    * **Visibility:** Public (discoverable by anyone), Friends Only, Invite Only.
    * **Capacity Limit (Optional):** Define maximum attendees.
    * **Tags/Keywords:**
        * Users can add custom tags to their events (e.g., #Hiking, #BeginnerFriendly, #BoardGames, #CoffeeChat)[cite: 34].
        * These tags are searchable via MeiliSearch.
    * **Images/Videos:** Upload a primary image/video for the event.
    * **Payment Integration (for paid events):**
        * Option to set a price per ticket.
        * Integration with Stripe Connect for hosts to receive payments.
3.  **Event Discovery & Search:**
    * **Home Feed:** A personalized feed showing events from followed users/friends and recommended public events based on interests/location.
    * **"Explore" Tab:**
        * **Location-Based Search:** "Events Near Me" with customizable radius[cite: 45, 49]. Utilizes MeiliSearch[cite: 31].
        * **Keyword/Tag Search:** Ability to search events using specific keywords or tags[cite: 34].
        * Date & Time Filters (Today, This Week, This Weekend, Custom Date Range).
        * Category Filters (e.g., Sports, Learning, Social).
    * **Map View:** Visually display events on a map.
4.  **Event Interaction & Management:**
    * **RSVP/Join Event:** Users can indicate attendance.
    * **Event Details Page:** Comprehensive view of event information.
    * **In-App Chat (for specific events):** Basic text chat among event participants.
    * **Share Event:** Ability to share events via external platforms.
    * **Host Tools:**
        * View attendee list.
        * Send messages to attendees.
        * Edit/Cancel event.
        * QR Code generation for ticketing[cite: 28].
        * In-app QR code scanner for hosts to check attendees[cite: 28].
5.  **Personalized Calendar:**
    * View of all upcoming events the user is hosting or attending[cite: 29].
    * Ability to sync with external calendars (e.g., Google Calendar).
    * View another user's public event calendar on their profile[cite: 29].

**C. Payment & Monetization (Stripe Connect):**

1.  **Host Onboarding (Stripe Connect):**
    * Seamless in-app flow for hosts to create or connect their Stripe account[cite: 26].
    * Required for hosting paid events.
2.  **Ticketing & Payments:**
    * Secure payment processing for event attendees (via Stripe).
    * Digital tickets with QR codes issued to attendees[cite: 28].
3.  **Host Dashboard (Basic):**
    * Summary of sales and attendance for their events[cite: 27].
    * Payout tracking.

Okay, here is the refined Funlynk Spark MVP Outline, specifically tailored for your coding agents, focusing on facilitating K-12 character development field trips. This is designed to be granular enough for development, assuming you will provide detailed UI/UX wireframes/mockups and API contracts separately.

---

### Funlynk Spark: MVP for K-12 Character Development Field Trip Facilitation - Development Outline

**Project Goal:** To develop a robust digital platform for the efficient organization, management, and facilitation of K-12 character development field trips for school districts, as a primary component for a proposal to the Georgia Department of Education (GaDOE).

**App's Primary Role:** To streamline administrative, logistical, and communication aspects of field trips. Educational content delivery occurs primarily during the physical field trip, not directly within the app's student interface.

**Technology Stack:**
* **Backend:** PHP (Laravel Framework)
* **Database:** MySQL (or PostgreSQL)
* **Mobile App Frontend:** React Native (iOS & Android)
* **Web Interface Frontend:** React.js (for admin and potentially parent portals)
* **Search Engine:** MeiliSearch
* **Payment Processing:** Stripe Connect (integrated, but initial K-12 focus is on program delivery, not immediate per-student revenue)
* **Cloud Hosting:** AWS (S3 for storage, EC2 for instances)

**I. User Roles & Access Control:**

1.  **Funlynk Admin / Program Manager (Web Interface):**
    * Full access to program creation, scheduling, and overall Spark program oversight.
    * Access to aggregated reporting across all schools/districts.
2.  **School District Admin / Coordinator (Web Interface):**
    * Manage school profiles within their district.
    * Approve/oversee field trip bookings for their schools.
    * Access to district-level reports.
3.  **Teacher / Chaperone (Web Interface & Mobile App):**
    * Web: Browse/book field trips, manage classes, view permission slip status, manage rosters.
    * Mobile: On-site attendance tracking, access to emergency contacts, in-app communication for active trips.
4.  **Parent / Guardian (Mobile App & Web View for Slips):**
    * Receive notifications, access child's trip details, digitally sign permission slips.

---

**II. Core Funlynk Spark Features (MVP - Granular Breakdown):**

**A. Program & Field Trip Management (Funlynk Admin Web Panel):**

1.  **Field Trip Program Creation & Management:**
    * **FT-1.1: Create New Field Trip Program:**
        * Fields: `program_id (auto-gen)`, `title`, `description (rich text)`, `short_summary`, `duration_minutes`, `cost (decimal, optional)`, `is_active (boolean)`.
        * **Character Trait Mapping:** Multi-select input linked to a pre-defined list of 27 character topics (e.g., `character_topics_json_array: ["Responsibility", "Empathy"]`).
        * **Recommended Grade Levels:** Multi-select input (K, 1, 2... 12).
        * **Location:** `physical_address`, `city`, `state`, `zip`, `latitude`, `longitude`.
        * **Logistical Notes:** `what_to_bring_text`, `special_instructions_text`.
        * **Associated Resources Upload:** File upload (`PDF`, `DOCX`) for pre/post-trip materials for teachers (e.g., `resource_name`, `resource_url`, `resource_type`).
        * **Images/Videos:** Ability to upload multiple images/videos for program display.
    * **FT-1.2: Edit/View/Deactivate Field Trip Program:** Standard CRUD operations.
    * **FT-1.3: Manage Program Availability Slots:**
        * For each program: Create specific `date`, `start_time`, `end_time`, `max_capacity`.
        * `is_available (boolean)`.
        * System automatically marks slots as unavailable when booked to capacity.

**B. School District & Teacher Administration (Web Interface, with Mobile Integration):**

1.  **School/District Onboarding & User Management:**
    * **SD-1.1: School/District Profile Setup:**
        * Fields: `district_name`, `school_name`, `address`, `contact_person`, `contact_email`, `contact_phone`.
        * `district_id (auto-gen)`, `school_id (auto-gen)`.
    * **SD-1.2: User Accounts for School Admins/Teachers:**
        * Creation of new user accounts linked to specific `school_id`.
        * Role assignment (`school_admin`, `teacher`, `chaperone`).
        * Password reset/management.
2.  **Class & Student Roster Management (Teacher / School Admin):**
    * **CM-2.1: Create/Manage Class:**
        * Teacher can `create_class` with `class_name`, `grade_level`.
        * View/edit existing classes.
    * **CM-2.2: Student Roster Upload (CSV):**
        * Upload endpoint for CSV files (columns: `first_name`, `last_name`, `student_id_optional`, `date_of_birth_optional`).
        * **Validation:** Server-side validation of CSV format, data types.
        * **Error Reporting:** Display clear error messages for failed rows.
        * Assign uploaded students to a specific `class_id`.
    * **CM-2.3: Manual Student Addition/Editing:** Add individual students to a class.
    * **CM-2.4: View/Search Students:** List students by class, search by name.
3.  **Field Trip Booking & Assignment (Teacher / School Admin):**
    * **TB-3.1: Browse Available Field Trips:** List view of all active programs, filterable by `character_topic`, `grade_level`, `date_range`, `location`.
    * **TB-3.2: Request/Book Field Trip Slot:**
        * Select a `program_id` and `availability_slot_id`.
        * Select the `class_id(s)` to attend.
        * Confirm booking. Status: `PENDING` (if approval needed) or `CONFIRMED`.
    * **TB-3.3: Assign Students to Booked Trip:**
        * From selected class roster, check/uncheck students attending the specific trip.
        * System tracks `student_trip_enrollment_id`.
    * **TB-3.4: View Booked Trips:** List of all trips booked by their school/classes.

**C. Digital Permission Slip Management (Web for Admin/Teacher, Mobile/Web View for Parents):**

1.  **PS-1.1: Permission Slip Generation (Automated):**
    * System automatically generates a unique `permission_slip_id` for each `student_trip_enrollment_id` upon student assignment to a trip.
    * Content populated from `program_details`, `school_name`, `student_name`.
2.  **PS-1.2: Parent/Guardian Notification & Access:**
    * System sends automated `email`/`SMS` notification to parent email/phone (provided during student roster upload or by teacher) with a secure, unique link to the permission slip.
    * The link opens a mobile-optimized web view.
3.  **PS-1.3: Parent/Guardian E-Signature Workflow:**
    * Parent views `permission_slip_details`.
    * **Emergency Contact Info Input:** Fields for `emergency_contact_name`, `emergency_contact_phone`, `relationship`.
    * **Medical Notes/Allergies Input:** Free-text field for `medical_notes`.
    * **Digital Signature:** Input field for `parent_full_name` (as digital signature) and `date_signed`.
    * **Consent Checkbox:** Mandatory checkbox for legal consent statement.
    * **Submit:** Button to submit signed slip.
    * Confirmation message displayed.
    * Email confirmation sent to parent upon successful signing.
4.  **PS-1.4: Permission Slip Tracking (Teacher / School Admin):**
    * Dashboard/list view showing `student_name`, `trip_title`, `status` (`SENT`, `SIGNED`, `OVERDUE`).
    * Filter by class, trip, status.
    * Ability to resend permission slip notification.

**D. Field Trip Logistics & Communication (Mobile App for Teacher/Chaperone, Web for Admin):**

1.  **FT-2.1: Trip Detail Access (Mobile App):**
    * Teachers can view details for their upcoming trips (location, time, student list, logistical notes).
    * Access to emergency contacts and medical notes for students on their specific trip.
2.  **FT-2.2: On-Site Attendance Tracking (Mobile App):**
    * Teacher opens a specific trip.
    * Display list of `assigned_students` for the trip.
    * Ability to mark `attended (boolean)` for each student (manual toggle or list view).
    * **Optional (if within MVP scope for phase 1):** QR code scanner utilizing device camera to scan unique student QR codes (generated and provided by system - e.g., on badges).
    * `last_checked_in_timestamp` for audit trail.
3.  **FT-2.3: In-App Communication (Teacher/Admin to Parents):**
    * Secure broadcast messaging feature for specific trip (e.g., "Bus running 15 min late").
    * Messages linked to `student_trip_enrollment_id` for targeted delivery.

**E. Reporting & Accountability (Web Interface for Funlynk Admin / School Admin):**

1.  **RP-1.1: Program Participation Overview:**
    * Dashboard showing total `trips_booked`, `total_students_reached` per `school`/`district`/`program`.
    * Filterable by `date_range`, `character_topic`, `grade_level`.
2.  **RP-1.2: Detailed Participation Report:**
    * Exportable CSV report: `trip_title`, `date`, `school_name`, `class_name`, `student_name`, `attended (boolean)`.
3.  **RP-1.3: Character Topic Coverage Report (High-Level):**
    * Summary of which `character_topics` have been addressed by booked/completed trips for a given `school`/`district`. (Shows breadth of program utilization, not individual student development).

---

**III. Backend & Infrastructure (Laravel API for both Web & Mobile):**

1.  **API Endpoints:**
    * Clearly defined RESTful API endpoints for all front-end functionalities (e.g., `/api/auth/register`, `/api/schools/{id}/roster/upload`, `/api/trips/{id}/attendees`, `/api/permission-slips/{token}/sign`).
    * Authentication (Laravel Sanctum for API tokens).
    * Authorization (Laravel Policies/Gates for role-based access control).
2.  **Database Schema:**
    * `users` table (roles: `funlynk_admin`, `school_admin`, `teacher`, `parent`).
    * `schools`, `districts` tables.
    * `classes` table.
    * `students` table (linked to `class_id`, `school_id`).
    * `funlynk_programs` table (for Spark field trips, mapping to character topics).
    * `program_availability_slots` table.
    * `trip_bookings` table (linking programs, slots, classes).
    * `student_trip_enrollments` table (linking students to specific trip bookings).
    * `permission_slips` table (status, signature, emergency info, medical notes).
    * `notifications` table.
    * `messages` table (for in-app communication).
    * `activity_logs` table (for auditing key actions).
3.  **MeiliSearch Integration:**
    * Indexing `funlynk_programs` data (title, description, character topics, location) for fast search in the admin/teacher interfaces.
4.  **Email/SMS Services:**
    * Integration with a transactional email service (e.g., Postmark, SendGrid) and SMS gateway (e.g., Twilio) for notifications and permission slip links.
5.  **File Storage (AWS S3):**
    * For `program_images`, `resource_files`, `CSV_roster_uploads`.
6.  **Admin Panel (Laravel Nova/Backpack or Custom):**
    * Centralized interface for Funlynk Admins to manage all aspects of the Spark program, schools, users, and view reports.

---

This outline, combined with detailed wireframes/mockups for each screen and API documentation, should provide your coding agents with a clear roadmap to build the Funlynk Spark MVP.