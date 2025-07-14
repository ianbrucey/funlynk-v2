<?php

namespace App\Services\Core;

use App\Models\User;
use App\Models\Core\Event;
use App\Models\Core\EventAttendee;
use App\Models\Core\EventTag;
use App\Services\Shared\FileUploadService;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Exception;

/**
 * Event Service
 * 
 * Handles event management business logic including CRUD, search, and attendance
 */
class EventService
{
    public function __construct(
        private FileUploadService $fileUploadService,
        private LoggingService $loggingService,
        private NotificationService $notificationService
    ) {}

    /**
     * Get paginated events with filters
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getEvents(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Event::query()
            ->with(['host', 'category', 'tags'])
            ->published()
            ->public();

        // Apply filters
        if (isset($filters['category_id'])) {
            $query->byCategory($filters['category_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['visibility'])) {
            $query->where('visibility', $filters['visibility']);
        }

        if (isset($filters['upcoming']) && $filters['upcoming']) {
            $query->upcoming();
        }

        // Location-based filtering
        if (isset($filters['latitude'], $filters['longitude'])) {
            $radius = $filters['radius'] ?? 50;
            $query->withinRadius($filters['latitude'], $filters['longitude'], $radius);
        }

        // Tag filtering
        if (isset($filters['tags']) && !empty($filters['tags'])) {
            $query->whereHas('tags', function ($q) use ($filters) {
                $q->whereIn('name', $filters['tags']);
            });
        }

        return $query->orderBy('start_time')->paginate($perPage);
    }

    /**
     * Create a new event
     *
     * @param User $host
     * @param array $data
     * @return Event
     * @throws Exception
     */
    public function createEvent(User $host, array $data): Event
    {
        try {
            DB::beginTransaction();

            // Handle image uploads
            if (isset($data['images'])) {
                $imageUrls = [];
                foreach ($data['images'] as $image) {
                    $imageData = $this->fileUploadService->uploadImage($image, 'event-images');
                    $imageUrls[] = $imageData['url'];
                }
                $data['images'] = $imageUrls;
            }

            // Create the event
            $event = Event::create([
                'host_id' => $host->id,
                ...$data,
            ]);

            // Handle tags
            if (isset($data['tags']) && !empty($data['tags'])) {
                $this->attachTags($event, $data['tags']);
            }

            // Load relationships
            $event->load(['host', 'category', 'tags']);

            // Log the activity
            $this->loggingService->logUserActivity(
                $host->id,
                'event_created',
                'Event',
                $event->id,
                ['title' => $event->title]
            );

            DB::commit();
            return $event;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'user_id' => $host->id,
                'operation' => 'create_event'
            ]);
            throw $e;
        }
    }

    /**
     * Update an event
     *
     * @param Event $event
     * @param array $data
     * @return Event
     * @throws Exception
     */
    public function updateEvent(Event $event, array $data): Event
    {
        try {
            DB::beginTransaction();

            // Handle new image uploads
            if (isset($data['images'])) {
                $newImageUrls = [];
                foreach ($data['images'] as $image) {
                    $imageData = $this->fileUploadService->uploadImage($image, 'event-images');
                    $newImageUrls[] = $imageData['url'];
                }
                
                // Merge with existing images
                $existingImages = $event->images ?? [];
                $data['images'] = array_merge($existingImages, $newImageUrls);
            }

            // Handle image removal
            if (isset($data['remove_images']) && !empty($data['remove_images'])) {
                $existingImages = $event->images ?? [];
                $data['images'] = array_diff($existingImages, $data['remove_images']);
                
                // Delete removed images from storage
                foreach ($data['remove_images'] as $imageUrl) {
                    $this->fileUploadService->deleteFile($imageUrl);
                }
                
                unset($data['remove_images']);
            }

            // Update the event
            $event->update($data);

            // Handle tags update
            if (isset($data['tags'])) {
                $this->syncTags($event, $data['tags']);
            }

            // Load relationships
            $event->load(['host', 'category', 'tags']);

            // Log the activity
            $this->loggingService->logUserActivity(
                $event->host_id,
                'event_updated',
                'Event',
                $event->id,
                ['title' => $event->title]
            );

            DB::commit();
            return $event;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'event_id' => $event->id,
                'operation' => 'update_event'
            ]);
            throw $e;
        }
    }

    /**
     * Delete an event
     *
     * @param Event $event
     * @return bool
     * @throws Exception
     */
    public function deleteEvent(Event $event): bool
    {
        try {
            DB::beginTransaction();

            // Delete associated images
            if ($event->images) {
                foreach ($event->images as $imageUrl) {
                    $this->fileUploadService->deleteFile($imageUrl);
                }
            }

            // Notify attendees about event cancellation
            $attendees = $event->attendees()->confirmed()->with('user')->get();
            foreach ($attendees as $attendee) {
                $this->notificationService->createNotification(
                    $attendee->user_id,
                    'event_cancelled',
                    'Event Cancelled',
                    "The event '{$event->title}' has been cancelled by the host.",
                    [
                        'event_id' => $event->id,
                        'event_title' => $event->title,
                    ]
                );
            }

            // Log the activity
            $this->loggingService->logUserActivity(
                $event->host_id,
                'event_deleted',
                'Event',
                $event->id,
                ['title' => $event->title]
            );

            // Soft delete the event
            $event->delete();

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'event_id' => $event->id,
                'operation' => 'delete_event'
            ]);
            throw $e;
        }
    }

    /**
     * Search events
     *
     * @param string $query
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function searchEvents(string $query, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $eventsQuery = Event::query()
            ->with(['host', 'category', 'tags'])
            ->published()
            ->public()
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%")
                  ->orWhere('location', 'like', "%{$query}%")
                  ->orWhereHas('tags', function ($tagQuery) use ($query) {
                      $tagQuery->where('name', 'like', "%{$query}%");
                  });
            });

        // Apply additional filters
        if (isset($filters['category_id'])) {
            $eventsQuery->byCategory($filters['category_id']);
        }

        if (isset($filters['latitude'], $filters['longitude'])) {
            $radius = $filters['radius'] ?? 50;
            $eventsQuery->withinRadius($filters['latitude'], $filters['longitude'], $radius);
        }

        if (isset($filters['price_min'])) {
            $eventsQuery->where('price', '>=', $filters['price_min']);
        }

        if (isset($filters['price_max'])) {
            $eventsQuery->where('price', '<=', $filters['price_max']);
        }

        if (isset($filters['date_from'])) {
            $eventsQuery->where('start_time', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $eventsQuery->where('start_time', '<=', $filters['date_to']);
        }

        return $eventsQuery->orderBy('start_time')->paginate($perPage);
    }

    /**
     * Attach tags to an event
     *
     * @param Event $event
     * @param array $tagNames
     * @return void
     */
    private function attachTags(Event $event, array $tagNames): void
    {
        $tagIds = [];
        foreach ($tagNames as $tagName) {
            $tag = EventTag::findOrCreateByName($tagName);
            $tag->incrementUsage();
            $tagIds[] = $tag->id;
        }
        
        $event->tags()->attach($tagIds);
    }

    /**
     * Sync tags for an event
     *
     * @param Event $event
     * @param array $tagNames
     * @return void
     */
    private function syncTags(Event $event, array $tagNames): void
    {
        // Decrement usage count for old tags
        foreach ($event->tags as $oldTag) {
            $oldTag->decrementUsage();
        }

        // Get or create new tags
        $tagIds = [];
        foreach ($tagNames as $tagName) {
            $tag = EventTag::findOrCreateByName($tagName);
            $tag->incrementUsage();
            $tagIds[] = $tag->id;
        }
        
        $event->tags()->sync($tagIds);
    }

    /**
     * RSVP to an event
     *
     * @param User $user
     * @param Event $event
     * @param string $response
     * @param string|null $notes
     * @return bool
     */
    public function rsvpToEvent(User $user, Event $event, string $response, ?string $notes = null): bool
    {
        try {
            DB::beginTransaction();

            // Check if event is full (for 'yes' responses)
            if ($response === 'yes' && $event->is_full) {
                return false;
            }

            // Check if user is already attending
            $existingAttendee = EventAttendee::where('event_id', $event->id)
                ->where('user_id', $user->id)
                ->first();

            $status = $response === 'yes' ?
                ($event->requires_approval ? 'pending' : 'confirmed') :
                'declined';

            if ($existingAttendee) {
                // Update existing RSVP
                $existingAttendee->update([
                    'status' => $status,
                    'rsvp_response' => $response,
                    'notes' => $notes,
                ]);
            } else {
                // Create new RSVP
                EventAttendee::create([
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                    'status' => $status,
                    'rsvp_response' => $response,
                    'notes' => $notes,
                ]);
            }

            // Notify host about new RSVP
            if ($response === 'yes') {
                $this->notificationService->createNotification(
                    $event->host_id,
                    'event_rsvp',
                    'New RSVP',
                    "{$user->first_name} {$user->last_name} has RSVP'd to your event '{$event->title}'",
                    [
                        'event_id' => $event->id,
                        'event_title' => $event->title,
                        'user_id' => $user->id,
                        'user_name' => $user->first_name . ' ' . $user->last_name,
                        'status' => $status,
                    ]
                );
            }

            // Log the activity
            $this->loggingService->logUserActivity(
                $user->id,
                'event_rsvp',
                'Event',
                $event->id,
                [
                    'response' => $response,
                    'status' => $status,
                    'event_title' => $event->title,
                ]
            );

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'user_id' => $user->id,
                'event_id' => $event->id,
                'operation' => 'rsvp_to_event'
            ]);
            return false;
        }
    }

    /**
     * Cancel RSVP to an event
     *
     * @param User $user
     * @param Event $event
     * @return bool
     */
    public function cancelRsvp(User $user, Event $event): bool
    {
        try {
            $attendee = EventAttendee::where('event_id', $event->id)
                ->where('user_id', $user->id)
                ->first();

            if (!$attendee) {
                return false;
            }

            $attendee->delete();

            // Log the activity
            $this->loggingService->logUserActivity(
                $user->id,
                'event_rsvp_cancelled',
                'Event',
                $event->id,
                ['event_title' => $event->title]
            );

            return true;
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'user_id' => $user->id,
                'event_id' => $event->id,
                'operation' => 'cancel_rsvp'
            ]);
            return false;
        }
    }

    /**
     * Get event attendees
     *
     * @param Event $event
     * @param string|null $status
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getEventAttendees(Event $event, ?string $status = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = $event->attendees()->with('user');

        if ($status) {
            $query->where('status', $status);
        }

        return $query->paginate($perPage);
    }

    /**
     * Get user's hosted events
     *
     * @param User $user
     * @param string|null $status
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getUserHostedEvents(User $user, ?string $status = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = $user->hostedEvents()->with(['category', 'tags']);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    /**
     * Get user's attended events
     *
     * @param User $user
     * @param string|null $status
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getUserAttendedEvents(User $user, ?string $status = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = $user->attendingEvents()->with(['category', 'tags']);

        if ($status) {
            $query->wherePivot('status', $status);
        }

        return $query->orderByDesc('start_time')->paginate($perPage);
    }
}
