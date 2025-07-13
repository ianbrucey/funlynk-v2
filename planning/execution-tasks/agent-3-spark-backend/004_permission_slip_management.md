# Task 004: Permission Slip Management API
**Agent**: Spark Backend Developer  
**Estimated Time**: 6-7 hours  
**Priority**: High  
**Dependencies**: Task 003 (Booking Management API)  

## Overview
Implement comprehensive permission slip management system including digital signature collection, parent notifications, automated reminders, and compliance tracking for Spark program bookings.

## Prerequisites
- Task 003 completed successfully
- Booking management API working
- Email and SMS services available
- File upload service for signature storage

## Step-by-Step Implementation

### Step 1: Create Permission Slip Models (75 minutes)

**Create PermissionSlip model (app/Models/Spark/PermissionSlip.php):**
```php
<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class PermissionSlip extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'booking_id',
        'student_id',
        'token',
        'parent_name',
        'parent_email',
        'parent_phone',
        'emergency_contacts',
        'medical_info',
        'special_instructions',
        'photo_permission',
        'is_signed',
        'signature_data',
        'signed_at',
        'signed_ip',
        'reminder_sent_count',
        'last_reminder_sent_at',
    ];

    protected $casts = [
        'emergency_contacts' => 'array',
        'medical_info' => 'array',
        'photo_permission' => 'boolean',
        'is_signed' => 'boolean',
        'signed_at' => 'datetime',
        'reminder_sent_count' => 'integer',
        'last_reminder_sent_at' => 'datetime',
    ];

    // Relationships
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(BookingStudent::class, 'student_id');
    }

    // Scopes
    public function scopeSigned($query)
    {
        return $query->where('is_signed', true);
    }

    public function scopeUnsigned($query)
    {
        return $query->where('is_signed', false);
    }

    public function scopeByBooking($query, int $bookingId)
    {
        return $query->where('booking_id', $bookingId);
    }

    public function scopeOverdue($query)
    {
        return $query->where('is_signed', false)
                    ->whereHas('booking', function ($q) {
                        $q->where('confirmed_date', '<=', now()->addDays(3));
                    });
    }

    // Accessors
    public function getSigningUrlAttribute(): string
    {
        return config('app.frontend_url') . '/permission-slip/' . $this->token;
    }

    public function getIsOverdueAttribute(): bool
    {
        return !$this->is_signed && 
               $this->booking->confirmed_date && 
               $this->booking->confirmed_date->diffInDays(now()) <= 3;
    }

    public function getDaysUntilEventAttribute(): int
    {
        return $this->booking->confirmed_date ? 
               max(0, now()->diffInDays($this->booking->confirmed_date, false)) : 0;
    }

    // Methods
    public function generateToken(): string
    {
        $token = Str::random(32);
        $this->update(['token' => $token]);
        return $token;
    }

    public function sign(array $signatureData, string $ipAddress): bool
    {
        if ($this->is_signed) {
            return false;
        }

        $this->update([
            'is_signed' => true,
            'signature_data' => json_encode($signatureData),
            'signed_at' => now(),
            'signed_ip' => $ipAddress,
        ]);

        return true;
    }

    public function incrementReminderCount(): void
    {
        $this->increment('reminder_sent_count');
        $this->update(['last_reminder_sent_at' => now()]);
    }

    public function canSendReminder(): bool
    {
        if ($this->is_signed) {
            return false;
        }

        // Don't send more than 3 reminders
        if ($this->reminder_sent_count >= 3) {
            return false;
        }

        // Wait at least 24 hours between reminders
        if ($this->last_reminder_sent_at && 
            $this->last_reminder_sent_at->diffInHours(now()) < 24) {
            return false;
        }

        return true;
    }
}
```

**Create PermissionSlipTemplate model (app/Models/Spark/PermissionSlipTemplate.php):**
```php
<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PermissionSlipTemplate extends Model
{
    protected $fillable = [
        'name',
        'title',
        'content',
        'required_fields',
        'emergency_contact_fields',
        'medical_fields',
        'photo_permission_text',
        'signature_text',
        'is_default',
        'is_active',
    ];

    protected $casts = [
        'required_fields' => 'array',
        'emergency_contact_fields' => 'array',
        'medical_fields' => 'array',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function permissionSlips(): HasMany
    {
        return $this->hasMany(PermissionSlip::class, 'template_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    // Methods
    public function renderContent(array $variables = []): string
    {
        $content = $this->content;
        
        foreach ($variables as $key => $value) {
            $content = str_replace("{{$key}}", $value, $content);
        }
        
        return $content;
    }
}
```

