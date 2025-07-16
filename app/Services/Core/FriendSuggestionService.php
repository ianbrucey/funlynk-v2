<?php

namespace App\Services\Core;

use App\Models\User;
use App\Models\Core\UserFollow;
use App\Models\Core\UserInterest;
use App\Services\Shared\CacheService;
use App\Services\Shared\LoggingService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

/**
 * Friend Suggestion Service
 *
 * Provides intelligent friend suggestions based on mutual connections,
 * shared interests, location proximity, and activity patterns.
 */
class FriendSuggestionService
{
    public function __construct(
        private LoggingService $loggingService
    ) {}

    /**
     * Get friend suggestions for a user.
     *
     * @param int $userId
     * @param array $options
     * @return Collection
     */
    public function getFriendSuggestions(int $userId, array $options = []): Collection
    {
        $cacheKey = "friend_suggestions.user.{$userId}." . md5(serialize($options));
        
        return $this->cacheService->remember($cacheKey, function () use ($userId, $options) {
            $limit = min($options['limit'] ?? 20, 50);
            $excludeIds = $options['exclude_ids'] ?? [];
            
            // Get users already followed or blocked
            $followingIds = $this->getFollowingIds($userId);
            $excludeIds = array_merge($excludeIds, $followingIds, [$userId]);
            
            $suggestions = collect();
            
            // Get mutual connection suggestions (highest weight)
            $mutualSuggestions = $this->getMutualConnectionSuggestions($userId, $excludeIds, $limit);
            $suggestions = $suggestions->merge($mutualSuggestions);
            
            // Get interest-based suggestions
            if ($suggestions->count() < $limit) {
                $interestSuggestions = $this->getInterestBasedSuggestions(
                    $userId,
                    array_merge($excludeIds, $suggestions->pluck('id')->toArray()),
                    $limit - $suggestions->count()
                );
                $suggestions = $suggestions->merge($interestSuggestions);
            }
            
            // Get location-based suggestions
            if ($suggestions->count() < $limit) {
                $locationSuggestions = $this->getLocationBasedSuggestions(
                    $userId,
                    array_merge($excludeIds, $suggestions->pluck('id')->toArray()),
                    $limit - $suggestions->count()
                );
                $suggestions = $suggestions->merge($locationSuggestions);
            }
            
            // Get activity-based suggestions
            if ($suggestions->count() < $limit) {
                $activitySuggestions = $this->getActivityBasedSuggestions(
                    $userId,
                    array_merge($excludeIds, $suggestions->pluck('id')->toArray()),
                    $limit - $suggestions->count()
                );
                $suggestions = $suggestions->merge($activitySuggestions);
            }
            
            // Sort by suggestion score and return
            return $suggestions->sortByDesc('suggestion_score')
                ->take($limit)
                ->values();
        }, 1800); // Cache for 30 minutes
    }

    /**
     * Get mutual connection suggestions.
     *
     * @param int $userId
     * @param array $excludeIds
     * @param int $limit
     * @return Collection
     */
    private function getMutualConnectionSuggestions(int $userId, array $excludeIds, int $limit): Collection
    {
        // Find users who are followed by people the user follows
        $mutualQuery = DB::table('user_follows as uf1')
            ->join('user_follows as uf2', 'uf1.following_id', '=', 'uf2.follower_id')
            ->join('users', 'uf2.following_id', '=', 'users.id')
            ->where('uf1.follower_id', $userId)
            ->where('uf2.following_id', '!=', $userId)
            ->whereNotIn('uf2.following_id', $excludeIds)
            ->where('users.is_active', true)
            ->select([
                'users.*',
                DB::raw('COUNT(*) as mutual_count'),
                DB::raw('COUNT(*) * 10 as suggestion_score') // High weight for mutual connections
            ])
            ->groupBy('users.id')
            ->orderBy('mutual_count', 'desc')
            ->limit($limit)
            ->get();
        
        return $mutualQuery->map(function ($user) {
            $user->suggestion_reason = 'mutual_connections';
            $user->suggestion_details = [
                'mutual_count' => $user->mutual_count,
                'reason_text' => "You have {$user->mutual_count} mutual connections"
            ];
            return $user;
        });
    }

