<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Create District Request
 * 
 * Validates district creation data for Spark educational programs
 */
class CreateDistrictRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasRole(['admin', 'spark_admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:districts,name',
            'code' => 'required|string|max:20|unique:districts,code',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'required|string|size:2',
            'zip_code' => 'required|string|max:10',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'contact_info' => 'nullable|array',
            'contact_info.superintendent_name' => 'nullable|string|max:255',
            'contact_info.superintendent_email' => 'nullable|email|max:255',
            'contact_info.superintendent_phone' => 'nullable|string|max:20',
            'contact_info.main_contact_name' => 'nullable|string|max:255',
            'contact_info.main_contact_email' => 'nullable|email|max:255',
            'contact_info.main_contact_phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
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
            'name.required' => 'District name is required.',
            'name.unique' => 'A district with this name already exists.',
            'code.required' => 'District code is required.',
            'code.unique' => 'A district with this code already exists.',
            'address.required' => 'District address is required.',
            'city.required' => 'City is required.',
            'state.required' => 'State is required.',
            'state.size' => 'State must be a 2-letter code.',
            'zip_code.required' => 'ZIP code is required.',
            'email.email' => 'Please enter a valid email address.',
            'website.url' => 'Please enter a valid website URL.',
            'contact_info.superintendent_email.email' => 'Please enter a valid superintendent email.',
            'contact_info.main_contact_email.email' => 'Please enter a valid main contact email.',
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
            'name' => 'district name',
            'code' => 'district code',
            'zip_code' => 'ZIP code',
            'contact_info.superintendent_name' => 'superintendent name',
            'contact_info.superintendent_email' => 'superintendent email',
            'contact_info.superintendent_phone' => 'superintendent phone',
            'contact_info.main_contact_name' => 'main contact name',
            'contact_info.main_contact_email' => 'main contact email',
            'contact_info.main_contact_phone' => 'main contact phone',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        // Normalize state to uppercase
        if ($this->has('state')) {
            $this->merge([
                'state' => strtoupper($this->input('state')),
            ]);
        }

        // Normalize code to uppercase
        if ($this->has('code')) {
            $this->merge([
                'code' => strtoupper(trim($this->input('code'))),
            ]);
        }

        // Set default active status
        $this->merge([
            'is_active' => $this->boolean('is_active', true),
        ]);
    }
}
