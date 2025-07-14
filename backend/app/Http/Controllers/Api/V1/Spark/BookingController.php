<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\CreateBookingRequest;
use App\Http\Requests\Spark\UpdateBookingRequest;
use App\Http\Resources\Spark\BookingResource;
use App\Services\Spark\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Booking Controller
 * 
 * Handles booking API endpoints for Spark programs
 */
class BookingController extends BaseApiController
{
    public function __construct(
        private BookingService $bookingService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get bookings list
     */
    public function index(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'school_id' => 'sometimes|exists:spark_schools,id',
                'teacher_id' => 'sometimes|exists:users,id',
                'program_id' => 'sometimes|exists:spark_programs,id',
                'status' => 'sometimes|string|in:pending,confirmed,cancelled,completed',
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
                'search' => 'sometimes|string|max:255',
                'per_page' => 'sometimes|integer|min:1|max:100',
            ]);

            $bookings = $this->bookingService->getBookings($request->validated());

            return $this->paginatedResponse($bookings, 'Bookings retrieved successfully');
        });
    }

    /**
     * Create new booking
     */
    public function store(CreateBookingRequest $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $booking = $this->bookingService->createBooking(auth()->user(), $request->validated());

            return $this->createdResponse(
                new BookingResource($booking),
                'Booking created successfully'
            );
        });
    }

    /**
     * Get booking by ID
     */
    public function show(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $booking = $this->bookingService->getBookingById($id);

            if (!$booking) {
                return $this->notFoundResponse('Booking not found');
            }

            $this->authorize('view', $booking);

            return $this->successResponse(
                new BookingResource($booking),
                'Booking retrieved successfully'
            );
        });
    }

    /**
     * Update booking
     */
    public function update(UpdateBookingRequest $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $booking = $this->bookingService->getBookingById($id);

            if (!$booking) {
                return $this->notFoundResponse('Booking not found');
            }

            $this->authorize('update', $booking);

            $booking = $this->bookingService->updateBooking($booking, $request->validated());

            return $this->updatedResponse(
                new BookingResource($booking),
                'Booking updated successfully'
            );
        });
    }

    /**
     * Confirm booking
     */
    public function confirm(int $id, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $request->validate([
                'confirmed_date' => 'required|date|after_or_equal:today',
                'confirmed_time' => 'required|date_format:H:i',
                'notes' => 'sometimes|string|max:1000',
            ]);

            $booking = $this->bookingService->getBookingById($id);

            if (!$booking) {
                return $this->notFoundResponse('Booking not found');
            }

            $this->authorize('confirm', $booking);

            $result = $this->bookingService->confirmBooking(
                $booking,
                $request->confirmed_date,
                $request->confirmed_time,
                $request->notes
            );

            if (!$result) {
                return $this->errorResponse('Unable to confirm booking', 400);
            }

            return $this->successResponse(
                new BookingResource($booking->fresh()),
                'Booking confirmed successfully'
            );
        });
    }

    /**
     * Cancel booking
     */
    public function cancel(int $id, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $request->validate([
                'reason' => 'sometimes|string|max:500',
            ]);

            $booking = $this->bookingService->getBookingById($id);

            if (!$booking) {
                return $this->notFoundResponse('Booking not found');
            }

            $this->authorize('cancel', $booking);

            $result = $this->bookingService->cancelBooking($booking, $request->reason);

            if (!$result) {
                return $this->errorResponse('Unable to cancel booking', 400);
            }

            return $this->successResponse(null, 'Booking cancelled successfully');
        });
    }

    /**
     * Complete booking
     */
    public function complete(int $id, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $request->validate([
                'rating' => 'sometimes|integer|min:1|max:5',
                'feedback' => 'sometimes|string|max:1000',
            ]);

            $booking = $this->bookingService->getBookingById($id);

            if (!$booking) {
                return $this->notFoundResponse('Booking not found');
            }

            $this->authorize('complete', $booking);

            $result = $this->bookingService->completeBooking(
                $booking,
                $request->rating,
                $request->feedback
            );

            if (!$result) {
                return $this->errorResponse('Unable to complete booking', 400);
            }

            return $this->successResponse(
                new BookingResource($booking->fresh()),
                'Booking completed successfully'
            );
        });
    }

    /**
     * Get booking students
     */
    public function students(int $id, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $booking = $this->bookingService->getBookingById($id);

            if (!$booking) {
                return $this->notFoundResponse('Booking not found');
            }

            $this->authorize('view', $booking);

            $students = $this->bookingService->getBookingStudents($id, $request->per_page ?? 50);

            return $this->paginatedResponse($students, 'Booking students retrieved successfully');
        });
    }

    /**
     * Add students to booking
     */
    public function addStudents(int $id, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $request->validate([
                'students' => 'required|array|min:1|max:100',
                'students.*.first_name' => 'required|string|max:255',
                'students.*.last_name' => 'required|string|max:255',
                'students.*.grade_level' => 'required|string|in:K,1,2,3,4,5,6,7,8,9,10,11,12',
                'students.*.student_id_number' => 'sometimes|string|max:50',
                'students.*.parent_name' => 'required|string|max:255',
                'students.*.parent_email' => 'required|email|max:255',
                'students.*.parent_phone' => 'required|string|max:20',
                'students.*.emergency_contact' => 'sometimes|array',
                'students.*.medical_info' => 'sometimes|array',
                'students.*.dietary_restrictions' => 'sometimes|array',
                'students.*.special_needs' => 'sometimes|array',
            ]);

            $booking = $this->bookingService->getBookingById($id);

            if (!$booking) {
                return $this->notFoundResponse('Booking not found');
            }

            $this->authorize('update', $booking);

            $result = $this->bookingService->addStudentsToBooking($id, $request->students);

            return $this->successResponse($result, 'Students added to booking successfully');
        });
    }

    /**
     * Get booking statistics
     */
    public function statistics(int $id, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $booking = $this->bookingService->getBookingById($id);

            if (!$booking) {
                return $this->notFoundResponse('Booking not found');
            }

            $this->authorize('view', $booking);

            $statistics = $this->bookingService->getBookingStatistics($booking);

            return $this->successResponse($statistics, 'Booking statistics retrieved successfully');
        });
    }
}
