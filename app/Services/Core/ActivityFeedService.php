<?php

namespace App\Services\Core;

use App\Models\User;
use App\Models\Core\ActivityFeed;
use App\Services\Shared\CacheService;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

/**
 * Activity Feed Service
 *
 * Manages user activity feeds, content generation, and social interactions.
 * Provides personalized feed algorithms, privacy filtering, and real-time updates.
 */
class ActivityFeedService
{
    public function __construct(
        private CacheService $cacheService,
        private LoggingService $loggingService,
        private NotificationService $notificationService
    ) {}

    /**
     * Get personalized activity feed for a user.
     *
     * @param int $userId
     * @param array $options
     * @return LengthAwarePaginator
     */
    public function getPersonalizedFeed(int $userId, array $options = []): LengthAwarePaginator
    {
        $cacheKey = "activity_feed.user.{$userId}." . md5(serialize($options));
        
        return $this->cacheService->remember($cacheKey, function () use ($userId, $options) {
            $user = User::findOrFail($userId);
            $page = $options['page'] ?? 1;
            $perPage = min($options['per_page'] ?? 20, 50);
            
            // Get activities from followed users and own activities
            $followingIds = $user->following()->pluck('users.id')->toArray();
            $followingIds[] = $userId; // Include own activities
            
            $query = ActivityFeed::with(['user', 'target'])
                ->whereIn('user_id', $followingIds)
                ->where('is_public', true)
                ->where('created_at', '>=', now()->subDays(30)) // Last 30 days
                ->orderBy('created_at', 'desc');
            
            // Apply content filters
            if (isset($options['activity_types'])) {
                $query->whereIn('activity_type', $options['activity_types']);
            }
            
            // Apply privacy filters
            $query = $this->applyPrivacyFilters($query, $user);
            
            return $query->paginate($perPage, ['*'], 'page', $page);
        }, 300); // Cache for 5 minutes
    }

