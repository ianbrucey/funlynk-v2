<?php

namespace App\Http\Resources\Core;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StripeAccountResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'account_type' => $this->account_type,
            'country' => $this->country,
            'currency' => $this->currency,
            'business_type' => $this->business_type,
            'charges_enabled' => $this->charges_enabled,
            'payouts_enabled' => $this->payouts_enabled,
            'details_submitted' => $this->details_submitted,
            'is_active' => $this->is_active,
            'requires_action' => $this->requires_action,
            'requirements' => $this->requirements,
            'capabilities' => $this->capabilities,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
