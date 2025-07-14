<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SparkProfile extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'personality_type',
        'fun_facts',
        'hobbies',
        'favorite_books',
        'favorite_movies',
        'favorite_music',
        'favorite_quotes',
        'bucket_list',
        'pet_peeves',
        'dream_destinations',
        'life_motto',
        'current_mood',
        'relationship_status',
        'looking_for',
        'deal_breakers',
        'ideal_first_date',
        'conversation_starters',
        'icebreaker_questions',
        'fun_challenges',
        'quirky_habits',
        'hidden_talents',
        'guilty_pleasures',
        'spirit_animal',
        'superpowers_wish',
        'time_travel_destination',
        'desert_island_items',
        'karaoke_song',
        'pizza_toppings',
        'coffee_order',
        'weekend_plans',
        'adventure_level',
        'humor_style',
        'communication_style',
        'energy_level',
        'spontaneity_level',
        'social_battery',
        'love_language',
        'conflict_resolution',
        'decision_making_style',
        'stress_relief',
        'celebration_style',
        'learning_style',
        'creativity_outlet',
        'fitness_routine',
        'food_preferences',
        'travel_style',
        'entertainment_preferences',
        'social_causes',
        'volunteer_work',
        'mentorship_interests',
        'networking_goals',
        'personal_growth',
        'future_aspirations',
        'legacy_goals',
        // 'spark_score',           // Should be calculated, not mass-assigned
        'profile_visibility',
        // 'last_spark_update',     // Should be set programmatically
    ];

    /**
     * The attributes that should be guarded from mass assignment.
     *
     * @var array<int, string>
     */
    protected $guarded = [
        'id',
        'spark_score',
        'last_spark_update',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'fun_facts' => 'array',
        'hobbies' => 'array',
        'favorite_books' => 'array',
        'favorite_movies' => 'array',
        'favorite_music' => 'array',
        'favorite_quotes' => 'array',
        'bucket_list' => 'array',
        'pet_peeves' => 'array',
        'dream_destinations' => 'array',
        'conversation_starters' => 'array',
        'icebreaker_questions' => 'array',
        'fun_challenges' => 'array',
        'quirky_habits' => 'array',
        'hidden_talents' => 'array',
        'guilty_pleasures' => 'array',
        'desert_island_items' => 'array',
        'pizza_toppings' => 'array',
        'food_preferences' => 'array',
        'entertainment_preferences' => 'array',
        'social_causes' => 'array',
        'volunteer_work' => 'array',
        'mentorship_interests' => 'array',
        'networking_goals' => 'array',
        'personal_growth' => 'array',
        'future_aspirations' => 'array',
        'legacy_goals' => 'array',
        'spark_score' => 'integer',
        'profile_visibility' => 'boolean',
        'last_spark_update' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the user that owns the spark profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include visible profiles.
     */
    public function scopeVisible($query)
    {
        return $query->where('profile_visibility', true);
    }

    /**
     * Scope a query to only include profiles with high spark scores.
     */
    public function scopeHighSpark($query, $threshold = 80)
    {
        return $query->where('spark_score', '>=', $threshold);
    }

    /**
     * Scope a query to only include recently updated profiles.
     */
    public function scopeRecentlyUpdated($query, $days = 30)
    {
        return $query->where('last_spark_update', '>=', now()->subDays($days));
    }

    /**
     * Get the personality summary accessor.
     */
    public function getPersonalitySummaryAttribute(): string
    {
        return $this->personality_type . ' - ' . $this->current_mood;
    }

    /**
     * Get the fun level accessor.
     */
    public function getFunLevelAttribute(): string
    {
        if ($this->spark_score >= 90) {
            return 'Extremely Fun';
        }
        if ($this->spark_score >= 70) {
            return 'Very Fun';
        }
        if ($this->spark_score >= 50) {
            return 'Fun';
        }
        if ($this->spark_score >= 30) {
            return 'Moderately Fun';
        }
        return 'Getting Started';
    }

    /**
     * Check if the profile is recently active.
     */
    public function getIsRecentlyActiveAttribute(): bool
    {
        return $this->last_spark_update && $this->last_spark_update->diffInDays(now()) <= 7;
    }

    /**
     * Get random fun fact.
     */
    public function getRandomFunFactAttribute(): ?string
    {
        if (empty($this->fun_facts)) {
            return null;
        }
        return $this->fun_facts[array_rand($this->fun_facts)];
    }

    /**
     * Get random conversation starter.
     */
    public function getRandomConversationStarterAttribute(): ?string
    {
        if (empty($this->conversation_starters)) {
            return null;
        }
        return $this->conversation_starters[array_rand($this->conversation_starters)];
    }
}
