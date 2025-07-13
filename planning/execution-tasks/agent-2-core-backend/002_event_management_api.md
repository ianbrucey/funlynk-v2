# Task 002: Event Management API
**Agent**: Core Funlynk Backend Developer  
**Estimated Time**: 8-9 hours  
**Priority**: High  
**Dependencies**: Task 001 (User Management API)  

## Overview
Implement comprehensive event management API including CRUD operations, search, filtering, categorization, and capacity management for Core Funlynk events.

## Prerequisites
- Task 001 completed successfully
- User management API working
- Database schema with events tables
- File upload service available

## Step-by-Step Implementation

### Step 1: Create Event Models (75 minutes)

**Create Event model (app/Models/Core/Event.php):**
```php
<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class Event extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'host_id',
        'category_id',
        'title',
        'description',
        'location',
        'latitude',
        'longitude',
        'start_time',
        'end_time',
        'max_attendees',
        'price',
        'status',
        'visibility',
        'images',
        'requirements',
        'requires_approval',
        'contact_info',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'price' => 'decimal:2',
        'images' => 'array',
        'requirements' => 'array',
        'requires_approval' => 'boolean',
        'max_attendees' => 'integer',
    ];

    // Relationships
    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(EventCategory::class);
    }

    public function attendees(): HasMany
    {
        return $this->hasMany(EventAttendee::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(EventTag::class, 'event_tag_pivot');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(EventComment::class);
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_time', '>', now());
    }

    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    public function scopeInLocation($query, float $lat, float $lng, float $radius = 50)
    {
        return $query->whereRaw(
            '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) <= ?',
            [$lat, $lng, $lat, $radius]
        );
    }

    public function scopeByPriceRange($query, float $min = null, float $max = null)
    {
        if ($min !== null) {
            $query->where('price', '>=', $min);
        }
        if ($max !== null) {
            $query->where('price', '<=', $max);
        }
        return $query;
    }

    // Accessors
    public function getIsFreeAttribute(): bool
    {
        return $this->price == 0;
    }

    public function getAvailableSpotsAttribute(): ?int
    {
        if (!$this->max_attendees) {
            return null;
        }
        return $this->max_attendees - $this->attendees()->where('status', 'going')->count();
    }

    public function getIsFullAttribute(): bool
    {
        if (!$this->max_attendees) {
            return false;
        }
        return $this->available_spots <= 0;
    }

    public function getDurationAttribute(): string
    {
        $diff = $this->start_time->diff($this->end_time);
        return $diff->format('%h hours %i minutes');
    }
}
```

**Create EventCategory model (app/Models/Core/EventCategory.php):**
```php
<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventCategory extends Model
{
    protected $fillable = [
        'name',
        'description',
        'icon',
        'color',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'category_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
```

**Create EventAttendee model (app/Models/Core/EventAttendee.php):**
```php
<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class EventAttendee extends Model
{
    protected $fillable = [
        'event_id',
        'user_id',
        'status',
        'rsvp_at',
        'checked_in_at',
        'notes',
    ];

    protected $casts = [
        'rsvp_at' => 'datetime',
        'checked_in_at' => 'datetime',
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

    // Scopes
    public function scopeGoing($query)
    {
        return $query->where('status', 'going');
    }

    public function scopeCheckedIn($query)
    {
        return $query->whereNotNull('checked_in_at');
    }
}
```

### Step 2: Create Event Controllers (120 minutes)

