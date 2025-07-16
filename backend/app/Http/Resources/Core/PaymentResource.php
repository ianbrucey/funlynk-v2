<?php

namespace App\Http\Resources\Core;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
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
            'amount' => $this->amount,
            'currency' => $this->currency,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'description' => $this->description,
            'fee_amount' => $this->fee_amount,
            'net_amount' => $this->net_amount,
            'refunded_amount' => $this->refunded_amount,
            'is_refundable' => $this->is_refundable,
            'processed_at' => $this->processed_at,
            'refunded_at' => $this->refunded_at,
            'created_at' => $this->created_at,
            'payable' => $this->when($this->payable, function () {
                return [
                    'id' => $this->payable->id,
                    'type' => class_basename($this->payable_type),
                    'title' => $this->payable->title ?? 'N/A',
                ];
            }),
        ];
    }
}
