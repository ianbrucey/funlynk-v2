# Task 003: Event Interaction API
**Agent**: Core Funlynk Backend Developer  
**Estimated Time**: 6-7 hours  
**Priority**: High  
**Dependencies**: Task 002 (Event Management API)  

## Overview
Implement event interaction features including RSVP system, comments, sharing, QR codes, and check-in functionality for Core Funlynk events.

## Prerequisites
- Task 002 completed successfully
- Event management API working
- User management API available
- Notification services available

## Step-by-Step Implementation

### Step 1: Create Event Interaction Models (60 minutes)

**Create EventComment model (app/Models/Core/EventComment.php):**
```php
<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class EventComment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'event_id',
        'user_id',
        'parent_id',
        'content',
        'is_approved',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
    ];

    // Relationships
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(EventComment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(EventComment::class, 'parent_id');
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }
}
```

**Update EventAttendee model with additional methods:**
```php
// Add to existing EventAttendee model

public function scopeByStatus($query, string $status)
{
    return $query->where('status', $status);
}

public function getIsCheckedInAttribute(): bool
{
    return !is_null($this->checked_in_at);
}

public function checkIn(): bool
{
    if ($this->status !== 'going') {
        return false;
    }
    
    $this->update(['checked_in_at' => now()]);
    return true;
}
```

**Create EventShare model (app/Models/Core/EventShare.php):**
```php
<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class EventShare extends Model
{
    protected $fillable = [
        'event_id',
        'user_id',
        'platform',
        'shared_at',
    ];

    protected $casts = [
        'shared_at' => 'datetime',
    ];

    // Relationships
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

### Step 2: Create Event Interaction Controllers (120 minutes)

**Create EventAttendeeController (app/Http/Controllers/Api/V1/Core/EventAttendeeController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Core\EventAttendeeResource;
use App\Services\Core\EventAttendeeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventAttendeeController extends BaseApiController
{
    public function __construct(
        private EventAttendeeService $attendeeService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * RSVP to event
     */
    public function rsvp(int $eventId, Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:interested,going,not_going,maybe',
            'notes' => 'sometimes|string|max:500',
        ]);

        try {
            $attendee = $this->attendeeService->rsvp(
                $eventId,
                auth()->id(),
                $request->status,
                $request->notes
            );

            if (!$attendee) {
                return $this->errorResponse('Unable to RSVP to this event', 400);
            }

            return $this->successResponse(
                new EventAttendeeResource($attendee),
                'RSVP updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update RSVP', 500);
        }
    }

    /**
     * Cancel RSVP
     */
    public function cancelRsvp(int $eventId): JsonResponse
    {
        try {
            $result = $this->attendeeService->cancelRsvp($eventId, auth()->id());
            
            if (!$result) {
                return $this->errorResponse('No RSVP found to cancel', 404);
            }

            return $this->successResponse(null, 'RSVP cancelled successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to cancel RSVP', 500);
        }
    }

    /**
     * Check in to event
     */
    public function checkIn(int $eventId, Request $request): JsonResponse
    {
        $request->validate([
            'qr_code' => 'sometimes|string',
            'location' => 'sometimes|array',
            'location.latitude' => 'required_with:location|numeric',
            'location.longitude' => 'required_with:location|numeric',
        ]);

        try {
            $result = $this->attendeeService->checkIn(
                $eventId,
                auth()->id(),
                $request->qr_code,
                $request->location
            );

            if (!$result) {
                return $this->errorResponse('Unable to check in to this event', 400);
            }

            return $this->successResponse(null, 'Checked in successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to check in', 500);
        }
    }

    /**
     * Get event attendees
     */
    public function attendees(int $eventId, Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'sometimes|string|in:interested,going,not_going,maybe',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $attendees = $this->attendeeService->getEventAttendees(
            $eventId,
            $request->status,
            $request->per_page ?? 20
        );

        return $this->paginatedResponse($attendees, 'Attendees retrieved successfully');
    }

    /**
     * Get user's RSVP status for event
     */
    public function rsvpStatus(int $eventId): JsonResponse
    {
        $status = $this->attendeeService->getUserRsvpStatus($eventId, auth()->id());
        
        return $this->successResponse([
            'status' => $status,
            'is_attending' => $status === 'going',
        ], 'RSVP status retrieved successfully');
    }
}
```

