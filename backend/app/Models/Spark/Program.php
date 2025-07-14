<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Program Model (SparkProgram).
 *
 * Manages Spark educational programs with character topics and availability
 */
class Program extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'spark_programs';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'grade_levels',
        'duration_minutes',
        'max_students',
        'price_per_student',
        'character_topics',
        'learning_objectives',
        'materials_needed',
        'resource_files',
        'special_requirements',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'grade_levels' => 'array',
        'duration_minutes' => 'integer',
        'max_students' => 'integer',
        'price_per_student' => 'decimal:2',
        'character_topics' => 'array',
        'learning_objectives' => 'array',
        'materials_needed' => 'array',
        'resource_files' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // ===================================
    // Relationships
    // ===================================

    /**
     * Get the bookings for this program.
     *
     * @return HasMany
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'program_id');
    }

    /**
     * Get the availability slots for this program.
     *
     * @return HasMany
     */
    public function availability(): HasMany
    {
        return $this->hasMany(ProgramAvailability::class, 'program_id');
    }

    /**
     * Get the character topics associated with this program.
     *
     * @return BelongsToMany
     */
    public function characterTopics(): BelongsToMany
    {
        return $this->belongsToMany(CharacterTopic::class, 'program_character_topics');
    }

    // ===================================
    // Scopes
    // ===================================

    /**
     * Scope to get active programs.
     *
     * @param Builder $query
     *
     * @return Builder
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get programs by grade level.
     *
     * @param Builder $query
     * @param string  $gradeLevel
     *
     * @return Builder
     */
    public function scopeByGradeLevel(Builder $query, string $gradeLevel): Builder
    {
        return $query->whereJsonContains('grade_levels', $gradeLevel);
    }

    /**
     * Scope to get programs by character topic.
     *
     * @param Builder $query
     * @param string  $topic
     *
     * @return Builder
     */
    public function scopeByCharacterTopic(Builder $query, string $topic): Builder
    {
        return $query->whereJsonContains('character_topics', $topic);
    }

    /**
     * Scope to get programs by duration range.
     *
     * @param Builder $query
     * @param int     $minMinutes
     * @param int     $maxMinutes
     *
     * @return Builder
     */
    public function scopeByDuration(Builder $query, int $minMinutes, int $maxMinutes): Builder
    {
        return $query->whereBetween('duration_minutes', [$minMinutes, $maxMinutes]);
    }

    /**
     * Scope to get programs by price range.
     *
     * @param Builder $query
     * @param float   $minPrice
     * @param float   $maxPrice
     *
     * @return Builder
     */
    public function scopeByPriceRange(Builder $query, float $minPrice, float $maxPrice): Builder
    {
        return $query->whereBetween('price_per_student', [$minPrice, $maxPrice]);
    }

    /**
     * Scope to search programs by title or description.
     *
     * @param Builder $query
     * @param string  $search
     *
     * @return Builder
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    // ===================================
    // Accessors
    // ===================================

    /**
     * Get formatted grade levels.
     *
     * @return string
     */
    public function getFormattedGradeLevelsAttribute(): string
    {
        if (!$this->grade_levels || empty($this->grade_levels)) {
            return 'All grades';
        }

        return implode(', ', $this->grade_levels);
    }

    /**
     * Get formatted character topics.
     *
     * @return string
     */
    public function getFormattedCharacterTopicsAttribute(): string
    {
        if (!$this->character_topics || empty($this->character_topics)) {
            return 'General character development';
        }

        return implode(', ', $this->character_topics);
    }

    /**
     * Get formatted duration.
     *
     * @return string
     */
    public function getFormattedDurationAttribute(): string
    {
        $minutes = $this->duration_minutes;

        if ($minutes < 60) {
            return "{$minutes} minutes";
        }

        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;

        if ($remainingMinutes === 0) {
            return $hours === 1 ? '1 hour' : "{$hours} hours";
        }

        return $hours === 1 ? "1 hour {$remainingMinutes} minutes" : "{$hours} hours {$remainingMinutes} minutes";
    }

    /**
     * Get formatted price.
     *
     * @return string
     */
    public function getFormattedPriceAttribute(): string
    {
        if ($this->price_per_student == 0) {
            return 'Free';
        }

        return '$' . number_format($this->price_per_student, 2) . ' per student';
    }

    /**
     * Get the number of bookings.
     *
     * @return int
     */
    public function getBookingCountAttribute(): int
    {
        return $this->bookings()->count();
    }

    /**
     * Get the number of confirmed bookings.
     *
     * @return int
     */
    public function getConfirmedBookingCountAttribute(): int
    {
        return $this->bookings()->where('status', 'confirmed')->count();
    }

    /**
     * Get the number of available slots.
     *
     * @return int
     */
    public function getAvailableSlotsCountAttribute(): int
    {
        return $this->availability()->where('is_available', true)->count();
    }

    // ===================================
    // Helper Methods
    // ===================================

    /**
     * Check if the program can be deleted.
     *
     * @return bool
     */
    public function canBeDeleted(): bool
    {
        return $this->bookings()->whereIn('status', ['confirmed', 'pending'])->count() === 0;
    }

    /**
     * Activate the program.
     *
     * @return bool
     */
    public function activate(): bool
    {
        $this->is_active = true;

        return $this->save();
    }

    /**
     * Deactivate the program.
     *
     * @return bool
     */
    public function deactivate(): bool
    {
        $this->is_active = false;

        return $this->save();
    }

    /**
     * Add character topic to the program.
     *
     * @param string $topic
     *
     * @return bool
     */
    public function addCharacterTopic(string $topic): bool
    {
        $topics = $this->character_topics ?? [];
        if (!in_array($topic, $topics)) {
            $topics[] = $topic;
            $this->character_topics = $topics;

            return $this->save();
        }

        return false;
    }

    /**
     * Remove character topic from the program.
     *
     * @param string $topic
     *
     * @return bool
     */
    public function removeCharacterTopic(string $topic): bool
    {
        $topics = $this->character_topics ?? [];
        $key = array_search($topic, $topics);
        if ($key !== false) {
            unset($topics[$key]);
            $this->character_topics = array_values($topics);

            return $this->save();
        }

        return false;
    }

    /**
     * Check if program has a specific character topic.
     *
     * @param string $topic
     *
     * @return bool
     */
    public function hasCharacterTopic(string $topic): bool
    {
        return in_array($topic, $this->character_topics ?? []);
    }

    /**
     * Get program statistics.
     *
     * @return array
     */
    public function getStatistics(): array
    {
        return [
            'total_bookings' => $this->booking_count,
            'confirmed_bookings' => $this->confirmed_booking_count,
            'available_slots' => $this->available_slots_count,
            'total_participants' => $this->bookings()->sum('participant_count'),
        ];
    }
}
