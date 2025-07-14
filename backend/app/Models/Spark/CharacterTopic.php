<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;

/**
 * Character Topic Model
 * 
 * Manages character development topics for Spark programs
 */
class CharacterTopic extends Model
{
    use HasFactory;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'category',
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
     * Get the programs that use this character topic.
     *
     * @return BelongsToMany
     */
    public function programs(): BelongsToMany
    {
        return $this->belongsToMany(Program::class, 'program_character_topics');
    }

    // ===================================
    // Scopes
    // ===================================

    /**
     * Scope to get active topics.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get topics by category.
     *
     * @param Builder $query
     * @param string $category
     * @return Builder
     */
    public function scopeByCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
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

    /**
     * Scope to search topics.
     *
     * @param Builder $query
     * @param string $search
     * @return Builder
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    // ===================================
    // Accessors
    // ===================================

    /**
     * Get the category display name.
     *
     * @return string
     */
    public function getCategoryDisplayAttribute(): string
    {
        return match($this->category) {
            'respect' => 'Respect',
            'responsibility' => 'Responsibility',
            'integrity' => 'Integrity',
            'kindness' => 'Kindness',
            'perseverance' => 'Perseverance',
            'courage' => 'Courage',
            'empathy' => 'Empathy',
            'teamwork' => 'Teamwork',
            'leadership' => 'Leadership',
            'citizenship' => 'Citizenship',
            default => ucfirst($this->category)
        };
    }

    /**
     * Get the number of programs using this topic.
     *
     * @return int
     */
    public function getProgramsCountAttribute(): int
    {
        return $this->programs()->count();
    }

    // ===================================
    // Mutators
    // ===================================

    /**
     * Set the name attribute and generate slug.
     *
     * @param string $value
     * @return void
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
     * Find or create a topic by name.
     *
     * @param string $name
     * @param string $category
     * @return static
     */
    public static function findOrCreateByName(string $name, string $category = 'general'): static
    {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
        
        return static::firstOrCreate(
            ['slug' => $slug],
            [
                'name' => $name,
                'category' => $category,
                'is_active' => true,
            ]
        );
    }

    /**
     * Get available character topic categories.
     *
     * @return array
     */
    public static function getCategories(): array
    {
        return [
            'respect' => 'Respect',
            'responsibility' => 'Responsibility',
            'integrity' => 'Integrity',
            'kindness' => 'Kindness',
            'perseverance' => 'Perseverance',
            'courage' => 'Courage',
            'empathy' => 'Empathy',
            'teamwork' => 'Teamwork',
            'leadership' => 'Leadership',
            'citizenship' => 'Citizenship',
        ];
    }
}
