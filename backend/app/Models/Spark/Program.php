<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use App\Models\User;

/**
 * Program Model
 * 
 * Manages Spark educational programs within schools
 */
class Program extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'school_id',
        'name',
        'description',
        'type',
        'grade_levels',
        'subject_areas',
        'duration_weeks',
        'max_participants',
        'requirements',
        'learning_objectives',
        'materials_needed',
        'cost_per_student',
        'schedule_info',
        'contact_info',
        'is_active',
        'is_featured',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'grade_levels' => 'array',
        'subject_areas' => 'array',
        'requirements' => 'array',
        'learning_objectives' => 'array',
        'materials_needed' => 'array',
        'schedule_info' => 'array',
        'contact_info' => 'array',
        'cost_per_student' => 'decimal:2',
        'duration_weeks' => 'integer',
        'max_participants' => 'integer',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // ===================================
    // Relationships
    // ===================================

    /**
     * Get the school this program belongs to.
     *
     * @return BelongsTo
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the teachers assigned to this program.
     *
     * @return BelongsToMany
     */
    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'program_teachers')
            ->withPivot(['role', 'is_lead_teacher'])
            ->withTimestamps();
    }

    /**
     * Get the bookings for this program.
     *
     * @return HasMany
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    // ===================================
    // Scopes
    // ===================================

    /**
     * Scope to get active programs.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get featured programs.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope to get programs by type.
     *
     * @param Builder $query
     * @param string $type
     * @return Builder
     */
    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get programs by grade level.
     *
     * @param Builder $query
     * @param string $gradeLevel
     * @return Builder
     */
    public function scopeByGradeLevel(Builder $query, string $gradeLevel): Builder
    {
        return $query->whereJsonContains('grade_levels', $gradeLevel);
    }

    /**
     * Scope to get programs by subject area.
     *
     * @param Builder $query
     * @param string $subjectArea
     * @return Builder
     */
    public function scopeBySubjectArea(Builder $query, string $subjectArea): Builder
    {
        return $query->whereJsonContains('subject_areas', $subjectArea);
    }

    // ===================================
    // Accessors
    // ===================================

    /**
     * Get the program type display name.
     *
     * @return string
     */
    public function getTypeDisplayAttribute(): string
    {
        return match($this->type) {
            'field_trip' => 'Field Trip',
            'workshop' => 'Workshop',
            'residency' => 'Artist Residency',
            'assembly' => 'School Assembly',
            'after_school' => 'After School Program',
            'summer_camp' => 'Summer Camp',
            default => ucfirst($this->type)
        };
    }

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
     * Get formatted subject areas.
     *
     * @return string
     */
    public function getFormattedSubjectAreasAttribute(): string
    {
        if (!$this->subject_areas || empty($this->subject_areas)) {
            return 'General';
        }

        return implode(', ', $this->subject_areas);
    }

    /**
     * Get formatted cost.
     *
     * @return string
     */
    public function getFormattedCostAttribute(): string
    {
        if ($this->cost_per_student == 0) {
            return 'Free';
        }

        return '$' . number_format($this->cost_per_student, 2) . ' per student';
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
     * Feature the program.
     *
     * @return bool
     */
    public function feature(): bool
    {
        $this->is_featured = true;
        return $this->save();
    }

    /**
     * Unfeature the program.
     *
     * @return bool
     */
    public function unfeature(): bool
    {
        $this->is_featured = false;
        return $this->save();
    }

    /**
     * Assign a teacher to the program.
     *
     * @param User $teacher
     * @param string $role
     * @param bool $isLeadTeacher
     * @return void
     */
    public function assignTeacher(User $teacher, string $role = 'instructor', bool $isLeadTeacher = false): void
    {
        $this->teachers()->attach($teacher->id, [
            'role' => $role,
            'is_lead_teacher' => $isLeadTeacher,
        ]);
    }

    /**
     * Remove a teacher from the program.
     *
     * @param User $teacher
     * @return void
     */
    public function removeTeacher(User $teacher): void
    {
        $this->teachers()->detach($teacher->id);
    }

    /**
     * Check if a user is assigned as a teacher for this program.
     *
     * @param User $user
     * @return bool
     */
    public function hasTeacher(User $user): bool
    {
        return $this->teachers()->where('user_id', $user->id)->exists();
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
            'teachers_count' => $this->teachers()->count(),
            'total_participants' => $this->bookings()->sum('participant_count'),
        ];
    }
}
