<?php

namespace App\Models\{MODULE};

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

/**
 * {MODEL} Model
 * 
 * Represents a {modelVariable} in the {MODULE} module.
 * 
 * @property int $id
 * @property string $name
 * @property string $description
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property Carbon|null $deleted_at
 * 
 * @package App\Models\{MODULE}
 */
class {MODEL} extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     */
    protected $table = '{table_name}';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'description',
        // Add your fillable attributes here
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        // Add sensitive attributes here (e.g., 'password', 'api_key')
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        // Add custom casts here
        // 'is_active' => 'boolean',
        // 'metadata' => 'array',
        // 'price' => 'decimal:2',
        // 'start_date' => 'date',
        // 'start_time' => 'datetime',
    ];

    /**
     * The attributes that should be mutated to dates.
     */
    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
        // Add date attributes here
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = [
        // Add computed attributes here
        // 'full_name',
        // 'is_expired',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Global scopes
        static::addGlobalScope('active', function (Builder $builder) {
            // Uncomment to add global scope
            // $builder->where('is_active', true);
        });

        // Model events
        static::creating(function ($model) {
            // Set default values or perform actions before creating
            // $model->created_by = auth()->id();
        });

        static::updating(function ($model) {
            // Perform actions before updating
            // $model->updated_by = auth()->id();
        });

        static::deleting(function ($model) {
            // Perform actions before deleting
            // Log the deletion or clean up related data
        });
    }

    // ========================================
    // RELATIONSHIPS
    // ========================================

    /**
     * Get the user that owns this {modelVariable}.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    /**
     * Get the creator of this {modelVariable}.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Get related items for this {modelVariable}.
     */
    public function relatedItems(): HasMany
    {
        return $this->hasMany(RelatedModel::class);
    }

    /**
     * Get the many-to-many relationship.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, '{pivot_table_name}')
                    ->withTimestamps()
                    ->withPivot(['additional_column']);
    }

    // ========================================
    // ACCESSORS & MUTATORS
    // ========================================

    /**
     * Get the full name attribute.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Get the is expired attribute.
     */
    public function getIsExpiredAttribute(): bool
    {
        return $this->end_date && $this->end_date->isPast();
    }

    /**
     * Set the name attribute.
     */
    public function setNameAttribute(string $value): void
    {
        $this->attributes['name'] = ucfirst(strtolower($value));
    }

    /**
     * Set the email attribute.
     */
    public function setEmailAttribute(string $value): void
    {
        $this->attributes['email'] = strtolower($value);
    }

    // ========================================
    // QUERY SCOPES
    // ========================================

    /**
     * Scope a query to only include active records.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include records created today.
     */
    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('created_at', today());
    }

    /**
     * Scope a query to search by name or description.
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange(Builder $query, Carbon $startDate, Carbon $endDate): Builder
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope a query to order by most recent.
     */
    public function scopeRecent(Builder $query): Builder
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Scope a query to include only records belonging to the authenticated user.
     */
    public function scopeForUser(Builder $query, int $userId = null): Builder
    {
        $userId = $userId ?? auth()->id();
        return $query->where('user_id', $userId);
    }

    // ========================================
    // CUSTOM METHODS
    // ========================================

    /**
     * Check if the {modelVariable} is owned by the given user.
     */
    public function isOwnedBy(int $userId): bool
    {
        return $this->user_id === $userId;
    }

    /**
     * Check if the {modelVariable} can be edited.
     */
    public function canBeEdited(): bool
    {
        // Add your business logic here
        return !$this->is_locked && $this->created_at->diffInHours() < 24;
    }

    /**
     * Get the URL for this {modelVariable}.
     */
    public function getUrl(): string
    {
        return route('{module}.{modelVariable}s.show', $this);
    }

    /**
     * Get a summary of this {modelVariable}.
     */
    public function getSummary(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'created_at' => $this->created_at->toDateString(),
            'is_active' => $this->is_active ?? true,
        ];
    }

    /**
     * Duplicate this {modelVariable}.
     */
    public function duplicate(array $overrides = []): self
    {
        $attributes = $this->toArray();
        
        // Remove unique attributes
        unset($attributes['id'], $attributes['created_at'], $attributes['updated_at']);
        
        // Apply overrides
        $attributes = array_merge($attributes, $overrides);
        
        return static::create($attributes);
    }

    // ========================================
    // VALIDATION RULES
    // ========================================

    /**
     * Get validation rules for creating a new {modelVariable}.
     */
    public static function getCreateRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            // Add your validation rules here
        ];
    }

    /**
     * Get validation rules for updating a {modelVariable}.
     */
    public static function getUpdateRules(int $id = null): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            // Add your validation rules here
        ];
    }

    // ========================================
    // SEARCH & FILTERING
    // ========================================

    /**
     * Apply filters to the query.
     */
    public static function applyFilters(Builder $query, array $filters): Builder
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        return $query;
    }

    /**
     * Get sorted query.
     */
    public static function getSorted(Builder $query, string $sortBy = 'created_at', string $sortOrder = 'desc'): Builder
    {
        $allowedSortFields = ['id', 'name', 'created_at', 'updated_at'];
        
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }

        if (!in_array(strtolower($sortOrder), ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        return $query->orderBy($sortBy, $sortOrder);
    }
}

/*
USAGE INSTRUCTIONS:

1. Replace placeholders:
   - {MODULE}: Core, Spark, or Shared
   - {MODEL}: Model name (e.g., Event, User, Program)
   - {modelVariable}: camelCase model name (e.g., event, user, program)
   - {table_name}: Database table name
   - {pivot_table_name}: Pivot table name for many-to-many relationships
   - {module}: lowercase module name for routes

2. Update the $fillable array with your actual model attributes

3. Add appropriate casts for your data types

4. Customize relationships based on your database schema

5. Add model-specific accessors, mutators, and scopes

6. Update validation rules to match your requirements

7. Remove unused methods and add custom business logic methods

EXAMPLE USAGE:
- Event model in Core module
- Program model in Spark module
- User model in Shared module

COMMON CUSTOMIZATIONS:
- Add status enums and scopes
- Add file upload handling
- Add location-based queries
- Add user permission checks
- Add audit trail functionality
*/