    /**
     * Get interest-based suggestions.
     *
     * @param int $userId
     * @param array $excludeIds
     * @param int $limit
     * @return Collection
     */
    private function getInterestBasedSuggestions(int $userId, array $excludeIds, int $limit): Collection
    {
        // Get user's interests
        $userInterests = UserInterest::where('user_id', $userId)->pluck('interest_name');
        
        if ($userInterests->isEmpty()) {
            return collect();
        }
        
        // Find users with similar interests
        $interestQuery = DB::table('user_interests as ui1')
            ->join('user_interests as ui2', 'ui1.interest_name', '=', 'ui2.interest_name')
            ->join('users', 'ui2.user_id', '=', 'users.id')
            ->where('ui1.user_id', $userId)
            ->where('ui2.user_id', '!=', $userId)
            ->whereNotIn('ui2.user_id', $excludeIds)
            ->where('users.is_active', true)
            ->select([
                'users.*',
                DB::raw('COUNT(DISTINCT ui1.interest_name) as shared_interests'),
                DB::raw('COUNT(DISTINCT ui1.interest_name) * 5 as suggestion_score') // Medium weight
            ])
            ->groupBy('users.id')
            ->having('shared_interests', '>=', 2) // At least 2 shared interests
            ->orderBy('shared_interests', 'desc')
            ->limit($limit)
            ->get();
        
        return $interestQuery->map(function ($user) {
            $user->suggestion_reason = 'shared_interests';
            $user->suggestion_details = [
                'shared_count' => $user->shared_interests,
                'reason_text' => "You share {$user->shared_interests} interests"
            ];
            return $user;
        });
    }

