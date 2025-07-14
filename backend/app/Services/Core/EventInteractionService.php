<?php

namespace App\Services\Core;

use App\Models\Core\Event;
use App\Models\Core\EventAttendee;
use App\Models\Core\EventShare;
use App\Models\User;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use Exception;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Event Interaction Service.
 *
 * Handles event interactions including sharing, QR codes, check-ins, and recommendations
 */
class EventInteractionService
{
    public function __construct(
        private LoggingService $loggingService,
        private NotificationService $notificationService
    ) {
    }

    /**
     * Share an event.
     *
     * @param Event       $event
     * @param User|null   $user
     * @param string      $platform
     * @param string|null $message
     * @param string|null $ipAddress
     * @param string|null $userAgent
     *
     * @return array
     */
    public function shareEvent(
        Event $event,
        ?User $user,
        string $platform,
        ?string $message = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): array {
        try {
            // Generate share URL
            $shareUrl = $this->generateShareUrl($event, $platform, $message);

            // Record the share
            EventShare::recordShare(
                $event->id,
                $user?->id,
                $platform,
                $shareUrl,
                $ipAddress,
                $userAgent
            );

            // Log the activity
            if ($user) {
                $this->loggingService->logUserActivity(
                    $user->id,
                    'event_shared',
                    'Event',
                    $event->id,
                    [
                        'platform' => $platform,
                        'event_title' => $event->title,
                    ]
                );
            }

            return [
                'share_url' => $shareUrl,
                'platform' => $platform,
                'platform_display' => ucfirst($platform),
                'message' => $message,
            ];
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'event_id' => $event->id,
                'user_id' => $user?->id,
                'platform' => $platform,
                'operation' => 'share_event'
            ]);

