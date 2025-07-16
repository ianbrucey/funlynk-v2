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
        return $this->belongsToMany(CharacterTopic::class, 'spark_program_character_topics', 'program_id', 'character_topic_id');
    }

    /**
     * Get the districts that offer this program.
     *
     * @return BelongsToMany
     */
    public function districts(): BelongsToMany
    {
        return $this->belongsToMany(District::class, 'program_districts')
            ->withPivot(['is_active', 'price_override'])
            ->withTimestamps();
    }

    /**
     * Get the schools that offer this program.
     *
     * @return BelongsToMany
     */
    public function schools(): BelongsToMany
    {
        return $this->belongsToMany(School::class, 'program_schools')
            ->withPivot(['is_active', 'price_override', 'max_students_override'])
            ->withTimestamps();
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
     * @param int     $minDuration
     * @param int     $maxDuration
     *
     * @return Builder
     */
    public function scopeByDuration(Builder $query, ?int $minDuration = null, ?int $maxDuration = null): Builder
    {
        if ($minDuration) {
            $query->where('duration_minutes', '>=', $minDuration);
        }
        if ($maxDuration) {
            $query->where('duration_minutes', '<=', $maxDuration);
        }
        return $query;
    }

    /**
     * Scope to get programs by capacity range.
     *
     * @param Builder $query
     * @param int     $minCapacity
     * @param int     $maxCapacity
     *
     * @return Builder
     */
    public function scopeByCapacity(Builder $query, ?int $minCapacity = null, ?int $maxCapacity = null): Builder
    {
        if ($minCapacity) {
            $query->where('max_students', '>=', $minCapacity);
        }
        if ($maxCapacity) {
            $query->where('max_students', '<=', $maxCapacity);
        }
        return $query;
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

    /**
     * Scope to get programs by district.
     *
     * @param Builder $query
     * @param int     $districtId
     *
     * @return Builder
     */
    public function scopeByDistrict(Builder $query, int $districtId): Builder
    {
        return $query->whereHas('districts', function ($q) use ($districtId) {
            $q->where('district_id', $districtId);
        });
    }

    /**
     * Scope to get programs by school.
     *
     * @param Builder $query
     * @param int     $schoolId
     *
     * @return Builder
     */
    public function scopeBySchool(Builder $query, int $schoolId): Builder
    {
        return $query->whereHas('schools', function ($q) use ($schoolId) {
            $q->where('school_id', $schoolId);
        });
    }

    /**
     * Scope to get programs with availability.
     *
     * @param Builder $query
     *
     * @return Builder
     */
    public function scopeWithAvailability(Builder $query): Builder
    {
        return $query->whereHas('availability', function ($q) {
            $q->where('is_available', true)
              ->where('date', '>=', now()->toDateString())
              ->where('current_bookings', '<', 'max_bookings');
        });
    }

    /**
     * Scope to get programs with upcoming availability.
     *
     * @param Builder $query
     * @param int     $days
     *
     * @return Builder
     */
    public function scopeWithUpcomingAvailability(Builder $query, int $days = 30): Builder
    {
        return $query->whereHas('availability', function ($q) use ($days) {
            $q->where('is_available', true)
              ->whereBetween('date', [now()->toDateString(), now()->addDays($days)->toDateString()])
              ->where('current_bookings', '<', 'max_bookings');
        });
    }

    /**
     * Scope to get programs by minimum rating.
     *
     * @param Builder $query
     * @param float   $minRating
     *
     * @return Builder
     */
    public function scopeByMinRating(Builder $query, float $minRating): Builder
    {
        return $query->whereHas('bookings', function ($q) use ($minRating) {
            $q->whereNotNull('rating')
              ->having('avg_rating', '>=', $minRating);
        }, '>=', 1, 'and', function ($q) use ($minRating) {
            $q->selectRaw('AVG(rating) as avg_rating')
              ->whereNotNull('rating')
              ->groupBy('program_id');
        });
    }

    /**
     * Scope to get programs ordered by popularity.
     *
     * @param Builder $query
     *
     * @return Builder
     */
    public function scopePopular(Builder $query): Builder
    {
        return $query->withCount(['bookings' => function ($q) {
            $q->where('status', 'completed');
        }])->orderBy('bookings_count', 'desc');
    }

    /**
     * Scope to get programs with recent activity.
     *
     * @param Builder $query
     * @param int     $days
     *
     * @return Builder
     */
    public function scopeRecentActivity(Builder $query, int $days = 30): Builder
    {
        return $query->whereHas('bookings', function ($q) use ($days) {
            $q->where('created_at', '>=', now()->subDays($days));
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
     * Get grade levels display (alias for compatibility).
     *
     * @return string
     */
    public function getGradeLevelsDisplayAttribute(): string
    {
        return $this->getFormattedGradeLevelsAttribute();
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
     * Get character topics display (alias for compatibility).
     *
     * @return string
     */
    public function getCharacterTopicsDisplayAttribute(): string
    {
        return $this->getFormattedCharacterTopicsAttribute();
    }

    /**
     * Get duration display.
     *
     * @return string
     */
    public function getDurationDisplayAttribute(): string
    {
        $hours = floor($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;
        
        if ($hours > 0) {
            return $minutes > 0 ? "{$hours}h {$minutes}m" : "{$hours}h";
        }
        return "{$minutes}m";
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

    /**
     * Get total bookings count.
     *
     * @return int
     */
    public function getTotalBookingsAttribute(): int
    {
        return $this->bookings()->count();
    }

    /**
     * Get completed bookings count.
     *
     * @return int
     */
    public function getCompletedBookingsAttribute(): int
    {
        return $this->bookings()->where('status', 'completed')->count();
    }

    /**
     * Get average rating.
     *
     * @return float|null
     */
    public function getAverageRatingAttribute(): ?float
    {
        return $this->bookings()
            ->whereNotNull('rating')
            ->avg('rating');
    }

    /**
     * Get pending bookings count.
     *
     * @return int
     */
    public function getPendingBookingsAttribute(): int
    {
        return $this->bookings()->where('status', 'pending')->count();
    }

    /**
     * Get cancelled bookings count.
     *
     * @return int
     */
    public function getCancelledBookingsAttribute(): int
    {
        return $this->bookings()->where('status', 'cancelled')->count();
    }

    /**
     * Get total participants across all bookings.
     *
     * @return int
     */
    public function getTotalParticipantsAttribute(): int
    {
        return $this->bookings()->sum('student_count');
    }

    /**
     * Get total revenue from completed bookings.
     *
     * @return float
     */
    public function getTotalRevenueAttribute(): float
    {
        return $this->bookings()
            ->where('status', 'completed')
            ->sum('total_cost');
    }

    /**
     * Get next available booking date.
     *
     * @return string|null
     */
    public function getNextAvailableDateAttribute(): ?string
    {
        $nextSlot = $this->availability()
            ->where('is_available', true)
            ->where('date', '>=', now()->toDateString())
            ->where('current_bookings', '<', 'max_bookings')
            ->orderBy('date')
            ->first();

        return $nextSlot ? $nextSlot->date->format('Y-m-d') : null;
    }

    /**
     * Get program popularity score.
     *
     * @return float
     */
    public function getPopularityScoreAttribute(): float
    {
        $completedBookings = $this->completed_bookings;
        $averageRating = $this->average_rating ?? 0;
        $recentActivity = $this->bookings()
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        return ($completedBookings * 0.4) + ($averageRating * 0.4) + ($recentActivity * 0.2);
    }

    /**
     * Get program status display.
     *
     * @return string
     */
    public function getStatusDisplayAttribute(): string
    {
        if (!$this->is_active) {
            return 'Inactive';
        }

        if ($this->available_slots_count === 0) {
            return 'Fully Booked';
        }

        if ($this->next_available_date) {
            return 'Available';
        }

        return 'No Availability';
    }

    /**
     * Get formatted materials needed.
     *
     * @return string
     */
    public function getFormattedMaterialsAttribute(): string
    {
        if (!$this->materials_needed || empty($this->materials_needed)) {
            return 'No special materials required';
        }

        return implode(', ', $this->materials_needed);
    }

    /**
     * Get formatted learning objectives.
     *
     * @return string
     */
    public function getFormattedLearningObjectivesAttribute(): string
    {
        if (!$this->learning_objectives || empty($this->learning_objectives)) {
            return 'General character development';
        }

        return implode('; ', $this->learning_objectives);
    }

    /**
     * Get is popular attribute.
     *
     * @return bool
     */
    public function getIsPopularAttribute(): bool
    {
        return $this->completed_bookings >= 10 && $this->average_rating >= 4.0;
    }

    /**
     * Get has availability attribute.
     *
     * @return bool
     */
    public function getHasAvailabilityAttribute(): bool
    {
        return $this->availability()
            ->where('is_available', true)
            ->where('date', '>=', now()->toDateString())
            ->where('current_bookings', '<', 'max_bookings')
            ->exists();
    }

    /**
     * Get booking success rate.
     *
     * @return float
     */
    public function getBookingSuccessRateAttribute(): float
    {
        $totalBookings = $this->total_bookings;
        if ($totalBookings === 0) {
            return 0;
        }

        return ($this->completed_bookings / $totalBookings) * 100;
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
