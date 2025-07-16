<?php

namespace App\Services\Spark;

use App\Models\Spark\SparkProgram;
use App\Models\Spark\ProgramAvailability;
use App\Services\Shared\FileUploadService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class SparkProgramService
{
    public function __construct(
        private FileUploadService $fileUploadService
    ) {}

    public function getPrograms(array $filters = []): LengthAwarePaginator
    {
        $query = SparkProgram::with(['characterTopics'])->active();

        if (isset($filters['grade_level'])) {
            $query->byGradeLevel($filters['grade_level']);
        }

        if (isset($filters['character_topic'])) {
            $query->byCharacterTopic($filters['character_topic']);
        }

        if (isset($filters['min_duration']) || isset($filters['max_duration'])) {
            $query->byDuration($filters['min_duration'] ?? null, $filters['max_duration'] ?? null);
        }

        if (isset($filters['min_capacity']) || isset($filters['max_capacity'])) {
            $query->byCapacity($filters['min_capacity'] ?? null, $filters['max_capacity'] ?? null);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'LIKE', "%{$filters['search']}%")
                  ->orWhere('description', 'LIKE', "%{$filters['search']}%");
            });
        }

        return $query->orderBy('title')->paginate($filters['per_page'] ?? 20);
    }

    public function createProgram(array $data): SparkProgram
    {
        return DB::transaction(function () use ($data) {
            return SparkProgram::create($data);
        });
    }

    public function getProgramById(int $id): ?SparkProgram
    {
        return SparkProgram::with(['characterTopics', 'bookings', 'availability'])->find($id);
    }

    public function updateProgram(SparkProgram $program, array $data): SparkProgram
    {
        return DB::transaction(function () use ($program, $data) {
            $program->update($data);
            return $program->fresh(['characterTopics', 'bookings']);
        });
    }

    public function deleteProgram(SparkProgram $program): bool
    {
        if ($program->bookings()->whereIn('status', ['confirmed', 'pending'])->exists()) {
            throw new \Exception('Cannot delete program with active bookings');
        }

        return $program->delete();
    }

    public function uploadResourceFiles(SparkProgram $program, array $files): SparkProgram
    {
        $resourceFiles = $program->resource_files ?? [];

        foreach ($files as $file) {
            $uploadResult = $this->fileUploadService->uploadDocument($file, 'spark/programs');
            $resourceFiles[] = [
                'name' => $uploadResult['original_name'],
                'url' => $uploadResult['url'],
                'size' => $uploadResult['size'],
                'type' => $uploadResult['mime_type'],
                'uploaded_at' => now()->toISOString(),
            ];
        }

        $program->update(['resource_files' => $resourceFiles]);

        return $program->fresh();
    }

    public function getProgramAvailability(
        int $programId,
        ?string $startDate = null,
        ?string $endDate = null,
        int $perPage = 30
    ): LengthAwarePaginator {
        $query = ProgramAvailability::with(['program'])
            ->where('program_id', $programId)
            ->upcoming();

        if ($startDate && $endDate) {
            $query->byDateRange($startDate, $endDate);
        } elseif ($startDate) {
            $query->where('date', '>=', $startDate);
        } elseif ($endDate) {
            $query->where('date', '<=', $endDate);
        }

        return $query->orderBy('date')->orderBy('start_time')->paginate($perPage);
    }

    public function setProgramAvailability(int $programId, array $availabilityData): array
    {
        $program = SparkProgram::findOrFail($programId);

        return DB::transaction(function () use ($program, $availabilityData) {
            $created = [];

            foreach ($availabilityData as $slot) {
                $availability = ProgramAvailability::updateOrCreate(
                    [
                        'program_id' => $program->id,
                        'date' => $slot['date'],
                        'start_time' => $slot['date'] . ' ' . $slot['start_time'],
                    ],
                    [
                        'end_time' => $slot['date'] . ' ' . $slot['end_time'],
                        'max_bookings' => $slot['max_bookings'],
                        'current_bookings' => 0,
                        'is_available' => true,
                        'notes' => $slot['notes'] ?? null,
                    ]
                );

                $created[] = $availability;
            }

            return [
                'created_count' => count($created),
                'availability_slots' => $created,
            ];
        });
    }
}
