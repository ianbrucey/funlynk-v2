<?php

namespace App\Http\Requests\Core;

use Illuminate\Foundation\Http\FormRequest;

class CreateActivityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'activity_type' => 'required|string|in:follow,event_created,event_joined,event_commented,event_shared,profile_updated,interest_added,achievement_earned',
            'activityable_type' => 'sometimes|string',
            'activityable_id' => 'sometimes|integer',
            'activity_text' => 'sometimes|string|max:500',
            'activity_data' => 'sometimes|array',
            'privacy_level' => 'sometimes|string|in:public,friends,private',
            'engagement_score' => 'sometimes|integer|min:0',
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
            'activity_type.required' => 'Activity type is required.',
            'activity_type.in' => 'Invalid activity type selected.',
            'activity_text.max' => 'Activity text cannot exceed 500 characters.',
            'privacy_level.in' => 'Invalid privacy level selected.',
            'engagement_score.min' => 'Engagement score cannot be negative.',
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
            'activity_type' => 'activity type',
            'activityable_type' => 'related content type',
            'activityable_id' => 'related content ID',
            'activity_text' => 'activity description',
            'activity_data' => 'activity data',
            'privacy_level' => 'privacy level',
            'engagement_score' => 'engagement score',
        ];
    }
}
