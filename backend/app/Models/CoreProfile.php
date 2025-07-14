<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CoreProfile extends Model
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
        'occupation',
        'company',
        'location',
        'website',
        'linkedin_url',
        'twitter_url',
        'instagram_url',
        'facebook_url',
        'interests',
        'skills',
        'experience_level',
        'education',
        'certifications',
        'languages_spoken',
        'availability_status',
        'preferred_contact_method',
        'visibility_settings',
        // 'profile_completion_score',   // Should be calculated, not mass-assigned
        // 'is_verified',               // Should be set by admin/verification process
        'verification_documents',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
    ];

    /**
     * The attributes that should be guarded from mass assignment.
     *
     * @var array<int, string>
     */
    protected $guarded = [
        'id',
        'profile_completion_score',
        'is_verified',
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
        'interests' => 'array',
        'skills' => 'array',
        'languages_spoken' => 'array',
        'visibility_settings' => 'array',
        'verification_documents' => 'array',
        'is_verified' => 'boolean',
        'profile_completion_score' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the user that owns the core profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include verified profiles.
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Scope a query to only include profiles with high completion scores.
     */
    public function scopeHighCompletion($query, $threshold = 80)
    {
        return $query->where('profile_completion_score', '>=', $threshold);
    }

    /**
     * Get the full name accessor.
     */
    public function getFullNameAttribute(): string
    {
        return $this->user->first_name . ' ' . $this->user->last_name;
    }

    /**
     * Get the profile completion percentage.
     */
    public function getCompletionPercentageAttribute(): string
    {
        return $this->profile_completion_score . '%';
    }

    /**
     * Check if the profile is complete.
     */
    public function getIsCompleteAttribute(): bool
    {
        return $this->profile_completion_score >= 100;
    }
}
