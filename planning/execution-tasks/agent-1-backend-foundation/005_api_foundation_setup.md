# Task 005: API Foundation Setup
**Agent**: Backend Foundation & Infrastructure Lead  
**Estimated Time**: 3-4 hours  
**Priority**: High  
**Dependencies**: Task 004 (Shared Services Implementation)  

## Overview
Establish the API foundation with consistent response formats, error handling, base controllers, middleware, and API documentation structure.

## Prerequisites
- Task 004 completed successfully
- Shared services implemented
- Authentication system working
- Rate limiting middleware created

## Step-by-Step Implementation

### Step 1: Create Base API Controller (45 minutes)

**Create BaseApiController (app/Http/Controllers/Api/BaseApiController.php):**
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Shared\LoggingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BaseApiController extends Controller
{
    protected LoggingService $loggingService;

    public function __construct(LoggingService $loggingService)
    {
        $this->loggingService = $loggingService;
    }

    /**
     * Success response with data
     */
    protected function successResponse($data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Error response
     */
    protected function errorResponse(string $message = 'Error', int $statusCode = 400, array $errors = []): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Validation error response
     */
    protected function validationErrorResponse(array $errors): JsonResponse
    {
        return $this->errorResponse('Validation failed', 422, $errors);
    }

    /**
     * Not found response
     */
    protected function notFoundResponse(string $message = 'Resource not found'): JsonResponse
    {
        return $this->errorResponse($message, 404);
    }

    /**
     * Unauthorized response
     */
    protected function unauthorizedResponse(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->errorResponse($message, 401);
    }

    /**
     * Forbidden response
     */
    protected function forbiddenResponse(string $message = 'Forbidden'): JsonResponse
    {
        return $this->errorResponse($message, 403);
    }

    /**
     * Paginated response
     */
    protected function paginatedResponse($paginator, string $message = 'Success'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'has_more_pages' => $paginator->hasMorePages(),
            ],
        ]);
    }

    /**
     * Log API request
     */
    protected function logRequest(Request $request): void
    {
        $this->loggingService->logApiRequest(
            $request->method(),
            $request->fullUrl(),
            $request->except(['password', 'password_confirmation']),
            auth()->id()
        );
    }

    /**
     * Log API response
     */
    protected function logResponse(Request $request, int $statusCode): void
    {
        $this->loggingService->logApiResponse(
            $request->method(),
            $request->fullUrl(),
            $statusCode,
            auth()->id()
        );
    }
}
```

### Step 2: Create API Exception Handler (60 minutes)

**Update app/Exceptions/Handler.php:**
```php
<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use App\Services\Shared\LoggingService;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            if (app()->bound(LoggingService::class)) {
                app(LoggingService::class)->logError('Exception occurred', $e);
            }
        });
    }

    public function render($request, Throwable $e)
    {
        if ($request->expectsJson()) {
            return $this->handleApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    private function handleApiException(Request $request, Throwable $e): JsonResponse
    {
        if ($e instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        if ($e instanceof AuthenticationException) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        if ($e instanceof AuthorizationException) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden',
            ], 403);
        }

        if ($e instanceof ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Resource not found',
            ], 404);
        }

        if ($e instanceof NotFoundHttpException) {
            return response()->json([
                'success' => false,
                'message' => 'Endpoint not found',
            ], 404);
        }

        if ($e instanceof MethodNotAllowedHttpException) {
            return response()->json([
                'success' => false,
                'message' => 'Method not allowed',
            ], 405);
        }

        // Generic server error
        $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
        $message = config('app.debug') ? $e->getMessage() : 'Internal server error';

        return response()->json([
            'success' => false,
            'message' => $message,
        ], $statusCode);
    }
}
```

### Step 3: Create API Middleware (45 minutes)

**Create ApiMiddleware (app/Http/Middleware/ApiMiddleware.php):**
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\Shared\LoggingService;
use Symfony\Component\HttpFoundation\Response;

class ApiMiddleware
{
    public function __construct(
        private LoggingService $loggingService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        // Set JSON response headers
        $request->headers->set('Accept', 'application/json');
        
        // Log the request
        $this->loggingService->logApiRequest(
            $request->method(),
            $request->fullUrl(),
            $request->except(['password', 'password_confirmation']),
            auth()->id()
        );

        $response = $next($request);

        // Add API headers
        $response->headers->set('X-API-Version', 'v1');
        $response->headers->set('X-Powered-By', 'Funlynk API');

        // Log the response
        $this->loggingService->logApiResponse(
            $request->method(),
            $request->fullUrl(),
            $response->getStatusCode(),
            auth()->id()
        );

        return $response;
    }
}
```

