<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Bulk Reminder Request
 *
 * Validates data for sending bulk reminder emails for unsigned permission slips.
 */
class BulkReminderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->can('manage', \App\Models\Spark\PermissionSlip::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'permission_slip_ids' => [
                'required',
                'array',
                'min:1',
                'max:100', // Limit bulk operations
            ],
            'permission_slip_ids.*' => [
                'integer',
                'exists:permission_slips,id',
                function ($attribute, $value, $fail) {
                    $slip = \App\Models\Spark\PermissionSlip::find($value);
                    if ($slip && $slip->is_signed) {
                        $fail('Cannot send reminder for signed permission slip (ID: ' . $value . ').');
                    }
                },
            ],
            'reminder_type' => [
                'sometimes',
                'string',
                Rule::in(['standard', 'urgent', 'final', 'overdue']),
            ],
            'custom_message' => [
                'sometimes',
                'string',
                'max:1000',
            ],
            'send_immediately' => [
                'sometimes',
                'boolean',
            ],
            'schedule_for' => [
                'sometimes',
                'date',
                'after:now',
                'required_if:send_immediately,false',
            ],
            'filters' => [
                'sometimes',
                'array',
            ],
            'filters.school_id' => [
                'sometimes',
                'integer',
                'exists:schools,id',
            ],
            'filters.booking_id' => [
                'sometimes',
                'integer',
                'exists:bookings,id',
            ],
            'filters.days_until_event' => [
                'sometimes',
                'integer',
                'min:0',
                'max:30',
            ],
            'filters.reminder_count_max' => [
                'sometimes',
                'integer',
                'min:0',
                'max:10',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'permission_slip_ids.required' => 'At least one permission slip must be selected.',
            'permission_slip_ids.min' => 'At least one permission slip must be selected.',
            'permission_slip_ids.max' => 'Cannot process more than 100 permission slips at once.',
            'permission_slip_ids.*.exists' => 'One or more selected permission slips do not exist.',
            'reminder_type.in' => 'Invalid reminder type selected.',
            'custom_message.max' => 'Custom message cannot exceed 1000 characters.',
            'schedule_for.after' => 'Scheduled time must be in the future.',
            'schedule_for.required_if' => 'Schedule time is required when not sending immediately.',
            'filters.school_id.exists' => 'Selected school does not exist.',
            'filters.booking_id.exists' => 'Selected booking does not exist.',
            'filters.days_until_event.min' => 'Days until event must be 0 or greater.',
            'filters.days_until_event.max' => 'Days until event cannot exceed 30.',
            'filters.reminder_count_max.min' => 'Maximum reminder count must be 0 or greater.',
            'filters.reminder_count_max.max' => 'Maximum reminder count cannot exceed 10.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'permission_slip_ids' => 'permission slips',
            'permission_slip_ids.*' => 'permission slip',
            'reminder_type' => 'reminder type',
            'custom_message' => 'custom message',
            'send_immediately' => 'send immediately',
            'schedule_for' => 'schedule time',
            'filters.school_id' => 'school',
            'filters.booking_id' => 'booking',
            'filters.days_until_event' => 'days until event',
            'filters.reminder_count_max' => 'maximum reminder count',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validate permission slips are unsigned
            if ($this->has('permission_slip_ids')) {
                $signedSlips = \App\Models\Spark\PermissionSlip::whereIn('id', $this->permission_slip_ids)
                    ->where('is_signed', true)
                    ->pluck('id')
                    ->toArray();

                if (!empty($signedSlips)) {
                    $validator->errors()->add(
                        'permission_slip_ids',
                        'Cannot send reminders for signed permission slips: ' . implode(', ', $signedSlips)
                    );
                }
            }

            // Validate reminder frequency limits
            if ($this->has('permission_slip_ids')) {
                $highReminderSlips = \App\Models\Spark\PermissionSlip::whereIn('id', $this->permission_slip_ids)
                    ->where('reminder_sent_count', '>=', 5)
                    ->pluck('id')
                    ->toArray();

                if (!empty($highReminderSlips)) {
                    $validator->errors()->add(
                        'permission_slip_ids',
                        'Some permission slips have already received maximum reminders: ' . 
                        implode(', ', $highReminderSlips)
                    );
                }
            }

            // Validate recent reminder sending
            if ($this->has('permission_slip_ids') && $this->input('send_immediately', true)) {
                $recentReminderSlips = \App\Models\Spark\PermissionSlip::whereIn('id', $this->permission_slip_ids)
                    ->where('last_reminder_sent_at', '>', now()->subHours(6))
                    ->pluck('id')
                    ->toArray();

                if (!empty($recentReminderSlips)) {
                    $validator->errors()->add(
                        'permission_slip_ids',
                        'Some permission slips received reminders within the last 6 hours: ' . 
                        implode(', ', $recentReminderSlips)
                    );
                }
            }

            // Validate filters consistency
            if ($this->has('filters.booking_id') && $this->has('filters.school_id')) {
                $booking = \App\Models\Spark\Booking::find($this->input('filters.booking_id'));
                if ($booking && $booking->school_id != $this->input('filters.school_id')) {
                    $validator->errors()->add(
                        'filters.booking_id',
                        'Selected booking does not belong to the selected school.'
                    );
                }
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        if (!$this->has('reminder_type')) {
            $this->merge(['reminder_type' => 'standard']);
        }

        if (!$this->has('send_immediately')) {
            $this->merge(['send_immediately' => true]);
        }

        // Remove duplicates from permission slip IDs
        if ($this->has('permission_slip_ids')) {
            $this->merge([
                'permission_slip_ids' => array_unique($this->permission_slip_ids)
            ]);
        }

        // Clean up filters
        if ($this->has('filters')) {
            $filters = array_filter($this->filters, function ($value) {
                return $value !== null && $value !== '';
            });
            $this->merge(['filters' => $filters]);
        }
    }

    /**
     * Get validated data with additional processing.
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);

        // Add computed fields
        if (is_null($key)) {
            $validated['user_id'] = auth()->id();
            $validated['requested_at'] = now();
            
            // Determine urgency based on reminder type
            $validated['is_urgent'] = in_array($validated['reminder_type'] ?? 'standard', ['urgent', 'final']);
            
            // Add batch identifier for tracking
            $validated['batch_id'] = \Illuminate\Support\Str::uuid();
        }

        return $key ? data_get($validated, $key, $default) : $validated;
    }
}
