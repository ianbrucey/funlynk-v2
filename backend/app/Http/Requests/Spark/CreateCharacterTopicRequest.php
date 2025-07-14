<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Spark\CharacterTopic;

/**
 * Create Character Topic Request
 *
 * Validates character topic creation data
 */
class CreateCharacterTopicRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Use a policy stub for future extension
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
            'name' => 'required|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:character_topics,slug',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
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
            'is_active' => 'active status',
            'sort_order' => 'sort order',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
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