**Create EventCommentController (app/Http/Controllers/Api/V1/Core/EventCommentController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Core\CreateCommentRequest;
use App\Http\Resources\Core\EventCommentResource;
use App\Services\Core\EventCommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventCommentController extends BaseApiController
{
    public function __construct(
        private EventCommentService $commentService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get event comments
     */
    public function index(int $eventId, Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:1|max:50',
        ]);

        $comments = $this->commentService->getEventComments(
            $eventId,
            $request->per_page ?? 20
        );

        return $this->paginatedResponse($comments, 'Comments retrieved successfully');
    }

    /**
     * Create comment
     */
    public function store(int $eventId, CreateCommentRequest $request): JsonResponse
    {
        try {
            $comment = $this->commentService->createComment(
                $eventId,
                auth()->id(),
                $request->validated()
            );

            return $this->successResponse(
                new EventCommentResource($comment),
                'Comment created successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create comment', 500);
        }
    }

    /**
     * Update comment
     */
    public function update(int $eventId, int $commentId, CreateCommentRequest $request): JsonResponse
    {
        $comment = $this->commentService->getCommentById($commentId);
        
        if (!$comment || $comment->event_id != $eventId) {
            return $this->notFoundResponse('Comment not found');
        }

        if ($comment->user_id !== auth()->id()) {
            return $this->forbiddenResponse('You can only edit your own comments');
        }

        try {
            $comment = $this->commentService->updateComment($comment, $request->validated());
            
            return $this->successResponse(
                new EventCommentResource($comment),
                'Comment updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update comment', 500);
        }
    }

    /**
     * Delete comment
     */
    public function destroy(int $eventId, int $commentId): JsonResponse
    {
        $comment = $this->commentService->getCommentById($commentId);
        
        if (!$comment || $comment->event_id != $eventId) {
            return $this->notFoundResponse('Comment not found');
        }

        if ($comment->user_id !== auth()->id()) {
            return $this->forbiddenResponse('You can only delete your own comments');
        }

        try {
            $this->commentService->deleteComment($comment);
            
            return $this->successResponse(null, 'Comment deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete comment', 500);
        }
    }
}
```

### Step 3: Create Service Classes (120 minutes)

**Create EventAttendeeService (app/Services/Core/EventAttendeeService.php):**
```php
<?php

namespace App\Services\Core;

use App\Models\Core\Event;
use App\Models\Core\EventAttendee;
use App\Services\Shared\NotificationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class EventAttendeeService
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function rsvp(int $eventId, int $userId, string $status, ?string $notes = null): ?EventAttendee
    {
        $event = Event::find($eventId);
        
        if (!$event || !$this->canRsvp($event, $userId, $status)) {
            return null;
        }

        return DB::transaction(function () use ($eventId, $userId, $status, $notes, $event) {
            $attendee = EventAttendee::updateOrCreate(
                ['event_id' => $eventId, 'user_id' => $userId],
                [
                    'status' => $status,
                    'notes' => $notes,
                    'rsvp_at' => now(),
                ]
            );

            // Update event statistics
            if ($status === 'going') {
                $event->host->coreProfile()->increment('events_attended');
            }

            // Send notification to host
            if ($status === 'going') {
                $this->notificationService->sendEventNotification(
                    [$event->host->device_token ?? ''],
                    [
                        'id' => $event->id,
                        'title' => $event->title,
                        'message' => auth()->user()->full_name . ' is attending your event',
                    ]
                );
            }

            return $attendee->load(['user', 'event']);
        });
    }

    public function cancelRsvp(int $eventId, int $userId): bool
    {
        $attendee = EventAttendee::where('event_id', $eventId)
            ->where('user_id', $userId)
            ->first();

        if (!$attendee) {
            return false;
        }

        return $attendee->delete();
    }

    public function checkIn(int $eventId, int $userId, ?string $qrCode = null, ?array $location = null): bool
    {
        $attendee = EventAttendee::where('event_id', $eventId)
            ->where('user_id', $userId)
            ->where('status', 'going')
            ->first();

        if (!$attendee) {
            return false;
        }

        // Validate QR code if provided
        if ($qrCode && !$this->validateQrCode($eventId, $qrCode)) {
            return false;
        }

        // Validate location if provided
        if ($location && !$this->validateLocation($eventId, $location)) {
            return false;
        }

        return $attendee->checkIn();
    }

    public function getEventAttendees(int $eventId, ?string $status = null, int $perPage = 20): LengthAwarePaginator
    {
        $query = EventAttendee::with(['user.coreProfile'])
            ->where('event_id', $eventId);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderBy('rsvp_at', 'desc')->paginate($perPage);
    }

    public function getUserRsvpStatus(int $eventId, int $userId): ?string
    {
        $attendee = EventAttendee::where('event_id', $eventId)
            ->where('user_id', $userId)
            ->first();

        return $attendee?->status;
    }

    private function canRsvp(Event $event, int $userId, string $status): bool
    {
        // Check if event is published and upcoming
        if ($event->status !== 'published' || $event->start_time <= now()) {
            return false;
        }

        // Check capacity for 'going' status
        if ($status === 'going' && $event->max_attendees) {
            $currentAttendees = $event->attendees()->where('status', 'going')->count();
            $existingRsvp = EventAttendee::where('event_id', $event->id)
                ->where('user_id', $userId)
                ->first();
            
            // If user is not already going and event is full
            if ((!$existingRsvp || $existingRsvp->status !== 'going') && $currentAttendees >= $event->max_attendees) {
                return false;
            }
        }

        return true;
    }

    private function validateQrCode(int $eventId, string $qrCode): bool
    {
        // Implement QR code validation logic
        $expectedCode = hash('sha256', $eventId . config('app.key'));
        return hash_equals($expectedCode, $qrCode);
    }

    private function validateLocation(int $eventId, array $location): bool
    {
        $event = Event::find($eventId);
        
        if (!$event->latitude || !$event->longitude) {
            return true; // No location validation needed
        }

        // Calculate distance (simple implementation)
        $distance = $this->calculateDistance(
            $event->latitude,
            $event->longitude,
            $location['latitude'],
            $location['longitude']
        );

        return $distance <= 0.5; // Within 500 meters
    }

    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));

        return $earthRadius * $c;
    }
}
```

### Step 4: Create Request Validation and Resources (60 minutes)

**Create CreateCommentRequest (app/Http/Requests/Core/CreateCommentRequest.php):**
```php
<?php

