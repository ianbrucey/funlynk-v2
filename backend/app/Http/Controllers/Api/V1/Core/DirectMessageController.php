<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Core\DirectMessageResource;
use App\Models\Core\DirectMessage;
use App\Services\Core\DirectMessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Direct Message Controller.
 *
 * Handles direct messaging API endpoints for Core Funlynk users including
 * conversation management, message sending, read status, and search functionality.
 */
class DirectMessageController extends BaseApiController
{
    public function __construct(
        private DirectMessageService $directMessageService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get user's conversations list.
     */
    public function conversations(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'search' => 'sometimes|string|max:255',
                'unread_only' => 'sometimes|boolean',
                'limit' => 'sometimes|integer|min:1|max:100',
                'offset' => 'sometimes|integer|min:0',
            ]);

            $conversations = $this->directMessageService->getUserConversations(
                auth()->id(),
                $request->validated()
            );

            return $this->paginatedResponse($conversations, 'Conversations retrieved successfully');
        });
    }

    /**
     * Get messages in a conversation.
     */
    public function conversation(string $conversationId, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $conversationId) {
            $request->validate([
                'limit' => 'sometimes|integer|min:1|max:100',
                'before_id' => 'sometimes|integer|exists:direct_messages,id',
                'after_id' => 'sometimes|integer|exists:direct_messages,id',
            ]);

            // Verify user is participant in conversation
            if (!$this->directMessageService->isUserInConversation(auth()->id(), $conversationId)) {
                return $this->forbiddenResponse('You do not have access to this conversation');
            }

            $messages = $this->directMessageService->getConversationMessages(
                $conversationId,
                $request->validated()
            );

            // Mark messages as read
            $this->directMessageService->markConversationAsRead($conversationId, auth()->id());

            return $this->paginatedResponse($messages, 'Conversation messages retrieved successfully');
        });
    }

    /**
     * Send a new message.
     */
    public function send(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'recipient_id' => 'required|integer|exists:users,id|different:' . auth()->id(),
                'message_content' => 'required|string|max:2000',
                'message_type' => 'sometimes|string|in:text,image,file,location,event_share',
                'attachments' => 'sometimes|array|max:5',
                'attachments.*' => 'string',
                'reply_to_id' => 'sometimes|integer|exists:direct_messages,id',
            ]);

            $message = $this->directMessageService->sendMessage(
                auth()->id(),
                $request->validated()
            );

            return $this->createdResponse(
                new DirectMessageResource($message),
                'Message sent successfully'
            );
        });
    }

    /**
     * Get specific message by ID.
     */
    public function show(int $id): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($id) {
            $message = DirectMessage::findOrFail($id);

            if (!$message->isParticipant(auth()->id())) {
                return $this->forbiddenResponse('You do not have access to this message');
            }

            return $this->successResponse(
                new DirectMessageResource($message),
                'Message retrieved successfully'
            );
        });
    }

    /**
     * Edit a message.
     */
    public function update(int $id, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $request->validate([
                'message_content' => 'required|string|max:2000',
            ]);

            $message = DirectMessage::where('sender_id', auth()->id())->findOrFail($id);

            if (!$message->canBeEdited()) {
                return $this->badRequestResponse('Message cannot be edited');
            }

            $updatedMessage = $this->directMessageService->editMessage(
                $message,
                $request->input('message_content')
            );

            return $this->successResponse(
                new DirectMessageResource($updatedMessage),
                'Message updated successfully'
            );
        });
    }

    /**
     * Delete a message.
     */
    public function destroy(int $id): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($id) {
            $message = DirectMessage::where('sender_id', auth()->id())->findOrFail($id);

            if (!$message->canBeDeleted()) {
                return $this->badRequestResponse('Message cannot be deleted');
            }

            $this->directMessageService->deleteMessage($message);

            return $this->deletedResponse('Message deleted successfully');
        });
    }

    /**
     * Mark message as read.
     */
    public function markAsRead(int $id): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($id) {
            $message = DirectMessage::where('recipient_id', auth()->id())->findOrFail($id);
            
            $message->markAsRead();

            return $this->successResponse(
                new DirectMessageResource($message),
                'Message marked as read'
            );
        });
    }

    /**
     * Mark conversation as read.
     */
    public function markConversationAsRead(string $conversationId): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($conversationId) {
            if (!$this->directMessageService->isUserInConversation(auth()->id(), $conversationId)) {
                return $this->forbiddenResponse('You do not have access to this conversation');
            }

            $count = $this->directMessageService->markConversationAsRead($conversationId, auth()->id());

            return $this->successResponse(
                ['marked_count' => $count],
                "Marked {$count} messages as read"
            );
        });
    }

    /**
     * Search messages.
     */
    public function search(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'query' => 'required|string|min:2|max:255',
                'conversation_id' => 'sometimes|string',
                'message_type' => 'sometimes|string|in:text,image,file,location,event_share',
                'date_from' => 'sometimes|date',
                'date_to' => 'sometimes|date|after_or_equal:date_from',
                'limit' => 'sometimes|integer|min:1|max:100',
                'offset' => 'sometimes|integer|min:0',
            ]);

            $results = $this->directMessageService->searchMessages(
                auth()->id(),
                $request->validated()
            );

            return $this->paginatedResponse($results, 'Message search completed successfully');
        });
    }

    /**
     * Get unread message count.
     */
    public function unreadCount(): JsonResponse
    {
        return $this->handleApiOperation(request(), function () {
            $count = DirectMessage::getUnreadCountForUser(auth()->id());

            return $this->successResponse(
                ['unread_count' => $count],
                'Unread count retrieved successfully'
            );
        });
    }

    /**
     * Get message statistics.
     */
    public function statistics(): JsonResponse
    {
        return $this->handleApiOperation(request(), function () {
            $stats = $this->directMessageService->getUserMessageStatistics(auth()->id());

            return $this->successResponse($stats, 'Message statistics retrieved successfully');
        });
    }

    /**
     * Report inappropriate message.
     */
    public function report(int $id, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $request->validate([
                'reason' => 'required|string|in:spam,harassment,inappropriate_content,threats,other',
                'description' => 'sometimes|string|max:500',
            ]);

            $message = DirectMessage::findOrFail($id);

            if (!$message->isParticipant(auth()->id())) {
                return $this->forbiddenResponse('You do not have access to this message');
            }

            $report = $this->directMessageService->reportMessage(
                $message,
                auth()->id(),
                $request->validated()
            );

            return $this->successResponse($report, 'Message reported successfully');
        });
    }

    /**
     * Block user from messaging.
     */
    public function blockUser(int $userId): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($userId) {
            if ($userId === auth()->id()) {
                return $this->badRequestResponse('You cannot block yourself');
            }

            $result = $this->directMessageService->blockUser(auth()->id(), $userId);

            return $this->successResponse($result, 'User blocked successfully');
        });
    }

    /**
     * Unblock user from messaging.
     */
    public function unblockUser(int $userId): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($userId) {
            $result = $this->directMessageService->unblockUser(auth()->id(), $userId);

            return $this->successResponse($result, 'User unblocked successfully');
        });
    }
}
