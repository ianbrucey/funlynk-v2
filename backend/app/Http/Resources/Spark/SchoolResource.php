<?php

namespace App\Http\Resources\Spark;

use App\Http\Resources\BaseResource;
use Illuminate\Http\Request;

/**
 * School Resource.
 *
 * Transforms school data for Spark API responses
 */
class SchoolResource extends BaseResource
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
            'name' => $this->name,
            'code' => $this->code,
            'type' => $this->type,
            'type_display' => $this->type_display,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'zip_code' => $this->zip_code,
            'full_address' => $this->full_address,
            'phone' => $this->phone,
            'formatted_phone' => $this->formatted_phone,
            'email' => $this->email,
            'website' => $this->website,
            'is_active' => $this->is_active,

            // Principal information
            'principal' => [
                'name' => $this->principal_name,
                'email' => $this->principal_email,
                'phone' => $this->principal_phone,
            ],

            // Academic information
            'academic_info' => [
                'grade_levels' => $this->grade_levels,
                'formatted_grade_levels' => $this->formatted_grade_levels,
                'student_count' => $this->student_count,
            ],

            // District information
            'district' => $this->whenLoaded('district', function () {
                return [
                    'id' => $this->district->id,
                    'name' => $this->district->name,
                    'code' => $this->district->code,
                ];
            }),

            // Contact information
            'contact_info' => $this->when($this->contact_info, function () {
                return [
                    'assistant_principal_name' => $this->contact_info['assistant_principal_name'] ?? null,
                    'assistant_principal_email' => $this->contact_info['assistant_principal_email'] ?? null,
                    'secretary_name' => $this->contact_info['secretary_name'] ?? null,
                    'secretary_email' => $this->contact_info['secretary_email'] ?? null,
                    'secretary_phone' => $this->contact_info['secretary_phone'] ?? null,
                ];
            }),

            // Settings
            'settings' => $this->when($this->settings, function () {
                return [
                    'allow_field_trips' => $this->settings['allow_field_trips'] ?? true,
                    'allow_assemblies' => $this->settings['allow_assemblies'] ?? true,
                    'allow_after_school' => $this->settings['allow_after_school'] ?? true,
                    'booking_approval_required' => $this->settings['booking_approval_required'] ?? true,
                ];
            }),

            // Programs in this school
            'programs' => $this->whenLoaded('programs', function () {
                return ProgramResource::collection($this->programs);
            }),

            // Administrators
            'administrators' => $this->whenLoaded('administrators', function () {
                return $this->administrators->map(function ($admin) {
                    return [
                        'id' => $admin->id,
                        'first_name' => $admin->first_name,
                        'last_name' => $admin->last_name,
                        'full_name' => $admin->first_name . ' ' . $admin->last_name,
                        'email' => $admin->email,
                        'role' => $admin->pivot->role,
                        'permissions' => $admin->pivot->permissions,
                        'assigned_at' => $admin->pivot->created_at,
                    ];
                });
            }),

            // Statistics
            'statistics' => [
                'program_count' => $this->program_count,
                'active_program_count' => $this->active_program_count,
                'administrators_count' => $this->whenLoaded('administrators', function () {
                    return $this->administrators->count();
                }),
            ],

            // User permissions
            'permissions' => $this->when(
                auth()->check(),
                function () {
                    return [
                        'can_edit' => $this->canEdit(),
                        'can_delete' => $this->canBeDeleted(),
                        'can_manage_programs' => $this->canManagePrograms(),
                        'can_manage_administrators' => $this->canManageAdministrators(),
                        'is_administrator' => $this->isAdministrator(auth()->user()),
                    ];
                }
            ),

            // Timestamps
            ...$this->timestamps(),
        ];
    }

    /**
     * Check if user can edit this school.
     *
     * @return bool
     */
    private function canEdit(): bool
    {
        if (!auth()->check()) {
            return false;
        }

        $user = auth()->user();

        return $user->hasRole(['admin', 'spark_admin', 'district_admin']) ||
               $this->isAdministrator($user);
    }

    /**
     * Check if user can manage programs in this school.
     *
     * @return bool
     */
    private function canManagePrograms(): bool
    {
        if (!auth()->check()) {
            return false;
        }

        $user = auth()->user();

        return $user->hasRole(['admin', 'spark_admin', 'district_admin']) ||
               $this->isAdministrator($user);
    }

    /**
     * Check if user can manage administrators for this school.
     *
     * @return bool
     */
    private function canManageAdministrators(): bool
    {
        if (!auth()->check()) {
            return false;
        }

        return auth()->user()->hasRole(['admin', 'spark_admin', 'district_admin']);
    }
}
