<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\CreateDistrictRequest;
use App\Http\Requests\Spark\UpdateDistrictRequest;
use App\Http\Resources\Spark\DistrictResource;
use App\Services\Spark\DistrictService;
use App\Models\Spark\District;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * District Controller
 * 
 * Handles district management operations for Spark educational programs
 */
class DistrictController extends BaseApiController
{
    public function __construct(
        private DistrictService $districtService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get paginated list of districts
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'per_page' => 'integer|min:1|max:50',
                'search' => 'string|max:100',
                'state' => 'string|max:2',
                'active_only' => 'boolean',
            ]);

            $districts = $this->districtService->getDistricts(
                $request->only(['search', 'state', 'active_only']),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($districts, 'Districts retrieved successfully');
        });
    }

    /**
     * Create a new district
     *
     * @param CreateDistrictRequest $request
     * @return JsonResponse
     */
    public function store(CreateDistrictRequest $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $district = $this->districtService->createDistrict($request->validated());
            
            return $this->createdResponse(
                new DistrictResource($district),
                'District created successfully'
            );
        });
    }

    /**
     * Get a specific district
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $district = District::with(['schools'])->findOrFail($id);
            
            return $this->successResponse(
                new DistrictResource($district),
                'District retrieved successfully'
            );
        });
    }

    /**
     * Update a district
     *
     * @param UpdateDistrictRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateDistrictRequest $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $district = District::findOrFail($id);
            $district = $this->districtService->updateDistrict($district, $request->validated());
            
            return $this->updatedResponse(
                new DistrictResource($district),
                'District updated successfully'
            );
        });
    }

    /**
     * Delete a district
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $district = District::findOrFail($id);
            
            if (!$district->canBeDeleted()) {
                return $this->errorResponse(
                    'Cannot delete district with associated schools or users',
                    400
                );
            }
            
            $this->districtService->deleteDistrict($district);
            
            return $this->deletedResponse('District deleted successfully');
        });
    }

    /**
     * Get schools in a district
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function schools(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $district = District::findOrFail($id);
            
            $request->validate([
                'per_page' => 'integer|min:1|max:50',
                'active_only' => 'boolean',
            ]);

            $schools = $this->districtService->getDistrictSchools(
                $district,
                $request->boolean('active_only', false),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($schools, 'District schools retrieved successfully');
        });
    }

    /**
     * Get users in a district
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function users(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $district = District::findOrFail($id);
            
            $request->validate([
                'per_page' => 'integer|min:1|max:50',
                'role' => 'string|in:admin,teacher,staff',
            ]);

            $users = $this->districtService->getDistrictUsers(
                $district,
                $request->input('role'),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($users, 'District users retrieved successfully');
        });
    }

    /**
     * Get district statistics
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function statistics(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $district = District::findOrFail($id);
            $statistics = $district->getStatistics();
            
            return $this->successResponse($statistics, 'District statistics retrieved successfully');
        });
    }

    /**
     * Activate a district
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function activate(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $district = District::findOrFail($id);
            $district->activate();
            
            return $this->successResponse(
                ['is_active' => true],
                'District activated successfully'
            );
        });
    }

    /**
     * Deactivate a district
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function deactivate(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $district = District::findOrFail($id);
            $district->deactivate();
            
            return $this->successResponse(
                ['is_active' => false],
                'District deactivated successfully'
            );
        });
    }
}
