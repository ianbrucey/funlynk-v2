<?php

namespace App\Http\Resources\Spark;

use App\Http\Resources\BaseResource;
use Illuminate\Http\Request;

class SparkProgramResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'grade_levels' => $this->grade_levels,
            'grade_levels_display' => $this->grade_levels_display,
            'duration_minutes' => $this->duration_minutes,
            'duration_display' => $this->duration_display,
            'max_students' => $this->max_students,
            'price_per_student' => $this->price_per_student,
            'character_topics' => $this->character_topics,
            'character_topics_display' => $this->character_topics_display,
            'learning_objectives' => $this->learning_objectives,
            'materials_needed' => $this->materials_needed,
            'resource_files' => $this->resource_files,
            'special_requirements' => $this->special_requirements,
            'is_active' => $this->is_active,
            'total_bookings' => $this->total_bookings,
            'completed_bookings' => $this->completed_bookings,
            'average_rating' => $this->average_rating,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),

            'bookings' => $this->when($this->relationLoaded('bookings'),
                $this->bookings->map(function ($booking) {
                    return [
                        'id' => $booking->id,
                        'school_name' => $booking->school->name,
                        'confirmed_date' => $booking->confirmed_date?->format('Y-m-d'),
                        'status' => $booking->status,
                        'student_count' => $booking->student_count,
                    ];
                })
            ),

            'availability' => $this->when($this->relationLoaded('availability'),
                $this->availability->map(function ($slot) {
                    return [
                        'id' => $slot->id,
                        'date' => $slot->date->format('Y-m-d'),
                        'start_time' => $slot->start_time->format('H:i'),
                        'end_time' => $slot->end_time->format('H:i'),
                        'available_slots' => $slot->available_slots,
                        'is_full' => $slot->is_full,
                    ];
                })
            ),
        ];
    }
}
