<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use App\Models\User;

/**
 * Event Comment Model
 * 
 * Manages comments and discussions on events
 */
class EventComment extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'event_id',
        'user_id',
        'parent_id',
        'content',
        'is_approved',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_approved' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // ===================================
    // Relationships
    // ===================================

    /**
     * Get the event this comment belongs to.
     *
     * @return BelongsTo
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the user who made this comment.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent comment (for replies).
     *
     * @return BelongsTo
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(EventComment::class, 'parent_id');
    }

    /**
     * Get the replies to this comment.
     *
     * @return HasMany
     */
    public function replies(): HasMany
    {
        return $this->hasMany(EventComment::class, 'parent_id');
    }

    // ===================================
    // Scopes
    // ===================================

    /**
     * Scope to get approved comments.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope to get top-level comments (not replies).
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeTopLevel(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope to get comments for a specific event.
     *
     * @param Builder $query
     * @param int $eventId
     * @return Builder
     */
    public function scopeForEvent(Builder $query, int $eventId): Builder
    {
        return $query->where('event_id', $eventId);
    }

    /**
     * Scope to get comments by a specific user.
     *
     * @param Builder $query
     * @param int $userId
     * @return Builder
     */
    public function scopeByUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get recent comments.
     *
     * @param Builder $query
     * @param int $days
     * @return Builder
     */
    public function scopeRecent(Builder $query, int $days = 7): Builder
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // ===================================
    // Accessors
    // ===================================

    /**
     * Check if this is a reply to another comment.
     *
     * @return bool
     */
    public function getIsReplyAttribute(): bool
    {
        return $this->parent_id !== null;
    }

    /**
     * Get the number of replies to this comment.
     *
     * @return int
     */
    public function getRepliesCountAttribute(): int
    {
        return $this->replies()->approved()->count();
    }

    /**
     * Get formatted content with mentions processed.
     *
     * @return string
     */
    public function getFormattedContentAttribute(): string
    {
        // Process @mentions in the content
        return preg_replace(
            '/@(\w+)/',
            '<span class="mention">@$1</span>',
            $this->content
        );
    }

    // ===================================
    // Helper Methods
    // ===================================

    /**
     * Check if a user can edit this comment.
     *
     * @param User $user
     * @return bool
     */
    public function canBeEditedBy(User $user): bool
    {
        // Users can edit their own comments within 15 minutes
        if ($this->user_id === $user->id) {
            return $this->created_at->diffInMinutes(now()) <= 15;
        }

        // Admins and event hosts can edit any comment
        return $user->hasRole('admin') || $this->event->host_id === $user->id;
    }

    /**
     * Check if a user can delete this comment.
     *
     * @param User $user
     * @return bool
     */
    public function canBeDeletedBy(User $user): bool
    {
        // Users can delete their own comments
        if ($this->user_id === $user->id) {
            return true;
        }

        // Admins and event hosts can delete any comment
        return $user->hasRole('admin') || $this->event->host_id === $user->id;
    }

    /**
     * Approve the comment.
     *
     * @return bool
     */
    public function approve(): bool
    {
        $this->is_approved = true;
        return $this->save();
    }

    /**
     * Disapprove the comment.
     *
     * @return bool
     */
    public function disapprove(): bool
    {
        $this->is_approved = false;
        return $this->save();
    }

    /**
     * Get mentions in the comment content.
     *
     * @return array
     */
    public function getMentions(): array
    {
        preg_match_all('/@(\w+)/', $this->content, $matches);
        return $matches[1] ?? [];
    }
}
