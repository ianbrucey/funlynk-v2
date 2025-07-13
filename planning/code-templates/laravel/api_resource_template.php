<?php

namespace App\Http\Resources\{MODULE};

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

/**
 * {MODEL} API Resource
 * 
 * Transforms {MODEL} model data into a consistent JSON API response format.
 * Handles data serialization, relationship loading, and conditional field inclusion.
 * 
 * @package App\Http\Resources\{MODULE}
 */
class {MODEL}Resource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * 
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // Basic attributes
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status,
            
            // Computed attributes
            'slug' => $this->slug ?? str()->slug($this->name),
            'is_active' => $this->is_active ?? true,
            
            // Conditional attributes based on module
            ...$this->getModuleSpecificAttributes(),
            
            // File URLs
            'image_url' => $this->when($this->image_url, function () {
                return $this->getImageUrl();
            }),
            
            // Relationships
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'avatar' => $this->user->avatar_url,
                ];
            }),
            
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                    'avatar' => $this->creator->avatar_url,
                ];
            }),
            
            // Tags/Categories
            'tags' => $this->whenLoaded('tags', function () {
                return $this->tags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'slug' => $tag->slug,
                    ];
                });
            }),
            
            // Counts and statistics
            'stats' => $this->when($request->has('include_stats'), function () {
                return $this->getStatistics();
            }),
            
            // Permissions for current user
            'permissions' => $this->when(auth()->check(), function () {
                return $this->getUserPermissions();
            }),
            
            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->when($this->deleted_at, function () {
                return $this->deleted_at->toISOString();
            }),
            
            // Human-readable timestamps
            'created_at_human' => $this->created_at?->diffForHumans(),
            'updated_at_human' => $this->updated_at?->diffForHumans(),
            
            // Additional metadata
            'meta' => $this->when($request->has('include_meta'), function () {
                return $this->getMetadata();
            }),
        ];
    }

    /**
     * Get module-specific attributes.
     * 
     * @return array
     */
    private function getModuleSpecificAttributes(): array
    {
        // Core module attributes
        if ('{MODULE}' === 'Core') {
            return [
                // Event-specific attributes
                'start_date' => $this->start_date?->toISOString(),
                'end_date' => $this->end_date?->toISOString(),
                'start_date_human' => $this->start_date?->format('M j, Y g:i A'),
                'end_date_human' => $this->end_date?->format('M j, Y g:i A'),
                'is_upcoming' => $this->start_date?->isFuture() ?? false,
                'is_ongoing' => $this->isOngoing(),
                'is_past' => $this->end_date?->isPast() ?? false,
                
                // Location
                'location' => [
                    'address' => $this->location_address,
                    'latitude' => $this->location_latitude,
                    'longitude' => $this->location_longitude,
                    'city' => $this->location_city,
                    'state' => $this->location_state,
                ],
                
                // Event details
                'category' => $this->category,
                'visibility' => $this->visibility ?? 'public',
                'max_capacity' => $this->max_capacity,
                'current_attendees' => $this->attendees_count ?? 0,
                'available_spots' => $this->getAvailableSpots(),
                'is_full' => $this->isFull(),
                'price' => $this->price ? number_format($this->price, 2) : null,
                'is_free' => !$this->price || $this->price == 0,
                
                // User interaction
                'is_attending' => $this->when(auth()->check(), function () {
                    return $this->isUserAttending(auth()->id());
                }),
                'can_join' => $this->when(auth()->check(), function () {
                    return $this->canUserJoin(auth()->id());
                }),
                'can_edit' => $this->when(auth()->check(), function () {
                    return $this->canUserEdit(auth()->id());
                }),
            ];
        }

        // Spark module attributes
        if ('{MODULE}' === 'Spark') {
            return [
                // Program-specific attributes
                'duration_minutes' => $this->duration_minutes,
                'duration_hours' => round($this->duration_minutes / 60, 1),
                'duration_human' => $this->getDurationHuman(),
                'cost' => number_format($this->cost, 2),
                'is_free' => !$this->cost || $this->cost == 0,
                
                // Educational content
                'character_topics' => $this->character_topics ?? [],
                'grade_levels' => $this->grade_levels ?? [],
                'grade_range' => $this->getGradeRange(),
                
                // Location (for Spark programs)
                'location' => [
                    'address' => $this->location_address,
                    'city' => $this->location_city,
                    'state' => $this->location_state,
                    'zip' => $this->location_zip,
                    'latitude' => $this->location_latitude,
                    'longitude' => $this->location_longitude,
                ],
                
                // Program details
                'what_to_bring' => $this->what_to_bring,
                'special_instructions' => $this->special_instructions,
                
                // Availability
                'available_slots' => $this->whenLoaded('availabilitySlots', function () {
                    return $this->availabilitySlots->map(function ($slot) {
                        return [
                            'id' => $slot->id,
                            'date' => $slot->date->toDateString(),
                            'start_time' => $slot->start_time,
                            'end_time' => $slot->end_time,
                            'max_capacity' => $slot->max_capacity,
                            'booked_capacity' => $slot->booked_capacity,
                            'available_capacity' => $slot->max_capacity - $slot->booked_capacity,
                            'is_available' => $slot->is_available && ($slot->max_capacity > $slot->booked_capacity),
                        ];
                    });
                }),
                
                // Booking statistics
                'total_bookings' => $this->bookings_count ?? 0,
                'total_students' => $this->students_count ?? 0,
                'schools_count' => $this->schools_count ?? 0,
            ];
        }

        return [];
    }

    /**
     * Get image URL with proper formatting.
     * 
     * @return string|null
     */
    private function getImageUrl(): ?string
    {
        if (!$this->image_url) {
            return null;
        }

        // If it's already a full URL, return as-is
        if (str_starts_with($this->image_url, 'http')) {
            return $this->image_url;
        }

        // Otherwise, prepend the storage URL
        return config('app.url') . '/storage/' . $this->image_url;
    }

    /**
     * Get statistics for the resource.
     * 
     * @return array
     */
    private function getStatistics(): array
    {
        $stats = [
            'views_count' => $this->views_count ?? 0,
            'likes_count' => $this->likes_count ?? 0,
            'shares_count' => $this->shares_count ?? 0,
        ];

        // Module-specific stats
        if ('{MODULE}' === 'Core') {
            $stats = array_merge($stats, [
                'attendees_count' => $this->attendees_count ?? 0,
                'comments_count' => $this->comments_count ?? 0,
                'rsvp_yes_count' => $this->rsvp_yes_count ?? 0,
                'rsvp_maybe_count' => $this->rsvp_maybe_count ?? 0,
                'rsvp_no_count' => $this->rsvp_no_count ?? 0,
            ]);
        }

        if ('{MODULE}' === 'Spark') {
            $stats = array_merge($stats, [
                'bookings_count' => $this->bookings_count ?? 0,
                'students_count' => $this->students_count ?? 0,
                'schools_count' => $this->schools_count ?? 0,
                'completion_rate' => $this->getCompletionRate(),
            ]);
        }

        return $stats;
    }

    /**
     * Get user permissions for the resource.
     * 
     * @return array
     */
    private function getUserPermissions(): array
    {
        $user = auth()->user();
        
        if (!$user) {
            return [
                'can_view' => true,
                'can_edit' => false,
                'can_delete' => false,
                'can_share' => false,
            ];
        }

        return [
            'can_view' => $this->canUserView($user->id),
            'can_edit' => $this->canUserEdit($user->id),
            'can_delete' => $this->canUserDelete($user->id),
            'can_share' => $this->canUserShare($user->id),
            'can_moderate' => $this->canUserModerate($user->id),
        ];
    }

    /**
     * Get additional metadata.
     * 
     * @return array
     */
    private function getMetadata(): array
    {
        return [
            'version' => $this->version ?? 1,
            'last_activity' => $this->last_activity_at?->toISOString(),
            'popularity_score' => $this->popularity_score ?? 0,
            'quality_score' => $this->quality_score ?? 0,
            'featured' => $this->is_featured ?? false,
            'trending' => $this->is_trending ?? false,
        ];
    }

    // ========================================
    // HELPER METHODS
    // ========================================

    /**
     * Check if event is currently ongoing.
     * 
     * @return bool
     */
    private function isOngoing(): bool
    {
        if (!$this->start_date || !$this->end_date) {
            return false;
        }

        $now = now();
        return $now->between($this->start_date, $this->end_date);
    }

    /**
     * Get available spots for the event.
     * 
     * @return int|null
     */
    private function getAvailableSpots(): ?int
    {
        if (!$this->max_capacity) {
            return null;
        }

        return max(0, $this->max_capacity - ($this->attendees_count ?? 0));
    }

    /**
     * Check if event is full.
     * 
     * @return bool
     */
    private function isFull(): bool
    {
        if (!$this->max_capacity) {
            return false;
        }

        return ($this->attendees_count ?? 0) >= $this->max_capacity;
    }

    /**
     * Get human-readable duration.
     * 
     * @return string
     */
    private function getDurationHuman(): string
    {
        if (!$this->duration_minutes) {
            return '';
        }

        $hours = floor($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;

        if ($hours > 0 && $minutes > 0) {
            return "{$hours}h {$minutes}m";
        } elseif ($hours > 0) {
            return "{$hours}h";
        } else {
            return "{$minutes}m";
        }
    }

    /**
     * Get grade range string.
     * 
     * @return string
     */
    private function getGradeRange(): string
    {
        if (!$this->grade_levels || empty($this->grade_levels)) {
            return '';
        }

        $grades = $this->grade_levels;
        sort($grades);

        if (count($grades) === 1) {
            return "Grade {$grades[0]}";
        }

        return "Grades {$grades[0]}-{$grades[count($grades) - 1]}";
    }

    /**
     * Get completion rate for Spark programs.
     * 
     * @return float
     */
    private function getCompletionRate(): float
    {
        $totalBookings = $this->bookings_count ?? 0;
        $completedBookings = $this->completed_bookings_count ?? 0;

        if ($totalBookings === 0) {
            return 0.0;
        }

        return round(($completedBookings / $totalBookings) * 100, 1);
    }

    // ========================================
    // PERMISSION HELPER METHODS
    // ========================================

    /**
     * Check if user can view the resource.
     * 
     * @param int $userId
     * @return bool
     */
    private function canUserView(int $userId): bool
    {
        // Public resources can be viewed by anyone
        if ($this->visibility === 'public') {
            return true;
        }

        // Private resources can only be viewed by owner
        if ($this->visibility === 'private') {
            return $this->user_id === $userId;
        }

        // Friends-only resources (implement friend logic)
        if ($this->visibility === 'friends') {
            return $this->user_id === $userId; // Simplified
        }

        return true;
    }

    /**
     * Check if user can edit the resource.
     * 
     * @param int $userId
     * @return bool
     */
    private function canUserEdit(int $userId): bool
    {
        // Owner can always edit
        if ($this->user_id === $userId) {
            return true;
        }

        // Admins can edit
        $user = auth()->user();
        if ($user && $user->hasRole(['admin', 'funlynk_admin'])) {
            return true;
        }

        return false;
    }

    /**
     * Check if user can delete the resource.
     * 
     * @param int $userId
     * @return bool
     */
    private function canUserDelete(int $userId): bool
    {
        return $this->canUserEdit($userId);
    }

    /**
     * Check if user can share the resource.
     * 
     * @param int $userId
     * @return bool
     */
    private function canUserShare(int $userId): bool
    {
        return $this->canUserView($userId);
    }

    /**
     * Check if user can moderate the resource.
     * 
     * @param int $userId
     * @return bool
     */
    private function canUserModerate(int $userId): bool
    {
        $user = auth()->user();
        return $user && $user->hasRole(['admin', 'funlynk_admin', 'moderator']);
    }

    /**
     * Check if user is attending (for events).
     * 
     * @param int $userId
     * @return bool
     */
    private function isUserAttending(int $userId): bool
    {
        // This would typically check a pivot table
        return false; // Implement based on your attendance logic
    }

    /**
     * Check if user can join (for events).
     * 
     * @param int $userId
     * @return bool
     */
    private function canUserJoin(int $userId): bool
    {
        // Check if event is full, if user is already attending, etc.
        return !$this->isFull() && !$this->isUserAttending($userId);
    }
}

/*
USAGE INSTRUCTIONS:

1. Replace placeholders:
   - {MODULE}: Core, Spark, or Shared
   - {MODEL}: Model name (e.g., Event, User, Program)

2. Customize the toArray() method based on your model attributes

3. Update getModuleSpecificAttributes() for module-specific fields

4. Implement permission helper methods based on your authorization logic

5. Add computed attributes and relationships as needed

6. Update helper methods to match your business logic

EXAMPLE USAGE:
- EventResource in Core module
- ProgramResource in Spark module
- UserResource in Shared module

COMMON CUSTOMIZATIONS:
- Add file URL transformations
- Add computed fields and statistics
- Add user-specific permissions
- Add relationship data
- Add localization support
*/
