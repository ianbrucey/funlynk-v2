<?php

namespace App\Services\Spark;

use App\Models\Spark\PermissionSlip;
use App\Services\Shared\EmailService;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Exception;

/**
 * Permission Slip Reminder Service
 *
 * Handles automated reminder system for unsigned permission slips,
 * including overdue detection and configurable reminder frequency.
 */
class PermissionSlipReminderService
{
    public function __construct(
        private EmailService $emailService,
        private LoggingService $loggingService,
        private NotificationService $notificationService
    ) {}

    /**
     * Send automated reminders for permission slips.
     *
     * @param array $config
     * @return array
     */
    public function sendAutomatedReminders(array $config = []): array
    {
        $config = array_merge([
            'days_before_event' => [7, 3, 1], // Send reminders 7, 3, and 1 days before
            'max_reminders' => 5,
            'overdue_reminders' => true,
        ], $config);

        $results = [
            'total_processed' => 0,
            'reminders_sent' => 0,
            'overdue_processed' => 0,
            'errors' => []
        ];

        try {
            // Process upcoming event reminders
            foreach ($config['days_before_event'] as $daysBefore) {
                $upcomingResults = $this->processUpcomingEventReminders($daysBefore, $config['max_reminders']);
                $results['total_processed'] += $upcomingResults['processed'];
                $results['reminders_sent'] += $upcomingResults['sent'];
                $results['errors'] = array_merge($results['errors'], $upcomingResults['errors']);
            }

            // Process overdue reminders if enabled
            if ($config['overdue_reminders']) {
                $overdueResults = $this->processOverdueReminders($config['max_reminders']);
                $results['overdue_processed'] = $overdueResults['processed'];
                $results['reminders_sent'] += $overdueResults['sent'];
                $results['errors'] = array_merge($results['errors'], $overdueResults['errors']);
            }

            // Log the automated reminder run
            $this->loggingService->logUserActivity(
                null, // System operation
                'automated_reminders_processed',
                'PermissionSlip',
                null,
                $results
            );

        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'operation' => 'send_automated_reminders',
                'config' => $config
            ]);
            
