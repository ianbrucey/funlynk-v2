<?php

namespace App\Services\Spark;

use App\Models\Spark\District;
use App\Models\User;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Exception;

/**
 * District Service
 * 
 * Handles district management business logic for Spark educational programs
 */
class DistrictService
{
    public function __construct(
        private LoggingService $loggingService,
        private NotificationService $notificationService
    ) {}

    /**
     * Get paginated districts with filters
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getDistricts(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = District::query()->with(['schools']);

        // Apply filters
        if (isset($filters['search'])) {
            $query->search($filters['search']);
        }

        if (isset($filters['state'])) {
            $query->byState($filters['state']);
        }

        if (isset($filters['active_only']) && $filters['active_only']) {
            $query->active();
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    /**
     * Create a new district
     *
     * @param array $data
     * @return District
     * @throws Exception
     */
    public function createDistrict(array $data): District
    {
        try {
            DB::beginTransaction();

            $district = District::create($data);

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'district_created',
                'District',
                $district->id,
                ['name' => $district->name, 'code' => $district->code]
            );

            DB::commit();
            return $district;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'user_id' => auth()->id(),
                'operation' => 'create_district'
            ]);
            throw $e;
        }
    }

    /**
     * Update a district
     *
     * @param District $district
     * @param array $data
     * @return District
     * @throws Exception
     */
    public function updateDistrict(District $district, array $data): District
    {
        try {
            DB::beginTransaction();

            $district->update($data);

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'district_updated',
                'District',
                $district->id,
                ['name' => $district->name, 'changes' => array_keys($data)]
            );

            DB::commit();
            return $district;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'district_id' => $district->id,
                'operation' => 'update_district'
            ]);
            throw $e;
        }
    }

    /**
     * Delete a district
     *
     * @param District $district
     * @return bool
     * @throws Exception
     */
    public function deleteDistrict(District $district): bool
    {
        try {
            DB::beginTransaction();

            // Log the activity before deletion
            $this->loggingService->logUserActivity(
                auth()->id(),
                'district_deleted',
                'District',
                $district->id,
                ['name' => $district->name, 'code' => $district->code]
            );

            // Soft delete the district
            $district->delete();

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'district_id' => $district->id,
                'operation' => 'delete_district'
            ]);
            throw $e;
        }
    }

    /**
     * Get schools in a district
     *
     * @param District $district
     * @param bool $activeOnly
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getDistrictSchools(District $district, bool $activeOnly = false, int $perPage = 15): LengthAwarePaginator
    {
        $query = $district->schools()->with(['programs']);

        if ($activeOnly) {
            $query->active();
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    /**
     * Get users in a district
     *
     * @param District $district
     * @param string|null $role
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getDistrictUsers(District $district, ?string $role = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = $district->users();

        if ($role) {
            $query->whereHas('roles', function ($q) use ($role) {
                $q->where('name', $role);
            });
        }

        return $query->orderBy('first_name')->orderBy('last_name')->paginate($perPage);
    }

    /**
     * Get district statistics
     *
     * @param District $district
     * @return array
     */
    public function getDistrictStatistics(District $district): array
    {
        $stats = $district->getStatistics();

        // Add additional computed statistics
        $schools = $district->schools()->withCount(['programs', 'users'])->get();
        
        $stats['schools_by_type'] = $schools->groupBy('type')->map->count();
        $stats['total_programs'] = $schools->sum('programs_count');
        $stats['total_school_users'] = $schools->sum('users_count');
        $stats['average_programs_per_school'] = $stats['active_schools'] > 0 ? 
            round($stats['total_programs'] / $stats['active_schools'], 2) : 0;

        return $stats;
    }

    /**
     * Bulk import districts from CSV data
     *
     * @param array $csvData
     * @return array
     */
    public function bulkImportDistricts(array $csvData): array
    {
        $imported = 0;
        $errors = [];

        try {
            DB::beginTransaction();

            foreach ($csvData as $index => $row) {
                try {
                    $district = District::create([
                        'name' => $row['name'],
                        'code' => $row['code'],
                        'address' => $row['address'],
                        'city' => $row['city'],
                        'state' => strtoupper($row['state']),
                        'zip_code' => $row['zip_code'],
                        'phone' => $row['phone'] ?? null,
                        'email' => $row['email'] ?? null,
                        'website' => $row['website'] ?? null,
                        'is_active' => true,
                    ]);

                    $imported++;

                    // Log the import
                    $this->loggingService->logUserActivity(
                        auth()->id(),
                        'district_imported',
                        'District',
                        $district->id,
                        ['name' => $district->name, 'row' => $index + 1]
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
                'operation' => 'bulk_import_districts',
                'total_rows' => count($csvData)
            ]);
            throw $e;
        }
    }
}