### Step 2: Create Permission Slip Controllers (120 minutes)

**Create PermissionSlipController (app/Http/Controllers/Api/V1/Spark/PermissionSlipController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\CreatePermissionSlipRequest;
use App\Http\Requests\Spark\SignPermissionSlipRequest;
use App\Http\Resources\Spark\PermissionSlipResource;
use App\Services\Spark\PermissionSlipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionSlipController extends BaseApiController
{
    public function __construct(
        private PermissionSlipService $permissionSlipService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get permission slips list
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id' => 'sometimes|exists:bookings,id',
            'is_signed' => 'sometimes|boolean',
            'is_overdue' => 'sometimes|boolean',
            'search' => 'sometimes|string|max:255',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $permissionSlips = $this->permissionSlipService->getPermissionSlips($request->validated());
        
        return $this->paginatedResponse($permissionSlips, 'Permission slips retrieved successfully');
    }

    /**
     * Create permission slips for booking
     */
    public function store(CreatePermissionSlipRequest $request): JsonResponse
    {
        try {
            $result = $this->permissionSlipService->createPermissionSlipsForBooking(
                $request->booking_id,
                $request->validated()
            );
            
            return $this->successResponse($result, 'Permission slips created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get permission slip by token (public endpoint)
     */
    public function showByToken(string $token): JsonResponse
    {
        $permissionSlip = $this->permissionSlipService->getPermissionSlipByToken($token);
        
        if (!$permissionSlip) {
            return $this->notFoundResponse('Permission slip not found');
        }

        return $this->successResponse(
            new PermissionSlipResource($permissionSlip),
            'Permission slip retrieved successfully'
        );
    }

    /**
     * Get permission slip by ID
     */
    public function show(int $id): JsonResponse
    {
        $permissionSlip = $this->permissionSlipService->getPermissionSlipById($id);
        
        if (!$permissionSlip) {
            return $this->notFoundResponse('Permission slip not found');
        }

        $this->authorize('view', $permissionSlip);

        return $this->successResponse(
            new PermissionSlipResource($permissionSlip),
            'Permission slip retrieved successfully'
        );
    }

    /**
     * Sign permission slip (public endpoint)
     */
    public function sign(string $token, SignPermissionSlipRequest $request): JsonResponse
    {
        try {
            $result = $this->permissionSlipService->signPermissionSlip(
                $token,
                $request->validated(),
                $request->ip()
            );

            if (!$result) {
                return $this->errorResponse('Unable to sign permission slip', 400);
            }

            return $this->successResponse(null, 'Permission slip signed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Send reminder for permission slip
     */
    public function sendReminder(int $id): JsonResponse
    {
        $permissionSlip = $this->permissionSlipService->getPermissionSlipById($id);
        
        if (!$permissionSlip) {
            return $this->notFoundResponse('Permission slip not found');
        }

        $this->authorize('update', $permissionSlip);

        try {
            $result = $this->permissionSlipService->sendReminder($permissionSlip);

            if (!$result) {
                return $this->errorResponse('Unable to send reminder', 400);
            }

            return $this->successResponse(null, 'Reminder sent successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Send bulk reminders
     */
    public function sendBulkReminders(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id' => 'sometimes|exists:bookings,id',
            'overdue_only' => 'sometimes|boolean',
        ]);

        try {
            $result = $this->permissionSlipService->sendBulkReminders($request->validated());
            
            return $this->successResponse($result, 'Bulk reminders sent successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get permission slip statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id' => 'sometimes|exists:bookings,id',
            'date_range' => 'sometimes|string|in:week,month,quarter,year',
        ]);

        $stats = $this->permissionSlipService->getStatistics($request->validated());
        
        return $this->successResponse($stats, 'Statistics retrieved successfully');
    }

    /**
     * Export permission slips
     */
    public function export(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'format' => 'sometimes|string|in:pdf,csv,excel',
        ]);

        try {
            $result = $this->permissionSlipService->exportPermissionSlips(
                $request->booking_id,
                $request->format ?? 'pdf'
            );
            
            return $this->successResponse($result, 'Permission slips exported successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
```

### Step 3: Create Permission Slip Service (120 minutes)

**Create PermissionSlipService (app/Services/Spark/PermissionSlipService.php):**
```php
<?php

namespace App\Services\Spark;

use App\Models\Spark\PermissionSlip;
use App\Models\Spark\Booking;
use App\Models\Spark\BookingStudent;
use App\Services\Shared\EmailService;
use App\Services\Shared\SMSService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PermissionSlipService
{
    public function __construct(
        private EmailService $emailService,
        private SMSService $smsService
    ) {}

    public function getPermissionSlips(array $filters = []): LengthAwarePaginator
    {
        $query = PermissionSlip::with(['booking.school', 'booking.program', 'student']);

        if (isset($filters['booking_id'])) {
            $query->byBooking($filters['booking_id']);
        }

        if (isset($filters['is_signed'])) {
            if ($filters['is_signed']) {
                $query->signed();
            } else {
                $query->unsigned();
            }
        }

        if (isset($filters['is_overdue']) && $filters['is_overdue']) {
            $query->overdue();
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('parent_name', 'LIKE', "%{$filters['search']}%")
                  ->orWhere('parent_email', 'LIKE', "%{$filters['search']}%")
                  ->orWhereHas('student', function ($student) use ($filters) {
                      $student->where('first_name', 'LIKE', "%{$filters['search']}%")
                              ->orWhere('last_name', 'LIKE', "%{$filters['search']}%");
                  });
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 20);
    }

    public function createPermissionSlipsForBooking(int $bookingId, array $data): array
    {
        $booking = Booking::with(['students'])->findOrFail($bookingId);

        if ($booking->status !== 'confirmed') {
            throw new \Exception('Permission slips can only be created for confirmed bookings');
        }

        return DB::transaction(function () use ($booking, $data) {
            $createdSlips = [];

            foreach ($booking->students as $student) {
                // Check if permission slip already exists
                $existingSlip = PermissionSlip::where('booking_id', $booking->id)
                    ->where('student_id', $student->id)
                    ->first();

                if ($existingSlip) {
                    continue;
                }

                $slip = PermissionSlip::create([
                    'booking_id' => $booking->id,
                    'student_id' => $student->id,
                    'token' => \Str::random(32),
                    'parent_name' => $student->parent_name,
                    'parent_email' => $student->parent_email,
                    'parent_phone' => $student->parent_phone,
                    'emergency_contacts' => $student->emergency_contact ?? [],
                    'medical_info' => $student->medical_info ?? [],
                    'photo_permission' => false,
                    'is_signed' => false,
                    'reminder_sent_count' => 0,
                ]);

                // Send initial email
                $this->sendPermissionSlipEmail($slip);

                $createdSlips[] = $slip;
            }

            return [
                'created_count' => count($createdSlips),
                'total_students' => $booking->students->count(),
                'permission_slips' => $createdSlips,
            ];
        });
    }

    public function signPermissionSlip(string $token, array $data, string $ipAddress): bool
    {
        $slip = $this->getPermissionSlipByToken($token);

        if (!$slip) {
            throw new \Exception('Permission slip not found');
        }

        if ($slip->is_signed) {
            throw new \Exception('Permission slip already signed');
        }

        return DB::transaction(function () use ($slip, $data, $ipAddress) {
            // Update permission slip with signed data
            $slip->update([
                'parent_name' => $data['parent_name'],
                'parent_email' => $data['parent_email'],
                'parent_phone' => $data['parent_phone'],
                'emergency_contacts' => $data['emergency_contacts'] ?? [],
                'medical_info' => $data['medical_info'] ?? [],
                'special_instructions' => $data['special_instructions'] ?? null,
                'photo_permission' => $data['photo_permission'] ?? false,
            ]);

            // Sign the permission slip
            $result = $slip->sign([
                'signature' => $data['signature'],
                'timestamp' => now()->toISOString(),
                'parent_name' => $data['parent_name'],
            ], $ipAddress);

            if ($result) {
                // Send confirmation email
                $this->sendSignedConfirmationEmail($slip);
            }

            return $result;
        });
    }

    public function getStatistics(array $filters = []): array
    {
        $query = PermissionSlip::query();

        if (isset($filters['booking_id'])) {
            $query->byBooking($filters['booking_id']);
        }

        $total = $query->count();
        $signed = $query->clone()->signed()->count();
        $unsigned = $query->clone()->unsigned()->count();
        $overdue = $query->clone()->overdue()->count();

        return [
            'total_permission_slips' => $total,
            'signed_count' => $signed,
            'unsigned_count' => $unsigned,
            'overdue_count' => $overdue,
            'completion_rate' => $total > 0 ? round(($signed / $total) * 100, 2) : 0,
            'overdue_rate' => $total > 0 ? round(($overdue / $total) * 100, 2) : 0,
        ];
    }

    private function sendPermissionSlipEmail(PermissionSlip $slip): bool
    {
        return $this->emailService->sendPermissionSlipEmail(
            $slip->parent_email,
            [
                'slip' => $slip,
                'student_name' => $slip->student->full_name,
                'program_title' => $slip->booking->program->title,
                'school_name' => $slip->booking->school->name,
                'event_date' => $slip->booking->confirmed_date?->format('F j, Y'),
                'signing_url' => $slip->signing_url,
            ]
        );
    }
}
```

### Step 4: Create Routes and Resources (45 minutes)

**Update routes/api/spark.php:**
```php
// Add to existing routes

Route::prefix('permission-slips')->group(function () {
    Route::get('/', [PermissionSlipController::class, 'index']);
    Route::post('/', [PermissionSlipController::class, 'store']);
    Route::get('/{id}', [PermissionSlipController::class, 'show']);
    Route::post('/{id}/reminder', [PermissionSlipController::class, 'sendReminder']);
    Route::post('/bulk-reminders', [PermissionSlipController::class, 'sendBulkReminders']);
    Route::get('/statistics', [PermissionSlipController::class, 'statistics']);
    Route::post('/{bookingId}/export', [PermissionSlipController::class, 'export']);
});

// Public routes (no authentication required)
Route::prefix('public/permission-slips')->group(function () {
    Route::get('/{token}', [PermissionSlipController::class, 'showByToken']);
    Route::post('/{token}/sign', [PermissionSlipController::class, 'sign']);
});
```

## Acceptance Criteria

### Permission Slip Creation
- [ ] Automatically create permission slips for confirmed bookings
- [ ] Generate unique tokens for secure access
- [ ] Pre-populate with student and parent information
- [ ] Send initial email notifications to parents

### Digital Signing
- [ ] Secure token-based access to permission slips
- [ ] Digital signature capture and storage
- [ ] Parent information validation and updates
- [ ] Emergency contact and medical information collection
- [ ] Photo permission consent

### Reminder System
- [ ] Automated reminder emails and SMS
- [ ] Configurable reminder frequency and limits
- [ ] Bulk reminder functionality
- [ ] Overdue permission slip identification

### Compliance and Tracking
- [ ] Permission slip status tracking
- [ ] Signature verification and audit trail
- [ ] Export functionality for compliance
- [ ] Statistical reporting and analytics

## Testing Instructions

### Manual Testing
```bash
# Create permission slips for booking
curl -X POST http://localhost:8000/api/v1/spark/permission-slips \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"booking_id":1}'

# Get permission slip by token (public)
curl -X GET http://localhost:8000/api/v1/spark/public/permission-slips/TOKEN_HERE

# Sign permission slip (public)
curl -X POST http://localhost:8000/api/v1/spark/public/permission-slips/TOKEN_HERE/sign \
  -H "Content-Type: application/json" \
  -d '{"parent_name":"John Doe","parent_email":"john@example.com","parent_phone":"555-1234","signature":"signature_data","photo_permission":true}'
```

## Next Steps
After completion, proceed to:
- Task 005: Reporting and Analytics API
- Coordinate with Agent 6 on mobile permission slip UI
- Test permission slip workflow end-to-end

## Documentation
- Update API documentation with permission slip endpoints
- Document digital signature workflow
- Create parent-facing permission slip guide
