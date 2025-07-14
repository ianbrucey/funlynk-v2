<?php

namespace App\Services\Spark;

use App\Models\Spark\Booking;
use App\Models\Spark\BookingStudent;
use App\Models\Spark\Program;
use App\Models\Spark\School;
use App\Models\User;
use App\Services\Shared\EmailService;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Exception;

/**
 * Booking Service
 * 
 * Handles booking management business logic including CRUD operations, confirmations, and student management
 */
class BookingService
{
    public function __construct(
        private EmailService $emailService,
        private LoggingService $loggingService,
        private NotificationService $notificationService
    ) {}

    /**
     * Get paginated bookings with filters
     *
     * @param array<string, mixed> $filters
     * @return LengthAwarePaginator<Booking>
     */
    public function getBookings(array $filters = []): LengthAwarePaginator
    {
        $query = Booking::with(['school', 'program', 'teacher', 'students']);

        if (isset($filters['school_id'])) {
            $query->bySchool($filters['school_id']);
        }

        if (isset($filters['teacher_id'])) {
            $query->byTeacher($filters['teacher_id']);
        }

        if (isset($filters['program_id'])) {
            $query->where('program_id', $filters['program_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->byDateRange($filters['start_date'], $filters['end_date']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('booking_reference', 'LIKE', "%{$filters['search']}%")
                  ->orWhereHas('school', function ($school) use ($filters) {
                      $school->where('name', 'LIKE', "%{$filters['search']}%");
                  })
                  ->orWhereHas('program', function ($program) use ($filters) {
                      $program->where('title', 'LIKE', "%{$filters['search']}%");
                  });
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 20);
    }

    /**
     * Create a new booking
     *
     * @param User $teacher
     * @param array<string, mixed> $data
     * @return Booking
     * @throws Exception
     */
    public function createBooking(User $teacher, array $data): Booking
    {
        try {
            DB::beginTransaction();

            $program = Program::findOrFail($data['program_id']);
            $school = School::findOrFail($data['school_id']);

            // Validate student count against program capacity
            if ($data['student_count'] > $program->max_students) {
                throw new Exception("Student count exceeds program capacity of {$program->max_students}");
            }

            $booking = Booking::create([
                'school_id' => $data['school_id'],
                'program_id' => $data['program_id'],
                'teacher_id' => $teacher->id,
                'preferred_date' => $data['preferred_date'],
                'preferred_time' => $data['preferred_date'] . ' ' . $data['preferred_time'],
                'student_count' => $data['student_count'],
                'total_cost' => $data['student_count'] * $program->price_per_student,
                'status' => 'pending',
                'special_requests' => $data['special_requests'] ?? null,
                'contact_info' => $data['contact_info'],
                'payment_status' => 'pending',
            ]);

            // Generate booking reference
            $booking->update([
                'booking_reference' => $booking->generateReference()
            ]);

            // Log the activity
            $this->loggingService->logUserActivity(
                $teacher->id,
                'booking_created',
                'Booking',
                $booking->id,
                [
                    'program_title' => $program->title,
                    'school_name' => $school->name,
                    'student_count' => $booking->student_count,
                ]
            );

            // Send confirmation email
            $this->sendBookingConfirmationEmail($booking);

            DB::commit();
            return $booking->load(['school', 'program', 'teacher']);
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'teacher_id' => $teacher->id,
                'operation' => 'create_booking',
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Get booking by ID
     *
     * @param int $id
     * @return Booking|null
     */
    public function getBookingById(int $id): ?Booking
    {
        return Booking::with(['school', 'program', 'teacher', 'students', 'permissionSlips'])->find($id);
    }

    /**
     * Update booking
     *
     * @param Booking $booking
     * @param array<string, mixed> $data
     * @return Booking
     * @throws Exception
     */
    public function updateBooking(Booking $booking, array $data): Booking
    {
        try {
            DB::beginTransaction();

            if ($booking->status === 'confirmed' && isset($data['student_count'])) {
                throw new Exception('Cannot change student count for confirmed bookings');
            }

            // Recalculate total cost if student count changed
            if (isset($data['student_count'])) {
                $data['total_cost'] = $data['student_count'] * $booking->program->price_per_student;
            }

            $originalData = $booking->toArray();
            $booking->update($data);

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'booking_updated',
                'Booking',
                $booking->id,
                [
                    'booking_reference' => $booking->booking_reference,
                    'changes' => array_keys($data),
                    'original' => $originalData,
                    'updated' => $booking->toArray()
                ]
            );

            DB::commit();
            return $booking->fresh(['school', 'program', 'teacher']);
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'booking_id' => $booking->id,
                'operation' => 'update_booking',
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Confirm booking
     *
     * @param Booking $booking
     * @param string $date
     * @param string $time
     * @param string|null $notes
     * @return bool
     * @throws Exception
     */
    public function confirmBooking(Booking $booking, string $date, string $time, ?string $notes = null): bool
    {
        try {
            DB::beginTransaction();

            if ($booking->status !== 'pending') {
                throw new Exception('Only pending bookings can be confirmed');
            }

            $result = $booking->confirm($date, $time);

            if ($result && $notes) {
                $booking->update(['notes' => $notes]);
            }

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'booking_confirmed',
                'Booking',
                $booking->id,
                [
                    'booking_reference' => $booking->booking_reference,
                    'confirmed_date' => $date,
                    'confirmed_time' => $time,
                ]
            );

            // Send confirmation email
            $this->sendBookingConfirmedEmail($booking);

            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'booking_id' => $booking->id,
                'operation' => 'confirm_booking'
            ]);
            throw $e;
        }
    }

    /**
     * Cancel booking
     *
     * @param Booking $booking
     * @param string|null $reason
     * @return bool
     * @throws Exception
     */
    public function cancelBooking(Booking $booking, ?string $reason = null): bool
    {
        try {
            DB::beginTransaction();

            $result = $booking->cancel($reason);

            if ($result) {
                // Log the activity
                $this->loggingService->logUserActivity(
                    auth()->id(),
                    'booking_cancelled',
                    'Booking',
                    $booking->id,
                    [
                        'booking_reference' => $booking->booking_reference,
                        'reason' => $reason,
                    ]
                );

                // Send cancellation email
                $this->sendBookingCancelledEmail($booking, $reason);
            }

            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'booking_id' => $booking->id,
                'operation' => 'cancel_booking'
            ]);
            throw $e;
        }
    }

