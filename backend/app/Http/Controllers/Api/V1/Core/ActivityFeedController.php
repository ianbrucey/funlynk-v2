<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Core\ActivityFeedResource;
use App\Models\Core\ActivityFeed;
use App\Services\Core\ActivityFeedService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Activity Feed Controller.
 *
 * Handles activity feed API endpoints for Core Funlynk users including
 * feed generation, filtering, privacy controls, and engagement tracking.
 */
class ActivityFeedController extends BaseApiController
{
    public function __construct(
        private ActivityFeedService $activityFeedService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get user's activity feed.
     */
    public function index(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'type' => 'sometimes|string|in:all,following,public',
                'activity_types' => 'sometimes|array',
                'activity_types.*' => 'string|in:follow,event_created,event_joined,event_commented,event_shared,profile_updated,interest_added,achievement_earned',
                'privacy_level' => 'sometimes|string|in:public,friends,private',
                'limit' => 'sometimes|integer|min:1|max:100',
                'offset' => 'sometimes|integer|min:0',
                'include_read' => 'sometimes|boolean',
            ]);

            $feed = $this->activityFeedService->getUserFeed(auth()->id(), $request->validated());

            return $this->paginatedResponse($feed, 'Activity feed retrieved successfully');
        });
    }

    /**
     * Get activity feed for discovery (public activities).
     */
    public function discover(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'activity_types' => 'sometimes|array',
                'activity_types.*' => 'string|in:follow,event_created,event_joined,event_commented,event_shared,profile_updated,interest_added,achievement_earned',
                'location' => 'sometimes|string',
                'radius' => 'sometimes|integer|min:1|max:100',
                'limit' => 'sometimes|integer|min:1|max:50',
                'offset' => 'sometimes|integer|min:0',
            ]);

            $feed = $this->activityFeedService->getDiscoveryFeed($request->validated());

            return $this->paginatedResponse($feed, 'Discovery feed retrieved successfully');
        });
    }

    /**
     * Get trending activities.
     */
    public function trending(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'timeframe' => 'sometimes|string|in:hour,day,week,month',
                'activity_types' => 'sometimes|array',
                'activity_types.*' => 'string|in:follow,event_created,event_joined,event_commented,event_shared,profile_updated,interest_added,achievement_earned',
                'limit' => 'sometimes|integer|min:1|max:50',
            ]);

            $trending = $this->activityFeedService->getTrendingActivities($request->validated());

            return $this->collectionResponse($trending, 'Trending activities retrieved successfully');
        });
    }

    /**
     * Get specific activity by ID.
     */
    public function show(int $id): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($id) {
            $activity = ActivityFeed::findOrFail($id);

            if (!$activity->canBeViewedBy(auth()->user())) {
                return $this->forbiddenResponse('You do not have permission to view this activity');
            }

            return $this->successResponse(
                new ActivityFeedResource($activity),
                'Activity retrieved successfully'
            );
        });
    }

    /**
     * Mark activity as read.
     */
    public function markAsRead(int $id): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($id) {
            $activity = ActivityFeed::where('user_id', auth()->id())->findOrFail($id);
            
            $activity->markAsRead();

            return $this->successResponse(
                new ActivityFeedResource($activity),
                'Activity marked as read'
            );
        });
    }

    /**
     * Mark all activities as read for user.
     */
    public function markAllAsRead(): JsonResponse
    {
        return $this->handleApiOperation(request(), function () {
            $count = $this->activityFeedService->markAllAsReadForUser(auth()->id());

            return $this->successResponse(
                ['marked_count' => $count],
                "Marked {$count} activities as read"
            );
        });
    }

    /**
     * Hide activity from feed.
     */
    public function hide(int $id): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($id) {
            $activity = ActivityFeed::where('user_id', auth()->id())->findOrFail($id);
            
            $activity->hide();

            return $this->successResponse(
                new ActivityFeedResource($activity),
                'Activity hidden from feed'
            );
        });
    }

    /**
     * Update feed preferences.
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'activity_types' => 'required|array',
                'activity_types.*' => 'string|in:follow,event_created,event_joined,event_commented,event_shared,profile_updated,interest_added,achievement_earned',
                'privacy_preferences' => 'sometimes|array',
                'privacy_preferences.default_privacy' => 'string|in:public,friends,private',
                'privacy_preferences.allow_discovery' => 'boolean',
                'notification_preferences' => 'sometimes|array',
                'notification_preferences.email_digest' => 'boolean',
                'notification_preferences.push_notifications' => 'boolean',
            ]);

            $preferences = $this->activityFeedService->updateUserPreferences(
                auth()->id(),
                $request->validated()
            );

            return $this->successResponse($preferences, 'Feed preferences updated successfully');
        });
    }

    /**
     * Get feed statistics.
     */
    public function statistics(): JsonResponse
    {
        return $this->handleApiOperation(request(), function () {
            $stats = $this->activityFeedService->getUserFeedStatistics(auth()->id());

            return $this->successResponse($stats, 'Feed statistics retrieved successfully');
        });
    }

    /**
     * Get unread activity count.
     */
    public function unreadCount(): JsonResponse
    {
        return $this->handleApiOperation(request(), function () {
            $count = ActivityFeed::where('user_id', auth()->id())
                                ->unread()
                                ->visible()
                                ->count();

            return $this->successResponse(
                ['unread_count' => $count],
                'Unread count retrieved successfully'
            );
        });
    }

    /**
     * Report inappropriate activity.
     */
    public function report(int $id, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $request->validate([
                'reason' => 'required|string|in:spam,harassment,inappropriate_content,fake_news,other',
                'description' => 'sometimes|string|max:500',
            ]);

            $activity = ActivityFeed::findOrFail($id);

            $report = $this->activityFeedService->reportActivity(
                $activity,
                auth()->id(),
                $request->validated()
            );

            return $this->successResponse($report, 'Activity reported successfully');
        });
    }

    /**
     * Get activity engagement metrics.
     */
    public function engagement(int $id): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($id) {
            $activity = ActivityFeed::findOrFail($id);

            if (!$activity->canBeViewedBy(auth()->user())) {
                return $this->forbiddenResponse('You do not have permission to view this activity');
            }

            $engagement = $this->activityFeedService->getActivityEngagement($activity);

            return $this->successResponse($engagement, 'Activity engagement retrieved successfully');
        });
    }
}
