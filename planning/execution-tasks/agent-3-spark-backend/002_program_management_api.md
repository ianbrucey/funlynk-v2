# Task 002: Program Management API
**Agent**: Spark Backend Developer  
**Estimated Time**: 7-8 hours  
**Priority**: High  
**Dependencies**: Task 001 (School Management API)  

## Overview
Implement comprehensive Spark program management API including CRUD operations, character topics, grade level associations, availability slots, and resource file management.

## Prerequisites
- Task 001 completed successfully
- School management API working
- File upload service available
- Database schema with spark_programs tables

## Step-by-Step Implementation

### Step 1: Create Program Models (90 minutes)

**Create SparkProgram model (app/Models/Spark/SparkProgram.php):**
```php
<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SparkProgram extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'grade_levels',
        'duration_minutes',
        'max_students',
        'price_per_student',
        'character_topics',
        'learning_objectives',
        'materials_needed',
        'resource_files',
        'special_requirements',
        'is_active',
    ];

    protected $casts = [
        'grade_levels' => 'array',
        'duration_minutes' => 'integer',
        'max_students' => 'integer',
        'price_per_student' => 'decimal:2',
        'character_topics' => 'array',
        'learning_objectives' => 'array',
        'materials_needed' => 'array',
        'resource_files' => 'array',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'program_id');
    }

    public function availability(): HasMany
    {
        return $this->hasMany(ProgramAvailability::class, 'program_id');
    }

    public function characterTopics(): BelongsToMany
    {
        return $this->belongsToMany(CharacterTopic::class, 'program_character_topics');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByGradeLevel($query, string $gradeLevel)
    {
        return $query->whereJsonContains('grade_levels', $gradeLevel);
    }

    public function scopeByDuration($query, int $minDuration = null, int $maxDuration = null)
    {
        if ($minDuration) {
            $query->where('duration_minutes', '>=', $minDuration);
        }
        if ($maxDuration) {
            $query->where('duration_minutes', '<=', $maxDuration);
        }
        return $query;
    }

    public function scopeByCapacity($query, int $minCapacity = null, int $maxCapacity = null)
    {
        if ($minCapacity) {
            $query->where('max_students', '>=', $minCapacity);
        }
        if ($maxCapacity) {
            $query->where('max_students', '<=', $maxCapacity);
        }
        return $query;
    }

    public function scopeByCharacterTopic($query, string $topic)
    {
        return $query->whereJsonContains('character_topics', $topic);
    }

    // Accessors
    public function getGradeLevelsDisplayAttribute(): string
    {
        return implode(', ', $this->grade_levels ?? []);
    }

    public function getDurationDisplayAttribute(): string
    {
        $hours = floor($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;
        
        if ($hours > 0) {
            return $minutes > 0 ? "{$hours}h {$minutes}m" : "{$hours}h";
        }
        return "{$minutes}m";
    }

    public function getCharacterTopicsDisplayAttribute(): string
    {
        return implode(', ', $this->character_topics ?? []);
    }

    public function getTotalBookingsAttribute(): int
    {
        return $this->bookings()->count();
    }

    public function getCompletedBookingsAttribute(): int
    {
        return $this->bookings()->where('status', 'completed')->count();
    }

    public function getAverageRatingAttribute(): ?float
    {
        return $this->bookings()
            ->whereNotNull('rating')
            ->avg('rating');
    }
}
```

**Create CharacterTopic model (app/Models/Spark/CharacterTopic.php):**
```php
<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CharacterTopic extends Model
{
    protected $fillable = [
        'name',
        'description',
        'category',
        'age_group',
        'learning_outcomes',
        'is_active',
    ];

    protected $casts = [
        'learning_outcomes' => 'array',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function programs(): BelongsToMany
    {
        return $this->belongsToMany(SparkProgram::class, 'program_character_topics');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByAgeGroup($query, string $ageGroup)
    {
        return $query->where('age_group', $ageGroup);
    }

    // Accessors
    public function getProgramCountAttribute(): int
    {
        return $this->programs()->count();
    }
}
```

