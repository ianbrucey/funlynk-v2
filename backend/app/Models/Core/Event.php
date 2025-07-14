<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use App\Models\User;
use Carbon\Carbon;

/**
 * Event Model
 * 
 * Manages Core Funlynk events with comprehensive functionality
 */
class Event extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
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

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
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
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // ===================================
    // Relationships
    // ===================================

    /**
     * Get the host of the event.
     *
     * @return BelongsTo
     */
    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    /**
     * Get the category of the event.
     *
     * @return BelongsTo
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(EventCategory::class);
    }

    /**
     * Get the attendees of the event.
     *
     * @return HasMany
     */
    public function attendees(): HasMany
    {
        return $this->hasMany(EventAttendee::class);
    }

    /**
     * Get the tags associated with the event.
     *
     * @return BelongsToMany
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(EventTag::class, 'event_tag_pivot');
    }

    // ===================================
    // Scopes
    // ===================================

    /**
     * Scope to get published events.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope to get public events.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopePublic(Builder $query): Builder
    {
        return $query->where('visibility', 'public');
    }

    /**
     * Scope to get upcoming events.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('start_time', '>', now());
    }

    /**
     * Scope to get past events.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopePast(Builder $query): Builder
    {
        return $query->where('end_time', '<', now());
    }

    /**
     * Scope to get events happening today.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('start_time', today());
    }

    /**
     * Scope to get events by location radius.
     *
     * @param Builder $query
     * @param float $latitude
     * @param float $longitude
     * @param float $radius (in kilometers)
     * @return Builder
     */
    public function scopeWithinRadius(Builder $query, float $latitude, float $longitude, float $radius = 50): Builder
    {
        return $query->whereRaw(
            '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) <= ?',
            [$latitude, $longitude, $latitude, $radius]
        );
    }

    /**
     * Scope to get events by category.
     *
     * @param Builder $query
     * @param int $categoryId
     * @return Builder
     */
    public function scopeByCategory(Builder $query, int $categoryId): Builder
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope to get events with available spots.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeWithAvailableSpots(Builder $query): Builder
    {
        return $query->whereRaw('(SELECT COUNT(*) FROM event_attendees WHERE event_id = events.id AND status = "confirmed") < max_attendees')
                    ->orWhereNull('max_attendees');
    }

    // ===================================
    // Accessors & Mutators
    // ===================================

    /**
     * Get the event's status display name.
     *
     * @return string
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            'draft' => 'Draft',
            'published' => 'Published',
            'cancelled' => 'Cancelled',
            'completed' => 'Completed',
            default => 'Unknown'
        };
    }

    /**
     * Get the event's visibility display name.
     *
     * @return string
     */
    public function getVisibilityDisplayAttribute(): string
    {
        return match($this->visibility) {
            'public' => 'Public',
            'private' => 'Private',
            'followers_only' => 'Followers Only',
            default => 'Unknown'
        };
    }

    /**
     * Check if the event is upcoming.
     *
     * @return bool
     */
    public function getIsUpcomingAttribute(): bool
    {
        return $this->start_time > now();
    }

    /**
     * Check if the event is past.
     *
     * @return bool
     */
    public function getIsPastAttribute(): bool
    {
        return $this->end_time < now();
    }

    /**
     * Check if the event is happening now.
     *
     * @return bool
     */
    public function getIsActiveAttribute(): bool
    {
        $now = now();
        return $this->start_time <= $now && $this->end_time >= $now;
    }

    /**
     * Get the number of confirmed attendees.
     *
     * @return int
     */
    public function getConfirmedAttendeesCountAttribute(): int
    {
        return $this->attendees()->where('status', 'confirmed')->count();
    }

    /**
     * Get the number of available spots.
     *
     * @return int|null
     */
    public function getAvailableSpotsAttribute(): ?int
    {
        if (!$this->max_attendees) {
            return null; // Unlimited
        }

        return max(0, $this->max_attendees - $this->confirmed_attendees_count);
    }

    /**
     * Check if the event is full.
     *
     * @return bool
     */
    public function getIsFullAttribute(): bool
    {
        if (!$this->max_attendees) {
            return false; // Unlimited capacity
        }

        return $this->confirmed_attendees_count >= $this->max_attendees;
    }

    /**
     * Get formatted price.
     *
     * @return string
     */
    public function getFormattedPriceAttribute(): string
    {
        if ($this->price == 0) {
            return 'Free';
        }

        return '$' . number_format($this->price, 2);
    }

    /**
     * Get the event duration in minutes.
     *
     * @return int
     */
    public function getDurationInMinutesAttribute(): int
    {
        return $this->start_time->diffInMinutes($this->end_time);
    }

    /**
     * Get formatted duration.
     *
     * @return string
     */
    public function getFormattedDurationAttribute(): string
    {
        $minutes = $this->duration_in_minutes;
        
        if ($minutes < 60) {
            return "{$minutes} minutes";
        }
        
        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;
        
        if ($remainingMinutes === 0) {
            return $hours === 1 ? "1 hour" : "{$hours} hours";
        }
        
        return $hours === 1 ? "1 hour {$remainingMinutes} minutes" : "{$hours} hours {$remainingMinutes} minutes";
    }

    // ===================================
    // Helper Methods
    // ===================================

    /**
     * Check if a user can view this event.
     *
     * @param User|null $user
     * @return bool
     */
    public function canBeViewedBy(?User $user): bool
    {
        // Published and public events can be viewed by anyone
        if ($this->status === 'published' && $this->visibility === 'public') {
            return true;
        }

        // If no user, can only view public events
        if (!$user) {
            return false;
        }

        // Host can always view their own events
        if ($this->host_id === $user->id) {
            return true;
        }

        // Admins can view all events
        if ($user->hasRole('admin')) {
            return true;
        }

        // Check visibility settings
        if ($this->visibility === 'followers_only') {
            return $user->isFollowing($this->host);
        }

        return false;
    }

    /**
     * Check if a user can edit this event.
     *
     * @param User $user
     * @return bool
     */
    public function canBeEditedBy(User $user): bool
    {
        return $this->host_id === $user->id || $user->hasRole('admin');
    }

    /**
     * Check if a user can delete this event.
     *
     * @param User $user
     * @return bool
     */
    public function canBeDeletedBy(User $user): bool
    {
        return $this->host_id === $user->id || $user->hasRole('admin');
    }
}
