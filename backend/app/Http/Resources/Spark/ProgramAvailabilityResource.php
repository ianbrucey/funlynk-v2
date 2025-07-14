<?php

namespace App\Http\Resources\Spark;

use App\Http\Resources\BaseResource;
use Illuminate\Http\Request;

/**
 * Program Availability Resource.
 *
 * Transform program availability data for API responses with privacy considerations
 */
class ProgramAvailabilityResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => $this->date,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'time_range' => $this->time_range,
            'max_bookings' => $this->max_bookings,
            'current_bookings' => $this->current_bookings,
            'remaining' => $this->remaining,
            'is_available' => $this->is_available,
            'is_full' => $this->is_full,
            'can_book' => $this->canBook(),

            // Admin-only fields
            ...($this->whenCan('view-program-analytics', [
                'notes' => $this->notes,
            ])),

            // Relationships - lazy loaded
            'program' => $this->whenLoadedResource('program', ProgramResource::class),

            // Timestamps
            ...$this->timestamps(),
        ];
    }
}
