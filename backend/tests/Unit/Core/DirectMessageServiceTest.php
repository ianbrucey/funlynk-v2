<?php

namespace Tests\Unit\Core;

use App\Models\User;
use App\Models\Core\DirectMessage;
use App\Services\Core\DirectMessageService;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Pagination\LengthAwarePaginator;
use Mockery;
use Tests\TestCase;

class DirectMessageServiceTest extends TestCase
{
    use RefreshDatabase;

    private DirectMessageService $service;
    private $mockLoggingService;
    private $mockNotificationService;
    private User $user;
    private User $recipient;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->mockLoggingService = Mockery::mock(LoggingService::class);
        $this->mockNotificationService = Mockery::mock(NotificationService::class);
        
        $this->service = new DirectMessageService(
            $this->mockLoggingService,
            $this->mockNotificationService
        );
        
        $this->user = User::factory()->create();
        $this->recipient = User::factory()->create();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_can_get_user_conversations()
    {
        // Create messages between users
        DirectMessage::factory()->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
            'message_content' => 'Hello!',
        ]);

        $result = $this->service->getUserConversations($this->user->id);

        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
        $this->assertCount(1, $result->items());
        
        $conversation = $result->items()[0];
        $this->assertArrayHasKey('conversation_id', $conversation);
        $this->assertArrayHasKey('other_user', $conversation);
        $this->assertArrayHasKey('latest_message', $conversation);
        $this->assertArrayHasKey('unread_count', $conversation);
    }

    /** @test */
    public function it_can_check_if_user_is_in_conversation()
    {
        $message = DirectMessage::factory()->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
        ]);

        $conversationId = $message->conversation_id;

        $this->assertTrue($this->service->isUserInConversation($this->user->id, $conversationId));
        $this->assertTrue($this->service->isUserInConversation($this->recipient->id, $conversationId));
        
        $otherUser = User::factory()->create();
        $this->assertFalse($this->service->isUserInConversation($otherUser->id, $conversationId));
    }

    /** @test */
    public function it_can_get_conversation_messages()
    {
        $message = DirectMessage::factory()->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
        ]);

        $conversationId = $message->conversation_id;

        $result = $this->service->getConversationMessages($conversationId);

        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
        $this->assertCount(1, $result->items());
        $this->assertEquals($message->id, $result->items()[0]->id);
    }

    /** @test */
    public function it_can_send_message()
    {
        $messageData = [
            'recipient_id' => $this->recipient->id,
            'message_content' => 'Hello, this is a test message!',
            'message_type' => 'text',
        ];

        $this->mockNotificationService->shouldReceive('sendNotification')
            ->once()
            ->with(
                $this->recipient->id,
                'new_message',
                Mockery::type('array')
            );

        $this->mockLoggingService->shouldReceive('logUserActivity')
            ->once()
            ->with(
                $this->user->id,
                'message_sent',
                'DirectMessage',
                Mockery::type('int'),
                Mockery::type('array')
            );

        $result = $this->service->sendMessage($this->user->id, $messageData);

        $this->assertInstanceOf(DirectMessage::class, $result);
        $this->assertEquals($this->user->id, $result->sender_id);
        $this->assertEquals($this->recipient->id, $result->recipient_id);
        $this->assertEquals('Hello, this is a test message!', $result->message_content);
    }

    /** @test */
    public function it_can_edit_message()
    {
        $message = DirectMessage::factory()->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
            'message_content' => 'Original message',
            'created_at' => now()->subMinutes(5),
        ]);

        $this->mockLoggingService->shouldReceive('logUserActivity')
            ->once()
            ->with(
                $this->user->id,
                'message_edited',
                'DirectMessage',
                $message->id
            );

        $result = $this->service->editMessage($message, 'Edited message');

        $this->assertEquals('Edited message', $result->message_content);
        $this->assertTrue($result->is_edited);
        $this->assertNotNull($result->edited_at);
    }

    /** @test */
    public function it_can_delete_message()
    {
        $message = DirectMessage::factory()->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
        ]);

        $this->mockLoggingService->shouldReceive('logUserActivity')
            ->once()
            ->with(
                $this->user->id,
                'message_deleted',
                'DirectMessage',
                $message->id
            );

        $result = $this->service->deleteMessage($message);

        $this->assertTrue($result);
        $this->assertTrue($message->fresh()->is_deleted);
        $this->assertNotNull($message->fresh()->deleted_at);
    }

    /** @test */
    public function it_can_mark_conversation_as_read()
    {
        $message1 = DirectMessage::factory()->create([
            'sender_id' => $this->recipient->id,
            'recipient_id' => $this->user->id,
            'is_read' => false,
        ]);

        $message2 = DirectMessage::factory()->create([
            'conversation_id' => $message1->conversation_id,
            'sender_id' => $this->recipient->id,
            'recipient_id' => $this->user->id,
            'is_read' => false,
        ]);

        $count = $this->service->markConversationAsRead($message1->conversation_id, $this->user->id);

        $this->assertEquals(2, $count);
        $this->assertTrue($message1->fresh()->is_read);
        $this->assertTrue($message2->fresh()->is_read);
    }

    /** @test */
    public function it_can_search_messages()
    {
        DirectMessage::factory()->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
            'message_content' => 'This is a searchable message',
        ]);

        DirectMessage::factory()->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
            'message_content' => 'This is another message',
        ]);

        $result = $this->service->searchMessages($this->user->id, [
            'query' => 'searchable',
        ]);

        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
        $this->assertCount(1, $result->items());
        $this->assertStringContainsString('searchable', $result->items()[0]->message_content);
    }

    /** @test */
    public function it_can_get_user_message_statistics()
    {
        // Create sent messages
        DirectMessage::factory()->count(3)->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
            'created_at' => now()->subDays(3),
        ]);

        DirectMessage::factory()->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
            'created_at' => now()->subDays(1), // This week
        ]);

        // Create received messages
        DirectMessage::factory()->count(2)->create([
            'sender_id' => $this->recipient->id,
            'recipient_id' => $this->user->id,
            'is_read' => false,
        ]);

        $stats = $this->service->getUserMessageStatistics($this->user->id);

        $this->assertIsArray($stats);
        $this->assertArrayHasKey('total_sent', $stats);
        $this->assertArrayHasKey('total_received', $stats);
        $this->assertArrayHasKey('unread_count', $stats);
        $this->assertArrayHasKey('sent_this_week', $stats);
        $this->assertEquals(4, $stats['total_sent']);
        $this->assertEquals(2, $stats['total_received']);
        $this->assertEquals(2, $stats['unread_count']);
        $this->assertEquals(1, $stats['sent_this_week']);
    }

    /** @test */
    public function it_can_report_message()
    {
        $message = DirectMessage::factory()->create([
            'sender_id' => $this->recipient->id,
            'recipient_id' => $this->user->id,
        ]);

        $reportData = [
            'reason' => 'harassment',
            'description' => 'This message contains harassment',
        ];

        $this->mockLoggingService->shouldReceive('logUserActivity')
            ->once()
            ->with(
                $this->user->id,
                'message_reported',
                'DirectMessage',
                $message->id,
                Mockery::type('array')
            );

        $result = $this->service->reportMessage($message, $this->user->id, $reportData);

        $this->assertIsArray($result);
        $this->assertEquals($message->id, $result['message_id']);
        $this->assertEquals($this->user->id, $result['reporter_id']);
        $this->assertEquals('harassment', $result['reason']);
    }

    /** @test */
    public function it_can_block_user()
    {
        $this->mockLoggingService->shouldReceive('logUserActivity')
            ->once()
            ->with(
                $this->user->id,
                'user_blocked',
                'User',
                $this->recipient->id
            );

        $result = $this->service->blockUser($this->user->id, $this->recipient->id);

        $this->assertIsArray($result);
        $this->assertEquals($this->recipient->id, $result['blocked_user_id']);
        $this->assertArrayHasKey('blocked_at', $result);
    }

    /** @test */
    public function it_can_unblock_user()
    {
        $this->mockLoggingService->shouldReceive('logUserActivity')
            ->once()
            ->with(
                $this->user->id,
                'user_unblocked',
                'User',
                $this->recipient->id
            );

        $result = $this->service->unblockUser($this->user->id, $this->recipient->id);

        $this->assertIsArray($result);
        $this->assertEquals($this->recipient->id, $result['unblocked_user_id']);
        $this->assertArrayHasKey('unblocked_at', $result);
    }

    /** @test */
    public function it_prevents_sending_message_to_self()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Users cannot message each other');

        $this->service->sendMessage($this->user->id, [
            'recipient_id' => $this->user->id,
            'message_content' => 'Message to self',
        ]);
    }

    /** @test */
    public function conversation_search_filters_work()
    {
        $message1 = DirectMessage::factory()->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $this->recipient->id,
            'message_content' => 'Hello John!',
        ]);

        $otherUser = User::factory()->create(['name' => 'Jane Doe']);
        DirectMessage::factory()->create([
            'sender_id' => $this->user->id,
            'recipient_id' => $otherUser->id,
            'message_content' => 'Hello Jane!',
        ]);

        $result = $this->service->getUserConversations($this->user->id, [
            'search' => 'john',
        ]);

        $this->assertCount(1, $result->items());
    }
}
