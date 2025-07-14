<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingStudent extends Model
{
    protected $fillable = [
        'booking_id',
        'student_id',
        'first_name',
        'last_name',
        'grade_level',
        'student_id_number',
        'emergency_contact',
        'medical_info',
        'dietary_restrictions',
        'special_needs',
        'parent_name',
        'parent_email',
        'parent_phone',
        'is_attending',
        'checked_in_at',
    ];

    protected $casts = [
        'emergency_contact' => 'array',
        'medical_info' => 'array',
        'dietary_restrictions' => 'array',
        'special_needs' => 'array',
        'is_attending' => 'boolean',
        'checked_in_at' => 'datetime',
    ];

    // Relationships
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    // Accessors
    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getIsCheckedInAttribute(): bool
    {
        return !is_null($this->checked_in_at);
    }

    // Methods
    public function checkIn(): bool
    {
        if (!$this->is_attending || $this->is_checked_in) {
            return false;
        }

        $this->update(['checked_in_at' => now()]);
        return true;
    }
}
