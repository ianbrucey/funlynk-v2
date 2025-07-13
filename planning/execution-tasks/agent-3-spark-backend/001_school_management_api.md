# Task 001: School Management API
**Agent**: Spark Backend Developer
**Estimated Time**: 6-7 hours
**Priority**: High
**Dependencies**: Agent 1 Tasks 001-005 (Backend Foundation Complete)

## Overview
Implement comprehensive school and district management API for Spark including CRUD operations, user-school relationships, admin role management, and school profile settings.

## Prerequisites
- Backend foundation completed by Agent 1
- Authentication system working
- Database schema with districts and schools tables
- Shared services available
- API foundation established

## Step-by-Step Implementation

### Step 1: Create School Models and Relationships (75 minutes)

**Create District model (app/Models/Spark/District.php):**
```php
<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class District extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'address',
        'city',
        'state',
        'zip_code',
        'phone',
        'email',
        'website',
        'contact_info',
        'is_active',
    ];

    protected $casts = [
        'contact_info' => 'array',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function schools(): HasMany
    {
        return $this->hasMany(School::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'district_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByState($query, string $state)
    {
        return $query->where('state', $state);
    }

    // Accessors
    public function getFullAddressAttribute(): string
    {
        return "{$this->address}, {$this->city}, {$this->state} {$this->zip_code}";
    }

    public function getSchoolCountAttribute(): int
    {
        return $this->schools()->count();
    }

    public function getActiveSchoolCountAttribute(): int
    {
        return $this->schools()->where('is_active', true)->count();
    }
}
```

**Create School model (app/Models/Spark/School.php):**
```php
<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class School extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'district_id',
        'name',
        'code',
        'address',
        'city',
        'state',
        'zip_code',
        'phone',
        'email',
        'principal_name',
        'principal_email',
        'grade_levels',
        'student_count',
        'is_active',
    ];

    protected $casts = [
        'grade_levels' => 'array',
        'student_count' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'school_users')
            ->withPivot(['role', 'is_active', 'joined_at'])
            ->withTimestamps();
    }

    public function teachers(): BelongsToMany
    {
        return $this->users()->wherePivot('role', 'teacher');
    }

    public function admins(): BelongsToMany
    {
        return $this->users()->wherePivot('role', 'admin');
    }

    public function classes(): HasMany
    {
        return $this->hasMany(SchoolClass::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByDistrict($query, int $districtId)
    {
        return $query->where('district_id', $districtId);
    }

    public function scopeByGradeLevel($query, string $gradeLevel)
    {
        return $query->whereJsonContains('grade_levels', $gradeLevel);
    }

    public function scopeByState($query, string $state)
    {
        return $query->where('state', $state);
    }

    // Accessors
    public function getFullAddressAttribute(): string
    {
        return "{$this->address}, {$this->city}, {$this->state} {$this->zip_code}";
    }

    public function getTeacherCountAttribute(): int
    {
        return $this->teachers()->count();
    }

    public function getClassCountAttribute(): int
    {
        return $this->classes()->count();
    }

    public function getGradeLevelsDisplayAttribute(): string
    {
        return implode(', ', $this->grade_levels ?? []);
    }
}
```

**Create SparkProfile model (app/Models/Spark/SparkProfile.php):**
```php
<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class SparkProfile extends Model
{
    protected $fillable = [
        'user_id',
        'employee_id',
        'department',
        'position',
        'hire_date',
        'phone_extension',
        'emergency_contact',
        'certifications',
        'specializations',
        'bio',
        'preferences',
        'is_active',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'emergency_contact' => 'array',
        'certifications' => 'array',
        'specializations' => 'array',
        'preferences' => 'array',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByDepartment($query, string $department)
    {
        return $query->where('department', $department);
    }

    // Accessors
    public function getYearsOfServiceAttribute(): int
    {
        return $this->hire_date ? $this->hire_date->diffInYears(now()) : 0;
    }

    public function getCertificationsDisplayAttribute(): string
    {
        return implode(', ', $this->certifications ?? []);
    }
}
```

### Step 2: Create School Controllers (120 minutes)

