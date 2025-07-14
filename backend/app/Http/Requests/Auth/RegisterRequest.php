<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => [
                'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[a-zA-Z\s\-\'\.]+$/',
            ],
            'last_name' => [
                'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[a-zA-Z\s\-\'\.]+$/',
            ],
            'email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:255',
                Rule::unique('users', 'email'),
            ],
            'password' => [
                'required',
                'string',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
                'confirmed',
            ],
            'password_confirmation' => [
                'required',
                'string',
            ],
            'phone' => [
                'nullable',
                'string',
                'regex:/^[0-9\+\-\s\(\)]+$/',
                'min:10',
                'max:20',
            ],
            'country_code' => [
                'nullable',
                'string',
                'size:2',
                'regex:/^[A-Z]{2}$/',
            ],
            'date_of_birth' => [
                'nullable',
                'date',
                'before:today',
                'after:' . now()->subYears(120)->format('Y-m-d'),
            ],
            'gender' => [
                'nullable',
                Rule::in(['male', 'female', 'other', 'prefer_not_to_say']),
            ],
            'timezone' => [
                'nullable',
                'string',
                'max:50',
                Rule::in(timezone_identifiers_list()),
            ],
            'language' => [
                'nullable',
                'string',
                'size:2',
                'regex:/^[a-z]{2}$/',
            ],
            'terms_accepted' => [
                'required',
                'accepted',
            ],
            'privacy_accepted' => [
                'required',
                'accepted',
            ],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'The first name is required.',
            'first_name.string' => 'The first name must be a valid string.',
            'first_name.min' => 'The first name must be at least 2 characters long.',
            'first_name.max' => 'The first name must not exceed 255 characters.',
            'first_name.regex' => 'The first name may only contain letters, spaces, hyphens, apostrophes, and periods.',
            'last_name.required' => 'The last name is required.',
            'last_name.string' => 'The last name must be a valid string.',
            'last_name.min' => 'The last name must be at least 2 characters long.',
            'last_name.max' => 'The last name must not exceed 255 characters.',
            'last_name.regex' => 'The last name may only contain letters, spaces, hyphens, apostrophes, and periods.',
            'email.required' => 'The email address is required.',
            'email.string' => 'The email address must be a valid string.',
            'email.email' => 'The email address must be a valid email format.',
            'email.max' => 'The email address must not exceed 255 characters.',
            'email.unique' => 'The email address has already been taken.',
            'password.required' => 'The password is required.',
            'password.string' => 'The password must be a valid string.',
            'password.confirmed' => 'The password confirmation does not match.',
            'password_confirmation.required' => 'The password confirmation is required.',
            'password_confirmation.string' => 'The password confirmation must be a valid string.',
            'phone.string' => 'The phone number must be a valid string.',
            'phone.regex' => 'The phone number format is invalid.',
            'phone.min' => 'The phone number must be at least 10 characters long.',
            'phone.max' => 'The phone number must not exceed 20 characters.',
            'country_code.string' => 'The country code must be a valid string.',
            'country_code.size' => 'The country code must be exactly 2 characters.',
            'country_code.regex' => 'The country code must be a valid ISO 3166-1 alpha-2 format.',
            'date_of_birth.date' => 'The date of birth must be a valid date.',
            'date_of_birth.before' => 'The date of birth must be before today.',
            'date_of_birth.after' => 'The date of birth must be within the last 120 years.',
            'gender.in' => 'The selected gender is invalid.',
            'timezone.string' => 'The timezone must be a valid string.',
            'timezone.max' => 'The timezone must not exceed 50 characters.',
            'timezone.in' => 'The selected timezone is invalid.',
            'language.string' => 'The language must be a valid string.',
            'language.size' => 'The language must be exactly 2 characters.',
            'language.regex' => 'The language must be a valid ISO 639-1 language code.',
            'terms_accepted.required' => 'You must accept the terms and conditions.',
            'terms_accepted.accepted' => 'You must accept the terms and conditions.',
            'privacy_accepted.required' => 'You must accept the privacy policy.',
            'privacy_accepted.accepted' => 'You must accept the privacy policy.',
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
            'email' => 'email address',
            'password' => 'password',
            'password_confirmation' => 'password confirmation',
            'phone' => 'phone number',
            'country_code' => 'country code',
            'date_of_birth' => 'date of birth',
            'gender' => 'gender',
            'timezone' => 'timezone',
            'language' => 'language',
            'terms_accepted' => 'terms and conditions',
            'privacy_accepted' => 'privacy policy',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param \Illuminate\Validation\Validator $validator
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Check if date of birth indicates user is under 13
            if ($this->filled('date_of_birth')) {
                $age = \Carbon\Carbon::parse($this->date_of_birth)->age;
                if ($age < 13) {
                    $validator->errors()->add('date_of_birth', 'You must be at least 13 years old to register.');
                }
            }

            // Validate phone and country code together
            if ($this->filled('phone') && !$this->filled('country_code')) {
                $validator->errors()->add(
                    'country_code',
                    'The country code is required when phone number is provided.'
                );
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim($this->first_name . ' ' . $this->last_name),
            'email' => strtolower($this->email),
            'country_code' => $this->country_code ? strtoupper($this->country_code) : null,
            'language' => $this->language ? strtolower($this->language) : 'en',
            'timezone' => $this->timezone ?? 'UTC',
        ]);
    }
}
