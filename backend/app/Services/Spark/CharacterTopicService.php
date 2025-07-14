<?php

namespace App\Services\Spark;

use App\Models\Spark\CharacterTopic;
use App\Models\Spark\Program;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Exception;

/**
 * Character Topic Service
 * 
 * Handles character topic management business logic including CRUD, search, and statistics
 */
class CharacterTopicService
{
    public function __construct(
        private LoggingService $loggingService,
        private NotificationService $notificationService
    ) {}

    /**
     * Get paginated character topics with filters
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator<CharacterTopic>
     */
    public function getCharacterTopics(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = CharacterTopic::query()->with(['programs']);

        // Apply filters
        if (isset($filters['search']) && !empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (isset($filters['category']) && !empty($filters['category'])) {
            $query->byCategory($filters['category']);
        }

        if (isset($filters['active_only']) && $filters['active_only']) {
            $query->active();
        }

        return $query->ordered()->paginate($perPage);
    }

    /**
     * Create a new character topic
     *
     * @param array<string, mixed> $data
     * @return CharacterTopic
     * @throws Exception
     */
    public function createCharacterTopic(array $data): CharacterTopic
    {
        try {
            DB::beginTransaction();

            $topic = CharacterTopic::create($data);

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'character_topic_created',
                'CharacterTopic',
                $topic->id,
                ['name' => $topic->name, 'category' => $topic->category]
            );

            DB::commit();
            return $topic;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'user_id' => auth()->id(),
                'operation' => 'create_character_topic',
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Update a character topic
     *
     * @param CharacterTopic $topic
     * @param array<string, mixed> $data
     * @return CharacterTopic
     * @throws Exception
     */
    public function updateCharacterTopic(CharacterTopic $topic, array $data): CharacterTopic
    {
        try {
            DB::beginTransaction();

            $originalData = $topic->toArray();
            $topic->update($data);

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'character_topic_updated',
                'CharacterTopic',
                $topic->id,
                [
                    'name' => $topic->name,
                    'changes' => array_keys($data),
                    'original' => $originalData,
                    'updated' => $topic->toArray()
                ]
            );

            DB::commit();
            return $topic;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'topic_id' => $topic->id,
                'operation' => 'update_character_topic',
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Delete a character topic (soft delete)
     *
     * @param CharacterTopic $topic
     * @return bool
     * @throws Exception
     */
    public function deleteCharacterTopic(CharacterTopic $topic): bool
    {
        try {
            DB::beginTransaction();

            // Check if topic is being used by programs
            $programsCount = $topic->programs()->count();
            if ($programsCount > 0) {
                throw new Exception("Cannot delete character topic that is used by {$programsCount} programs");
            }

            // Log the activity before deletion
            $this->loggingService->logUserActivity(
                auth()->id(),
                'character_topic_deleted',
                'CharacterTopic',
                $topic->id,
                ['name' => $topic->name, 'category' => $topic->category]
            );

            $topic->delete();

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'topic_id' => $topic->id,
                'operation' => 'delete_character_topic'
            ]);
            throw $e;
        }
    }

    /**
     * Get character topic by ID with relationships
     *
     * @param int $id
     * @param array<string> $relations
     * @return CharacterTopic
     */
    public function getCharacterTopicById(int $id, array $relations = []): CharacterTopic
    {
        return CharacterTopic::with($relations)->findOrFail($id);
    }

    /**
     * Get character topic by slug
     *
     * @param string $slug
     * @param array<string> $relations
     * @return CharacterTopic
     */
    public function getCharacterTopicBySlug(string $slug, array $relations = []): CharacterTopic
    {
        return CharacterTopic::with($relations)->where('slug', $slug)->firstOrFail();
    }

    /**
     * Search character topics
     *
     * @param string $query
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator<CharacterTopic>
     */
    public function searchCharacterTopics(string $query, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $queryBuilder = CharacterTopic::query()
            ->with(['programs'])
            ->search($query);

        // Apply additional filters
        if (isset($filters['category']) && !empty($filters['category'])) {
            $queryBuilder->byCategory($filters['category']);
        }

        if (isset($filters['active_only']) && $filters['active_only']) {
            $queryBuilder->active();
        }

        return $queryBuilder->ordered()->paginate($perPage);
    }

    /**
     * Get programs using a character topic
     *
     * @param CharacterTopic $topic
     * @param bool $activeOnly
     * @param int $perPage
     * @return LengthAwarePaginator<Program>
     */
    public function getTopicPrograms(CharacterTopic $topic, bool $activeOnly = false, int $perPage = 15): LengthAwarePaginator
    {
        $query = $topic->programs()->with(['availability', 'bookings']);

        if ($activeOnly) {
            $query->active();
        }

        return $query->orderBy('title')->paginate($perPage);
    }

    /**
     * Get character topic statistics
     *
     * @param CharacterTopic $topic
     * @return array<string, mixed>
     */
    public function getTopicStatistics(CharacterTopic $topic): array
    {
        return [
            'programs_count' => $topic->programs()->count(),
            'active_programs_count' => $topic->programs()->active()->count(),
            'total_bookings' => $topic->programs()->withCount('bookings')->get()->sum('bookings_count'),
            'total_revenue' => $topic->programs()
                ->join('spark_bookings', 'spark_programs.id', '=', 'spark_bookings.program_id')
                ->where('spark_bookings.status', 'confirmed')
                ->sum('spark_bookings.total_amount'),
        ];
    }

    /**
     * Get all character topic statistics
     *
     * @return array<string, mixed>
     */
    public function getAllTopicsStatistics(): array
    {
        $totalTopics = CharacterTopic::count();
        $activeTopics = CharacterTopic::active()->count();
        $categoriesWithCounts = CharacterTopic::select('category')
            ->selectRaw('count(*) as count')
            ->groupBy('category')
            ->get()
            ->pluck('count', 'category')
            ->toArray();

        return [
            'total_topics' => $totalTopics,
            'active_topics' => $activeTopics,
            'inactive_topics' => $totalTopics - $activeTopics,
            'categories' => $categoriesWithCounts,
            'most_used_topics' => $this->getMostUsedTopics(),
        ];
    }

    /**
     * Get most used character topics
     *
     * @param int $limit
     * @return Collection<int, CharacterTopic>
     */
    public function getMostUsedTopics(int $limit = 10): Collection
    {
        return CharacterTopic::withCount('programs')
            ->orderBy('programs_count', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get character topics by category
     *
     * @param string $category
     * @param bool $activeOnly
     * @return Collection<int, CharacterTopic>
     */
    public function getTopicsByCategory(string $category, bool $activeOnly = true): Collection
    {
        $query = CharacterTopic::byCategory($category);

        if ($activeOnly) {
            $query->active();
        }

        return $query->ordered()->get();
    }

    /**
     * Check if character topic is available for use
     *
     * @param CharacterTopic $topic
     * @return bool
     */
    public function isTopicAvailable(CharacterTopic $topic): bool
    {
        return $topic->is_active;
    }

    /**
     * Activate a character topic
     *
     * @param CharacterTopic $topic
     * @return bool
     * @throws Exception
     */
    public function activateCharacterTopic(CharacterTopic $topic): bool
    {
        try {
            DB::beginTransaction();

            $topic->is_active = true;
            $topic->save();

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'character_topic_activated',
                'CharacterTopic',
                $topic->id,
                ['name' => $topic->name]
            );

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'topic_id' => $topic->id,
                'operation' => 'activate_character_topic'
            ]);
            throw $e;
        }
    }

