<?php

namespace App\Http\Resources\Core;

use App\Http\Resources\BaseResource;
use Illuminate\Http\Request;

/**
 * Core User Resource.
 *
 * Transforms user data for Core Funlynk API responses
 */
class UserResource extends BaseResource
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
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->first_name . ' ' . $this->last_name,
            'email' => $this->when(
                $this->shouldShowEmail($request),
                $this->email
            ),
            'phone' => $this->when(
                $this->shouldShowPhone($request),
                $this->phone
            ),
            'profile_image_url' => $this->profile_image_url,
            'bio' => $this->bio,
            'location' => $this->location,
            'website' => $this->website,
            'timezone' => $this->timezone,
            'date_of_birth' => $this->when(
                $this->shouldShowDateOfBirth($request),
                $this->date_of_birth?->format('Y-m-d')
            ),
            'gender' => $this->when(
                $this->shouldShowGender($request),
                $this->gender
            ),
            'is_verified' => $this->hasVerifiedEmail(),
            'status' => $this->status,
            'last_seen_at' => $this->last_seen_at?->toISOString(),

            // Core profile information
            'core_profile' => $this->whenLoaded('coreProfile', function () {
                return [
                    'occupation' => $this->coreProfile->occupation,
                    'company' => $this->coreProfile->company,
                    'experience_level' => $this->coreProfile->experience_level,
                    'education' => $this->coreProfile->education,
                    'languages_spoken' => $this->coreProfile->languages_spoken,
                    'availability_status' => $this->coreProfile->availability_status,
                    'preferred_contact_method' => $this->coreProfile->preferred_contact_method,
                    'social_links' => $this->formatSocialLinks(),
                    'emergency_contact' => $this->when(
                        $this->shouldShowEmergencyContact(),
                        $this->formatEmergencyContact()
                    ),
                ];
            }),

            // Interests
            'interests' => $this->whenLoaded('interests', function () {
                return $this->interests->pluck('interest')->toArray();
            }),

            // Social stats
            'social_stats' => [
                'followers_count' => $this->when(
                    $this->relationLoaded('followers'),
                    $this->followers_count ?? $this->followers()->count()
                ),
                'following_count' => $this->when(
                    $this->relationLoaded('following'),
                    $this->following_count ?? $this->following()->count()
                ),
                'is_following' => $this->when(
                    auth()->check() && auth()->id() !== $this->id,
                    function () {
                        return auth()->user()->isFollowing($this->resource);
                    }
                ),
                'is_followed_by' => $this->when(
                    auth()->check() && auth()->id() !== $this->id,
                    function () {
                        return auth()->user()->isFollowedBy($this->resource);
                    }
                ),
            ],

            // Roles and permissions (for authenticated user only)
            'roles' => $this->whenAuthenticated(
                $this->whenLoaded('roles', function () {
                    return $this->roles->pluck('name')->toArray();
                })
            ),

            'permissions' => $this->whenAuthenticated(
                $this->whenLoaded('permissions', function () {
                    return $this->getAllPermissions()->pluck('name')->toArray();
                })
            ),

            // Timestamps
            ...$this->timestamps(),
        ];
    }

    /**
     * Determine if email should be shown.
     *
     * @param Request $request
     *
     * @return bool
     */
    private function shouldShowEmail(Request $request): bool
    {
        // Show email to the user themselves or admins
        return auth()->check() && (
            auth()->id() === $this->id ||
            auth()->user()->hasRole('admin')
        );
    }

    /**
     * Determine if phone should be shown.
     *
     * @param Request $request
     *
     * @return bool
     */
    private function shouldShowPhone(Request $request): bool
    {
        // Show phone to the user themselves or admins
        return auth()->check() && (
            auth()->id() === $this->id ||
            auth()->user()->hasRole('admin')
        );
    }

    /**
     * Determine if date of birth should be shown.
     *
     * @param Request $request
     *
     * @return bool
     */
    private function shouldShowDateOfBirth(Request $request): bool
    {
        // Show date of birth to the user themselves only
        return auth()->check() && auth()->id() === $this->id;
    }

    /**
     * Determine if gender should be shown.
     *
     * @param Request $request
     *
     * @return bool
     */
    private function shouldShowGender(Request $request): bool
    {
        // Show gender based on privacy settings or to the user themselves
        return auth()->check() && (
            auth()->id() === $this->id ||
            $this->isGenderPublic()
        );
    }

    /**
     * Determine if emergency contact should be shown.
     *
     * @return bool
     */
    private function shouldShowEmergencyContact(): bool
    {
        // Show emergency contact to the user themselves only
        return auth()->check() && auth()->id() === $this->id;
    }

    /**
     * Format social links.
     *
     * @return array
     */
    private function formatSocialLinks(): array
    {
        if (!$this->coreProfile) {
            return [];
        }

        return array_filter([
            'linkedin' => $this->coreProfile->linkedin_url,
            'twitter' => $this->coreProfile->twitter_url,
            'instagram' => $this->coreProfile->instagram_url,
            'facebook' => $this->coreProfile->facebook_url,
        ]);
    }

    /**
     * Format emergency contact information.
     *
     * @return array|null
     */
    private function formatEmergencyContact(): ?array
    {
        if (!$this->coreProfile || !$this->coreProfile->emergency_contact_name) {
            return null;
        }

        return [
            'name' => $this->coreProfile->emergency_contact_name,
            'phone' => $this->coreProfile->emergency_contact_phone,
            'relationship' => $this->coreProfile->emergency_contact_relationship,
        ];
    }

    /**
     * Check if gender is public.
     *
     * @return bool
     */
    private function isGenderPublic(): bool
    {
        $visibilitySettings = $this->coreProfile?->visibility_settings ?? [];

        return ($visibilitySettings['show_gender'] ?? true) === true;
    }
}
