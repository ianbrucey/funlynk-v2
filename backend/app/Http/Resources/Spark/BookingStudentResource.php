<?php

namespace App\Http\Resources\Spark;

use App\Http\Resources\BaseResource;
use Illuminate\Http\Request;

/**
 * Booking Student Resource
 * 
 * Transform BookingStudent model data for API responses
 */
class BookingStudentResource extends BaseResource
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
            'booking_id' => $this->booking_id,
            'student_id' => $this->student_id,
            
            // Student information
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'grade_level' => $this->grade_level,
            'student_id_number' => $this->student_id_number,
            
            // Contact information
            'parent_name' => $this->parent_name,
            'parent_email' => $this->parent_email,
            'parent_phone' => $this->parent_phone,
            
            // Emergency and medical information
            'emergency_contact' => $this->emergency_contact,
            'medical_info' => $this->medical_info,
            'dietary_restrictions' => $this->dietary_restrictions,
            'special_needs' => $this->special_needs,
            
            // Attendance information
            'is_attending' => $this->is_attending,
            'is_checked_in' => $this->is_checked_in,
            'checked_in_at' => $this->checked_in_at?->toISOString(),
            
            // Timestamps
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Include booking information when loaded
            'booking' => $this->when($this->relationLoaded('booking'), function () {
                return [
                    'id' => $this->booking->id,
                    'booking_reference' => $this->booking->booking_reference,
                    'status' => $this->booking->status,
                    'confirmed_date' => $this->booking->confirmed_date?->format('Y-m-d'),
                    'confirmed_time' => $this->booking->confirmed_time?->format('H:i'),
                ];
            }),
            
            // Include student information when loaded
            'student' => $this->when($this->relationLoaded('student'), function () {
                return [
                    'id' => $this->student->id,
                    'student_number' => $this->student->student_number,
                    'email' => $this->student->email,
                ];
            }),
        ];
    }
}
