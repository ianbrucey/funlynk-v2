<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use App\Models\User;

/**
 * Event Attendee Model
 * 
 * Manages event attendance and RSVP functionality
 */
class EventAttendee extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'event_id',
        'user_id',
        'status',
        'rsvp_response',
        'notes',
        'checked_in_at',
        'checked_out_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'checked_in_at' => 'datetime',
        'checked_out_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ===================================
    // Relationships
    // ===================================

    /**
     * Get the event this attendee belongs to.
     *
     * @return BelongsTo
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the user who is attending.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ===================================
    // Scopes
    // ===================================

    /**
     * Scope to get confirmed attendees.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeConfirmed(Builder $query): Builder
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope to get pending attendees.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get declined attendees.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeDeclined(Builder $query): Builder
    {
        return $query->where('status', 'declined');
    }

    /**
     * Scope to get checked-in attendees.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeCheckedIn(Builder $query): Builder
    {
        return $query->whereNotNull('checked_in_at');
    }

    /**
     * Scope to get attendees for a specific event.
     *
     * @param Builder $query
     * @param int $eventId
     * @return Builder
     */
    public function scopeForEvent(Builder $query, int $eventId): Builder
    {
        return $query->where('event_id', $eventId);
    }

    /**
     * Scope to get attendees for a specific user.
     *
     * @param Builder $query
     * @param int $userId
     * @return Builder
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    // ===================================
    // Accessors
    // ===================================

    /**
     * Get the status display name.
     *
     * @return string
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            'confirmed' => 'Confirmed',
            'pending' => 'Pending',
            'declined' => 'Declined',
            'cancelled' => 'Cancelled',
            default => 'Unknown'
        };
    }

    /**
     * Get the RSVP response display name.
     *
     * @return string
     */
    public function getRsvpResponseDisplayAttribute(): string
    {
        return match($this->rsvp_response) {
            'yes' => 'Yes',
            'no' => 'No',
            'maybe' => 'Maybe',
            default => 'No Response'
        };
    }

    /**
     * Check if the attendee is checked in.
     *
     * @return bool
     */
    public function getIsCheckedInAttribute(): bool
    {
        return $this->checked_in_at !== null;
    }

    /**
     * Check if the attendee is checked out.
     *
     * @return bool
     */
    public function getIsCheckedOutAttribute(): bool
    {
        return $this->checked_out_at !== null;
    }

    // ===================================
    // Helper Methods
    // ===================================

    /**
     * Check in the attendee.
     *
     * @return bool
     */
    public function checkIn(): bool
    {
        if ($this->is_checked_in) {
            return false;
        }

        $this->checked_in_at = now();
        return $this->save();
    }

    /**
     * Check out the attendee.
     *
     * @return bool
     */
    public function checkOut(): bool
    {
        if (!$this->is_checked_in || $this->is_checked_out) {
            return false;
        }

        $this->checked_out_at = now();
        return $this->save();
    }

    /**
     * Confirm the attendance.
     *
     * @return bool
     */
    public function confirm(): bool
    {
        $this->status = 'confirmed';
        $this->rsvp_response = 'yes';
        return $this->save();
    }

    /**
     * Decline the attendance.
     *
     * @return bool
     */
    public function decline(): bool
    {
        $this->status = 'declined';
        $this->rsvp_response = 'no';
        return $this->save();
    }

    /**
     * Cancel the attendance.
     *
     * @return bool
     */
    public function cancel(): bool
    {
        $this->status = 'cancelled';
        return $this->save();
    }
}
