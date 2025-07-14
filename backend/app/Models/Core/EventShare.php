<?php

namespace App\Models\Core;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Event Share Model.
 *
 * Tracks event sharing activity and analytics
 */
class EventShare extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'event_id',
        'user_id',
        'platform',
        'shared_url',
        'ip_address',
        'user_agent',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ===================================
    // Relationships
    // ===================================

    /**
     * Get the event that was shared.
     *
     * @return BelongsTo
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the user who shared the event.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ===================================
    // Scopes
    // ===================================

    /**
     * Scope to get shares for a specific event.
     *
     * @param Builder $query
     * @param int     $eventId
     *
     * @return Builder
     */
    public function scopeForEvent(Builder $query, int $eventId): Builder
    {
        return $query->where('event_id', $eventId);
    }

    /**
     * Scope to get shares by a specific user.
     *
     * @param Builder $query
     * @param int     $userId
     *
     * @return Builder
     */
    public function scopeByUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get shares on a specific platform.
     *
     * @param Builder $query
     * @param string  $platform
     *
     * @return Builder
     */
    public function scopeOnPlatform(Builder $query, string $platform): Builder
    {
        return $query->where('platform', $platform);
    }

    /**
     * Scope to get recent shares.
     *
     * @param Builder $query
     * @param int     $days
     *
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
     * Get the platform display name.
     *
     * @return string
     */
    public function getPlatformDisplayAttribute(): string
    {
        return match($this->platform) {
            'facebook' => 'Facebook',
            'twitter' => 'Twitter',
            'instagram' => 'Instagram',
            'linkedin' => 'LinkedIn',
            'whatsapp' => 'WhatsApp',
            'email' => 'Email',
            'copy_link' => 'Copy Link',
            'qr_code' => 'QR Code',
            default => ucfirst($this->platform)
        };
    }

    // ===================================
    // Static Methods
    // ===================================

    /**
     * Record a share event.
     *
     * @param int         $eventId
     * @param int|null    $userId
     * @param string      $platform
     * @param string      $sharedUrl
     * @param string|null $ipAddress
     * @param string|null $userAgent
     *
     * @return static
     */
    public static function recordShare(
        int $eventId,
        ?int $userId,
        string $platform,
        string $sharedUrl,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): static {
        return static::create([
            'event_id' => $eventId,
            'user_id' => $userId,
            'platform' => $platform,
            'shared_url' => $sharedUrl,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }

    /**
     * Get share statistics for an event.
     *
     * @param int $eventId
     *
     * @return array
     */
    public static function getEventShareStats(int $eventId): array
    {
        $shares = static::forEvent($eventId)->get();

        return [
            'total_shares' => $shares->count(),
            'unique_sharers' => $shares->whereNotNull('user_id')->unique('user_id')->count(),
            'platform_breakdown' => $shares->groupBy('platform')->map->count(),
            'recent_shares' => $shares->where('created_at', '>=', now()->subDays(7))->count(),
        ];
    }
}
