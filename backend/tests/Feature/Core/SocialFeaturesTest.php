<?php

namespace Tests\Feature\Core;

use App\Models\Core\ActivityFeed;
use App\Models\Core\DirectMessage;
use App\Models\Core\Conversation;
use App\Models\Core\UserNotification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SocialFeaturesTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user1;
    protected User $user2;
    protected User $user3;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::firstOrCreate(['name' => 'user']);

        // Create test users
        $this->user1 = User::factory()->create();
        $this->user1->assignRole('user');

        $this->user2 = User::factory()->create();
        $this->user2->assignRole('user');

        $this->user3 = User::factory()->create();
        $this->user3->assignRole('user');
    }

    /** @test */
    public function authenticated_user_can_get_activity_feed()
    {
        Sanctum::actingAs($this->user1);

        // Create test activities
        ActivityFeed::factory()->count(3)->create([
            'actor_id' => $this->user2->id,
            'is_public' => true,
        ]);

        $response = $this->getJson('/api/v1/core/social/feed');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'actor_id',
                            'action_type',
                            'actionable_type',
                            'actionable_id',
                            'data',
                            'is_public',
                            'created_at',
                            'updated_at',
                        ]
                    ],
                    'current_page',
                    'per_page',
                    'total',
                ]
            ]);
    }

    /** @test */
    public function user_can_filter_activity_feed_by_type()
    {
        Sanctum::actingAs($this->user1);

        // Create activities from followed user
        ActivityFeed::factory()->create([
            'actor_id' => $this->user2->id,
            'action_type' => 'event_created',
            'is_public' => true,
        ]);

        // Create own activity
        ActivityFeed::factory()->create([
            'actor_id' => $this->user1->id,
            'action_type' => 'profile_updated',
            'is_public' => true,
        ]);

        $response = $this->getJson('/api/v1/core/social/feed?type=own');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals($this->user1->id, $data[0]['actor_id']);
    }

    /** @test */
    public function user_can_get_specific_user_activities()
    {
        Sanctum::actingAs($this->user1);

        ActivityFeed::factory()->count(2)->create([
            'actor_id' => $this->user2->id,
            'is_public' => true,
        ]);

        ActivityFeed::factory()->create([
            'actor_id' => $this->user3->id,
            'is_public' => true,
        ]);

        $response = $this->getJson("/api/v1/core/social/users/{$this->user2->id}/activities");

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(2, $data);
        foreach ($data as $activity) {
            $this->assertEquals($this->user2->id, $activity['actor_id']);
        }
    }

    /** @test */
    public function user_can_create_activity()
    {
        Sanctum::actingAs($this->user1);

        $activityData = [
            'action_type' => 'event_created',
            'actionable_type' => 'App\\Models\\Core\\Event',
            'actionable_id' => 1,
            'data' => [
                'event_title' => 'New Event',
                'event_category' => 'music',
            ],
            'is_public' => true,
        ];

        $response = $this->postJson('/api/v1/core/social/activities', $activityData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'actor_id',
                    'action_type',
                    'actionable_type',
                    'actionable_id',
                    'data',
                    'is_public',
                ]
            ]);

        $this->assertDatabaseHas('activity_feeds', [
            'actor_id' => $this->user1->id,
            'action_type' => 'event_created',
            'actionable_type' => 'App\\Models\\Core\\Event',
            'actionable_id' => 1,
        ]);
    }

    /** @test */
    public function user_can_get_conversations()
    {
        Sanctum::actingAs($this->user1);

        // Create a conversation
        $conversation = Conversation::factory()->create();
        $conversation->participants()->attach([$this->user1->id, $this->user2->id]);

        $response = $this->getJson('/api/v1/core/social/conversations');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'last_message_at',
                            'is_active',
                            'created_at',
                            'updated_at',
                        ]
                    ],
                    'current_page',
                    'per_page',
                    'total',
                ]
            ]);
    }

    /** @test */
    public function user_can_get_conversation_messages()
    {
        Sanctum::actingAs($this->user1);

        $conversation = Conversation::factory()->create();
        $conversation->participants()->attach([$this->user1->id, $this->user2->id]);

        // Create messages
        DirectMessage::factory()->count(3)->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $this->user2->id,
            'recipient_id' => $this->user1->id,
        ]);

        $response = $this->getJson("/api/v1/core/social/conversations/{$conversation->id}/messages");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'conversation_id',
                            'sender_id',
                            'recipient_id',
                            'content',
                            'message_type',
                            'delivered_at',
                            'read_at',
                            'created_at',
                            'updated_at',
                        ]
                    ]
                ]
            ]);
    }

    /** @test */
    public function user_can_send_message()
    {
        Sanctum::actingAs($this->user1);

        $messageData = [
            'recipient_id' => $this->user2->id,
            'content' => 'Hello there! How are you doing?',
            'message_type' => 'text',
        ];

        $response = $this->postJson('/api/v1/core/social/messages', $messageData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'conversation_id',
                    'sender_id',
                    'recipient_id',
                    'content',
                    'message_type',
                    'delivered_at',
                ]
            ]);

        $this->assertDatabaseHas('direct_messages', [
            'sender_id' => $this->user1->id,
            'recipient_id' => $this->user2->id,
            'content' => 'Hello there! How are you doing?',
            'message_type' => 'text',
        ]);
    }

    /** @test */
    public function user_can_mark_message_as_read()
    {
        Sanctum::actingAs($this->user1);

        $conversation = Conversation::factory()->create();
        $conversation->participants()->attach([$this->user1->id, $this->user2->id]);

        $message = DirectMessage::factory()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $this->user2->id,
            'recipient_id' => $this->user1->id,
            'read_at' => null,
        ]);

        $response = $this->putJson("/api/v1/core/social/messages/{$message->id}/read");

        $response->assertStatus(200);

        $message->refresh();
        $this->assertNotNull($message->read_at);
    }

    /** @test */
    public function user_can_get_unread_message_count()
    {
        Sanctum::actingAs($this->user1);

        $conversation = Conversation::factory()->create();
        $conversation->participants()->attach([$this->user1->id, $this->user2->id]);

        // Create unread messages
        DirectMessage::factory()->count(3)->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $this->user2->id,
            'recipient_id' => $this->user1->id,
            'read_at' => null,
        ]);

        // Create read message
        DirectMessage::factory()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $this->user2->id,
            'recipient_id' => $this->user1->id,
            'read_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/core/social/messages/unread-count');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'unread_count' => 3,
                ]
            ]);
    }

    /** @test */
    public function user_can_start_new_conversation()
    {
        Sanctum::actingAs($this->user1);

        $conversationData = [
            'participant_id' => $this->user2->id,
            'initial_message' => 'Hey, let\'s start chatting!',
        ];

        $response = $this->postJson('/api/v1/core/social/conversations/start', $conversationData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'conversation' => [
                        'id',
                        'last_message_at',
                        'is_active',
                    ],
                    'message' => [
                        'id',
                        'content',
                        'sender_id',
                        'recipient_id',
                    ]
                ]
            ]);

        $this->assertDatabaseHas('conversations', [
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('direct_messages', [
            'sender_id' => $this->user1->id,
            'recipient_id' => $this->user2->id,
            'content' => 'Hey, let\'s start chatting!',
        ]);
    }

    /** @test */
    public function user_can_get_notifications()
    {
        Sanctum::actingAs($this->user1);

        // Create test notifications
        UserNotification::factory()->count(3)->create([
            'user_id' => $this->user1->id,
        ]);

        $response = $this->getJson('/api/v1/core/social/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'user_id',
                            'type',
                            'title',
                            'message',
                            'data',
                            'read_at',
                            'action_url',
                            'created_at',
                            'updated_at',
                        ]
                    ]
                ]
            ]);
    }

    /** @test */
    public function user_can_mark_notification_as_read()
    {
        Sanctum::actingAs($this->user1);

        $notification = UserNotification::factory()->create([
            'user_id' => $this->user1->id,
            'read_at' => null,
        ]);

        $response = $this->putJson("/api/v1/core/social/notifications/{$notification->id}/read");

        $response->assertStatus(200);

        $notification->refresh();
        $this->assertNotNull($notification->read_at);
    }

    /** @test */
    public function user_can_get_unread_notification_count()
    {
        Sanctum::actingAs($this->user1);

        // Create unread notifications
        UserNotification::factory()->count(2)->create([
            'user_id' => $this->user1->id,
            'read_at' => null,
        ]);

        // Create read notification
        UserNotification::factory()->create([
            'user_id' => $this->user1->id,
            'read_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/core/social/notifications/unread-count');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'unread_count' => 2,
                ]
            ]);
    }

    /** @test */
    public function user_cannot_access_others_conversations()
    {
        Sanctum::actingAs($this->user3);

        $conversation = Conversation::factory()->create();
        $conversation->participants()->attach([$this->user1->id, $this->user2->id]);

        $response = $this->getJson("/api/v1/core/social/conversations/{$conversation->id}/messages");

        $response->assertStatus(403);
    }

    /** @test */
    public function user_cannot_read_others_notifications()
    {
        Sanctum::actingAs($this->user2);

        $notification = UserNotification::factory()->create([
            'user_id' => $this->user1->id,
        ]);

        $response = $this->putJson("/api/v1/core/social/notifications/{$notification->id}/read");

        $response->assertStatus(403);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_social_features()
    {
        $response = $this->getJson('/api/v1/core/social/feed');
        $response->assertStatus(401);

        $response = $this->getJson('/api/v1/core/social/conversations');
        $response->assertStatus(401);

        $response = $this->getJson('/api/v1/core/social/notifications');
        $response->assertStatus(401);
    }
}
