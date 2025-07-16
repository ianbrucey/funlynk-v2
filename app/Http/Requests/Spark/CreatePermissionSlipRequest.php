<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Create Permission Slip Request
 *
 * Validates data for creating permission slips for confirmed bookings.
 */
class CreatePermissionSlipRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->can('create', \App\Models\Spark\PermissionSlip::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'booking_id' => [
                'required',
                'integer',
                'exists:bookings,id',
                function ($attribute, $value, $fail) {
                    $booking = \App\Models\Spark\Booking::find($value);
                    if ($booking && $booking->status !== 'confirmed') {
                        $fail('Permission slips can only be created for confirmed bookings.');
                    }
                },
            ],
            'template_id' => [
                'sometimes',
                'integer',
                'exists:permission_slip_templates,id',
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $template = \App\Models\Spark\PermissionSlipTemplate::find($value);
                        if ($template && !$template->is_active) {
                            $fail('The selected template is not active.');
                        }
                    }
                },
            ],
            'student_ids' => [
                'sometimes',
                'array',
                'min:1',
            ],
            'student_ids.*' => [
                'integer',
                'exists:booking_students,id',
                function ($attribute, $value, $fail) {
                    $bookingId = $this->input('booking_id');
                    if ($bookingId) {
                        $student = \App\Models\Spark\BookingStudent::find($value);
                        if ($student && $student->booking_id != $bookingId) {
                            $fail('Student does not belong to the specified booking.');
                        }
                    }
                },
            ],
            'send_emails' => [
                'sometimes',
                'boolean',
            ],
            'custom_message' => [
                'sometimes',
                'string',
                'max:1000',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'booking_id.required' => 'A booking ID is required to create permission slips.',
            'booking_id.exists' => 'The specified booking does not exist.',
            'template_id.exists' => 'The specified template does not exist.',
            'student_ids.required' => 'At least one student must be selected.',
            'student_ids.*.exists' => 'One or more selected students do not exist.',
            'custom_message.max' => 'Custom message cannot exceed 1000 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'booking_id' => 'booking',
            'template_id' => 'template',
            'student_ids' => 'students',
            'student_ids.*' => 'student',
            'send_emails' => 'send emails',
            'custom_message' => 'custom message',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Check if permission slips already exist for selected students
            if ($this->has('student_ids') && $this->has('booking_id')) {
                $existingSlips = \App\Models\Spark\PermissionSlip::where('booking_id', $this->booking_id)
                    ->whereIn('student_id', $this->student_ids)
                    ->pluck('student_id')
                    ->toArray();

                if (!empty($existingSlips)) {
                    $validator->errors()->add(
                        'student_ids',
                        'Permission slips already exist for some of the selected students.'
                    );
                }
            }

            // Validate booking has students if no specific students selected
            if (!$this->has('student_ids') && $this->has('booking_id')) {
                $booking = \App\Models\Spark\Booking::with('students')->find($this->booking_id);
                if ($booking && $booking->students->isEmpty()) {
                    $validator->errors()->add(
                        'booking_id',
                        'The booking has no students enrolled.'
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
        if (!$this->has('send_emails')) {
            $this->merge(['send_emails' => true]);
        }
    }
}
