<?php

namespace App\Services\Spark;

use App\Models\Spark\Program;
use App\Models\Spark\ProgramAvailability;
use App\Models\Spark\CharacterTopic;
use App\Models\Spark\Booking;
use App\Services\Shared\FileUploadService;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Illuminate\Http\UploadedFile;
use Carbon\Carbon;
use Exception;

/**
 * Program Service
 * 
 * Handles program management business logic including CRUD, file uploads, availability, and statistics
 */
class ProgramService
{
    public function __construct(
        private FileUploadService $fileUploadService,
        private LoggingService $loggingService,
        private NotificationService $notificationService
    ) {}

    /**
     * Get paginated programs with filters
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator<Program>
     */
    public function getPrograms(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Program::query()
            ->with(['availability', 'bookings', 'characterTopics']);

        // Apply filters
        if (isset($filters['search']) && !empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (isset($filters['grade_level']) && !empty($filters['grade_level'])) {
            $query->byGradeLevel($filters['grade_level']);
        }

        if (isset($filters['character_topic']) && !empty($filters['character_topic'])) {
            $query->byCharacterTopic($filters['character_topic']);
        }

        if (isset($filters['min_duration']) && isset($filters['max_duration'])) {
            $query->byDuration($filters['min_duration'], $filters['max_duration']);
        }

        if (isset($filters['min_price']) && isset($filters['max_price'])) {
            $query->byPriceRange($filters['min_price'], $filters['max_price']);
        }

        if (isset($filters['active_only']) && $filters['active_only']) {
            $query->active();
        }

        return $query->orderBy('title')->paginate($perPage);
    }

    /**
     * Create a new program
     *
     * @param array<string, mixed> $data
     * @return Program
     * @throws Exception
     */
    public function createProgram(array $data): Program
    {
        try {
            DB::beginTransaction();

            // Handle file uploads
            if (isset($data['resource_files']) && is_array($data['resource_files'])) {
                $data['resource_files'] = $this->handleFileUploads($data['resource_files']);
            }

            // Create the program
            $program = Program::create($data);

            // Handle character topics relationship
            if (isset($data['character_topic_ids']) && is_array($data['character_topic_ids'])) {
                $program->characterTopics()->attach($data['character_topic_ids']);
            }

            // Load relationships
            $program->load(['availability', 'bookings', 'characterTopics']);

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'program_created',
                'Program',
                $program->id,
                ['title' => $program->title]
            );

            DB::commit();
            return $program;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'user_id' => auth()->id(),
                'operation' => 'create_program',
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Update a program
     *
     * @param Program $program
     * @param array<string, mixed> $data
     * @return Program
     * @throws Exception
     */
    public function updateProgram(Program $program, array $data): Program
    {
        try {
            DB::beginTransaction();

            // Handle file uploads
            if (isset($data['resource_files']) && is_array($data['resource_files'])) {
                $data['resource_files'] = $this->handleFileUploads($data['resource_files']);
            }

            // Handle file removal
            if (isset($data['remove_files']) && is_array($data['remove_files'])) {
                $this->removeFiles($program, $data['remove_files']);
                unset($data['remove_files']);
            }

            // Update the program
            $program->update($data);

            // Handle character topics relationship
            if (isset($data['character_topic_ids']) && is_array($data['character_topic_ids'])) {
                $program->characterTopics()->sync($data['character_topic_ids']);
            }

            // Load relationships
            $program->load(['availability', 'bookings', 'characterTopics']);

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'program_updated',
                'Program',
                $program->id,
                ['title' => $program->title, 'changes' => array_keys($data)]
            );

            DB::commit();
            return $program;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'program_id' => $program->id,
                'operation' => 'update_program',
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Delete a program (soft delete)
     *
     * @param Program $program
     * @return bool
     * @throws Exception
     */
    public function deleteProgram(Program $program): bool
    {
        try {
            DB::beginTransaction();

            // Check if program can be deleted
            if (!$program->canBeDeleted()) {
                throw new Exception('Cannot delete program with confirmed or pending bookings');
            }

            // Delete associated files
            if ($program->resource_files) {
                foreach ($program->resource_files as $file) {
                    $this->fileUploadService->deleteFile($file['path']);
                }
            }

            // Notify users with pending bookings
            $pendingBookings = $program->bookings()->whereIn('status', ['pending', 'confirmed'])->with('user')->get();
            foreach ($pendingBookings as $booking) {
                $this->notificationService->createNotification(
                    $booking->user_id,
                    'program_cancelled',
                    'Program Cancelled',
                    "The program '{$program->title}' has been cancelled.",
                    [
                        'program_id' => $program->id,
                        'program_title' => $program->title,
                        'booking_id' => $booking->id,
                    ]
                );
            }

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'program_deleted',
                'Program',
                $program->id,
                ['title' => $program->title]
            );

            // Soft delete the program
            $program->delete();

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'program_id' => $program->id,
                'operation' => 'delete_program'
            ]);
            throw $e;
        }
    }

