<?php

namespace App\Http\Resources\Core;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityFeedResource extends JsonResource
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
            'activity_type' => $this->activity_type,
            'activity_type_label' => $this->activity_type_label,
            'activity_text' => $this->activity_text,
            'activity_data' => $this->activity_data,
            'privacy_level' => $this->privacy_level,
            'privacy_level_label' => $this->privacy_level_label,
            'is_read' => $this->is_read,
            'is_visible' => $this->is_visible,
            'engagement_score' => $this->engagement_score,
            'activity_timestamp' => $this->activity_timestamp->toISOString(),
            'time_ago' => $this->time_ago,
            'is_recent' => $this->isRecent(),
            'is_today' => $this->isToday(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Relationships
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'avatar' => $this->user->avatar,
                ];
            }),
            
            'actor' => $this->whenLoaded('actor', function () {
                return [
                    'id' => $this->actor->id,
                    'name' => $this->actor->name,
                    'avatar' => $this->actor->avatar,
                ];
            }),
            
            'activityable' => $this->whenLoaded('activityable', function () {
                return $this->formatActivityable();
            }),
            
            // Actions
            'can_view' => auth()->check() ? $this->canBeViewedBy(auth()->user()) : false,
            'can_hide' => auth()->check() && auth()->id() === $this->user_id,
            'can_report' => auth()->check() && auth()->id() !== $this->actor_id,
        ];
    }

    /**
     * Format the activityable relationship based on its type.
     */
    private function formatActivityable(): ?array
    {
        if (!$this->activityable) {
            return null;
        }

        $type = class_basename($this->activityable_type);

        switch ($type) {
            case 'Event':
                return [
                    'type' => 'event',
                    'id' => $this->activityable->id,
                    'title' => $this->activityable->title,
                    'description' => $this->activityable->description,
                    'event_date' => $this->activityable->event_date?->toISOString(),
                    'location' => $this->activityable->location,
                    'image' => $this->activityable->image,
                ];

            case 'UserFollow':
                return [
                    'type' => 'follow',
                    'id' => $this->activityable->id,
                    'following_user' => [
                        'id' => $this->activityable->following->id,
                        'name' => $this->activityable->following->name,
                        'avatar' => $this->activityable->following->avatar,
                    ],
                ];

            case 'EventComment':
                return [
                    'type' => 'comment',
                    'id' => $this->activityable->id,
                    'content' => $this->activityable->content,
                    'event' => [
                        'id' => $this->activityable->event->id,
                        'title' => $this->activityable->event->title,
                    ],
                ];

            default:
                return [
                    'type' => strtolower($type),
                    'id' => $this->activityable->id,
                ];
        }
    }
}
