<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Payout extends Model
{
    protected $fillable = [
        'user_id',
        'stripe_payout_id',
        'amount',
        'currency',
        'status',
        'arrival_date',
        'description',
        'failure_code',
        'failure_message',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'arrival_date' => 'datetime',
        'metadata' => 'array',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }
}
