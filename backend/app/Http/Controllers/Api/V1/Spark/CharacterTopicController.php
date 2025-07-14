<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\CreateCharacterTopicRequest;
use App\Http\Requests\Spark\UpdateCharacterTopicRequest;
use App\Http\Resources\Spark\CharacterTopicResource;
use App\Services\Spark\CharacterTopicService;
use App\Models\Spark\CharacterTopic;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Character Topic Controller
 * 
 * Handles character topic management for Spark programs
 */
class CharacterTopicController extends BaseApiController
{
    public function __construct(
        private CharacterTopicService $characterTopicService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get paginated list of character topics
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
                'category' => 'string|max:50',
                'active_only' => 'boolean',
            ]);

            $topics = $this->characterTopicService->getCharacterTopics(
                $request->only(['search', 'category', 'active_only']),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($topics, 'Character topics retrieved successfully');
        });
    }

    /**
     * Create a new character topic
     *
     * @param CreateCharacterTopicRequest $request
     * @return JsonResponse
     */
    public function store(CreateCharacterTopicRequest $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $topic = $this->characterTopicService->createCharacterTopic($request->validated());
            
            return $this->createdResponse(
                new CharacterTopicResource($topic),
                'Character topic created successfully'
            );
        });
    }

    /**
     * Get a specific character topic
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $topic = CharacterTopic::with(['programs'])->findOrFail($id);
            
            return $this->successResponse(
                new CharacterTopicResource($topic),
                'Character topic retrieved successfully'
            );
        });
    }

    /**
     * Update a character topic
     *
     * @param UpdateCharacterTopicRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateCharacterTopicRequest $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $topic = CharacterTopic::findOrFail($id);
            $topic = $this->characterTopicService->updateCharacterTopic($topic, $request->validated());
            
            return $this->updatedResponse(
                new CharacterTopicResource($topic),
                'Character topic updated successfully'
            );
        });
    }

    /**
     * Delete a character topic
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $topic = CharacterTopic::findOrFail($id);
            
            if ($topic->programs()->count() > 0) {
                return $this->errorResponse(
                    'Cannot delete character topic that is used by programs',
                    400
                );
            }
            
            $this->characterTopicService->deleteCharacterTopic($topic);
            
            return $this->deletedResponse('Character topic deleted successfully');
        });
    }

    /**
     * Get character topic categories
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function categories(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () {
            $categories = CharacterTopic::getCategories();
            
            return $this->successResponse(
                $categories,
                'Character topic categories retrieved successfully'
            );
        });
    }

    /**
     * Get programs using a character topic
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function programs(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $topic = CharacterTopic::findOrFail($id);
            
            $request->validate([
                'per_page' => 'integer|min:1|max:50',
                'active_only' => 'boolean',
            ]);

            $programs = $this->characterTopicService->getTopicPrograms(
                $topic,
                $request->boolean('active_only', false),
                $request->input('per_page', 15)
            );

            return $this->paginatedResponse($programs, 'Programs using character topic retrieved successfully');
        });
    }

    /**
     * Activate a character topic
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function activate(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $topic = CharacterTopic::findOrFail($id);
            $topic->is_active = true;
            $topic->save();
            
            return $this->successResponse(
                ['is_active' => true],
                'Character topic activated successfully'
            );
        });
    }

    /**
     * Deactivate a character topic
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function deactivate(Request $request, int $id): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($id) {
            $topic = CharacterTopic::findOrFail($id);
            $topic->is_active = false;
            $topic->save();
            
            return $this->successResponse(
                ['is_active' => false],
                'Character topic deactivated successfully'
            );
        });
    }
}
