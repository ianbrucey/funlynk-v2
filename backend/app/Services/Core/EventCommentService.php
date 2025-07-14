<?php

namespace App\Services\Core;

use App\Models\User;
use App\Models\Core\Event;
use App\Models\Core\EventComment;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Exception;

/**
 * Event Comment Service
 * 
 * Handles event comment business logic including CRUD and moderation
 */
class EventCommentService
{
    public function __construct(
        private LoggingService $loggingService,
        private NotificationService $notificationService
    ) {}

    /**
     * Get comments for an event
     *
     * @param Event $event
     * @param bool $includeReplies
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getEventComments(Event $event, bool $includeReplies = true, int $perPage = 15): LengthAwarePaginator
    {
        $query = $event->comments()
            ->with(['user', 'replies.user'])
            ->approved()
            ->topLevel()
            ->orderByDesc('created_at');

        if (!$includeReplies) {
            $query->without('replies');
        }

        return $query->paginate($perPage);
    }

    /**
     * Create a new comment
     *
     * @param User $user
     * @param Event $event
     * @param array $data
     * @return EventComment
     * @throws Exception
     */
    public function createComment(User $user, Event $event, array $data): EventComment
    {
        try {
            DB::beginTransaction();

            // Auto-approve comments from event hosts and admins
            $isApproved = $user->hasRole('admin') || $event->host_id === $user->id;

            $comment = EventComment::create([
                'event_id' => $event->id,
                'user_id' => $user->id,
                'parent_id' => $data['parent_id'] ?? null,
                'content' => $data['content'],
                'is_approved' => $isApproved,
            ]);

            // Load relationships
            $comment->load(['user', 'event']);

            // Process mentions in the comment
            $this->processMentions($comment);

            // Notify event host about new comment (if not from host)
            if ($event->host_id !== $user->id) {
                $this->notificationService->createNotification(
                    $event->host_id,
                    'event_comment',
                    'New Comment',
                    "{$user->first_name} {$user->last_name} commented on your event '{$event->title}'",
                    [
                        'event_id' => $event->id,
                        'event_title' => $event->title,
                        'comment_id' => $comment->id,
                        'user_id' => $user->id,
                        'user_name' => $user->first_name . ' ' . $user->last_name,
                    ]
                );
            }

            // If this is a reply, notify the parent comment author
            if (isset($data['parent_id'])) {
                $parentComment = EventComment::find($data['parent_id']);
                if ($parentComment && $parentComment->user_id !== $user->id) {
                    $this->notificationService->createNotification(
                        $parentComment->user_id,
                        'comment_reply',
                        'Comment Reply',
                        "{$user->first_name} {$user->last_name} replied to your comment",
                        [
                            'event_id' => $event->id,
                            'event_title' => $event->title,
                            'comment_id' => $comment->id,
                            'parent_comment_id' => $parentComment->id,
                            'user_id' => $user->id,
                            'user_name' => $user->first_name . ' ' . $user->last_name,
                        ]
                    );
                }
            }

            // Log the activity
            $this->loggingService->logUserActivity(
                $user->id,
                'comment_created',
                'EventComment',
                $comment->id,
                [
                    'event_id' => $event->id,
                    'event_title' => $event->title,
                    'is_reply' => isset($data['parent_id']),
                ]
            );

            DB::commit();
            return $comment;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'user_id' => $user->id,
                'event_id' => $event->id,
                'operation' => 'create_comment'
            ]);
            throw $e;
        }
    }

    /**
     * Update a comment
     *
     * @param EventComment $comment
     * @param array $data
     * @return EventComment
     * @throws Exception
     */
    public function updateComment(EventComment $comment, array $data): EventComment
    {
        try {
            $comment->update([
                'content' => $data['content'],
            ]);

            // Process mentions in the updated comment
            $this->processMentions($comment);

            // Log the activity
            $this->loggingService->logUserActivity(
                $comment->user_id,
                'comment_updated',
                'EventComment',
                $comment->id,
                [
                    'event_id' => $comment->event_id,
                    'event_title' => $comment->event->title,
                ]
            );

            return $comment;
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'comment_id' => $comment->id,
                'operation' => 'update_comment'
            ]);
            throw $e;
        }
    }

    /**
     * Delete a comment
     *
     * @param EventComment $comment
     * @return bool
     * @throws Exception
     */
    public function deleteComment(EventComment $comment): bool
    {
        try {
            // Log the activity before deletion
            $this->loggingService->logUserActivity(
                $comment->user_id,
                'comment_deleted',
                'EventComment',
                $comment->id,
                [
                    'event_id' => $comment->event_id,
                    'event_title' => $comment->event->title,
                    'content_preview' => substr($comment->content, 0, 100),
                ]
            );

            // Soft delete the comment
            $comment->delete();

            return true;
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'comment_id' => $comment->id,
                'operation' => 'delete_comment'
            ]);
            throw $e;
        }
    }

    /**
     * Process mentions in a comment
     *
     * @param EventComment $comment
     * @return void
     */
    private function processMentions(EventComment $comment): void
    {
        $mentions = $comment->getMentions();
        
        foreach ($mentions as $username) {
            // Find user by username (assuming we have a username field)
            // For now, we'll skip this as the User model doesn't have username
            // This would be implemented when username functionality is added
            
            // $mentionedUser = User::where('username', $username)->first();
            // if ($mentionedUser && $mentionedUser->id !== $comment->user_id) {
            //     $this->notificationService->createNotification(
            //         $mentionedUser->id,
            //         'comment_mention',
            //         'You were mentioned',
            //         "{$comment->user->first_name} mentioned you in a comment",
            //         [
            //             'event_id' => $comment->event_id,
            //             'comment_id' => $comment->id,
            //             'user_id' => $comment->user_id,
            //         ]
            //     );
            // }
        }
    }

    /**
     * Get comment statistics for an event
     *
     * @param Event $event
     * @return array
     */
    public function getEventCommentStats(Event $event): array
    {
        $comments = $event->comments();

        return [
            'total_comments' => $comments->count(),
            'approved_comments' => $comments->approved()->count(),
            'pending_comments' => $comments->where('is_approved', false)->count(),
            'top_level_comments' => $comments->topLevel()->approved()->count(),
            'replies' => $comments->whereNotNull('parent_id')->approved()->count(),
            'recent_comments' => $comments->recent()->approved()->count(),
            'unique_commenters' => $comments->approved()->distinct('user_id')->count('user_id'),
        ];
    }
}