    /**
     * Complete booking
     *
     * @param Booking $booking
     * @param int|null $rating
     * @param string|null $feedback
     * @return bool
     * @throws Exception
     */
    public function completeBooking(Booking $booking, ?int $rating = null, ?string $feedback = null): bool
    {
        try {
            DB::beginTransaction();

            $result = $booking->complete($rating, $feedback);

            if ($result) {
                // Log the activity
                $this->loggingService->logUserActivity(
                    auth()->id(),
                    'booking_completed',
                    'Booking',
                    $booking->id,
                    [
                        'booking_reference' => $booking->booking_reference,
                        'rating' => $rating,
                        'has_feedback' => !empty($feedback),
                    ]
                );

                // Send completion email
                $this->sendBookingCompletedEmail($booking);
            }

            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'booking_id' => $booking->id,
                'operation' => 'complete_booking'
            ]);
            throw $e;
        }
    }

    /**
     * Get booking students
     *
     * @param int $bookingId
     * @param int $perPage
     * @return LengthAwarePaginator<BookingStudent>
     */
    public function getBookingStudents(int $bookingId, int $perPage = 50): LengthAwarePaginator
    {
        return BookingStudent::with(['booking'])
            ->where('booking_id', $bookingId)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($perPage);
    }

    /**
     * Add students to booking
     *
     * @param int $bookingId
     * @param array<array<string, mixed>> $studentsData
     * @return array<string, mixed>
     * @throws Exception
     */
    public function addStudentsToBooking(int $bookingId, array $studentsData): array
    {
        try {
            DB::beginTransaction();

            $booking = Booking::findOrFail($bookingId);

            if ($booking->status === 'completed') {
                throw new Exception('Cannot add students to completed booking');
            }

            $addedStudents = [];

            foreach ($studentsData as $studentData) {
                $student = BookingStudent::create([
                    'booking_id' => $booking->id,
                    'first_name' => $studentData['first_name'],
                    'last_name' => $studentData['last_name'],
                    'grade_level' => $studentData['grade_level'],
                    'student_id_number' => $studentData['student_id_number'] ?? null,
                    'parent_name' => $studentData['parent_name'],
                    'parent_email' => $studentData['parent_email'],
                    'parent_phone' => $studentData['parent_phone'],
                    'emergency_contact' => $studentData['emergency_contact'] ?? null,
                    'medical_info' => $studentData['medical_info'] ?? null,
                    'dietary_restrictions' => $studentData['dietary_restrictions'] ?? null,
                    'special_needs' => $studentData['special_needs'] ?? null,
                    'is_attending' => true,
                ]);

                $addedStudents[] = $student;
            }

            // Update booking student count
            $booking->update(['student_count' => $booking->students()->count()]);

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'booking_students_added',
                'Booking',
                $booking->id,
                [
                    'booking_reference' => $booking->booking_reference,
                    'added_count' => count($addedStudents),
                    'total_students' => $booking->student_count,
                ]
            );

            DB::commit();
            return [
                'added_count' => count($addedStudents),
                'total_students' => $booking->student_count,
                'students' => $addedStudents,
            ];
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'booking_id' => $bookingId,
                'operation' => 'add_students_to_booking'
            ]);
            throw $e;
        }
    }

    /**
     * Get booking statistics
     *
     * @param Booking $booking
     * @return array<string, mixed>
     */
    public function getBookingStatistics(Booking $booking): array
    {
        return [
            'total_students' => $booking->students()->count(),
            'checked_in_students' => $booking->students()->whereNotNull('checked_in_at')->count(),
            'permission_slips_signed' => $booking->permission_slips_signed_count,
            'permission_slips_required' => $booking->permission_slips_required_count,
            'all_permission_slips_signed' => $booking->all_permission_slips_signed,
        ];
    }

    /**
     * Send booking confirmation email
     *
     * @param Booking $booking
     * @return void
     */
    private function sendBookingConfirmationEmail(Booking $booking): void
    {
        $this->emailService->sendEmail(
            $booking->contact_info['primary_contact_email'],
            'Spark Program Booking Confirmation',
            'emails.spark.booking-confirmation',
            [
                'booking' => $booking,
                'school' => $booking->school,
                'program' => $booking->program,
                'teacher' => $booking->teacher,
            ]
        );
    }

    /**
     * Send booking confirmed email
     *
     * @param Booking $booking
     * @return void
     */
    private function sendBookingConfirmedEmail(Booking $booking): void
    {
        $this->emailService->sendEmail(
            $booking->contact_info['primary_contact_email'],
            'Spark Program Booking Confirmed',
            'emails.spark.booking-confirmed',
            [
                'booking' => $booking,
                'school' => $booking->school,
                'program' => $booking->program,
            ]
        );
    }

    /**
     * Send booking cancelled email
     *
     * @param Booking $booking
     * @param string|null $reason
     * @return void
     */
    private function sendBookingCancelledEmail(Booking $booking, ?string $reason): void
    {
        $this->emailService->sendEmail(
            $booking->contact_info['primary_contact_email'],
            'Spark Program Booking Cancelled',
            'emails.spark.booking-cancelled',
            [
                'booking' => $booking,
                'reason' => $reason,
            ]
        );
    }

    /**
     * Send booking completed email
     *
     * @param Booking $booking
     * @return void
     */
    private function sendBookingCompletedEmail(Booking $booking): void
    {
        $this->emailService->sendEmail(
            $booking->contact_info['primary_contact_email'],
            'Spark Program Completed',
            'emails.spark.booking-completed',
            [
                'booking' => $booking,
                'program' => $booking->program,
            ]
        );
    }
}
