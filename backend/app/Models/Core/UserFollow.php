<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

/**
 * User Follow Model
 * 
 * Manages the social following system between users
 */
class UserFollow extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'follower_id',
        'following_id',
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

    /**
     * Get the user who is following.
     *
     * @return BelongsTo
     */
    public function follower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'follower_id');
    }

    /**
     * Get the user being followed.
     *
     * @return BelongsTo
     */
    public function following(): BelongsTo
    {
        return $this->belongsTo(User::class, 'following_id');
    }

    /**
     * Scope to get follows for a specific user.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('follower_id', $userId);
    }

    /**
     * Scope to get followers of a specific user.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFollowersOf($query, int $userId)
    {
        return $query->where('following_id', $userId);
    }

    /**
     * Check if a follow relationship exists.
     *
     * @param int $followerId
     * @param int $followingId
     * @return bool
     */
    public static function exists(int $followerId, int $followingId): bool
    {
        return static::where('follower_id', $followerId)
            ->where('following_id', $followingId)
            ->exists();
    }

    /**
     * Create a follow relationship.
     *
     * @param int $followerId
     * @param int $followingId
     * @return static|null
     */
    public static function createFollow(int $followerId, int $followingId): ?static
    {
        if ($followerId === $followingId) {
            return null; // Can't follow yourself
        }

        if (static::exists($followerId, $followingId)) {
            return null; // Already following
        }

        return static::create([
            'follower_id' => $followerId,
            'following_id' => $followingId,
        ]);
    }

    /**
     * Remove a follow relationship.
     *
     * @param int $followerId
     * @param int $followingId
     * @return bool
     */
    public static function removeFollow(int $followerId, int $followingId): bool
    {
        return static::where('follower_id', $followerId)
            ->where('following_id', $followingId)
            ->delete() > 0;
    }
}
