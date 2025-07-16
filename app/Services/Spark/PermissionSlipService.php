<?php

namespace App\Services\Spark;

use App\Models\Spark\PermissionSlip;
use App\Models\Spark\PermissionSlipTemplate;
use App\Models\Spark\Booking;
use App\Models\Spark\BookingStudent;
use App\Services\Shared\EmailService;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

/**
 * Permission Slip Service
 *
 * Handles all permission slip operations including creation, signing,
 * reminders, and bulk operations for Spark educational programs.
 */
class PermissionSlipService
{
    public function __construct(
        private EmailService $emailService,
        private LoggingService $loggingService,
        private NotificationService $notificationService
    ) {}

    /**
     * Get paginated permission slips with filters.
     *
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getPermissionSlips(array $filters = []): LengthAwarePaginator
    {
        $query = PermissionSlip::with(['booking.school', 'booking.program', 'student']);

        // Apply filters
        if (isset($filters['booking_id'])) {
            $query->where('booking_id', $filters['booking_id']);
        }

        if (isset($filters['school_id'])) {
            $query->whereHas('booking', function ($q) use ($filters) {
                $q->where('school_id', $filters['school_id']);
            });
        }

        if (isset($filters['status'])) {
            switch ($filters['status']) {
                case 'signed':
                    $query->signed();
                    break;
                case 'unsigned':
                    $query->unsigned();
                    break;
                case 'overdue':
                    $query->overdue();
                    break;
            }
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('parent_name', 'like', "%{$search}%")
                  ->orWhere('parent_email', 'like', "%{$search}%")
                  ->orWhereHas('student', function ($sq) use ($search) {
                      $sq->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = $filters['per_page'] ?? 15;
        return $query->latest()->paginate($perPage);
    }

    /**
     * Get permission slip by ID.
     *
     * @param int $id
     * @return PermissionSlip|null
     */
    public function getPermissionSlipById(int $id): ?PermissionSlip
    {
        return PermissionSlip::with(['booking.school', 'booking.program', 'student'])->find($id);
    }

    /**
     * Get permission slip by token.
     *
     * @param string $token
     * @return PermissionSlip|null
     */
    public function getPermissionSlipByToken(string $token): ?PermissionSlip
    {
        return PermissionSlip::with(['booking.school', 'booking.program', 'student'])
            ->where('token', $token)
            ->first();
    }

