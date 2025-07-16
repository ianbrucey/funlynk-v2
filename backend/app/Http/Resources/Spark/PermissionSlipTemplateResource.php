<?php

namespace App\Http\Resources\Spark;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionSlipTemplateResource extends JsonResource
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
            'name' => $this->name,
            'title' => $this->title,
            'content' => $this->content,
            'required_fields' => $this->required_fields,
            'emergency_contact_fields' => $this->emergency_contact_fields,
            'medical_fields' => $this->medical_fields,
            'photo_permission_text' => $this->photo_permission_text,
            'signature_text' => $this->signature_text,
            'is_default' => $this->is_default,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Computed fields
            'required_fields_list' => $this->required_fields_list,
            'emergency_contact_fields_list' => $this->emergency_contact_fields_list,
            'medical_fields_list' => $this->medical_fields_list,
            
            // Usage statistics
            'permission_slips_count' => $this->whenCounted('permissionSlips'),
            'signed_permission_slips_count' => $this->when(
                $this->relationLoaded('permissionSlips'),
                $this->permissionSlips->where('is_signed', true)->count()
            ),
        ];
    }
}
