<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Core\UpdateInterestsRequest;
use App\Http\Requests\Core\UpdateProfileRequest;
use App\Http\Resources\Core\UserResource;
use App\Models\User;
use App\Services\Core\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * User Controller.
 *
 * Handles user management operations including profiles, interests, and social features
 */
class UserController extends BaseApiController
{
    public function __construct(
        private UserService $userService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get current user profile.
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function profile(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $user = $request->user();
            $user->load(['coreProfile', 'interests', 'roles', 'permissions']);

            return $this->successResponse(
                new UserResource($user),
                'Profile retrieved successfully'
            );
        });
    }

    /**
     * Update current user profile.
     *
     * @param UpdateProfileRequest $request
     *
     * @return JsonResponse
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $user = $this->userService->updateProfile($request->user(), $request->validated());

            return $this->updatedResponse(
                new UserResource($user),
                'Profile updated successfully'
            );
        });
    }

    /**
     * Get user by ID.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $user = User::with(['coreProfile', 'interests'])->findOrFail($id);

            // Check if profile is public or if current user can view it
            if (!$this->userService->canViewProfile(auth()->user(), $user)) {
                return $this->forbiddenResponse('You do not have permission to view this profile');
            }

            return $this->successResponse(
                new UserResource($user),
                'User profile retrieved successfully'
            );
        });
    }

    /**
     * Search users.
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'query' => 'required|string|min:2|max:100',
                'per_page' => 'integer|min:1|max:50',
                'interests' => 'array',
                'interests.*' => 'string|max:100',
            ]);

            $users = $this->userService->searchUsers(
                $request->input('query'),
                $request->input('interests', []),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($users, 'Users found successfully');
        });
    }

    /**
     * Update user interests.
     *
     * @param UpdateInterestsRequest $request
     *
     * @return JsonResponse
     */
    public function updateInterests(UpdateInterestsRequest $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $user = $this->userService->updateInterests($request->user(), $request->validated()['interests']);

            return $this->updatedResponse(
                new UserResource($user),
                'Interests updated successfully'
            );
        });
    }

    /**
     * Get user's interests.
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function interests(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $interests = $request->user()->interests()->get();

            return $this->successResponse(
                $interests->pluck('interest')->toArray(),
                'Interests retrieved successfully'
            );
        });
    }

    /**
     * Follow a user.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function follow(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $targetUser = User::findOrFail($id);
            $result = $this->userService->followUser($request->user(), $targetUser);

            if (!$result) {
                return $this->errorResponse('Unable to follow user', 400);
            }

            return $this->successResponse(
                ['following' => true],
                'User followed successfully'
            );
        });
    }

    /**
     * Unfollow a user.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function unfollow(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $targetUser = User::findOrFail($id);
            $result = $this->userService->unfollowUser($request->user(), $targetUser);

            if (!$result) {
                return $this->errorResponse('Unable to unfollow user', 400);
            }

            return $this->successResponse(
                ['following' => false],
                'User unfollowed successfully'
            );
        });
    }

    /**
     * Get user's followers.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function followers(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $user = User::findOrFail($id);

            if (!$this->userService->canViewProfile(auth()->user(), $user)) {
                return $this->forbiddenResponse('You do not have permission to view this information');
            }

            $followers = $user->followers()->paginate($request->input('per_page', 15));

            return $this->paginatedResponse($followers, 'Followers retrieved successfully');
        });
    }

    /**
     * Get users that a user is following.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function following(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $user = User::findOrFail($id);

            if (!$this->userService->canViewProfile(auth()->user(), $user)) {
                return $this->forbiddenResponse('You do not have permission to view this information');
            }

            $following = $user->following()->paginate($request->input('per_page', 15));

            return $this->paginatedResponse($following, 'Following retrieved successfully');
        });
    }

    /**
     * Check follow status between current user and target user.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function followStatus(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $targetUser = User::findOrFail($id);
            $currentUser = $request->user();

            $isFollowing = $currentUser->isFollowing($targetUser);
            $isFollowedBy = $currentUser->isFollowedBy($targetUser);

            return $this->successResponse([
                'is_following' => $isFollowing,
                'is_followed_by' => $isFollowedBy,
                'mutual_follow' => $isFollowing && $isFollowedBy,
            ], 'Follow status retrieved successfully');
        });
    }
}
