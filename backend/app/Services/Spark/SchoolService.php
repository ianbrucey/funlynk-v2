<?php

namespace App\Services\Spark;

use App\Models\Spark\School;
use App\Models\User;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Exception;

/**
 * School Service
 * 
 * Handles school management business logic for Spark educational programs
 */
class SchoolService
{
    public function __construct(
        private LoggingService $loggingService,
        private NotificationService $notificationService
    ) {}

    /**
     * Get paginated schools with filters
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getSchools(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = School::query()->with(['district', 'programs']);

        // Apply filters
        if (isset($filters['search'])) {
            $query->search($filters['search']);
        }

        if (isset($filters['district_id'])) {
            $query->byDistrict($filters['district_id']);
        }

        if (isset($filters['type'])) {
            $query->byType($filters['type']);
        }

        if (isset($filters['grade_level'])) {
            $query->byGradeLevel($filters['grade_level']);
        }

        if (isset($filters['active_only']) && $filters['active_only']) {
            $query->active();
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    /**
     * Create a new school
     *
     * @param array $data
     * @return School
     * @throws Exception
     */
    public function createSchool(array $data): School
    {
        try {
            DB::beginTransaction();

            $school = School::create($data);

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'school_created',
                'School',
                $school->id,
                [
                    'name' => $school->name,
                    'code' => $school->code,
                    'district_id' => $school->district_id
                ]
            );

            DB::commit();
            return $school;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'user_id' => auth()->id(),
                'operation' => 'create_school'
            ]);
            throw $e;
        }
    }

    /**
     * Update a school
     *
     * @param School $school
     * @param array $data
     * @return School
     * @throws Exception
     */
    public function updateSchool(School $school, array $data): School
    {
        try {
            DB::beginTransaction();

            $school->update($data);

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'school_updated',
                'School',
                $school->id,
                ['name' => $school->name, 'changes' => array_keys($data)]
            );

            DB::commit();
            return $school;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'school_id' => $school->id,
                'operation' => 'update_school'
            ]);
            throw $e;
        }
    }

    /**
     * Delete a school
     *
     * @param School $school
     * @return bool
     * @throws Exception
     */
    public function deleteSchool(School $school): bool
    {
        try {
            DB::beginTransaction();

            // Log the activity before deletion
            $this->loggingService->logUserActivity(
                auth()->id(),
                'school_deleted',
                'School',
                $school->id,
                ['name' => $school->name, 'code' => $school->code]
            );

            // Soft delete the school
            $school->delete();

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'school_id' => $school->id,
                'operation' => 'delete_school'
            ]);
            throw $e;
        }
    }

    /**
     * Get programs in a school
     *
     * @param School $school
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getSchoolPrograms(School $school, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $school->programs()->with(['teachers']);

        if (isset($filters['active_only']) && $filters['active_only']) {
            $query->active();
        }

        if (isset($filters['type'])) {
            $query->byType($filters['type']);
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    /**
     * Add administrator to school
     *
     * @param School $school
     * @param User $user
     * @param string $role
     * @param array $permissions
     * @return bool
     */
    public function addAdministrator(School $school, User $user, string $role, array $permissions = []): bool
    {
        try {
            // Check if user is already an administrator
            if ($school->isAdministrator($user)) {
                return false;
            }

            $school->addAdministrator($user, $role, $permissions);

            // Notify the user
            $this->notificationService->createNotification(
                $user->id,
                'school_admin_assigned',
                'School Administrator Role Assigned',
                "You have been assigned as {$role} for {$school->name}",
                [
                    'school_id' => $school->id,
                    'school_name' => $school->name,
                    'role' => $role,
                ]
            );

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'school_admin_added',
                'School',
                $school->id,
                [
                    'admin_user_id' => $user->id,
                    'admin_name' => $user->first_name . ' ' . $user->last_name,
                    'role' => $role,
                ]
            );

            return true;
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'school_id' => $school->id,
                'user_id' => $user->id,
                'operation' => 'add_school_administrator'
            ]);
            return false;
        }
    }

    /**
     * Remove administrator from school
     *
     * @param School $school
     * @param User $user
     * @return bool
     */
    public function removeAdministrator(School $school, User $user): bool
    {
        try {
            // Check if user is an administrator
            if (!$school->isAdministrator($user)) {
                return false;
            }

            $school->removeAdministrator($user);

            // Notify the user
            $this->notificationService->createNotification(
                $user->id,
                'school_admin_removed',
                'School Administrator Role Removed',
                "Your administrator role for {$school->name} has been removed",
                [
                    'school_id' => $school->id,
                    'school_name' => $school->name,
                ]
            );

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'school_admin_removed',
                'School',
                $school->id,
                [
                    'admin_user_id' => $user->id,
                    'admin_name' => $user->first_name . ' ' . $user->last_name,
                ]
            );

            return true;
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'school_id' => $school->id,
                'user_id' => $user->id,
                'operation' => 'remove_school_administrator'
            ]);
            return false;
        }
    }

    /**
     * Get school statistics
     *
     * @param School $school
     * @return array
     */
    public function getSchoolStatistics(School $school): array
    {
        $stats = $school->getStatistics();

        // Add additional computed statistics
        $programs = $school->programs()->withCount(['bookings', 'teachers'])->get();
        
        $stats['programs_by_type'] = $programs->groupBy('type')->map->count();
        $stats['total_bookings'] = $programs->sum('bookings_count');
        $stats['total_program_teachers'] = $programs->sum('teachers_count');
        $stats['average_bookings_per_program'] = $stats['active_programs'] > 0 ? 
            round($stats['total_bookings'] / $stats['active_programs'], 2) : 0;

        return $stats;
    }

    /**
     * Bulk import schools from CSV data
     *
     * @param array $csvData
     * @return array
     */
    public function bulkImportSchools(array $csvData): array
    {
        $imported = 0;
        $errors = [];

        try {
            DB::beginTransaction();

            foreach ($csvData as $index => $row) {
                try {
                    $school = School::create([
                        'district_id' => $row['district_id'],
                        'name' => $row['name'],
                        'code' => strtoupper($row['code']),
                        'type' => $row['type'],
                        'address' => $row['address'],
                        'city' => $row['city'],
                        'state' => strtoupper($row['state']),
                        'zip_code' => $row['zip_code'],
                        'phone' => $row['phone'] ?? null,
                        'email' => $row['email'] ?? null,
                        'principal_name' => $row['principal_name'] ?? null,
                        'principal_email' => $row['principal_email'] ?? null,
                        'grade_levels' => explode(',', $row['grade_levels']),
                        'student_count' => $row['student_count'] ?? null,
                        'is_active' => true,
                    ]);

                    $imported++;

                    // Log the import
                    $this->loggingService->logUserActivity(
                        auth()->id(),
                        'school_imported',
                        'School',
                        $school->id,
                        ['name' => $school->name, 'row' => $index + 1]
                    );
                } catch (Exception $e) {
                    $errors[] = [
                        'row' => $index + 1,
                        'error' => $e->getMessage(),
                        'data' => $row,
                    ];
                }
            }

            DB::commit();

            return [
                'imported' => $imported,
                'errors' => $errors,
                'total_rows' => count($csvData),
            ];
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'operation' => 'bulk_import_schools',
                'total_rows' => count($csvData)
            ]);
            throw $e;
        }
    }
}
