<?php

namespace App\Services\Core;

use App\Models\User;
use App\Models\Core\UserFollow;
use App\Services\Shared\CacheService;
use App\Services\Shared\LoggingService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

/**
 * Social Graph Service
 *
 * Analyzes and manages the social network graph, providing insights into
 * user connections, network effects, influence metrics, and community detection.
 */
class SocialGraphService
{
    public function __construct(
        private LoggingService $loggingService
    ) {}

    /**
     * Get user's social network metrics.
     *
     * @param int $userId
     * @return array
     */
    public function getUserNetworkMetrics(int $userId): array
    {
        $cacheKey = "social_graph.user_metrics.{$userId}";
        
        return $this->cacheService->remember($cacheKey, function () use ($userId) {
            $user = User::findOrFail($userId);
            
            // Basic counts
            $followingCount = $user->following()->count();
            $followersCount = $user->followers()->count();
            
            // Mutual connections
            $mutualConnections = $this->getMutualConnectionsCount($userId);
            
            // Network reach (followers of followers)
            $networkReach = $this->calculateNetworkReach($userId);
            
            // Influence score
            $influenceScore = $this->calculateInfluenceScore($userId);
            
            // Engagement metrics
            $engagementMetrics = $this->getEngagementMetrics($userId);
            
            // Connection growth
            $growthMetrics = $this->getConnectionGrowthMetrics($userId);
            
            return [
                'following_count' => $followingCount,
                'followers_count' => $followersCount,
                'mutual_connections' => $mutualConnections,
                'network_reach' => $networkReach,
                'influence_score' => $influenceScore,
                'engagement_rate' => $engagementMetrics['engagement_rate'],
                'avg_interactions_per_post' => $engagementMetrics['avg_interactions'],
                'connection_growth_rate' => $growthMetrics['growth_rate'],
                'new_connections_this_month' => $growthMetrics['new_this_month'],
                'network_density' => $this->calculateNetworkDensity($userId),
                'centrality_score' => $this->calculateCentralityScore($userId),
            ];
        }, 3600); // Cache for 1 hour
    }

    /**
     * Get mutual connections between two users.
     *
     * @param int $userId1
     * @param int $userId2
     * @return Collection
     */
    public function getMutualConnections(int $userId1, int $userId2): Collection
    {
        $cacheKey = "social_graph.mutual.{$userId1}.{$userId2}";
        
        return $this->cacheService->remember($cacheKey, function () use ($userId1, $userId2) {
            return User::whereHas('followers', function ($query) use ($userId1) {
                $query->where('follower_id', $userId1);
            })
            ->whereHas('followers', function ($query) use ($userId2) {
                $query->where('follower_id', $userId2);
            })
            ->where('id', '!=', $userId1)
            ->where('id', '!=', $userId2)
            ->select(['id', 'first_name', 'last_name', 'avatar'])
            ->get();
        }, 1800); // Cache for 30 minutes
    }

    /**
     * Get user's network communities.
     *
     * @param int $userId
     * @param array $options
     * @return array
     */
    public function getUserCommunities(int $userId, array $options = []): array
    {
        $cacheKey = "social_graph.communities.{$userId}." . md5(serialize($options));
        
        return $this->cacheService->remember($cacheKey, function () use ($userId, $options) {
            $minCommunitySize = $options['min_size'] ?? 3;
            $maxCommunities = $options['max_communities'] ?? 10;
            
            // Get user's connections
            $connections = $this->getUserConnections($userId);
            
            if ($connections->count() < $minCommunitySize) {
                return [];
            }
            
            // Detect communities using simple clustering
            $communities = $this->detectCommunities($connections, $minCommunitySize);
            
            // Enrich communities with metadata
            return collect($communities)
                ->take($maxCommunities)
                ->map(function ($community, $index) {
                    return [
                        'id' => $index + 1,
                        'name' => $this->generateCommunityName($community),
                        'size' => count($community),
                        'members' => $community,
                        'common_interests' => $this->findCommonInterests($community),
                        'activity_level' => $this->calculateCommunityActivity($community),
                        'cohesion_score' => $this->calculateCommunityCohesion($community),
                    ];
                })
                ->values()
                ->toArray();
        }, 7200); // Cache for 2 hours
    }

