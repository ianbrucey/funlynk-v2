<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Core\Event;
use App\Services\Core\EventInteractionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Event Interaction Controller.
 *
 * Handles event interactions including sharing, QR codes, and check-ins
 */
class EventInteractionController extends BaseApiController
{
    public function __construct(
        private EventInteractionService $eventInteractionService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Share an event.
     *
     * @param Request $request
     * @param int     $eventId
     *
     * @return JsonResponse
     */
    public function share(Request $request, int $eventId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $eventId) {
            $event = Event::findOrFail($eventId);

            if (!$event->canBeViewedBy(auth()->user())) {
                return $this->forbiddenResponse('You do not have permission to share this event');
            }

            $request->validate([
                'platform' => 'required|in:facebook,twitter,instagram,linkedin,whatsapp,email,copy_link,qr_code',
                'message' => 'nullable|string|max:500',
            ]);

            $shareData = $this->eventInteractionService->shareEvent(
                $event,
                auth()->user(),
                $request->input('platform'),
                $request->input('message'),
                $request->ip(),
                $request->userAgent()
            );

            return $this->successResponse($shareData, 'Event shared successfully');
        });
    }

    /**
     * Get event sharing statistics.
     *
     * @param Request $request
     * @param int     $eventId
     *
     * @return JsonResponse
     */
    public function shareStats(Request $request, int $eventId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $eventId) {
            $event = Event::findOrFail($eventId);

            // Only event hosts and admins can view share stats
            if (!($request->user()->hasRole('admin') || $event->host_id === $request->user()->id)) {
                return $this->forbiddenResponse('You do not have permission to view share statistics');
            }

            $stats = $this->eventInteractionService->getEventShareStats($event);

            return $this->successResponse($stats, 'Share statistics retrieved successfully');
        });
    }

    /**
     * Generate QR code for event.
     *
     * @param Request $request
     * @param int     $eventId
     *
     * @return JsonResponse
     */
    public function generateQrCode(Request $request, int $eventId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $eventId) {
            $event = Event::findOrFail($eventId);

            if (!$event->canBeViewedBy(auth()->user())) {
                return $this->forbiddenResponse('You do not have permission to generate QR code for this event');
            }

            $request->validate([
                'size' => 'integer|min:100|max:1000',
                'format' => 'in:png,svg',
            ]);

            $qrCodeData = $this->eventInteractionService->generateEventQrCode(
                $event,
                $request->input('size', 300),
                $request->input('format', 'png')
            );

            return $this->successResponse($qrCodeData, 'QR code generated successfully');
        });
    }

    /**
     * Check in to an event.
     *
     * @param Request $request
     * @param int     $eventId
     *
     * @return JsonResponse
     */
    public function checkIn(Request $request, int $eventId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $eventId) {
            $event = Event::findOrFail($eventId);

            $request->validate([
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'qr_code_token' => 'nullable|string',
            ]);

            $result = $this->eventInteractionService->checkInToEvent(
                $request->user(),
                $event,
                $request->input('latitude'),
                $request->input('longitude'),
                $request->input('qr_code_token')
            );

            if (!$result['success']) {
                return $this->errorResponse($result['message'], 400);
            }

            return $this->successResponse(
                $result['data'],
                'Successfully checked in to event'
            );
        });
    }

    /**
     * Check out from an event.
     *
     * @param Request $request
     * @param int     $eventId
     *
     * @return JsonResponse
     */
    public function checkOut(Request $request, int $eventId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $eventId) {
            $event = Event::findOrFail($eventId);

            $result = $this->eventInteractionService->checkOutFromEvent($request->user(), $event);

            if (!$result['success']) {
                return $this->errorResponse($result['message'], 400);
            }

            return $this->successResponse(
                $result['data'],
                'Successfully checked out from event'
            );
        });
    }

    /**
     * Get event check-in statistics.
     *
     * @param Request $request
     * @param int     $eventId
     *
     * @return JsonResponse
     */
    public function checkInStats(Request $request, int $eventId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $eventId) {
            $event = Event::findOrFail($eventId);

            // Only event hosts and admins can view check-in stats
            if (!($request->user()->hasRole('admin') || $event->host_id === $request->user()->id)) {
                return $this->forbiddenResponse('You do not have permission to view check-in statistics');
            }

            $stats = $this->eventInteractionService->getEventCheckInStats($event);

            return $this->successResponse($stats, 'Check-in statistics retrieved successfully');
        });
    }

    /**
     * Get event analytics dashboard data.
     *
     * @param Request $request
     * @param int     $eventId
     *
     * @return JsonResponse
     */
    public function analytics(Request $request, int $eventId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $eventId) {
            $event = Event::findOrFail($eventId);

            // Only event hosts and admins can view analytics
            if (!($request->user()->hasRole('admin') || $event->host_id === $request->user()->id)) {
                return $this->forbiddenResponse('You do not have permission to view event analytics');
            }

            $analytics = $this->eventInteractionService->getEventAnalytics($event);

            return $this->successResponse($analytics, 'Event analytics retrieved successfully');
        });
    }

    /**
     * Get nearby events for location-based discovery.
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function nearbyEvents(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
                'radius' => 'integer|min:1|max:100',
                'per_page' => 'integer|min:1|max:50',
            ]);

            $events = $this->eventInteractionService->getNearbyEvents(
                $request->input('latitude'),
                $request->input('longitude'),
                $request->input('radius', 10),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($events, 'Nearby events retrieved successfully');
        });
    }

    /**
     * Get event recommendations for user.
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function recommendations(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'per_page' => 'integer|min:1|max:50',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
            ]);

            $recommendations = $this->eventInteractionService->getEventRecommendations(
                $request->user(),
                $request->input('per_page', 15),
                $request->input('latitude'),
                $request->input('longitude')
            );

            return $this->paginatedResponse($recommendations, 'Event recommendations retrieved successfully');
        });
    }
}
