<?php

namespace App\Models\Core;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

/**
 * Friend Suggestion Model
 *
 * Manages friend suggestions with confidence scoring, mutual connections,
 * and suggestion tracking. Supports various suggestion algorithms and
 * user interaction tracking.
 */
class FriendSuggestion extends Model
{
    protected $fillable = [
        'user_id',
        'suggested_user_id',
        'suggestion_type',
        'confidence_score',
        'suggestion_reasons',
        'mutual_connections',
        'mutual_friends_count',
        'shared_interests_count',
        'shared_events_count',
        'is_dismissed',
        'dismissed_at',
        'is_contacted',
        'contacted_at',
        'is_followed',
        'followed_at',
        'expires_at',
    ];

    protected $casts = [
        'confidence_score' => 'decimal:4',
        'suggestion_reasons' => 'array',
        'mutual_connections' => 'array',
        'mutual_friends_count' => 'integer',
        'shared_interests_count' => 'integer',
        'shared_events_count' => 'integer',
        'is_dismissed' => 'boolean',
        'is_contacted' => 'boolean',
        'is_followed' => 'boolean',
        'dismissed_at' => 'datetime',
        'contacted_at' => 'datetime',
        'followed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Suggestion types constants
     */
    public const SUGGESTION_TYPES = [
        'mutual_friends' => 'Based on mutual friends',
        'shared_interests' => 'Based on shared interests',
        'shared_events' => 'Based on shared events',
        'location_based' => 'Based on location proximity',
        'activity_based' => 'Based on similar activities',
        'network_analysis' => 'Based on network analysis',
    ];

    // Relationships

    /**
     * Get the user who receives the suggestion.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the suggested user.
     */
    public function suggestedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'suggested_user_id');
    }

    // Scopes

    /**
     * Scope to filter by suggestion type.
     */
    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('suggestion_type', $type);
    }

    /**
     * Scope to get active suggestions (not dismissed or expired).
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_dismissed', false)
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    /**
     * Scope to get dismissed suggestions.
     */
    public function scopeDismissed(Builder $query): Builder
    {
        return $query->where('is_dismissed', true);
    }

    /**
     * Scope to get contacted suggestions.
     */
    public function scopeContacted(Builder $query): Builder
    {
        return $query->where('is_contacted', true);
    }

    /**
     * Scope to get followed suggestions.
     */
    public function scopeFollowed(Builder $query): Builder
    {
        return $query->where('is_followed', true);
    }

    /**
     * Scope to order by confidence score.
     */
    public function scopeByConfidence(Builder $query, string $direction = 'desc'): Builder
    {
        return $query->orderBy('confidence_score', $direction);
    }

    /**
     * Scope to get high confidence suggestions.
     */
    public function scopeHighConfidence(Builder $query, float $threshold = 0.7): Builder
    {
        return $query->where('confidence_score', '>=', $threshold);
    }

    /**
     * Scope to get expired suggestions.
     */
    public function scopeExpired(Builder $query): Builder
    {
        return $query->whereNotNull('expires_at')
                    ->where('expires_at', '<=', now());
    }

    /**
     * Scope to get suggestions for user.
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId)
                    ->active()
                    ->byConfidence()
                    ->with(['suggestedUser']);
    }

    // Business Logic Methods

    /**
     * Dismiss the suggestion.
     */
    public function dismiss(): bool
    {
        return $this->update([
            'is_dismissed' => true,
            'dismissed_at' => now(),
        ]);
    }

    /**
     * Mark as contacted.
     */
    public function markAsContacted(): bool
    {
        return $this->update([
            'is_contacted' => true,
            'contacted_at' => now(),
        ]);
    }

    /**
     * Mark as followed.
     */
    public function markAsFollowed(): bool
    {
        return $this->update([
            'is_followed' => true,
            'followed_at' => now(),
        ]);
    }

    /**
     * Update confidence score.
     */
    public function updateConfidence(float $score): bool
    {
        return $this->update(['confidence_score' => $score]);
    }

    /**
     * Check if suggestion is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if suggestion is active.
     */
    public function isActive(): bool
    {
        return !$this->is_dismissed && !$this->isExpired();
    }

    /**
     * Get suggestion type label.
     */
    public function getSuggestionTypeLabelAttribute(): string
    {
        return self::SUGGESTION_TYPES[$this->suggestion_type] ?? $this->suggestion_type;
    }

    /**
     * Get confidence percentage.
     */
    public function getConfidencePercentageAttribute(): int
    {
        return (int) ($this->confidence_score * 100);
    }

    /**
     * Get primary suggestion reason.
     */
    public function getPrimaryReasonAttribute(): ?string
    {
        return $this->suggestion_reasons[0] ?? null;
    }

    /**
     * Check if users have mutual friends.
     */
    public function hasMutualFriends(): bool
    {
        return $this->mutual_friends_count > 0;
    }

    /**
     * Check if users have shared interests.
     */
    public function hasSharedInterests(): bool
    {
        return $this->shared_interests_count > 0;
    }

    /**
     * Check if users have shared events.
     */
    public function hasSharedEvents(): bool
    {
        return $this->shared_events_count > 0;
    }

    /**
     * Create a friend suggestion.
     */
    public static function createSuggestion(array $data): self
    {
        return self::create([
            'user_id' => $data['user_id'],
            'suggested_user_id' => $data['suggested_user_id'],
            'suggestion_type' => $data['suggestion_type'],
            'confidence_score' => $data['confidence_score'] ?? 0.5,
            'suggestion_reasons' => $data['suggestion_reasons'] ?? [],
            'mutual_connections' => $data['mutual_connections'] ?? [],
            'mutual_friends_count' => $data['mutual_friends_count'] ?? 0,
            'shared_interests_count' => $data['shared_interests_count'] ?? 0,
            'shared_events_count' => $data['shared_events_count'] ?? 0,
            'expires_at' => $data['expires_at'] ?? now()->addDays(30),
        ]);
    }

    /**
     * Get suggestions for user with pagination.
     */
    public static function getSuggestionsForUser(int $userId, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return self::forUser($userId)
                  ->limit($limit)
                  ->get();
    }

    /**
     * Clean up expired suggestions.
     */
    public static function cleanupExpired(): int
    {
        return self::expired()->delete();
    }

    /**
     * Clean up dismissed suggestions older than specified days.
     */
    public static function cleanupDismissed(int $daysToKeep = 30): int
    {
        return self::dismissed()
                  ->where('dismissed_at', '<', now()->subDays($daysToKeep))
                  ->delete();
    }

    /**
     * Calculate suggestion score based on multiple factors.
     */
    public static function calculateScore(array $factors): float
    {
        $score = 0.0;
        $weights = [
            'mutual_friends' => 0.4,
            'shared_interests' => 0.3,
            'shared_events' => 0.2,
            'location_proximity' => 0.1,
        ];

        foreach ($factors as $factor => $value) {
            if (isset($weights[$factor])) {
                $score += $weights[$factor] * $value;
            }
        }

        return min(1.0, max(0.0, $score));
    }

    /**
     * Bulk dismiss suggestions for user.
     */
    public static function bulkDismissForUser(int $userId, array $suggestionIds): int
    {
        return self::where('user_id', $userId)
                  ->whereIn('id', $suggestionIds)
                  ->update([
                      'is_dismissed' => true,
                      'dismissed_at' => now(),
                  ]);
    }

    /**
     * Get suggestion statistics for user.
     */
    public static function getStatsForUser(int $userId): array
    {
        $suggestions = self::where('user_id', $userId);

        return [
            'total' => $suggestions->count(),
            'active' => (clone $suggestions)->active()->count(),
            'dismissed' => (clone $suggestions)->dismissed()->count(),
            'contacted' => (clone $suggestions)->contacted()->count(),
            'followed' => (clone $suggestions)->followed()->count(),
            'high_confidence' => (clone $suggestions)->highConfidence()->count(),
        ];
    }
}
