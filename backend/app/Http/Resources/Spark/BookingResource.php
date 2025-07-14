<?php

namespace App\Http\Resources\Spark;

use App\Http\Resources\BaseResource;
use Illuminate\Http\Request;

/**
 * Booking Resource.
 *
 * Transform booking data for API responses
 */
class BookingResource extends BaseResource
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
            'booking_reference' => $this->booking_reference,
            'status' => $this->status,
            'student_count' => $this->student_count,
            'total_cost' => $this->total_cost,

            // Dates and times
            'preferred_date' => $this->preferred_date?->format('Y-m-d'),
            'preferred_time' => $this->preferred_time?->format('H:i'),
            'confirmed_date' => $this->confirmed_date?->format('Y-m-d'),
            'confirmed_time' => $this->confirmed_time?->format('H:i'),
            'confirmed_at' => $this->confirmed_at?->toISOString(),

            // Additional information
            'special_requests' => $this->special_requests,
            'contact_info' => $this->contact_info,
            'payment_status' => $this->payment_status,
            'payment_due_date' => $this->payment_due_date?->format('Y-m-d'),
            'notes' => $this->notes,
            'rating' => $this->rating,
            'feedback' => $this->feedback,

            // Status flags
            'is_pending' => $this->is_pending,
            'is_confirmed' => $this->is_confirmed,
            'is_cancelled' => $this->is_cancelled,
            'is_completed' => $this->is_completed,
            'can_be_cancelled' => $this->can_be_cancelled,

            // Permission slips
            'permission_slips_signed_count' => $this->permission_slips_signed_count,
            'permission_slips_required_count' => $this->permission_slips_required_count,
            'all_permission_slips_signed' => $this->all_permission_slips_signed,

            // Relationships
            'school' => $this->whenLoaded('school', function () {
                return [
                    'id' => $this->school->id,
                    'name' => $this->school->name,
                    'code' => $this->school->code,
                    'address' => $this->school->address,
                    'phone' => $this->school->phone,
                ];
            }),

            'program' => $this->whenLoaded('program', function () {
                return [
                    'id' => $this->program->id,
                    'title' => $this->program->title,
                    'description' => $this->program->description,
                    'duration_minutes' => $this->program->duration_minutes,
                    'formatted_duration' => $this->program->formatted_duration,
                    'max_students' => $this->program->max_students,
                    'price_per_student' => $this->program->price_per_student,
                    'formatted_price' => $this->program->formatted_price,
                    'character_topics' => $this->program->character_topics,
                    'grade_levels' => $this->program->grade_levels,
                ];
            }),

            'teacher' => $this->whenLoaded('teacher', function () {
                return [
                    'id' => $this->teacher->id,
                    'first_name' => $this->teacher->first_name,
                    'last_name' => $this->teacher->last_name,
                    'full_name' => $this->teacher->full_name,
                    'email' => $this->teacher->email,
                ];
            }),

            'students' => $this->whenLoaded('students', function () {
                return $this->students->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'first_name' => $student->first_name,
                        'last_name' => $student->last_name,
                        'full_name' => $student->full_name,
                        'grade_level' => $student->grade_level,
                        'student_id_number' => $student->student_id_number,
                        'parent_name' => $student->parent_name,
                        'parent_email' => $student->parent_email,
                        'parent_phone' => $student->parent_phone,
                        'is_attending' => $student->is_attending,
                        'is_checked_in' => $student->is_checked_in,
                        'checked_in_at' => $student->checked_in_at?->toISOString(),
                    ];
                });
            }),

            'permission_slips' => $this->whenLoaded('permissionSlips', function () {
                return $this->permissionSlips->map(function ($slip) {
                    return [
                        'id' => $slip->id,
                        'student_name' => $slip->student_name,
                        'is_signed' => $slip->is_signed,
                        'signed_at' => $slip->signed_at?->toISOString(),
                        'signed_by' => $slip->signed_by,
                    ];
                });
            }),

            // Timestamps
            ...$this->timestamps(),
            ...$this->softDeleteTimestamp(),
        ];
    }
}
