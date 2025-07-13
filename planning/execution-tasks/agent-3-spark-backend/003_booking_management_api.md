# Task 003: Booking Management API
**Agent**: Spark Backend Developer  
**Estimated Time**: 8-9 hours  
**Priority**: High  
**Dependencies**: Task 002 (Program Management API)  

## Overview
Implement comprehensive booking management API for Spark programs including booking creation, confirmation, cancellation, student management, and payment integration.

## Prerequisites
- Task 002 completed successfully
- Program management API working
- School management API available
- Payment service integration available

## Step-by-Step Implementation

### Step 1: Create Booking Models (90 minutes)

**Create Booking model (app/Models/Spark/Booking.php):**
```php
<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class Booking extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'school_id',
        'program_id',
        'teacher_id',
        'booking_reference',
        'preferred_date',
        'preferred_time',
        'confirmed_date',
        'confirmed_time',
        'student_count',
        'total_cost',
        'status',
        'special_requests',
        'contact_info',
        'confirmed_at',
        'payment_status',
        'payment_due_date',
        'notes',
        'rating',
        'feedback',
    ];

    protected $casts = [
        'preferred_date' => 'date',
        'preferred_time' => 'datetime',
        'confirmed_date' => 'date',
        'confirmed_time' => 'datetime',
        'student_count' => 'integer',
        'total_cost' => 'decimal:2',
        'contact_info' => 'array',
        'confirmed_at' => 'datetime',
        'payment_due_date' => 'date',
        'rating' => 'integer',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(SparkProgram::class, 'program_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(BookingStudent::class);
    }

    public function permissionSlips(): HasMany
    {
        return $this->hasMany(PermissionSlip::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('confirmed_date', '>=', now()->toDateString())
                    ->whereIn('status', ['confirmed', 'pending']);
    }

    public function scopeBySchool($query, int $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeByTeacher($query, int $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    public function scopeByDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('confirmed_date', [$startDate, $endDate]);
    }

    // Accessors
    public function getIsConfirmedAttribute(): bool
    {
        return $this->status === 'confirmed';
    }

    public function getIsPendingAttribute(): bool
    {
        return $this->status === 'pending';
    }

    public function getIsCancelledAttribute(): bool
    {
        return $this->status === 'cancelled';
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }

    public function getCanBeCancelledAttribute(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']) && 
               $this->confirmed_date && 
               $this->confirmed_date->diffInDays(now()) >= 1;
    }

    public function getPermissionSlipsSignedCountAttribute(): int
    {
        return $this->permissionSlips()->where('is_signed', true)->count();
    }

    public function getPermissionSlipsRequiredCountAttribute(): int
    {
        return $this->students()->count();
    }

    public function getAllPermissionSlipsSignedAttribute(): bool
    {
        return $this->permission_slips_signed_count === $this->permission_slips_required_count;
    }

    // Methods
    public function generateReference(): string
    {
        return 'SPK-' . strtoupper(substr($this->school->code, 0, 3)) . '-' . 
               date('Ymd') . '-' . str_pad($this->id, 4, '0', STR_PAD_LEFT);
    }

    public function calculateTotalCost(): float
    {
        return $this->student_count * $this->program->price_per_student;
    }

    public function confirm(string $date, string $time): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }

        $this->update([
            'status' => 'confirmed',
            'confirmed_date' => $date,
            'confirmed_time' => $date . ' ' . $time,
            'confirmed_at' => now(),
            'payment_due_date' => now()->addDays(7)->toDateString(),
        ]);

        return true;
    }

    public function cancel(string $reason = null): bool
    {
        if (!$this->can_be_cancelled) {
            return false;
        }

        $this->update([
            'status' => 'cancelled',
            'notes' => ($this->notes ? $this->notes . "\n" : '') . 
                      'Cancelled: ' . ($reason ?: 'No reason provided'),
        ]);

        return true;
    }

    public function complete(int $rating = null, string $feedback = null): bool
    {
        if ($this->status !== 'confirmed' || $this->confirmed_date > now()) {
            return false;
        }

        $this->update([
            'status' => 'completed',
            'rating' => $rating,
            'feedback' => $feedback,
        ]);

        return true;
    }
}
```