**Create ProgramAvailability model (app/Models/Spark/ProgramAvailability.php):**
```php
<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramAvailability extends Model
{
    protected $fillable = [
        'program_id',
        'date',
        'start_time',
        'end_time',
        'max_bookings',
        'current_bookings',
        'is_available',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'max_bookings' => 'integer',
        'current_bookings' => 'integer',
        'is_available' => 'boolean',
    ];

    // Relationships
    public function program(): BelongsTo
    {
        return $this->belongsTo(SparkProgram::class, 'program_id');
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)
                    ->where('current_bookings', '<', 'max_bookings');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('date', '>=', now()->toDateString());
    }

    public function scopeByDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    // Accessors
    public function getAvailableSlotsAttribute(): int
    {
        return max(0, $this->max_bookings - $this->current_bookings);
    }

    public function getIsFullAttribute(): bool
    {
        return $this->current_bookings >= $this->max_bookings;
    }

    // Methods
    public function incrementBookings(): bool
    {
        if ($this->is_full) {
            return false;
        }

        $this->increment('current_bookings');
        return true;
    }

    public function decrementBookings(): bool
    {
        if ($this->current_bookings <= 0) {
            return false;
        }

        $this->decrement('current_bookings');
        return true;
    }
}
```

### Step 2: Create Program Controllers (120 minutes)

**Create SparkProgramController (app/Http/Controllers/Api/V1/Spark/SparkProgramController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\CreateProgramRequest;
use App\Http\Requests\Spark\UpdateProgramRequest;
use App\Http\Resources\Spark\SparkProgramResource;
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
    }

    /**
     * Create new program
     */
    public function store(CreateProgramRequest $request): JsonResponse
    {
        $this->authorize('create', SparkProgram::class);

        try {
            $program = $this->programService->createProgram($request->validated());

            return $this->successResponse(
                new SparkProgramResource($program),
                'Program created successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create program', 500);
        }
    }

    /**
     * Get program by ID
     */
    public function show(int $id): JsonResponse
    {
        $program = $this->programService->getProgramById($id);

        if (!$program) {
            return $this->notFoundResponse('Program not found');
        }

        return $this->successResponse(
            new SparkProgramResource($program),
            'Program retrieved successfully'
        );
    }

    /**
     * Update program
     */
    public function update(UpdateProgramRequest $request, int $id): JsonResponse
    {
        $program = $this->programService->getProgramById($id);

        if (!$program) {
            return $this->notFoundResponse('Program not found');
        }

        $this->authorize('update', $program);

        try {
            $program = $this->programService->updateProgram($program, $request->validated());

            return $this->successResponse(
                new SparkProgramResource($program),
                'Program updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update program', 500);
        }
    }

    /**
     * Delete program
     */
    public function destroy(int $id): JsonResponse
    {
        $program = $this->programService->getProgramById($id);

        if (!$program) {
            return $this->notFoundResponse('Program not found');
        }

        $this->authorize('delete', $program);

        try {
            $this->programService->deleteProgram($program);

            return $this->successResponse(null, 'Program deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete program', 500);
        }
    }

    /**
     * Upload resource files
     */
    public function uploadResources(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'files' => 'required|array|max:10',
            'files.*' => 'file|mimes:pdf,doc,docx,ppt,pptx,jpg,jpeg,png|max:10240',
        ]);

        $program = $this->programService->getProgramById($id);

        if (!$program) {
            return $this->notFoundResponse('Program not found');
        }

        $this->authorize('update', $program);

        try {
            $program = $this->programService->uploadResourceFiles($program, $request->file('files'));

            return $this->successResponse(
                new SparkProgramResource($program),
                'Resource files uploaded successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to upload files', 500);
        }
    }

    /**
     * Get program availability
     */
    public function availability(int $id, Request $request): JsonResponse
    {
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
    }

    /**
     * Set program availability
     */
    public function setAvailability(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'availability' => 'required|array|min:1',
            'availability.*.date' => 'required|date|after_or_equal:today',
            'availability.*.start_time' => 'required|date_format:H:i',
            'availability.*.end_time' => 'required|date_format:H:i|after:availability.*.start_time',
            'availability.*.max_bookings' => 'required|integer|min:1|max:100',
            'availability.*.notes' => 'sometimes|string|max:500',
        ]);

        try {
            $result = $this->programService->setProgramAvailability($id, $request->availability);

            return $this->successResponse($result, 'Program availability set successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to set availability', 500);
        }
    }
}
```

**Create CharacterTopicController (app/Http/Controllers/Api/V1/Spark/CharacterTopicController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\CreateCharacterTopicRequest;
use App\Http\Resources\Spark\CharacterTopicResource;
use App\Services\Spark\CharacterTopicService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CharacterTopicController extends BaseApiController
{
    public function __construct(
        private CharacterTopicService $topicService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get character topics list
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'category' => 'sometimes|string',
            'age_group' => 'sometimes|string',
            'search' => 'sometimes|string|max:255',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $topics = $this->topicService->getCharacterTopics($request->validated());

        return $this->paginatedResponse($topics, 'Character topics retrieved successfully');
    }

    /**
     * Create new character topic
     */
    public function store(CreateCharacterTopicRequest $request): JsonResponse
    {
        $this->authorize('create', CharacterTopic::class);

        try {
            $topic = $this->topicService->createCharacterTopic($request->validated());

            return $this->successResponse(
                new CharacterTopicResource($topic),
                'Character topic created successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create character topic', 500);
        }
    }

    /**
     * Get character topic by ID
     */
    public function show(int $id): JsonResponse
    {
        $topic = $this->topicService->getCharacterTopicById($id);

        if (!$topic) {
            return $this->notFoundResponse('Character topic not found');
        }

        return $this->successResponse(
            new CharacterTopicResource($topic),
            'Character topic retrieved successfully'
        );
    }

    /**
     * Update character topic
     */
    public function update(CreateCharacterTopicRequest $request, int $id): JsonResponse
    {
        $topic = $this->topicService->getCharacterTopicById($id);

        if (!$topic) {
            return $this->notFoundResponse('Character topic not found');
        }

        $this->authorize('update', $topic);

        try {
            $topic = $this->topicService->updateCharacterTopic($topic, $request->validated());

            return $this->successResponse(
                new CharacterTopicResource($topic),
                'Character topic updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update character topic', 500);
        }
    }

    /**
     * Delete character topic
     */
    public function destroy(int $id): JsonResponse
    {
        $topic = $this->topicService->getCharacterTopicById($id);

        if (!$topic) {
            return $this->notFoundResponse('Character topic not found');
        }

        $this->authorize('delete', $topic);

        try {
            $this->topicService->deleteCharacterTopic($topic);

            return $this->successResponse(null, 'Character topic deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete character topic', 500);
        }
    }

    /**
     * Get programs using this character topic
     */
    public function programs(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $programs = $this->topicService->getTopicPrograms($id, $request->per_page ?? 20);

        return $this->paginatedResponse($programs, 'Character topic programs retrieved successfully');
    }
}
```

