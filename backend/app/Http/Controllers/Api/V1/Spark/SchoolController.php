<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\CreateSchoolRequest;
use App\Http\Requests\Spark\UpdateSchoolRequest;
use App\Http\Resources\Spark\SchoolResource;
use App\Services\Spark\SchoolService;
use App\Models\Spark\School;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * School Controller
 * 
 * Handles school management operations for Spark educational programs
 */
class SchoolController extends BaseApiController
{
    public function __construct(
        private SchoolService $schoolService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get paginated list of schools
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
                'district_id' => 'integer|exists:districts,id',
                'type' => 'string|in:elementary,middle,high,k12,charter,private,magnet',
                'grade_level' => 'string|max:10',
                'active_only' => 'boolean',
            ]);

            $schools = $this->schoolService->getSchools(
                $request->only(['search', 'district_id', 'type', 'grade_level', 'active_only']),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($schools, 'Schools retrieved successfully');
        });
    }

    /**
     * Create a new school
     *
     * @param CreateSchoolRequest $request
     * @return JsonResponse
     */
    public function store(CreateSchoolRequest $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $school = $this->schoolService->createSchool($request->validated());
            
            return $this->createdResponse(
                new SchoolResource($school),
                'School created successfully'
            );
        });
    }

    /**
     * Get a specific school
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $school = School::with(['district', 'programs', 'administrators'])->findOrFail($id);
            
            return $this->successResponse(
                new SchoolResource($school),
                'School retrieved successfully'
            );
        });
    }

    /**
     * Update a school
     *
     * @param UpdateSchoolRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateSchoolRequest $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $school = School::findOrFail($id);
            $school = $this->schoolService->updateSchool($school, $request->validated());
            
            return $this->updatedResponse(
                new SchoolResource($school),
                'School updated successfully'
            );
        });
    }

    /**
     * Delete a school
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $school = School::findOrFail($id);
            
            if (!$school->canBeDeleted()) {
                return $this->errorResponse(
                    'Cannot delete school with associated programs or users',
                    400
                );
            }
            
            $this->schoolService->deleteSchool($school);
            
            return $this->deletedResponse('School deleted successfully');
        });
    }

    /**
     * Get programs in a school
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function programs(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $school = School::findOrFail($id);
            
            $request->validate([
                'per_page' => 'integer|min:1|max:50',
                'active_only' => 'boolean',
                'type' => 'string|in:field_trip,workshop,residency,assembly,after_school,summer_camp',
            ]);

            $programs = $this->schoolService->getSchoolPrograms(
                $school,
                $request->only(['active_only', 'type']),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($programs, 'School programs retrieved successfully');
        });
    }

    /**
     * Add administrator to school
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function addAdministrator(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $request->validate([
                'user_id' => 'required|integer|exists:users,id',
                'role' => 'required|string|in:admin,principal,vice_principal,coordinator',
                'permissions' => 'array',
                'permissions.*' => 'string',
            ]);

            $school = School::findOrFail($id);
            $user = User::findOrFail($request->input('user_id'));
            
            $result = $this->schoolService->addAdministrator(
                $school,
                $user,
                $request->input('role'),
                $request->input('permissions', [])
            );

            if (!$result) {
                return $this->errorResponse('User is already an administrator of this school', 400);
            }

            return $this->successResponse(
                ['administrator_added' => true],
                'Administrator added successfully'
            );
        });
    }

    /**
     * Remove administrator from school
     *
     * @param Request $request
     * @param int $id
     * @param int $userId
     * @return JsonResponse
     */
    public function removeAdministrator(Request $request, int $id, int $userId): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id, $userId) {
            $school = School::findOrFail($id);
            $user = User::findOrFail($userId);
            
            $result = $this->schoolService->removeAdministrator($school, $user);

            if (!$result) {
                return $this->errorResponse('User is not an administrator of this school', 400);
            }

            return $this->successResponse(
                ['administrator_removed' => true],
                'Administrator removed successfully'
            );
        });
    }

    /**
     * Get school administrators
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function administrators(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $school = School::findOrFail($id);
            
            $request->validate([
                'per_page' => 'integer|min:1|max:50',
            ]);

            $administrators = $school->administrators()
                ->paginate($request->input('per_page', 15));

            return $this->paginatedResponse($administrators, 'School administrators retrieved successfully');
        });
    }

    /**
     * Get school statistics
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function statistics(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $school = School::findOrFail($id);
            $statistics = $school->getStatistics();
            
            return $this->successResponse($statistics, 'School statistics retrieved successfully');
        });
    }

    /**
     * Activate a school
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function activate(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $school = School::findOrFail($id);
            $school->activate();
            
            return $this->successResponse(
                ['is_active' => true],
                'School activated successfully'
            );
        });
    }

    /**
     * Deactivate a school
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function deactivate(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $school = School::findOrFail($id);
            $school->deactivate();
            
            return $this->successResponse(
                ['is_active' => false],
                'School deactivated successfully'
            );
        });
    }
}
