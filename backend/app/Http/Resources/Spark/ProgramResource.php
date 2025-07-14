<?php

namespace App\Http\Resources\Spark;

use App\Http\Resources\BaseResource;
use Illuminate\Http\Request;

/**
 * Program Resource
 * 
 * Placeholder for Spark program data transformation (will be fully implemented in Task 002)
 */
class ProgramResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'type' => $this->type,
            'type_display' => $this->type_display,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,

            // Basic information
            'grade_levels' => $this->grade_levels,
            'formatted_grade_levels' => $this->formatted_grade_levels,
            'subject_areas' => $this->subject_areas,
            'formatted_subject_areas' => $this->formatted_subject_areas,
            'duration_weeks' => $this->duration_weeks,
            'max_participants' => $this->max_participants,
            'cost_per_student' => $this->cost_per_student,
            'formatted_cost' => $this->formatted_cost,

            // School information
            'school' => $this->whenLoaded('school', function () {
                return [
                    'id' => $this->school->id,
                    'name' => $this->school->name,
                    'code' => $this->school->code,
                ];
            }),

            // Statistics
            'statistics' => [
                'booking_count' => $this->booking_count,
                'confirmed_booking_count' => $this->confirmed_booking_count,
            ],

            // Timestamps
            ...$this->timestamps(),
        ];
    }
}
