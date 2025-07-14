<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Update School Request
 * 
 * Validates school update data for Spark educational programs
 */
class UpdateSchoolRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasRole(['admin', 'spark_admin', 'district_admin', 'school_admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $schoolId = $this->route('id');

        return [
            'district_id' => 'sometimes|integer|exists:districts,id',
            'name' => 'sometimes|string|max:255',
            'code' => [
                'sometimes',
                'string',
                'max:20',
                Rule::unique('schools', 'code')->ignore($schoolId),
            ],
            'type' => 'sometimes|string|in:elementary,middle,high,k12,charter,private,magnet',
            'address' => 'sometimes|string|max:500',
            'city' => 'sometimes|string|max:100',
            'state' => 'sometimes|string|size:2',
            'zip_code' => 'sometimes|string|max:10',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'principal_name' => 'nullable|string|max:255',
            'principal_email' => 'nullable|email|max:255',
            'principal_phone' => 'nullable|string|max:20',
            'grade_levels' => 'sometimes|array|min:1',
            'grade_levels.*' => 'string|in:K,1,2,3,4,5,6,7,8,9,10,11,12',
            'student_count' => 'nullable|integer|min:0|max:10000',
            'contact_info' => 'nullable|array',
            'contact_info.assistant_principal_name' => 'nullable|string|max:255',
            'contact_info.assistant_principal_email' => 'nullable|email|max:255',
            'contact_info.secretary_name' => 'nullable|string|max:255',
            'contact_info.secretary_email' => 'nullable|email|max:255',
            'contact_info.secretary_phone' => 'nullable|string|max:20',
            'settings' => 'nullable|array',
            'settings.allow_field_trips' => 'nullable|boolean',
            'settings.allow_assemblies' => 'nullable|boolean',
            'settings.allow_after_school' => 'nullable|boolean',
            'settings.booking_approval_required' => 'nullable|boolean',
            'is_active' => 'sometimes|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'district_id.exists' => 'Selected district does not exist.',
            'code.unique' => 'A school with this code already exists.',
            'type.in' => 'Please select a valid school type.',
            'state.size' => 'State must be a 2-letter code.',
            'grade_levels.min' => 'At least one grade level must be selected.',
            'grade_levels.*.in' => 'Please select valid grade levels.',
            'student_count.min' => 'Student count cannot be negative.',
            'student_count.max' => 'Student count cannot exceed 10,000.',
            'email.email' => 'Please enter a valid email address.',
            'principal_email.email' => 'Please enter a valid principal email.',
            'website.url' => 'Please enter a valid website URL.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'district_id' => 'district',
            'name' => 'school name',
            'code' => 'school code',
            'type' => 'school type',
            'zip_code' => 'ZIP code',
            'grade_levels' => 'grade levels',
            'student_count' => 'student count',
            'principal_name' => 'principal name',
            'principal_email' => 'principal email',
            'principal_phone' => 'principal phone',
            'contact_info.assistant_principal_name' => 'assistant principal name',
            'contact_info.assistant_principal_email' => 'assistant principal email',
            'contact_info.secretary_name' => 'secretary name',
            'contact_info.secretary_email' => 'secretary email',
            'contact_info.secretary_phone' => 'secretary phone',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        // Normalize state to uppercase
        if ($this->has('state')) {
            $this->merge([
                'state' => strtoupper($this->input('state')),
            ]);
        }

        // Normalize code to uppercase
        if ($this->has('code')) {
            $this->merge([
                'code' => strtoupper(trim($this->input('code'))),
            ]);
        }
    }
}
