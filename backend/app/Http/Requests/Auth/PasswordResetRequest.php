<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class PasswordResetRequest extends FormRequest
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
        // Determine if this is a password reset request or password update request
        if ($this->routeIs('password.reset')) {
            return $this->getPasswordResetRules();
        }

        return $this->getPasswordRequestRules();
    }

    /**
     * Get the validation rules for password reset request (sending email).
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    protected function getPasswordRequestRules(): array
    {
        return [
            'email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:255',
                Rule::exists('users', 'email')->where(function ($query) {
                    return $query->where('is_active', true);
                }),
            ],
        ];
    }

    /**
     * Get the validation rules for password reset (with token).
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    protected function getPasswordResetRules(): array
    {
        return [
            'token' => [
                'required',
                'string',
                'min:1',
                'max:255',
            ],
            'email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:255',
                Rule::exists('users', 'email')->where(function ($query) {
                    return $query->where('is_active', true);
                }),
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
            'token.required' => 'The password reset token is required.',
            'token.string' => 'The password reset token must be a valid string.',
            'token.min' => 'The password reset token is invalid.',
            'token.max' => 'The password reset token is invalid.',
            'email.required' => 'The email address is required.',
            'email.string' => 'The email address must be a valid string.',
            'email.email' => 'The email address must be a valid email format.',
            'email.max' => 'The email address must not exceed 255 characters.',
            'email.exists' => 'We cannot find a user with that email address or the account is inactive.',
            'password.required' => 'The new password is required.',
            'password.string' => 'The new password must be a valid string.',
            'password.confirmed' => 'The password confirmation does not match.',
            'password_confirmation.required' => 'The password confirmation is required.',
            'password_confirmation.string' => 'The password confirmation must be a valid string.',
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
            'token' => 'password reset token',
            'email' => 'email address',
            'password' => 'new password',
            'password_confirmation' => 'password confirmation',
        ];
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
            if ($this->filled('email')) {
                $user = \App\Models\User::where('email', $this->email)->first();

                if ($user && !$user->is_active) {
                    $validator->errors()->add('email', 'This account has been deactivated and cannot reset password.');
                }
            }

            // Additional validation for password reset with token
            if ($this->routeIs('password.reset') && $this->filled(['token', 'email'])) {
                $this->validatePasswordResetToken($validator);
            }
        });
    }

    /**
     * Validate the password reset token.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    protected function validatePasswordResetToken($validator): void
    {
        $tokenRecord = \DB::table('password_reset_tokens')
            ->where('email', $this->email)
            ->first();

        if (!$tokenRecord) {
            $validator->errors()->add('token', 'This password reset token is invalid.');
            return;
        }

        if (!\Hash::check($this->token, $tokenRecord->token)) {
            $validator->errors()->add('token', 'This password reset token is invalid.');
            return;
        }

        // Check if token has expired (default expiry is 60 minutes)
        $expiry = config('auth.passwords.users.expire', 60);
        $tokenCreatedAt = \Carbon\Carbon::parse($tokenRecord->created_at);

        if ($tokenCreatedAt->addMinutes($expiry)->isPast()) {
            $validator->errors()->add('token', 'This password reset token has expired.');
        }
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        if ($this->filled('email')) {
            $this->merge([
                'email' => strtolower($this->email),
            ]);
        }
    }
}