    /**
     * Get network influence rankings.
     *
     * @param array $options
     * @return Collection
     */
    public function getInfluenceRankings(array $options = []): Collection
    {
        $cacheKey = "social_graph.influence_rankings." . md5(serialize($options));
        
        return $this->cacheService->remember($cacheKey, function () use ($options) {
            $limit = min($options['limit'] ?? 50, 100);
            $timeframe = $options['timeframe'] ?? 'month';
            
            $startDate = match ($timeframe) {
                'week' => now()->subWeek(),
                'month' => now()->subMonth(),
                'quarter' => now()->subQuarter(),
                default => now()->subMonth(),
            };
            
            // Calculate influence scores for active users
            $rankings = DB::table('users')
                ->leftJoin('user_follows as followers', 'users.id', '=', 'followers.following_id')
                ->leftJoin('activity_feeds', function ($join) use ($startDate) {
                    $join->on('users.id', '=', 'activity_feeds.user_id')
                         ->where('activity_feeds.created_at', '>=', $startDate);
                })
                ->where('users.is_active', true)
                ->select([
                    'users.id',
                    'users.first_name',
                    'users.last_name',
                    'users.avatar',
                    DB::raw('COUNT(DISTINCT followers.follower_id) as followers_count'),
                    DB::raw('COUNT(DISTINCT activity_feeds.id) as activities_count'),
                    DB::raw('SUM(activity_feeds.likes_count) as total_likes'),
                    DB::raw('SUM(activity_feeds.comments_count) as total_comments'),
                    DB::raw('(
                        COUNT(DISTINCT followers.follower_id) * 2 +
                        COUNT(DISTINCT activity_feeds.id) * 1 +
                        SUM(activity_feeds.likes_count) * 0.5 +
                        SUM(activity_feeds.comments_count) * 1
                    ) as influence_score')
                ])
                ->groupBy(['users.id', 'users.first_name', 'users.last_name', 'users.avatar'])
                ->orderBy('influence_score', 'desc')
                ->limit($limit)
                ->get();
            
            return $rankings->map(function ($user, $index) {
                $user->rank = $index + 1;
                $user->influence_score = round($user->influence_score ?? 0, 2);
                return $user;
            });
        }, 3600); // Cache for 1 hour
    }

    /**
     * Analyze network growth trends.
     *
     * @param array $options
     * @return array
     */
    public function getNetworkGrowthTrends(array $options = []): array
    {
        $cacheKey = "social_graph.growth_trends." . md5(serialize($options));
        
        return $this->cacheService->remember($cacheKey, function () use ($options) {
            $timeframe = $options['timeframe'] ?? 'month';
            $periods = $options['periods'] ?? 12;
            
            $interval = match ($timeframe) {
                'day' => 'DAY',
                'week' => 'WEEK',
                'month' => 'MONTH',
                default => 'MONTH',
            };
            
            // Get connection growth over time
            $growthData = DB::table('user_follows')
                ->select([
                    DB::raw("DATE_FORMAT(created_at, '%Y-%m') as period"),
                    DB::raw('COUNT(*) as new_connections'),
                    DB::raw('COUNT(DISTINCT follower_id) as active_users'),
                ])
                ->where('created_at', '>=', now()->sub($timeframe, $periods))
                ->groupBy('period')
                ->orderBy('period')
                ->get();
            
            // Calculate growth rates
            $trends = [];
            $previousConnections = 0;
            
            foreach ($growthData as $data) {
                $growthRate = $previousConnections > 0 
                    ? (($data->new_connections - $previousConnections) / $previousConnections) * 100
                    : 0;
                
                $trends[] = [
                    'period' => $data->period,
                    'new_connections' => $data->new_connections,
                    'active_users' => $data->active_users,
                    'growth_rate' => round($growthRate, 2),
                    'connections_per_user' => $data->active_users > 0 
                        ? round($data->new_connections / $data->active_users, 2)
                        : 0,
                ];
                
                $previousConnections = $data->new_connections;
            }
            
            return [
                'trends' => $trends,
                'summary' => [
                    'total_new_connections' => $growthData->sum('new_connections'),
                    'average_growth_rate' => round(collect($trends)->avg('growth_rate'), 2),
                    'peak_period' => collect($trends)->sortByDesc('new_connections')->first()['period'] ?? null,
                    'total_active_users' => $growthData->sum('active_users'),
                ],
            ];
        }, 3600); // Cache for 1 hour
    }

