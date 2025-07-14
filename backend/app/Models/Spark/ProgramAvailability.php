<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

/**
 * Program Availability Model
 * 
 * Manages availability slots for Spark programs
 */
class ProgramAvailability extends Model
{
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
        'max_bookings',
        'current_bookings',
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
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'max_bookings' => 'integer',
        'current_bookings' => 'integer',
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
     * @return Builder
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('is_available', true)
                    ->where('current_bookings', '<', 'max_bookings');
    }

    /**
     * Scope to get future availability.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeFuture(Builder $query): Builder
    {
        return $query->where('date', '>=', today());
    }

    /**
     * Scope to get availability for a specific date range.
     *
     * @param Builder $query
     * @param string $startDate
     * @param string $endDate
     * @return Builder
     */
    public function scopeDateRange(Builder $query, string $startDate, string $endDate): Builder
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
        return $this->current_bookings >= $this->max_bookings;
    }

    /**
     * Get remaining slots.
     *
     * @return int
     */
    public function getRemainingAttribute(): int
    {
        return max(0, $this->max_bookings - $this->current_bookings);
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
            $this->current_bookings++;
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
        if ($this->current_bookings > 0) {
            $this->current_bookings--;
            return $this->save();
        }
        return false;
    }
}
