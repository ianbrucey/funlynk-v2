<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'preferred_date' => ['sometimes', 'date', 'after_or_equal:today'],
            'preferred_time' => ['sometimes', 'date_format:H:i'],
            'student_count' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'special_requests' => ['sometimes', 'string', 'max:1000'],
            'contact_info' => ['sometimes', 'array'],
            'contact_info.primary_contact_name' => ['required_with:contact_info', 'string', 'max:255'],
            'contact_info.primary_contact_email' => ['required_with:contact_info', 'email', 'max:255'],
            'contact_info.primary_contact_phone' => ['required_with:contact_info', 'string', 'max:20'],
            'contact_info.secondary_contact_name' => ['sometimes', 'string', 'max:255'],
            'contact_info.secondary_contact_email' => ['sometimes', 'email', 'max:255'],
            'contact_info.secondary_contact_phone' => ['sometimes', 'string', 'max:20'],
            'notes' => ['sometimes', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'preferred_date.after_or_equal' => 'Preferred date must be today or in the future',
            'student_count.min' => 'At least 1 student is required',
            'student_count.max' => 'Maximum 100 students allowed per booking',
            'contact_info.primary_contact_name.required_with' => 'Primary contact name is required when updating contact info',
            'contact_info.primary_contact_email.required_with' => 'Primary contact email is required when updating contact info',
            'contact_info.primary_contact_phone.required_with' => 'Primary contact phone is required when updating contact info',
        ];
    }
}
