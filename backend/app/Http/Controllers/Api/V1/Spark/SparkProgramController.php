<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\CreateProgramRequest;
use App\Http\Requests\Spark\UpdateProgramRequest;
use App\Http\Resources\Spark\SparkProgramResource;
use App\Models\Spark\SparkProgram;
use App\Services\Spark\SparkProgramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SparkProgramController extends BaseApiController
{
    public function __construct(
        private SparkProgramService $programService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get programs list
     */
    public function index(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'grade_level' => 'sometimes|string',
                'character_topic' => 'sometimes|string',
                'min_duration' => 'sometimes|integer|min:1',
                'max_duration' => 'sometimes|integer|min:1',
                'min_capacity' => 'sometimes|integer|min:1',
                'max_capacity' => 'sometimes|integer|min:1',
                'search' => 'sometimes|string|max:255',
                'per_page' => 'sometimes|integer|min:1|max:100',
            ]);

            $programs = $this->programService->getPrograms($request->validated());

            return $this->paginatedResponse($programs, 'Programs retrieved successfully');
        });
    }

    /**
     * Create new program
     */
    public function store(CreateProgramRequest $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $this->authorize('create', SparkProgram::class);

            $program = $this->programService->createProgram($request->validated());

            return $this->createdResponse(
                new SparkProgramResource($program),
                'Program created successfully'
            );
        });
    }

    /**
     * Get program by ID
     */
    public function show(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $program = $this->programService->getProgramById($id);

            if (!$program) {
                return $this->errorResponse('Program not found', 404);
            }

            return $this->successResponse(
                new SparkProgramResource($program),
                'Program retrieved successfully'
            );
        });
    }

    /**
     * Update program
     */
    public function update(UpdateProgramRequest $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $program = $this->programService->getProgramById($id);

            if (!$program) {
                return $this->errorResponse('Program not found', 404);
            }

            $this->authorize('update', $program);

            $program = $this->programService->updateProgram($program, $request->validated());

            return $this->successResponse(
                new SparkProgramResource($program),
                'Program updated successfully'
            );
        });
    }

    /**
     * Delete program
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $program = $this->programService->getProgramById($id);

            if (!$program) {
                return $this->errorResponse('Program not found', 404);
            }

            $this->authorize('delete', $program);

            $this->programService->deleteProgram($program);

            return $this->deletedResponse('Program deleted successfully');
        });
    }

    /**
     * Upload resource files
     */
    public function uploadResources(int $id, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $request->validate([
                'files' => 'required|array|max:10',
                'files.*' => 'file|mimes:pdf,doc,docx,ppt,pptx,jpg,jpeg,png|max:10240',
            ]);

            $program = $this->programService->getProgramById($id);

            if (!$program) {
                return $this->errorResponse('Program not found', 404);
            }

            $this->authorize('update', $program);

            $program = $this->programService->uploadResourceFiles($program, $request->file('files'));

            return $this->successResponse(
                new SparkProgramResource($program),
                'Resource files uploaded successfully'
            );
        });
    }

    /**
     * Get program availability
     */
    public function availability(int $id, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $request->validate([
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
                'per_page' => 'sometimes|integer|min:1|max:100',
            ]);

            $availability = $this->programService->getProgramAvailability(
                $id,
                $request->start_date,
                $request->end_date,
                $request->per_page ?? 30
            );

            return $this->paginatedResponse($availability, 'Program availability retrieved successfully');
        });
    }

    /**
     * Set program availability
     */
    public function setAvailability(int $id, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $request->validate([
                'availability' => 'required|array|min:1',
                'availability.*.date' => 'required|date|after_or_equal:today',
                'availability.*.start_time' => 'required|date_format:H:i',
                'availability.*.end_time' => 'required|date_format:H:i|after:availability.*.start_time',
                'availability.*.max_bookings' => 'required|integer|min:1|max:100',
                'availability.*.notes' => 'sometimes|string|max:500',
            ]);

            $result = $this->programService->setProgramAvailability($id, $request->availability);

            return $this->successResponse($result, 'Program availability set successfully');
        });
    }
}
