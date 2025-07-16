<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class StripeAccount extends Model
{
    protected $fillable = [
        'user_id',
        'stripe_account_id',
        'account_type',
        'country',
        'currency',
        'business_type',
        'charges_enabled',
        'payouts_enabled',
        'details_submitted',
        'requirements',
        'capabilities',
        'metadata',
    ];

    protected $casts = [
        'charges_enabled' => 'boolean',
        'payouts_enabled' => 'boolean',
        'details_submitted' => 'boolean',
        'requirements' => 'array',
        'capabilities' => 'array',
        'metadata' => 'array',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Accessors
    public function getIsActiveAttribute(): bool
    {
        return $this->charges_enabled && $this->payouts_enabled;
    }

    public function getRequiresActionAttribute(): bool
    {
        return !empty($this->requirements['currently_due']) || 
               !empty($this->requirements['eventually_due']);
    }
}
