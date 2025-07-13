# Task 001: User Management API
**Agent**: Core Funlynk Backend Developer  
**Estimated Time**: 5-6 hours  
**Priority**: High  
**Dependencies**: Agent 1 Tasks 001-005 (Backend Foundation Complete)  

## Overview
Implement comprehensive user management API for Core Funlynk including user profiles, interests, following system, and user search functionality.

## Prerequisites
- Backend foundation completed by Agent 1
- Authentication system working
- Database schema implemented
- Shared services available
- API foundation established

## Step-by-Step Implementation

### Step 1: Create User Models and Relationships (60 minutes)

**Create CoreProfile model (app/Models/Core/CoreProfile.php):**
```php
<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class CoreProfile extends Model
{
    protected $fillable = [
        'user_id',
        'username',
        'bio',
        'website',
        'social_links',
        'visibility',
        'is_host',
        'host_rating',
        'events_hosted',
        'events_attended',
    ];

    protected $casts = [
        'social_links' => 'array',
        'is_host' => 'boolean',
        'host_rating' => 'decimal:2',
        'events_hosted' => 'integer',
        'events_attended' => 'integer',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    public function scopeHosts($query)
    {
        return $query->where('is_host', true);
    }

    // Accessors
    public function getIsPublicAttribute(): bool
    {
        return $this->visibility === 'public';
    }

    public function getHostRatingDisplayAttribute(): string
    {
        return $this->host_rating ? number_format($this->host_rating, 1) : 'No rating';
    }
}
```

**Create UserInterest model (app/Models/Core/UserInterest.php):**
```php
<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class UserInterest extends Model
{
    protected $fillable = [
        'user_id',
        'interest',
        'category',
        'level',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByLevel($query, string $level)
    {
        return $query->where('level', $level);
    }
}
```

**Create UserFollow model (app/Models/Core/UserFollow.php):**
```php
<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class UserFollow extends Model
{
    protected $fillable = [
        'follower_id',
        'following_id',
        'followed_at',
    ];

    protected $casts = [
        'followed_at' => 'datetime',
    ];

    // Relationships
    public function follower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'follower_id');
    }

    public function following(): BelongsTo
    {
        return $this->belongsTo(User::class, 'following_id');
    }

    // Prevent self-following
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if ($model->follower_id === $model->following_id) {
                throw new \InvalidArgumentException('Users cannot follow themselves');
            }
        });
    }
}
```

### Step 2: Create User Management Controllers (90 minutes)

