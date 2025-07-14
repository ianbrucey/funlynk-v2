<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

/**
 * Event Category Model
 * 
 * Manages event categories for organization and filtering
 */
class EventCategory extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'icon',
        'color',
        'is_active',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ===================================
    // Relationships
    // ===================================

    /**
     * Get the events in this category.
     *
     * @return HasMany
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'category_id');
    }

    // ===================================
    // Scopes
    // ===================================

    /**
     * Scope to get active categories.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by sort order.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // ===================================
    // Accessors
    // ===================================

    /**
     * Get the events count for this category.
     *
     * @return int
     */
    public function getEventsCountAttribute(): int
    {
        return $this->events()->published()->count();
    }

    /**
     * Get the upcoming events count for this category.
     *
     * @return int
     */
    public function getUpcomingEventsCountAttribute(): int
    {
        return $this->events()->published()->upcoming()->count();
    }
}