    /**
     * Get location-based suggestions.
     *
     * @param int $userId
     * @param array $excludeIds
     * @param int $limit
     * @return Collection
     */
    private function getLocationBasedSuggestions(int $userId, array $excludeIds, int $limit): Collection
    {
        $user = User::find($userId);
        
        if (!$user || !$user->city || !$user->state) {
            return collect();
        }
        
        // Find users in the same city/state
        $locationQuery = User::where('is_active', true)
            ->where('id', '!=', $userId)
            ->whereNotIn('id', $excludeIds)
            ->where(function ($query) use ($user) {
                $query->where(function ($q) use ($user) {
                    // Same city and state
                    $q->where('city', $user->city)
                      ->where('state', $user->state);
                })->orWhere(function ($q) use ($user) {
                    // Same state, different city (lower priority)
                    $q->where('state', $user->state)
                      ->where('city', '!=', $user->city);
                });
            })
            ->select([
                '*',
                DB::raw('CASE 
                    WHEN city = ? AND state = ? THEN 4
                    WHEN state = ? THEN 2
                    ELSE 1
                END as suggestion_score')
            ])
            ->addBinding([$user->city, $user->state, $user->state], 'select')
            ->orderBy('suggestion_score', 'desc')
            ->limit($limit)
            ->get();
        
        return $locationQuery->map(function ($user) {
            $user->suggestion_reason = 'location_proximity';
            $user->suggestion_details = [
                'location' => $user->city . ', ' . $user->state,
                'reason_text' => $user->suggestion_score >= 4 
                    ? "Lives in your city" 
                    : "Lives in your state"
            ];
            return $user;
        });
    }

    /**
     * Get activity-based suggestions.
     *
     * @param int $userId
     * @param array $excludeIds
     * @param int $limit
     * @return Collection
     */
    private function getActivityBasedSuggestions(int $userId, array $excludeIds, int $limit): Collection
    {
        // Find users who attended similar events or have similar activity patterns
        $activityQuery = DB::table('event_attendees as ea1')
            ->join('event_attendees as ea2', 'ea1.event_id', '=', 'ea2.event_id')
            ->join('users', 'ea2.user_id', '=', 'users.id')
            ->where('ea1.user_id', $userId)
            ->where('ea2.user_id', '!=', $userId)
            ->whereNotIn('ea2.user_id', $excludeIds)
            ->where('users.is_active', true)
            ->where('ea1.status', 'attending')
            ->where('ea2.status', 'attending')
            ->select([
                'users.*',
                DB::raw('COUNT(DISTINCT ea1.event_id) as shared_events'),
                DB::raw('COUNT(DISTINCT ea1.event_id) * 3 as suggestion_score') // Lower weight
            ])
            ->groupBy('users.id')
            ->having('shared_events', '>=', 1)
            ->orderBy('shared_events', 'desc')
            ->limit($limit)
            ->get();
        
        return $activityQuery->map(function ($user) {
            $user->suggestion_reason = 'similar_activities';
            $user->suggestion_details = [
                'shared_events' => $user->shared_events,
                'reason_text' => "Attended {$user->shared_events} similar events"
            ];
            return $user;
        });
    }

    /**
     * Get trending users to follow.
     *
     * @param int $userId
     * @param array $options
     * @return Collection
     */
    public function getTrendingUsers(int $userId, array $options = []): Collection
    {
        $cacheKey = "trending_users.{$userId}." . md5(serialize($options));
        
        return $this->cacheService->remember($cacheKey, function () use ($userId, $options) {
            $limit = min($options['limit'] ?? 10, 20);
            $timeframe = $options['timeframe'] ?? 'week'; // week, month
            
            $startDate = match ($timeframe) {
                'week' => now()->subWeek(),
                'month' => now()->subMonth(),
                default => now()->subWeek(),
            };
            
            // Get users with most new followers in timeframe
            $trendingQuery = DB::table('user_follows')
                ->join('users', 'user_follows.following_id', '=', 'users.id')
                ->where('user_follows.created_at', '>=', $startDate)
                ->where('user_follows.following_id', '!=', $userId)
                ->where('users.is_active', true)
                ->whereNotIn('user_follows.following_id', $this->getFollowingIds($userId))
                ->select([
                    'users.*',
                    DB::raw('COUNT(*) as new_followers'),
                    DB::raw('COUNT(*) as suggestion_score')
                ])
                ->groupBy('users.id')
                ->orderBy('new_followers', 'desc')
                ->limit($limit)
                ->get();
            
            return $trendingQuery->map(function ($user) use ($timeframe) {
                $user->suggestion_reason = 'trending';
                $user->suggestion_details = [
                    'new_followers' => $user->new_followers,
                    'timeframe' => $timeframe,
                    'reason_text' => "Gained {$user->new_followers} new followers this {$timeframe}"
                ];
                return $user;
            });
        }, 3600); // Cache for 1 hour
    }

    /**
     * Get "People You May Know" suggestions.
     *
     * @param int $userId
     * @param array $options
     * @return Collection
     */
    public function getPeopleYouMayKnow(int $userId, array $options = []): Collection
    {
        $suggestions = $this->getFriendSuggestions($userId, $options);
        
        // Filter to only show high-confidence suggestions
        return $suggestions->filter(function ($user) {
            return $user->suggestion_score >= 5; // Only show strong suggestions
        })->take($options['limit'] ?? 10);
    }

    /**
     * Record suggestion interaction (view, dismiss, follow).
     *
     * @param int $userId
     * @param int $suggestedUserId
     * @param string $action
     * @param string $reason
     * @return void
     */
    public function recordSuggestionInteraction(
        int $userId,
        int $suggestedUserId,
        string $action,
        string $reason
    ): void {
        try {
            DB::table('suggestion_interactions')->insert([
                'user_id' => $userId,
                'suggested_user_id' => $suggestedUserId,
                'action' => $action, // 'viewed', 'dismissed', 'followed'
                'suggestion_reason' => $reason,
                'created_at' => now(),
            ]);
            
            // Clear suggestion cache to improve future suggestions
            if ($action === 'dismissed') {
                $this->cacheService->forget("friend_suggestions.user.{$userId}.*");
            }
            
            $this->loggingService->logUserActivity(
                $userId,
                'suggestion_interaction',
                'User',
                $suggestedUserId,
                [
                    'action' => $action,
                    'reason' => $reason,
                ]
            );
            
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'user_id' => $userId,
                'suggested_user_id' => $suggestedUserId,
                'action' => $action,
                'operation' => 'record_suggestion_interaction'
            ]);
        }
    }

    /**
     * Get suggestion analytics for a user.
     *
     * @param int $userId
     * @param array $options
     * @return array
     */
    public function getSuggestionAnalytics(int $userId, array $options = []): array
    {
        $timeframe = $options['timeframe'] ?? 'month';
        $startDate = match ($timeframe) {
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            'quarter' => now()->subQuarter(),
            default => now()->subMonth(),
        };
        
        $analytics = DB::table('suggestion_interactions')
            ->where('user_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->select([
                'action',
                'suggestion_reason',
                DB::raw('COUNT(*) as count')
            ])
            ->groupBy(['action', 'suggestion_reason'])
            ->get();
        
        $summary = [
            'total_suggestions_viewed' => 0,
            'total_suggestions_followed' => 0,
            'total_suggestions_dismissed' => 0,
            'follow_rate' => 0,
            'dismiss_rate' => 0,
            'by_reason' => [],
        ];
        
        foreach ($analytics as $stat) {
            $summary["total_suggestions_{$stat->action}"] += $stat->count;
            
            if (!isset($summary['by_reason'][$stat->suggestion_reason])) {
                $summary['by_reason'][$stat->suggestion_reason] = [
                    'viewed' => 0,
                    'followed' => 0,
                    'dismissed' => 0,
                ];
            }
            
            $summary['by_reason'][$stat->suggestion_reason][$stat->action] = $stat->count;
        }
        
        // Calculate rates
        if ($summary['total_suggestions_viewed'] > 0) {
            $summary['follow_rate'] = round(
                ($summary['total_suggestions_followed'] / $summary['total_suggestions_viewed']) * 100,
                2
            );
            $summary['dismiss_rate'] = round(
                ($summary['total_suggestions_dismissed'] / $summary['total_suggestions_viewed']) * 100,
                2
            );
        }
        
        return $summary;
    }

    /**
     * Get IDs of users that the given user is following.
     *
     * @param int $userId
     * @return array
     */
    private function getFollowingIds(int $userId): array
    {
        return UserFollow::where('follower_id', $userId)
            ->pluck('following_id')
            ->toArray();
    }

    /**
     * Get suggestions for user (alias for getFriendSuggestions for controller compatibility).
     *
     * @param int $userId
     * @param array $options
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getSuggestionsForUser(int $userId, array $options = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        $suggestions = $this->getFriendSuggestions($userId, $options);

        // Convert to paginated response
        $page = $options['page'] ?? 1;
        $perPage = min($options['limit'] ?? 20, 50);
        $total = $suggestions->count();
        $offset = ($page - 1) * $perPage;
        $items = $suggestions->slice($offset, $perPage)->values();

        return new \Illuminate\Pagination\LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => request()->url()]
        );
    }

    /**
     * Refresh suggestions for user.
     *
     * @param int $userId
     * @return int
     */
    public function refreshSuggestionsForUser(int $userId): int
    {
        // Clear existing suggestions cache
        // $this->cacheService->forget("friend_suggestions.user.{$userId}.*");

        // Generate new suggestions
        $suggestions = $this->getFriendSuggestions($userId, ['limit' => 50]);

        // Store suggestions in database (using FriendSuggestion model)
        $count = 0;
        foreach ($suggestions as $suggestion) {
            \App\Models\Core\FriendSuggestion::updateOrCreate(
                [
                    'user_id' => $userId,
                    'suggested_user_id' => $suggestion['user_id'],
                ],
                [
                    'suggestion_type' => $suggestion['type'] ?? 'mutual_friends',
                    'confidence_score' => $suggestion['score'] ?? 0.5,
                    'suggestion_reasons' => $suggestion['reasons'] ?? [],
                    'mutual_connections' => $suggestion['mutual_connections'] ?? [],
                    'mutual_friends_count' => $suggestion['mutual_friends_count'] ?? 0,
                    'shared_interests_count' => $suggestion['shared_interests_count'] ?? 0,
                    'shared_events_count' => $suggestion['shared_events_count'] ?? 0,
                    'expires_at' => now()->addDays(30),
                ]
            );
            $count++;
        }

        $this->loggingService->logUserActivity(
            $userId,
            'suggestions_refreshed',
            'FriendSuggestion',
            null,
            ['generated_count' => $count]
        );

        return $count;
    }
}
