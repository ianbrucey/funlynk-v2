<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;
    use HasRoles;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'name',
        'email',
        'password',
        'phone',
        'country_code',
        'date_of_birth',
        'gender',
        'avatar',
        'bio',
        'timezone',
        'language',
        // 'is_active',        // Should not be mass-assignable for security
        // 'last_login_at',    // Should be set programmatically
    ];

    /**
     * The attributes that should be guarded from mass assignment.
     *
     * @var array<int, string>
     */
    protected $guarded = [
        'id',
        'email_verified_at',
        'remember_token',
        'is_active',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'date_of_birth' => 'date',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the user's core profile.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function coreProfile(): HasOne
    {
        return $this->hasOne(CoreProfile::class);
    }

    /**
     * Get the user's spark profile.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function sparkProfile(): HasOne
    {
        return $this->hasOne(SparkProfile::class);
    }

    /**
     * Scope a query to only include active users.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include users with verified emails.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeEmailVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    /**
     * Scope a query to only include users who have logged in recently.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int  $days
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRecentlyActive($query, $days = 30)
    {
        return $query->where('last_login_at', '>=', now()->subDays($days));
    }

    /**
     * Scope a query to filter users by timezone.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $timezone
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInTimezone($query, $timezone)
    {
        return $query->where('timezone', $timezone);
    }

    /**
     * Scope a query to filter users by language.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $language
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeLanguage($query, $language)
    {
        return $query->where('language', $language);
    }

    /**
     * Scope a query to filter users by gender.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $gender
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeGender($query, $gender)
    {
        return $query->where('gender', $gender);
    }

    /**
     * Scope a query to filter users by age range.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int  $minAge
     * @param  int  $maxAge
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeAgeRange($query, $minAge, $maxAge)
    {
        $maxDate = now()->subYears($minAge)->format('Y-m-d');
        $minDate = now()->subYears($maxAge + 1)->format('Y-m-d');

        return $query->whereBetween('date_of_birth', [$minDate, $maxDate]);
    }

    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute(): string
    {
        if ($this->first_name && $this->last_name) {
            return trim($this->first_name . ' ' . $this->last_name);
        }

        return $this->name ?? '';
    }

    /**
     * Get the user's initials.
     */
    public function getInitialsAttribute(): string
    {
        $names = explode(' ', $this->full_name);
        $initials = '';

        foreach ($names as $name) {
            if (!empty($name)) {
                $initials .= strtoupper($name[0]);
            }
        }

        return substr($initials, 0, 2);
    }

    /**
     * Get the user's age.
     */
    public function getAgeAttribute(): ?int
    {
        if (!$this->date_of_birth) {
            return null;
        }

        return $this->date_of_birth->diffInYears(now());
    }

    /**
     * Get the formatted phone number.
     */
    public function getFormattedPhoneAttribute(): ?string
    {
        if (!$this->phone) {
            return null;
        }

        $countryCode = $this->country_code ? '+' . $this->country_code . ' ' : '';
        return $countryCode . $this->phone;
    }

    /**
     * Get the avatar URL or default.
     */
    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return url('storage/' . $this->avatar);
        }

        // Default avatar using initials
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->full_name) . '&color=7F9CF5&background=EBF4FF';
    }

    /**
     * Check if the user has completed their profile.
     */
    public function getIsProfileCompleteAttribute(): bool
    {
        $requiredFields = ['first_name', 'last_name', 'email', 'phone'];

        foreach ($requiredFields as $field) {
            if (empty($this->$field)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get the user's timezone display name.
     */
    public function getTimezoneDisplayAttribute(): string
    {
        return str_replace('_', ' ', $this->timezone);
    }

    /**
     * Check if the user was recently active.
     */
    public function getIsRecentlyActiveAttribute(): bool
    {
        if (!$this->last_login_at) {
            return false;
        }

        return $this->last_login_at->diffInDays(now()) <= 7;
    }

    /**
     * Get the user's status (online/offline).
     */
    public function getStatusAttribute(): string
    {
        if (!$this->is_active) {
            return 'inactive';
        }

        if ($this->is_recently_active) {
            return 'online';
        }

        return 'offline';
    }

    // ===================================
    // Core Funlynk Relationships
    // ===================================

    /**
     * Get the user's interests.
     *
     * @return HasMany
     */
    public function interests(): HasMany
    {
        return $this->hasMany(\App\Models\Core\UserInterest::class);
    }

    /**
     * Get users that this user is following.
     *
     * @return BelongsToMany
     */
    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_follows', 'follower_id', 'following_id')
            ->withTimestamps();
    }

    /**
     * Get users that are following this user.
     *
     * @return BelongsToMany
     */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_follows', 'following_id', 'follower_id')
            ->withTimestamps();
    }

    /**
     * Check if this user is following another user.
     *
     * @param User $user
     * @return bool
     */
    public function isFollowing(User $user): bool
    {
        return $this->following()->where('following_id', $user->id)->exists();
    }

    /**
     * Check if this user is followed by another user.
     *
     * @param User $user
     * @return bool
     */
    public function isFollowedBy(User $user): bool
    {
        return $this->followers()->where('follower_id', $user->id)->exists();
    }

    /**
     * Follow another user.
     *
     * @param User $user
     * @return bool
     */
    public function follow(User $user): bool
    {
        if ($this->id === $user->id || $this->isFollowing($user)) {
            return false;
        }

        $this->following()->attach($user->id);
        return true;
    }

    /**
     * Unfollow another user.
     *
     * @param User $user
     * @return bool
     */
    public function unfollow(User $user): bool
    {
        if (!$this->isFollowing($user)) {
            return false;
        }

        $this->following()->detach($user->id);
        return true;
    }

    /**
     * Get the count of users this user is following.
     *
     * @return int
     */
    public function getFollowingCountAttribute(): int
    {
        return $this->following()->count();
    }

    /**
     * Get the count of users following this user.
     *
     * @return int
     */
    public function getFollowersCountAttribute(): int
    {
        return $this->followers()->count();
    }

    // ===================================
    // Event Relationships
    // ===================================

    /**
     * Get events hosted by this user.
     *
     * @return HasMany
     */
    public function hostedEvents(): HasMany
    {
        return $this->hasMany(\App\Models\Core\Event::class, 'host_id');
    }

    /**
     * Get events this user is attending.
     *
     * @return BelongsToMany
     */
    public function attendingEvents(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Core\Event::class, 'event_attendees')
            ->withPivot(['status', 'rsvp_response', 'notes', 'checked_in_at', 'checked_out_at'])
            ->withTimestamps();
    }

    /**
     * Get confirmed events this user is attending.
     *
     * @return BelongsToMany
     */
    public function confirmedEvents(): BelongsToMany
    {
        return $this->attendingEvents()->wherePivot('status', 'confirmed');
    }

    /**
     * Check if user is attending a specific event.
     *
     * @param \App\Models\Core\Event $event
     * @return bool
     */
    public function isAttending(\App\Models\Core\Event $event): bool
    {
        return $this->attendingEvents()->where('event_id', $event->id)->exists();
    }

    /**
     * Check if user is hosting a specific event.
     *
     * @param \App\Models\Core\Event $event
     * @return bool
     */
    public function isHosting(\App\Models\Core\Event $event): bool
    {
        return $this->hostedEvents()->where('id', $event->id)->exists();
    }

    // ===================================
    // Spark Relationships
    // ===================================

    /**
     * Get the district this user belongs to.
     *
     * @return BelongsTo
     */
    public function district(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Spark\District::class);
    }

    /**
     * Get the school this user belongs to.
     *
     * @return BelongsTo
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Spark\School::class);
    }

    /**
     * Get the schools this user administers.
     *
     * @return BelongsToMany
     */
    public function administeredSchools(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Spark\School::class, 'school_administrators')
            ->withPivot(['role', 'permissions'])
            ->withTimestamps();
    }

    /**
     * Get the programs this user teaches.
     *
     * @return BelongsToMany
     */
    public function teachingPrograms(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Spark\Program::class, 'program_teachers')
            ->withPivot(['role', 'is_lead_teacher'])
            ->withTimestamps();
    }

    /**
     * Check if user is a school administrator.
     *
     * @param \App\Models\Spark\School|null $school
     * @return bool
     */
    public function isSchoolAdministrator(?\App\Models\Spark\School $school = null): bool
    {
        if ($school) {
            return $this->administeredSchools()->where('school_id', $school->id)->exists();
        }

        return $this->administeredSchools()->exists();
    }

    /**
     * Check if user is a program teacher.
     *
     * @param \App\Models\Spark\Program|null $program
     * @return bool
     */
    public function isProgramTeacher(?\App\Models\Spark\Program $program = null): bool
    {
        if ($program) {
            return $this->teachingPrograms()->where('program_id', $program->id)->exists();
        }

        return $this->teachingPrograms()->exists();
    }
}