    /**
     * Get program by ID with relationships
     *
     * @param int $id
     * @param array<string> $relations
     * @return Program
     */
    public function getProgramById(int $id, array $relations = []): Program
    {
        return Program::with($relations)->findOrFail($id);
    }

    /**
     * Search programs
     *
     * @param string $query
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator<Program>
     */
    public function searchPrograms(string $query, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $programQuery = Program::query()
            ->with(['availability', 'bookings', 'characterTopics'])
            ->search($query);

        // Apply additional filters
        if (isset($filters['grade_level']) && !empty($filters['grade_level'])) {
            $programQuery->byGradeLevel($filters['grade_level']);
        }

        if (isset($filters['character_topic']) && !empty($filters['character_topic'])) {
            $programQuery->byCharacterTopic($filters['character_topic']);
        }

        if (isset($filters['min_duration']) && isset($filters['max_duration'])) {
            $programQuery->byDuration($filters['min_duration'], $filters['max_duration']);
        }

        if (isset($filters['min_price']) && isset($filters['max_price'])) {
            $programQuery->byPriceRange($filters['min_price'], $filters['max_price']);
        }

        if (isset($filters['active_only']) && $filters['active_only']) {
            $programQuery->active();
        }

        return $programQuery->orderBy('title')->paginate($perPage);
    }

    /**
     * Get program availability with filters
     *
     * @param Program $program
     * @param string|null $startDate
     * @param string|null $endDate
     * @param int $perPage
     * @return LengthAwarePaginator<ProgramAvailability>
     */
    public function getProgramAvailability(Program $program, ?string $startDate = null, ?string $endDate = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = $program->availability();

        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        } elseif (!$startDate && !$endDate) {
            $query->future();
        }

