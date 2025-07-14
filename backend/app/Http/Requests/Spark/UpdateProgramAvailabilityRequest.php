<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Update Program Availability Request.
 *
 * Validates program availability slot update data
 */
class UpdateProgramAvailabilityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasRole(['admin', 'spark_admin', 'program_coordinator']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $availabilityId = $this->route('availabilityId');

        return [
            'date' => 'sometimes|date|after_or_equal:today',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time',
            'max_bookings' => 'sometimes|integer|min:1|max:100',
            'current_bookings' => 'sometimes|integer|min:0|lte:max_bookings',
            'is_available' => 'sometimes|boolean',
            'notes' => 'nullable|string|max:500',
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
            'date.after_or_equal' => 'Date must be today or in the future.',
            'start_time.date_format' => 'Start time must be in HH:MM format.',
            'end_time.date_format' => 'End time must be in HH:MM format.',
            'end_time.after' => 'End time must be after start time.',
            'max_bookings.min' => 'At least 1 booking must be allowed.',
            'max_bookings.max' => 'Maximum bookings cannot exceed 100.',
            'current_bookings.lte' => 'Current bookings cannot exceed maximum bookings.',
            'notes.max' => 'Notes must not exceed 500 characters.',
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
            'start_time' => 'start time',
            'end_time' => 'end time',
            'max_bookings' => 'maximum bookings',
            'current_bookings' => 'current bookings',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Validate time range doesn't exceed 8 hours
        if ($this->has('start_time') && $this->has('end_time')) {
            $startTime = \Carbon\Carbon::createFromFormat('H:i', $this->input('start_time'));
            $endTime = \Carbon\Carbon::createFromFormat('H:i', $this->input('end_time'));

            if ($endTime->diffInHours($startTime) > 8) {
                $this->merge([
                    'end_time' => $startTime->copy()->addHours(8)->format('H:i'),
                ]);
            }
        }
    }

    /**
     * Configure the validator instance.
     *
     * @param \Illuminate\Validation\Validator $validator
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $availabilityId = $this->route('availabilityId');

            // Check for time conflicts with existing availability (excluding current record)
            if ($this->has(['date', 'start_time', 'end_time'])) {
                $availability = \App\Models\Spark\ProgramAvailability::find($availabilityId);

                if ($availability) {
                    $conflicts = \App\Models\Spark\ProgramAvailability::where('program_id', $availability->program_id)
                        ->where('id', '!=', $availabilityId)
                        ->where('date', $this->input('date', $availability->date))
                        ->where(function ($query) use ($availability) {
                            $startTime = $this->input('start_time', $availability->start_time->format('H:i'));
                            $endTime = $this->input('end_time', $availability->end_time->format('H:i'));

                            $query->whereBetween('start_time', [$startTime, $endTime])
                                  ->orWhereBetween('end_time', [$startTime, $endTime])
                                  ->orWhere(function ($q) use ($startTime, $endTime) {
                                      $q->where('start_time', '<=', $startTime)
                                        ->where('end_time', '>=', $endTime);
                                  });
                        })
                        ->exists();

                    if ($conflicts) {
                        $validator->errors()->add('start_time', 'This time slot conflicts with existing availability.');
                    }
                }
            }

            // Prevent reducing max_bookings below current_bookings
            if ($this->has('max_bookings')) {
                $availability = \App\Models\Spark\ProgramAvailability::find($availabilityId);

                if ($availability && $this->input('max_bookings') < $availability->current_bookings) {
                    $validator->errors()->add('max_bookings', 'Cannot reduce maximum bookings below current bookings (' . $availability->current_bookings . ').');
                }
            }
        });
    }
}