**Create BookingStudent model (app/Models/Spark/BookingStudent.php):**
```php
<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingStudent extends Model
{
    protected $fillable = [
        'booking_id',
        'student_id',
        'first_name',
        'last_name',
        'grade_level',
        'student_id_number',
        'emergency_contact',
        'medical_info',
        'dietary_restrictions',
        'special_needs',
        'parent_name',
        'parent_email',
        'parent_phone',
        'is_attending',
        'checked_in_at',
    ];

    protected $casts = [
        'emergency_contact' => 'array',
        'medical_info' => 'array',
        'dietary_restrictions' => 'array',
        'special_needs' => 'array',
        'is_attending' => 'boolean',
        'checked_in_at' => 'datetime',
    ];

    // Relationships
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    // Accessors
    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getIsCheckedInAttribute(): bool
    {
        return !is_null($this->checked_in_at);
    }

    // Methods
    public function checkIn(): bool
    {
        if (!$this->is_attending || $this->is_checked_in) {
            return false;
        }

        $this->update(['checked_in_at' => now()]);
        return true;
    }
}
```

### Step 2: Create Booking Controllers (150 minutes)

**Create BookingController (app/Http/Controllers/Api/V1/Spark/BookingController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\CreateBookingRequest;
use App\Http\Requests\Spark\UpdateBookingRequest;
use App\Http\Resources\Spark\BookingResource;
use App\Services\Spark\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends BaseApiController
{
    public function __construct(
        private BookingService $bookingService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get bookings list
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'school_id' => 'sometimes|exists:schools,id',
            'teacher_id' => 'sometimes|exists:users,id',
            'program_id' => 'sometimes|exists:spark_programs,id',
            'status' => 'sometimes|string|in:pending,confirmed,cancelled,completed',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'search' => 'sometimes|string|max:255',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $bookings = $this->bookingService->getBookings($request->validated());

        return $this->paginatedResponse($bookings, 'Bookings retrieved successfully');
    }

    /**
     * Create new booking
     */
    public function store(CreateBookingRequest $request): JsonResponse
    {
        try {
            $booking = $this->bookingService->createBooking(auth()->user(), $request->validated());

            return $this->successResponse(
                new BookingResource($booking),
                'Booking created successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get booking by ID
     */
    public function show(int $id): JsonResponse
    {
        $booking = $this->bookingService->getBookingById($id);

        if (!$booking) {
            return $this->notFoundResponse('Booking not found');
        }

        $this->authorize('view', $booking);

        return $this->successResponse(
            new BookingResource($booking),
            'Booking retrieved successfully'
        );
    }

    /**
     * Update booking
     */
    public function update(UpdateBookingRequest $request, int $id): JsonResponse
    {
        $booking = $this->bookingService->getBookingById($id);

        if (!$booking) {
            return $this->notFoundResponse('Booking not found');
        }

        $this->authorize('update', $booking);

        try {
            $booking = $this->bookingService->updateBooking($booking, $request->validated());

            return $this->successResponse(
                new BookingResource($booking),
                'Booking updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Confirm booking
     */
    public function confirm(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'confirmed_date' => 'required|date|after_or_equal:today',
            'confirmed_time' => 'required|date_format:H:i',
            'notes' => 'sometimes|string|max:1000',
        ]);

        $booking = $this->bookingService->getBookingById($id);

        if (!$booking) {
            return $this->notFoundResponse('Booking not found');
        }

        $this->authorize('confirm', $booking);

        try {
            $result = $this->bookingService->confirmBooking(
                $booking,
                $request->confirmed_date,
                $request->confirmed_time,
                $request->notes
            );

            if (!$result) {
                return $this->errorResponse('Unable to confirm booking', 400);
            }

            return $this->successResponse(
                new BookingResource($booking->fresh()),
                'Booking confirmed successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Cancel booking
     */
    public function cancel(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'reason' => 'sometimes|string|max:500',
        ]);

        $booking = $this->bookingService->getBookingById($id);

        if (!$booking) {
            return $this->notFoundResponse('Booking not found');
        }

        $this->authorize('cancel', $booking);

        try {
            $result = $this->bookingService->cancelBooking($booking, $request->reason);

            if (!$result) {
                return $this->errorResponse('Unable to cancel booking', 400);
            }

            return $this->successResponse(null, 'Booking cancelled successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Complete booking
     */
    public function complete(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'feedback' => 'sometimes|string|max:1000',
        ]);

        $booking = $this->bookingService->getBookingById($id);

        if (!$booking) {
            return $this->notFoundResponse('Booking not found');
        }

        $this->authorize('complete', $booking);

        try {
            $result = $this->bookingService->completeBooking(
                $booking,
                $request->rating,
                $request->feedback
            );

            if (!$result) {
                return $this->errorResponse('Unable to complete booking', 400);
            }

            return $this->successResponse(
                new BookingResource($booking->fresh()),
                'Booking completed successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get booking students
     */
    public function students(int $id, Request $request): JsonResponse
    {
        $booking = $this->bookingService->getBookingById($id);

        if (!$booking) {
            return $this->notFoundResponse('Booking not found');
        }

        $this->authorize('view', $booking);

        $students = $this->bookingService->getBookingStudents($id, $request->per_page ?? 50);

        return $this->paginatedResponse($students, 'Booking students retrieved successfully');
    }

    /**
     * Add students to booking
     */
    public function addStudents(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'students' => 'required|array|min:1|max:100',
            'students.*.first_name' => 'required|string|max:255',
            'students.*.last_name' => 'required|string|max:255',
            'students.*.grade_level' => 'required|string|in:K,1,2,3,4,5,6,7,8,9,10,11,12',
            'students.*.student_id_number' => 'sometimes|string|max:50',
            'students.*.parent_name' => 'required|string|max:255',
            'students.*.parent_email' => 'required|email|max:255',
            'students.*.parent_phone' => 'required|string|max:20',
            'students.*.emergency_contact' => 'sometimes|array',
            'students.*.medical_info' => 'sometimes|array',
            'students.*.dietary_restrictions' => 'sometimes|array',
            'students.*.special_needs' => 'sometimes|array',
        ]);

        try {
            $result = $this->bookingService->addStudentsToBooking($id, $request->students);

            return $this->successResponse($result, 'Students added to booking successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
```

### Step 3: Create Request Validation Classes (60 minutes)

**Create CreateBookingRequest (app/Http/Requests/Spark/CreateBookingRequest.php):**
```php
<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;

class CreateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_id' => ['required', 'exists:schools,id'],
            'program_id' => ['required', 'exists:spark_programs,id'],
            'preferred_date' => ['required', 'date', 'after_or_equal:today'],
            'preferred_time' => ['required', 'date_format:H:i'],
            'student_count' => ['required', 'integer', 'min:1', 'max:100'],
            'special_requests' => ['sometimes', 'string', 'max:1000'],
            'contact_info' => ['required', 'array'],
            'contact_info.primary_contact_name' => ['required', 'string', 'max:255'],
            'contact_info.primary_contact_email' => ['required', 'email', 'max:255'],
            'contact_info.primary_contact_phone' => ['required', 'string', 'max:20'],
            'contact_info.secondary_contact_name' => ['sometimes', 'string', 'max:255'],
            'contact_info.secondary_contact_email' => ['sometimes', 'email', 'max:255'],
            'contact_info.secondary_contact_phone' => ['sometimes', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'school_id.exists' => 'Selected school does not exist',
            'program_id.exists' => 'Selected program does not exist',
            'preferred_date.after_or_equal' => 'Preferred date must be today or in the future',
            'student_count.min' => 'At least 1 student is required',
            'student_count.max' => 'Maximum 100 students allowed per booking',
            'contact_info.primary_contact_name.required' => 'Primary contact name is required',
            'contact_info.primary_contact_email.required' => 'Primary contact email is required',
            'contact_info.primary_contact_phone.required' => 'Primary contact phone is required',
        ];
    }
}
```

### Step 4: Create Booking Service (120 minutes)

**Create BookingService (app/Services/Spark/BookingService.php):**
```php
<?php

namespace App\Services\Spark;

use App\Models\Spark\Booking;
use App\Models\Spark\BookingStudent;
use App\Models\Spark\SparkProgram;
use App\Models\Spark\School;
use App\Models\User;
use App\Services\Shared\EmailService;
use App\Services\Shared\NotificationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class BookingService
{
    public function __construct(
        private EmailService $emailService,
        private NotificationService $notificationService
    ) {}

    public function getBookings(array $filters = []): LengthAwarePaginator
    {
        $query = Booking::with(['school', 'program', 'teacher', 'students']);

        if (isset($filters['school_id'])) {
            $query->bySchool($filters['school_id']);
        }

        if (isset($filters['teacher_id'])) {
            $query->byTeacher($filters['teacher_id']);
        }

        if (isset($filters['program_id'])) {
            $query->where('program_id', $filters['program_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->byDateRange($filters['start_date'], $filters['end_date']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('booking_reference', 'LIKE', "%{$filters['search']}%")
                  ->orWhereHas('school', function ($school) use ($filters) {
                      $school->where('name', 'LIKE', "%{$filters['search']}%");
                  })
                  ->orWhereHas('program', function ($program) use ($filters) {
                      $program->where('title', 'LIKE', "%{$filters['search']}%");
                  });
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 20);
    }

    public function createBooking(User $teacher, array $data): Booking
    {
        $program = SparkProgram::findOrFail($data['program_id']);
        $school = School::findOrFail($data['school_id']);

        // Validate student count against program capacity
        if ($data['student_count'] > $program->max_students) {
            throw new \Exception("Student count exceeds program capacity of {$program->max_students}");
        }

        return DB::transaction(function () use ($teacher, $data, $program, $school) {
            $booking = Booking::create([
                'school_id' => $data['school_id'],
                'program_id' => $data['program_id'],
                'teacher_id' => $teacher->id,
                'preferred_date' => $data['preferred_date'],
                'preferred_time' => $data['preferred_date'] . ' ' . $data['preferred_time'],
                'student_count' => $data['student_count'],
                'total_cost' => $data['student_count'] * $program->price_per_student,
                'status' => 'pending',
                'special_requests' => $data['special_requests'] ?? null,
                'contact_info' => $data['contact_info'],
                'payment_status' => 'pending',
            ]);

            // Generate booking reference
            $booking->update([
                'booking_reference' => $booking->generateReference()
            ]);

            // Send confirmation email
            $this->sendBookingConfirmationEmail($booking);

            return $booking->load(['school', 'program', 'teacher']);
        });
    }

    public function getBookingById(int $id): ?Booking
    {
        return Booking::with(['school', 'program', 'teacher', 'students', 'permissionSlips'])->find($id);
    }

    public function updateBooking(Booking $booking, array $data): Booking
    {
        if ($booking->status === 'confirmed' && isset($data['student_count'])) {
            throw new \Exception('Cannot change student count for confirmed bookings');
        }

        return DB::transaction(function () use ($booking, $data) {
            // Recalculate total cost if student count changed
            if (isset($data['student_count'])) {
                $data['total_cost'] = $data['student_count'] * $booking->program->price_per_student;
            }

            $booking->update($data);
            return $booking->fresh(['school', 'program', 'teacher']);
        });
    }

    public function confirmBooking(Booking $booking, string $date, string $time, ?string $notes = null): bool
    {
        if ($booking->status !== 'pending') {
            throw new \Exception('Only pending bookings can be confirmed');
        }

        return DB::transaction(function () use ($booking, $date, $time, $notes) {
            $result = $booking->confirm($date, $time);

            if ($result && $notes) {
                $booking->update(['notes' => $notes]);
            }

            // Send confirmation email
            $this->sendBookingConfirmedEmail($booking);

            return $result;
        });
    }

    public function cancelBooking(Booking $booking, ?string $reason = null): bool
    {
        return DB::transaction(function () use ($booking, $reason) {
            $result = $booking->cancel($reason);

            if ($result) {
                // Send cancellation email
                $this->sendBookingCancelledEmail($booking, $reason);
            }

            return $result;
        });
    }

    public function completeBooking(Booking $booking, ?int $rating = null, ?string $feedback = null): bool
    {
        return DB::transaction(function () use ($booking, $rating, $feedback) {
            $result = $booking->complete($rating, $feedback);

            if ($result) {
                // Send completion email
                $this->sendBookingCompletedEmail($booking);
            }

            return $result;
        });
    }

    public function getBookingStudents(int $bookingId, int $perPage = 50): LengthAwarePaginator
    {
        return BookingStudent::with(['booking'])
            ->where('booking_id', $bookingId)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($perPage);
    }

    public function addStudentsToBooking(int $bookingId, array $studentsData): array
    {
        $booking = Booking::findOrFail($bookingId);

        if ($booking->status === 'completed') {
            throw new \Exception('Cannot add students to completed booking');
        }

        return DB::transaction(function () use ($booking, $studentsData) {
            $addedStudents = [];

            foreach ($studentsData as $studentData) {
                $student = BookingStudent::create([
                    'booking_id' => $booking->id,
                    'first_name' => $studentData['first_name'],
                    'last_name' => $studentData['last_name'],
                    'grade_level' => $studentData['grade_level'],
                    'student_id_number' => $studentData['student_id_number'] ?? null,
                    'parent_name' => $studentData['parent_name'],
                    'parent_email' => $studentData['parent_email'],
                    'parent_phone' => $studentData['parent_phone'],
                    'emergency_contact' => $studentData['emergency_contact'] ?? null,
                    'medical_info' => $studentData['medical_info'] ?? null,
                    'dietary_restrictions' => $studentData['dietary_restrictions'] ?? null,
                    'special_needs' => $studentData['special_needs'] ?? null,
                    'is_attending' => true,
                ]);

                $addedStudents[] = $student;
            }

            // Update booking student count
            $booking->update(['student_count' => $booking->students()->count()]);

            return [
                'added_count' => count($addedStudents),
                'total_students' => $booking->student_count,
                'students' => $addedStudents,
            ];
        });
    }

    private function sendBookingConfirmationEmail(Booking $booking): void
    {
        $this->emailService->sendEmail(
            $booking->contact_info['primary_contact_email'],
            'Spark Program Booking Confirmation',
            'emails.spark.booking-confirmation',
            [
                'booking' => $booking,
                'school' => $booking->school,
                'program' => $booking->program,
                'teacher' => $booking->teacher,
            ]
        );
    }

    private function sendBookingConfirmedEmail(Booking $booking): void
    {
        $this->emailService->sendEmail(
            $booking->contact_info['primary_contact_email'],
            'Spark Program Booking Confirmed',
            'emails.spark.booking-confirmed',
            [
                'booking' => $booking,
                'school' => $booking->school,
                'program' => $booking->program,
            ]
        );
    }

    private function sendBookingCancelledEmail(Booking $booking, ?string $reason): void
    {
        $this->emailService->sendEmail(
            $booking->contact_info['primary_contact_email'],
            'Spark Program Booking Cancelled',
            'emails.spark.booking-cancelled',
            [
                'booking' => $booking,
                'reason' => $reason,
            ]
        );
    }

    private function sendBookingCompletedEmail(Booking $booking): void
    {
        $this->emailService->sendEmail(
            $booking->contact_info['primary_contact_email'],
            'Spark Program Completed',
            'emails.spark.booking-completed',
            [
                'booking' => $booking,
                'program' => $booking->program,
            ]
        );
    }
}
```

### Step 5: Create Routes and Resources (30 minutes)

**Update routes/api/spark.php:**
```php
// Add to existing routes

Route::prefix('bookings')->group(function () {
    Route::get('/', [BookingController::class, 'index']);
    Route::post('/', [BookingController::class, 'store']);
    Route::get('/{id}', [BookingController::class, 'show']);
    Route::put('/{id}', [BookingController::class, 'update']);

    // Booking actions
    Route::post('/{id}/confirm', [BookingController::class, 'confirm']);
    Route::post('/{id}/cancel', [BookingController::class, 'cancel']);
    Route::post('/{id}/complete', [BookingController::class, 'complete']);

    // Student management
    Route::get('/{id}/students', [BookingController::class, 'students']);
    Route::post('/{id}/students', [BookingController::class, 'addStudents']);
});
```

## Acceptance Criteria

### Booking Management
- [ ] Create bookings with program and school selection
- [ ] Booking status management (pending, confirmed, cancelled, completed)
- [ ] Student count validation against program capacity
- [ ] Cost calculation based on student count and program price
- [ ] Booking reference generation

### Booking Workflow
- [ ] Confirm bookings with date/time assignment
- [ ] Cancel bookings with reason tracking
- [ ] Complete bookings with rating and feedback
- [ ] Email notifications for all status changes

### Student Management
- [ ] Add students to bookings with detailed information
- [ ] Parent contact information management
- [ ] Emergency contact and medical information
- [ ] Student attendance tracking

### Search and Filtering
- [ ] Filter bookings by school, teacher, program, status
- [ ] Date range filtering
- [ ] Search by booking reference, school name, program title
- [ ] Pagination support

## Testing Instructions

### Manual Testing
```bash
# Create booking
curl -X POST http://localhost:8000/api/v1/spark/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"school_id":1,"program_id":1,"preferred_date":"2024-12-01","preferred_time":"09:00","student_count":25,"contact_info":{"primary_contact_name":"John Doe","primary_contact_email":"john@school.edu","primary_contact_phone":"555-1234"}}'

# Confirm booking
curl -X POST http://localhost:8000/api/v1/spark/bookings/1/confirm \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirmed_date":"2024-12-01","confirmed_time":"09:00"}'

# Add students to booking
curl -X POST http://localhost:8000/api/v1/spark/bookings/1/students \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"students":[{"first_name":"Jane","last_name":"Smith","grade_level":"3","parent_name":"Mary Smith","parent_email":"mary@example.com","parent_phone":"555-5678"}]}'
```

## Next Steps
After completion, proceed to:
- Task 004: Permission Slip Management API
- Coordinate with Agent 6 on mobile booking UI
- Test booking workflow end-to-end

## Documentation
- Update API documentation with booking endpoints
- Document booking workflow and status transitions
- Create booking management guide for schools
