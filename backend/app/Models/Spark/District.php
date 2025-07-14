<?php

namespace App\Models\Spark;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * District Model.
 *
 * Manages school districts for Spark educational programs
 */
class District extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',
        'address',
        'city',
        'state',
        'zip_code',
        'phone',
        'email',
        'website',
        'contact_info',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'contact_info' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // ===================================
    // Relationships
    // ===================================

    /**
     * Get the schools in this district.
     *
     * @return HasMany
     */
    public function schools(): HasMany
    {
        return $this->hasMany(School::class);
    }

    /**
     * Get the users associated with this district.
     *
     * @return HasMany
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'district_id');
    }

    // ===================================
    // Scopes
    // ===================================

    /**
     * Scope to get active districts.
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
     * Scope to get districts by state.
     *
     * @param Builder $query
     * @param string  $state
     *
     * @return Builder
     */
    public function scopeByState(Builder $query, string $state): Builder
    {
        return $query->where('state', $state);
    }

    /**
     * Scope to search districts by name or code.
     *
     * @param Builder $query
     * @param string  $search
     *
     * @return Builder
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('code', 'like', "%{$search}%")
              ->orWhere('city', 'like', "%{$search}%");
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
     * Get the total number of schools.
     *
     * @return int
     */
    public function getSchoolCountAttribute(): int
    {
        return $this->schools()->count();
    }

    /**
     * Get the number of active schools.
     *
     * @return int
     */
    public function getActiveSchoolCountAttribute(): int
    {
        return $this->schools()->where('is_active', true)->count();
    }

    /**
     * Get the total number of users in the district.
     *
     * @return int
     */
    public function getUserCountAttribute(): int
    {
        return $this->users()->count();
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
            return sprintf(
                '(%s) %s-%s',
                substr($phone, 0, 3),
                substr($phone, 3, 3),
                substr($phone, 6, 4)
            );
        }

        return $this->phone;
    }

    // ===================================
    // Helper Methods
    // ===================================

    /**
     * Check if the district can be deleted.
     *
     * @return bool
     */
    public function canBeDeleted(): bool
    {
        return $this->schools()->count() === 0 && $this->users()->count() === 0;
    }

    /**
     * Activate the district.
     *
     * @return bool
     */
    public function activate(): bool
    {
        $this->is_active = true;

        return $this->save();
    }

    /**
     * Deactivate the district.
     *
     * @return bool
     */
    public function deactivate(): bool
    {
        $this->is_active = false;

        return $this->save();
    }

    /**
     * Get district statistics.
     *
     * @return array
     */
    public function getStatistics(): array
    {
        return [
            'total_schools' => $this->school_count,
            'active_schools' => $this->active_school_count,
            'total_users' => $this->user_count,
            'programs_count' => $this->schools()->withCount('programs')->get()->sum('programs_count'),
        ];
    }
}