    /**
     * Get shortest path between two users.
     *
     * @param int $userId1
     * @param int $userId2
     * @param int $maxDepth
     * @return array|null
     */
    public function getShortestPath(int $userId1, int $userId2, int $maxDepth = 6): ?array
    {
        if ($userId1 === $userId2) {
            return ['path' => [$userId1], 'length' => 0];
        }
        
        $cacheKey = "social_graph.path.{$userId1}.{$userId2}.{$maxDepth}";
        
        return $this->cacheService->remember($cacheKey, function () use ($userId1, $userId2, $maxDepth) {
            // Use breadth-first search to find shortest path
            $queue = [[$userId1]];
            $visited = [$userId1 => true];
            $depth = 0;
            
            while (!empty($queue) && $depth < $maxDepth) {
                $nextQueue = [];
                
                foreach ($queue as $path) {
                    $currentUser = end($path);
                    
                    // Get connections of current user
                    $connections = UserFollow::where('follower_id', $currentUser)
                        ->pluck('following_id')
                        ->toArray();
                    
                    foreach ($connections as $connection) {
                        if ($connection === $userId2) {
                            // Found target user
                            return [
                                'path' => array_merge($path, [$connection]),
                                'length' => count($path),
                                'users' => $this->enrichPathWithUserData(array_merge($path, [$connection])),
                            ];
                        }
                        
                        if (!isset($visited[$connection])) {
                            $visited[$connection] = true;
                            $nextQueue[] = array_merge($path, [$connection]);
                        }
                    }
                }
                
                $queue = $nextQueue;
                $depth++;
            }
            
            return null; // No path found within max depth
        }, 1800); // Cache for 30 minutes
    }

    /**
     * Calculate mutual connections count.
     *
     * @param int $userId
     * @return int
     */
    private function getMutualConnectionsCount(int $userId): int
    {
        return DB::table('user_follows as uf1')
            ->join('user_follows as uf2', 'uf1.following_id', '=', 'uf2.following_id')
            ->where('uf1.follower_id', $userId)
            ->where('uf2.follower_id', '!=', $userId)
            ->distinct('uf1.following_id')
            ->count();
    }

    /**
     * Calculate network reach.
     *
     * @param int $userId
     * @return int
     */
    private function calculateNetworkReach(int $userId): int
    {
        // Get followers of user's followers (2nd degree connections)
        return DB::table('user_follows as uf1')
            ->join('user_follows as uf2', 'uf1.following_id', '=', 'uf2.follower_id')
            ->where('uf1.follower_id', $userId)
            ->where('uf2.following_id', '!=', $userId)
            ->distinct('uf2.following_id')
            ->count();
    }

    /**
     * Calculate influence score.
     *
     * @param int $userId
     * @return float
     */
    private function calculateInfluenceScore(int $userId): float
    {
        $user = User::find($userId);
        if (!$user) return 0;
        
        $followersCount = $user->followers()->count();
        $followingCount = $user->following()->count();
        
        // Recent activity engagement
        $recentEngagement = DB::table('activity_feeds')
            ->where('user_id', $userId)
            ->where('created_at', '>=', now()->subMonth())
            ->sum(DB::raw('likes_count + comments_count'));
        
        // Calculate influence score
        $followerWeight = $followersCount * 2;
        $engagementWeight = $recentEngagement * 0.5;
        $ratioBonus = $followingCount > 0 ? ($followersCount / $followingCount) * 10 : 0;
        
        return round($followerWeight + $engagementWeight + $ratioBonus, 2);
    }

