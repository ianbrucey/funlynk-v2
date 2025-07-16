<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Program Availability Model.
 *
 * Manages availability slots for Spark programs
 */
class ProgramAvailability extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'spark_program_availability_slots';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'program_id',
        'date',
        'start_time',
        'end_time',
        'max_capacity',
        'booked_capacity',
        'is_available',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'start_time' => 'time',
        'end_time' => 'time',
        'max_capacity' => 'integer',
        'booked_capacity' => 'integer',
        'is_available' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ===================================
    // Relationships
    // ===================================

    /**
     * Get the program this availability belongs to.
     *
     * @return BelongsTo
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    // ===================================
    // Scopes
    // ===================================

    /**
     * Scope to get available slots.
     *
     * @param Builder $query
     *
     * @return Builder
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('is_available', true)
                    ->where('booked_capacity', '<', 'max_capacity');
    }

    /**
     * Scope to get upcoming availability.
     *
     * @param Builder $query
     *
     * @return Builder
     */
    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('date', '>=', now()->toDateString());
    }

    /**
     * Scope to get future availability.
     *
     * @param Builder $query
     *
     * @return Builder
     */
    public function scopeFuture(Builder $query): Builder
    {
        return $query->where('date', '>=', today());
    }

    /**
     * Scope to filter by date range.
     *
     * @param Builder $query
     * @param string  $startDate
     * @param string  $endDate
     *
     * @return Builder
     */
    public function scopeByDateRange(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    // ===================================
    // Accessors
    // ===================================

    /**
     * Check if this slot is full.
     *
     * @return bool
     */
    public function getIsFullAttribute(): bool
    {
        return $this->booked_capacity >= $this->max_capacity;
    }

    /**
     * Get remaining slots.
     *
     * @return int
     */
    public function getRemainingAttribute(): int
    {
        return max(0, $this->max_capacity - $this->booked_capacity);
    }

    /**
     * Get formatted time range.
     *
     * @return string
     */
    public function getTimeRangeAttribute(): string
    {
        return $this->start_time->format('g:i A') . ' - ' . $this->end_time->format('g:i A');
    }

    // ===================================
    // Helper Methods
    // ===================================

    /**
     * Check if a booking can be made for this slot.
     *
     * @return bool
     */
    public function canBook(): bool
    {
        return $this->is_available &&
               !$this->is_full &&
               $this->date >= today();
    }

    /**
     * Increment booking count.
     *
     * @return bool
     */
    public function incrementBooking(): bool
    {
        if ($this->canBook()) {
            $this->booked_capacity++;

            return $this->save();
        }

        return false;
    }

    /**
     * Decrement booking count.
     *
     * @return bool
     */
    public function decrementBooking(): bool
    {
        if ($this->booked_capacity > 0) {
            $this->booked_capacity--;

            return $this->save();
        }

        return false;
    }
}
