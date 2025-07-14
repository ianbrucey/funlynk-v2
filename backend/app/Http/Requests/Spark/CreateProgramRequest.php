<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Create Program Request
 * 
 * Validates Spark program creation data
 */
class CreateProgramRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasRole(['admin', 'spark_admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'grade_levels' => 'required|array|min:1',
            'grade_levels.*' => 'string|in:K,1,2,3,4,5,6,7,8,9,10,11,12',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'max_students' => 'required|integer|min:1|max:500',
            'price_per_student' => 'required|numeric|min:0|max:999.99',
            'character_topics' => 'required|array|min:1',
            'character_topics.*' => 'string|max:100',
            'learning_objectives' => 'required|array|min:1',
            'learning_objectives.*' => 'string|max:500',
            'materials_needed' => 'nullable|array',
            'materials_needed.*' => 'string|max:255',
            'resource_files' => 'nullable|array|max:10',
            'resource_files.*' => 'file|mimes:pdf,doc,docx,ppt,pptx|max:10240',
            'special_requirements' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
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
            'title.required' => 'Program title is required.',
            'title.max' => 'Program title must not exceed 255 characters.',
            'description.required' => 'Program description is required.',
            'description.max' => 'Program description must not exceed 2000 characters.',
            'grade_levels.required' => 'At least one grade level is required.',
            'grade_levels.min' => 'At least one grade level must be selected.',
            'grade_levels.*.in' => 'Please select valid grade levels.',
            'duration_minutes.required' => 'Program duration is required.',
            'duration_minutes.min' => 'Program duration must be at least 15 minutes.',
            'duration_minutes.max' => 'Program duration cannot exceed 8 hours (480 minutes).',
            'max_students.required' => 'Maximum number of students is required.',
            'max_students.min' => 'At least 1 student must be allowed.',
            'max_students.max' => 'Maximum students cannot exceed 500.',
            'price_per_student.required' => 'Price per student is required.',
            'price_per_student.min' => 'Price cannot be negative.',
            'price_per_student.max' => 'Price per student cannot exceed $999.99.',
            'character_topics.required' => 'At least one character topic is required.',
            'character_topics.min' => 'At least one character topic must be selected.',
            'character_topics.*.max' => 'Each character topic must not exceed 100 characters.',
            'learning_objectives.required' => 'At least one learning objective is required.',
            'learning_objectives.min' => 'At least one learning objective must be provided.',
            'learning_objectives.*.max' => 'Each learning objective must not exceed 500 characters.',
            'materials_needed.*.max' => 'Each material item must not exceed 255 characters.',
            'resource_files.max' => 'You can upload a maximum of 10 resource files.',
            'resource_files.*.file' => 'Each resource must be a valid file.',
            'resource_files.*.mimes' => 'Resource files must be PDF, DOC, DOCX, PPT, or PPTX format.',
            'resource_files.*.max' => 'Each resource file must not exceed 10MB.',
            'special_requirements.max' => 'Special requirements must not exceed 1000 characters.',
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
            'title' => 'program title',
            'description' => 'program description',
            'grade_levels' => 'grade levels',
            'duration_minutes' => 'program duration',
            'max_students' => 'maximum students',
            'price_per_student' => 'price per student',
            'character_topics' => 'character topics',
            'learning_objectives' => 'learning objectives',
            'materials_needed' => 'materials needed',
            'resource_files' => 'resource files',
            'special_requirements' => 'special requirements',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        // Set default active status
        $this->merge([
            'is_active' => $this->boolean('is_active', true),
        ]);

        // Clean and normalize character topics
        if ($this->has('character_topics') && is_array($this->character_topics)) {
            $topics = array_map(function ($topic) {
                return trim($topic);
            }, $this->character_topics);

            // Remove empty values and duplicates
            $topics = array_filter($topics, function ($topic) {
                return !empty($topic);
            });

            $this->merge([
                'character_topics' => array_unique($topics),
            ]);
        }

        // Clean learning objectives array
        if ($this->has('learning_objectives') && is_array($this->learning_objectives)) {
            $objectives = array_filter($this->learning_objectives, function ($objective) {
                return !empty(trim($objective));
            });

            $this->merge([
                'learning_objectives' => array_values($objectives),
            ]);
        }

        // Clean materials needed array
        if ($this->has('materials_needed') && is_array($this->materials_needed)) {
            $materials = array_filter($this->materials_needed, function ($material) {
                return !empty(trim($material));
            });

            $this->merge([
                'materials_needed' => array_values($materials),
            ]);
        }
    }
}