    /**
     * Get engagement metrics for user.
     *
     * @param int $userId
     * @return array
     */
    private function getEngagementMetrics(int $userId): array
    {
        $activities = DB::table('activity_feeds')
            ->where('user_id', $userId)
            ->where('created_at', '>=', now()->subMonth())
            ->select([
                DB::raw('COUNT(*) as total_activities'),
                DB::raw('SUM(likes_count) as total_likes'),
                DB::raw('SUM(comments_count) as total_comments'),
            ])
            ->first();
        
        $totalInteractions = ($activities->total_likes ?? 0) + ($activities->total_comments ?? 0);
        $engagementRate = $activities->total_activities > 0 
            ? $totalInteractions / $activities->total_activities 
            : 0;
        
        return [
            'engagement_rate' => round($engagementRate, 2),
            'avg_interactions' => round($engagementRate, 2),
            'total_activities' => $activities->total_activities ?? 0,
        ];
    }

    /**
     * Get connection growth metrics.
     *
     * @param int $userId
     * @return array
     */
    private function getConnectionGrowthMetrics(int $userId): array
    {
        $thisMonth = UserFollow::where('follower_id', $userId)
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();
        
        $lastMonth = UserFollow::where('follower_id', $userId)
            ->whereBetween('created_at', [
                now()->subMonth()->startOfMonth(),
                now()->subMonth()->endOfMonth()
            ])
            ->count();
        
        $growthRate = $lastMonth > 0 ? (($thisMonth - $lastMonth) / $lastMonth) * 100 : 0;
        
        return [
            'new_this_month' => $thisMonth,
            'growth_rate' => round($growthRate, 2),
        ];
    }

    /**
     * Calculate network density for user.
     *
     * @param int $userId
     * @return float
     */
    private function calculateNetworkDensity(int $userId): float
    {
        $connections = $this->getUserConnections($userId);
        $n = $connections->count();
        
        if ($n < 2) return 0;
        
        // Count connections between user's connections
        $internalConnections = 0;
        $connectionIds = $connections->pluck('id')->toArray();
        
        foreach ($connectionIds as $id) {
            $internalConnections += UserFollow::where('follower_id', $id)
                ->whereIn('following_id', $connectionIds)
                ->count();
        }
        
        $maxPossibleConnections = $n * ($n - 1);
        return $maxPossibleConnections > 0 ? round($internalConnections / $maxPossibleConnections, 3) : 0;
    }

    /**
     * Calculate centrality score for user.
     *
     * @param int $userId
     * @return float
     */
    private function calculateCentralityScore(int $userId): float
    {
        // Simple degree centrality based on connections
        $user = User::find($userId);
        if (!$user) return 0;
        
        $totalConnections = $user->followers()->count() + $user->following()->count();
        $totalUsers = User::where('is_active', true)->count();
        
        return $totalUsers > 1 ? round($totalConnections / ($totalUsers - 1), 3) : 0;
    }

    /**
     * Get user's direct connections.
     *
     * @param int $userId
     * @return Collection
     */
    private function getUserConnections(int $userId): Collection
    {
        return User::whereHas('followers', function ($query) use ($userId) {
            $query->where('follower_id', $userId);
        })
        ->orWhereHas('following', function ($query) use ($userId) {
            $query->where('following_id', $userId);
        })
        ->where('id', '!=', $userId)
        ->get();
    }

    /**
     * Detect communities within connections.
     *
     * @param Collection $connections
     * @param int $minSize
     * @return array
     */
    private function detectCommunities(Collection $connections, int $minSize): array
    {
        // Simple community detection based on mutual connections
        $communities = [];
        $processed = [];
        
        foreach ($connections as $user) {
            if (in_array($user->id, $processed)) continue;
            
            $community = [$user];
            $processed[] = $user->id;
            
            // Find users connected to this user
            foreach ($connections as $otherUser) {
                if ($user->id === $otherUser->id || in_array($otherUser->id, $processed)) continue;
                
                // Check if they have mutual connections (simplified)
                $mutualCount = $this->getMutualConnections($user->id, $otherUser->id)->count();
                if ($mutualCount >= 2) {
                    $community[] = $otherUser;
                    $processed[] = $otherUser->id;
                }
            }
            
            if (count($community) >= $minSize) {
                $communities[] = $community;
            }
        }
        
        return $communities;
    }