### Step 3: Create Request Validation Classes (60 minutes)

**Create CreateProgramRequest (app/Http/Requests/Spark/CreateProgramRequest.php):**
```php
<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;

class CreateProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
            'grade_levels' => ['required', 'array', 'min:1'],
            'grade_levels.*' => ['string', 'in:K,1,2,3,4,5,6,7,8,9,10,11,12'],
            'duration_minutes' => ['required', 'integer', 'min:15', 'max:480'],
            'max_students' => ['required', 'integer', 'min:1', 'max:100'],
            'price_per_student' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'character_topics' => ['required', 'array', 'min:1', 'max:10'],
            'character_topics.*' => ['string', 'max:100'],
            'learning_objectives' => ['required', 'array', 'min:1', 'max:20'],
            'learning_objectives.*' => ['string', 'max:255'],
            'materials_needed' => ['sometimes', 'array', 'max:50'],
            'materials_needed.*' => ['string', 'max:255'],
            'special_requirements' => ['sometimes', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'grade_levels.required' => 'At least one grade level is required',
            'grade_levels.*.in' => 'Invalid grade level. Must be K or 1-12',
            'duration_minutes.min' => 'Program duration must be at least 15 minutes',
            'duration_minutes.max' => 'Program duration cannot exceed 8 hours',
            'max_students.max' => 'Maximum students cannot exceed 100',
            'character_topics.required' => 'At least one character topic is required',
            'character_topics.max' => 'Maximum 10 character topics allowed',
            'learning_objectives.required' => 'At least one learning objective is required',
            'learning_objectives.max' => 'Maximum 20 learning objectives allowed',
        ];
    }
}
```

