<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Add Students Request.
 *
 * Validates student data when adding students to a booking
 */
class AddStudentsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'students' => ['required', 'array', 'min:1', 'max:100'],
            'students.*.first_name' => ['required', 'string', 'max:255'],
            'students.*.last_name' => ['required', 'string', 'max:255'],
            'students.*.grade_level' => ['required', 'string', 'in:K,1,2,3,4,5,6,7,8,9,10,11,12'],
            'students.*.student_id_number' => ['sometimes', 'string', 'max:50'],
            'students.*.parent_name' => ['required', 'string', 'max:255'],
            'students.*.parent_email' => ['required', 'email', 'max:255'],
            'students.*.parent_phone' => ['required', 'string', 'max:20'],
            'students.*.emergency_contact' => ['sometimes', 'array'],
            'students.*.emergency_contact.name' => ['required_with:students.*.emergency_contact', 'string', 'max:255'],
            'students.*.emergency_contact.relationship' => ['required_with:students.*.emergency_contact', 'string', 'max:100'],
            'students.*.emergency_contact.phone' => ['required_with:students.*.emergency_contact', 'string', 'max:20'],
            'students.*.medical_info' => ['sometimes', 'array'],
            'students.*.medical_info.allergies' => ['sometimes', 'string', 'max:1000'],
            'students.*.medical_info.medications' => ['sometimes', 'string', 'max:1000'],
            'students.*.medical_info.conditions' => ['sometimes', 'string', 'max:1000'],
            'students.*.medical_info.notes' => ['sometimes', 'string', 'max:1000'],
            'students.*.dietary_restrictions' => ['sometimes', 'array'],
            'students.*.dietary_restrictions.allergies' => ['sometimes', 'string', 'max:500'],
            'students.*.dietary_restrictions.preferences' => ['sometimes', 'string', 'max:500'],
            'students.*.dietary_restrictions.restrictions' => ['sometimes', 'string', 'max:500'],
            'students.*.special_needs' => ['sometimes', 'array'],
            'students.*.special_needs.accommodations' => ['sometimes', 'string', 'max:1000'],
            'students.*.special_needs.support_required' => ['sometimes', 'string', 'max:1000'],
            'students.*.special_needs.notes' => ['sometimes', 'string', 'max:1000'],
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
            'students.required' => 'At least one student must be provided',
            'students.min' => 'At least one student must be provided',
            'students.max' => 'Maximum 100 students can be added at once',
            'students.*.first_name.required' => 'Student first name is required',
            'students.*.last_name.required' => 'Student last name is required',
            'students.*.grade_level.required' => 'Student grade level is required',
            'students.*.grade_level.in' => 'Invalid grade level. Must be K or 1-12',
            'students.*.parent_name.required' => 'Parent name is required',
            'students.*.parent_email.required' => 'Parent email is required',
            'students.*.parent_email.email' => 'Parent email must be a valid email address',
            'students.*.parent_phone.required' => 'Parent phone number is required',
            'students.*.emergency_contact.name.required_with' => 'Emergency contact name is required when emergency contact is provided',
            'students.*.emergency_contact.relationship.required_with' => 'Emergency contact relationship is required when emergency contact is provided',
            'students.*.emergency_contact.phone.required_with' => 'Emergency contact phone is required when emergency contact is provided',
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
            'students.*.first_name' => 'student first name',
            'students.*.last_name' => 'student last name',
            'students.*.grade_level' => 'student grade level',
            'students.*.student_id_number' => 'student ID number',
            'students.*.parent_name' => 'parent name',
            'students.*.parent_email' => 'parent email',
            'students.*.parent_phone' => 'parent phone',
            'students.*.emergency_contact.name' => 'emergency contact name',
            'students.*.emergency_contact.relationship' => 'emergency contact relationship',
            'students.*.emergency_contact.phone' => 'emergency contact phone',
            'students.*.medical_info.allergies' => 'medical allergies',
            'students.*.medical_info.medications' => 'medical medications',
            'students.*.medical_info.conditions' => 'medical conditions',
            'students.*.medical_info.notes' => 'medical notes',
            'students.*.dietary_restrictions.allergies' => 'dietary allergies',
            'students.*.dietary_restrictions.preferences' => 'dietary preferences',
            'students.*.dietary_restrictions.restrictions' => 'dietary restrictions',
            'students.*.special_needs.accommodations' => 'special needs accommodations',
            'students.*.special_needs.support_required' => 'special needs support required',
            'students.*.special_needs.notes' => 'special needs notes',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('students') && is_array($this->students)) {
            $students = array_map(function ($student) {
                // Normalize grade level to string
                if (isset($student['grade_level'])) {
                    $student['grade_level'] = (string) $student['grade_level'];
                }
                
                // Clean up empty arrays
                if (isset($student['emergency_contact']) && empty(array_filter($student['emergency_contact']))) {
                    unset($student['emergency_contact']);
                }
                
                if (isset($student['medical_info']) && empty(array_filter($student['medical_info']))) {
                    unset($student['medical_info']);
                }
                
                if (isset($student['dietary_restrictions']) && empty(array_filter($student['dietary_restrictions']))) {
                    unset($student['dietary_restrictions']);
                }
                
                if (isset($student['special_needs']) && empty(array_filter($student['special_needs']))) {
                    unset($student['special_needs']);
                }
                
                return $student;
            }, $this->students);

            $this->merge(['students' => $students]);
        }
    }
}
