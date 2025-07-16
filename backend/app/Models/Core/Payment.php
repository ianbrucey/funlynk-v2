<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use App\Models\User;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'payable_type',
        'payable_id',
        'stripe_payment_intent_id',
        'stripe_charge_id',
        'amount',
        'currency',
        'status',
        'payment_method',
        'description',
        'metadata',
        'fee_amount',
        'net_amount',
        'refunded_amount',
        'refunded_at',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'refunded_amount' => 'decimal:2',
        'metadata' => 'array',
        'refunded_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'succeeded');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    // Accessors
    public function getIsSuccessfulAttribute(): bool
    {
        return $this->status === 'succeeded';
    }

    public function getIsRefundableAttribute(): bool
    {
        return $this->is_successful && 
               $this->refunded_amount < $this->amount &&
               $this->created_at->diffInDays(now()) <= 90;
    }
}
