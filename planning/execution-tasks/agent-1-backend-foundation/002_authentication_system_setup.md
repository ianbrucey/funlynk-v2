# Task 002: Authentication System Setup
**Agent**: Backend Foundation & Infrastructure Lead  
**Estimated Time**: 4-5 hours  
**Priority**: High  
**Dependencies**: Task 001 (Laravel Project Initialization)  

## Overview
Implement comprehensive authentication system using Laravel Sanctum with role-based access control (RBAC) for Core Funlynk and Spark applications.

## Prerequisites
- Task 001 completed successfully
- Laravel Sanctum installed
- Database connection established
- Spatie Laravel Permission package installed

## Step-by-Step Implementation

### Step 1: Configure Laravel Sanctum (45 minutes)

**Publish Sanctum configuration:**
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

**Edit config/sanctum.php:**
```php
<?php

return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,localhost:3001,127.0.0.1,127.0.0.1:8000,::1',
        Sanctum::currentApplicationUrlWithPort()
    ))),

    'guard' => ['web'],

    'expiration' => null,

    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],
];
```

**Add Sanctum middleware to api routes in app/Http/Kernel.php:**
```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

### Step 2: Create User Model with Roles (60 minutes)

**Update User model (app/Models/User.php):**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'password',
        'email_verified_at',
        'phone_verified_at',
        'profile_image',
        'date_of_birth',
        'bio',
        'location',
        'interests',
        'privacy_settings',
        'notification_preferences',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'date_of_birth' => 'date',
        'interests' => 'array',
        'privacy_settings' => 'array',
        'notification_preferences' => 'array',
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relationships
    public function coreProfile()
    {
        return $this->hasOne(CoreProfile::class);
    }

    public function sparkProfile()
    {
        return $this->hasOne(SparkProfile::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getIsVerifiedAttribute()
    {
        return !is_null($this->email_verified_at);
    }
}
```

### Step 3: Create Authentication Controllers (90 minutes)

**Create Auth Controllers:**
```bash
php artisan make:controller Api/V1/Auth/LoginController
php artisan make:controller Api/V1/Auth/RegisterController
php artisan make:controller Api/V1/Auth/PasswordResetController
php artisan make:controller Api/V1/Auth/EmailVerificationController
```

**LoginController (app/Http/Controllers/Api/V1/Auth/LoginController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Auth\UserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->login($request->validated());
            
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => new UserResource($result['user']),
                    'token' => $result['token'],
                    'expires_at' => $result['expires_at'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'errors' => ['credentials' => ['Invalid credentials']],
            ], 401);
        }
    }

    public function logout(): JsonResponse
    {
        auth()->user()->currentAccessToken()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Logout successful',
        ]);
    }

    public function me(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new UserResource(auth()->user()),
        ]);
    }
}
```

### Step 4: Create Authentication Requests (45 minutes)

**Create Request classes:**
```bash
php artisan make:request Auth/LoginRequest
php artisan make:request Auth/RegisterRequest
php artisan make:request Auth/PasswordResetRequest
```

**LoginRequest (app/Http/Requests/Auth/LoginRequest.php):**
```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
            'remember' => ['boolean'],
            'device_name' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email address is required',
            'email.email' => 'Please provide a valid email address',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 8 characters',
            'device_name.required' => 'Device name is required for token generation',
        ];
    }
}
```

### Step 5: Create Authentication Service (60 minutes)

**Create AuthService (app/Services/Auth/AuthService.php):**
```php
<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AuthService
{
    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated.'],
            ]);
        }

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Create token
        $token = $user->createToken(
            $credentials['device_name'],
            ['*'],
            $credentials['remember'] ? null : now()->addDays(30)
        );

        return [
            'user' => $user->load('roles'),
            'token' => $token->plainTextToken,
            'expires_at' => $token->accessToken->expires_at,
        ];
    }

    public function register(array $data): array
    {
        $user = User::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'is_active' => true,
        ]);

        // Assign default role
        $user->assignRole('user');

        // Create token
        $token = $user->createToken($data['device_name']);

        return [
            'user' => $user->load('roles'),
            'token' => $token->plainTextToken,
            'expires_at' => $token->accessToken->expires_at,
        ];
    }

    public function resetPassword(string $email): bool
    {
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            return false;
        }

        // Generate reset token and send email
        // Implementation depends on notification system
        
        return true;
    }
}
```

### Step 6: Create Role and Permission System (45 minutes)

**Create migration for roles and permissions:**
```bash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan migrate
```

**Create seeder for roles and permissions:**
```bash
php artisan make:seeder RolePermissionSeeder
```

**RolePermissionSeeder (database/seeders/RolePermissionSeeder.php):**
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Core Funlynk Permissions
        $corePermissions = [
            'events.create',
            'events.edit',
            'events.delete',
            'events.view',
            'users.follow',
            'users.message',
            'payments.process',
        ];

        // Spark Permissions
        $sparkPermissions = [
            'schools.manage',
            'programs.manage',
            'bookings.manage',
            'students.manage',
            'reports.view',
            'permission-slips.manage',
        ];

        // Create permissions
        foreach (array_merge($corePermissions, $sparkPermissions) as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles
        $roles = [
            'super-admin' => array_merge($corePermissions, $sparkPermissions),
            'user' => ['events.create', 'events.edit', 'events.view', 'users.follow', 'users.message'],
            'spark-admin' => $sparkPermissions,
            'teacher' => ['students.manage', 'bookings.manage', 'permission-slips.manage'],
            'parent' => ['permission-slips.manage'],
        ];

        foreach ($roles as $roleName => $permissions) {
            $role = Role::create(['name' => $roleName]);
            $role->givePermissionTo($permissions);
        }
    }
}
```

### Step 7: Create Authentication Routes (30 minutes)

**Create routes/api/auth.php:**
```php
<?php

use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use Illuminate\Support\Facades\Route;

// Public authentication routes
Route::post('/login', [LoginController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/password/reset', [PasswordResetController::class, 'reset']);

// Protected authentication routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/me', [LoginController::class, 'me']);
    Route::put('/profile', [LoginController::class, 'updateProfile']);
});
```

**Include auth routes in routes/api.php:**
```php
<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(base_path('routes/api/auth.php'));
});
```

## Acceptance Criteria

### Functional Requirements
- [ ] User registration with email/password working
- [ ] User login with email/password working
- [ ] JWT token generation and validation working
- [ ] Role-based access control implemented
- [ ] Password reset functionality working
- [ ] User profile management working
- [ ] Token expiration and refresh working

### Security Requirements
- [ ] Passwords properly hashed using bcrypt
- [ ] CSRF protection enabled for stateful requests
- [ ] Rate limiting implemented on auth endpoints
- [ ] Input validation on all auth requests
- [ ] Secure token storage and transmission

### API Requirements
- [ ] Consistent JSON response format
- [ ] Proper HTTP status codes
- [ ] Error messages properly formatted
- [ ] API documentation updated

## Testing Instructions

### Manual Testing
```bash
# Test registration
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","last_name":"Doe","email":"john@example.com","password":"password123","device_name":"test"}'

# Test login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123","device_name":"test"}'

# Test protected route
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Unit Tests
Create tests for:
- User registration
- User login
- Token validation
- Role assignment
- Permission checking

## Next Steps
After completion, proceed to:
- Task 003: Database Schema Implementation
- Coordinate with all agents on authentication integration
- Share authentication patterns with frontend teams

## Documentation
- Update API documentation with authentication endpoints
- Document role and permission system
- Create authentication integration guide for frontend teams