**Create EventController (app/Http/Controllers/Api/V1/Core/EventController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Core\CreateEventRequest;
use App\Http\Requests\Core\UpdateEventRequest;
use App\Http\Requests\Core\EventSearchRequest;
use App\Http\Resources\Core\EventResource;
use App\Http\Resources\Core\EventCollection;
use App\Services\Core\EventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends BaseApiController
{
    public function __construct(
        private EventService $eventService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get events list with filters
     */
    public function index(EventSearchRequest $request): JsonResponse
    {
        $events = $this->eventService->getEvents($request->validated());
        
        return $this->paginatedResponse($events, 'Events retrieved successfully');
    }

    /**
     * Create new event
     */
    public function store(CreateEventRequest $request): JsonResponse
    {
        try {
            $event = $this->eventService->createEvent(auth()->user(), $request->validated());
            
            return $this->successResponse(
                new EventResource($event),
                'Event created successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create event', 500);
        }
    }

    /**
     * Get event by ID
     */
    public function show(int $id): JsonResponse
    {
        $event = $this->eventService->getEventById($id);
        
        if (!$event) {
            return $this->notFoundResponse('Event not found');
        }

        return $this->successResponse(
            new EventResource($event),
            'Event retrieved successfully'
        );
    }

    /**
     * Update event
     */
    public function update(UpdateEventRequest $request, int $id): JsonResponse
    {
        $event = $this->eventService->getEventById($id);
        
        if (!$event) {
            return $this->notFoundResponse('Event not found');
        }

        if ($event->host_id !== auth()->id()) {
            return $this->forbiddenResponse('You can only update your own events');
        }

        try {
            $event = $this->eventService->updateEvent($event, $request->validated());
            
            return $this->successResponse(
                new EventResource($event),
                'Event updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update event', 500);
        }
    }

    /**
     * Delete event
     */
    public function destroy(int $id): JsonResponse
    {
        $event = $this->eventService->getEventById($id);
        
        if (!$event) {
            return $this->notFoundResponse('Event not found');
        }

        if ($event->host_id !== auth()->id()) {
            return $this->forbiddenResponse('You can only delete your own events');
        }

        try {
            $this->eventService->deleteEvent($event);
            
            return $this->successResponse(null, 'Event deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete event', 500);
        }
    }

    /**
     * Get events by location
     */
    public function nearby(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'sometimes|numeric|min:1|max:100',
            'per_page' => 'sometimes|integer|min:1|max:50',
        ]);

        $events = $this->eventService->getNearbyEvents(
            $request->latitude,
            $request->longitude,
            $request->radius ?? 25,
            $request->per_page ?? 15
        );

        return $this->paginatedResponse($events, 'Nearby events retrieved successfully');
    }

    /**
     * Get user's hosted events
     */
    public function hosted(Request $request): JsonResponse
    {
        $events = $this->eventService->getUserHostedEvents(
            auth()->id(),
            $request->query('per_page', 15)
        );

        return $this->paginatedResponse($events, 'Hosted events retrieved successfully');
    }

    /**
     * Get user's attended events
     */
    public function attended(Request $request): JsonResponse
    {
        $events = $this->eventService->getUserAttendedEvents(
            auth()->id(),
            $request->query('per_page', 15)
        );

        return $this->paginatedResponse($events, 'Attended events retrieved successfully');
    }
}
```

### Step 3: Create Request Validation Classes (60 minutes)

**Create CreateEventRequest (app/Http/Requests/Core/CreateEventRequest.php):**
```php
<?php

namespace App\Http\Requests\Core;

use Illuminate\Foundation\Http\FormRequest;

class CreateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:event_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
            'location' => ['required', 'string', 'max:255'],
            'latitude' => ['sometimes', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'numeric', 'between:-180,180'],
            'start_time' => ['required', 'date', 'after:now'],
            'end_time' => ['required', 'date', 'after:start_time'],
            'max_attendees' => ['sometimes', 'integer', 'min:1', 'max:10000'],
            'price' => ['sometimes', 'numeric', 'min:0', 'max:9999.99'],
            'visibility' => ['sometimes', 'string', 'in:public,friends,private'],
            'requires_approval' => ['sometimes', 'boolean'],
            'contact_info' => ['sometimes', 'string', 'max:500'],
            'requirements' => ['sometimes', 'array'],
            'requirements.*' => ['string', 'max:255'],
            'tags' => ['sometimes', 'array', 'max:10'],
            'tags.*' => ['string', 'max:50'],
            'images' => ['sometimes', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.exists' => 'Selected category does not exist',
            'start_time.after' => 'Event must start in the future',
            'end_time.after' => 'Event must end after it starts',
            'max_attendees.max' => 'Maximum attendees cannot exceed 10,000',
            'price.max' => 'Price cannot exceed $9,999.99',
            'images.max' => 'Maximum 5 images allowed',
            'images.*.max' => 'Each image must be less than 2MB',
            'tags.max' => 'Maximum 10 tags allowed',
        ];
    }
}
```

**Create EventSearchRequest (app/Http/Requests/Core/EventSearchRequest.php):**
```php
<?php

namespace App\Http\Requests\Core;

