<?php

namespace App\Http\Requests\Core;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'recipient_id' => 'required|integer|exists:users,id|different:' . auth()->id(),
            'message_content' => 'required|string|max:2000',
            'message_type' => 'sometimes|string|in:text,image,file,location,event_share',
            'attachments' => 'sometimes|array|max:5',
            'attachments.*' => 'string|max:255',
            'reply_to_id' => 'sometimes|integer|exists:direct_messages,id',
            'metadata' => 'sometimes|array',
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
            'recipient_id.required' => 'Recipient is required.',
            'recipient_id.exists' => 'Selected recipient does not exist.',
            'recipient_id.different' => 'You cannot send a message to yourself.',
            'message_content.required' => 'Message content is required.',
            'message_content.max' => 'Message content cannot exceed 2000 characters.',
            'message_type.in' => 'Invalid message type selected.',
            'attachments.max' => 'You can attach a maximum of 5 files.',
            'reply_to_id.exists' => 'The message you are replying to does not exist.',
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
            'recipient_id' => 'recipient',
            'message_content' => 'message content',
            'message_type' => 'message type',
            'attachments' => 'attachments',
            'reply_to_id' => 'reply to message',
            'metadata' => 'message metadata',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Additional validation logic can be added here
            // For example, checking if users can message each other
            if ($this->recipient_id && auth()->check()) {
                // Check if recipient has blocked the sender
                // This would require a user_blocks table implementation
            }
        });
    }
}
