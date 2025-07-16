<?php

namespace App\Http\Resources\Core;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DirectMessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'message_content' => $this->message_content,
            'message_type' => $this->message_type,
            'message_type_label' => $this->message_type_label,
            'attachments' => $this->attachments,
            'metadata' => $this->metadata,
            'is_read' => $this->is_read,
            'read_at' => $this->read_at?->toISOString(),
            'is_edited' => $this->is_edited,
            'edited_at' => $this->edited_at?->toISOString(),
            'is_deleted' => $this->is_deleted,
            'deleted_at' => $this->deleted_at?->toISOString(),
            'has_attachments' => $this->hasAttachments(),
            'attachment_count' => $this->getAttachmentCount(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Relationships
            'sender' => $this->whenLoaded('sender', function () {
                return [
                    'id' => $this->sender->id,
                    'name' => $this->sender->name,
                    'avatar' => $this->sender->avatar,
                ];
            }),
            
            'recipient' => $this->whenLoaded('recipient', function () {
                return [
                    'id' => $this->recipient->id,
                    'name' => $this->recipient->name,
                    'avatar' => $this->recipient->avatar,
                ];
            }),
            
            'reply_to' => $this->whenLoaded('replyTo', function () {
                return [
                    'id' => $this->replyTo->id,
                    'message_content' => $this->replyTo->message_content,
                    'sender' => [
                        'id' => $this->replyTo->sender->id,
                        'name' => $this->replyTo->sender->name,
                    ],
                    'created_at' => $this->replyTo->created_at->toISOString(),
                ];
            }),
            
            'replies_count' => $this->whenCounted('replies'),
            
            // Actions
            'can_edit' => auth()->check() && auth()->id() === $this->sender_id && $this->canBeEdited(),
            'can_delete' => auth()->check() && auth()->id() === $this->sender_id && $this->canBeDeleted(),
            'can_reply' => auth()->check() && $this->isParticipant(auth()->id()),
            'can_report' => auth()->check() && auth()->id() !== $this->sender_id && $this->isParticipant(auth()->id()),
            'is_own_message' => auth()->check() && auth()->id() === $this->sender_id,
        ];
    }
}
