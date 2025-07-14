<?php

namespace App\Services\Shared;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * Notification Service
 * 
 * Handles all types of notifications including database, push, email, and SMS
 */
class NotificationService
{
    public function __construct(
        private LoggingService $loggingService,
        private EmailService $emailService
    ) {}

    /**
     * Create a database notification
     *
     * @param int $userId
     * @param string $type
     * @param string $title
     * @param string $message
     * @param array $data
     * @return bool
     */
    public function createNotification(
        int $userId,
        string $type,
        string $title,
        string $message,
        array $data = []
    ): bool {
        try {
            DB::table('notifications')->insert([
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => json_encode($data),
                'created_at' => now()
            ]);

            $this->loggingService->logNotificationEvent($type, $userId, $data, true);
            return true;
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'user_id' => $userId,
                'type' => $type,
                'title' => $title
            ]);
            return false;
        }
    }

    /**
     * Send push notification (placeholder for Firebase implementation)
     *
     * @param int $userId
     * @param string $title
     * @param string $body
     * @param array $data
     * @return bool
     */
    public function sendPushNotification(int $userId, string $title, string $body, array $data = []): bool
    {
        try {
            // TODO: Implement Firebase push notification
            // This is a placeholder for future Firebase integration
            
            Log::info('Push notification would be sent', [
                'user_id' => $userId,
                'title' => $title,
                'body' => $body,
                'data' => $data
            ]);

            return true;
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'user_id' => $userId,
                'title' => $title
            ]);
            return false;
        }
    }

    /**
     * Send event notification
     *
     * @param int $userId
     * @param string $eventType
     * @param array $eventData
     * @param array $channels
     * @return array
     */
    public function sendEventNotification(
        int $userId,
        string $eventType,
        array $eventData,
        array $channels = ['database']
    ): array {
        $results = [];

        foreach ($channels as $channel) {
            switch ($channel) {
                case 'database':
                    $results['database'] = $this->createNotification(
                        $userId,
                        $eventType,
                        $eventData['title'] ?? 'Event Notification',
                        $eventData['message'] ?? '',
                        $eventData
                    );
                    break;

                case 'push':
                    $results['push'] = $this->sendPushNotification(
                        $userId,
                        $eventData['title'] ?? 'Event Notification',
                        $eventData['message'] ?? '',
                        $eventData
                    );
                    break;

                case 'email':
                    if (isset($eventData['email']) && isset($eventData['name'])) {
                        $results['email'] = $this->emailService->sendNotificationEmail(
                            $eventData['email'],
                            $eventData['name'],
                            $eventData['title'] ?? 'Event Notification',
                            $eventData['message'] ?? ''
                        );
                    }
                    break;
            }
        }

        return $results;
    }

    /**
     * Mark notification as read
     *
     * @param int $notificationId
     * @param int $userId
     * @return bool
     */
    public function markAsRead(int $notificationId, int $userId): bool
    {
        try {
            $updated = DB::table('notifications')
                ->where('id', $notificationId)
                ->where('user_id', $userId)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            return $updated > 0;
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'notification_id' => $notificationId,
                'user_id' => $userId
            ]);
            return false;
        }
    }

    /**
     * Mark all notifications as read for a user
     *
     * @param int $userId
     * @return bool
     */
    public function markAllAsRead(int $userId): bool
    {
        try {
            DB::table('notifications')
                ->where('user_id', $userId)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            return true;
        } catch (Exception $e) {
            $this->loggingService->logError($e, ['user_id' => $userId]);
            return false;
        }
    }

    /**
     * Get unread notifications count for user
     *
     * @param int $userId
     * @return int
     */
    public function getUnreadCount(int $userId): int
    {
        try {
            return DB::table('notifications')
                ->where('user_id', $userId)
                ->whereNull('read_at')
                ->count();
        } catch (Exception $e) {
            $this->loggingService->logError($e, ['user_id' => $userId]);
            return 0;
        }
    }

    /**
     * Get notifications for user with pagination
     *
     * @param int $userId
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function getUserNotifications(int $userId, int $limit = 20, int $offset = 0): array
    {
        try {
            $notifications = DB::table('notifications')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->offset($offset)
                ->get()
                ->map(function ($notification) {
                    $notification->data = json_decode($notification->data, true);
                    return $notification;
                })
                ->toArray();

            return $notifications;
        } catch (Exception $e) {
            $this->loggingService->logError($e, ['user_id' => $userId]);
            return [];
        }
    }

    /**
     * Delete old notifications (cleanup)
     *
     * @param int $daysOld
     * @return int
     */
    public function deleteOldNotifications(int $daysOld = 30): int
    {
        try {
            $deleted = DB::table('notifications')
                ->where('created_at', '<', now()->subDays($daysOld))
                ->delete();

            Log::info('Old notifications deleted', ['count' => $deleted, 'days_old' => $daysOld]);
            return $deleted;
        } catch (Exception $e) {
            $this->loggingService->logError($e, ['days_old' => $daysOld]);
            return 0;
        }
    }

    /**
     * Send bulk notifications to multiple users
     *
     * @param array $userIds
     * @param string $type
     * @param string $title
     * @param string $message
     * @param array $data
     * @return array
     */
    public function sendBulkNotifications(
        array $userIds,
        string $type,
        string $title,
        string $message,
        array $data = []
    ): array {
        $results = ['sent' => 0, 'failed' => 0];

        foreach ($userIds as $userId) {
            if ($this->createNotification($userId, $type, $title, $message, $data)) {
                $results['sent']++;
            } else {
                $results['failed']++;
            }
        }

        return $results;
    }
}
