<?php

namespace Tests\Unit\Core;

use App\Models\User;
use App\Models\Core\ActivityFeed;
use App\Services\Core\ActivityFeedService;
use App\Services\Shared\LoggingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Pagination\LengthAwarePaginator;
use Mockery;
use Tests\TestCase;

class ActivityFeedServiceTest extends TestCase
{
    use RefreshDatabase;

    private ActivityFeedService $service;
    private $mockLoggingService;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->mockLoggingService = Mockery::mock(LoggingService::class);
        $this->service = new ActivityFeedService($this->mockLoggingService);
        $this->user = User::factory()->create();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_can_get_personalized_feed_for_user()
    {
        // Create activities for the user
        ActivityFeed::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'is_visible' => true,
        ]);

        $result = $this->service->getPersonalizedFeed($this->user->id);

        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
        $this->assertCount(5, $result->items());
    }

    /** @test */
    public function it_can_get_user_feed_alias()
    {
        ActivityFeed::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'is_visible' => true,
        ]);

        $result = $this->service->getUserFeed($this->user->id);

        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
        $this->assertCount(3, $result->items());
    }

    /** @test */
    public function it_can_get_discovery_feed()
    {
        // Create public activities
        ActivityFeed::factory()->count(4)->create([
            'privacy_level' => 'public',
            'is_visible' => true,
            'activity_timestamp' => now()->subDays(2),
        ]);

        $result = $this->service->getDiscoveryFeed();

        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
        $this->assertCount(4, $result->items());
    }

    /** @test */
    public function it_can_get_trending_activities()
    {
        // Create activities with different engagement scores
        ActivityFeed::factory()->create([
            'privacy_level' => 'public',
            'is_visible' => true,
            'engagement_score' => 100,
            'activity_timestamp' => now()->subHours(2),
        ]);

        ActivityFeed::factory()->create([
            'privacy_level' => 'public',
            'is_visible' => true,
            'engagement_score' => 50,
            'activity_timestamp' => now()->subHours(1),
        ]);

        $result = $this->service->getTrendingActivities(['timeframe' => 'day']);

        $this->assertInstanceOf(\Illuminate\Support\Collection::class, $result);
        $this->assertCount(2, $result);
        
        // Should be ordered by engagement score descending
        $this->assertEquals(100, $result->first()->engagement_score);
    }

    /** @test */
    public function it_can_mark_all_activities_as_read_for_user()
    {
        // Create unread activities
        ActivityFeed::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'is_read' => false,
        ]);

        $count = $this->service->markAllAsReadForUser($this->user->id);

        $this->assertEquals(3, $count);
        
        // Verify all activities are now read
        $unreadCount = ActivityFeed::where('user_id', $this->user->id)
            ->where('is_read', false)
            ->count();
        $this->assertEquals(0, $unreadCount);
    }

    /** @test */
    public function it_can_update_user_preferences()
    {
        $preferences = [
            'activity_types' => ['follow', 'event_created'],
            'privacy_preferences' => ['default_privacy' => 'friends'],
            'notification_preferences' => ['email_digest' => true],
        ];

        $result = $this->service->updateUserPreferences($this->user->id, $preferences);

        $this->assertEquals($preferences, $result);
    }

    /** @test */
    public function it_can_get_user_feed_statistics()
    {
        // Create activities for the user
        ActivityFeed::factory()->count(2)->create([
            'actor_id' => $this->user->id,
            'activity_timestamp' => now()->subDays(3),
        ]);

        ActivityFeed::factory()->create([
            'actor_id' => $this->user->id,
            'activity_timestamp' => now()->subDays(1), // This week
        ]);

        ActivityFeed::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'is_read' => false,
        ]);

        $stats = $this->service->getUserFeedStatistics($this->user->id);

        $this->assertIsArray($stats);
        $this->assertArrayHasKey('total_activities', $stats);
        $this->assertArrayHasKey('activities_this_week', $stats);
        $this->assertArrayHasKey('unread_items', $stats);
        $this->assertEquals(3, $stats['total_activities']);
        $this->assertEquals(1, $stats['activities_this_week']);
        $this->assertEquals(3, $stats['unread_items']);
    }

    /** @test */
    public function it_can_report_activity()
    {
        $activity = ActivityFeed::factory()->create();
        $reporterId = $this->user->id;
        $reportData = [
            'reason' => 'spam',
            'description' => 'This is spam content',
        ];

        $this->mockLoggingService->shouldReceive('logUserActivity')
            ->once()
            ->with(
                $reporterId,
                'activity_reported',
                'ActivityFeed',
                $activity->id,
                Mockery::type('array')
            );

        $result = $this->service->reportActivity($activity, $reporterId, $reportData);

        $this->assertIsArray($result);
        $this->assertEquals($activity->id, $result['activity_id']);
        $this->assertEquals($reporterId, $result['reporter_id']);
        $this->assertEquals('spam', $result['reason']);
    }

    /** @test */
    public function it_can_get_activity_engagement()
    {
        $activity = ActivityFeed::factory()->create([
            'engagement_score' => 75,
        ]);

        $engagement = $this->service->getActivityEngagement($activity);

        $this->assertIsArray($engagement);
        $this->assertArrayHasKey('engagement_score', $engagement);
        $this->assertArrayHasKey('likes_count', $engagement);
        $this->assertArrayHasKey('comments_count', $engagement);
        $this->assertEquals(75, $engagement['engagement_score']);
    }

    /** @test */
    public function discovery_feed_filters_by_activity_types()
    {
        ActivityFeed::factory()->create([
            'activity_type' => 'follow',
            'privacy_level' => 'public',
            'is_visible' => true,
            'activity_timestamp' => now()->subDays(1),
        ]);

        ActivityFeed::factory()->create([
            'activity_type' => 'event_created',
            'privacy_level' => 'public',
            'is_visible' => true,
            'activity_timestamp' => now()->subDays(1),
        ]);

        $result = $this->service->getDiscoveryFeed([
            'activity_types' => ['follow']
        ]);

        $this->assertCount(1, $result->items());
        $this->assertEquals('follow', $result->items()[0]->activity_type);
    }

    /** @test */
    public function trending_activities_respects_timeframe()
    {
        // Create old activity
        ActivityFeed::factory()->create([
            'privacy_level' => 'public',
            'is_visible' => true,
            'engagement_score' => 100,
            'activity_timestamp' => now()->subDays(10),
        ]);

        // Create recent activity
        ActivityFeed::factory()->create([
            'privacy_level' => 'public',
            'is_visible' => true,
            'engagement_score' => 50,
            'activity_timestamp' => now()->subHours(2),
        ]);

        $result = $this->service->getTrendingActivities(['timeframe' => 'day']);

        $this->assertCount(1, $result);
        $this->assertEquals(50, $result->first()->engagement_score);
    }

    /** @test */
    public function personalized_feed_respects_pagination()
    {
        ActivityFeed::factory()->count(25)->create([
            'user_id' => $this->user->id,
            'is_visible' => true,
        ]);

        $result = $this->service->getPersonalizedFeed($this->user->id, [
            'per_page' => 10,
            'page' => 2,
        ]);

        $this->assertEquals(10, $result->perPage());
        $this->assertEquals(2, $result->currentPage());
        $this->assertEquals(25, $result->total());
    }
}