**Create CreateCharacterTopicRequest (app/Http/Requests/Spark/CreateCharacterTopicRequest.php):**
```php
<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;

class CreateCharacterTopicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:character_topics,name'],
            'description' => ['required', 'string', 'max:1000'],
            'category' => ['required', 'string', 'in:respect,responsibility,integrity,kindness,perseverance,courage,empathy,teamwork,leadership,citizenship'],
            'age_group' => ['required', 'string', 'in:elementary,middle,high,all'],
            'learning_outcomes' => ['required', 'array', 'min:1', 'max:10'],
            'learning_outcomes.*' => ['string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'Character topic name must be unique',
            'category.in' => 'Invalid character topic category',
            'age_group.in' => 'Invalid age group. Must be elementary, middle, high, or all',
            'learning_outcomes.required' => 'At least one learning outcome is required',
            'learning_outcomes.max' => 'Maximum 10 learning outcomes allowed',
        ];
    }
}
```

### Step 4: Create Service Classes (120 minutes)

**Create SparkProgramService (app/Services/Spark/SparkProgramService.php):**
```php
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
```

**Create CharacterTopicService (app/Services/Spark/CharacterTopicService.php):**
```php
<?php

namespace App\Services\Spark;

use App\Models\Spark\CharacterTopic;
use App\Models\Spark\SparkProgram;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CharacterTopicService
{
    public function getCharacterTopics(array $filters = []): LengthAwarePaginator
    {
        $query = CharacterTopic::with(['programs'])->active();

        if (isset($filters['category'])) {
            $query->byCategory($filters['category']);
        }

        if (isset($filters['age_group'])) {
            $query->byAgeGroup($filters['age_group']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'LIKE', "%{$filters['search']}%")
                  ->orWhere('description', 'LIKE', "%{$filters['search']}%");
            });
        }

        return $query->orderBy('name')->paginate($filters['per_page'] ?? 20);
    }

    public function createCharacterTopic(array $data): CharacterTopic
    {
        return DB::transaction(function () use ($data) {
            return CharacterTopic::create($data);
        });
    }

    public function getCharacterTopicById(int $id): ?CharacterTopic
    {
        return CharacterTopic::with(['programs'])->find($id);
    }

    public function updateCharacterTopic(CharacterTopic $topic, array $data): CharacterTopic
    {
        return DB::transaction(function () use ($topic, $data) {
            $topic->update($data);
            return $topic->fresh(['programs']);
        });
    }

    public function deleteCharacterTopic(CharacterTopic $topic): bool
    {
        if ($topic->programs()->exists()) {
            throw new \Exception('Cannot delete character topic that is used by programs');
        }

        return $topic->delete();
    }

    public function getTopicPrograms(int $topicId, int $perPage = 20): LengthAwarePaginator
    {
        return SparkProgram::whereJsonContains('character_topics',
            CharacterTopic::find($topicId)?->name
        )->active()->paginate($perPage);
    }
}
```

### Step 5: Create Resources and Routes (45 minutes)

