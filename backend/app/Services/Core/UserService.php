<?php

namespace App\Services\Core;

use App\Models\Core\UserInterest;
use App\Models\User;
use App\Services\Shared\FileUploadService;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use Exception;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * User Service.
 *
 * Handles user management business logic including profiles, interests, and social features
 */
class UserService
{
    public function __construct(
        private FileUploadService $fileUploadService,
        private LoggingService $loggingService,
        private NotificationService $notificationService
    ) {
    }

    /**
     * Update user profile.
     *
     * @param User  $user
     * @param array $data
     *
     * @throws Exception
     *
     * @return User
     */
    public function updateProfile(User $user, array $data): User
    {
        try {
            DB::beginTransaction();

            // Handle profile image upload
            if (isset($data['profile_image'])) {
                $imageData = $this->fileUploadService->uploadImage(
                    $data['profile_image'],
                    'profile-images'
                );
                $data['profile_image_url'] = $imageData['url'];
                unset($data['profile_image']);
            }

            // Separate core profile data
            $coreProfileData = $data['core_profile'] ?? [];
            unset($data['core_profile']);

            // Update user basic information
            $user->update($data);

            // Update or create core profile
            if (!empty($coreProfileData)) {
                $user->coreProfile()->updateOrCreate(
                    ['user_id' => $user->id],
                    $coreProfileData
                );
            }

            // Reload relationships
            $user->load(['coreProfile', 'interests']);

            // Log the activity
            $this->loggingService->logUserActivity(
                $user->id,
                'profile_updated',
                'User',
                $user->id,
                $data
            );

            DB::commit();

            return $user;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'user_id' => $user->id,
                'operation' => 'update_profile'
            ]);

            throw $e;
        }
    }

    /**
     * Update user interests.
     *
     * @param User  $user
     * @param array $interests
     *
     * @throws Exception
     *
     * @return User
     */
    public function updateInterests(User $user, array $interests): User
    {
        try {
            DB::beginTransaction();

            // Remove existing interests
            $user->interests()->delete();

            // Add new interests
            foreach ($interests as $interest) {
                UserInterest::create([
                    'user_id' => $user->id,
                    'interest' => $interest,
                ]);
            }

            // Reload interests
            $user->load('interests');

            // Log the activity
            $this->loggingService->logUserActivity(
                $user->id,
                'interests_updated',
                'User',
                $user->id,
                ['interests' => $interests]
            );

            DB::commit();

            return $user;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'user_id' => $user->id,
                'operation' => 'update_interests'
            ]);

            throw $e;
        }
    }

    /**
     * Search users.
     *
     * @param string $query
     * @param array  $interests
     * @param int    $perPage
     *
     * @return LengthAwarePaginator
     */
    public function searchUsers(string $query, array $interests = [], int $perPage = 15): LengthAwarePaginator
    {
        $usersQuery = User::query()
            ->with(['coreProfile', 'interests'])
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                  ->orWhere('last_name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%")
                  ->orWhereHas('coreProfile', function ($profile) use ($query) {
                      $profile->where('occupation', 'like', "%{$query}%")
                              ->orWhere('company', 'like', "%{$query}%");
                  });
            });

        // Filter by interests if provided
        if (!empty($interests)) {
            $usersQuery->whereHas('interests', function ($q) use ($interests) {
                $q->whereIn('interest', $interests);
            });
        }

        // Exclude current user from results
        if (auth()->check()) {
            $usersQuery->where('id', '!=', auth()->id());
        }

        return $usersQuery->paginate($perPage);
    }

    /**
     * Follow a user.
     *
     * @param User $follower
     * @param User $following
     *
     * @return bool
     */
    public function followUser(User $follower, User $following): bool
    {
        try {
            $result = $follower->follow($following);

            if ($result) {
                // Send notification to the followed user
                $this->notificationService->createNotification(
                    $following->id,
                    'user_followed',
                    'New Follower',
                    "{$follower->first_name} {$follower->last_name} started following you",
                    [
                        'follower_id' => $follower->id,
                        'follower_name' => $follower->first_name . ' ' . $follower->last_name,
                    ]
                );

                // Log the activity
                $this->loggingService->logUserActivity(
                    $follower->id,
                    'user_followed',
                    'User',
                    $following->id
                );
            }

            return $result;
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'follower_id' => $follower->id,
                'following_id' => $following->id,
                'operation' => 'follow_user'
            ]);

            return false;
        }
    }

    /**
     * Unfollow a user.
     *
     * @param User $follower
     * @param User $following
     *
     * @return bool
     */
    public function unfollowUser(User $follower, User $following): bool
    {
        try {
            $result = $follower->unfollow($following);

            if ($result) {
                // Log the activity
                $this->loggingService->logUserActivity(
                    $follower->id,
                    'user_unfollowed',
                    'User',
                    $following->id
                );
            }

            return $result;
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'follower_id' => $follower->id,
                'following_id' => $following->id,
                'operation' => 'unfollow_user'
            ]);

            return false;
        }
    }

    /**
     * Check if a user can view another user's profile.
     *
     * @param User|null $viewer
     * @param User      $target
     *
     * @return bool
     */
    public function canViewProfile(?User $viewer, User $target): bool
    {
        // If no viewer (guest), only public profiles can be viewed
        if (!$viewer) {
            return $this->isProfilePublic($target);
        }

        // Users can always view their own profile
        if ($viewer->id === $target->id) {
            return true;
        }

        // Admins can view all profiles
        if ($viewer->hasRole('admin')) {
            return true;
        }

        // Check profile visibility settings
        $visibilitySettings = $target->coreProfile?->visibility_settings ?? [];

        // Default to public if no settings
        if (empty($visibilitySettings)) {
            return true;
        }

        // Check specific visibility rules
        if (isset($visibilitySettings['profile_visibility'])) {
            switch ($visibilitySettings['profile_visibility']) {
                case 'public':
                    return true;
                case 'followers_only':
                    return $target->isFollowedBy($viewer);
                case 'private':
                    return false;
                default:
                    return true;
            }
        }

        return true;
    }

    /**
     * Check if a profile is public.
     *
     * @param User $user
     *
     * @return bool
     */
    private function isProfilePublic(User $user): bool
    {
        $visibilitySettings = $user->coreProfile?->visibility_settings ?? [];

        if (isset($visibilitySettings['profile_visibility'])) {
            return $visibilitySettings['profile_visibility'] === 'public';
        }

        // Default to public
        return true;
    }
}