            throw $e;
        }
    }

    /**
     * Get event share statistics.
     *
     * @param Event $event
     *
     * @return array
     */
    public function getEventShareStats(Event $event): array
    {
        return EventShare::getEventShareStats($event->id);
    }

    /**
     * Generate QR code for event.
     *
     * @param Event  $event
     * @param int    $size
     * @param string $format
     *
     * @return array
     */
    public function generateEventQrCode(Event $event, int $size = 300, string $format = 'png'): array
    {
        try {
            $eventUrl = url("/events/{$event->id}");

            // For now, return a placeholder. In a real implementation, you would use
            // a QR code library like SimpleSoftwareIO/simple-qrcode
            $qrCodeData = [
                'url' => $eventUrl,
                'qr_code_url' => "https://api.qrserver.com/v1/create-qr-code/?size={$size}x{$size}&data=" . urlencode($eventUrl),
                'size' => $size,
                'format' => $format,
                'event_id' => $event->id,
                'event_title' => $event->title,
            ];

            // Log QR code generation
            $this->loggingService->logActivity(
                'qr_code_generated',
                'Event',
                $event->id,
                [
                    'size' => $size,
                    'format' => $format,
                    'event_title' => $event->title,
                ]
            );

            return $qrCodeData;
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'event_id' => $event->id,
                'operation' => 'generate_qr_code'
            ]);

            throw $e;
        }
    }

    /**
     * Check in to an event.
     *
     * @param User        $user
     * @param Event       $event
     * @param float|null  $latitude
     * @param float|null  $longitude
     * @param string|null $qrCodeToken
     *
     * @return array
     */
    public function checkInToEvent(
        User $user,
        Event $event,
        ?float $latitude = null,
        ?float $longitude = null,
        ?string $qrCodeToken = null
    ): array {
        try {
            // Check if user is registered for the event
            $attendee = EventAttendee::where('event_id', $event->id)
                ->where('user_id', $user->id)
                ->where('status', 'confirmed')
                ->first();

            if (!$attendee) {
                return [
                    'success' => false,
                    'message' => 'You must be registered for this event to check in',
                ];
            }

            // Check if already checked in
            if ($attendee->is_checked_in) {
                return [
                    'success' => false,
                    'message' => 'You are already checked in to this event',
                ];
            }

            // Validate location if provided
            if ($latitude && $longitude && $event->latitude && $event->longitude) {
                $distance = $this->calculateDistance(
                    $latitude,
                    $longitude,
                    $event->latitude,
                    $event->longitude
                );

                // Allow check-in within 500 meters of event location
                if ($distance > 0.5) {
                    return [
                        'success' => false,
                        'message' => 'You must be at the event location to check in',
                    ];
                }
            }

            // Perform check-in
            $attendee->checkIn();

            // Log the activity
            $this->loggingService->logUserActivity(
                $user->id,
                'event_checked_in',
                'Event',
                $event->id,
                [
                    'event_title' => $event->title,
                    'check_in_time' => $attendee->checked_in_at,
                    'location_provided' => $latitude && $longitude,
                ]
            );

            return [
                'success' => true,
                'data' => [
                    'checked_in_at' => $attendee->checked_in_at->toISOString(),
                    'event_title' => $event->title,
                    'location_verified' => $latitude && $longitude && $event->latitude && $event->longitude,
                ],
            ];
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'user_id' => $user->id,
                'event_id' => $event->id,
                'operation' => 'check_in_to_event'
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred during check-in',
            ];
        }
    }

    /**
     * Check out from an event.
     *
     * @param User  $user
     * @param Event $event
     *
     * @return array
     */
    public function checkOutFromEvent(User $user, Event $event): array
    {
        try {
            $attendee = EventAttendee::where('event_id', $event->id)
                ->where('user_id', $user->id)
                ->first();

            if (!$attendee || !$attendee->is_checked_in) {
                return [
                    'success' => false,
                    'message' => 'You are not checked in to this event',
                ];
            }

            if ($attendee->is_checked_out) {
                return [
                    'success' => false,
                    'message' => 'You are already checked out from this event',
                ];
            }

            // Perform check-out
            $attendee->checkOut();

            // Log the activity
            $this->loggingService->logUserActivity(
                $user->id,
                'event_checked_out',
                'Event',
                $event->id,
                [
                    'event_title' => $event->title,
                    'check_out_time' => $attendee->checked_out_at,
                    'duration' => $attendee->checked_in_at->diffInMinutes($attendee->checked_out_at),
                ]
            );

            return [
                'success' => true,
                'data' => [
                    'checked_out_at' => $attendee->checked_out_at->toISOString(),
                    'duration_minutes' => $attendee->checked_in_at->diffInMinutes($attendee->checked_out_at),
                    'event_title' => $event->title,
                ],
            ];
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'user_id' => $user->id,
                'event_id' => $event->id,
                'operation' => 'check_out_from_event'
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred during check-out',
            ];
        }
    }

    /**
     * Get event check-in statistics.
     *
     * @param Event $event
     *
     * @return array
     */
    public function getEventCheckInStats(Event $event): array
    {
        $attendees = $event->attendees()->confirmed();

        return [
            'total_confirmed' => $attendees->count(),
            'checked_in' => $attendees->checkedIn()->count(),
            'checked_out' => $attendees->whereNotNull('checked_out_at')->count(),
            'currently_at_event' => $attendees->checkedIn()->whereNull('checked_out_at')->count(),
            'check_in_rate' => $attendees->count() > 0 ?
                round(($attendees->checkedIn()->count() / $attendees->count()) * 100, 2) : 0,
        ];
    }

    /**
     * Get nearby events.
     *
     * @param float $latitude
     * @param float $longitude
     * @param float $radius
     * @param int   $perPage
     *
     * @return LengthAwarePaginator
     */
    public function getNearbyEvents(float $latitude, float $longitude, float $radius = 10, int $perPage = 15): LengthAwarePaginator
    {
        return Event::query()
            ->with(['host', 'category', 'tags'])
            ->published()
            ->public()
            ->upcoming()
            ->withinRadius($latitude, $longitude, $radius)
            ->orderBy('start_time')
            ->paginate($perPage);
    }

    /**
     * Get event recommendations for a user.
     *
     * @param User       $user
     * @param int        $perPage
     * @param float|null $latitude
     * @param float|null $longitude
     *
     * @return LengthAwarePaginator
     */
    public function getEventRecommendations(User $user, int $perPage = 15, ?float $latitude = null, ?float $longitude = null): LengthAwarePaginator
    {
        // Get user's interests
        $userInterests = $user->interests()->pluck('interest')->toArray();

        $query = Event::query()
            ->with(['host', 'category', 'tags'])
            ->published()
            ->public()
            ->upcoming()
            ->where('host_id', '!=', $user->id); // Don't recommend user's own events

        // Filter by user interests if available
        if (!empty($userInterests)) {
            $query->whereHas('tags', function ($q) use ($userInterests) {
                $q->whereIn('name', $userInterests);
            });
        }

        // Add location-based filtering if coordinates provided
        if ($latitude && $longitude) {
            $query->withinRadius($latitude, $longitude, 50); // 50km radius
        }

        return $query->orderBy('start_time')->paginate($perPage);
    }

    /**
     * Get comprehensive event analytics.
     *
     * @param Event $event
     *
     * @return array
     */
    public function getEventAnalytics(Event $event): array
    {
        return [
            'attendance' => [
                'confirmed' => $event->confirmed_attendees_count,
                'pending' => $event->attendees()->pending()->count(),
                'declined' => $event->attendees()->declined()->count(),
                'checked_in' => $event->attendees()->checkedIn()->count(),
                'available_spots' => $event->available_spots,
            ],
            'engagement' => [
                'comments' => $event->comments()->approved()->count(),
                'shares' => $event->shares()->count(),
                'views' => 0, // Would be implemented with view tracking
            ],
            'sharing' => $this->getEventShareStats($event),
            'check_ins' => $this->getEventCheckInStats($event),
        ];
    }

    /**
     * Generate share URL for different platforms.
     *
     * @param Event       $event
     * @param string      $platform
     * @param string|null $message
     *
     * @return string
     */
    private function generateShareUrl(Event $event, string $platform, ?string $message = null): string
    {
        $eventUrl = url("/events/{$event->id}");
        $defaultMessage = "Check out this event: {$event->title}";
        $shareMessage = $message ?: $defaultMessage;

        return match($platform) {
            'facebook' => 'https://www.facebook.com/sharer/sharer.php?u=' . urlencode($eventUrl),
            'twitter' => 'https://twitter.com/intent/tweet?text=' . urlencode($shareMessage) . '&url=' . urlencode($eventUrl),
            'linkedin' => 'https://www.linkedin.com/sharing/share-offsite/?url=' . urlencode($eventUrl),
            'whatsapp' => 'https://wa.me/?text=' . urlencode($shareMessage . ' ' . $eventUrl),
            'email' => 'mailto:?subject=' . urlencode($event->title) . '&body=' . urlencode($shareMessage . "\n\n" . $eventUrl),
            default => $eventUrl,
        };
    }

    /**
     * Calculate distance between two coordinates in kilometers.
     *
     * @param float $lat1
     * @param float $lon1
     * @param float $lat2
     * @param float $lon2
     *
     * @return float
     */
    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
