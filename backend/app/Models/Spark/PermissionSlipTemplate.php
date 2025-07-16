<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PermissionSlipTemplate extends Model
{
    protected $fillable = [
        'name',
        'title',
        'content',
        'required_fields',
        'emergency_contact_fields',
        'medical_fields',
        'photo_permission_text',
        'signature_text',
        'is_default',
        'is_active',
    ];

    protected $casts = [
        'required_fields' => 'array',
        'emergency_contact_fields' => 'array',
        'medical_fields' => 'array',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function permissionSlips(): HasMany
    {
        return $this->hasMany(PermissionSlip::class, 'template_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    // Methods
    public function renderContent(array $variables = []): string
    {
        $content = $this->content;
        
        foreach ($variables as $key => $value) {
            $content = str_replace("{{$key}}", $value, $content);
        }
        
        return $content;
    }

    public function setAsDefault(): void
    {
        // Remove default flag from all other templates
        static::where('is_default', true)->update(['is_default' => false]);
        
        // Set this template as default
        $this->update(['is_default' => true]);
    }

    public function getRequiredFieldsListAttribute(): array
    {
        return $this->required_fields ?? [
            'parent_name',
            'parent_email',
            'parent_phone',
            'emergency_contacts',
        ];
    }

    public function getEmergencyContactFieldsListAttribute(): array
    {
        return $this->emergency_contact_fields ?? [
            'name',
            'phone',
            'relationship',
        ];
    }

    public function getMedicalFieldsListAttribute(): array
    {
        return $this->medical_fields ?? [
            'allergies',
            'medications',
            'medical_conditions',
            'special_instructions',
        ];
    }
}
