<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Create Program Availability Request
 * 
 * Validates program availability slot creation data
 */
class CreateProgramAvailabilityRequest extends FormRequest
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
        return [
            'program_id' => 'required|integer|exists:spark_programs,id',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'max_bookings' => 'required|integer|min:1|max:100',
            'current_bookings' => 'integer|min:0|lte:max_bookings',
            'is_available' => 'boolean',
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
            'program_id.required' => 'Program is required.',
            'program_id.exists' => 'Selected program does not exist.',
            'date.required' => 'Date is required.',
            'date.after_or_equal' => 'Date must be today or in the future.',
            'start_time.required' => 'Start time is required.',
            'start_time.date_format' => 'Start time must be in HH:MM format.',
            'end_time.required' => 'End time is required.',
            'end_time.date_format' => 'End time must be in HH:MM format.',
            'end_time.after' => 'End time must be after start time.',
            'max_bookings.required' => 'Maximum bookings is required.',
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
            'program_id' => 'program',
            'start_time' => 'start time',
            'end_time' => 'end time',
            'max_bookings' => 'maximum bookings',
            'current_bookings' => 'current bookings',
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
            'current_bookings' => $this->input('current_bookings', 0),
            'is_available' => $this->boolean('is_available', true),
        ]);

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
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Check for time conflicts with existing availability
            if ($this->has(['program_id', 'date', 'start_time', 'end_time'])) {
                $conflicts = \App\Models\Spark\ProgramAvailability::where('program_id', $this->input('program_id'))
                    ->where('date', $this->input('date'))
                    ->where(function ($query) {
                        $startTime = $this->input('start_time');
                        $endTime = $this->input('end_time');
                        
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
        });
    }
}
