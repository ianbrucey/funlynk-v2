<?php

namespace App\Services\{MODULE};

use App\Models\{MODULE}\{MODEL};
use App\Repositories\{MODULE}\{MODEL}Repository;
use App\Services\Shared\FileUploadService;
use App\Services\Shared\NotificationService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

/**
 * {MODEL} Service
 * 
 * Handles business logic for {MODEL} operations in the {MODULE} module.
 * Coordinates between controllers, repositories, and other services.
 * 
 * @package App\Services\{MODULE}
 */
class {MODEL}Service
{
    /**
     * The {MODEL} repository instance.
     */
    private {MODEL}Repository ${modelVariable}Repository;

    /**
     * The file upload service instance.
     */
    private FileUploadService $fileUploadService;

    /**
     * The notification service instance.
     */
    private NotificationService $notificationService;

    /**
     * Create a new service instance.
     */
    public function __construct(
        {MODEL}Repository ${modelVariable}Repository,
        FileUploadService $fileUploadService,
        NotificationService $notificationService
    ) {
        $this->{modelVariable}Repository = ${modelVariable}Repository;
        $this->fileUploadService = $fileUploadService;
        $this->notificationService = $notificationService;
    }

    /**
     * Get paginated {modelVariable}s with optional filters.
     * 
     * @param int $perPage
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        try {
            // Build cache key
            $cacheKey = $this->buildCacheKey('paginated', $perPage, $filters);
            
            // Try to get from cache first
            return Cache::remember($cacheKey, 300, function () use ($perPage, $filters) {
                return $this->{modelVariable}Repository->getPaginated($perPage, $filters);
            });

        } catch (\Exception $e) {
            Log::error('Failed to get paginated {modelVariable}s', [
                'error' => $e->getMessage(),
                'filters' => $filters,
                'per_page' => $perPage,
            ]);
            
            throw new \Exception('Failed to retrieve {modelVariable}s');
        }
    }

    /**
     * Create a new {modelVariable}.
     * 
     * @param array $data
     * @return {MODEL}
     */
    public function create(array $data): {MODEL}
    {
        try {
            DB::beginTransaction();

            // Validate and prepare data
            $data = $this->prepareDataForCreation($data);

            // Handle file uploads if present
            if (isset($data['image'])) {
                $data['image_url'] = $this->fileUploadService->upload(
                    $data['image'],
                    '{module}/{modelVariable}s/images'
                );
                unset($data['image']);
            }

            // Create the {modelVariable}
            ${modelVariable} = $this->{modelVariable}Repository->create($data);

            // Handle relationships
            $this->handleRelationships(${modelVariable}, $data);

            // Clear relevant caches
            $this->clearCaches();

            // Send notifications if needed
            $this->sendCreationNotifications(${modelVariable});

            DB::commit();

            Log::info('{MODEL} created successfully', [
                '{modelVariable}_id' => ${modelVariable}->id,
                'user_id' => auth()->id(),
            ]);

            return ${modelVariable};

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to create {modelVariable}', [
                'error' => $e->getMessage(),
                'data' => $data,
                'user_id' => auth()->id(),
            ]);
            
