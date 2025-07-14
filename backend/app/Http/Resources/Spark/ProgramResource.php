<?php

namespace App\Http\Resources\Spark;

use App\Http\Resources\BaseResource;
use Illuminate\Http\Request;

/**
 * Program Resource.
 *
 * Transform program data for API responses with privacy considerations
 */
class ProgramResource extends BaseResource
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
            'title' => $this->title,
            'description' => $this->description,
            'is_active' => $this->is_active,

            // Basic information
            'grade_levels' => $this->grade_levels,
            'formatted_grade_levels' => $this->formatted_grade_levels,
            'duration_minutes' => $this->duration_minutes,
            'formatted_duration' => $this->formatted_duration,
            'max_students' => $this->max_students,
            'price_per_student' => $this->price_per_student,
            'formatted_price' => $this->formatted_price,

            // Content
            'character_topics' => $this->character_topics,
            'formatted_character_topics' => $this->formatted_character_topics,
            'learning_objectives' => $this->learning_objectives,
            'materials_needed' => $this->materials_needed,
            'special_requirements' => $this->special_requirements,

            // Resource files - only expose if authenticated
            ...($this->whenAuthenticated([
                'resource_files' => $this->resource_files,
            ])),

            // Relationships - lazy loaded
            'character_topics_rel' => $this->whenLoadedCollection('characterTopics', CharacterTopicResource::class),
            'availability' => $this->whenLoadedCollection('availability', ProgramAvailabilityResource::class),

            // Statistics - only show basic stats to public
            'statistics' => [
                'booking_count' => $this->booking_count,
                'confirmed_booking_count' => $this->confirmed_booking_count,
                'available_slots_count' => $this->available_slots_count,

                // Admin-only statistics
                ...($this->whenCan('view-program-analytics', [
                    'total_participants' => $this->bookings()->sum('participant_count'),
                    'revenue' => $this->bookings()->where('status', 'confirmed')->sum('total_amount'),
                ])),
            ],

            // Timestamps
            ...$this->timestamps(),
            ...$this->softDeleteTimestamp(),
        ];
    }
}
