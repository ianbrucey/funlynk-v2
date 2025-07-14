<?php

namespace App\Http\Resources\Core;

use App\Http\Resources\BaseResource;
use Illuminate\Http\Request;

/**
 * Event Comment Resource
 * 
 * Transforms event comment data for API responses
 */
class EventCommentResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'content' => $this->content,
            'formatted_content' => $this->formatted_content,
            'is_approved' => $this->is_approved,
            'is_reply' => $this->is_reply,
            'parent_id' => $this->parent_id,

            // Author information
            'author' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'first_name' => $this->user->first_name,
                    'last_name' => $this->user->last_name,
                    'full_name' => $this->user->first_name . ' ' . $this->user->last_name,
                    'profile_image_url' => $this->user->profile_image_url,
                    'is_verified' => $this->user->hasVerifiedEmail(),
                    'is_event_host' => $this->user->id === $this->event->host_id,
                ];
            }),

            // Event information (minimal)
            'event' => $this->whenLoaded('event', function () {
                return [
                    'id' => $this->event->id,
                    'title' => $this->event->title,
                ];
            }),

            // Parent comment information (for replies)
            'parent_comment' => $this->whenLoaded('parent', function () {
                return [
                    'id' => $this->parent->id,
                    'author_name' => $this->parent->user->first_name . ' ' . $this->parent->user->last_name,
                    'content_preview' => substr($this->parent->content, 0, 100) . (strlen($this->parent->content) > 100 ? '...' : ''),
                ];
            }),

            // Replies (for top-level comments)
            'replies' => $this->when(
                !$this->is_reply && $this->relationLoaded('replies'),
                function () {
                    return EventCommentResource::collection(
                        $this->replies->where('is_approved', true)->sortBy('created_at')
                    );
                }
            ),

            'replies_count' => $this->when(
                !$this->is_reply,
                $this->replies_count
            ),

            // Mentions in the comment
            'mentions' => $this->getMentions(),

            // User permissions
            'permissions' => $this->when(
                auth()->check(),
                function () {
                    return [
                        'can_edit' => $this->canBeEditedBy(auth()->user()),
                        'can_delete' => $this->canBeDeletedBy(auth()->user()),
                        'can_reply' => auth()->check() && $this->event->canBeViewedBy(auth()->user()),
                        'can_approve' => auth()->user()->hasRole('admin') || 
                                       $this->event->host_id === auth()->id(),
                        'is_author' => auth()->id() === $this->user_id,
                    ];
                }
            ),

            // Timestamps
            ...$this->timestamps(),
        ];
    }
}