            $results['errors'][] = [
                'type' => 'system_error',
                'message' => $e->getMessage()
            ];
        }

        return $results;
    }

    /**
     * Process reminders for upcoming events.
     *
     * @param int $daysBefore
     * @param int $maxReminders
     * @return array
     */
    private function processUpcomingEventReminders(int $daysBefore, int $maxReminders): array
    {
        $results = [
            'processed' => 0,
            'sent' => 0,
            'errors' => []
        ];

        $targetDate = now()->addDays($daysBefore)->startOfDay();
        
        $slips = PermissionSlip::unsigned()
            ->where('reminder_sent_count', '<', $maxReminders)
            ->whereHas('booking', function ($query) use ($targetDate) {
                $query->where('confirmed_date', '=', $targetDate->toDateString());
            })
            ->where(function ($query) {
                // Only send if last reminder was sent more than 12 hours ago or never sent
                $query->where('last_reminder_sent_at', '<', now()->subHours(12))
                      ->orWhereNull('last_reminder_sent_at');
            })
            ->with(['booking.school', 'booking.program', 'student'])
            ->get();

        foreach ($slips as $slip) {
            $results['processed']++;
            
            try {
                $this->sendUpcomingEventReminder($slip, $daysBefore);
                $this->updateReminderTracking($slip);
                $results['sent']++;
                
            } catch (Exception $e) {
                $results['errors'][] = [
                    'slip_id' => $slip->id,
                    'type' => 'upcoming_reminder_error',
                    'message' => $e->getMessage()
                ];
                
                $this->loggingService->logError($e, [
                    'slip_id' => $slip->id,
                    'operation' => 'send_upcoming_event_reminder',
                    'days_before' => $daysBefore
                ]);
            }
        }

        return $results;
    }

    /**
     * Process reminders for overdue permission slips.
     *
     * @param int $maxReminders
     * @return array
     */
    private function processOverdueReminders(int $maxReminders): array
    {
        $results = [
            'processed' => 0,
            'sent' => 0,
            'errors' => []
        ];

        $slips = PermissionSlip::unsigned()
            ->where('reminder_sent_count', '<', $maxReminders)
            ->whereHas('booking', function ($query) {
                $query->where('confirmed_date', '<', now()->startOfDay());
            })
            ->where(function ($query) {
                // Send overdue reminders every 24 hours
                $query->where('last_reminder_sent_at', '<', now()->subDay())
                      ->orWhereNull('last_reminder_sent_at');
            })
            ->with(['booking.school', 'booking.program', 'student'])
            ->get();

        foreach ($slips as $slip) {
            $results['processed']++;
            
            try {
                $this->sendOverdueReminder($slip);
                $this->updateReminderTracking($slip);
                $results['sent']++;
                
            } catch (Exception $e) {
                $results['errors'][] = [
                    'slip_id' => $slip->id,
                    'type' => 'overdue_reminder_error',
                    'message' => $e->getMessage()
                ];
                
                $this->loggingService->logError($e, [
                    'slip_id' => $slip->id,
                    'operation' => 'send_overdue_reminder'
                ]);
            }
        }

        return $results;
    }

    /**
     * Send upcoming event reminder email.
     *
     * @param PermissionSlip $slip
     * @param int $daysBefore
     * @return bool
     */
    private function sendUpcomingEventReminder(PermissionSlip $slip, int $daysBefore): bool
    {
        $signingUrl = url("/permission-slip/{$slip->token}");
        
        $subject = match ($daysBefore) {
            7 => 'Permission Slip Required - Event in 1 Week',
            3 => 'Urgent: Permission Slip Required - Event in 3 Days',
            1 => 'URGENT: Permission Slip Required - Event Tomorrow',
            default => "Permission Slip Required - Event in {$daysBefore} Days"
        };
        
        $urgencyText = match ($daysBefore) {
            7 => 'We need your permission slip within the next week.',
            3 => 'This is urgent - we need your permission slip within 3 days.',
            1 => 'This is very urgent - we need your permission slip by tomorrow.',
            default => "We need your permission slip within {$daysBefore} days."
        };

        $message = "Dear {$slip->parent_name},\n\n" .
                   "{$urgencyText}\n\n" .
                   "Student: {$slip->student->full_name}\n" .
                   "Program: {$slip->booking->program->title}\n" .
                   "School: {$slip->booking->school->name}\n" .
                   "Date: {$slip->booking->confirmed_date->format('F j, Y')}\n" .
                   "Time: {$slip->booking->confirmed_time?->format('g:i A')}\n\n" .
                   "Please sign the permission slip immediately at: {$signingUrl}\n\n" .
                   "If you have any questions, please contact the school directly.\n\n" .
                   "Thank you,\nFunlynk Spark Team";

        return $this->emailService->sendNotificationEmail(
            $slip->parent_email,
            $slip->parent_name,
            $subject,
            $message
        );
    }

    /**
     * Send overdue reminder email.
     *
     * @param PermissionSlip $slip
     * @return bool
     */
    private function sendOverdueReminder(PermissionSlip $slip): bool
    {
        $signingUrl = url("/permission-slip/{$slip->token}");
        $daysPast = now()->diffInDays($slip->booking->confirmed_date);

        $subject = 'OVERDUE: Permission Slip Required - ' . $slip->booking->program->title;
        
        $message = "Dear {$slip->parent_name},\n\n" .
                   "This permission slip is now OVERDUE. The event was scheduled for " .
                   "{$slip->booking->confirmed_date->format('F j, Y')} ({$daysPast} days ago).\n\n" .
                   "Student: {$slip->student->full_name}\n" .
                   "Program: {$slip->booking->program->title}\n" .
                   "School: {$slip->booking->school->name}\n\n" .
                   "While the event may have passed, we still need your signed permission slip " .
                   "for our records and compliance purposes.\n\n" .
                   "Please sign the permission slip at: {$signingUrl}\n\n" .
                   "If you have any questions, please contact the school directly.\n\n" .
                   "Thank you,\nFunlynk Spark Team";

        return $this->emailService->sendNotificationEmail(
            $slip->parent_email,
            $slip->parent_name,
            $subject,
            $message
        );
    }

    /**
     * Update reminder tracking for a permission slip.
     *
     * @param PermissionSlip $slip
     * @return void
     */
    private function updateReminderTracking(PermissionSlip $slip): void
    {
        $slip->increment('reminder_sent_count');
        $slip->update(['last_reminder_sent_at' => now()]);
    }

    /**
     * Get overdue permission slips.
     *
     * @return Collection
     */
    public function getOverduePermissionSlips(): Collection
    {
        return PermissionSlip::unsigned()
            ->whereHas('booking', function ($query) {
                $query->where('confirmed_date', '<', now()->startOfDay());
            })
            ->with(['booking.school', 'booking.program', 'student'])
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Get permission slips requiring urgent reminders.
     *
     * @param int $daysThreshold
     * @return Collection
     */
    public function getUrgentReminders(int $daysThreshold = 2): Collection
    {
        return PermissionSlip::unsigned()
            ->whereHas('booking', function ($query) use ($daysThreshold) {
                $query->where('confirmed_date', '<=', now()->addDays($daysThreshold));
            })
            ->with(['booking.school', 'booking.program', 'student'])
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Get reminder statistics.
     *
     * @return array
     */
    public function getReminderStatistics(): array
    {
        $totalUnsigned = PermissionSlip::unsigned()->count();
        $overdue = PermissionSlip::unsigned()
            ->whereHas('booking', function ($query) {
                $query->where('confirmed_date', '<', now()->startOfDay());
            })
            ->count();
        
        $urgent = PermissionSlip::unsigned()
            ->whereHas('booking', function ($query) {
                $query->where('confirmed_date', '<=', now()->addDays(2));
            })
            ->count();

        $highReminderCount = PermissionSlip::unsigned()
            ->where('reminder_sent_count', '>=', 3)
            ->count();

        return [
            'total_unsigned' => $totalUnsigned,
            'overdue' => $overdue,
            'urgent' => $urgent,
            'high_reminder_count' => $highReminderCount,
            'overdue_rate' => $totalUnsigned > 0 ? round(($overdue / $totalUnsigned) * 100, 2) : 0,
        ];
    }
}