**Register middleware in app/Http/Kernel.php:**
```php
protected $middlewareGroups = [
    'api' => [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        \App\Http\Middleware\ApiMiddleware::class,
        'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
];

protected $routeMiddleware = [
    // ... existing middleware
    'rate_limit' => \App\Http\Middleware\RateLimitMiddleware::class,
];
```

### Step 4: Create API Resource Base Classes (45 minutes)

**Create BaseResource (app/Http/Resources/BaseResource.php):**
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BaseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return parent::toArray($request);
    }

    /**
     * Get additional data that should be returned with the resource array.
     */
    public function with($request): array
    {
        return [
            'meta' => [
                'timestamp' => now()->toISOString(),
                'version' => 'v1',
            ],
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     */
    public function withResponse($request, $response): void
    {
        $response->header('X-Resource-Type', class_basename(static::class));
    }
}
```

**Create BaseCollection (app/Http/Resources/BaseCollection.php):**
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class BaseCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     */
    public function toArray($request): array
    {
        return [
            'data' => $this->collection,
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     */
    public function with($request): array
    {
        return [
            'meta' => [
                'timestamp' => now()->toISOString(),
                'version' => 'v1',
                'count' => $this->collection->count(),
            ],
        ];
    }
}
```

### Step 5: Create API Route Structure (30 minutes)

**Update routes/api.php:**
```php
<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Health check
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
            'message' => 'API is healthy',
            'data' => [
                'version' => 'v1',
                'timestamp' => now()->toISOString(),
                'environment' => app()->environment(),
            ],
        ]);
    });

    // Authentication routes
    Route::prefix('auth')->group(base_path('routes/api/auth.php'));

    // Protected routes
    Route::middleware(['auth:sanctum'])->group(function () {
        // Core Funlynk routes
        Route::prefix('core')->group(base_path('routes/api/core.php'));
        
        // Spark routes
        Route::prefix('spark')->group(base_path('routes/api/spark.php'));
    });
});

// Fallback route for undefined API endpoints
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'API endpoint not found',
    ], 404);
});
```

**Create placeholder route files:**
```bash
touch routes/api/core.php
touch routes/api/spark.php
```

**Add basic structure to routes/api/core.php:**
```php
<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Core Funlynk API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('users')->group(function () {
    // User routes will be added by Agent 2
});

Route::prefix('events')->group(function () {
    // Event routes will be added by Agent 2
});

Route::prefix('social')->group(function () {
    // Social feature routes will be added by Agent 2
});
```

**Add basic structure to routes/api/spark.php:**
```php
<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Spark API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('schools')->group(function () {
    // School routes will be added by Agent 3
});

Route::prefix('programs')->group(function () {
    // Program routes will be added by Agent 3
});

Route::prefix('bookings')->group(function () {
    // Booking routes will be added by Agent 3
});

Route::prefix('permission-slips')->group(function () {
    // Permission slip routes will be added by Agent 3
});
```

### Step 6: Create API Documentation Structure (30 minutes)

**Install Laravel API Documentation:**
```bash
composer require darkaonline/l5-swagger
php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"
```

**Configure Swagger in config/l5-swagger.php:**
```php
'default' => 'default',
'documentations' => [
    'default' => [
        'api' => [
            'title' => 'Funlynk API Documentation',
            'version' => '1.0.0',
            'description' => 'API documentation for Funlynk Core and Spark applications',
        ],
        'routes' => [
            'api' => 'api/documentation',
        ],
        'paths' => [
            'use_absolute_path' => env('L5_SWAGGER_USE_ABSOLUTE_PATH', true),
            'docs_json' => 'api-docs.json',
            'docs_yaml' => 'api-docs.yaml',
            'format_to_use_for_docs' => env('L5_FORMAT_TO_USE_FOR_DOCS', 'json'),
            'annotations' => [
                base_path('app'),
            ],
        ],
    ],
],
```

**Create base API documentation annotations in app/Http/Controllers/Api/BaseApiController.php:**
```php
/**
 * @OA\Info(
 *     title="Funlynk API",
 *     version="1.0.0",
 *     description="API documentation for Funlynk Core and Spark applications",
 *     @OA\Contact(
 *         email="api@funlynk.com"
 *     )
 * )
 * 
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="API Server"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */
```

### Step 7: Create API Testing Utilities (30 minutes)

**Create ApiTestCase (tests/Feature/ApiTestCase.php):**
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

abstract class ApiTestCase extends TestCase
{
    protected function authenticateUser(?User $user = null): User
    {
        $user = $user ?: User::factory()->create();
        Sanctum::actingAs($user);
        return $user;
    }

    protected function assertApiResponse(array $response, bool $success = true): void
    {
        $this->assertArrayHasKey('success', $response);
        $this->assertEquals($success, $response['success']);
        $this->assertArrayHasKey('message', $response);
    }

    protected function assertApiValidationError(array $response, array $fields = []): void
    {
        $this->assertApiResponse($response, false);
        $this->assertArrayHasKey('errors', $response);
        
        foreach ($fields as $field) {
            $this->assertArrayHasKey($field, $response['errors']);
        }
    }

    protected function assertApiPaginatedResponse(array $response): void
    {
        $this->assertApiResponse($response);
        $this->assertArrayHasKey('data', $response);
        $this->assertArrayHasKey('pagination', $response);
        
        $pagination = $response['pagination'];
        $this->assertArrayHasKey('current_page', $pagination);
        $this->assertArrayHasKey('last_page', $pagination);
        $this->assertArrayHasKey('per_page', $pagination);
        $this->assertArrayHasKey('total', $pagination);
    }
}
```

## Acceptance Criteria

### Base API Controller
- [ ] Consistent response format methods
- [ ] Error handling methods
- [ ] Pagination support
- [ ] Logging integration

### Exception Handling
- [ ] JSON responses for API requests
- [ ] Proper HTTP status codes
- [ ] Validation error formatting
- [ ] Authentication/authorization errors

### Middleware
- [ ] API request/response logging
- [ ] JSON headers enforcement
- [ ] Rate limiting integration
- [ ] CORS handling

### Route Structure
- [ ] Versioned API routes
- [ ] Organized route files
- [ ] Health check endpoint
- [ ] Fallback route

### Documentation
- [ ] Swagger/OpenAPI setup
- [ ] Base documentation structure
- [ ] Authentication documentation
- [ ] API testing utilities

## Testing Instructions

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:8000/api/v1/health

# Test authentication
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password","device_name":"test"}'

# Test protected endpoint
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test rate limiting
for i in {1..70}; do curl http://localhost:8000/api/v1/health; done

# Test 404 handling
curl http://localhost:8000/api/v1/nonexistent

# Generate API documentation
php artisan l5-swagger:generate
```

### Automated Testing
```bash
# Run API tests
php artisan test --filter=ApiTestCase

# Test exception handling
php artisan test tests/Feature/ExceptionHandlingTest.php
```

## Next Steps
After completion:
- Share API foundation with Agent 2 and Agent 3
- Coordinate on API contract implementation
- Begin integration with frontend teams
- Document API standards and patterns

## Documentation
- Complete API documentation setup
- Create API development guidelines
- Document response formats and error codes
- Create integration examples for frontend teams

## Handoff Notes
The API foundation is now ready for:
1. **Agent 2**: Core Funlynk API development using base controllers and patterns
2. **Agent 3**: Spark API development using established patterns
3. **Frontend Agents**: Integration with consistent API responses
4. **All Agents**: Shared services and logging capabilities

Key files to reference:
- `app/Http/Controllers/Api/BaseApiController.php` - Base controller patterns
- `app/Services/Shared/` - Shared services
- `routes/api/` - Route organization
- API documentation at `/api/documentation`
