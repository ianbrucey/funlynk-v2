<?php

namespace App\Models\Core;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * User Interest Model.
 *
 * Manages user interests and preferences for event recommendations
 */
class UserInterest extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'interest',
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
     * Get the user that owns the interest.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get interests by category.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string                                $category
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('interest', 'like', "%{$category}%");
    }

    /**
     * Scope to get popular interests.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int                                   $limit
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePopular($query, int $limit = 10)
    {
        return $query->select('interest')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('interest')
            ->orderByDesc('count')
            ->limit($limit);
    }

    /**
     * Get formatted interest name.
     *
     * @return string
     */
    public function getFormattedInterestAttribute(): string
    {
        return ucwords(str_replace(['_', '-'], ' ', $this->interest));
    }
}
