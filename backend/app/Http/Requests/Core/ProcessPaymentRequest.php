<?php

namespace App\Http\Requests\Core;

use Illuminate\Foundation\Http\FormRequest;

class ProcessPaymentRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'payment_method_id' => 'required|string',
            'save_payment_method' => 'sometimes|boolean',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'payment_method_id.required' => 'Payment method is required',
            'save_payment_method.boolean' => 'Save payment method must be true or false',
        ];
    }
}