    /**
     * Generate community name based on members.
     *
     * @param array $community
     * @return string
     */
    private function generateCommunityName(array $community): string
    {
        // Simple naming based on common patterns
        $names = ['Network', 'Circle', 'Group', 'Community', 'Cluster'];
        return $names[array_rand($names)] . ' ' . (count($community));
    }

    /**
     * Find common interests in community.
     *
     * @param array $community
     * @return array
     */
    private function findCommonInterests(array $community): array
    {
        $userIds = collect($community)->pluck('id')->toArray();
        
        return DB::table('user_interests')
            ->whereIn('user_id', $userIds)
            ->select('interest_name', DB::raw('COUNT(*) as count'))
            ->groupBy('interest_name')
            ->having('count', '>=', max(2, count($userIds) * 0.5))
            ->orderBy('count', 'desc')
            ->limit(5)
            ->pluck('interest_name')
            ->toArray();
    }

    /**
     * Calculate community activity level.
     *
     * @param array $community
     * @return float
     */
    private function calculateCommunityActivity(array $community): float
    {
        $userIds = collect($community)->pluck('id')->toArray();
        
        $activityCount = DB::table('activity_feeds')
            ->whereIn('user_id', $userIds)
            ->where('created_at', '>=', now()->subMonth())
            ->count();
        
        return round($activityCount / count($community), 2);
    }

    /**
     * Calculate community cohesion score.
     *
     * @param array $community
     * @return float
     */
    private function calculateCommunityCohesion(array $community): float
    {
        if (count($community) < 2) return 1.0;
        
        $userIds = collect($community)->pluck('id')->toArray();
        $totalPossibleConnections = count($userIds) * (count($userIds) - 1);
        
        $actualConnections = DB::table('user_follows')
            ->whereIn('follower_id', $userIds)
            ->whereIn('following_id', $userIds)
            ->count();
        
        return $totalPossibleConnections > 0 
            ? round($actualConnections / $totalPossibleConnections, 3)
            : 0;
    }

    /**
     * Enrich path with user data.
     *
     * @param array $userIds
     * @return array
     */
    private function enrichPathWithUserData(array $userIds): array
    {
        return User::whereIn('id', $userIds)
            ->select(['id', 'first_name', 'last_name', 'avatar'])
            ->get()
            ->keyBy('id')
            ->only($userIds)
            ->values()
            ->toArray();
    }

    /**
     * Get mutual connections with options (controller compatibility).
     *
     * @param int $userId1
     * @param int $userId2
     * @param array $options
     * @return array
     */
    public function getMutualConnectionsWithOptions(int $userId1, int $userId2, array $options = []): array
    {
        $connections = $this->getMutualConnections($userId1, $userId2);
        $limit = min($options['limit'] ?? 100, 100);

        return [
            'mutual_friends' => $connections->take($limit)->toArray(),
            'total_count' => $connections->count(),
        ];
    }

    /**
     * Get user network analysis.
     *
     * @param int $userId
     * @return array
     */
    public function getUserNetworkAnalysis(int $userId): array
    {
        return $this->getUserNetworkMetrics($userId);
    }

    /**
     * Discover people based on criteria.
     *
     * @param int $userId
     * @param array $options
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function discoverPeople(int $userId, array $options = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        $page = $options['page'] ?? 1;
        $perPage = min($options['limit'] ?? 20, 50);

        $query = User::where('id', '!=', $userId);

        // Apply filters
        if (isset($options['interests'])) {
            // Filter by interests if implemented
        }

        if (isset($options['exclude_following']) && $options['exclude_following']) {
            $followingIds = UserFollow::where('follower_id', $userId)->pluck('following_id');
            $query->whereNotIn('id', $followingIds);
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get user social statistics.
     *
     * @param int $userId
     * @return array
     */
    public function getUserSocialStatistics(int $userId): array
    {
        return $this->getUserNetworkMetrics($userId);
    }

