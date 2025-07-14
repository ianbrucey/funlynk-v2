<?php

namespace App\Models\Spark;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'school_id',
        'program_id',
        'teacher_id',
        'booking_reference',
        'preferred_date',
        'preferred_time',
        'confirmed_date',
        'confirmed_time',
        'student_count',
        'total_cost',
        'status',
        'special_requests',
        'contact_info',
        'confirmed_at',
        'payment_status',
        'payment_due_date',
        'notes',
        'rating',
        'feedback',
    ];

    protected $casts = [
        'preferred_date' => 'date',
        'preferred_time' => 'datetime',
        'confirmed_date' => 'date',
        'confirmed_time' => 'datetime',
        'student_count' => 'integer',
        'total_cost' => 'decimal:2',
        'contact_info' => 'array',
        'confirmed_at' => 'datetime',
        'payment_due_date' => 'date',
        'rating' => 'integer',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'program_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(BookingStudent::class);
    }

    public function permissionSlips(): HasMany
    {
        return $this->hasMany(PermissionSlip::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('confirmed_date', '>=', now()->toDateString())
                    ->whereIn('status', ['confirmed', 'pending']);
    }

    public function scopeBySchool($query, int $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeByTeacher($query, int $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    public function scopeByDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('confirmed_date', [$startDate, $endDate]);
    }

    // Accessors
    public function getIsConfirmedAttribute(): bool
    {
        return $this->status === 'confirmed';
    }

    public function getIsPendingAttribute(): bool
    {
        return $this->status === 'pending';
    }

    public function getIsCancelledAttribute(): bool
    {
        return $this->status === 'cancelled';
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }

    public function getCanBeCancelledAttribute(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']) &&
               $this->confirmed_date &&
               $this->confirmed_date->diffInDays(now()) >= 1;
    }

    public function getPermissionSlipsSignedCountAttribute(): int
    {
        return $this->permissionSlips()->where('is_signed', true)->count();
    }

    public function getPermissionSlipsRequiredCountAttribute(): int
    {
        return $this->students()->count();
    }

    public function getAllPermissionSlipsSignedAttribute(): bool
    {
        return $this->permission_slips_signed_count === $this->permission_slips_required_count;
    }

    // Methods
    public function generateReference(): string
    {
        return 'SPK-' . strtoupper(substr($this->school->code, 0, 3)) . '-' .
               date('Ymd') . '-' . str_pad($this->id, 4, '0', STR_PAD_LEFT);
    }

    public function calculateTotalCost(): float
    {
        return $this->student_count * $this->program->price_per_student;
    }

    public function confirm(string $date, string $time): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }

        $this->update([
            'status' => 'confirmed',
            'confirmed_date' => $date,
            'confirmed_time' => $date . ' ' . $time,
            'confirmed_at' => now(),
            'payment_due_date' => now()->addDays(7)->toDateString(),
        ]);

        return true;
    }

    public function cancel(string $reason = null): bool
    {
        if (!$this->can_be_cancelled) {
            return false;
        }

        $this->update([
            'status' => 'cancelled',
            'notes' => ($this->notes ? $this->notes . "\n" : '') .
                      'Cancelled: ' . ($reason ?: 'No reason provided'),
        ]);

        return true;
    }

    public function complete(int $rating = null, string $feedback = null): bool
    {
        if ($this->status !== 'confirmed' || $this->confirmed_date > now()) {
            return false;
        }

        $this->update([
            'status' => 'completed',
            'rating' => $rating,
            'feedback' => $feedback,
        ]);

        return true;
    }
}
