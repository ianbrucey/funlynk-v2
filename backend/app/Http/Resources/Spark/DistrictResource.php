<?php

namespace App\Http\Resources\Spark;

use App\Http\Resources\BaseResource;
use Illuminate\Http\Request;

/**
 * District Resource.
 *
 * Transforms district data for Spark API responses
 */
class DistrictResource extends BaseResource
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

            // Contact information
            'contact_info' => $this->when($this->contact_info, function () {
                return [
                    'superintendent_name' => $this->contact_info['superintendent_name'] ?? null,
                    'superintendent_email' => $this->contact_info['superintendent_email'] ?? null,
                    'superintendent_phone' => $this->contact_info['superintendent_phone'] ?? null,
                    'main_contact_name' => $this->contact_info['main_contact_name'] ?? null,
                    'main_contact_email' => $this->contact_info['main_contact_email'] ?? null,
                    'main_contact_phone' => $this->contact_info['main_contact_phone'] ?? null,
                ];
            }),

            // Schools in this district
            'schools' => $this->whenLoaded('schools', function () {
                return SchoolResource::collection($this->schools);
            }),

            // Statistics
            'statistics' => [
                'school_count' => $this->school_count,
                'active_school_count' => $this->active_school_count,
                'user_count' => $this->user_count,
            ],

            // User permissions
            'permissions' => $this->when(
                auth()->check(),
                function () {
                    return [
                        'can_edit' => $this->canEdit(),
                        'can_delete' => $this->canBeDeleted(),
                        'can_manage_schools' => $this->canManageSchools(),
                        'can_view_users' => $this->canViewUsers(),
                    ];
                }
            ),

            // Timestamps
            ...$this->timestamps(),
        ];
    }

    /**
     * Check if user can edit this district.
     *
     * @return bool
     */
    private function canEdit(): bool
    {
        if (!auth()->check()) {
            return false;
        }

        return auth()->user()->hasRole(['admin', 'spark_admin']);
    }

    /**
     * Check if user can manage schools in this district.
     *
     * @return bool
     */
    private function canManageSchools(): bool
    {
        if (!auth()->check()) {
            return false;
        }

        return auth()->user()->hasRole(['admin', 'spark_admin', 'district_admin']);
    }

    /**
     * Check if user can view users in this district.
     *
     * @return bool
     */
    private function canViewUsers(): bool
    {
        if (!auth()->check()) {
            return false;
        }

        return auth()->user()->hasRole(['admin', 'spark_admin', 'district_admin']);
    }
}
