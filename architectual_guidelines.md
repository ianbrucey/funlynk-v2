# Architectural Guidelines for Funlynk & Funlynk Spark

Here is the revised directive, specifically for the **Lead Planning Agent**:

---

**Directive: Lead Planning Agent - Comprehensive Project Granularization for Parallel Development**

**To:** Lead Planning Agent (Individual Focus)

**From:** [Your Name/Project Lead]

**Subject:** **Critical Initial Planning Phase: Establishing the Blueprint for Funlynk & Funlynk Spark MVP**

---

Team Member,

Your immediate and most critical task is to act as the **Lead Planning Agent** for the Funlynk and Funlynk Spark MVP. This initial phase demands **intensive, meticulous planning and granular feature breakdown** to create a robust blueprint. This detailed preparation is absolutely crucial for enabling us to then deploy **up to four (or more) additional coding agents** to work simultaneously on different features without overlap, conflicts, or redundant effort.

**Your Goal:** To produce a comprehensive, hierarchical development plan that fully facilitates highly parallel and independent work streams for the entire team, leveraging Augment's modular capabilities.

**Your Immediate Core Tasks & Deliverables:**

1.  **Deep Dive into MVP Outlines:**
    * Thoroughly review both the "Funlynk MVP Outline" (core social activity network) and the "Funlynk Spark: MVP for K-12 Character Development Field Trip Facilitation - Development Outline." Your understanding of the full scope, interdependencies, and strategic importance of each feature is paramount.

2.  **Establish Project Foundations (Your Primary Deliverable):**
    * This is where **all major architectural and design decisions are made and documented.** This documentation will be the **single source of truth** for all subsequent development.
    * **2.1. Unified Coding Standards & Style Guides (Detailed Documentation):**
        * **Objective:** Define and document precise coding standards and style guides for PHP (Laravel), JavaScript (React Native/React.js), and general version control commit messages.
        * **Deliverable:** A dedicated document (e.g., Markdown file, Confluence page) outlining:
            * **PHP (Laravel):** Specific PSR-12 enforcement, Laravel-specific conventions (e.g., controller/model naming, dependency injection patterns, service layer usage).
            * **JavaScript/React Native/React.js:** ESLint configuration, Prettier configuration (rules should be committed to the repo), consistent component structuring (e.g., atomic design principles if applicable), naming conventions (variables, functions, files).
            * **Git Commit Message Convention:** (e.g., Conventional Commits for semantic versioning, or a simpler `Type: Subject` format like `feat: Add user registration endpoint`).
    * **2.2. Comprehensive API Contract Definition (Backend & Frontend Collaboration):**
        * **Objective:** Define every single API endpoint required for the entire MVP (both Funlynk Core and Spark) to facilitate independent backend and frontend development.
        * **Deliverable:** An OpenAPI/Swagger specification or a detailed Markdown document for each endpoint, including:
            * **Endpoint Path & HTTP Method:** (e.g., `POST /api/users/register`, `GET /api/spark/programs/{id}/permission-slips`).
            * **Detailed Request Payloads:** JSON structure, data types, examples, required/optional fields.
            * **Detailed Response Structures:** JSON structure for success (2xx), specific error responses (4xx, 5xx), data types, examples.
            * **Authentication & Authorization:** Specify security requirements (e.g., `Bearer Token`, `Teacher Role Required`).
            * **Notes:** Any specific logic or data transformations.
    * **2.3. Exhaustive Database Schema Design:**
        * **Objective:** Design and document the complete database schema that supports both Funlynk Core and Funlynk Spark, with an eye towards future extensibility.
        * **Deliverable:** A detailed Entity-Relationship Diagram (ERD) with accompanying schema definitions, specifying:
            * All tables and their relationships.
            * Every column (`name`, `data_type`, `nullable`, `default_value`, `constraints` like `unique`, `foreign key`).
            * Indexing strategies.
            * Clear identification of tables/columns relevant to Core vs. Spark.
    * **2.4. Logical Folder Structure & Modularity (Leveraging Augment's Capabilities):**
        * **Objective:** Propose and document the exact file/folder structure for the entire project (Laravel backend, React Native mobile app, React.js web interface for Spark admin).
        * **Deliverable:** A document outlining the proposed directory structure, emphasizing modularity for parallel work:
            * How Core and Spark features will be separated within the codebase (e.g., `app/Http/Controllers/Core/`, `app/Http/Controllers/Spark/`).
            * Frontend component organization (e.g., `components/core/`, `components/spark/`, `screens/core/`, `screens/spark/`).
            * Common utilities, shared components.
    * **2.5. Consistent Error Handling & Logging Strategy:**
        * **Objective:** Define uniform patterns for API error responses, frontend error display, and backend logging.
        * **Deliverable:** Document error codes, messages, and the approach for logging errors (e.g., Laravel's logging channels, frontend error boundaries).

3.  **Hierarchical To-Do List & Prioritized Task Breakdown (for Agent Assignment):**
    * **Objective:** Break down the entire MVP into individual, assignable technical tasks, clearly indicating dependencies and priority. This will be the direct input for distributing work.
    * **Deliverable:** A comprehensive task list, ideally in a format easily imported into a project management system (e.g., CSV, JSON), structured hierarchically:
        * **Epics:** (e.g., User Authentication, Spark Permission Slips, Core Event Creation).
        * **User Stories:** For each Epic (e.g., "As a Parent, I want to digitally sign my child's permission slip...").
        * **Granular Technical Tasks:** For each User Story (e.g., "Backend: Implement `POST /api/spark/permission-slips/{id}/sign` endpoint," "Frontend: Design and implement `ParentPermissionSlipScreen` component," "DB: Add `signed_at` column to `permission_slips` table").
        * **Dependencies:** Explicitly list which tasks depend on others (e.g., "Task A depends on Task B and C").
        * **Estimated Effort:** (Rough estimates in hours/days for each task).
        * **Clear Priority:** High, Medium, Low (or numerical priority).
        * **Suggested Agent Assignment Categories:** Categorize tasks into logical blocks that can be assigned to different agents (e.g., "Backend Auth," "Spark Web Admin," "Core Mobile UI," "Spark Mobile Parent Flow"). This directly addresses how agents can work in parallel.
            * *Example Blocks:*
                * **Backend - Core Foundations:** User Auth API, Base Models.
                * **Backend - Spark Admin APIs:** Program Management, Roster Upload, Permission Slip API.
                * **Frontend - Mobile Core UI:** User Profile, Event List/Search.
                * **Frontend - Mobile Spark UI:** Parent Permission Slip Flow, Teacher Attendance Tool.
                * **Frontend - Spark Web Admin UI:** School/District Dashboards, Trip Booking.

**Why this approach is crucial:**

* **Minimizing Conflicts:** By defining APIs, DB schema, and code structure *before* parallel coding, agents won't unknowingly overwrite each other's work or build incompatible components.
* **Enforcing Standards:** Codifying standards upfront ensures a consistent, maintainable codebase from day one.
* **Accelerated Development:** Once this blueprint is solid, agents can work independently with confidence, leading to a much faster overall development cycle.
* **Clear Success Metrics:** Every task having clear acceptance criteria means we can definitively say when a feature is "done."
