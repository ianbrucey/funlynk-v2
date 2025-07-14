<?php

namespace App\Services\Shared;

use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Logging Service.
 *
 * Centralized logging service for application events and activities
 */
class LoggingService
{
    /**
     * Log API request.
     *
     * @param string   $method
     * @param string   $url
     * @param array    $data
     * @param int|null $userId
     */
    public function logApiRequest(string $method, string $url, array $data = [], ?int $userId = null): void
    {
        Log::channel('api')->info('API Request', [
            'method' => $method,
            'url' => $url,
            'data' => $data,
            'user_id' => $userId,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Log API response.
     *
     * @param string   $method
     * @param string   $url
     * @param int      $statusCode
     * @param int|null $userId
     */
    public function logApiResponse(string $method, string $url, int $statusCode, ?int $userId = null): void
    {
        Log::channel('api')->info('API Response', [
            'method' => $method,
            'url' => $url,
            'status_code' => $statusCode,
            'user_id' => $userId,
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Log user activity.
     *
     * @param int         $userId
     * @param string      $action
     * @param string|null $modelType
     * @param int|null    $modelId
     * @param array       $changes
     */
    public function logUserActivity(int $userId, string $action, ?string $modelType = null, ?int $modelId = null, array $changes = []): void
    {
        try {
            DB::table('activity_logs')->insert([
                'user_id' => $userId,
                'action' => $action,
                'model_type' => $modelType,
                'model_id' => $modelId,
                'changes' => json_encode($changes),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created_at' => now()
            ]);

            Log::info('User activity logged', [
                'user_id' => $userId,
                'action' => $action,
                'model_type' => $modelType,
                'model_id' => $modelId
            ]);
        } catch (Exception $e) {
            Log::error('Failed to log user activity', [
                'user_id' => $userId,
                'action' => $action,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Log authentication events.
     *
     * @param int    $userId
     * @param string $event
     * @param array  $context
     */
    public function logAuthEvent(int $userId, string $event, array $context = []): void
    {
        Log::channel('auth')->info('Authentication Event', [
            'user_id' => $userId,
            'event' => $event,
            'context' => $context,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Log security events.
     *
     * @param string $event
     * @param array  $context
     * @param string $level
     */
    public function logSecurityEvent(string $event, array $context = [], string $level = 'warning'): void
    {
        Log::channel('security')->{$level}('Security Event', [
            'event' => $event,
            'context' => $context,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Log business events.
     *
     * @param string $event
     * @param array  $context
     */
    public function logBusinessEvent(string $event, array $context = []): void
    {
        Log::channel('business')->info('Business Event', [
            'event' => $event,
            'context' => $context,
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Log error with context.
     *
     * @param Exception $exception
     * @param array     $context
     */
    public function logError(Exception $exception, array $context = []): void
    {
        Log::error('Application Error', [
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
            'context' => $context,
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
            'url' => request()->fullUrl(),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Log performance metrics.
     *
     * @param string $operation
     * @param float  $duration
     * @param array  $context
     */
    public function logPerformance(string $operation, float $duration, array $context = []): void
    {
        Log::channel('performance')->info('Performance Metric', [
            'operation' => $operation,
            'duration_ms' => $duration,
            'context' => $context,
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Log file operations.
     *
     * @param string   $operation
     * @param string   $filename
     * @param int|null $userId
     * @param array    $context
     */
    public function logFileOperation(string $operation, string $filename, ?int $userId = null, array $context = []): void
    {
        Log::info('File Operation', [
            'operation' => $operation,
            'filename' => $filename,
            'user_id' => $userId,
            'context' => $context,
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Log email events.
     *
     * @param string      $event
     * @param string      $recipient
     * @param string      $subject
     * @param bool        $success
     * @param string|null $error
     */
    public function logEmailEvent(string $event, string $recipient, string $subject, bool $success, ?string $error = null): void
    {
        Log::channel('email')->info('Email Event', [
            'event' => $event,
            'recipient' => $recipient,
            'subject' => $subject,
            'success' => $success,
            'error' => $error,
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Log notification events.
     *
     * @param string $type
     * @param int    $userId
     * @param array  $data
     * @param bool   $success
     */
    public function logNotificationEvent(string $type, int $userId, array $data, bool $success): void
    {
        Log::channel('notifications')->info('Notification Event', [
            'type' => $type,
            'user_id' => $userId,
            'data' => $data,
            'success' => $success,
            'timestamp' => now()->toISOString()
        ]);
    }
}
