<?php

namespace App\Models\Core;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

/**
 * Activity Feed Model
 *
 * Manages user activity feeds with polymorphic relationships to various
 * activities like events, follows, comments, and shares. Supports privacy
 * controls, engagement scoring, and feed personalization.
 */
class ActivityFeed extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'activity_type',
        'activityable_type',
        'activityable_id',
        'actor_id',
        'activity_data',
        'activity_text',
        'privacy_level',
        'is_read',
        'is_visible',
        'engagement_score',
        'activity_timestamp',
    ];

    protected $casts = [
        'activity_data' => 'array',
        'is_read' => 'boolean',
        'is_visible' => 'boolean',
        'engagement_score' => 'integer',
        'activity_timestamp' => 'datetime',
    ];

    protected $dates = [
        'activity_timestamp',
        'deleted_at',
    ];

    /**
     * Activity types constants
     */
    public const ACTIVITY_TYPES = [
        'follow' => 'User followed someone',
        'event_created' => 'User created an event',
        'event_joined' => 'User joined an event',
        'event_commented' => 'User commented on an event',
        'event_shared' => 'User shared an event',
        'profile_updated' => 'User updated their profile',
        'interest_added' => 'User added new interests',
        'achievement_earned' => 'User earned an achievement',
    ];

    /**
     * Privacy levels constants
     */
    public const PRIVACY_LEVELS = [
        'public' => 'Visible to everyone',
        'friends' => 'Visible to friends only',
        'private' => 'Visible to user only',
    ];

    // Relationships

    /**
     * Get the user who owns this activity feed item.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who performed the activity.
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Get the activityable model (polymorphic relationship).
     */
    public function activityable(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes

    /**
     * Scope to filter by activity type.
     */
    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('activity_type', $type);
    }

    /**
     * Scope to filter by privacy level.
     */
    public function scopeByPrivacy(Builder $query, string $privacy): Builder
    {
        return $query->where('privacy_level', $privacy);
    }

    /**
     * Scope to get visible activities.
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope to get unread activities.
     */
    public function scopeUnread(Builder $query): Builder
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope to get activities for a specific user's feed.
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId)
                    ->visible()
                    ->orderBy('activity_timestamp', 'desc');
    }

    /**
     * Scope to get public activities.
     */
    public function scopePublic(Builder $query): Builder
    {
        return $query->where('privacy_level', 'public')->visible();
    }

    /**
     * Scope to get activities from followed users.
     */
    public function scopeFromFollowed(Builder $query, int $userId): Builder
    {
        return $query->whereHas('actor.followers', function ($q) use ($userId) {
            $q->where('follower_id', $userId);
        })->visible();
    }

    /**
     * Scope to get recent activities.
     */
    public function scopeRecent(Builder $query, int $days = 7): Builder
    {
        return $query->where('activity_timestamp', '>=', now()->subDays($days));
    }

    /**
     * Scope to order by engagement score.
     */
    public function scopeByEngagement(Builder $query, string $direction = 'desc'): Builder
    {
        return $query->orderBy('engagement_score', $direction)
                    ->orderBy('activity_timestamp', 'desc');
    }

    // Business Logic Methods

    /**
     * Mark activity as read.
     */
    public function markAsRead(): bool
    {
        return $this->update(['is_read' => true]);
    }

    /**
     * Mark activity as unread.
     */
    public function markAsUnread(): bool
    {
        return $this->update(['is_read' => false]);
    }

    /**
     * Hide activity from feed.
     */
    public function hide(): bool
    {
        return $this->update(['is_visible' => false]);
    }

    /**
     * Show activity in feed.
     */
    public function show(): bool
    {
        return $this->update(['is_visible' => true]);
    }

    /**
     * Update engagement score.
     */
    public function updateEngagementScore(int $score): bool
    {
        return $this->update(['engagement_score' => $score]);
    }

    /**
     * Increment engagement score.
     */
    public function incrementEngagement(int $points = 1): bool
    {
        return $this->increment('engagement_score', $points);
    }

    /**
     * Check if activity is recent (within last 24 hours).
     */
    public function isRecent(): bool
    {
        return $this->activity_timestamp->isAfter(now()->subDay());
    }

    /**
     * Check if activity is from today.
     */
    public function isToday(): bool
    {
        return $this->activity_timestamp->isToday();
    }

    /**
     * Get human-readable time difference.
     */
    public function getTimeAgoAttribute(): string
    {
        return $this->activity_timestamp->diffForHumans();
    }

    /**
     * Get activity type label.
     */
    public function getActivityTypeLabelAttribute(): string
    {
        return self::ACTIVITY_TYPES[$this->activity_type] ?? $this->activity_type;
    }

    /**
     * Get privacy level label.
     */
    public function getPrivacyLevelLabelAttribute(): string
    {
        return self::PRIVACY_LEVELS[$this->privacy_level] ?? $this->privacy_level;
    }

    /**
     * Check if user can view this activity.
     */
    public function canBeViewedBy(User $user): bool
    {
        if (!$this->is_visible) {
            return false;
        }

        switch ($this->privacy_level) {
            case 'public':
                return true;
            case 'friends':
                return $this->actor->isFollowedBy($user) || $this->actor_id === $user->id;
            case 'private':
                return $this->actor_id === $user->id;
            default:
                return false;
        }
    }

    /**
     * Create activity feed entry.
     */
    public static function createActivity(array $data): self
    {
        return self::create([
            'user_id' => $data['user_id'],
            'activity_type' => $data['activity_type'],
            'activityable_type' => $data['activityable_type'] ?? null,
            'activityable_id' => $data['activityable_id'] ?? null,
            'actor_id' => $data['actor_id'],
            'activity_data' => $data['activity_data'] ?? [],
            'activity_text' => $data['activity_text'] ?? null,
            'privacy_level' => $data['privacy_level'] ?? 'public',
            'engagement_score' => $data['engagement_score'] ?? 0,
            'activity_timestamp' => $data['activity_timestamp'] ?? now(),
        ]);
    }

    /**
     * Bulk mark activities as read for user.
     */
    public static function markAllAsReadForUser(int $userId): int
    {
        return self::where('user_id', $userId)
                  ->where('is_read', false)
                  ->update(['is_read' => true]);
    }

    /**
     * Clean up old activities.
     */
    public static function cleanupOldActivities(int $daysToKeep = 90): int
    {
        return self::where('activity_timestamp', '<', now()->subDays($daysToKeep))
                  ->delete();
    }
}
