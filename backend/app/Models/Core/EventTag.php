<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Event Tag Model.
 *
 * Manages tags for event categorization and search
 */
class EventTag extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'usage_count',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'usage_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ===================================
    // Relationships
    // ===================================

    /**
     * Get the events that have this tag.
     *
     * @return BelongsToMany
     */
    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_tag_pivot');
    }

    // ===================================
    // Scopes
    // ===================================

    /**
     * Scope to get popular tags.
     *
     * @param Builder $query
     * @param int     $limit
     *
     * @return Builder
     */
    public function scopePopular(Builder $query, int $limit = 20): Builder
    {
        return $query->orderByDesc('usage_count')->limit($limit);
    }

    /**
     * Scope to search tags by name.
     *
     * @param Builder $query
     * @param string  $search
     *
     * @return Builder
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
    }

    // ===================================
    // Mutators
    // ===================================

    /**
     * Set the name attribute and generate slug.
     *
     * @param string $value
     */
    public function setNameAttribute(string $value): void
    {
        $this->attributes['name'] = $value;
        $this->attributes['slug'] = $this->generateSlug($value);
    }

    // ===================================
    // Helper Methods
    // ===================================

    /**
     * Generate a slug from the name.
     *
     * @param string $name
     *
     * @return string
     */
    private function generateSlug(string $name): string
    {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));

        // Ensure uniqueness
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->where('id', '!=', $this->id ?? 0)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Increment the usage count.
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }

    /**
     * Decrement the usage count.
     */
    public function decrementUsage(): void
    {
        $this->decrement('usage_count');
    }

    /**
     * Find or create a tag by name.
     *
     * @param string $name
     *
     * @return static
     */
    public static function findOrCreateByName(string $name): static
    {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));

        return static::firstOrCreate(
            ['slug' => $slug],
            ['name' => $name]
        );
    }
}
