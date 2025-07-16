<?php

namespace App\Services\Core;

use App\Models\User;
use App\Models\Core\DirectMessage;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Broadcast;
use Carbon\Carbon;
use Exception;

/**
 * Direct Message Service
 *
 * Manages direct messaging between users including conversation management,
 * message threading, real-time delivery, and read status tracking.
 */
class DirectMessageService
{
    public function __construct(
        private LoggingService $loggingService,
        private NotificationService $notificationService
    ) {}

    /**
     * Get user's conversations.
     *
     * @param int $userId
     * @param array $options
     * @return LengthAwarePaginator
     */
    public function getUserConversations(int $userId, array $options = []): LengthAwarePaginator
    {
        $page = $options['page'] ?? 1;
        $perPage = min($options['per_page'] ?? 20, 50);

        // Get unique conversations for the user
        $conversationIds = DirectMessage::where(function ($query) use ($userId) {
            $query->where('sender_id', $userId)->orWhere('recipient_id', $userId);
        })
        ->select('conversation_id')
        ->distinct()
        ->pluck('conversation_id');

        // Get latest message for each conversation
        $conversations = collect();
        foreach ($conversationIds as $conversationId) {
            $latestMessage = DirectMessage::where('conversation_id', $conversationId)
                ->with(['sender', 'recipient'])
                ->orderBy('created_at', 'desc')
                ->first();

            if ($latestMessage) {
                $otherUser = $latestMessage->getOtherParticipant($userId);
                $unreadCount = DirectMessage::where('conversation_id', $conversationId)
                    ->where('recipient_id', $userId)
                    ->where('is_read', false)
                    ->count();

                $conversations->push([
                    'conversation_id' => $conversationId,
                    'other_user' => $otherUser,
                    'latest_message' => $latestMessage,
                    'unread_count' => $unreadCount,
                    'updated_at' => $latestMessage->created_at,
                ]);
            }
        }

        // Apply search filter
        if (isset($options['search'])) {
            $search = strtolower($options['search']);
            $conversations = $conversations->filter(function ($conv) use ($search) {
                return str_contains(strtolower($conv['other_user']->name), $search) ||
                       str_contains(strtolower($conv['latest_message']->message_content), $search);
            });
        }

        // Apply unread filter
        if (isset($options['unread_only']) && $options['unread_only']) {
            $conversations = $conversations->filter(function ($conv) {
                return $conv['unread_count'] > 0;
            });
        }

        // Sort by latest message
        $conversations = $conversations->sortByDesc('updated_at');

        // Manual pagination
        $total = $conversations->count();
        $offset = ($page - 1) * $perPage;
        $items = $conversations->slice($offset, $perPage)->values();

        return new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => request()->url()]
        );
    }

    /**
     * Check if user is in conversation.
     *
     * @param int $userId
     * @param string $conversationId
     * @return bool
     */
    public function isUserInConversation(int $userId, string $conversationId): bool
    {
        return DirectMessage::where('conversation_id', $conversationId)
            ->where(function ($query) use ($userId) {
                $query->where('sender_id', $userId)->orWhere('recipient_id', $userId);
            })
            ->exists();
    }

    /**
     * Get conversation messages.
     *
     * @param string $conversationId
     * @param array $options
     * @return LengthAwarePaginator
     */
    public function getConversationMessages(string $conversationId, array $options = []): LengthAwarePaginator
    {
        $page = $options['page'] ?? 1;
        $perPage = min($options['per_page'] ?? 50, 100);

        $query = DirectMessage::where('conversation_id', $conversationId)
            ->with(['sender', 'recipient', 'replyTo'])
            ->where('is_deleted', false)
            ->orderBy('created_at', 'asc');

        // Apply pagination filters
        if (isset($options['before_id'])) {
            $query->where('id', '<', $options['before_id']);
        }

        if (isset($options['after_id'])) {
            $query->where('id', '>', $options['after_id']);
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Send a message.
     *
     * @param int $senderId
     * @param array $data
     * @return DirectMessage
     * @throws Exception
     */
    public function sendMessage(int $senderId, array $data): DirectMessage
    {
        try {
            $recipientId = $data['recipient_id'];

            // Check if users can message each other
            if (!$this->canUsersMessage($senderId, $recipientId)) {
                throw new Exception('Users cannot message each other');
            }

            // Create message
            $message = DirectMessage::createMessage([
                'sender_id' => $senderId,
                'recipient_id' => $recipientId,
                'message_content' => $data['message_content'],
                'message_type' => $data['message_type'] ?? 'text',
                'attachments' => $data['attachments'] ?? null,
                'reply_to_id' => $data['reply_to_id'] ?? null,
            ]);

            // Send notification
            $this->notificationService->sendNotification(
                $recipientId,
                'new_message',
                [
                    'sender_name' => $message->sender->name,
                    'message_preview' => substr($message->message_content, 0, 50),
                    'conversation_id' => $message->conversation_id,
                ]
            );

            $this->loggingService->logUserActivity(
                $senderId,
                'message_sent',
                'DirectMessage',
                $message->id,
                ['recipient_id' => $recipientId]
            );

            return $message;

        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'sender_id' => $senderId,
                'operation' => 'send_message'
            ]);

            throw $e;
        }
    }
    /**
     * Edit a message.
     *
     * @param DirectMessage $message
     * @param string $newContent
     * @return DirectMessage
     */
    public function editMessage(DirectMessage $message, string $newContent): DirectMessage
    {
        $message->editContent($newContent);

        $this->loggingService->logUserActivity(
            $message->sender_id,
            'message_edited',
            'DirectMessage',
            $message->id
        );

        return $message;
    }

    /**
     * Delete a message.
     *
     * @param DirectMessage $message
     * @return bool
     */
    public function deleteMessage(DirectMessage $message): bool
    {
        $result = $message->softDelete();

        $this->loggingService->logUserActivity(
            $message->sender_id,
            'message_deleted',
            'DirectMessage',
            $message->id
        );

        return $result;
    }

    /**
     * Mark conversation as read.
     *
     * @param string $conversationId
     * @param int $userId
     * @return int
     */
    public function markConversationAsRead(string $conversationId, int $userId): int
    {
        return DirectMessage::markConversationAsRead($conversationId, $userId);
    }

    /**
     * Search messages.
     *
     * @param int $userId
     * @param array $options
     * @return LengthAwarePaginator
     */
    public function searchMessages(int $userId, array $options = []): LengthAwarePaginator
    {
        $query = $options['query'];
        $page = $options['page'] ?? 1;
        $perPage = min($options['per_page'] ?? 20, 100);

        $messagesQuery = DirectMessage::where(function ($q) use ($userId) {
            $q->where('sender_id', $userId)->orWhere('recipient_id', $userId);
        })
        ->where('message_content', 'LIKE', "%{$query}%")
        ->where('is_deleted', false)
        ->with(['sender', 'recipient'])
        ->orderBy('created_at', 'desc');

        // Apply filters
        if (isset($options['conversation_id'])) {
            $messagesQuery->where('conversation_id', $options['conversation_id']);
        }

        if (isset($options['message_type'])) {
            $messagesQuery->where('message_type', $options['message_type']);
        }

        if (isset($options['date_from'])) {
            $messagesQuery->where('created_at', '>=', $options['date_from']);
        }

        if (isset($options['date_to'])) {
            $messagesQuery->where('created_at', '<=', $options['date_to']);
        }

        return $messagesQuery->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get user message statistics.
     *
     * @param int $userId
     * @return array
     */
    public function getUserMessageStatistics(int $userId): array
    {
        $sentMessages = DirectMessage::where('sender_id', $userId);
        $receivedMessages = DirectMessage::where('recipient_id', $userId);

        return [
            'total_sent' => (clone $sentMessages)->count(),
            'total_received' => (clone $receivedMessages)->count(),
            'unread_count' => DirectMessage::getUnreadCountForUser($userId),
            'sent_this_week' => (clone $sentMessages)->where('created_at', '>=', now()->subWeek())->count(),
            'sent_this_month' => (clone $sentMessages)->where('created_at', '>=', now()->subMonth())->count(),
            'conversations_count' => DirectMessage::where(function ($query) use ($userId) {
                $query->where('sender_id', $userId)->orWhere('recipient_id', $userId);
            })->distinct('conversation_id')->count(),
            'most_active_conversation' => $this->getMostActiveConversation($userId),
        ];
    }

    /**
     * Report a message.
     *
     * @param DirectMessage $message
     * @param int $reporterId
     * @param array $reportData
     * @return array
     */
    public function reportMessage(DirectMessage $message, int $reporterId, array $reportData): array
    {
        $report = [
            'message_id' => $message->id,
            'reporter_id' => $reporterId,
            'reason' => $reportData['reason'],
            'description' => $reportData['description'] ?? null,
            'reported_at' => now(),
        ];

        $this->loggingService->logUserActivity(
            $reporterId,
            'message_reported',
            'DirectMessage',
            $message->id,
            $report
        );

        return $report;
    }

    /**
     * Block user from messaging.
     *
     * @param int $userId
     * @param int $blockedUserId
     * @return array
     */
    public function blockUser(int $userId, int $blockedUserId): array
    {
        // This would typically involve a user_blocks table
        // For now, we'll just log the action
        $this->loggingService->logUserActivity(
            $userId,
            'user_blocked',
            'User',
            $blockedUserId
        );

        return [
            'blocked_user_id' => $blockedUserId,
            'blocked_at' => now(),
        ];
    }

    /**
     * Unblock user from messaging.
     *
     * @param int $userId
     * @param int $unblockedUserId
     * @return array
     */
    public function unblockUser(int $userId, int $unblockedUserId): array
    {
        $this->loggingService->logUserActivity(
            $userId,
            'user_unblocked',
            'User',
            $unblockedUserId
        );

        return [
            'unblocked_user_id' => $unblockedUserId,
            'unblocked_at' => now(),
        ];
    }
    /**
     * Get most active conversation for user.
     *
     * @param int $userId
     * @return string|null
     */
    private function getMostActiveConversation(int $userId): ?string
    {
        return DirectMessage::where(function ($query) use ($userId) {
            $query->where('sender_id', $userId)->orWhere('recipient_id', $userId);
        })
        ->select('conversation_id')
        ->groupBy('conversation_id')
        ->orderByRaw('COUNT(*) DESC')
        ->first()?->conversation_id;
    }

    /**
     * Check if users can message each other.
     *
     * @param int $userId1
     * @param int $userId2
     * @return bool
     */
    private function canUsersMessage(int $userId1, int $userId2): bool
    {
        // Users cannot message themselves
        if ($userId1 === $userId2) {
            return false;
        }

        // Check if both users exist and are active
        $users = User::whereIn('id', [$userId1, $userId2])
            ->count();

        return $users === 2;
    }
}