        return $query->orderBy('date')->orderBy('start_time')->paginate($perPage);
    }

    /**
     * Add availability slot to program
     *
     * @param Program $program
     * @param array<string, mixed> $data
     * @return ProgramAvailability
     * @throws Exception
     */
    public function addProgramAvailability(Program $program, array $data): ProgramAvailability
    {
        try {
            DB::beginTransaction();

            // Create start and end datetime from date and time
            $startDateTime = Carbon::parse($data['date'] . ' ' . $data['start_time']);
            $endDateTime = Carbon::parse($data['date'] . ' ' . $data['end_time']);

            $availability = ProgramAvailability::create([
                'program_id' => $program->id,
                'date' => $data['date'],
                'start_time' => $startDateTime,
                'end_time' => $endDateTime,
                'max_bookings' => $data['max_bookings'],
                'current_bookings' => 0,
                'is_available' => true,
                'notes' => $data['notes'] ?? null,
            ]);

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'program_availability_added',
                'ProgramAvailability',
                $availability->id,
                [
                    'program_id' => $program->id,
                    'program_title' => $program->title,
                    'date' => $data['date'],
                    'time_range' => $availability->time_range,
                ]
            );

            DB::commit();
            return $availability;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'program_id' => $program->id,
                'operation' => 'add_program_availability',
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Update availability slot
     *
     * @param ProgramAvailability $availability
     * @param array<string, mixed> $data
     * @return ProgramAvailability
     * @throws Exception
     */
    public function updateProgramAvailability(ProgramAvailability $availability, array $data): ProgramAvailability
    {
        try {
            DB::beginTransaction();

            // Update start and end datetime if provided
            if (isset($data['date']) && isset($data['start_time'])) {
                $data['start_time'] = Carbon::parse($data['date'] . ' ' . $data['start_time']);
            }

            if (isset($data['date']) && isset($data['end_time'])) {
                $data['end_time'] = Carbon::parse($data['date'] . ' ' . $data['end_time']);
            }

            $availability->update($data);

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'program_availability_updated',
                'ProgramAvailability',
                $availability->id,
                [
                    'program_id' => $availability->program_id,
                    'changes' => array_keys($data),
                ]
            );

            DB::commit();
            return $availability;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'availability_id' => $availability->id,
                'operation' => 'update_program_availability',
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Delete availability slot
     *
     * @param ProgramAvailability $availability
     * @return bool
     * @throws Exception
     */
    public function deleteProgramAvailability(ProgramAvailability $availability): bool
    {
        try {
            DB::beginTransaction();

            // Check if there are bookings for this slot
            $bookingsCount = Booking::where('program_id', $availability->program_id)
                ->where('scheduled_date', $availability->date)
                ->whereIn('status', ['confirmed', 'pending'])
                ->count();

            if ($bookingsCount > 0) {
                throw new Exception('Cannot delete availability slot with confirmed or pending bookings');
            }

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'program_availability_deleted',
                'ProgramAvailability',
                $availability->id,
                [
                    'program_id' => $availability->program_id,
                    'date' => $availability->date,
                    'time_range' => $availability->time_range,
                ]
            );

            $availability->delete();

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'availability_id' => $availability->id,
                'operation' => 'delete_program_availability'
            ]);
            throw $e;
        }
    }

    /**
     * Get program statistics
     *
     * @param Program $program
     * @return array<string, mixed>
     */
    public function getProgramStatistics(Program $program): array
    {
        return [
            'total_bookings' => $program->bookings()->count(),
            'confirmed_bookings' => $program->bookings()->where('status', 'confirmed')->count(),
            'pending_bookings' => $program->bookings()->where('status', 'pending')->count(),
            'cancelled_bookings' => $program->bookings()->where('status', 'cancelled')->count(),
            'total_revenue' => $program->bookings()->where('status', 'confirmed')->sum('total_amount'),
            'average_booking_amount' => $program->bookings()->where('status', 'confirmed')->avg('total_amount'),
            'available_slots' => $program->availability()->available()->future()->count(),
            'total_slots' => $program->availability()->future()->count(),
            'utilization_rate' => $this->calculateUtilizationRate($program),
            'peak_booking_periods' => $this->getPeakBookingPeriods($program),
        ];
    }

    /**
     * Get all programs statistics
     *
     * @return array<string, mixed>
     */
    public function getAllProgramsStatistics(): array
    {
        $totalPrograms = Program::count();
        $activePrograms = Program::active()->count();
        $totalBookings = Booking::count();
        $confirmedBookings = Booking::where('status', 'confirmed')->count();
        $totalRevenue = Booking::where('status', 'confirmed')->sum('total_amount');

        return [
            'total_programs' => $totalPrograms,
            'active_programs' => $activePrograms,
            'inactive_programs' => $totalPrograms - $activePrograms,
            'total_bookings' => $totalBookings,
            'confirmed_bookings' => $confirmedBookings,
            'pending_bookings' => Booking::where('status', 'pending')->count(),
            'cancelled_bookings' => Booking::where('status', 'cancelled')->count(),
            'total_revenue' => $totalRevenue,
            'average_program_revenue' => $activePrograms > 0 ? $totalRevenue / $activePrograms : 0,
            'most_popular_programs' => $this->getMostPopularPrograms(),
            'grade_level_distribution' => $this->getGradeLevelDistribution(),
            'character_topics_usage' => $this->getCharacterTopicsUsage(),
        ];
    }

    /**
     * Activate a program
     *
     * @param Program $program
     * @return bool
     * @throws Exception
     */
    public function activateProgram(Program $program): bool
    {
        try {
            DB::beginTransaction();

            $program->activate();

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'program_activated',
                'Program',
                $program->id,
                ['title' => $program->title]
            );

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'program_id' => $program->id,
                'operation' => 'activate_program'
            ]);
            throw $e;
        }
    }

    /**
     * Deactivate a program
     *
     * @param Program $program
     * @return bool
     * @throws Exception
     */
    public function deactivateProgram(Program $program): bool
    {
        try {
            DB::beginTransaction();

            $program->deactivate();

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'program_deactivated',
                'Program',
                $program->id,
                ['title' => $program->title]
            );

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'program_id' => $program->id,
                'operation' => 'deactivate_program'
            ]);
            throw $e;
        }
    }

    /**
     * Get programs by grade level
     *
     * @param string $gradeLevel
     * @param bool $activeOnly
     * @return Collection<int, Program>
     */
    public function getProgramsByGradeLevel(string $gradeLevel, bool $activeOnly = true): Collection
    {
        $query = Program::byGradeLevel($gradeLevel);

        if ($activeOnly) {
            $query->active();
        }

        return $query->orderBy('title')->get();
    }

    /**
     * Get programs by character topic
     *
     * @param string $characterTopic
     * @param bool $activeOnly
     * @return Collection<int, Program>
     */
    public function getProgramsByCharacterTopic(string $characterTopic, bool $activeOnly = true): Collection
    {
        $query = Program::byCharacterTopic($characterTopic);

        if ($activeOnly) {
            $query->active();
        }

        return $query->orderBy('title')->get();
    }

    /**
     * Check if program is available for booking
     *
     * @param Program $program
     * @return bool
     */
    public function isProgramAvailable(Program $program): bool
    {
        return $program->is_active && $program->availability()->available()->future()->exists();
    }

    /**
     * Get available time slots for a program
     *
     * @param Program $program
     * @param string|null $date
     * @return Collection<int, ProgramAvailability>
     */
    public function getAvailableTimeSlots(Program $program, ?string $date = null): Collection
    {
        $query = $program->availability()->available();

        if ($date) {
            $query->where('date', $date);
        } else {
            $query->future();
        }

        return $query->orderBy('date')->orderBy('start_time')->get();
    }

    /**
     * Handle file uploads for programs
     *
     * @param array<UploadedFile> $files
     * @return array<array<string, mixed>>
     * @throws Exception
     */
    private function handleFileUploads(array $files): array
    {
        $uploadedFiles = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $fileData = $this->fileUploadService->uploadDocument($file, 'program-resources');
                $uploadedFiles[] = $fileData;
            }
        }

        return $uploadedFiles;
    }

    /**
     * Remove files from program
     *
     * @param Program $program
     * @param array<string> $filesToRemove
     * @return void
     */
    private function removeFiles(Program $program, array $filesToRemove): void
    {
        $currentFiles = $program->resource_files ?? [];
        $remainingFiles = [];

        foreach ($currentFiles as $file) {
            if (!in_array($file['path'], $filesToRemove)) {
                $remainingFiles[] = $file;
            } else {
                $this->fileUploadService->deleteFile($file['path']);
            }
        }

        $program->resource_files = $remainingFiles;
        $program->save();
    }

    /**
     * Calculate utilization rate for a program
     *
     * @param Program $program
     * @return float
     */
    private function calculateUtilizationRate(Program $program): float
    {
        $totalSlots = $program->availability()->future()->sum('max_bookings');
        $bookedSlots = $program->availability()->future()->sum('current_bookings');

        return $totalSlots > 0 ? round(($bookedSlots / $totalSlots) * 100, 2) : 0;
    }

    /**
     * Get peak booking periods for a program
     *
     * @param Program $program
     * @return array<string, mixed>
     */
    private function getPeakBookingPeriods(Program $program): array
    {
        $bookingsByMonth = $program->bookings()
            ->where('status', 'confirmed')
            ->selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('count', 'desc')
            ->limit(3)
            ->get()
            ->toArray();

        return $bookingsByMonth;
    }

    /**
     * Get most popular programs
     *
     * @param int $limit
     * @return Collection<int, Program>
     */
    private function getMostPopularPrograms(int $limit = 10): Collection
    {
        return Program::withCount(['bookings' => function ($query) {
            $query->where('status', 'confirmed');
        }])
            ->orderBy('bookings_count', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get grade level distribution
     *
     * @return array<string, mixed>
     */
    private function getGradeLevelDistribution(): array
    {
        $programs = Program::active()->get();
        $gradeLevels = [];

        foreach ($programs as $program) {
            if (is_array($program->grade_levels)) {
                foreach ($program->grade_levels as $gradeLevel) {
                    $gradeLevels[$gradeLevel] = ($gradeLevels[$gradeLevel] ?? 0) + 1;
                }
            }
        }

        return $gradeLevels;
    }

    /**
     * Get character topics usage
     *
     * @return array<string, mixed>
     */
    private function getCharacterTopicsUsage(): array
    {
        $programs = Program::active()->get();
        $topics = [];

        foreach ($programs as $program) {
            if (is_array($program->character_topics)) {
                foreach ($program->character_topics as $topic) {
                    $topics[$topic] = ($topics[$topic] ?? 0) + 1;
                }
            }
        }

        return $topics;
    }

    /**
     * Bulk update programs
     *
     * @param array<int, array<string, mixed>> $updates Array of program_id => data
     * @return bool
     * @throws Exception
     */
    public function bulkUpdatePrograms(array $updates): bool
    {
        try {
            DB::beginTransaction();

            $updatedCount = 0;
            foreach ($updates as $programId => $data) {
                $program = Program::findOrFail($programId);
                $program->update($data);
                $updatedCount++;
            }

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'programs_bulk_updated',
                'Program',
                null,
                ['updated_count' => $updatedCount]
            );

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'operation' => 'bulk_update_programs',
                'updates' => $updates
            ]);
            throw $e;
        }
    }
}
