<?php

namespace App\Http\Resources\Spark;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionSlipResource extends JsonResource
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
            'booking_id' => $this->booking_id,
            'student_id' => $this->student_id,
            'template_id' => $this->template_id,
            'token' => $this->when(
                $request->routeIs('api.public.*') || auth()->check(),
                $this->token
            ),
            'parent_name' => $this->parent_name,
            'parent_email' => $this->parent_email,
            'parent_phone' => $this->parent_phone,
            'emergency_contacts' => $this->emergency_contacts,
            'medical_info' => $this->medical_info,
            'special_instructions' => $this->special_instructions,
            'photo_permission' => $this->photo_permission,
            'is_signed' => $this->is_signed,
            'signature_data' => $this->when(
                $this->is_signed && (auth()->check() || $request->routeIs('api.public.*')),
                $this->signature_data ? json_decode($this->signature_data, true) : null
            ),
            'signed_at' => $this->signed_at?->toISOString(),
            'signed_ip' => $this->when(
                auth()->check() && auth()->user()->can('viewSensitiveData', $this->resource),
                $this->signed_ip
            ),
            'reminder_sent_count' => $this->reminder_sent_count,
            'last_reminder_sent_at' => $this->last_reminder_sent_at?->toISOString(),
            'is_overdue' => $this->is_overdue,
            'can_send_reminder' => $this->can_send_reminder,
            'signing_url' => $this->when(
                !$this->is_signed,
                $this->signing_url
            ),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Relationships
            'booking' => $this->whenLoaded('booking', function () {
                return [
                    'id' => $this->booking->id,
                    'booking_reference' => $this->booking->booking_reference,
                    'confirmed_date' => $this->booking->confirmed_date?->toDateString(),
                    'confirmed_time' => $this->booking->confirmed_time?->format('H:i'),
                    'status' => $this->booking->status,
                    'school_name' => $this->booking->school->name ?? null,
                    'program_title' => $this->booking->program->title ?? null,
                ];
            }),
            
            'student' => $this->whenLoaded('student', function () {
                return [
                    'id' => $this->student->id,
                    'first_name' => $this->student->first_name,
                    'last_name' => $this->student->last_name,
                    'full_name' => $this->student->full_name,
                    'grade_level' => $this->student->grade_level,
                    'student_id_number' => $this->student->student_id_number,
                ];
            }),
            
            'template' => $this->whenLoaded('template', function () {
                return [
                    'id' => $this->template->id,
                    'name' => $this->template->name,
                    'title' => $this->template->title,
                    'is_default' => $this->template->is_default,
                ];
            }),
        ];
    }
}
