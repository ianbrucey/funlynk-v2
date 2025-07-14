<?php

namespace App\Http\Requests\Core;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Update Interests Request
 * 
 * Validates user interests update data
 */
class UpdateInterestsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'interests' => 'required|array|min:1|max:20',
            'interests.*' => 'required|string|max:100|distinct',
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
            'interests.required' => 'At least one interest is required.',
            'interests.array' => 'Interests must be provided as an array.',
            'interests.min' => 'At least one interest is required.',
            'interests.max' => 'You can have a maximum of 20 interests.',
            'interests.*.required' => 'Each interest is required.',
            'interests.*.string' => 'Each interest must be a string.',
            'interests.*.max' => 'Each interest must not exceed 100 characters.',
            'interests.*.distinct' => 'Interests must be unique.',
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
            'interests' => 'interests',
            'interests.*' => 'interest',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('interests') && is_array($this->interests)) {
            // Clean and normalize interests
            $interests = array_map(function ($interest) {
                return trim(strtolower($interest));
            }, $this->interests);

            // Remove empty values and duplicates
            $interests = array_filter($interests, function ($interest) {
                return !empty($interest);
            });

            $this->merge([
                'interests' => array_unique($interests),
            ]);
        }
    }
}