    /**
     * Get user's own activity timeline.
     *
     * @param int $userId
     * @param array $options
     * @return LengthAwarePaginator
     */
    public function getUserTimeline(int $userId, array $options = []): LengthAwarePaginator
    {
        $page = $options['page'] ?? 1;
        $perPage = min($options['per_page'] ?? 20, 50);
        
        $query = ActivityFeed::with(['user', 'target'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc');
        
        // Apply visibility filters based on viewer
        if (isset($options['viewer_id']) && $options['viewer_id'] !== $userId) {
            $query->where('is_public', true);
        }
        
        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Create a new activity entry.
     *
     * @param int $userId
     * @param string $activityType
     * @param string $targetType
     * @param int $targetId
     * @param array $metadata
     * @param bool $isPublic
     * @return ActivityFeed
     * @throws Exception
     */
    public function createActivity(
        int $userId,
        string $activityType,
        string $targetType,
        int $targetId,
        array $metadata = [],
        bool $isPublic = true
    ): ActivityFeed {
        try {
            // Validate activity type
            $allowedTypes = [
                'event_created', 'event_joined', 'event_left', 'event_completed',
                'user_followed', 'user_unfollowed', 'profile_updated',
                'achievement_earned', 'milestone_reached', 'content_shared',
                'comment_posted', 'like_given', 'review_posted'
            ];
            
            if (!in_array($activityType, $allowedTypes)) {
                throw new Exception("Invalid activity type: {$activityType}");
            }
            
            // Check for duplicate recent activities (prevent spam)
            $recentActivity = ActivityFeed::where('user_id', $userId)
                ->where('activity_type', $activityType)
                ->where('target_type', $targetType)
                ->where('target_id', $targetId)
                ->where('created_at', '>', now()->subMinutes(5))
                ->first();
            
            if ($recentActivity) {
                return $recentActivity; // Return existing instead of creating duplicate
            }
            
            $activity = ActivityFeed::create([
                'user_id' => $userId,
                'activity_type' => $activityType,
                'target_type' => $targetType,
                'target_id' => $targetId,
                'metadata' => $metadata,
                'is_public' => $isPublic,
            ]);
            
            // Clear relevant caches
            $this->clearUserFeedCaches($userId);
            
            // Send notifications for social activities
            $this->processSocialNotifications($activity);
            
            // Log activity creation
            $this->loggingService->logUserActivity(
                $userId,
                'activity_created',
                'ActivityFeed',
                $activity->id,
                [
                    'activity_type' => $activityType,
                    'target_type' => $targetType,
                    'target_id' => $targetId,
                ]
            );
            
            return $activity;
            
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'user_id' => $userId,
                'activity_type' => $activityType,
                'target_type' => $targetType,
                'target_id' => $targetId,
            ]);
            
            throw $e;
        }
    }

    /**
     * Like an activity.
     *
     * @param int $activityId
     * @param int $userId
     * @return bool
     */
    public function likeActivity(int $activityId, int $userId): bool
    {
        try {
            $activity = ActivityFeed::findOrFail($activityId);
            
            // Check if already liked
            $existingLike = DB::table('activity_likes')
                ->where('activity_id', $activityId)
                ->where('user_id', $userId)
                ->first();
            
            if ($existingLike) {
                return false; // Already liked
            }
            
            // Add like
            DB::table('activity_likes')->insert([
                'activity_id' => $activityId,
                'user_id' => $userId,
                'created_at' => now(),
            ]);
            
            // Update like count
            $activity->increment('likes_count');
            
            // Create notification for activity owner
            if ($activity->user_id !== $userId) {
                $this->notificationService->createNotification(
                    $activity->user_id,
                    'activity_like',
                    'Activity Liked',
                    User::find($userId)->full_name . ' liked your activity',
                    [
                        'activity_id' => $activityId,
                        'liker_id' => $userId,
                        'activity_type' => $activity->activity_type,
                    ]
                );
            }
            
            // Clear caches
            $this->clearActivityCaches($activityId);
            
            return true;
            
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'activity_id' => $activityId,
                'user_id' => $userId,
                'operation' => 'like_activity'
            ]);
            
            return false;
        }
    }

    /**
     * Unlike an activity.
     *
     * @param int $activityId
     * @param int $userId
     * @return bool
     */
    public function unlikeActivity(int $activityId, int $userId): bool
    {
        try {
            $activity = ActivityFeed::findOrFail($activityId);
            
            // Remove like
            $deleted = DB::table('activity_likes')
                ->where('activity_id', $activityId)
                ->where('user_id', $userId)
                ->delete();
            
            if ($deleted) {
                // Update like count
                $activity->decrement('likes_count');
                
                // Clear caches
                $this->clearActivityCaches($activityId);
                
                return true;
            }
            
            return false;
            
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'activity_id' => $activityId,
                'user_id' => $userId,
                'operation' => 'unlike_activity'
            ]);
            
            return false;
        }
    }

    /**
     * Comment on an activity.
     *
     * @param int $activityId
     * @param int $userId
     * @param string $content
     * @return array|null
     */
    public function commentOnActivity(int $activityId, int $userId, string $content): ?array
    {
        try {
            $activity = ActivityFeed::findOrFail($activityId);
            
            // Validate content
            if (empty(trim($content)) || strlen($content) > 1000) {
                return null;
            }
            
            // Create comment
            $commentId = DB::table('activity_comments')->insertGetId([
                'activity_id' => $activityId,
                'user_id' => $userId,
                'content' => trim($content),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // Update comment count
            $activity->increment('comments_count');
            
            // Create notification for activity owner
            if ($activity->user_id !== $userId) {
                $this->notificationService->createNotification(
                    $activity->user_id,
                    'activity_comment',
                    'New Comment',
                    User::find($userId)->full_name . ' commented on your activity',
                    [
                        'activity_id' => $activityId,
                        'comment_id' => $commentId,
                        'commenter_id' => $userId,
                        'comment_preview' => substr($content, 0, 100),
                    ]
                );
            }
            
            // Clear caches
            $this->clearActivityCaches($activityId);
            
            return [
                'id' => $commentId,
                'content' => $content,
                'user' => User::find($userId),
                'created_at' => now(),
            ];
            
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'activity_id' => $activityId,
                'user_id' => $userId,
                'operation' => 'comment_activity'
            ]);
            
            return null;
        }
    }

    /**
     * Get activity comments.
     *
     * @param int $activityId
     * @param array $options
     * @return LengthAwarePaginator
     */
    public function getActivityComments(int $activityId, array $options = []): LengthAwarePaginator
    {
        $page = $options['page'] ?? 1;
        $perPage = min($options['per_page'] ?? 10, 50);
        
        $query = DB::table('activity_comments')
            ->join('users', 'activity_comments.user_id', '=', 'users.id')
            ->where('activity_id', $activityId)
            ->select([
                'activity_comments.*',
                'users.first_name',
                'users.last_name',
                'users.avatar',
            ])
            ->orderBy('activity_comments.created_at', 'desc');
        
        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Apply privacy filters to activity query.
     *
     * @param $query
     * @param User $viewer
     * @return mixed
     */
    private function applyPrivacyFilters($query, User $viewer)
    {
        // For now, just filter public activities
        // In the future, this could include friend-only activities, etc.
        return $query->where('is_public', true);
    }

    /**
     * Process social notifications for activity.
     *
     * @param ActivityFeed $activity
     * @return void
     */
    private function processSocialNotifications(ActivityFeed $activity): void
    {
        // Only send notifications for certain activity types
        $notifiableTypes = ['event_created', 'achievement_earned', 'milestone_reached'];
        
        if (!in_array($activity->activity_type, $notifiableTypes)) {
            return;
        }
        
        // Get followers to notify
        $followers = User::find($activity->user_id)->followers()->limit(100)->get();
        
        foreach ($followers as $follower) {
            $this->notificationService->createNotification(
                $follower->id,
                'follower_activity',
                'New Activity',
                User::find($activity->user_id)->full_name . ' ' . $this->getActivityDescription($activity),
                [
                    'activity_id' => $activity->id,
                    'user_id' => $activity->user_id,
                    'activity_type' => $activity->activity_type,
                ]
            );
        }
    }

    /**
     * Get human-readable activity description.
     *
     * @param ActivityFeed $activity
     * @return string
     */
    private function getActivityDescription(ActivityFeed $activity): string
    {
        return match ($activity->activity_type) {
            'event_created' => 'created a new event',
            'event_joined' => 'joined an event',
            'user_followed' => 'followed someone new',
            'achievement_earned' => 'earned an achievement',
            'milestone_reached' => 'reached a milestone',
            'content_shared' => 'shared content',
            'review_posted' => 'posted a review',
            default => 'had some activity',
        };
    }

    /**
     * Clear user feed caches.
     *
     * @param int $userId
     * @return void
     */
    private function clearUserFeedCaches(int $userId): void
    {
        // Clear user's own feed cache
        $this->cacheService->forget("activity_feed.user.{$userId}.*");
        
        // Clear followers' feed caches
        $followers = User::find($userId)->followers()->pluck('users.id');
        foreach ($followers as $followerId) {
            $this->cacheService->forget("activity_feed.user.{$followerId}.*");
        }
    }

    /**
     * Clear activity-specific caches.
     *
     * @param int $activityId
     * @return void
     */
    private function clearActivityCaches(int $activityId): void
    {
        $this->cacheService->forget("activity.{$activityId}.*");
        $this->cacheService->forget("activity_comments.{$activityId}.*");
    }

    /**
     * Get user feed (alias for getPersonalizedFeed for controller compatibility).
     *
     * @param int $userId
     * @param array $options
     * @return LengthAwarePaginator
     */
    public function getUserFeed(int $userId, array $options = []): LengthAwarePaginator
    {
        return $this->getPersonalizedFeed($userId, $options);
    }

    /**
     * Get discovery feed with public activities.
     *
     * @param array $options
     * @return LengthAwarePaginator
     */
    public function getDiscoveryFeed(array $options = []): LengthAwarePaginator
    {
        $page = $options['page'] ?? 1;
        $perPage = min($options['per_page'] ?? 20, 50);

        $query = ActivityFeed::with(['user', 'activityable'])
            ->where('privacy_level', 'public')
            ->where('is_visible', true)
            ->where('activity_timestamp', '>=', now()->subDays(7)) // Last 7 days
            ->orderBy('engagement_score', 'desc')
            ->orderBy('activity_timestamp', 'desc');

        // Apply activity type filters
        if (isset($options['activity_types'])) {
            $query->whereIn('activity_type', $options['activity_types']);
        }

        // Apply location filters if provided
        if (isset($options['location']) && isset($options['radius'])) {
            // This would require location data in activities or users
            // For now, we'll skip location filtering
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get trending activities.
     *
     * @param array $options
     * @return Collection
     */
    public function getTrendingActivities(array $options = []): Collection
    {
        $timeframe = $options['timeframe'] ?? 'day';
        $limit = min($options['limit'] ?? 20, 50);

        $timeframeDays = match ($timeframe) {
            'hour' => 0.04, // ~1 hour
            'day' => 1,
            'week' => 7,
            'month' => 30,
            default => 1,
        };

        $query = ActivityFeed::with(['user', 'activityable'])
            ->where('privacy_level', 'public')
            ->where('is_visible', true)
            ->where('activity_timestamp', '>=', now()->subDays($timeframeDays))
            ->orderBy('engagement_score', 'desc')
            ->limit($limit);

        // Apply activity type filters
        if (isset($options['activity_types'])) {
            $query->whereIn('activity_type', $options['activity_types']);
        }

        return $query->get();
    }

    /**
     * Mark all activities as read for user.
     *
     * @param int $userId
     * @return int
     */
    public function markAllAsReadForUser(int $userId): int
    {
        return ActivityFeed::markAllAsReadForUser($userId);
    }

    /**
     * Update user feed preferences.
     *
     * @param int $userId
     * @param array $preferences
     * @return array
     */
    public function updateUserPreferences(int $userId, array $preferences): array
    {
        $user = User::findOrFail($userId);

        // Store preferences in user profile or separate preferences table
        $feedPreferences = [
            'activity_types' => $preferences['activity_types'] ?? [],
            'privacy_preferences' => $preferences['privacy_preferences'] ?? [],
            'notification_preferences' => $preferences['notification_preferences'] ?? [],
        ];

        // For now, store in user's metadata or create a preferences table
        $user->update([
            'feed_preferences' => $feedPreferences
        ]);

        // Clear user's feed cache
        $this->clearUserFeedCaches($userId);

        return $feedPreferences;
    }

    /**
     * Get user feed statistics.
     *
     * @param int $userId
     * @return array
     */
    public function getUserFeedStatistics(int $userId): array
    {
        $cacheKey = "feed_stats.user.{$userId}";

        return $this->cacheService->remember($cacheKey, function () use ($userId) {
            $user = User::findOrFail($userId);

            // Get user's activities
            $userActivities = ActivityFeed::where('actor_id', $userId);

            // Get activities in user's feed
            $feedActivities = ActivityFeed::where('user_id', $userId);

            return [
                'total_activities' => (clone $userActivities)->count(),
                'activities_this_week' => (clone $userActivities)->where('activity_timestamp', '>=', now()->subWeek())->count(),
                'activities_this_month' => (clone $userActivities)->where('activity_timestamp', '>=', now()->subMonth())->count(),
                'feed_items' => (clone $feedActivities)->count(),
                'unread_items' => (clone $feedActivities)->where('is_read', false)->count(),
                'engagement_score' => (clone $userActivities)->avg('engagement_score') ?? 0,
                'most_active_type' => (clone $userActivities)->select('activity_type')
                    ->groupBy('activity_type')
                    ->orderByRaw('COUNT(*) DESC')
                    ->first()?->activity_type ?? 'none',
            ];
        }, 300); // Cache for 5 minutes
    }

    /**
     * Report inappropriate activity.
     *
     * @param ActivityFeed $activity
     * @param int $reporterId
     * @param array $reportData
     * @return array
     */
    public function reportActivity(ActivityFeed $activity, int $reporterId, array $reportData): array
    {
        // Create report record (you might want to create a reports table)
        $report = [
            'activity_id' => $activity->id,
            'reporter_id' => $reporterId,
            'reason' => $reportData['reason'],
            'description' => $reportData['description'] ?? null,
            'reported_at' => now(),
        ];

        // Log the report
        $this->loggingService->logUserActivity(
            $reporterId,
            'activity_reported',
            'ActivityFeed',
            $activity->id,
            $report
        );

        // Send notification to moderators (if implemented)
        // $this->notificationService->notifyModerators('activity_reported', $report);

        return $report;
    }

    /**
     * Get activity engagement metrics.
     *
     * @param ActivityFeed $activity
     * @return array
     */
    public function getActivityEngagement(ActivityFeed $activity): array
    {
        $cacheKey = "activity_engagement.{$activity->id}";

        return $this->cacheService->remember($cacheKey, function () use ($activity) {
            // These would come from likes, comments, shares tables if implemented
            return [
                'likes_count' => 0, // Would query likes table
                'comments_count' => 0, // Would query comments table
                'shares_count' => 0, // Would query shares table
                'views_count' => 0, // Would track views
                'engagement_score' => $activity->engagement_score,
                'engagement_rate' => 0.0, // Calculate based on views vs interactions
                'top_reactions' => [], // Most common reaction types
                'recent_interactions' => [], // Recent likes, comments, etc.
            ];
        }, 300); // Cache for 5 minutes
    }
}