**Create UserController (app/Http/Controllers/Api/V1/Core/UserController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Core\UpdateProfileRequest;
use App\Http\Requests\Core\UpdateInterestsRequest;
use App\Http\Resources\Core\UserResource;
use App\Http\Resources\Core\UserCollection;
use App\Services\Core\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends BaseApiController
{
    public function __construct(
        private UserService $userService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get current user profile
     */
    public function profile(): JsonResponse
    {
        $user = auth()->user()->load(['coreProfile', 'interests', 'roles']);
        
        return $this->successResponse(
            new UserResource($user),
            'Profile retrieved successfully'
        );
    }

    /**
     * Update user profile
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        try {
            $user = $this->userService->updateProfile(auth()->user(), $request->validated());
            
            return $this->successResponse(
                new UserResource($user),
                'Profile updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update profile', 500);
        }
    }

    /**
     * Get user by ID
     */
    public function show(int $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);
        
        if (!$user) {
            return $this->notFoundResponse('User not found');
        }

        return $this->successResponse(
            new UserResource($user),
            'User retrieved successfully'
        );
    }

    /**
     * Search users
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:2',
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
        ]);

        $users = $this->userService->searchUsers(
            $request->query('query'),
            $request->query('per_page', 15)
        );

        return $this->paginatedResponse($users, 'Users retrieved successfully');
    }

    /**
     * Update user interests
     */
    public function updateInterests(UpdateInterestsRequest $request): JsonResponse
    {
        try {
            $user = $this->userService->updateInterests(auth()->user(), $request->validated());
            
            return $this->successResponse(
                new UserResource($user),
                'Interests updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update interests', 500);
        }
    }

    /**
     * Get user activity
     */
    public function activity(int $id): JsonResponse
    {
        $activity = $this->userService->getUserActivity($id);
        
        return $this->successResponse($activity, 'User activity retrieved successfully');
    }
}
```

**Create UserFollowController (app/Http/Controllers/Api/V1/Core/UserFollowController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Core\UserCollection;
use App\Services\Core\UserFollowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserFollowController extends BaseApiController
{
    public function __construct(
        private UserFollowService $followService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Follow a user
     */
    public function follow(int $userId): JsonResponse
    {
        try {
            $result = $this->followService->followUser(auth()->id(), $userId);
            
            if (!$result) {
                return $this->errorResponse('Cannot follow this user', 400);
            }

            return $this->successResponse(null, 'User followed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to follow user', 500);
        }
    }

    /**
     * Unfollow a user
     */
    public function unfollow(int $userId): JsonResponse
    {
        try {
            $result = $this->followService->unfollowUser(auth()->id(), $userId);
            
            return $this->successResponse(null, 'User unfollowed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to unfollow user', 500);
        }
    }

    /**
     * Get user's followers
     */
    public function followers(int $userId, Request $request): JsonResponse
    {
        $followers = $this->followService->getFollowers($userId, $request->query('per_page', 15));
        
        return $this->paginatedResponse($followers, 'Followers retrieved successfully');
    }

    /**
     * Get users that user is following
     */
    public function following(int $userId, Request $request): JsonResponse
    {
        $following = $this->followService->getFollowing($userId, $request->query('per_page', 15));
        
        return $this->paginatedResponse($following, 'Following retrieved successfully');
    }

    /**
     * Check if current user follows another user
     */
    public function isFollowing(int $userId): JsonResponse
    {
        $isFollowing = $this->followService->isFollowing(auth()->id(), $userId);
        
        return $this->successResponse([
            'is_following' => $isFollowing
        ], 'Follow status retrieved successfully');
    }
}
```

### Step 3: Create Request Validation Classes (45 minutes)

**Create UpdateProfileRequest (app/Http/Requests/Core/UpdateProfileRequest.php):**
```php
<?php

namespace App\Http\Requests\Core;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'username' => ['sometimes', 'string', 'max:255', 'unique:core_profiles,username,' . auth()->user()->coreProfile?->id],
            'bio' => ['sometimes', 'string', 'max:500'],
            'website' => ['sometimes', 'url', 'max:255'],
            'location' => ['sometimes', 'string', 'max:255'],
            'date_of_birth' => ['sometimes', 'date', 'before:today'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'social_links' => ['sometimes', 'array'],
            'social_links.*.platform' => ['required_with:social_links', 'string', 'in:facebook,twitter,instagram,linkedin'],
            'social_links.*.url' => ['required_with:social_links', 'url'],
            'visibility' => ['sometimes', 'string', 'in:public,friends,private'],
            'notification_preferences' => ['sometimes', 'array'],
            'privacy_settings' => ['sometimes', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.unique' => 'This username is already taken',
            'date_of_birth.before' => 'Date of birth must be in the past',
            'social_links.*.platform.in' => 'Invalid social media platform',
            'visibility.in' => 'Invalid visibility setting',
        ];
    }
}
```

**Create UpdateInterestsRequest (app/Http/Requests/Core/UpdateInterestsRequest.php):**
```php
<?php

namespace App\Http\Requests\Core;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInterestsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'interests' => ['required', 'array', 'min:1', 'max:20'],
            'interests.*.interest' => ['required', 'string', 'max:100'],
            'interests.*.category' => ['required', 'string', 'in:sports,music,food,travel,technology,arts,education,business,health,entertainment'],
            'interests.*.level' => ['sometimes', 'string', 'in:beginner,intermediate,advanced,expert'],
        ];
    }

    public function messages(): array
    {
        return [
            'interests.required' => 'At least one interest is required',
            'interests.max' => 'Maximum 20 interests allowed',
            'interests.*.interest.required' => 'Interest name is required',
            'interests.*.category.in' => 'Invalid interest category',
            'interests.*.level.in' => 'Invalid skill level',
        ];
    }
}
```

### Step 4: Create User Service Layer (90 minutes)

**Create UserService (app/Services/Core/UserService.php):**
```php
<?php

namespace App\Services\Core;

use App\Models\User;
use App\Models\Core\CoreProfile;
use App\Models\Core\UserInterest;
use App\Services\Shared\FileUploadService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class UserService
{
    public function __construct(
        private FileUploadService $fileUploadService
    ) {}

    public function updateProfile(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            // Update user basic info
            $userFields = ['first_name', 'last_name', 'phone', 'location', 'date_of_birth'];
            $userData = array_intersect_key($data, array_flip($userFields));
            
            if (!empty($userData)) {
                $user->update($userData);
            }

            // Update or create core profile
            $profileFields = ['username', 'bio', 'website', 'social_links', 'visibility'];
            $profileData = array_intersect_key($data, array_flip($profileFields));
            
            if (!empty($profileData)) {
                $user->coreProfile()->updateOrCreate(
                    ['user_id' => $user->id],
                    $profileData
                );
            }

            // Update preferences
            if (isset($data['notification_preferences'])) {
                $user->update(['notification_preferences' => $data['notification_preferences']]);
            }

            if (isset($data['privacy_settings'])) {
                $user->update(['privacy_settings' => $data['privacy_settings']]);
            }

            return $user->fresh(['coreProfile', 'interests']);
        });
    }

    public function updateInterests(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            // Delete existing interests
            $user->interests()->delete();

            // Add new interests
            foreach ($data['interests'] as $interestData) {
                $user->interests()->create($interestData);
            }

            return $user->fresh(['interests']);
        });
    }

    public function getUserById(int $id): ?User
    {
        return User::with(['coreProfile', 'interests'])
            ->where('id', $id)
            ->where('is_active', true)
            ->first();
    }

    public function searchUsers(string $query, int $perPage = 15): LengthAwarePaginator
    {
        return User::with(['coreProfile'])
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'LIKE', "%{$query}%")
                  ->orWhere('last_name', 'LIKE', "%{$query}%")
                  ->orWhere('email', 'LIKE', "%{$query}%")
                  ->orWhereHas('coreProfile', function ($profile) use ($query) {
                      $profile->where('username', 'LIKE', "%{$query}%")
                              ->orWhere('bio', 'LIKE', "%{$query}%");
                  });
            })
            ->paginate($perPage);
    }

    public function getUserActivity(int $userId): array
    {
        $user = User::findOrFail($userId);
        
        return [
            'events_hosted' => $user->coreProfile?->events_hosted ?? 0,
            'events_attended' => $user->coreProfile?->events_attended ?? 0,
            'followers_count' => $user->followers()->count(),
            'following_count' => $user->following()->count(),
            'join_date' => $user->created_at->format('Y-m-d'),
            'last_active' => $user->last_login_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function uploadProfileImage(User $user, $imageFile): User
    {
        $uploadResult = $this->fileUploadService->uploadImage($imageFile, 'profiles');
        
        $user->update(['profile_image' => $uploadResult['url']]);
        
        return $user;
    }
}
```

### Step 5: Create User Resources (45 minutes)

**Create UserResource (app/Http/Resources/Core/UserResource.php):**
```php
<?php

namespace App\Http\Resources\Core;

use App\Http\Resources\BaseResource;

class UserResource extends BaseResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->when($this->isOwnProfile($request), $this->email),
            'phone' => $this->when($this->isOwnProfile($request), $this->phone),
            'profile_image' => $this->profile_image,
            'location' => $this->location,
            'date_of_birth' => $this->when($this->isOwnProfile($request), $this->date_of_birth?->format('Y-m-d')),
            'is_verified' => $this->is_verified,
            'is_active' => $this->is_active,
            'last_login_at' => $this->last_login_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            
            // Core profile data
            'profile' => $this->when($this->relationLoaded('coreProfile'), [
                'username' => $this->coreProfile?->username,
                'bio' => $this->coreProfile?->bio,
                'website' => $this->coreProfile?->website,
                'social_links' => $this->coreProfile?->social_links,
                'visibility' => $this->coreProfile?->visibility,
                'is_host' => $this->coreProfile?->is_host,
                'host_rating' => $this->coreProfile?->host_rating,
                'events_hosted' => $this->coreProfile?->events_hosted,
                'events_attended' => $this->coreProfile?->events_attended,
            ]),
            
            // Interests
            'interests' => $this->when($this->relationLoaded('interests'), 
                $this->interests->map(function ($interest) {
                    return [
                        'interest' => $interest->interest,
                        'category' => $interest->category,
                        'level' => $interest->level,
                    ];
                })
            ),
            
            // Roles (for own profile only)
            'roles' => $this->when(
                $this->isOwnProfile($request) && $this->relationLoaded('roles'),
                $this->roles->pluck('name')
            ),
            
            // Privacy-sensitive data
            'notification_preferences' => $this->when($this->isOwnProfile($request), $this->notification_preferences),
            'privacy_settings' => $this->when($this->isOwnProfile($request), $this->privacy_settings),
        ];
    }

    private function isOwnProfile($request): bool
    {
        return $request->user() && $request->user()->id === $this->id;
    }
}
```

### Step 6: Create API Routes (30 minutes)

**Update routes/api/core.php:**
```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Core\UserController;
use App\Http\Controllers\Api\V1\Core\UserFollowController;

/*
|--------------------------------------------------------------------------
| Core User Management Routes
|--------------------------------------------------------------------------
*/

Route::prefix('users')->group(function () {
    // Current user profile
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::put('/interests', [UserController::class, 'updateInterests']);
    
    // User search and discovery
    Route::get('/search', [UserController::class, 'search']);
    Route::get('/{id}', [UserController::class, 'show']);
    Route::get('/{id}/activity', [UserController::class, 'activity']);
    
    // Following system
    Route::post('/{id}/follow', [UserFollowController::class, 'follow']);
    Route::delete('/{id}/follow', [UserFollowController::class, 'unfollow']);
    Route::get('/{id}/followers', [UserFollowController::class, 'followers']);
    Route::get('/{id}/following', [UserFollowController::class, 'following']);
    Route::get('/{id}/is-following', [UserFollowController::class, 'isFollowing']);
});
```

## Acceptance Criteria

### User Profile Management
- [ ] Get current user profile with all related data
- [ ] Update user profile information
- [ ] Update user interests with categories and levels
- [ ] Profile image upload functionality
- [ ] Privacy settings management

### User Discovery
- [ ] Search users by name, username, email, bio
- [ ] Get user profile by ID with privacy controls
- [ ] Get user activity statistics
- [ ] Pagination support for search results

### Following System
- [ ] Follow/unfollow users
- [ ] Get followers list with pagination
- [ ] Get following list with pagination
- [ ] Check follow status between users
- [ ] Prevent self-following

### Data Privacy
- [ ] Privacy controls for profile visibility
- [ ] Sensitive data only shown to profile owner
- [ ] Respect user privacy settings
- [ ] Secure data handling

## Testing Instructions

### Manual Testing
```bash
# Get current user profile
curl -X GET http://localhost:8000/api/v1/core/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update profile
curl -X PUT http://localhost:8000/api/v1/core/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","bio":"Updated bio"}'

# Search users
curl -X GET "http://localhost:8000/api/v1/core/users/search?query=john" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Follow user
curl -X POST http://localhost:8000/api/v1/core/users/2/follow \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Unit Tests
Create tests for:
- User profile CRUD operations
- Interest management
- Following system
- Privacy controls
- Search functionality

## Next Steps
After completion, proceed to:
- Task 002: Event Management API
- Coordinate with Agent 5 on mobile UI integration
- Share user models with other agents

## Documentation
- Update API documentation with user endpoints
- Document privacy and security features
- Create user management integration guide
