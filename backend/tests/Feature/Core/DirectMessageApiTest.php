<?php

namespace Tests\Feature\Core;

use App\Models\User;
use App\Models\Core\DirectMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class DirectMessageApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $user;
    private User $recipient;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->recipient = User::factory()->create();
    }

    /** @test */
    public function user_can_send_message()
    {
        $messageData = [
            'recipient_id' => $this->recipient->id,
            'message_content' => 'Hello, this is a test message!',
            'message_type' => 'text',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/core/messages/send', $messageData);

        $response->assertCreated()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'conversation_id',
                    'message_content',
                    'message_type',
                    'sender',
                    'recipient',
                ]
            ]);

        $this->assertDatabaseHas('direct_messages', [
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
            'message_content' => 'Hello, this is a test message!',
        ]);
    }

    /** @test */
    public function user_can_get_conversations_list()
    {
        // Create some messages
        DirectMessage::factory()->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
            'message_content' => 'Hello!',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/messages/conversations');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'conversation_id',
                            'other_user',
                            'latest_message',
                            'unread_count',
                        ]
                    ]
                ]
            ]);
    }

    /** @test */
    public function user_can_get_conversation_messages()
    {
        $message = DirectMessage::factory()->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
        ]);

        $conversationId = $message->conversation_id;

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/core/messages/conversation/{$conversationId}");

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'message_content',
                            'sender',
                            'recipient',
                            'created_at',
                        ]
                    ]
                ]
            ]);
    }

    /** @test */
    public function user_can_edit_their_message()
    {
        $message = DirectMessage::factory()->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
            'message_content' => 'Original message',
            'created_at' => now()->subMinutes(5), // Within edit window
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/core/messages/{$message->id}", [
                'message_content' => 'Edited message',
            ]);

        $response->assertOk();
        
        $this->assertEquals('Edited message', $message->fresh()->message_content);
        $this->assertTrue($message->fresh()->is_edited);
    }

    /** @test */
    public function user_can_delete_their_message()
    {
        $message = DirectMessage::factory()->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
            'created_at' => now()->subMinutes(5), // Within delete window
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/core/messages/{$message->id}");

        $response->assertOk();
        
        $this->assertTrue($message->fresh()->is_deleted);
    }

    /** @test */
    public function user_can_mark_message_as_read()
    {
        $message = DirectMessage::factory()->create([
            'sender_id' => $this->recipient->id,
            'recipient_id' => $this->user->id,
            'is_read' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/core/messages/{$message->id}/read");

        $response->assertOk();
        
        $this->assertTrue($message->fresh()->is_read);
    }

    /** @test */
    public function user_can_mark_conversation_as_read()
    {
        $message = DirectMessage::factory()->create([
            'sender_id' => $this->recipient->id,
            'recipient_id' => $this->user->id,
            'is_read' => false,
        ]);

        $conversationId = $message->conversation_id;

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/core/messages/conversation/{$conversationId}/read");

        $response->assertOk()
            ->assertJsonPath('data.marked_count', 1);
    }

    /** @test */
    public function user_can_search_messages()
    {
        DirectMessage::factory()->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
            'message_content' => 'This is a searchable message',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/messages/search?query=searchable');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'message_content',
                            'sender',
                            'recipient',
                        ]
                    ]
                ]
            ]);
    }

    /** @test */
    public function user_can_get_unread_message_count()
    {
        DirectMessage::factory()->count(3)->create([
            'sender_id' => $this->recipient->id,
            'recipient_id' => $this->user->id,
            'is_read' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/core/messages/unread-count');

        $response->assertOk()
            ->assertJsonPath('data.unread_count', 3);
    }

    /** @test */
    public function user_can_report_inappropriate_message()
    {
        $message = DirectMessage::factory()->create([
            'sender_id' => $this->recipient->id,
            'recipient_id' => $this->user->id,
            'message_content' => 'Inappropriate content',
        ]);

        $reportData = [
            'reason' => 'harassment',
            'description' => 'This message contains harassment',
        ];

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/core/messages/{$message->id}/report", $reportData);

        $response->assertOk();
    }

    /** @test */
    public function user_cannot_send_message_to_themselves()
    {
        $messageData = [
            'recipient_id' => $this->user->id,
            'message_content' => 'Message to self',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/core/messages/send', $messageData);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['recipient_id']);
    }

    /** @test */
    public function user_cannot_edit_others_messages()
    {
        $message = DirectMessage::factory()->create([
            'sender_id' => $this->recipient->id,
            'recipient_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/core/messages/{$message->id}", [
                'message_content' => 'Trying to edit others message',
            ]);

        $response->assertNotFound();
    }

    /** @test */
    public function user_cannot_access_conversation_they_are_not_part_of()
    {
        $otherUser = User::factory()->create();
        $message = DirectMessage::factory()->create([
            'sender_id' => $this->recipient->id,
            'recipient_id' => $otherUser->id,
        ]);

        $conversationId = $message->conversation_id;

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/core/messages/conversation/{$conversationId}");

        $response->assertForbidden();
    }

    /** @test */
    public function message_validation_works_correctly()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/core/messages/send', [
                'recipient_id' => 999, // Non-existent user
                'message_content' => '', // Empty content
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['recipient_id', 'message_content']);
    }
}