use Illuminate\Foundation\Http\FormRequest;

class EventSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'query' => ['sometimes', 'string', 'max:255'],
            'category_id' => ['sometimes', 'exists:event_categories,id'],
            'location' => ['sometimes', 'string', 'max:255'],
            'latitude' => ['sometimes', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'numeric', 'between:-180,180'],
            'radius' => ['sometimes', 'numeric', 'min:1', 'max:100'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after_or_equal:start_date'],
            'min_price' => ['sometimes', 'numeric', 'min:0'],
            'max_price' => ['sometimes', 'numeric', 'min:0'],
            'is_free' => ['sometimes', 'boolean'],
            'has_spots' => ['sometimes', 'boolean'],
            'sort_by' => ['sometimes', 'string', 'in:start_time,created_at,price,popularity'],
            'sort_order' => ['sometimes', 'string', 'in:asc,desc'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ];
    }
}
```

### Step 4: Create Event Service Layer (120 minutes)

**Create EventService (app/Services/Core/EventService.php):**
```php
<?php

namespace App\Services\Core;

use App\Models\Core\Event;
use App\Models\Core\EventTag;
use App\Models\User;
use App\Services\Shared\FileUploadService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class EventService
{
    public function __construct(
        private FileUploadService $fileUploadService
    ) {}

    public function createEvent(User $host, array $data): Event
    {
        return DB::transaction(function () use ($host, $data) {
            // Handle image uploads
            $imageUrls = [];
            if (isset($data['images'])) {
                foreach ($data['images'] as $image) {
                    $uploadResult = $this->fileUploadService->uploadImage($image, 'events');
                    $imageUrls[] = $uploadResult['url'];
                }
            }

            // Create event
            $event = Event::create([
                'host_id' => $host->id,
                'category_id' => $data['category_id'],
                'title' => $data['title'],
                'description' => $data['description'],
                'location' => $data['location'],
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'max_attendees' => $data['max_attendees'] ?? null,
                'price' => $data['price'] ?? 0,
                'visibility' => $data['visibility'] ?? 'public',
                'requires_approval' => $data['requires_approval'] ?? false,
                'contact_info' => $data['contact_info'] ?? null,
                'requirements' => $data['requirements'] ?? null,
                'images' => $imageUrls,
                'status' => 'published',
            ]);

            // Handle tags
            if (isset($data['tags'])) {
                $this->attachTags($event, $data['tags']);
            }

            // Update host profile
            $host->coreProfile()->increment('events_hosted');

            return $event->load(['category', 'host', 'tags']);
        });
    }

    public function updateEvent(Event $event, array $data): Event
    {
        return DB::transaction(function () use ($event, $data) {
            // Handle new image uploads
            $imageUrls = $event->images ?? [];
            if (isset($data['images'])) {
                foreach ($data['images'] as $image) {
                    $uploadResult = $this->fileUploadService->uploadImage($image, 'events');
                    $imageUrls[] = $uploadResult['url'];
                }
            }

            // Update event
            $event->update([
                'category_id' => $data['category_id'] ?? $event->category_id,
                'title' => $data['title'] ?? $event->title,
                'description' => $data['description'] ?? $event->description,
                'location' => $data['location'] ?? $event->location,
                'latitude' => $data['latitude'] ?? $event->latitude,
                'longitude' => $data['longitude'] ?? $event->longitude,
                'start_time' => $data['start_time'] ?? $event->start_time,
                'end_time' => $data['end_time'] ?? $event->end_time,
                'max_attendees' => $data['max_attendees'] ?? $event->max_attendees,
                'price' => $data['price'] ?? $event->price,
                'visibility' => $data['visibility'] ?? $event->visibility,
                'requires_approval' => $data['requires_approval'] ?? $event->requires_approval,
                'contact_info' => $data['contact_info'] ?? $event->contact_info,
                'requirements' => $data['requirements'] ?? $event->requirements,
                'images' => $imageUrls,
            ]);

            // Update tags
            if (isset($data['tags'])) {
                $event->tags()->detach();
                $this->attachTags($event, $data['tags']);
            }

            return $event->load(['category', 'host', 'tags']);
        });
    }

    public function getEvents(array $filters): LengthAwarePaginator
    {
        $query = Event::with(['category', 'host.coreProfile', 'tags'])
            ->published()
            ->public();

        // Apply filters
        if (isset($filters['query'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'LIKE', "%{$filters['query']}%")
                  ->orWhere('description', 'LIKE', "%{$filters['query']}%")
                  ->orWhere('location', 'LIKE', "%{$filters['query']}%");
            });
        }

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['location'])) {
            $query->where('location', 'LIKE', "%{$filters['location']}%");
        }

        if (isset($filters['latitude']) && isset($filters['longitude'])) {
            $radius = $filters['radius'] ?? 25;
            $query->inLocation($filters['latitude'], $filters['longitude'], $radius);
        }

        if (isset($filters['start_date'])) {
            $query->where('start_time', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->where('start_time', '<=', $filters['end_date']);
        }

        if (isset($filters['is_free']) && $filters['is_free']) {
            $query->where('price', 0);
        } elseif (isset($filters['min_price']) || isset($filters['max_price'])) {
            $query->byPriceRange($filters['min_price'] ?? null, $filters['max_price'] ?? null);
        }

        if (isset($filters['has_spots']) && $filters['has_spots']) {
            $query->whereRaw('(max_attendees IS NULL OR max_attendees > (SELECT COUNT(*) FROM event_attendees WHERE event_id = events.id AND status = "going"))');
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'start_time';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function getEventById(int $id): ?Event
    {
        return Event::with(['category', 'host.coreProfile', 'tags', 'attendees.user'])
            ->find($id);
    }

    public function deleteEvent(Event $event): bool
    {
        return $event->delete();
    }

    public function getNearbyEvents(float $lat, float $lng, float $radius, int $perPage): LengthAwarePaginator
    {
        return Event::with(['category', 'host.coreProfile'])
            ->published()
            ->public()
            ->upcoming()
            ->inLocation($lat, $lng, $radius)
            ->orderBy('start_time')
            ->paginate($perPage);
    }

    public function getUserHostedEvents(int $userId, int $perPage): LengthAwarePaginator
    {
        return Event::with(['category', 'attendees'])
            ->where('host_id', $userId)
            ->orderBy('start_time', 'desc')
            ->paginate($perPage);
    }

    public function getUserAttendedEvents(int $userId, int $perPage): LengthAwarePaginator
    {
        return Event::with(['category', 'host.coreProfile'])
            ->whereHas('attendees', function ($query) use ($userId) {
                $query->where('user_id', $userId)
                      ->where('status', 'going');
            })
            ->orderBy('start_time', 'desc')
            ->paginate($perPage);
    }

    private function attachTags(Event $event, array $tags): void
    {
        foreach ($tags as $tagName) {
            $tag = EventTag::firstOrCreate(['name' => $tagName]);
            $event->tags()->attach($tag->id);
        }
    }
}
```

## Acceptance Criteria

### Event CRUD Operations
- [ ] Create events with all required fields
- [ ] Update events (host only)
- [ ] Delete events (host only)
- [ ] Get event details with relationships
- [ ] Image upload for events

### Event Search and Filtering
- [ ] Search events by title, description, location
- [ ] Filter by category, date range, price range
- [ ] Location-based search with radius
- [ ] Sort by various criteria
- [ ] Pagination support

### Event Management
- [ ] Capacity management and availability tracking
- [ ] Event status management (draft, published, cancelled)
- [ ] Visibility controls (public, friends, private)
- [ ] Tag system for categorization

### Host Features
- [ ] Get hosted events list
- [ ] Event analytics and statistics
- [ ] Attendee management
- [ ] Event approval system

## Testing Instructions

### Manual Testing
```bash
# Create event
curl -X POST http://localhost:8000/api/v1/core/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Event","description":"Test description","location":"Test Location","start_time":"2024-12-01 10:00:00","end_time":"2024-12-01 12:00:00","category_id":1}'

# Search events
curl -X GET "http://localhost:8000/api/v1/core/events?query=test&category_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get nearby events
curl -X GET "http://localhost:8000/api/v1/core/events/nearby?latitude=40.7128&longitude=-74.0060&radius=25" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps
After completion, proceed to:
- Task 003: Event Interaction API
- Coordinate with Agent 5 on mobile event UI
- Share event models with other agents

## Documentation
- Update API documentation with event endpoints
- Document search and filtering capabilities
- Create event management guide