**Create SparkProgramResource (app/Http/Resources/Spark/SparkProgramResource.php):**
```php
<?php

namespace App\Http\Resources\Spark;

use App\Http\Resources\BaseResource;

class SparkProgramResource extends BaseResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'grade_levels' => $this->grade_levels,
            'grade_levels_display' => $this->grade_levels_display,
            'duration_minutes' => $this->duration_minutes,
            'duration_display' => $this->duration_display,
            'max_students' => $this->max_students,
            'price_per_student' => $this->price_per_student,
            'character_topics' => $this->character_topics,
            'character_topics_display' => $this->character_topics_display,
            'learning_objectives' => $this->learning_objectives,
            'materials_needed' => $this->materials_needed,
            'resource_files' => $this->resource_files,
            'special_requirements' => $this->special_requirements,
            'is_active' => $this->is_active,
            'total_bookings' => $this->total_bookings,
            'completed_bookings' => $this->completed_bookings,
            'average_rating' => $this->average_rating,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),

            'bookings' => $this->when($this->relationLoaded('bookings'),
                $this->bookings->map(function ($booking) {
                    return [
                        'id' => $booking->id,
                        'school_name' => $booking->school->name,
                        'confirmed_date' => $booking->confirmed_date?->format('Y-m-d'),
                        'status' => $booking->status,
                        'student_count' => $booking->student_count,
                    ];
                })
            ),

            'availability' => $this->when($this->relationLoaded('availability'),
                $this->availability->map(function ($slot) {
                    return [
                        'id' => $slot->id,
                        'date' => $slot->date->format('Y-m-d'),
                        'start_time' => $slot->start_time->format('H:i'),
                        'end_time' => $slot->end_time->format('H:i'),
                        'available_slots' => $slot->available_slots,
                        'is_full' => $slot->is_full,
                    ];
                })
            ),
        ];
    }
}
```

**Update routes/api/spark.php:**
```php
// Add to existing routes

Route::prefix('programs')->group(function () {
    Route::get('/', [SparkProgramController::class, 'index']);
    Route::post('/', [SparkProgramController::class, 'store']);
    Route::get('/{id}', [SparkProgramController::class, 'show']);
    Route::put('/{id}', [SparkProgramController::class, 'update']);
    Route::delete('/{id}', [SparkProgramController::class, 'destroy']);

    // Resource management
    Route::post('/{id}/resources', [SparkProgramController::class, 'uploadResources']);

    // Availability management
    Route::get('/{id}/availability', [SparkProgramController::class, 'availability']);
    Route::post('/{id}/availability', [SparkProgramController::class, 'setAvailability']);
});

Route::prefix('character-topics')->group(function () {
    Route::get('/', [CharacterTopicController::class, 'index']);
    Route::post('/', [CharacterTopicController::class, 'store']);
    Route::get('/{id}', [CharacterTopicController::class, 'show']);
    Route::put('/{id}', [CharacterTopicController::class, 'update']);
    Route::delete('/{id}', [CharacterTopicController::class, 'destroy']);
    Route::get('/{id}/programs', [CharacterTopicController::class, 'programs']);
});
```

## Acceptance Criteria

### Program Management
- [ ] CRUD operations for Spark programs
- [ ] Program search and filtering by grade level, topic, duration, capacity
- [ ] Character topic association and management
- [ ] Learning objectives and materials management
- [ ] Resource file upload and management

### Program Availability
- [ ] Set program availability slots with date/time
- [ ] Capacity management for availability slots
- [ ] Booking slot tracking and availability checking
- [ ] Availability search by date range

### Character Topics
- [ ] CRUD operations for character topics
- [ ] Topic categorization and age group targeting
- [ ] Learning outcomes management
- [ ] Program-topic relationship tracking

### Resource Management
- [ ] Upload program resource files (PDFs, documents, images)
- [ ] File type validation and size limits
- [ ] Resource file organization and metadata
- [ ] Secure file storage and access

## Testing Instructions

### Manual Testing
```bash
# Create program
curl -X POST http://localhost:8000/api/v1/spark/programs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Respect and Responsibility","description":"Learn about respect and responsibility","grade_levels":["K","1","2"],"duration_minutes":45,"max_students":25,"price_per_student":5.00,"character_topics":["respect","responsibility"],"learning_objectives":["Understand respect","Practice responsibility"]}'

# Set program availability
curl -X POST http://localhost:8000/api/v1/spark/programs/1/availability \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"availability":[{"date":"2024-12-01","start_time":"09:00","end_time":"10:00","max_bookings":3}]}'

# Create character topic
curl -X POST http://localhost:8000/api/v1/spark/character-topics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Respect","description":"Learning about respect for others","category":"respect","age_group":"elementary","learning_outcomes":["Understand what respect means","Practice respectful behavior"]}'
```

## Next Steps
After completion, proceed to:
- Task 003: Booking Management API
- Coordinate with Agent 6 on mobile program UI
- Share program models with booking system

## Documentation
- Update API documentation with program management endpoints
- Document character topic system
- Create program availability management guide
