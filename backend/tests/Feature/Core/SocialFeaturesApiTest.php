<?php

namespace Tests\Feature\Core;

use App\Models\User;
use App\Models\Core\FriendSuggestion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class SocialFeaturesApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $user;
    private User $suggestedUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->suggestedUser = User::factory()->create();
    }

    /** @test */
    public function user_can_get_friend_suggestions()
    {
        FriendSuggestion::factory()->create([
            'user_id' => $this->user->id,
            'suggested_user_id' => $this->suggestedUser->id,
            'confidence_score' => 0.8,
            'is_dismissed' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/social/suggestions');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'suggestion_type',
                            'confidence_score',
                            'suggested_user',
                            'mutual_friends_count',
                            'shared_interests_count',
                        ]
                    ]
                ]
            ]);
    }

    /** @test */
    public function user_can_dismiss_friend_suggestion()
    {
        $suggestion = FriendSuggestion::factory()->create([
            'user_id' => $this->user->id,
            'suggested_user_id' => $this->suggestedUser->id,
            'is_dismissed' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/core/social/suggestions/{$suggestion->id}/dismiss");

        $response->assertOk();
        
        $this->assertTrue($suggestion->fresh()->is_dismissed);
    }

    /** @test */
    public function user_can_mark_suggestion_as_contacted()
    {
        $suggestion = FriendSuggestion::factory()->create([
            'user_id' => $this->user->id,
            'suggested_user_id' => $this->suggestedUser->id,
            'is_contacted' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/core/social/suggestions/{$suggestion->id}/contacted");

        $response->assertOk();
        
        $this->assertTrue($suggestion->fresh()->is_contacted);
    }

    /** @test */
    public function user_can_bulk_dismiss_suggestions()
    {
        $suggestions = FriendSuggestion::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'is_dismissed' => false,
        ]);

        $suggestionIds = $suggestions->pluck('id')->toArray();

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/core/social/suggestions/bulk-dismiss', [
                'suggestion_ids' => $suggestionIds,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.dismissed_count', 3);

        foreach ($suggestions as $suggestion) {
            $this->assertTrue($suggestion->fresh()->is_dismissed);
        }
    }

    /** @test */
    public function user_can_refresh_suggestions()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/core/social/suggestions/refresh');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'generated_count'
                ]
            ]);
    }

    /** @test */
    public function user_can_get_suggestion_statistics()
    {
        FriendSuggestion::factory()->count(5)->create([
            'user_id' => $this->user->id,
        ]);

        FriendSuggestion::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'is_dismissed' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/social/suggestions/statistics');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'total',
                    'active',
                    'dismissed',
                    'contacted',
                    'followed',
                    'high_confidence',
                ]
            ]);
    }

    /** @test */
    public function user_can_get_mutual_connections()
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/core/social/mutual-connections/{$this->suggestedUser->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'mutual_friends',
                    'total_count',
                ]
            ]);
    }

    /** @test */
    public function user_can_get_network_analysis()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/social/network-analysis');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'connections_count',
                    'network_density',
                    'clustering_coefficient',
                ]
            ]);
    }

    /** @test */
    public function user_can_discover_people()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/social/discover');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                        ]
                    ]
                ]
            ]);
    }

    /** @test */
    public function user_can_get_social_statistics()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/social/statistics');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'connections_count',
                    'network_density',
                ]
            ]);
    }

    /** @test */
    public function user_can_get_trending_social_activities()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/social/trending');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data'
            ]);
    }

    /** @test */
    public function user_can_get_social_recommendations()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/social/recommendations');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data'
            ]);
    }

    /** @test */
    public function user_can_update_social_preferences()
    {
        $preferences = [
            'suggestion_preferences' => [
                'enable_mutual_friends' => true,
                'enable_shared_interests' => false,
                'min_confidence_score' => 0.7,
            ],
            'privacy_preferences' => [
                'discoverable' => true,
                'show_mutual_connections' => false,
            ],
            'notification_preferences' => [
                'new_suggestions' => true,
                'mutual_connections' => false,
            ],
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/core/social/preferences', $preferences);

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'suggestion_preferences',
                    'privacy_preferences',
                    'notification_preferences',
                ]
            ]);
    }

    /** @test */
    public function user_can_get_social_insights()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/social/insights?timeframe=month&metrics[]=connections&metrics[]=engagement');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'connections',
                    'engagement',
                ]
            ]);
    }

    /** @test */
    public function user_cannot_access_others_suggestions()
    {
        $otherUser = User::factory()->create();
        $suggestion = FriendSuggestion::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/core/social/suggestions/{$suggestion->id}/dismiss");

        $response->assertNotFound();
    }

    /** @test */
    public function suggestion_filters_work_correctly()
    {
        FriendSuggestion::factory()->create([
            'user_id' => $this->user->id,
            'suggestion_type' => 'mutual_friends',
            'confidence_score' => 0.9,
        ]);

        FriendSuggestion::factory()->create([
            'user_id' => $this->user->id,
            'suggestion_type' => 'shared_interests',
            'confidence_score' => 0.5,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/social/suggestions?type=mutual_friends&min_confidence=0.8');

        $response->assertOk();
        
        $suggestions = $response->json('data.data');
        $this->assertCount(1, $suggestions);
        $this->assertEquals('mutual_friends', $suggestions[0]['suggestion_type']);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_social_features()
    {
        $response = $this->getJson('/api/v1/core/social/suggestions');

        $response->assertUnauthorized();
    }
}