    /**
     * Create permission slips for all students in a booking.
     *
     * @param Booking $booking
     * @param int|null $templateId
     * @return Collection
     * @throws Exception
     */
    public function createPermissionSlipsForBooking(Booking $booking, ?int $templateId = null): Collection
    {
        try {
            DB::beginTransaction();

            if ($booking->status !== 'confirmed') {
                throw new Exception('Permission slips can only be created for confirmed bookings');
            }

            $template = $templateId 
                ? PermissionSlipTemplate::findOrFail($templateId)
                : PermissionSlipTemplate::default()->active()->first();

            if (!$template) {
                throw new Exception('No active default template found');
            }

            $createdSlips = collect();

            foreach ($booking->students as $student) {
                // Check if permission slip already exists
                $existingSlip = PermissionSlip::where('booking_id', $booking->id)
                    ->where('student_id', $student->id)
                    ->first();

                if ($existingSlip) {
                    continue;
                }

                $slip = $this->createPermissionSlip($booking, $student, $template);
                $createdSlips->push($slip);

                // Send initial email
                $this->sendPermissionSlipEmail($slip);
            }

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'permission_slips_created',
                'Booking',
                $booking->id,
                [
                    'booking_reference' => $booking->booking_reference,
                    'slips_created' => $createdSlips->count(),
                    'template_id' => $template->id,
                ]
            );

            DB::commit();

            return $createdSlips;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'booking_id' => $booking->id,
                'operation' => 'create_permission_slips_for_booking',
                'template_id' => $templateId
            ]);

            throw $e;
        }
    }

    /**
     * Create a single permission slip.
     *
     * @param Booking $booking
     * @param BookingStudent $student
     * @param PermissionSlipTemplate $template
     * @return PermissionSlip
     */
    private function createPermissionSlip(
        Booking $booking, 
        BookingStudent $student, 
        PermissionSlipTemplate $template
    ): PermissionSlip {
        return PermissionSlip::create([
            'booking_id' => $booking->id,
            'student_id' => $student->id,
            'template_id' => $template->id,
            'token' => $this->generateSecureToken(),
            'parent_name' => $student->parent_name,
            'parent_email' => $student->parent_email,
            'parent_phone' => $student->parent_phone,
            'emergency_contacts' => $student->emergency_contact ?? [],
            'medical_info' => $student->medical_info ?? [],
            'photo_permission' => false,
            'is_signed' => false,
            'reminder_sent_count' => 0,
        ]);
    }

    /**
     * Generate a secure token for permission slip access.
     *
     * @return string
     */
    private function generateSecureToken(): string
    {
        do {
            $token = Str::random(64);
        } while (PermissionSlip::where('token', $token)->exists());

        return $token;
    }

    /**
     * Sign a permission slip.
     *
     * @param PermissionSlip $slip
     * @param array $data
     * @param string $ipAddress
     * @return bool
     * @throws Exception
     */
    public function signPermissionSlip(PermissionSlip $slip, array $data, string $ipAddress): bool
    {
        try {
            DB::beginTransaction();

            if ($slip->is_signed) {
                throw new Exception('Permission slip is already signed');
            }

            // Update permission slip with signed data
            $slip->update([
                'parent_name' => $data['parent_name'],
                'parent_email' => $data['parent_email'],
                'parent_phone' => $data['parent_phone'],
                'emergency_contacts' => $data['emergency_contacts'] ?? [],
                'medical_info' => $data['medical_info'] ?? [],
                'special_instructions' => $data['special_instructions'] ?? null,
                'photo_permission' => $data['photo_permission'] ?? false,
                'is_signed' => true,
                'signature_data' => json_encode([
                    'signature' => $data['signature'],
                    'timestamp' => now()->toISOString(),
                    'parent_name' => $data['parent_name'],
                ]),
                'signed_at' => now(),
                'signed_ip' => $ipAddress,
            ]);

            // Log the activity
            $this->loggingService->logUserActivity(
                null, // No authenticated user for public signing
                'permission_slip_signed',
                'PermissionSlip',
                $slip->id,
                [
                    'booking_reference' => $slip->booking->booking_reference,
                    'student_name' => $slip->student->full_name,
                    'parent_name' => $data['parent_name'],
                    'signed_ip' => $ipAddress,
                ]
            );

            // Send confirmation email
            $this->sendSignedConfirmationEmail($slip);

            DB::commit();

            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'slip_id' => $slip->id,
                'operation' => 'sign_permission_slip',
                'ip_address' => $ipAddress
            ]);

            throw $e;
        }
    }

    /**
     * Send permission slip email to parent.
     *
     * @param PermissionSlip $slip
     * @return bool
     */
    private function sendPermissionSlipEmail(PermissionSlip $slip): bool
    {
        $signingUrl = url("/permission-slip/{$slip->token}");
        
        return $this->emailService->sendPermissionSlipEmail(
            $slip->parent_email,
            $slip->parent_name,
            [
                'id' => $slip->booking->id,
                'program_title' => $slip->booking->program->title,
                'school_name' => $slip->booking->school->name,
                'student_name' => $slip->student->full_name,
                'event_date' => $slip->booking->confirmed_date?->format('F j, Y'),
                'event_time' => $slip->booking->confirmed_time?->format('g:i A'),
            ],
            $signingUrl
        );
    }

    /**
     * Send signed confirmation email.
     *
     * @param PermissionSlip $slip
     * @return bool
     */
    private function sendSignedConfirmationEmail(PermissionSlip $slip): bool
    {
        return $this->emailService->sendNotificationEmail(
            $slip->parent_email,
            $slip->parent_name,
            'Permission Slip Signed - ' . $slip->booking->program->title,
            "Thank you for signing the permission slip for {$slip->student->full_name}. " .
            "Your child is now registered for the {$slip->booking->program->title} program " .
            "on {$slip->booking->confirmed_date?->format('F j, Y')}."
        );
    }

    /**
     * Get permission slip statistics.
     *
     * @param array $filters
     * @return array
     */
    public function getStatistics(array $filters = []): array
    {
        $query = PermissionSlip::query();

        // Apply filters
        if (isset($filters['booking_id'])) {
            $query->where('booking_id', $filters['booking_id']);
        }

        if (isset($filters['school_id'])) {
            $query->whereHas('booking', function ($q) use ($filters) {
                $q->where('school_id', $filters['school_id']);
            });
        }

        if (isset($filters['date_from'])) {
            $query->whereHas('booking', function ($q) use ($filters) {
                $q->where('confirmed_date', '>=', $filters['date_from']);
            });
        }

        if (isset($filters['date_to'])) {
            $query->whereHas('booking', function ($q) use ($filters) {
                $q->where('confirmed_date', '<=', $filters['date_to']);
            });
        }

        $total = $query->count();
        $signed = (clone $query)->signed()->count();
        $unsigned = (clone $query)->unsigned()->count();
        $overdue = (clone $query)->overdue()->count();

        return [
            'total' => $total,
            'signed' => $signed,
            'unsigned' => $unsigned,
            'overdue' => $overdue,
            'completion_rate' => $total > 0 ? round(($signed / $total) * 100, 2) : 0,
            'overdue_rate' => $total > 0 ? round(($overdue / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Get permission slips requiring reminders.
     *
     * @param int $daysBefore
     * @return Collection
     */
    public function getSlipsRequiringReminders(int $daysBefore = 3): Collection
    {
        return PermissionSlip::unsigned()
            ->whereHas('booking', function ($query) use ($daysBefore) {
                $query->where('confirmed_date', '<=', now()->addDays($daysBefore));
            })
            ->where(function ($query) {
                $query->where('last_reminder_sent_at', '<', now()->subDay())
                      ->orWhereNull('last_reminder_sent_at');
            })
            ->with(['booking.school', 'booking.program', 'student'])
            ->get();
    }

    /**
     * Send bulk reminders for unsigned permission slips.
     *
     * @param array $slipIds
     * @return array
     */
    public function sendBulkReminders(array $slipIds): array
    {
        $results = [
            'sent' => 0,
            'failed' => 0,
            'errors' => []
        ];

        $slips = PermissionSlip::whereIn('id', $slipIds)
            ->unsigned()
            ->with(['booking.school', 'booking.program', 'student'])
            ->get();

        foreach ($slips as $slip) {
            try {
                $this->sendReminderEmail($slip);

                $slip->increment('reminder_sent_count');
                $slip->update(['last_reminder_sent_at' => now()]);

                $results['sent']++;
            } catch (Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'slip_id' => $slip->id,
                    'error' => $e->getMessage()
                ];

                $this->loggingService->logError($e, [
                    'slip_id' => $slip->id,
                    'operation' => 'send_bulk_reminder'
                ]);
            }
        }

        // Log bulk operation
        $this->loggingService->logUserActivity(
            auth()->id(),
            'bulk_reminders_sent',
            'PermissionSlip',
            null,
            [
                'total_slips' => count($slipIds),
                'sent' => $results['sent'],
                'failed' => $results['failed'],
            ]
        );

        return $results;
    }

    /**
     * Send reminder email for unsigned permission slip.
     *
     * @param PermissionSlip $slip
     * @return bool
     */
    private function sendReminderEmail(PermissionSlip $slip): bool
    {
        $signingUrl = url("/permission-slip/{$slip->token}");
        $daysUntilEvent = $slip->booking->confirmed_date
            ? now()->diffInDays($slip->booking->confirmed_date, false)
            : null;

        $subject = 'Reminder: Permission Slip Required - ' . $slip->booking->program->title;
        $message = "This is a reminder that we still need a signed permission slip for " .
                   "{$slip->student->full_name} to participate in the {$slip->booking->program->title} program";

        if ($daysUntilEvent !== null) {
            if ($daysUntilEvent > 0) {
                $message .= " in {$daysUntilEvent} days";
            } elseif ($daysUntilEvent === 0) {
                $message .= " today";
            } else {
                $message .= " (event has passed)";
            }
        }

        $message .= ". Please sign the permission slip at: {$signingUrl}";

        return $this->emailService->sendNotificationEmail(
            $slip->parent_email,
            $slip->parent_name,
            $subject,
            $message
        );
    }

    /**
     * Delete a permission slip.
     *
     * @param PermissionSlip $slip
     * @return bool
     * @throws Exception
     */
    public function deletePermissionSlip(PermissionSlip $slip): bool
    {
        try {
            DB::beginTransaction();

            if ($slip->is_signed) {
                throw new Exception('Cannot delete a signed permission slip');
            }

            $slip->delete();

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'permission_slip_deleted',
                'PermissionSlip',
                $slip->id,
                [
                    'booking_reference' => $slip->booking->booking_reference,
                    'student_name' => $slip->student->full_name,
                ]
            );

            DB::commit();

            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'slip_id' => $slip->id,
                'operation' => 'delete_permission_slip'
            ]);

            throw $e;
        }
    }

    /**
     * Resend permission slip email.
     *
     * @param PermissionSlip $slip
     * @return bool
     * @throws Exception
     */
    public function resendPermissionSlipEmail(PermissionSlip $slip): bool
    {
        if ($slip->is_signed) {
            throw new Exception('Cannot resend email for signed permission slip');
        }

        $result = $this->sendPermissionSlipEmail($slip);

        if ($result) {
            $slip->increment('reminder_sent_count');
            $slip->update(['last_reminder_sent_at' => now()]);

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'permission_slip_email_resent',
                'PermissionSlip',
                $slip->id,
                [
                    'booking_reference' => $slip->booking->booking_reference,
                    'student_name' => $slip->student->full_name,
                ]
            );
        }

        return $result;
    }

    /**
     * Create a single permission slip from request data.
     *
     * @param array $data
     * @return PermissionSlip
     * @throws Exception
     */
    public function createPermissionSlipFromRequest(array $data): PermissionSlip
    {
        $booking = Booking::findOrFail($data['booking_id']);
        $template = isset($data['template_id'])
            ? PermissionSlipTemplate::findOrFail($data['template_id'])
            : PermissionSlipTemplate::default()->active()->first();

        if (!$template) {
            throw new Exception('No active default template found');
        }

        return $this->createPermissionSlipsForBooking($booking, $template->id)->first();
    }

    /**
     * Update permission slip.
     *
     * @param PermissionSlip $slip
     * @param array $data
     * @return PermissionSlip
     */
    public function updatePermissionSlip(PermissionSlip $slip, array $data): PermissionSlip
    {
        if ($slip->is_signed) {
            throw new Exception('Cannot update a signed permission slip');
        }

        $slip->update($data);
        return $slip->fresh();
    }

    /**
     * Send reminder for a single permission slip.
     *
     * @param PermissionSlip $slip
     * @return bool
     */
    public function sendReminder(PermissionSlip $slip): bool
    {
        if (!$slip->can_send_reminder) {
            return false;
        }

        $result = $this->sendReminderEmail($slip);

        if ($result) {
            $slip->increment('reminder_sent_count');
            $slip->update(['last_reminder_sent_at' => now()]);
        }

        return $result;
    }

    /**
     * Export permission slips.
     *
     * @param int $bookingId
     * @param array $options
     * @return array
     */
    public function exportPermissionSlips(int $bookingId, array $options = []): array
    {
        $slips = PermissionSlip::where('booking_id', $bookingId)
            ->with(['booking.school', 'booking.program', 'student'])
            ->get();

        return [
            'format' => $options['format'] ?? 'csv',
            'filename' => "permission_slips_booking_{$bookingId}.{$options['format']}",
            'data' => $slips->toArray(),
            'count' => $slips->count(),
        ];
    }

    /**
     * Create bulk permission slips.
     *
     * @param array $data
     * @return array
     */
    public function createBulkPermissionSlips(array $data): array
    {
        $booking = Booking::findOrFail($data['booking_id']);
        $slips = $this->createPermissionSlipsForBooking($booking, $data['template_id'] ?? null);

        return [
            'created_count' => $slips->count(),
            'permission_slips' => $slips->toArray(),
        ];
    }

    /**
     * Get all templates.
     *
     * @return Collection
     */
    public function getTemplates(): Collection
    {
        return PermissionSlipTemplate::active()->get();
    }

    /**
     * Check if token is expired.
     *
     * @param PermissionSlip $slip
     * @return bool
     */
    public function isTokenExpired(PermissionSlip $slip): bool
    {
        // Tokens expire 30 days after booking confirmation or if event has passed
        if (!$slip->booking->confirmed_date) {
            return false;
        }

        $expiryDate = $slip->booking->confirmed_date->addDays(30);
        return now()->greaterThan($expiryDate);
    }

    /**
     * Get template content for permission slip.
     *
     * @param PermissionSlip $slip
     * @return string
     */
    public function getTemplateContent(PermissionSlip $slip): string
    {
        if (!$slip->template) {
            return 'Default permission slip content';
        }

        $variables = [
            'student_name' => $slip->student->full_name,
            'program_title' => $slip->booking->program->title,
            'school_name' => $slip->booking->school->name,
            'event_date' => $slip->booking->confirmed_date?->format('F j, Y'),
            'event_time' => $slip->booking->confirmed_time?->format('g:i A'),
        ];

        return $slip->template->renderContent($variables);
    }
}
