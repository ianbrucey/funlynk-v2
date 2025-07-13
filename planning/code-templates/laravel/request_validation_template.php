<?php

namespace App\Http\Requests\{MODULE};

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;

/**
 * {ACTION} {MODEL} Request
 * 
 * Handles validation for {ACTION} {MODEL} operations in the {MODULE} module.
 * Provides custom validation rules, messages, and authorization logic.
 * 
 * @package App\Http\Requests\{MODULE}
 */
class {ACTION}{MODEL}Request extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Basic authorization - customize based on your needs
        if (!auth()->check()) {
            return false;
        }

        // Role-based authorization examples:
        
        // For creation - any authenticated user
        if ($this->isMethod('POST')) {
            return true;
        }

        // For updates/deletes - check ownership or admin role
        if ($this->isMethod('PUT') || $this->isMethod('PATCH') || $this->isMethod('DELETE')) {
            ${modelVariable} = $this->route('{modelVariable}');
            
            // Allow if user owns the resource or is admin
            return ${modelVariable} && (
                ${modelVariable}->user_id === auth()->id() ||
                auth()->user()->hasRole('admin') ||
                auth()->user()->hasRole('funlynk_admin')
            );
        }

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = [];
        ${modelVariable}Id = $this->route('{modelVariable}') ? $this->route('{modelVariable}')->id : null;

        // Common rules for both create and update
        $commonRules = [
            'name' => [
                'required',
                'string',
                'max:255',
                'min:2',
                // Unique rule with exception for current record
                Rule::unique('{table_name}', 'name')->ignore(${modelVariable}Id),
            ],
            'description' => [
                'nullable',
                'string',
                'max:2000',
            ],
            'status' => [
                'sometimes',
                'required',
                'string',
                Rule::in(['active', 'inactive', 'draft', 'published']),
            ],
        ];

        // Method-specific rules
        switch ($this->method()) {
            case 'POST':
                $rules = array_merge($commonRules, $this->getCreateRules());
                break;
                
            case 'PUT':
            case 'PATCH':
                $rules = array_merge($commonRules, $this->getUpdateRules());
                // Make all fields optional for PATCH
                if ($this->isMethod('PATCH')) {
                    $rules = $this->makeOptional($rules);
                }
                break;
        }

        return $rules;
    }

    /**
     * Get validation rules specific to creation.
     */
    private function getCreateRules(): array
    {
        return [
            // Add creation-specific rules here
            'user_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:users,id',
            ],
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:5120', // 5MB
                'dimensions:min_width=100,min_height=100,max_width=2000,max_height=2000',
            ],
            // Module-specific rules
            ...$this->getModuleSpecificCreateRules(),
        ];
    }

    /**
     * Get validation rules specific to updates.
     */
    private function getUpdateRules(): array
    {
        return [
            // Add update-specific rules here
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:5120', // 5MB
                'dimensions:min_width=100,min_height=100,max_width=2000,max_height=2000',
            ],
            // Module-specific rules
            ...$this->getModuleSpecificUpdateRules(),
        ];
    }

    /**
     * Get module-specific creation rules.
     */
    private function getModuleSpecificCreateRules(): array
    {
        // Core module specific rules
        if ('{MODULE}' === 'Core') {
            return [
                'start_date' => [
                    'required',
                    'date',
                    'after:now',
                ],
                'end_date' => [
                    'required',
                    'date',
                    'after:start_date',
                ],
                'location_address' => [
                    'required',
                    'string',
                    'max:255',
                ],
                'location_latitude' => [
                    'required',
                    'numeric',
                    'between:-90,90',
                ],
                'location_longitude' => [
                    'required',
                    'numeric',
                    'between:-180,180',
                ],
                'category' => [
                    'required',
                    'string',
                    Rule::in(['sports', 'arts', 'education', 'social', 'outdoor', 'technology']),
                ],
                'tags' => [
                    'nullable',
                    'array',
                    'max:10',
                ],
                'tags.*' => [
                    'string',
                    'max:50',
                ],
                'max_capacity' => [
                    'nullable',
                    'integer',
                    'min:1',
                    'max:10000',
                ],
                'price' => [
                    'nullable',
                    'numeric',
                    'min:0',
                    'max:99999.99',
                ],
                'visibility' => [
                    'required',
                    'string',
                    Rule::in(['public', 'friends', 'private']),
                ],
            ];
        }

        // Spark module specific rules
        if ('{MODULE}' === 'Spark') {
            return [
                'duration_minutes' => [
                    'required',
                    'integer',
                    'min:30',
                    'max:480', // 8 hours max
                ],
                'cost' => [
                    'required',
                    'numeric',
                    'min:0',
                    'max:999.99',
                ],
                'character_topics' => [
                    'required',
                    'array',
                    'min:1',
                    'max:5',
                ],
                'character_topics.*' => [
                    'string',
                    Rule::in([
                        'Responsibility', 'Empathy', 'Integrity', 'Perseverance', 'Respect',
                        'Kindness', 'Courage', 'Honesty', 'Gratitude', 'Self-Control',
                        'Teamwork', 'Leadership', 'Compassion', 'Fairness', 'Patience',
                        'Humility', 'Forgiveness', 'Loyalty', 'Generosity', 'Optimism',
                        'Resilience', 'Trustworthiness', 'Cooperation', 'Citizenship',
                        'Diligence', 'Tolerance', 'Wisdom'
                    ]),
                ],
                'grade_levels' => [
                    'required',
                    'array',
                    'min:1',
                ],
                'grade_levels.*' => [
                    'string',
                    Rule::in(['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']),
                ],
                'what_to_bring' => [
                    'nullable',
                    'string',
                    'max:1000',
                ],
                'special_instructions' => [
                    'nullable',
                    'string',
                    'max:1000',
                ],
            ];
        }

        return [];
    }

    /**
     * Get module-specific update rules.
     */
    private function getModuleSpecificUpdateRules(): array
    {
        // Similar to create rules but may have different requirements
        return $this->getModuleSpecificCreateRules();
    }

    /**
     * Make all rules optional (for PATCH requests).
     */
    private function makeOptional(array $rules): array
    {
        foreach ($rules as $field => $fieldRules) {
            if (is_array($fieldRules)) {
                // Remove 'required' and add 'sometimes'
                $fieldRules = array_filter($fieldRules, function ($rule) {
                    return $rule !== 'required';
                });
                
                if (!in_array('sometimes', $fieldRules)) {
                    array_unshift($fieldRules, 'sometimes');
                }
                
                $rules[$field] = $fieldRules;
            }
        }
        
        return $rules;
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The name field is required.',
            'name.unique' => 'A {modelVariable} with this name already exists.',
            'name.min' => 'The name must be at least 2 characters.',
            'name.max' => 'The name may not be greater than 255 characters.',
            
            'description.max' => 'The description may not be greater than 2000 characters.',
            
            'image.image' => 'The file must be an image.',
            'image.mimes' => 'The image must be a file of type: jpeg, png, jpg, gif, webp.',
            'image.max' => 'The image may not be greater than 5MB.',
            'image.dimensions' => 'The image dimensions must be between 100x100 and 2000x2000 pixels.',
            
            // Core-specific messages
            'start_date.required' => 'The start date is required.',
            'start_date.after' => 'The start date must be in the future.',
            'end_date.required' => 'The end date is required.',
            'end_date.after' => 'The end date must be after the start date.',
            'location_address.required' => 'The location address is required.',
            'location_latitude.required' => 'The location coordinates are required.',
            'location_latitude.between' => 'The latitude must be between -90 and 90.',
            'location_longitude.required' => 'The location coordinates are required.',
            'location_longitude.between' => 'The longitude must be between -180 and 180.',
            'max_capacity.min' => 'The maximum capacity must be at least 1.',
            'max_capacity.max' => 'The maximum capacity may not be greater than 10,000.',
            'price.min' => 'The price must be at least 0.',
            'price.max' => 'The price may not be greater than $99,999.99.',
            
            // Spark-specific messages
            'duration_minutes.required' => 'The program duration is required.',
            'duration_minutes.min' => 'The program must be at least 30 minutes.',
            'duration_minutes.max' => 'The program may not be longer than 8 hours.',
            'character_topics.required' => 'At least one character topic is required.',
            'character_topics.min' => 'At least one character topic must be selected.',
            'character_topics.max' => 'No more than 5 character topics may be selected.',
            'grade_levels.required' => 'At least one grade level is required.',
            'grade_levels.min' => 'At least one grade level must be selected.',
        ];
    }

    /**
     * Get custom attribute names for validation errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'name',
            'description' => 'description',
            'start_date' => 'start date',
            'end_date' => 'end date',
            'location_address' => 'location address',
            'location_latitude' => 'latitude',
            'location_longitude' => 'longitude',
            'max_capacity' => 'maximum capacity',
            'character_topics' => 'character topics',
            'grade_levels' => 'grade levels',
            'duration_minutes' => 'duration',
            'what_to_bring' => 'what to bring',
            'special_instructions' => 'special instructions',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Clean and prepare data before validation
        if ($this->has('name')) {
            $this->merge([
                'name' => trim($this->name),
            ]);
        }

        if ($this->has('description')) {
            $this->merge([
                'description' => trim($this->description),
            ]);
        }

        // Set default user_id if not provided
        if (!$this->has('user_id') && auth()->check()) {
            $this->merge([
                'user_id' => auth()->id(),
            ]);
        }

        // Convert string arrays to actual arrays if needed
        if ($this->has('tags') && is_string($this->tags)) {
            $this->merge([
                'tags' => explode(',', $this->tags),
            ]);
        }

        if ($this->has('character_topics') && is_string($this->character_topics)) {
            $this->merge([
                'character_topics' => explode(',', $this->character_topics),
            ]);
        }

        if ($this->has('grade_levels') && is_string($this->grade_levels)) {
            $this->merge([
                'grade_levels' => explode(',', $this->grade_levels),
            ]);
        }
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        // For API requests, return JSON response
        if ($this->expectsJson()) {
            throw new HttpResponseException(
                response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                    'error_code' => 'VALIDATION_ERROR',
                ], Response::HTTP_UNPROCESSABLE_ENTITY)
            );
        }

        // For web requests, use default behavior
        parent::failedValidation($validator);
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            // Add custom validation logic here
            
            // Example: Validate date range
            if ($this->has('start_date') && $this->has('end_date')) {
                $startDate = $this->start_date;
                $endDate = $this->end_date;
                
                if ($startDate && $endDate && $startDate >= $endDate) {
                    $validator->errors()->add('end_date', 'The end date must be after the start date.');
                }
            }

            // Example: Validate capacity vs existing bookings
            if ($this->has('max_capacity') && $this->route('{modelVariable}')) {
                ${modelVariable} = $this->route('{modelVariable}');
                $newCapacity = (int) $this->max_capacity;
                
                // Add logic to check existing bookings
                // if (${modelVariable}->bookings_count > $newCapacity) {
                //     $validator->errors()->add('max_capacity', 'Cannot reduce capacity below current bookings.');
                // }
            }
        });
    }
}

/*
USAGE INSTRUCTIONS:

1. Replace placeholders:
   - {MODULE}: Core, Spark, or Shared
   - {MODEL}: Model name (e.g., Event, User, Program)
   - {ACTION}: Action name (e.g., Create, Update, Store)
   - {modelVariable}: camelCase model name (e.g., event, user, program)
   - {table_name}: Database table name

2. Customize authorization logic in the authorize() method

3. Update validation rules based on your specific requirements

4. Add custom validation messages for better user experience

5. Implement custom validation logic in withValidator() method

6. Update prepareForValidation() to clean and prepare data

EXAMPLE USAGE:
- CreateEventRequest in Core module
- UpdateProgramRequest in Spark module
- StoreUserRequest in Shared module

COMMON CUSTOMIZATIONS:
- Add file upload validation
- Add complex business rule validation
- Add conditional validation based on user roles
- Add cross-field validation
- Add external API validation
*/
