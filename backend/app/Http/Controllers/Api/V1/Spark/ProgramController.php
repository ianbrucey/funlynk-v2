<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\CreateProgramRequest;
use App\Http\Requests\Spark\UpdateProgramRequest;
use App\Http\Resources\Spark\ProgramResource;
use App\Models\Spark\Program;
use App\Services\Spark\ProgramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Program Controller.
 *
 * Handles Spark program management operations
 */
class ProgramController extends BaseApiController
{
    public function __construct(
        private ProgramService $programService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get paginated list of programs.
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
                'search' => 'string|max:100',
                'grade_level' => 'string|max:10',
                'character_topic' => 'string|max:50',
                'min_duration' => 'integer|min:1',
                'max_duration' => 'integer|min:1',
                'min_price' => 'numeric|min:0',
                'max_price' => 'numeric|min:0',
                'active_only' => 'boolean',
            ]);

            $programs = $this->programService->getPrograms(
                $request->only([
                    'search', 'grade_level', 'character_topic',
                    'min_duration', 'max_duration', 'min_price', 'max_price', 'active_only'
                ]),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($programs, 'Programs retrieved successfully');
        });
    }

    /**
     * Create a new program.
     *
     * @param CreateProgramRequest $request
     *
     * @return JsonResponse
     */
    public function store(CreateProgramRequest $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $program = $this->programService->createProgram($request->validated());

            return $this->createdResponse(
                new ProgramResource($program),
                'Program created successfully'
            );
        });
    }

    /**
     * Get a specific program.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $program = Program::with(['availability', 'bookings'])->findOrFail($id);

            return $this->successResponse(
                new ProgramResource($program),
                'Program retrieved successfully'
            );
        });
    }

    /**
     * Update a program.
     *
     * @param UpdateProgramRequest $request
     * @param int                  $id
     *
     * @return JsonResponse
     */
    public function update(UpdateProgramRequest $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $program = Program::findOrFail($id);
            $program = $this->programService->updateProgram($program, $request->validated());

            return $this->updatedResponse(
                new ProgramResource($program),
                'Program updated successfully'
            );
        });
    }

    /**
     * Delete a program.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $program = Program::findOrFail($id);

            if (!$program->canBeDeleted()) {
                return $this->errorResponse(
                    'Cannot delete program with confirmed or pending bookings',
                    400
                );
            }

            $this->programService->deleteProgram($program);

            return $this->deletedResponse('Program deleted successfully');
        });
    }

    /**
     * Get program availability.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function availability(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $program = Program::findOrFail($id);

            $request->validate([
                'start_date' => 'date',
                'end_date' => 'date|after_or_equal:start_date',
                'per_page' => 'integer|min:1|max:50',
            ]);

            $availability = $this->programService->getProgramAvailability(
                $program,
                $request->input('start_date'),
                $request->input('end_date'),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($availability, 'Program availability retrieved successfully');
        });
    }

    /**
     * Add availability slot.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function addAvailability(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $request->validate([
                'date' => 'required|date|after_or_equal:today',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'max_bookings' => 'required|integer|min:1|max:100',
                'notes' => 'nullable|string|max:500',
            ]);

            $program = Program::findOrFail($id);
            $availability = $this->programService->addProgramAvailability($program, $request->validated());

            return $this->createdResponse(
                $availability,
                'Availability slot added successfully'
            );
        });
    }

    /**
     * Update availability slot.
     *
     * @param Request $request
     * @param int     $id
     * @param int     $availabilityId
     *
     * @return JsonResponse
     */
    public function updateAvailability(Request $request, int $id, int $availabilityId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id, $availabilityId) {
            $request->validate([
                'date' => 'sometimes|date|after_or_equal:today',
                'start_time' => 'sometimes|date_format:H:i',
                'end_time' => 'sometimes|date_format:H:i|after:start_time',
                'max_bookings' => 'sometimes|integer|min:1|max:100',
                'is_available' => 'sometimes|boolean',
                'notes' => 'nullable|string|max:500',
            ]);

            $program = Program::findOrFail($id);
            $availability = $this->programService->updateProgramAvailability(
                $program,
                $availabilityId,
                $request->validated()
            );

            return $this->updatedResponse(
                $availability,
                'Availability slot updated successfully'
            );
        });
    }

    /**
     * Remove availability slot.
     *
     * @param Request $request
     * @param int     $id
     * @param int     $availabilityId
     *
     * @return JsonResponse
     */
    public function removeAvailability(Request $request, int $id, int $availabilityId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id, $availabilityId) {
            $program = Program::findOrFail($id);
            $result = $this->programService->removeProgramAvailability($program, $availabilityId);

            if (!$result) {
                return $this->errorResponse('Cannot remove availability slot with existing bookings', 400);
            }

            return $this->deletedResponse('Availability slot removed successfully');
        });
    }

    /**
     * Get program statistics.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function statistics(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $program = Program::findOrFail($id);
            $statistics = $program->getStatistics();

            return $this->successResponse($statistics, 'Program statistics retrieved successfully');
        });
    }

    /**
     * Activate a program.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function activate(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $program = Program::findOrFail($id);
            $program->activate();

            return $this->successResponse(
                ['is_active' => true],
                'Program activated successfully'
            );
        });
    }

    /**
     * Deactivate a program.
     *
     * @param Request $request
     * @param int     $id
     *
     * @return JsonResponse
     */
    public function deactivate(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $program = Program::findOrFail($id);
            $program->deactivate();

            return $this->successResponse(
                ['is_active' => false],
                'Program deactivated successfully'
            );
        });
    }
}
