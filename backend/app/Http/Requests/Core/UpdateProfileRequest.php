<?php

namespace App\Http\Requests\Core;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Update Profile Request.
 *
 * Validates user profile update data
 */
class UpdateProfileRequest extends FormRequest
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
        $userId = auth()->id();

        return [
            // Basic profile information
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users')->ignore($userId),
            ],
            'phone' => [
                'sometimes',
                'nullable',
                'string',
                'max:20',
                'regex:/^[\+]?[1-9][\d]{0,15}$/',
            ],
            'date_of_birth' => 'sometimes|nullable|date|before:today',
            'gender' => 'sometimes|nullable|in:male,female,other,prefer_not_to_say',
            'bio' => 'sometimes|nullable|string|max:500',
            'location' => 'sometimes|nullable|string|max:255',
            'website' => 'sometimes|nullable|url|max:255',
            'timezone' => 'sometimes|nullable|string|max:50',

            // Core profile specific fields
            'core_profile' => 'sometimes|array',
            'core_profile.occupation' => 'sometimes|nullable|string|max:100',
            'core_profile.company' => 'sometimes|nullable|string|max:100',
            'core_profile.linkedin_url' => 'sometimes|nullable|url|max:255',
            'core_profile.twitter_url' => 'sometimes|nullable|url|max:255',
            'core_profile.instagram_url' => 'sometimes|nullable|url|max:255',
            'core_profile.facebook_url' => 'sometimes|nullable|url|max:255',
            'core_profile.experience_level' => 'sometimes|nullable|in:beginner,intermediate,advanced,expert',
            'core_profile.education' => 'sometimes|nullable|string|max:255',
            'core_profile.languages_spoken' => 'sometimes|nullable|array',
            'core_profile.languages_spoken.*' => 'string|max:50',
            'core_profile.availability_status' => 'sometimes|nullable|in:available,busy,away',
            'core_profile.preferred_contact_method' => 'sometimes|nullable|in:email,phone,app',
            'core_profile.visibility_settings' => 'sometimes|nullable|array',
            'core_profile.emergency_contact_name' => 'sometimes|nullable|string|max:100',
            'core_profile.emergency_contact_phone' => 'sometimes|nullable|string|max:20',
            'core_profile.emergency_contact_relationship' => 'sometimes|nullable|string|max:50',

            // Profile image
            'profile_image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
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
            'email.unique' => 'This email address is already taken.',
            'phone.regex' => 'Please enter a valid phone number.',
            'date_of_birth.before' => 'Date of birth must be in the past.',
            'profile_image.image' => 'Profile image must be a valid image file.',
            'profile_image.max' => 'Profile image must not be larger than 2MB.',
            'core_profile.languages_spoken.*.max' => 'Each language must not exceed 50 characters.',
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
            'first_name' => 'first name',
            'last_name' => 'last name',
            'date_of_birth' => 'date of birth',
            'core_profile.occupation' => 'occupation',
            'core_profile.company' => 'company',
            'core_profile.linkedin_url' => 'LinkedIn URL',
            'core_profile.twitter_url' => 'Twitter URL',
            'core_profile.instagram_url' => 'Instagram URL',
            'core_profile.facebook_url' => 'Facebook URL',
            'core_profile.experience_level' => 'experience level',
            'core_profile.education' => 'education',
            'core_profile.languages_spoken' => 'languages spoken',
            'core_profile.availability_status' => 'availability status',
            'core_profile.preferred_contact_method' => 'preferred contact method',
            'core_profile.emergency_contact_name' => 'emergency contact name',
            'core_profile.emergency_contact_phone' => 'emergency contact phone',
            'core_profile.emergency_contact_relationship' => 'emergency contact relationship',
            'profile_image' => 'profile image',
        ];
    }
}
