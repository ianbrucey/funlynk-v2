<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use App\Models\Spark\Program;

/**
 * Update Program Request
 * 
 * Validates Spark program update data, inheriting rules from CreateProgramRequest
 * with 'sometimes' modifiers for partial updates
 */
class UpdateProgramRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        $program = $this->route('program');
        
        // Policy-based authorization (stub for future extension)
        if (Gate::getPolicyFor(Program::class)) {
            return Gate::allows('update', $program);
        }
        
        // Fallback to role-based authorization
        return auth()->check() && auth()->user()->hasRole(['admin', 'spark_admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $createRules = (new CreateProgramRequest())->rules();
        
        // Convert all rules to "sometimes" for partial updates
        $updateRules = [];
        foreach ($createRules as $field => $rules) {
            if (is_array($rules)) {
                $updateRules[$field] = array_merge(['sometimes'], $rules);
            } else {
                $updateRules[$field] = 'sometimes|' . $rules;
            }
        }
        
        return $updateRules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return (new CreateProgramRequest())->messages();
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return (new CreateProgramRequest())->attributes();
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        // Only prepare fields that are actually present in the request
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => $this->boolean('is_active'),
            ]);
        }

        // Clean and normalize character topics if present
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

        // Clean learning objectives array if present
        if ($this->has('learning_objectives') && is_array($this->learning_objectives)) {
            $objectives = array_filter($this->learning_objectives, function ($objective) {
                return !empty(trim($objective));
            });

            $this->merge([
                'learning_objectives' => array_values($objectives),
            ]);
        }

        // Clean materials needed array if present
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