            throw new \Exception('Failed to create {modelVariable}: ' . $e->getMessage());
        }
    }

    /**
     * Update an existing {modelVariable}.
     * 
     * @param {MODEL} ${modelVariable}
     * @param array $data
     * @return {MODEL}
     */
    public function update({MODEL} ${modelVariable}, array $data): {MODEL}
    {
        try {
            DB::beginTransaction();

            // Store original data for comparison
            $originalData = ${modelVariable}->toArray();

            // Validate and prepare data
            $data = $this->prepareDataForUpdate($data, ${modelVariable});

            // Handle file uploads if present
            if (isset($data['image'])) {
                // Delete old image if exists
                if (${modelVariable}->image_url) {
                    $this->fileUploadService->delete(${modelVariable}->image_url);
                }
                
                $data['image_url'] = $this->fileUploadService->upload(
                    $data['image'],
                    '{module}/{modelVariable}s/images'
                );
                unset($data['image']);
            }

            // Update the {modelVariable}
            ${modelVariable} = $this->{modelVariable}Repository->update(${modelVariable}, $data);

            // Handle relationships
            $this->handleRelationships(${modelVariable}, $data);

            // Clear relevant caches
            $this->clearCaches();

            // Send notifications if needed
            $this->sendUpdateNotifications(${modelVariable}, $originalData);

            DB::commit();

            Log::info('{MODEL} updated successfully', [
                '{modelVariable}_id' => ${modelVariable}->id,
                'user_id' => auth()->id(),
                'changes' => ${modelVariable}->getChanges(),
            ]);

            return ${modelVariable};

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to update {modelVariable}', [
                'error' => $e->getMessage(),
                '{modelVariable}_id' => ${modelVariable}->id,
                'data' => $data,
                'user_id' => auth()->id(),
            ]);
            
            throw new \Exception('Failed to update {modelVariable}: ' . $e->getMessage());
        }
    }

    /**
     * Delete a {modelVariable}.
     * 
     * @param {MODEL} ${modelVariable}
     * @return bool
     */
    public function delete({MODEL} ${modelVariable}): bool
    {
        try {
            DB::beginTransaction();

            // Check if {modelVariable} can be deleted
            $this->validateDeletion(${modelVariable});

            // Delete associated files
            if (${modelVariable}->image_url) {
                $this->fileUploadService->delete(${modelVariable}->image_url);
            }

            // Handle cascade deletions or updates
            $this->handleCascadeDeletion(${modelVariable});

            // Delete the {modelVariable}
            $result = $this->{modelVariable}Repository->delete(${modelVariable});

            // Clear relevant caches
            $this->clearCaches();

            // Send notifications if needed
            $this->sendDeletionNotifications(${modelVariable});

            DB::commit();

            Log::info('{MODEL} deleted successfully', [
                '{modelVariable}_id' => ${modelVariable}->id,
                'user_id' => auth()->id(),
            ]);

            return $result;

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to delete {modelVariable}', [
                'error' => $e->getMessage(),
                '{modelVariable}_id' => ${modelVariable}->id,
                'user_id' => auth()->id(),
            ]);
            
            throw new \Exception('Failed to delete {modelVariable}: ' . $e->getMessage());
        }
    }

    /**
     * Restore a soft-deleted {modelVariable}.
     * 
     * @param int $id
     * @return {MODEL}
     */
    public function restore(int $id): {MODEL}
    {
        try {
            ${modelVariable} = $this->{modelVariable}Repository->findTrashed($id);
            
            if (!${modelVariable}) {
                throw new \Exception('{MODEL} not found in trash');
            }

            ${modelVariable}->restore();

            // Clear relevant caches
            $this->clearCaches();

            Log::info('{MODEL} restored successfully', [
                '{modelVariable}_id' => ${modelVariable}->id,
                'user_id' => auth()->id(),
            ]);

            return ${modelVariable};

        } catch (\Exception $e) {
            Log::error('Failed to restore {modelVariable}', [
                'error' => $e->getMessage(),
                '{modelVariable}_id' => $id,
                'user_id' => auth()->id(),
            ]);
            
            throw new \Exception('Failed to restore {modelVariable}: ' . $e->getMessage());
        }
    }

    /**
     * Get trashed {modelVariable}s.
     * 
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getTrashed(int $perPage = 15): LengthAwarePaginator
    {
        return $this->{modelVariable}Repository->getTrashed($perPage);
    }

    /**
     * Perform bulk operations on multiple {modelVariable}s.
     * 
     * @param string $action
     * @param array $ids
     * @param array $data
     * @return array
     */
    public function bulkOperation(string $action, array $ids, array $data = []): array
    {
        try {
            DB::beginTransaction();

            $affectedCount = 0;
            $failedCount = 0;
            $errors = [];

            foreach ($ids as $id) {
                try {
                    switch ($action) {
                        case 'delete':
                            ${modelVariable} = $this->{modelVariable}Repository->find($id);
                            if (${modelVariable}) {
                                $this->delete(${modelVariable});
                                $affectedCount++;
                            }
                            break;

                        case 'restore':
                            ${modelVariable} = $this->restore($id);
                            if (${modelVariable}) {
                                $affectedCount++;
                            }
                            break;

                        case 'update':
                            ${modelVariable} = $this->{modelVariable}Repository->find($id);
                            if (${modelVariable}) {
                                $this->update(${modelVariable}, $data);
                                $affectedCount++;
                            }
                            break;
                    }
                } catch (\Exception $e) {
                    $failedCount++;
                    $errors[] = "ID {$id}: " . $e->getMessage();
                }
            }

            // Clear relevant caches
            $this->clearCaches();

            DB::commit();

            Log::info('Bulk operation completed', [
                'action' => $action,
                'affected_count' => $affectedCount,
                'failed_count' => $failedCount,
                'user_id' => auth()->id(),
            ]);

            return [
                'affected_count' => $affectedCount,
                'failed_count' => $failedCount,
                'errors' => $errors,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Bulk operation failed', [
                'error' => $e->getMessage(),
                'action' => $action,
                'ids' => $ids,
                'user_id' => auth()->id(),
            ]);
            
            throw new \Exception('Bulk operation failed: ' . $e->getMessage());
        }
    }

    /**
     * Search {modelVariable}s with advanced filters.
     * 
     * @param array $criteria
     * @return Collection
     */
    public function search(array $criteria): Collection
    {
        $cacheKey = $this->buildCacheKey('search', 0, $criteria);
        
        return Cache::remember($cacheKey, 300, function () use ($criteria) {
            return $this->{modelVariable}Repository->search($criteria);
        });
    }

    /**
     * Get {modelVariable} statistics.
     * 
     * @param array $filters
     * @return array
     */
    public function getStatistics(array $filters = []): array
    {
        $cacheKey = $this->buildCacheKey('statistics', 0, $filters);
        
        return Cache::remember($cacheKey, 3600, function () use ($filters) {
            return $this->{modelVariable}Repository->getStatistics($filters);
        });
    }

    // ========================================
    // PRIVATE HELPER METHODS
    // ========================================

    /**
     * Prepare data for creation.
     * 
     * @param array $data
     * @return array
     */
    private function prepareDataForCreation(array $data): array
    {
        // Add default values
        $data['created_by'] = auth()->id();
        $data['status'] = $data['status'] ?? 'active';

        // Sanitize and validate data
        if (isset($data['name'])) {
            $data['name'] = trim($data['name']);
        }

        // Add business logic here
        
        return $data;
    }

    /**
     * Prepare data for update.
     * 
     * @param array $data
     * @param {MODEL} ${modelVariable}
     * @return array
     */
    private function prepareDataForUpdate(array $data, {MODEL} ${modelVariable}): array
    {
        // Add update metadata
        $data['updated_by'] = auth()->id();

        // Sanitize and validate data
        if (isset($data['name'])) {
            $data['name'] = trim($data['name']);
        }

        // Add business logic here
        
        return $data;
    }

    /**
     * Handle relationships for the {modelVariable}.
     * 
     * @param {MODEL} ${modelVariable}
     * @param array $data
     * @return void
     */
    private function handleRelationships({MODEL} ${modelVariable}, array $data): void
    {
        // Handle many-to-many relationships
        if (isset($data['tags'])) {
            ${modelVariable}->tags()->sync($data['tags']);
        }

        // Handle other relationships as needed
    }

    /**
     * Validate if {modelVariable} can be deleted.
     * 
     * @param {MODEL} ${modelVariable}
     * @return void
     * @throws \Exception
     */
    private function validateDeletion({MODEL} ${modelVariable}): void
    {
        // Add validation logic here
        // Example: Check if {modelVariable} has dependent records
        
        // if (${modelVariable}->relatedItems()->exists()) {
        //     throw new \Exception('Cannot delete {modelVariable} with related items');
        // }
    }

    /**
     * Handle cascade deletion logic.
     * 
     * @param {MODEL} ${modelVariable}
     * @return void
     */
    private function handleCascadeDeletion({MODEL} ${modelVariable}): void
    {
        // Handle dependent records
        // Example: Delete or update related records
        
        // ${modelVariable}->relatedItems()->delete();
    }

    /**
     * Send notifications for {modelVariable} creation.
     * 
     * @param {MODEL} ${modelVariable}
     * @return void
     */
    private function sendCreationNotifications({MODEL} ${modelVariable}): void
    {
        // Send notifications as needed
        // $this->notificationService->send(...);
    }

    /**
     * Send notifications for {modelVariable} update.
     * 
     * @param {MODEL} ${modelVariable}
     * @param array $originalData
     * @return void
     */
    private function sendUpdateNotifications({MODEL} ${modelVariable}, array $originalData): void
    {
        // Send notifications for significant changes
        // $this->notificationService->send(...);
    }

    /**
     * Send notifications for {modelVariable} deletion.
     * 
     * @param {MODEL} ${modelVariable}
     * @return void
     */
    private function sendDeletionNotifications({MODEL} ${modelVariable}): void
    {
        // Send notifications as needed
        // $this->notificationService->send(...);
    }

    /**
     * Build cache key for caching operations.
     * 
     * @param string $operation
     * @param int $perPage
     * @param array $params
     * @return string
     */
    private function buildCacheKey(string $operation, int $perPage, array $params): string
    {
        $key = '{module}_{modelVariable}s_' . $operation;
        
        if ($perPage > 0) {
            $key .= '_' . $perPage;
        }
        
        if (!empty($params)) {
            $key .= '_' . md5(serialize($params));
        }
        
        return $key;
    }

    /**
     * Clear relevant caches.
     * 
     * @return void
     */
    private function clearCaches(): void
    {
        Cache::tags(['{module}_{modelVariable}s'])->flush();
    }
}

/*
USAGE INSTRUCTIONS:

1. Replace placeholders:
   - {MODULE}: Core, Spark, or Shared
   - {MODEL}: Model name (e.g., Event, User, Program)
   - {modelVariable}: camelCase model name (e.g., event, user, program)
   - {module}: lowercase module name

2. Customize the prepareDataForCreation and prepareDataForUpdate methods

3. Implement relationship handling in handleRelationships method

4. Add validation logic in validateDeletion method

5. Implement notification logic in the notification methods

6. Add business-specific methods as needed

7. Update cache keys and tags to match your caching strategy

EXAMPLE USAGE:
- EventService in Core module
- ProgramService in Spark module
- UserService in Shared module

COMMON CUSTOMIZATIONS:
- Add email sending logic
- Add file processing logic
- Add external API integrations
- Add complex business rules
- Add audit trail functionality
*/
