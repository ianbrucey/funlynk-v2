<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;

class CreateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_id' => ['required', 'exists:schools,id'],
            'program_id' => ['required', 'exists:spark_programs,id'],
            'preferred_date' => ['required', 'date', 'after_or_equal:today'],
            'preferred_time' => ['required', 'date_format:H:i'],
            'student_count' => ['required', 'integer', 'min:1', 'max:100'],
            'special_requests' => ['sometimes', 'string', 'max:1000'],
            'contact_info' => ['required', 'array'],
            'contact_info.primary_contact_name' => ['required', 'string', 'max:255'],
            'contact_info.primary_contact_email' => ['required', 'email', 'max:255'],
            'contact_info.primary_contact_phone' => ['required', 'string', 'max:20'],
            'contact_info.secondary_contact_name' => ['sometimes', 'string', 'max:255'],
            'contact_info.secondary_contact_email' => ['sometimes', 'email', 'max:255'],
            'contact_info.secondary_contact_phone' => ['sometimes', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'school_id.exists' => 'Selected school does not exist',
            'program_id.exists' => 'Selected program does not exist',
            'preferred_date.after_or_equal' => 'Preferred date must be today or in the future',
            'student_count.min' => 'At least 1 student is required',
            'student_count.max' => 'Maximum 100 students allowed per booking',
            'contact_info.primary_contact_name.required' => 'Primary contact name is required',
            'contact_info.primary_contact_email.required' => 'Primary contact email is required',
            'contact_info.primary_contact_phone.required' => 'Primary contact phone is required',
        ];
    }
}
