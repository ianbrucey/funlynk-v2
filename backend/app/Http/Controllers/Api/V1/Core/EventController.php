<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Core\CreateEventRequest;
use App\Http\Requests\Core\UpdateEventRequest;
use App\Http\Resources\Core\EventResource;
use App\Models\Core\Event;
use App\Models\Core\EventCategory;
use App\Services\Core\EventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Event Controller.
 *
 * Handles event management operations including CRUD, search, and attendance
 */
class EventController extends BaseApiController
{
    public function __construct(
        private EventService $eventService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get paginated list of events.
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'per_page' => 'integer|min:1|max:50',
                'category_id' => 'integer|exists:event_categories,id',
                'status' => 'in:draft,published,cancelled,completed',
                'visibility' => 'in:public,private,followers_only',
                'upcoming' => 'boolean',
                'latitude' => 'numeric|between:-90,90',
                'longitude' => 'numeric|between:-180,180',
                'radius' => 'numeric|min:1|max:500',
                'tags' => 'array',
                'tags.*' => 'string|max:50',
            ]);

            $events = $this->eventService->getEvents(
                $request->only([
                    'category_id', 'status', 'visibility', 'upcoming',
                    'latitude', 'longitude', 'radius', 'tags'
                ]),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($events, 'Events retrieved successfully');
        });
    }

    /**
     * Create a new event.
     *
     * @param CreateEventRequest $request
     *
     * @return JsonResponse
     */
    public function store(CreateEventRequest $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $event = $this->eventService->createEvent($request->user(), $request->validated());

            return $this->createdResponse(
                new EventResource($event),
                'Event created successfully'
            );
        });
    }

    /**
     * Get a specific event.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $event = Event::with(['host', 'category', 'attendees.user', 'tags'])->findOrFail($id);

            if (!$event->canBeViewedBy(auth()->user())) {
                return $this->forbiddenResponse('You do not have permission to view this event');
            }

            return $this->successResponse(
                new EventResource($event),
                'Event retrieved successfully'
            );
        });
    }

    /**
     * Update an event.
     *
     * @param UpdateEventRequest $request
     * @param int                $id
     *
     * @return JsonResponse
     */
    public function update(UpdateEventRequest $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $event = Event::findOrFail($id);

            if (!$event->canBeEditedBy($request->user())) {
                return $this->forbiddenResponse('You do not have permission to edit this event');
            }

            $event = $this->eventService->updateEvent($event, $request->validated());

            return $this->updatedResponse(
                new EventResource($event),
                'Event updated successfully'
            );
        });
    }

    /**
     * Delete an event.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $event = Event::findOrFail($id);

            if (!$event->canBeDeletedBy($request->user())) {
                return $this->forbiddenResponse('You do not have permission to delete this event');
            }

            $this->eventService->deleteEvent($event);

            return $this->deletedResponse('Event deleted successfully');
        });
    }

    /**
     * Search events.
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'query' => 'required|string|min:2|max:100',
                'per_page' => 'integer|min:1|max:50',
                'category_id' => 'integer|exists:event_categories,id',
                'latitude' => 'numeric|between:-90,90',
                'longitude' => 'numeric|between:-180,180',
                'radius' => 'numeric|min:1|max:500',
                'price_min' => 'numeric|min:0',
                'price_max' => 'numeric|min:0',
                'date_from' => 'date',
                'date_to' => 'date|after_or_equal:date_from',
            ]);

            $events = $this->eventService->searchEvents(
                $request->input('query'),
                $request->only([
                    'category_id', 'latitude', 'longitude', 'radius',
                    'price_min', 'price_max', 'date_from', 'date_to'
                ]),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($events, 'Search results retrieved successfully');
        });
    }

    /**
     * Get event categories.
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function categories(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () {
            $categories = EventCategory::active()->ordered()->get();

            return $this->successResponse(
                $categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'description' => $category->description,
                        'icon' => $category->icon,
                        'color' => $category->color,
                        'events_count' => $category->events_count,
                        'upcoming_events_count' => $category->upcoming_events_count,
                    ];
                }),
                'Categories retrieved successfully'
            );
        });
    }

    /**
     * RSVP to an event.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function rsvp(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $request->validate([
                'response' => 'required|in:yes,no,maybe',
                'notes' => 'nullable|string|max:500',
            ]);

            $event = Event::findOrFail($id);
            $result = $this->eventService->rsvpToEvent(
                $request->user(),
                $event,
                $request->input('response'),
                $request->input('notes')
            );

            if (!$result) {
                return $this->errorResponse('Unable to RSVP to this event', 400);
            }

            return $this->successResponse(
                ['rsvp_status' => $request->input('response')],
                'RSVP recorded successfully'
            );
        });
    }

    /**
     * Cancel RSVP to an event.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function cancelRsvp(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $event = Event::findOrFail($id);
            $result = $this->eventService->cancelRsvp($request->user(), $event);

            if (!$result) {
                return $this->errorResponse('Unable to cancel RSVP', 400);
            }

            return $this->successResponse(
                ['rsvp_status' => null],
                'RSVP cancelled successfully'
            );
        });
    }

    /**
     * Get event attendees.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function attendees(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $event = Event::findOrFail($id);

            if (!$event->canBeViewedBy(auth()->user())) {
                return $this->forbiddenResponse('You do not have permission to view event attendees');
            }

            $request->validate([
                'status' => 'in:confirmed,pending,declined',
                'per_page' => 'integer|min:1|max:50',
            ]);

            $attendees = $this->eventService->getEventAttendees(
                $event,
                $request->input('status'),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($attendees, 'Attendees retrieved successfully');
        });
    }

    /**
     * Get user's hosted events.
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function myHostedEvents(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'per_page' => 'integer|min:1|max:50',
                'status' => 'in:draft,published,cancelled,completed',
            ]);

            $events = $this->eventService->getUserHostedEvents(
                $request->user(),
                $request->input('status'),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($events, 'Hosted events retrieved successfully');
        });
    }

    /**
     * Get user's attended events.
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function myAttendedEvents(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'per_page' => 'integer|min:1|max:50',
                'status' => 'in:confirmed,pending,declined',
            ]);

            $events = $this->eventService->getUserAttendedEvents(
                $request->user(),
                $request->input('status'),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($events, 'Attended events retrieved successfully');
        });
    }
}