    /**
     * Get trending social activities.
     *
     * @param array $options
     * @return \Illuminate\Support\Collection
     */
    public function getTrendingSocialActivities(array $options = []): \Illuminate\Support\Collection
    {
        $timeframe = $options['timeframe'] ?? 'day';
        $limit = min($options['limit'] ?? 20, 50);

        // This would typically query activity feeds or events
        // For now, return empty collection
        return collect([]);
    }

    /**
     * Get social recommendations.
     *
     * @param int $userId
     * @param array $options
     * @return \Illuminate\Support\Collection
     */
    public function getSocialRecommendations(int $userId, array $options = []): \Illuminate\Support\Collection
    {
        $type = $options['type'] ?? 'people';
        $limit = min($options['limit'] ?? 20, 50);

        // This would typically provide recommendations based on user activity
        // For now, return empty collection
        return collect([]);
    }

    /**
     * Update user social preferences.
     *
     * @param int $userId
     * @param array $preferences
     * @return array
     */
    public function updateUserSocialPreferences(int $userId, array $preferences): array
    {
        $user = User::findOrFail($userId);

        // Store preferences (would typically be in a separate preferences table)
        $socialPreferences = [
            'suggestion_preferences' => $preferences['suggestion_preferences'] ?? [],
            'privacy_preferences' => $preferences['privacy_preferences'] ?? [],
            'notification_preferences' => $preferences['notification_preferences'] ?? [],
        ];

        // For now, just log the update
        $this->loggingService->logUserActivity(
            $userId,
            'social_preferences_updated',
            'User',
            $userId,
            $socialPreferences
        );

        return $socialPreferences;
    }

    /**
     * Get user social insights.
     *
     * @param int $userId
     * @param array $options
     * @return array
     */
    public function getUserSocialInsights(int $userId, array $options = []): array
    {
        $timeframe = $options['timeframe'] ?? 'month';
        $metrics = $options['metrics'] ?? ['connections', 'engagement', 'reach', 'influence'];

        $insights = [];

        foreach ($metrics as $metric) {
            switch ($metric) {
                case 'connections':
                    $insights['connections'] = $this->getConnectionInsights($userId, $timeframe);
                    break;
                case 'engagement':
                    $insights['engagement'] = $this->getEngagementInsights($userId, $timeframe);
                    break;
                case 'reach':
                    $insights['reach'] = $this->getReachInsights($userId, $timeframe);
                    break;
                case 'influence':
                    $insights['influence'] = $this->getInfluenceInsights($userId, $timeframe);
                    break;
            }
        }

        return $insights;
    }

    /**
     * Get connection insights for user.
     *
     * @param int $userId
     * @param string $timeframe
     * @return array
     */
    private function getConnectionInsights(int $userId, string $timeframe): array
    {
        return [
            'new_connections' => 0,
            'connection_growth_rate' => 0.0,
            'mutual_connections_avg' => 0,
        ];
    }

    /**
     * Get engagement insights for user.
     *
     * @param int $userId
     * @param string $timeframe
     * @return array
     */
    private function getEngagementInsights(int $userId, string $timeframe): array
    {
        return [
            'engagement_rate' => 0.0,
            'interactions_count' => 0,
            'engagement_trend' => 'stable',
        ];
    }

    /**
     * Get reach insights for user.
     *
     * @param int $userId
     * @param string $timeframe
     * @return array
     */
    private function getReachInsights(int $userId, string $timeframe): array
    {
        return [
            'network_reach' => 0,
            'reach_growth' => 0.0,
            'reach_efficiency' => 0.0,
        ];
    }

    /**
     * Get influence insights for user.
     *
     * @param int $userId
     * @param string $timeframe
     * @return array
     */
    private function getInfluenceInsights(int $userId, string $timeframe): array
    {
        return [
            'influence_score' => 0.0,
            'influence_rank' => 0,
            'influence_trend' => 'stable',
        ];
    }
}
