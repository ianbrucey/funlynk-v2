<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class PermissionSlip extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'booking_id',
        'student_id',
        'template_id',
        'token',
        'parent_name',
        'parent_email',
        'parent_phone',
        'emergency_contacts',
        'medical_info',
        'special_instructions',
        'photo_permission',
        'is_signed',
        'signature_data',
        'signed_at',
        'signed_ip',
        'reminder_sent_count',
        'last_reminder_sent_at',
    ];

    protected $casts = [
        'emergency_contacts' => 'array',
        'medical_info' => 'array',
        'photo_permission' => 'boolean',
        'is_signed' => 'boolean',
        'signed_at' => 'datetime',
        'reminder_sent_count' => 'integer',
        'last_reminder_sent_at' => 'datetime',
    ];

    // Relationships
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(BookingStudent::class, 'student_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(PermissionSlipTemplate::class, 'template_id');
    }

    // Scopes
    public function scopeSigned($query)
    {
        return $query->where('is_signed', true);
    }

    public function scopeUnsigned($query)
    {
        return $query->where('is_signed', false);
    }

    public function scopeByBooking($query, int $bookingId)
    {
        return $query->where('booking_id', $bookingId);
    }

    public function scopeOverdue($query)
    {
        return $query->where('is_signed', false)
                    ->whereHas('booking', function ($q) {
                        $q->where('confirmed_date', '<=', now()->addDays(3));
                    });
    }

    // Accessors
    public function getSigningUrlAttribute(): string
    {
        return config('app.frontend_url') . '/permission-slip/' . $this->token;
    }

    public function getIsOverdueAttribute(): bool
    {
        if ($this->is_signed) {
            return false;
        }

        return $this->booking && 
               $this->booking->confirmed_date && 
               $this->booking->confirmed_date->diffInDays(now()) <= 3;
    }

    public function getCanSendReminderAttribute(): bool
    {
        if ($this->is_signed) {
            return false;
        }

        // Don't send more than 3 reminders
        if ($this->reminder_sent_count >= 3) {
            return false;
        }

        // Wait at least 24 hours between reminders
        if ($this->last_reminder_sent_at && 
            $this->last_reminder_sent_at->diffInHours(now()) < 24) {
            return false;
        }

        return true;
    }

    // Methods
    public static function generateToken(): string
    {
        return Str::random(32);
    }

    public function sign(array $signatureData, string $ipAddress): bool
    {
        if ($this->is_signed) {
            return false;
        }

        $this->update([
            'is_signed' => true,
            'signature_data' => json_encode($signatureData),
            'signed_at' => now(),
            'signed_ip' => $ipAddress,
        ]);

        return true;
    }

    public function incrementReminderCount(): void
    {
        $this->increment('reminder_sent_count');
        $this->update(['last_reminder_sent_at' => now()]);
    }
}
