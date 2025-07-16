<?php

namespace App\Http\Resources\Core;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FriendSuggestionResource extends JsonResource
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
            'suggestion_type' => $this->suggestion_type,
            'suggestion_type_label' => $this->suggestion_type_label,
            'confidence_score' => $this->confidence_score,
            'confidence_percentage' => $this->confidence_percentage,
            'suggestion_reasons' => $this->suggestion_reasons,
            'primary_reason' => $this->primary_reason,
            'mutual_connections' => $this->mutual_connections,
            'mutual_friends_count' => $this->mutual_friends_count,
            'shared_interests_count' => $this->shared_interests_count,
            'shared_events_count' => $this->shared_events_count,
            'is_dismissed' => $this->is_dismissed,
            'dismissed_at' => $this->dismissed_at?->toISOString(),
            'is_contacted' => $this->is_contacted,
            'contacted_at' => $this->contacted_at?->toISOString(),
            'is_followed' => $this->is_followed,
            'followed_at' => $this->followed_at?->toISOString(),
            'expires_at' => $this->expires_at?->toISOString(),
            'is_expired' => $this->isExpired(),
            'is_active' => $this->isActive(),
            'has_mutual_friends' => $this->hasMutualFriends(),
            'has_shared_interests' => $this->hasSharedInterests(),
            'has_shared_events' => $this->hasSharedEvents(),
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
            
            'suggested_user' => $this->whenLoaded('suggestedUser', function () {
                return [
                    'id' => $this->suggestedUser->id,
                    'name' => $this->suggestedUser->name,
                    'avatar' => $this->suggestedUser->avatar,
                    'bio' => $this->suggestedUser->bio,
                    'location' => $this->suggestedUser->coreProfile?->location,
                    'interests' => $this->suggestedUser->interests?->pluck('interest')->toArray(),
                    'followers_count' => $this->suggestedUser->followers_count ?? 0,
                    'following_count' => $this->suggestedUser->following_count ?? 0,
                    'events_hosted' => $this->suggestedUser->coreProfile?->events_hosted ?? 0,
                    'events_attended' => $this->suggestedUser->coreProfile?->events_attended ?? 0,
                ];
            }),
            
            // Actions
            'can_dismiss' => !$this->is_dismissed && $this->isActive(),
            'can_contact' => !$this->is_contacted && $this->isActive(),
            'can_follow' => !$this->is_followed && $this->isActive(),
        ];
    }
}