**Create DistrictController (app/Http/Controllers/Api/V1/Spark/DistrictController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\CreateDistrictRequest;
use App\Http\Requests\Spark\UpdateDistrictRequest;
use App\Http\Resources\Spark\DistrictResource;
use App\Services\Spark\DistrictService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DistrictController extends BaseApiController
{
    public function __construct(
        private DistrictService $districtService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get districts list
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'state' => 'sometimes|string|size:2',
            'search' => 'sometimes|string|max:255',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $districts = $this->districtService->getDistricts($request->validated());

        return $this->paginatedResponse($districts, 'Districts retrieved successfully');
    }

    /**
     * Create new district
     */
    public function store(CreateDistrictRequest $request): JsonResponse
    {
        $this->authorize('create', District::class);

        try {
            $district = $this->districtService->createDistrict($request->validated());

            return $this->successResponse(
                new DistrictResource($district),
                'District created successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create district', 500);
        }
    }

    /**
     * Get district by ID
     */
    public function show(int $id): JsonResponse
    {
        $district = $this->districtService->getDistrictById($id);

        if (!$district) {
            return $this->notFoundResponse('District not found');
        }

        return $this->successResponse(
            new DistrictResource($district),
            'District retrieved successfully'
        );
    }

    /**
     * Update district
     */
    public function update(UpdateDistrictRequest $request, int $id): JsonResponse
    {
        $district = $this->districtService->getDistrictById($id);

        if (!$district) {
            return $this->notFoundResponse('District not found');
        }

        $this->authorize('update', $district);

        try {
            $district = $this->districtService->updateDistrict($district, $request->validated());

            return $this->successResponse(
                new DistrictResource($district),
                'District updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update district', 500);
        }
    }

    /**
     * Delete district
     */
    public function destroy(int $id): JsonResponse
    {
        $district = $this->districtService->getDistrictById($id);

        if (!$district) {
            return $this->notFoundResponse('District not found');
        }

        $this->authorize('delete', $district);

        try {
            $this->districtService->deleteDistrict($district);

            return $this->successResponse(null, 'District deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete district', 500);
        }
    }

    /**
     * Get district schools
     */
    public function schools(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $schools = $this->districtService->getDistrictSchools($id, $request->per_page ?? 20);

        return $this->paginatedResponse($schools, 'District schools retrieved successfully');
    }
}
```

**Create SchoolController (app/Http/Controllers/Api/V1/Spark/SchoolController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\CreateSchoolRequest;
use App\Http\Requests\Spark\UpdateSchoolRequest;
use App\Http\Resources\Spark\SchoolResource;
use App\Services\Spark\SchoolService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolController extends BaseApiController
{
    public function __construct(
        private SchoolService $schoolService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get schools list
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'district_id' => 'sometimes|exists:districts,id',
            'state' => 'sometimes|string|size:2',
            'grade_level' => 'sometimes|string',
            'search' => 'sometimes|string|max:255',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $schools = $this->schoolService->getSchools($request->validated());

        return $this->paginatedResponse($schools, 'Schools retrieved successfully');
    }

    /**
     * Create new school
     */
    public function store(CreateSchoolRequest $request): JsonResponse
    {
        $this->authorize('create', School::class);

        try {
            $school = $this->schoolService->createSchool($request->validated());

            return $this->successResponse(
                new SchoolResource($school),
                'School created successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create school', 500);
        }
    }

    /**
     * Get school by ID
     */
    public function show(int $id): JsonResponse
    {
        $school = $this->schoolService->getSchoolById($id);

        if (!$school) {
            return $this->notFoundResponse('School not found');
        }

        return $this->successResponse(
            new SchoolResource($school),
            'School retrieved successfully'
        );
    }

    /**
     * Update school
     */
    public function update(UpdateSchoolRequest $request, int $id): JsonResponse
    {
        $school = $this->schoolService->getSchoolById($id);

        if (!$school) {
            return $this->notFoundResponse('School not found');
        }

        $this->authorize('update', $school);

        try {
            $school = $this->schoolService->updateSchool($school, $request->validated());

            return $this->successResponse(
                new SchoolResource($school),
                'School updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update school', 500);
        }
    }

    /**
     * Delete school
     */
    public function destroy(int $id): JsonResponse
    {
        $school = $this->schoolService->getSchoolById($id);

        if (!$school) {
            return $this->notFoundResponse('School not found');
        }

        $this->authorize('delete', $school);

        try {
            $this->schoolService->deleteSchool($school);

            return $this->successResponse(null, 'School deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete school', 500);
        }
    }

    /**
     * Assign user to school
     */
    public function assignUser(int $schoolId, Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string|in:teacher,admin,staff',
        ]);

        try {
            $result = $this->schoolService->assignUserToSchool(
                $schoolId,
                $request->user_id,
                $request->role
            );

            if (!$result) {
                return $this->errorResponse('Failed to assign user to school', 400);
            }

            return $this->successResponse(null, 'User assigned to school successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to assign user', 500);
        }
    }

    /**
     * Remove user from school
     */
    public function removeUser(int $schoolId, int $userId): JsonResponse
    {
        try {
            $result = $this->schoolService->removeUserFromSchool($schoolId, $userId);

            if (!$result) {
                return $this->errorResponse('User not found in school', 404);
            }

            return $this->successResponse(null, 'User removed from school successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to remove user', 500);
        }
    }

    /**
     * Get school users
     */
    public function users(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'role' => 'sometimes|string|in:teacher,admin,staff',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $users = $this->schoolService->getSchoolUsers($id, $request->role, $request->per_page ?? 20);

        return $this->paginatedResponse($users, 'School users retrieved successfully');
    }
}
```

### Step 3: Create Request Validation Classes (60 minutes)

**Create CreateDistrictRequest (app/Http/Requests/Spark/CreateDistrictRequest.php):**
```php
<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;

class CreateDistrictRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:districts,code'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'size:2'],
            'zip_code' => ['required', 'string', 'max:10'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'email' => ['sometimes', 'email', 'max:255'],
            'website' => ['sometimes', 'url', 'max:255'],
            'contact_info' => ['sometimes', 'array'],
            'contact_info.superintendent_name' => ['sometimes', 'string', 'max:255'],
            'contact_info.superintendent_email' => ['sometimes', 'email', 'max:255'],
            'contact_info.superintendent_phone' => ['sometimes', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique' => 'District code must be unique',
            'state.size' => 'State must be a 2-letter code',
            'email.email' => 'Please provide a valid email address',
            'website.url' => 'Please provide a valid website URL',
        ];
    }
}
```

**Create CreateSchoolRequest (app/Http/Requests/Spark/CreateSchoolRequest.php):**
```php
<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;

class CreateSchoolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'district_id' => ['required', 'exists:districts,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:schools,code'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'size:2'],
            'zip_code' => ['required', 'string', 'max:10'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'email' => ['sometimes', 'email', 'max:255'],
            'principal_name' => ['sometimes', 'string', 'max:255'],
            'principal_email' => ['sometimes', 'email', 'max:255'],
            'grade_levels' => ['required', 'array', 'min:1'],
            'grade_levels.*' => ['string', 'in:K,1,2,3,4,5,6,7,8,9,10,11,12'],
            'student_count' => ['sometimes', 'integer', 'min:0', 'max:10000'],
        ];
    }

    public function messages(): array
    {
        return [
            'district_id.exists' => 'Selected district does not exist',
            'code.unique' => 'School code must be unique',
            'state.size' => 'State must be a 2-letter code',
            'grade_levels.required' => 'At least one grade level is required',
            'grade_levels.*.in' => 'Invalid grade level. Must be K or 1-12',
            'student_count.max' => 'Student count cannot exceed 10,000',
        ];
    }
}
```

### Step 4: Create Service Classes (90 minutes)

**Create DistrictService (app/Services/Spark/DistrictService.php):**
```php
<?php

namespace App\Services\Spark;

use App\Models\Spark\District;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class DistrictService
{
    public function getDistricts(array $filters = []): LengthAwarePaginator
    {
        $query = District::with(['schools' => function ($q) {
            $q->where('is_active', true);
        }])->active();

        if (isset($filters['state'])) {
            $query->byState($filters['state']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'LIKE', "%{$filters['search']}%")
                  ->orWhere('code', 'LIKE', "%{$filters['search']}%")
                  ->orWhere('city', 'LIKE', "%{$filters['search']}%");
            });
        }

        return $query->orderBy('name')->paginate($filters['per_page'] ?? 20);
    }

    public function createDistrict(array $data): District
    {
        return DB::transaction(function () use ($data) {
            return District::create($data);
        });
    }

    public function getDistrictById(int $id): ?District
    {
        return District::with(['schools.users'])->find($id);
    }

    public function updateDistrict(District $district, array $data): District
    {
        return DB::transaction(function () use ($district, $data) {
            $district->update($data);
            return $district->fresh(['schools']);
        });
    }

    public function deleteDistrict(District $district): bool
    {
        if ($district->schools()->exists()) {
            throw new \Exception('Cannot delete district with associated schools');
        }

        return $district->delete();
    }

    public function getDistrictSchools(int $districtId, int $perPage = 20): LengthAwarePaginator
    {
        return School::with(['users'])
            ->where('district_id', $districtId)
            ->active()
            ->orderBy('name')
            ->paginate($perPage);
    }
}
```

**Create SchoolService (app/Services/Spark/SchoolService.php):**
```php
<?php

namespace App\Services\Spark;

use App\Models\Spark\School;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class SchoolService
{
    public function getSchools(array $filters = []): LengthAwarePaginator
    {
        $query = School::with(['district', 'users'])->active();

        if (isset($filters['district_id'])) {
            $query->byDistrict($filters['district_id']);
        }

        if (isset($filters['state'])) {
            $query->byState($filters['state']);
        }

        if (isset($filters['grade_level'])) {
            $query->byGradeLevel($filters['grade_level']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'LIKE', "%{$filters['search']}%")
                  ->orWhere('code', 'LIKE', "%{$filters['search']}%")
                  ->orWhere('city', 'LIKE', "%{$filters['search']}%");
            });
        }

        return $query->orderBy('name')->paginate($filters['per_page'] ?? 20);
    }

    public function createSchool(array $data): School
    {
        return DB::transaction(function () use ($data) {
            return School::create($data);
        });
    }

    public function getSchoolById(int $id): ?School
    {
        return School::with(['district', 'users', 'classes'])->find($id);
    }

    public function updateSchool(School $school, array $data): School
    {
        return DB::transaction(function () use ($school, $data) {
            $school->update($data);
            return $school->fresh(['district', 'users']);
        });
    }

    public function deleteSchool(School $school): bool
    {
        if ($school->classes()->exists() || $school->bookings()->exists()) {
            throw new \Exception('Cannot delete school with associated classes or bookings');
        }

        return $school->delete();
    }

    public function assignUserToSchool(int $schoolId, int $userId, string $role): bool
    {
        $school = School::findOrFail($schoolId);
        $user = User::findOrFail($userId);

        // Check if user is already assigned
        if ($school->users()->where('user_id', $userId)->exists()) {
            return false;
        }

        $school->users()->attach($userId, [
            'role' => $role,
            'is_active' => true,
            'joined_at' => now(),
        ]);

        return true;
    }

    public function removeUserFromSchool(int $schoolId, int $userId): bool
    {
        $school = School::findOrFail($schoolId);

        return $school->users()->detach($userId) > 0;
    }

    public function getSchoolUsers(int $schoolId, ?string $role = null, int $perPage = 20): LengthAwarePaginator
    {
        $query = User::with(['sparkProfile'])
            ->whereHas('schools', function ($q) use ($schoolId, $role) {
                $q->where('school_id', $schoolId);
                if ($role) {
                    $q->where('role', $role);
                }
            });

        return $query->orderBy('first_name')->paginate($perPage);
    }
}
```

### Step 5: Create Resources and Routes (45 minutes)

**Create DistrictResource (app/Http/Resources/Spark/DistrictResource.php):**
```php
<?php

namespace App\Http\Resources\Spark;

use App\Http\Resources\BaseResource;

class DistrictResource extends BaseResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'zip_code' => $this->zip_code,
            'full_address' => $this->full_address,
            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,
            'contact_info' => $this->contact_info,
            'is_active' => $this->is_active,
            'school_count' => $this->school_count,
            'active_school_count' => $this->active_school_count,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),

            'schools' => $this->when($this->relationLoaded('schools'),
                SchoolResource::collection($this->schools)
            ),
        ];
    }
}
```

**Create SchoolResource (app/Http/Resources/Spark/SchoolResource.php):**
```php
<?php

namespace App\Http\Resources\Spark;

use App\Http\Resources\BaseResource;

class SchoolResource extends BaseResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'zip_code' => $this->zip_code,
            'full_address' => $this->full_address,
            'phone' => $this->phone,
            'email' => $this->email,
            'principal_name' => $this->principal_name,
            'principal_email' => $this->principal_email,
            'grade_levels' => $this->grade_levels,
            'grade_levels_display' => $this->grade_levels_display,
            'student_count' => $this->student_count,
            'teacher_count' => $this->teacher_count,
            'class_count' => $this->class_count,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),

            'district' => $this->when($this->relationLoaded('district'), [
                'id' => $this->district->id,
                'name' => $this->district->name,
                'code' => $this->district->code,
            ]),

            'users' => $this->when($this->relationLoaded('users'),
                $this->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'full_name' => $user->full_name,
                        'email' => $user->email,
                        'role' => $user->pivot->role,
                        'is_active' => $user->pivot->is_active,
                        'joined_at' => $user->pivot->joined_at,
                    ];
                })
            ),
        ];
    }
}
```

**Update routes/api/spark.php:**
```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Spark\DistrictController;
use App\Http\Controllers\Api\V1\Spark\SchoolController;

/*
|--------------------------------------------------------------------------
| Spark School Management Routes
|--------------------------------------------------------------------------
*/

Route::prefix('districts')->group(function () {
    Route::get('/', [DistrictController::class, 'index']);
    Route::post('/', [DistrictController::class, 'store']);
    Route::get('/{id}', [DistrictController::class, 'show']);
    Route::put('/{id}', [DistrictController::class, 'update']);
    Route::delete('/{id}', [DistrictController::class, 'destroy']);
    Route::get('/{id}/schools', [DistrictController::class, 'schools']);
});

Route::prefix('schools')->group(function () {
    Route::get('/', [SchoolController::class, 'index']);
    Route::post('/', [SchoolController::class, 'store']);
    Route::get('/{id}', [SchoolController::class, 'show']);
    Route::put('/{id}', [SchoolController::class, 'update']);
    Route::delete('/{id}', [SchoolController::class, 'destroy']);

    // User management
    Route::post('/{id}/users', [SchoolController::class, 'assignUser']);
    Route::delete('/{schoolId}/users/{userId}', [SchoolController::class, 'removeUser']);
    Route::get('/{id}/users', [SchoolController::class, 'users']);
});
```

## Acceptance Criteria

### District Management
- [ ] CRUD operations for districts
- [ ] District search and filtering by state
- [ ] District-school relationship management
- [ ] Contact information management
- [ ] District statistics (school count, etc.)

### School Management
- [ ] CRUD operations for schools
- [ ] School search and filtering (district, state, grade level)
- [ ] Grade level management
- [ ] Principal information management
- [ ] School statistics (teacher count, class count, etc.)

### User-School Relationships
- [ ] Assign users to schools with roles
- [ ] Remove users from schools
- [ ] Role-based access control (teacher, admin, staff)
- [ ] User listing by school and role
- [ ] Active/inactive status management

### Data Validation
- [ ] Unique district and school codes
- [ ] Valid state codes and addresses
- [ ] Grade level validation (K, 1-12)
- [ ] Email and phone format validation

## Testing Instructions

### Manual Testing
```bash
# Create district
curl -X POST http://localhost:8000/api/v1/spark/districts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test District","code":"TD001","address":"123 Main St","city":"Anytown","state":"CA","zip_code":"12345"}'

# Create school
curl -X POST http://localhost:8000/api/v1/spark/schools \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"district_id":1,"name":"Test Elementary","code":"TE001","address":"456 School St","city":"Anytown","state":"CA","zip_code":"12345","grade_levels":["K","1","2","3","4","5"]}'

# Assign user to school
curl -X POST http://localhost:8000/api/v1/spark/schools/1/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":2,"role":"teacher"}'
```

## Next Steps
After completion, proceed to:
- Task 002: Program Management API
- Coordinate with Agent 6 on mobile school UI
- Share school models with other Spark agents

## Documentation
- Update API documentation with school management endpoints
- Document user-school relationship system
- Create school administration guide