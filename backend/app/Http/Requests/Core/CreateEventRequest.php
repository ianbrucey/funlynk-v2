<?php

namespace App\Http\Requests\Core;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Create Event Request
 * 
 * Validates event creation data
 */
class CreateEventRequest extends FormRequest
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
            // Basic event information
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'category_id' => 'required|integer|exists:event_categories,id',
            
            // Location information
            'location' => 'required|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            
            // Date and time
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time',
            
            // Capacity and pricing
            'max_attendees' => 'nullable|integer|min:1|max:10000',
            'price' => 'nullable|numeric|min:0|max:9999.99',
            
            // Event settings
            'status' => 'sometimes|in:draft,published',
            'visibility' => 'sometimes|in:public,private,followers_only',
            'requires_approval' => 'sometimes|boolean',
            
            // Additional information
            'requirements' => 'nullable|array',
            'requirements.*' => 'string|max:255',
            'contact_info' => 'nullable|string|max:1000',
            
            // Images
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            
            // Tags
            'tags' => 'nullable|array|max:10',
            'tags.*' => 'string|max:50',
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
            'title.required' => 'Event title is required.',
            'title.max' => 'Event title must not exceed 255 characters.',
            'description.required' => 'Event description is required.',
            'description.max' => 'Event description must not exceed 5000 characters.',
            'category_id.required' => 'Event category is required.',
            'category_id.exists' => 'Selected category does not exist.',
            'location.required' => 'Event location is required.',
            'location.max' => 'Event location must not exceed 500 characters.',
            'latitude.between' => 'Latitude must be between -90 and 90.',
            'longitude.between' => 'Longitude must be between -180 and 180.',
            'start_time.required' => 'Event start time is required.',
            'start_time.after' => 'Event start time must be in the future.',
            'end_time.required' => 'Event end time is required.',
            'end_time.after' => 'Event end time must be after start time.',
            'max_attendees.min' => 'Maximum attendees must be at least 1.',
            'max_attendees.max' => 'Maximum attendees cannot exceed 10,000.',
            'price.min' => 'Price cannot be negative.',
            'price.max' => 'Price cannot exceed $9,999.99.',
            'status.in' => 'Status must be either draft or published.',
            'visibility.in' => 'Visibility must be public, private, or followers_only.',
            'requirements.array' => 'Requirements must be provided as an array.',
            'requirements.*.max' => 'Each requirement must not exceed 255 characters.',
            'contact_info.max' => 'Contact information must not exceed 1000 characters.',
            'images.array' => 'Images must be provided as an array.',
            'images.max' => 'You can upload a maximum of 5 images.',
            'images.*.image' => 'Each file must be a valid image.',
            'images.*.mimes' => 'Images must be in JPEG, PNG, JPG, or GIF format.',
            'images.*.max' => 'Each image must not exceed 2MB.',
            'tags.array' => 'Tags must be provided as an array.',
            'tags.max' => 'You can add a maximum of 10 tags.',
            'tags.*.max' => 'Each tag must not exceed 50 characters.',
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
            'title' => 'event title',
            'description' => 'event description',
            'category_id' => 'event category',
            'location' => 'event location',
            'start_time' => 'start time',
            'end_time' => 'end time',
            'max_attendees' => 'maximum attendees',
            'price' => 'event price',
            'status' => 'event status',
            'visibility' => 'event visibility',
            'requires_approval' => 'requires approval',
            'requirements' => 'event requirements',
            'contact_info' => 'contact information',
            'images' => 'event images',
            'tags' => 'event tags',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        $this->merge([
            'status' => $this->input('status', 'draft'),
            'visibility' => $this->input('visibility', 'public'),
            'requires_approval' => $this->boolean('requires_approval', false),
        ]);

        // Clean and normalize tags
        if ($this->has('tags') && is_array($this->tags)) {
            $tags = array_map(function ($tag) {
                return trim(strtolower($tag));
            }, $this->tags);

            // Remove empty values and duplicates
            $tags = array_filter($tags, function ($tag) {
                return !empty($tag);
            });

            $this->merge([
                'tags' => array_unique($tags),
            ]);
        }

        // Clean requirements array
        if ($this->has('requirements') && is_array($this->requirements)) {
            $requirements = array_filter($this->requirements, function ($requirement) {
                return !empty(trim($requirement));
            });

            $this->merge([
                'requirements' => array_values($requirements),
            ]);
        }
    }
}
