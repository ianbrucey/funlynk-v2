<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\CreateProgramAvailabilityRequest;
use App\Http\Requests\Spark\UpdateProgramAvailabilityRequest;
use App\Models\Spark\ProgramAvailability;
use App\Models\Spark\Program;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Program Availability Controller
 * 
 * Handles program availability slot management operations
 */
class ProgramAvailabilityController extends BaseApiController
{
    public function __construct()
    {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get paginated list of program availability slots
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'per_page' => 'integer|min:1|max:50',
                'program_id' => 'integer|exists:spark_programs,id',
                'date_from' => 'date',
                'date_to' => 'date|after_or_equal:date_from',
                'available_only' => 'boolean',
                'future_only' => 'boolean',
            ]);

            $query = ProgramAvailability::with(['program']);

            // Apply filters
            if ($request->has('program_id')) {
                $query->where('program_id', $request->input('program_id'));
            }

            if ($request->has('date_from')) {
                $query->where('date', '>=', $request->input('date_from'));
            }

            if ($request->has('date_to')) {
                $query->where('date', '<=', $request->input('date_to'));
            }

            if ($request->boolean('available_only')) {
                $query->available();
            }

            if ($request->boolean('future_only', true)) {
                $query->future();
            }

            $availability = $query->orderBy('date')
                                 ->orderBy('start_time')
                                 ->paginate($request->input('per_page', 15));

            return $this->paginatedResponse($availability, 'Program availability retrieved successfully');
        });
    }

    /**
     * Create a new program availability slot
     *
     * @param CreateProgramAvailabilityRequest $request
     * @return JsonResponse
     */
    public function store(CreateProgramAvailabilityRequest $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $availability = ProgramAvailability::create($request->validated());
            
            return $this->createdResponse(
                $availability->load('program'),
                'Program availability slot created successfully'
            );
        });
    }

    /**
     * Get a specific program availability slot
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $availability = ProgramAvailability::with(['program'])->findOrFail($id);
            
            return $this->successResponse(
                $availability,
                'Program availability slot retrieved successfully'
            );
        });
    }

    /**
     * Update a program availability slot
     *
     * @param UpdateProgramAvailabilityRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateProgramAvailabilityRequest $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $availability = ProgramAvailability::findOrFail($id);
            $availability->update($request->validated());
            
            return $this->updatedResponse(
                $availability->load('program'),
                'Program availability slot updated successfully'
            );
        });
    }

    /**
     * Delete a program availability slot
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $availability = ProgramAvailability::findOrFail($id);
            
            // Check if there are any bookings for this slot
            if ($availability->current_bookings > 0) {
                return $this->errorResponse(
                    'Cannot delete availability slot with existing bookings',
                    400
                );
            }
            
            $availability->delete();
            
            return $this->deletedResponse('Program availability slot deleted successfully');
        });
    }

    /**
     * Get availability for a specific program
     *
     * @param Request $request
     * @param int $programId
     * @return JsonResponse
     */
    public function programAvailability(Request $request, int $programId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $programId) {
            $program = Program::findOrFail($programId);
            
            $request->validate([
                'per_page' => 'integer|min:1|max:50',
                'date_from' => 'date',
                'date_to' => 'date|after_or_equal:date_from',
                'available_only' => 'boolean',
            ]);

            $query = $program->availability();

            // Apply filters
            if ($request->has('date_from')) {
                $query->where('date', '>=', $request->input('date_from'));
            }

            if ($request->has('date_to')) {
                $query->where('date', '<=', $request->input('date_to'));
            }

            if ($request->boolean('available_only')) {
                $query->available();
            }

            $availability = $query->future()
                                 ->orderBy('date')
                                 ->orderBy('start_time')
                                 ->paginate($request->input('per_page', 15));

            return $this->paginatedResponse($availability, 'Program availability retrieved successfully');
        });
    }

    /**
     * Bulk create availability slots for a program
     *
     * @param Request $request
     * @param int $programId
     * @return JsonResponse
     */
    public function bulkCreate(Request $request, int $programId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $programId) {
            $program = Program::findOrFail($programId);
            
            $request->validate([
                'slots' => 'required|array|min:1|max:50',
                'slots.*.date' => 'required|date|after_or_equal:today',
                'slots.*.start_time' => 'required|date_format:H:i',
                'slots.*.end_time' => 'required|date_format:H:i|after:slots.*.start_time',
                'slots.*.max_bookings' => 'required|integer|min:1|max:100',
                'slots.*.notes' => 'nullable|string|max:500',
            ]);

            $createdSlots = [];
            
            foreach ($request->input('slots') as $slotData) {
                $slotData['program_id'] = $programId;
                $slotData['current_bookings'] = 0;
                $slotData['is_available'] = true;
                
                $createdSlots[] = ProgramAvailability::create($slotData);
            }

            return $this->createdResponse(
                $createdSlots,
                'Program availability slots created successfully'
            );
        });
    }

    /**
     * Get availability statistics for a program
     *
     * @param Request $request
     * @param int $programId
     * @return JsonResponse
     */
    public function statistics(Request $request, int $programId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($programId) {
            $program = Program::findOrFail($programId);
            
            $stats = [
                'total_slots' => $program->availability()->count(),
                'available_slots' => $program->availability()->available()->count(),
                'future_slots' => $program->availability()->future()->count(),
                'fully_booked_slots' => $program->availability()->where('current_bookings', '>=', 'max_bookings')->count(),
                'total_capacity' => $program->availability()->sum('max_bookings'),
                'total_bookings' => $program->availability()->sum('current_bookings'),
            ];

            $stats['utilization_rate'] = $stats['total_capacity'] > 0 
                ? round(($stats['total_bookings'] / $stats['total_capacity']) * 100, 2)
                : 0;

            return $this->successResponse($stats, 'Program availability statistics retrieved successfully');
        });
    }
}
