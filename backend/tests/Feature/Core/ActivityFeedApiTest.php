<?php

namespace Tests\Feature\Core;

use App\Models\User;
use App\Models\Core\ActivityFeed;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ActivityFeedApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $user;
    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
    }

    /** @test */
    public function user_can_get_their_activity_feed()
    {
        // Create some activities
        ActivityFeed::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'privacy_level' => 'public',
            'is_visible' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/activity');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'activity_type',
                            'activity_text',
                            'privacy_level',
                            'is_read',
                            'engagement_score',
                            'activity_timestamp',
                            'user',
                            'actor',
                        ]
                    ],
                    'current_page',
                    'total',
                ]
            ]);
    }

    /** @test */
    public function user_can_get_discovery_feed()
    {
        // Create public activities
        ActivityFeed::factory()->count(3)->create([
            'privacy_level' => 'public',
            'is_visible' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/activity/discover');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'activity_type',
                            'privacy_level',
                            'engagement_score',
                        ]
                    ]
                ]
            ]);
    }

    /** @test */
    public function user_can_get_trending_activities()
    {
        // Create activities with high engagement
        ActivityFeed::factory()->count(3)->create([
            'privacy_level' => 'public',
            'is_visible' => true,
            'engagement_score' => 100,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/activity/trending');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'activity_type',
                        'engagement_score',
                    ]
                ]
            ]);
    }

    /** @test */
    public function user_can_mark_activity_as_read()
    {
        $activity = ActivityFeed::factory()->create([
            'user_id' => $this->user->id,
            'is_read' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/core/activity/{$activity->id}/read");

        $response->assertOk();
        
        $this->assertTrue($activity->fresh()->is_read);
    }

    /** @test */
    public function user_can_mark_all_activities_as_read()
    {
        ActivityFeed::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'is_read' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/core/activity/mark-all-read');

        $response->assertOk()
            ->assertJsonPath('data.marked_count', 3);
    }

    /** @test */
    public function user_can_hide_activity_from_feed()
    {
        $activity = ActivityFeed::factory()->create([
            'user_id' => $this->user->id,
            'is_visible' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/core/activity/{$activity->id}/hide");

        $response->assertOk();
        
        $this->assertFalse($activity->fresh()->is_visible);
    }

    /** @test */
    public function user_can_update_feed_preferences()
    {
        $preferences = [
            'activity_types' => ['follow', 'event_created'],
            'privacy_preferences' => [
                'default_privacy' => 'friends',
                'allow_discovery' => true,
            ],
            'notification_preferences' => [
                'email_digest' => true,
                'push_notifications' => false,
            ],
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/core/activity/preferences', $preferences);

        $response->assertOk()
            ->assertJsonPath('data.activity_types', ['follow', 'event_created']);
    }

    /** @test */
    public function user_can_get_unread_count()
    {
        ActivityFeed::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'is_read' => false,
            'is_visible' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/activity/unread-count');

        $response->assertOk()
            ->assertJsonPath('data.unread_count', 2);
    }

    /** @test */
    public function user_can_report_inappropriate_activity()
    {
        $activity = ActivityFeed::factory()->create([
            'actor_id' => $this->otherUser->id,
            'privacy_level' => 'public',
        ]);

        $reportData = [
            'reason' => 'spam',
            'description' => 'This is spam content',
        ];

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/core/activity/{$activity->id}/report", $reportData);

        $response->assertOk();
    }

    /** @test */
    public function user_cannot_view_private_activity_from_others()
    {
        $activity = ActivityFeed::factory()->create([
            'actor_id' => $this->otherUser->id,
            'privacy_level' => 'private',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/core/activity/{$activity->id}");

        $response->assertForbidden();
    }

    /** @test */
    public function unauthenticated_user_cannot_access_activity_feed()
    {
        $response = $this->getJson('/api/v1/core/activity');

        $response->assertUnauthorized();
    }

    /** @test */
    public function activity_feed_filters_work_correctly()
    {
        // Create different types of activities
        ActivityFeed::factory()->create([
            'user_id' => $this->user->id,
            'activity_type' => 'follow',
            'privacy_level' => 'public',
        ]);

        ActivityFeed::factory()->create([
            'user_id' => $this->user->id,
            'activity_type' => 'event_created',
            'privacy_level' => 'public',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/activity?activity_types[]=follow');

        $response->assertOk();
        
        $activities = $response->json('data.data');
        $this->assertCount(1, $activities);
        $this->assertEquals('follow', $activities[0]['activity_type']);
    }
}
