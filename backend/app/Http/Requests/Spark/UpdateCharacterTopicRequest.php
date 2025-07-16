<?php

namespace App\Http\Requests\Spark;

use App\Models\Spark\CharacterTopic;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/**
 * Update Character Topic Request.
 *
 * Validates character topic update data with slug uniqueness handling
 */
class UpdateCharacterTopicRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        $characterTopic = $this->route('character_topic');

        // Policy-based authorization (stub for future extension)
        if (Gate::getPolicyFor(CharacterTopic::class)) {
            return Gate::allows('update', $characterTopic);
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
        $characterTopicId = $this->route('character_topic')->id ?? null;

        return [
            'name' => 'sometimes|required|string|max:255',
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('character_topics', 'slug')->ignore($characterTopicId),
            ],
            'description' => 'sometimes|nullable|string|max:1000',
            'category' => 'sometimes|required|string|max:255',
            'age_group' => 'sometimes|nullable|string|max:255',
            'learning_outcomes' => 'sometimes|nullable|array',
            'learning_outcomes.*' => 'string|max:500',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|nullable|integer|min:0',
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
            'name.required' => 'The character topic name is required.',
            'slug.required' => 'The slug is required.',
            'slug.unique' => 'The slug must be unique.',
            'category.required' => 'The category is required.',
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
            'name' => 'character topic name',
            'slug' => 'character topic slug',
            'description' => 'character topic description',
            'category' => 'character topic category',
            'age_group' => 'age group',
            'learning_outcomes' => 'learning outcomes',
            'is_active' => 'active status',
            'sort_order' => 'sort order',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Generate slug from name if name is provided but slug is not
        if ($this->has('name') && !$this->has('slug')) {
            $this->merge([
                'slug' => strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $this->name))),
            ]);
        }

        // Normalize category to lowercase
        if ($this->has('category')) {
            $this->merge([
                'category' => strtolower(trim($this->category)),
            ]);
        }
    }
}
