<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Sign Permission Slip Request
 *
 * Validates data for digitally signing permission slips by parents.
 */
class SignPermissionSlipRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Public endpoint - no authentication required
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Parent Information
            'parent_name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z\s\-\'\.]+$/', // Only letters, spaces, hyphens, apostrophes, periods
            ],
            'parent_email' => [
                'required',
                'email',
                'max:255',
            ],
            'parent_phone' => [
                'required',
                'string',
                'max:20',
                'regex:/^[\+]?[0-9\s\-\(\)\.]+$/', // Phone number format
            ],

            // Emergency Contacts
            'emergency_contacts' => [
                'required',
                'array',
                'min:1',
                'max:3',
            ],
            'emergency_contacts.*.name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z\s\-\'\.]+$/',
            ],
            'emergency_contacts.*.phone' => [
                'required',
                'string',
                'max:20',
                'regex:/^[\+]?[0-9\s\-\(\)\.]+$/',
            ],
            'emergency_contacts.*.relationship' => [
                'required',
                'string',
                'max:100',
                Rule::in([
                    'Parent', 'Guardian', 'Grandparent', 'Aunt', 'Uncle', 
                    'Sibling', 'Family Friend', 'Neighbor', 'Other'
                ]),
            ],
            'emergency_contacts.*.is_primary' => [
                'sometimes',
                'boolean',
            ],

            // Medical Information
            'medical_info' => [
                'sometimes',
                'array',
            ],
            'medical_info.allergies' => [
                'sometimes',
                'string',
                'max:1000',
            ],
            'medical_info.medications' => [
                'sometimes',
                'string',
                'max:1000',
            ],
            'medical_info.medical_conditions' => [
                'sometimes',
                'string',
                'max:1000',
            ],
            'medical_info.dietary_restrictions' => [
                'sometimes',
                'string',
                'max:500',
            ],
            'medical_info.emergency_medical_info' => [
                'sometimes',
                'string',
                'max:1000',
            ],

            // Special Instructions
            'special_instructions' => [
                'sometimes',
                'string',
                'max:1000',
            ],

            // Photo Permission
            'photo_permission' => [
                'required',
                'boolean',
            ],

            // Digital Signature
            'signature' => [
                'required',
                'string',
                'min:10', // Minimum signature data length
                'max:50000', // Maximum for base64 image or SVG data
            ],

            // Consent Acknowledgments
            'consent_medical_treatment' => [
                'required',
                'boolean',
                'accepted', // Must be true
            ],
            'consent_transportation' => [
                'required',
                'boolean',
                'accepted', // Must be true
            ],
            'consent_activity_participation' => [
                'required',
                'boolean',
                'accepted', // Must be true
            ],
            'consent_liability_waiver' => [
                'required',
                'boolean',
                'accepted', // Must be true
            ],

            // Terms and Conditions
            'terms_accepted' => [
                'required',
                'boolean',
                'accepted', // Must be true
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'parent_name.required' => 'Parent/guardian name is required.',
            'parent_name.regex' => 'Parent name contains invalid characters.',
            'parent_email.required' => 'Parent email address is required.',
            'parent_email.email' => 'Please enter a valid email address.',
            'parent_phone.required' => 'Parent phone number is required.',
            'parent_phone.regex' => 'Please enter a valid phone number.',

            'emergency_contacts.required' => 'At least one emergency contact is required.',
            'emergency_contacts.min' => 'At least one emergency contact is required.',
            'emergency_contacts.max' => 'Maximum of 3 emergency contacts allowed.',
            'emergency_contacts.*.name.required' => 'Emergency contact name is required.',
            'emergency_contacts.*.name.regex' => 'Emergency contact name contains invalid characters.',
            'emergency_contacts.*.phone.required' => 'Emergency contact phone is required.',
            'emergency_contacts.*.phone.regex' => 'Please enter a valid emergency contact phone number.',
            'emergency_contacts.*.relationship.required' => 'Emergency contact relationship is required.',
            'emergency_contacts.*.relationship.in' => 'Please select a valid relationship.',

            'medical_info.allergies.max' => 'Allergies information cannot exceed 1000 characters.',
            'medical_info.medications.max' => 'Medications information cannot exceed 1000 characters.',
            'medical_info.medical_conditions.max' => 'Medical conditions information cannot exceed 1000 characters.',
            'medical_info.dietary_restrictions.max' => 'Dietary restrictions cannot exceed 500 characters.',
            'medical_info.emergency_medical_info.max' => 'Emergency medical information cannot exceed 1000 characters.',

            'special_instructions.max' => 'Special instructions cannot exceed 1000 characters.',

            'photo_permission.required' => 'Photo permission selection is required.',

            'signature.required' => 'Digital signature is required.',
            'signature.min' => 'Invalid signature data.',
            'signature.max' => 'Signature data is too large.',

            'consent_medical_treatment.accepted' => 'You must consent to emergency medical treatment.',
            'consent_transportation.accepted' => 'You must consent to transportation arrangements.',
            'consent_activity_participation.accepted' => 'You must consent to activity participation.',
            'consent_liability_waiver.accepted' => 'You must accept the liability waiver.',

            'terms_accepted.accepted' => 'You must accept the terms and conditions.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'parent_name' => 'parent/guardian name',
            'parent_email' => 'parent email',
            'parent_phone' => 'parent phone',
            'emergency_contacts' => 'emergency contacts',
            'emergency_contacts.*.name' => 'emergency contact name',
            'emergency_contacts.*.phone' => 'emergency contact phone',
            'emergency_contacts.*.relationship' => 'relationship',
            'medical_info.allergies' => 'allergies',
            'medical_info.medications' => 'medications',
            'medical_info.medical_conditions' => 'medical conditions',
            'medical_info.dietary_restrictions' => 'dietary restrictions',
            'medical_info.emergency_medical_info' => 'emergency medical information',
            'special_instructions' => 'special instructions',
            'photo_permission' => 'photo permission',
            'signature' => 'digital signature',
            'consent_medical_treatment' => 'medical treatment consent',
            'consent_transportation' => 'transportation consent',
            'consent_activity_participation' => 'activity participation consent',
            'consent_liability_waiver' => 'liability waiver',
            'terms_accepted' => 'terms and conditions',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validate signature format
            if ($this->has('signature')) {
                if (!$this->isValidSignatureFormat($this->signature)) {
                    $validator->errors()->add('signature', 'Invalid signature format.');
                }
            }

            // Ensure at least one emergency contact is marked as primary
            if ($this->has('emergency_contacts')) {
                $hasPrimary = collect($this->emergency_contacts)
                    ->contains('is_primary', true);
                
                if (!$hasPrimary) {
                    // Auto-mark first contact as primary
                    $contacts = $this->emergency_contacts;
                    $contacts[0]['is_primary'] = true;
                    $this->merge(['emergency_contacts' => $contacts]);
                }
            }

            // Validate emergency contact uniqueness
            if ($this->has('emergency_contacts')) {
                $phones = collect($this->emergency_contacts)->pluck('phone');
                if ($phones->count() !== $phones->unique()->count()) {
                    $validator->errors()->add(
                        'emergency_contacts',
                        'Emergency contacts must have unique phone numbers.'
                    );
                }
            }
        });
    }

    /**
     * Check if signature format is valid.
     */
    private function isValidSignatureFormat(string $signature): bool
    {
        // Base64 image format
        if (str_starts_with($signature, 'data:image/')) {
            return preg_match('/^data:image\/(png|jpeg|jpg|svg\+xml);base64,/', $signature);
        }

        // SVG format
        if (str_starts_with($signature, '<svg') || str_starts_with($signature, 'M ')) {
            return true;
        }

        // JSON coordinate format
        if (str_starts_with($signature, '{') || str_starts_with($signature, '[')) {
            $decoded = json_decode($signature, true);
            return json_last_error() === JSON_ERROR_NONE;
        }

        return false;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Normalize phone numbers
        if ($this->has('parent_phone')) {
            $this->merge([
                'parent_phone' => $this->normalizePhoneNumber($this->parent_phone)
            ]);
        }

        if ($this->has('emergency_contacts')) {
            $contacts = collect($this->emergency_contacts)->map(function ($contact) {
                if (isset($contact['phone'])) {
                    $contact['phone'] = $this->normalizePhoneNumber($contact['phone']);
                }
                return $contact;
            })->toArray();

            $this->merge(['emergency_contacts' => $contacts]);
        }

        // Ensure boolean fields are properly cast
        $booleanFields = [
            'photo_permission',
            'consent_medical_treatment',
            'consent_transportation', 
            'consent_activity_participation',
            'consent_liability_waiver',
            'terms_accepted'
        ];

        foreach ($booleanFields as $field) {
            if ($this->has($field)) {
                $this->merge([$field => filter_var($this->input($field), FILTER_VALIDATE_BOOLEAN)]);
            }
        }
    }

    /**
     * Normalize phone number format.
     */
    private function normalizePhoneNumber(string $phone): string
    {
        // Remove extra spaces and normalize format
        return preg_replace('/\s+/', ' ', trim($phone));
    }
}
