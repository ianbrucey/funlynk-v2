<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Core\FriendSuggestionResource;
use App\Models\Core\FriendSuggestion;
use App\Services\Core\FriendSuggestionService;
use App\Services\Core\SocialGraphService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Social Controller.
 *
 * Handles social features API endpoints for Core Funlynk users including
 * friend suggestions, mutual connections, social graph analysis, and
 * social discovery features.
 */
class SocialController extends BaseApiController
{
    public function __construct(
        private FriendSuggestionService $friendSuggestionService,
        private SocialGraphService $socialGraphService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get friend suggestions for user.
     */
    public function suggestions(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'type' => 'sometimes|string|in:mutual_friends,shared_interests,shared_events,location_based,activity_based,network_analysis',
                'min_confidence' => 'sometimes|numeric|min:0|max:1',
                'limit' => 'sometimes|integer|min:1|max:50',
                'exclude_contacted' => 'sometimes|boolean',
                'exclude_dismissed' => 'sometimes|boolean',
            ]);

            $suggestions = $this->friendSuggestionService->getSuggestionsForUser(
                auth()->id(),
                $request->validated()
            );

            return $this->paginatedResponse($suggestions, 'Friend suggestions retrieved successfully');
        });
    }

    /**
     * Dismiss a friend suggestion.
     */
    public function dismissSuggestion(int $id): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($id) {
            $suggestion = FriendSuggestion::where('user_id', auth()->id())->findOrFail($id);
            
            $suggestion->dismiss();

            return $this->successResponse(
                new FriendSuggestionResource($suggestion),
                'Suggestion dismissed successfully'
            );
        });
    }

    /**
     * Mark suggestion as contacted.
     */
    public function markSuggestionContacted(int $id): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($id) {
            $suggestion = FriendSuggestion::where('user_id', auth()->id())->findOrFail($id);
            
            $suggestion->markAsContacted();

            return $this->successResponse(
                new FriendSuggestionResource($suggestion),
                'Suggestion marked as contacted'
            );
        });
    }

    /**
     * Get mutual connections between users.
     */
    public function mutualConnections(int $userId, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $userId) {
            $request->validate([
                'type' => 'sometimes|string|in:friends,interests,events,all',
                'limit' => 'sometimes|integer|min:1|max:100',
            ]);

            $connections = $this->socialGraphService->getMutualConnectionsWithOptions(
                auth()->id(),
                $userId,
                $request->validated()
            );

            return $this->successResponse($connections, 'Mutual connections retrieved successfully');
        });
    }

    /**
     * Get social network analysis for user.
     */
    public function networkAnalysis(): JsonResponse
    {
        return $this->handleApiOperation(request(), function () {
            $analysis = $this->socialGraphService->getUserNetworkAnalysis(auth()->id());

            return $this->successResponse($analysis, 'Network analysis retrieved successfully');
        });
    }

    /**
     * Discover people based on interests and activities.
     */
    public function discover(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'interests' => 'sometimes|array',
                'interests.*' => 'string|max:100',
                'location' => 'sometimes|string',
                'radius' => 'sometimes|integer|min:1|max:100',
                'activity_types' => 'sometimes|array',
                'activity_types.*' => 'string',
                'exclude_following' => 'sometimes|boolean',
                'limit' => 'sometimes|integer|min:1|max:50',
            ]);

            $discoveries = $this->socialGraphService->discoverPeople(
                auth()->id(),
                $request->validated()
            );

            return $this->paginatedResponse($discoveries, 'People discovery completed successfully');
        });
    }

    /**
     * Get social statistics for user.
     */
    public function statistics(): JsonResponse
    {
        return $this->handleApiOperation(request(), function () {
            $stats = $this->socialGraphService->getUserSocialStatistics(auth()->id());

            return $this->successResponse($stats, 'Social statistics retrieved successfully');
        });
    }

    /**
     * Get trending social activities.
     */
    public function trending(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'timeframe' => 'sometimes|string|in:hour,day,week,month',
                'category' => 'sometimes|string|in:follows,events,interests,all',
                'location' => 'sometimes|string',
                'limit' => 'sometimes|integer|min:1|max:50',
            ]);

            $trending = $this->socialGraphService->getTrendingSocialActivities($request->validated());

            return $this->collectionResponse($trending, 'Trending social activities retrieved successfully');
        });
    }

    /**
     * Get social recommendations.
     */
    public function recommendations(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'type' => 'sometimes|string|in:events,interests,people,groups',
                'based_on' => 'sometimes|string|in:friends,interests,activity,location',
                'limit' => 'sometimes|integer|min:1|max:50',
            ]);

            $recommendations = $this->socialGraphService->getSocialRecommendations(
                auth()->id(),
                $request->validated()
            );

            return $this->collectionResponse($recommendations, 'Social recommendations retrieved successfully');
        });
    }

    /**
     * Update social preferences.
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'suggestion_preferences' => 'sometimes|array',
                'suggestion_preferences.enable_mutual_friends' => 'boolean',
                'suggestion_preferences.enable_shared_interests' => 'boolean',
                'suggestion_preferences.enable_location_based' => 'boolean',
                'suggestion_preferences.min_confidence_score' => 'numeric|min:0|max:1',
                'privacy_preferences' => 'sometimes|array',
                'privacy_preferences.discoverable' => 'boolean',
                'privacy_preferences.show_mutual_connections' => 'boolean',
                'privacy_preferences.allow_suggestions' => 'boolean',
                'notification_preferences' => 'sometimes|array',
                'notification_preferences.new_suggestions' => 'boolean',
                'notification_preferences.mutual_connections' => 'boolean',
            ]);

            $preferences = $this->socialGraphService->updateUserSocialPreferences(
                auth()->id(),
                $request->validated()
            );

            return $this->successResponse($preferences, 'Social preferences updated successfully');
        });
    }

    /**
     * Get social insights and analytics.
     */
    public function insights(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'timeframe' => 'sometimes|string|in:week,month,quarter,year',
                'metrics' => 'sometimes|array',
                'metrics.*' => 'string|in:connections,engagement,reach,influence',
            ]);

            $insights = $this->socialGraphService->getUserSocialInsights(
                auth()->id(),
                $request->validated()
            );

            return $this->successResponse($insights, 'Social insights retrieved successfully');
        });
    }

    /**
     * Bulk dismiss suggestions.
     */
    public function bulkDismissSuggestions(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'suggestion_ids' => 'required|array|min:1|max:50',
                'suggestion_ids.*' => 'integer|exists:friend_suggestions,id',
            ]);

            $count = FriendSuggestion::bulkDismissForUser(
                auth()->id(),
                $request->input('suggestion_ids')
            );

            return $this->successResponse(
                ['dismissed_count' => $count],
                "Dismissed {$count} suggestions successfully"
            );
        });
    }

    /**
     * Refresh friend suggestions.
     */
    public function refreshSuggestions(): JsonResponse
    {
        return $this->handleApiOperation(request(), function () {
            $count = $this->friendSuggestionService->refreshSuggestionsForUser(auth()->id());

            return $this->successResponse(
                ['generated_count' => $count],
                "Generated {$count} new suggestions"
            );
        });
    }

    /**
     * Get suggestion statistics.
     */
    public function suggestionStatistics(): JsonResponse
    {
        return $this->handleApiOperation(request(), function () {
            $stats = FriendSuggestion::getStatsForUser(auth()->id());

            return $this->successResponse($stats, 'Suggestion statistics retrieved successfully');
        });
    }
}
