<?php

namespace App\Http\Resources\Core;

use App\Http\Resources\BaseResource;
use Illuminate\Http\Request;

/**
 * Core Event Resource.
 *
 * Transforms event data for Core Funlynk API responses
 */
class EventResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'coordinates' => $this->formatCoordinates($this->latitude, $this->longitude),
            'start_time' => $this->start_time->toISOString(),
            'end_time' => $this->end_time->toISOString(),
            'duration' => $this->formatted_duration,
            'max_attendees' => $this->max_attendees,
            'available_spots' => $this->available_spots,
            'price' => $this->formatCurrency($this->price),
            'status' => $this->status,
            'status_display' => $this->status_display,
            'visibility' => $this->visibility,
            'visibility_display' => $this->visibility_display,
            'requires_approval' => $this->requires_approval,
            'is_upcoming' => $this->is_upcoming,
            'is_past' => $this->is_past,
            'is_active' => $this->is_active,
            'is_full' => $this->is_full,

            // Host information
            'host' => $this->whenLoaded('host', function () {
                return [
                    'id' => $this->host->id,
                    'first_name' => $this->host->first_name,
                    'last_name' => $this->host->last_name,
                    'full_name' => $this->host->first_name . ' ' . $this->host->last_name,
                    'profile_image_url' => $this->host->profile_image_url,
                    'is_verified' => $this->host->hasVerifiedEmail(),
                ];
            }),

            // Category information
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'description' => $this->category->description,
                    'icon' => $this->category->icon,
                    'color' => $this->category->color,
                ];
            }),

            // Tags
            'tags' => $this->whenLoaded('tags', function () {
                return $this->tags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'slug' => $tag->slug,
                        'color' => $tag->color,
                    ];
                });
            }),

            // Images
            'images' => $this->when($this->images, function () {
                return collect($this->images)->map(function ($imageUrl) {
                    return $this->formatFile($imageUrl);
                });
            }),

            // Requirements
            'requirements' => $this->requirements ?? [],

            // Contact information
            'contact_info' => $this->when(
                $this->shouldShowContactInfo(),
                $this->contact_info
            ),

            // Attendance information
            'attendance' => [
                'confirmed_count' => $this->confirmed_attendees_count,
                'total_attendees' => $this->whenLoaded('attendees', function () {
                    return $this->attendees->count();
                }),
                'user_attendance' => $this->when(
                    auth()->check(),
                    function () {
                        $attendee = $this->attendees->where('user_id', auth()->id())->first();
                        if (!$attendee) {
                            return null;
                        }

                        return [
                            'status' => $attendee->status,
                            'status_display' => $attendee->status_display,
                            'rsvp_response' => $attendee->rsvp_response,
                            'rsvp_response_display' => $attendee->rsvp_response_display,
                            'notes' => $attendee->notes,
                            'is_checked_in' => $attendee->is_checked_in,
                            'checked_in_at' => $attendee->checked_in_at?->toISOString(),
                            'rsvp_date' => $attendee->created_at->toISOString(),
                        ];
                    }
                ),
            ],

            // User permissions
            'permissions' => $this->when(
                auth()->check(),
                function () {
                    return [
                        'can_view' => $this->canBeViewedBy(auth()->user()),
                        'can_edit' => $this->canBeEditedBy(auth()->user()),
                        'can_delete' => $this->canBeDeletedBy(auth()->user()),
                        'can_rsvp' => $this->canUserRsvp(auth()->user()),
                        'is_host' => auth()->id() === $this->host_id,
                    ];
                }
            ),

            // Timestamps
            ...$this->timestamps(),
        ];
    }

    /**
     * Determine if contact info should be shown.
     *
     * @return bool
     */
    private function shouldShowContactInfo(): bool
    {
        if (!auth()->check()) {
            return false;
        }

        // Show to host
        if (auth()->id() === $this->host_id) {
            return true;
        }

        // Show to confirmed attendees
        $userAttendee = $this->attendees->where('user_id', auth()->id())->first();
        if ($userAttendee && $userAttendee->status === 'confirmed') {
            return true;
        }

        // Show to admins
        if (auth()->user()->hasRole('admin')) {
            return true;
        }

        return false;
    }

    /**
     * Check if user can RSVP to this event.
     *
     * @param \App\Models\User|null $user
     *
     * @return bool
     */
    private function canUserRsvp(?\App\Models\User $user): bool
    {
        if (!$user) {
            return false;
        }

        // Can't RSVP to own event
        if ($user->id === $this->host_id) {
            return false;
        }

        // Can't RSVP to past events
        if ($this->is_past) {
            return false;
        }

        // Can't RSVP to cancelled events
        if ($this->status === 'cancelled') {
            return false;
        }

        // Check if event is viewable
        if (!$this->canBeViewedBy($user)) {
            return false;
        }

        return true;
    }
}
