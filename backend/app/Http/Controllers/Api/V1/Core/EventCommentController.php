<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Core\CreateCommentRequest;
use App\Http\Requests\Core\UpdateCommentRequest;
use App\Http\Resources\Core\EventCommentResource;
use App\Models\Core\Event;
use App\Models\Core\EventComment;
use App\Services\Core\EventCommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Event Comment Controller.
 *
 * Handles event comment operations including CRUD and moderation
 */
class EventCommentController extends BaseApiController
{
    public function __construct(
        private EventCommentService $eventCommentService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get comments for an event.
     *
     * @param Request $request
     * @param int     $eventId
     *
     * @return JsonResponse
     */
    public function index(Request $request, int $eventId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $eventId) {
            $event = Event::findOrFail($eventId);

            if (!$event->canBeViewedBy(auth()->user())) {
                return $this->forbiddenResponse('You do not have permission to view this event');
            }

            $request->validate([
                'per_page' => 'integer|min:1|max:50',
                'include_replies' => 'boolean',
            ]);

            $comments = $this->eventCommentService->getEventComments(
                $event,
                $request->boolean('include_replies', true),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($comments, 'Comments retrieved successfully');
        });
    }

    /**
     * Create a new comment.
     *
     * @param CreateCommentRequest $request
     * @param int                  $eventId
     *
     * @return JsonResponse
     */
    public function store(CreateCommentRequest $request, int $eventId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $eventId) {
            $event = Event::findOrFail($eventId);

            if (!$event->canBeViewedBy(auth()->user())) {
                return $this->forbiddenResponse('You do not have permission to comment on this event');
            }

            $comment = $this->eventCommentService->createComment(
                $request->user(),
                $event,
                $request->validated()
            );

            return $this->createdResponse(
                new EventCommentResource($comment),
                'Comment created successfully'
            );
        });
    }

    /**
     * Get a specific comment.
     *
     * @param Request $request
     * @param int     $eventId
     * @param int     $commentId
     *
     * @return JsonResponse
     */
    public function show(Request $request, int $eventId, int $commentId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($eventId, $commentId) {
            $comment = EventComment::with(['user', 'event', 'replies.user'])
                ->where('event_id', $eventId)
                ->findOrFail($commentId);

            if (!$comment->event->canBeViewedBy(auth()->user())) {
                return $this->forbiddenResponse('You do not have permission to view this comment');
            }

            return $this->successResponse(
                new EventCommentResource($comment),
                'Comment retrieved successfully'
            );
        });
    }

    /**
     * Update a comment.
     *
     * @param UpdateCommentRequest $request
     * @param int                  $eventId
     * @param int                  $commentId
     *
     * @return JsonResponse
     */
    public function update(UpdateCommentRequest $request, int $eventId, int $commentId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $eventId, $commentId) {
            $comment = EventComment::where('event_id', $eventId)->findOrFail($commentId);

            if (!$comment->canBeEditedBy($request->user())) {
                return $this->forbiddenResponse('You do not have permission to edit this comment');
            }

            $comment = $this->eventCommentService->updateComment($comment, $request->validated());

            return $this->updatedResponse(
                new EventCommentResource($comment),
                'Comment updated successfully'
            );
        });
    }

    /**
     * Delete a comment.
     *
     * @param Request $request
     * @param int     $eventId
     * @param int     $commentId
     *
     * @return JsonResponse
     */
    public function destroy(Request $request, int $eventId, int $commentId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $eventId, $commentId) {
            $comment = EventComment::where('event_id', $eventId)->findOrFail($commentId);

            if (!$comment->canBeDeletedBy($request->user())) {
                return $this->forbiddenResponse('You do not have permission to delete this comment');
            }

            $this->eventCommentService->deleteComment($comment);

            return $this->deletedResponse('Comment deleted successfully');
        });
    }

    /**
     * Reply to a comment.
     *
     * @param CreateCommentRequest $request
     * @param int                  $eventId
     * @param int                  $commentId
     *
     * @return JsonResponse
     */
    public function reply(CreateCommentRequest $request, int $eventId, int $commentId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $eventId, $commentId) {
            $parentComment = EventComment::where('event_id', $eventId)->findOrFail($commentId);

            if (!$parentComment->event->canBeViewedBy(auth()->user())) {
                return $this->forbiddenResponse('You do not have permission to reply to this comment');
            }

            $data = $request->validated();
            $data['parent_id'] = $commentId;

            $reply = $this->eventCommentService->createComment(
                $request->user(),
                $parentComment->event,
                $data
            );

            return $this->createdResponse(
                new EventCommentResource($reply),
                'Reply created successfully'
            );
        });
    }

    /**
     * Get replies to a comment.
     *
     * @param Request $request
     * @param int     $eventId
     * @param int     $commentId
     *
     * @return JsonResponse
     */
    public function replies(Request $request, int $eventId, int $commentId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $eventId, $commentId) {
            $comment = EventComment::where('event_id', $eventId)->findOrFail($commentId);

            if (!$comment->event->canBeViewedBy(auth()->user())) {
                return $this->forbiddenResponse('You do not have permission to view replies');
            }

            $request->validate([
                'per_page' => 'integer|min:1|max:50',
            ]);

            $replies = $comment->replies()
                ->with('user')
                ->approved()
                ->orderBy('created_at')
                ->paginate($request->input('per_page', 15));

            return $this->paginatedResponse($replies, 'Replies retrieved successfully');
        });
    }

    /**
     * Approve a comment (for event hosts and admins).
     *
     * @param Request $request
     * @param int     $eventId
     * @param int     $commentId
     *
     * @return JsonResponse
     */
    public function approve(Request $request, int $eventId, int $commentId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $eventId, $commentId) {
            $comment = EventComment::where('event_id', $eventId)->findOrFail($commentId);

            // Only event hosts and admins can approve comments
            if (!($request->user()->hasRole('admin') || $comment->event->host_id === $request->user()->id)) {
                return $this->forbiddenResponse('You do not have permission to approve comments');
            }

            $comment->approve();

            return $this->successResponse(
                ['is_approved' => true],
                'Comment approved successfully'
            );
        });
    }

    /**
     * Disapprove a comment (for event hosts and admins).
     *
     * @param Request $request
     * @param int     $eventId
     * @param int     $commentId
     *
     * @return JsonResponse
     */
    public function disapprove(Request $request, int $eventId, int $commentId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $eventId, $commentId) {
            $comment = EventComment::where('event_id', $eventId)->findOrFail($commentId);

            // Only event hosts and admins can disapprove comments
            if (!($request->user()->hasRole('admin') || $comment->event->host_id === $request->user()->id)) {
                return $this->forbiddenResponse('You do not have permission to moderate comments');
            }

            $comment->disapprove();

            return $this->successResponse(
                ['is_approved' => false],
                'Comment disapproved successfully'
            );
        });
    }
}
