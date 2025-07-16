<?php

namespace Database\Factories\Core;

use App\Models\Core\DirectMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Core\DirectMessage>
 */
class DirectMessageFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = DirectMessage::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();
        
        $messageTypes = ['text', 'image', 'file', 'location', 'event_share'];

        return [
            'conversation_id' => DirectMessage::generateConversationId($sender->id, $recipient->id),
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'message_content' => $this->faker->paragraph(),
            'message_type' => $this->faker->randomElement($messageTypes),
            'attachments' => null,
            'metadata' => null,
            'is_read' => $this->faker->boolean(60), // 60% chance of being read
            'read_at' => null,
            'is_edited' => false,
            'edited_at' => null,
            'is_deleted' => false,
            'deleted_at' => null,
            'reply_to_id' => null,
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (DirectMessage $message) {
            // Set read_at if message is read
            if ($message->is_read && !$message->read_at) {
                $message->read_at = $this->faker->dateTimeBetween($message->created_at ?? '-1 hour', 'now');
            }
        });
    }

    /**
     * Indicate that the message is unread.
     */
    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => false,
            'read_at' => null,
        ]);
    }

    /**
     * Indicate that the message is read.
     */
    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => true,
            'read_at' => $this->faker->dateTimeBetween('-1 hour', 'now'),
        ]);
    }

    /**
     * Indicate that the message is edited.
     */
    public function edited(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_edited' => true,
            'edited_at' => $this->faker->dateTimeBetween('-1 hour', 'now'),
        ]);
    }

    /**
     * Indicate that the message is deleted.
     */
    public function deleted(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_deleted' => true,
            'deleted_at' => $this->faker->dateTimeBetween('-1 hour', 'now'),
        ]);
    }

    /**
     * Create message of specific type.
     */
    public function ofType(string $type): static
    {
        return $this->state(fn (array $attributes) => [
            'message_type' => $type,
        ]);
    }

    /**
     * Create text message.
     */
    public function text(): static
    {
        return $this->state(fn (array $attributes) => [
            'message_type' => 'text',
            'message_content' => $this->faker->sentence(),
        ]);
    }

    /**
     * Create image message.
     */
    public function image(): static
    {
        return $this->state(fn (array $attributes) => [
            'message_type' => 'image',
            'message_content' => 'Shared an image',
            'attachments' => [
                'images' => [
                    [
                        'url' => $this->faker->imageUrl(),
                        'filename' => 'image.jpg',
                        'size' => $this->faker->numberBetween(100000, 5000000),
                    ]
                ]
            ],
        ]);
    }

    /**
     * Create file message.
     */
    public function file(): static
    {
        return $this->state(fn (array $attributes) => [
            'message_type' => 'file',
            'message_content' => 'Shared a file',
            'attachments' => [
                'files' => [
                    [
                        'url' => $this->faker->url(),
                        'filename' => 'document.pdf',
                        'size' => $this->faker->numberBetween(50000, 10000000),
                        'mime_type' => 'application/pdf',
                    ]
                ]
            ],
        ]);
    }

    /**
     * Create message with attachments.
     */
    public function withAttachments(): static
    {
        return $this->state(fn (array $attributes) => [
            'attachments' => [
                'files' => [
                    [
                        'url' => $this->faker->url(),
                        'filename' => $this->faker->word() . '.jpg',
                        'size' => $this->faker->numberBetween(100000, 2000000),
                    ]
                ]
            ],
        ]);
    }

    /**
     * Create message between specific users.
     */
    public function between(User $sender, User $recipient): static
    {
        return $this->state(fn (array $attributes) => [
            'conversation_id' => DirectMessage::generateConversationId($sender->id, $recipient->id),
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
        ]);
    }

    /**
     * Create message from specific sender.
     */
    public function from(User $sender): static
    {
        return $this->state(fn (array $attributes) => [
            'sender_id' => $sender->id,
            'conversation_id' => DirectMessage::generateConversationId(
                $sender->id, 
                $attributes['recipient_id'] ?? User::factory()->create()->id
            ),
        ]);
    }

    /**
     * Create message to specific recipient.
     */
    public function to(User $recipient): static
    {
        return $this->state(fn (array $attributes) => [
            'recipient_id' => $recipient->id,
            'conversation_id' => DirectMessage::generateConversationId(
                $attributes['sender_id'] ?? User::factory()->create()->id,
                $recipient->id
            ),
        ]);
    }

    /**
     * Create reply message.
     */
    public function replyTo(DirectMessage $originalMessage): static
    {
        return $this->state(fn (array $attributes) => [
            'conversation_id' => $originalMessage->conversation_id,
            'sender_id' => $originalMessage->recipient_id, // Reply from recipient
            'recipient_id' => $originalMessage->sender_id, // Reply to sender
            'reply_to_id' => $originalMessage->id,
        ]);
    }

    /**
     * Create message in specific conversation.
     */
    public function inConversation(string $conversationId): static
    {
        return $this->state(fn (array $attributes) => [
            'conversation_id' => $conversationId,
        ]);
    }

    /**
     * Create recent message.
     */
    public function recent(): static
    {
        return $this->state(fn (array $attributes) => [
            'created_at' => $this->faker->dateTimeBetween('-1 hour', 'now'),
        ]);
    }

    /**
     * Create old message.
     */
    public function old(): static
    {
        return $this->state(fn (array $attributes) => [
            'created_at' => $this->faker->dateTimeBetween('-1 month', '-1 week'),
        ]);
    }
}
