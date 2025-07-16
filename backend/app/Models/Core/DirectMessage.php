<?php

namespace App\Models\Core;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * Direct Message Model
 *
 * Manages direct messaging between users with conversation threading,
 * read status tracking, message types, and reply functionality.
 */
class DirectMessage extends Model
{
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'recipient_id',
        'message_content',
        'message_type',
        'attachments',
        'metadata',
        'is_read',
        'read_at',
        'is_edited',
        'edited_at',
        'is_deleted',
        'deleted_at',
        'reply_to_id',
    ];

    protected $casts = [
        'attachments' => 'array',
        'metadata' => 'array',
        'is_read' => 'boolean',
        'is_edited' => 'boolean',
        'is_deleted' => 'boolean',
        'read_at' => 'datetime',
        'edited_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Message types constants
     */
    public const MESSAGE_TYPES = [
        'text' => 'Text message',
        'image' => 'Image attachment',
        'file' => 'File attachment',
        'location' => 'Location share',
        'event_share' => 'Event share',
    ];

    // Relationships

    /**
     * Get the sender of the message.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get the recipient of the message.
     */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /**
     * Get the message this is a reply to.
     */
    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reply_to_id');
    }

    /**
     * Get replies to this message.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'reply_to_id');
    }

    // Scopes

    /**
     * Scope to filter by conversation.
     */
    public function scopeInConversation(Builder $query, string $conversationId): Builder
    {
        return $query->where('conversation_id', $conversationId);
    }

    /**
     * Scope to filter by sender.
     */
    public function scopeFromSender(Builder $query, int $senderId): Builder
    {
        return $query->where('sender_id', $senderId);
    }

    /**
     * Scope to filter by recipient.
     */
    public function scopeToRecipient(Builder $query, int $recipientId): Builder
    {
        return $query->where('recipient_id', $recipientId);
    }

    /**
     * Scope to get unread messages.
     */
    public function scopeUnread(Builder $query): Builder
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope to get non-deleted messages.
     */
    public function scopeNotDeleted(Builder $query): Builder
    {
        return $query->where('is_deleted', false);
    }

    /**
     * Scope to get messages between two users.
     */
    public function scopeBetweenUsers(Builder $query, int $user1Id, int $user2Id): Builder
    {
        return $query->where(function ($q) use ($user1Id, $user2Id) {
            $q->where('sender_id', $user1Id)->where('recipient_id', $user2Id);
        })->orWhere(function ($q) use ($user1Id, $user2Id) {
            $q->where('sender_id', $user2Id)->where('recipient_id', $user1Id);
        });
    }

    /**
     * Scope to get recent messages.
     */
    public function scopeRecent(Builder $query, int $hours = 24): Builder
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }

    /**
     * Scope to order by newest first.
     */
    public function scopeNewest(Builder $query): Builder
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Scope to order by oldest first.
     */
    public function scopeOldest(Builder $query): Builder
    {
        return $query->orderBy('created_at', 'asc');
    }

    // Business Logic Methods

    /**
     * Mark message as read.
     */
    public function markAsRead(): bool
    {
        if ($this->is_read) {
            return true;
        }

        return $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    /**
     * Mark message as unread.
     */
    public function markAsUnread(): bool
    {
        return $this->update([
            'is_read' => false,
            'read_at' => null,
        ]);
    }

    /**
     * Soft delete message.
     */
    public function softDelete(): bool
    {
        return $this->update([
            'is_deleted' => true,
            'deleted_at' => now(),
        ]);
    }

    /**
     * Restore soft deleted message.
     */
    public function restore(): bool
    {
        return $this->update([
            'is_deleted' => false,
            'deleted_at' => null,
        ]);
    }

    /**
     * Edit message content.
     */
    public function editContent(string $newContent): bool
    {
        return $this->update([
            'message_content' => $newContent,
            'is_edited' => true,
            'edited_at' => now(),
        ]);
    }

    /**
     * Check if message can be edited.
     */
    public function canBeEdited(): bool
    {
        // Messages can be edited within 15 minutes of sending
        return $this->created_at->isAfter(now()->subMinutes(15)) && !$this->is_deleted;
    }

    /**
     * Check if message can be deleted.
     */
    public function canBeDeleted(): bool
    {
        return !$this->is_deleted;
    }

    /**
     * Get conversation participants.
     */
    public function getConversationParticipants(): array
    {
        return [$this->sender_id, $this->recipient_id];
    }

    /**
     * Check if user is participant in this message.
     */
    public function isParticipant(int $userId): bool
    {
        return in_array($userId, $this->getConversationParticipants());
    }

    /**
     * Get the other participant (not the given user).
     */
    public function getOtherParticipant(int $userId): ?User
    {
        if ($this->sender_id === $userId) {
            return $this->recipient;
        } elseif ($this->recipient_id === $userId) {
            return $this->sender;
        }

        return null;
    }

    /**
     * Get message type label.
     */
    public function getMessageTypeLabelAttribute(): string
    {
        return self::MESSAGE_TYPES[$this->message_type] ?? $this->message_type;
    }

    /**
     * Check if message has attachments.
     */
    public function hasAttachments(): bool
    {
        return !empty($this->attachments);
    }

    /**
     * Get attachment count.
     */
    public function getAttachmentCount(): int
    {
        return count($this->attachments ?? []);
    }

    /**
     * Generate conversation ID between two users.
     */
    public static function generateConversationId(int $user1Id, int $user2Id): string
    {
        $ids = [$user1Id, $user2Id];
        sort($ids);
        return 'conv_' . implode('_', $ids);
    }

    /**
     * Create a new message.
     */
    public static function createMessage(array $data): self
    {
        $conversationId = $data['conversation_id'] ?? self::generateConversationId(
            $data['sender_id'],
            $data['recipient_id']
        );

        return self::create([
            'conversation_id' => $conversationId,
            'sender_id' => $data['sender_id'],
            'recipient_id' => $data['recipient_id'],
            'message_content' => $data['message_content'],
            'message_type' => $data['message_type'] ?? 'text',
            'attachments' => $data['attachments'] ?? null,
            'metadata' => $data['metadata'] ?? null,
            'reply_to_id' => $data['reply_to_id'] ?? null,
        ]);
    }

    /**
     * Get conversation messages.
     */
    public static function getConversation(string $conversationId, int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return self::inConversation($conversationId)
                  ->notDeleted()
                  ->oldest()
                  ->limit($limit)
                  ->with(['sender', 'recipient', 'replyTo'])
                  ->get();
    }

    /**
     * Mark all messages in conversation as read for user.
     */
    public static function markConversationAsRead(string $conversationId, int $userId): int
    {
        return self::inConversation($conversationId)
                  ->where('recipient_id', $userId)
                  ->unread()
                  ->update([
                      'is_read' => true,
                      'read_at' => now(),
                  ]);
    }

    /**
     * Get unread message count for user.
     */
    public static function getUnreadCountForUser(int $userId): int
    {
        return self::where('recipient_id', $userId)
                  ->unread()
                  ->notDeleted()
                  ->count();
    }
}
