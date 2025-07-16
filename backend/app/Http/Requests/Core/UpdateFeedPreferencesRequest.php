<?php

namespace App\Http\Requests\Core;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFeedPreferencesRequest extends FormRequest
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
            'activity_types' => 'required|array|min:1',
            'activity_types.*' => 'string|in:follow,event_created,event_joined,event_commented,event_shared,profile_updated,interest_added,achievement_earned',
            'privacy_preferences' => 'sometimes|array',
            'privacy_preferences.default_privacy' => 'string|in:public,friends,private',
            'privacy_preferences.allow_discovery' => 'boolean',
            'privacy_preferences.show_in_trending' => 'sometimes|boolean',
            'notification_preferences' => 'sometimes|array',
            'notification_preferences.email_digest' => 'boolean',
            'notification_preferences.push_notifications' => 'boolean',
            'notification_preferences.digest_frequency' => 'sometimes|string|in:daily,weekly,never',
            'feed_settings' => 'sometimes|array',
            'feed_settings.auto_refresh' => 'sometimes|boolean',
            'feed_settings.show_read_activities' => 'sometimes|boolean',
            'feed_settings.items_per_page' => 'sometimes|integer|min:10|max:100',
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
            'activity_types.required' => 'At least one activity type must be selected.',
            'activity_types.min' => 'At least one activity type must be selected.',
            'activity_types.*.in' => 'Invalid activity type selected.',
            'privacy_preferences.default_privacy.in' => 'Invalid default privacy level selected.',
            'notification_preferences.digest_frequency.in' => 'Invalid digest frequency selected.',
            'feed_settings.items_per_page.min' => 'Items per page must be at least 10.',
            'feed_settings.items_per_page.max' => 'Items per page cannot exceed 100.',
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
            'activity_types' => 'activity types',
            'privacy_preferences.default_privacy' => 'default privacy level',
            'privacy_preferences.allow_discovery' => 'allow discovery setting',
            'notification_preferences.email_digest' => 'email digest setting',
            'notification_preferences.push_notifications' => 'push notifications setting',
            'notification_preferences.digest_frequency' => 'digest frequency',
            'feed_settings.auto_refresh' => 'auto refresh setting',
            'feed_settings.show_read_activities' => 'show read activities setting',
            'feed_settings.items_per_page' => 'items per page',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Ensure at least one activity type is selected
            $activityTypes = $this->input('activity_types', []);
            if (empty($activityTypes)) {
                $validator->errors()->add('activity_types', 'At least one activity type must be selected.');
            }
        });
    }
}
