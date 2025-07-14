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
 * School Model
 * 
 * Manages individual schools within districts for Spark educational programs
 */
class School extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'district_id',
        'name',
        'code',
        'type',
        'address',
        'city',
        'state',
        'zip_code',
        'phone',
        'email',
        'website',
        'principal_name',
        'principal_email',
        'principal_phone',
        'grade_levels',
        'student_count',
        'contact_info',
        'settings',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'grade_levels' => 'array',
        'contact_info' => 'array',
        'settings' => 'array',
        'is_active' => 'boolean',
        'student_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // ===================================
    // Relationships
    // ===================================

    /**
     * Get the district this school belongs to.
     *
     * @return BelongsTo
     */
    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    /**
     * Get the users associated with this school.
     *
     * @return HasMany
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'school_id');
    }

    /**
     * Get the programs offered by this school.
     *
     * @return HasMany
     */
    public function programs(): HasMany
    {
        return $this->hasMany(Program::class);
    }

    /**
     * Get the administrators for this school.
     *
     * @return BelongsToMany
     */
    public function administrators(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'school_administrators')
            ->withPivot(['role', 'permissions'])
            ->withTimestamps();
    }

    // ===================================
    // Scopes
    // ===================================

    /**
     * Scope to get active schools.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get schools by type.
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
     * Scope to get schools by district.
     *
     * @param Builder $query
     * @param int $districtId
     * @return Builder
     */
    public function scopeByDistrict(Builder $query, int $districtId): Builder
    {
        return $query->where('district_id', $districtId);
    }

    /**
     * Scope to get schools by grade level.
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
     * Scope to search schools.
     *
     * @param Builder $query
     * @param string $search
     * @return Builder
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('code', 'like', "%{$search}%")
              ->orWhere('city', 'like', "%{$search}%")
              ->orWhere('principal_name', 'like', "%{$search}%");
        });
    }

    // ===================================
    // Accessors
    // ===================================

    /**
     * Get the full address.
     *
     * @return string
     */
    public function getFullAddressAttribute(): string
    {
        return "{$this->address}, {$this->city}, {$this->state} {$this->zip_code}";
    }

    /**
     * Get the school type display name.
     *
     * @return string
     */
    public function getTypeDisplayAttribute(): string
    {
        return match($this->type) {
            'elementary' => 'Elementary School',
            'middle' => 'Middle School',
            'high' => 'High School',
            'k12' => 'K-12 School',
            'charter' => 'Charter School',
            'private' => 'Private School',
            'magnet' => 'Magnet School',
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
            return 'Not specified';
        }

        return implode(', ', $this->grade_levels);
    }

    /**
     * Get formatted phone number.
     *
     * @return string|null
     */
    public function getFormattedPhoneAttribute(): ?string
    {
        if (!$this->phone) {
            return null;
        }

        // Simple US phone number formatting
        $phone = preg_replace('/[^0-9]/', '', $this->phone);
        if (strlen($phone) === 10) {
            return sprintf('(%s) %s-%s', 
                substr($phone, 0, 3),
                substr($phone, 3, 3),
                substr($phone, 6, 4)
            );
        }

        return $this->phone;
    }

    /**
     * Get the number of programs.
     *
     * @return int
     */
    public function getProgramCountAttribute(): int
    {
        return $this->programs()->count();
    }

    /**
     * Get the number of active programs.
     *
     * @return int
     */
    public function getActiveProgramCountAttribute(): int
    {
        return $this->programs()->where('is_active', true)->count();
    }

    // ===================================
    // Helper Methods
    // ===================================

    /**
     * Check if the school can be deleted.
     *
     * @return bool
     */
    public function canBeDeleted(): bool
    {
        return $this->programs()->count() === 0 && $this->users()->count() === 0;
    }

    /**
     * Activate the school.
     *
     * @return bool
     */
    public function activate(): bool
    {
        $this->is_active = true;
        return $this->save();
    }

    /**
     * Deactivate the school.
     *
     * @return bool
     */
    public function deactivate(): bool
    {
        $this->is_active = false;
        return $this->save();
    }

    /**
     * Add an administrator to the school.
     *
     * @param User $user
     * @param string $role
     * @param array $permissions
     * @return void
     */
    public function addAdministrator(User $user, string $role = 'admin', array $permissions = []): void
    {
        $this->administrators()->attach($user->id, [
            'role' => $role,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Remove an administrator from the school.
     *
     * @param User $user
     * @return void
     */
    public function removeAdministrator(User $user): void
    {
        $this->administrators()->detach($user->id);
    }

    /**
     * Check if a user is an administrator of this school.
     *
     * @param User $user
     * @return bool
     */
    public function isAdministrator(User $user): bool
    {
        return $this->administrators()->where('user_id', $user->id)->exists();
    }

    /**
     * Get school statistics.
     *
     * @return array
     */
    public function getStatistics(): array
    {
        return [
            'total_programs' => $this->program_count,
            'active_programs' => $this->active_program_count,
            'total_users' => $this->users()->count(),
            'administrators_count' => $this->administrators()->count(),
            'student_count' => $this->student_count,
        ];
    }
}