namespace App\Http\Requests\Core;

use Illuminate\Foundation\Http\FormRequest;

class CreateCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:1000'],
            'parent_id' => ['sometimes', 'exists:event_comments,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => 'Comment content is required',
            'content.max' => 'Comment cannot exceed 1000 characters',
            'parent_id.exists' => 'Parent comment does not exist',
        ];
    }
}
```

**Create EventAttendeeResource (app/Http/Resources/Core/EventAttendeeResource.php):**
```php
<?php

namespace App\Http\Resources\Core;

use App\Http\Resources\BaseResource;

class EventAttendeeResource extends BaseResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'rsvp_at' => $this->rsvp_at?->format('Y-m-d H:i:s'),
            'checked_in_at' => $this->checked_in_at?->format('Y-m-d H:i:s'),
            'is_checked_in' => $this->is_checked_in,
            'notes' => $this->notes,
            'user' => $this->when($this->relationLoaded('user'), [
                'id' => $this->user->id,
                'full_name' => $this->user->full_name,
                'profile_image' => $this->user->profile_image,
                'username' => $this->user->coreProfile?->username,
            ]),
            'event' => $this->when($this->relationLoaded('event'), [
                'id' => $this->event->id,
                'title' => $this->event->title,
                'start_time' => $this->event->start_time->format('Y-m-d H:i:s'),
            ]),
        ];
    }
}
```

### Step 5: Update API Routes (30 minutes)

**Update routes/api/core.php:**
```php
// Add to existing routes

Route::prefix('events')->group(function () {
    // Event interaction routes
    Route::post('/{id}/rsvp', [EventAttendeeController::class, 'rsvp']);
    Route::delete('/{id}/rsvp', [EventAttendeeController::class, 'cancelRsvp']);
    Route::post('/{id}/checkin', [EventAttendeeController::class, 'checkIn']);
    Route::get('/{id}/attendees', [EventAttendeeController::class, 'attendees']);
    Route::get('/{id}/rsvp-status', [EventAttendeeController::class, 'rsvpStatus']);
    
    // Comments
    Route::get('/{id}/comments', [EventCommentController::class, 'index']);
    Route::post('/{id}/comments', [EventCommentController::class, 'store']);
    Route::put('/{eventId}/comments/{commentId}', [EventCommentController::class, 'update']);
    Route::delete('/{eventId}/comments/{commentId}', [EventCommentController::class, 'destroy']);
    
    // Sharing and QR codes
    Route::post('/{id}/share', [EventInteractionController::class, 'share']);
    Route::get('/{id}/qr-code', [EventInteractionController::class, 'generateQrCode']);
});
```

## Acceptance Criteria

### RSVP System
- [ ] Users can RSVP with different statuses (interested, going, not_going, maybe)
- [ ] Capacity management prevents overbooking
- [ ] RSVP status tracking and updates
- [ ] Cancel RSVP functionality

### Check-in System
- [ ] QR code generation and validation
- [ ] Location-based check-in validation
- [ ] Check-in status tracking
- [ ] Only attending users can check in

### Comments System
- [ ] Create, read, update, delete comments
- [ ] Nested comments (replies)
- [ ] Comment moderation capabilities
- [ ] User can only edit/delete own comments

### Event Sharing
- [ ] Share events to social platforms
- [ ] Generate shareable links
- [ ] Track sharing statistics
- [ ] QR code generation for events

## Testing Instructions

### Manual Testing
```bash
# RSVP to event
curl -X POST http://localhost:8000/api/v1/core/events/1/rsvp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"going","notes":"Looking forward to it!"}'

# Add comment
curl -X POST http://localhost:8000/api/v1/core/events/1/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Great event!"}'

# Check in to event
curl -X POST http://localhost:8000/api/v1/core/events/1/checkin \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qr_code":"generated_qr_code"}'
```

## Next Steps
After completion, proceed to:
- Task 004: Social Features API
- Coordinate with Agent 5 on mobile interaction UI
- Test integration with notification services

## Documentation
- Update API documentation with interaction endpoints
- Document RSVP and check-in workflows
- Create QR code implementation guide