    /**
     * Deactivate a character topic
     *
     * @param CharacterTopic $topic
     * @return bool
     * @throws Exception
     */
    public function deactivateCharacterTopic(CharacterTopic $topic): bool
    {
        try {
            DB::beginTransaction();

            $topic->is_active = false;
            $topic->save();

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'character_topic_deactivated',
                'CharacterTopic',
                $topic->id,
                ['name' => $topic->name]
            );

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'topic_id' => $topic->id,
                'operation' => 'deactivate_character_topic'
            ]);
            throw $e;
        }
    }

    /**
     * Reorder character topics
     *
     * @param array<int, int> $topicOrder Array of topic_id => sort_order
     * @return bool
     * @throws Exception
     */
    public function reorderTopics(array $topicOrder): bool
    {
        try {
            DB::beginTransaction();

            foreach ($topicOrder as $topicId => $sortOrder) {
                CharacterTopic::where('id', $topicId)
                    ->update(['sort_order' => $sortOrder]);
            }

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'character_topics_reordered',
                'CharacterTopic',
                null,
                ['reordered_topics' => count($topicOrder)]
            );

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'operation' => 'reorder_character_topics',
                'topic_order' => $topicOrder
            ]);
            throw $e;
        }
    }

    /**
     * Bulk update character topics
     *
     * @param array<int, array<string, mixed>> $updates Array of topic_id => data
     * @return bool
     * @throws Exception
     */
    public function bulkUpdateTopics(array $updates): bool
    {
        try {
            DB::beginTransaction();

            $updatedCount = 0;
            foreach ($updates as $topicId => $data) {
                $topic = CharacterTopic::findOrFail($topicId);
                $topic->update($data);
                $updatedCount++;
            }

            // Log the activity
            $this->loggingService->logUserActivity(
                auth()->id(),
                'character_topics_bulk_updated',
                'CharacterTopic',
                null,
                ['updated_count' => $updatedCount]
            );

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggingService->logError($e, [
                'operation' => 'bulk_update_character_topics',
                'updates' => $updates
            ]);
            throw $e;
        }
    }

    /**
     * Get character topic usage analytics
     *
     * @param CharacterTopic $topic
     * @return array<string, mixed>
     */
    public function getTopicUsageAnalytics(CharacterTopic $topic): array
    {
        $programs = $topic->programs()->with(['bookings'])->get();
        $totalBookings = $programs->sum(fn($program) => $program->bookings->count());
        $totalRevenue = $programs->sum(fn($program) => 
            $program->bookings->where('status', 'confirmed')->sum('total_amount')
        );

        return [
            'programs_using_topic' => $programs->count(),
            'total_bookings' => $totalBookings,
            'total_revenue' => $totalRevenue,
            'average_bookings_per_program' => $programs->count() > 0 ? 
                round($totalBookings / $programs->count(), 2) : 0,
            'most_booked_program' => $programs->sortByDesc(fn($program) => 
                $program->bookings->count())->first()?->title,
            'program_breakdown' => $programs->map(fn($program) => [
                'program_id' => $program->id,
                'program_title' => $program->title,
                'bookings_count' => $program->bookings->count(),
                'revenue' => $program->bookings->where('status', 'confirmed')->sum('total_amount'),
            ])->toArray(),
        ];
    }

    /**
     * Find or create character topic by name
     *
     * @param string $name
     * @param string $category
     * @return CharacterTopic
     */
    public function findOrCreateByName(string $name, string $category = 'general'): CharacterTopic
    {
        return CharacterTopic::findOrCreateByName($name, $category);
    }

    /**
     * Get available categories with counts
     *
     * @return array<string, mixed>
     */
    public function getCategoriesWithCounts(): array
    {
        $categoryCounts = CharacterTopic::select('category')
            ->selectRaw('count(*) as count')
            ->groupBy('category')
            ->get()
            ->pluck('count', 'category')
            ->toArray();

        $allCategories = CharacterTopic::getCategories();
        
        return collect($allCategories)->map(fn($display, $key) => [
            'key' => $key,
            'display' => $display,
            'count' => $categoryCounts[$key] ?? 0,
        ])->toArray();
    }
}
