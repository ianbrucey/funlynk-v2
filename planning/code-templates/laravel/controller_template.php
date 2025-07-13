<?php

namespace App\Http\Controllers\{MODULE};

use App\Http\Controllers\Controller;
use App\Http\Requests\{MODULE}\{ACTION}Request;
use App\Http\Resources\{MODULE}\{MODEL}Resource;
use App\Services\{MODULE}\{MODEL}Service;
use App\Models\{MODULE}\{MODEL};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * {MODEL} Controller
 * 
 * Handles HTTP requests for {MODEL} operations in the {MODULE} module.
 * Follows RESTful conventions and returns consistent JSON responses.
 * 
 * @package App\Http\Controllers\{MODULE}
 */
class {MODEL}Controller extends Controller
{
    /**
     * The {MODEL} service instance.
     */
    private {MODEL}Service ${modelVariable}Service;

    /**
     * Create a new controller instance.
     */
    public function __construct({MODEL}Service ${modelVariable}Service)
    {
        $this->{modelVariable}Service = ${modelVariable}Service;
        
        // Apply middleware
        $this->middleware('auth:sanctum');
        $this->middleware('throttle:60,1'); // Rate limiting
        
        // Role-based middleware (uncomment as needed)
        // $this->middleware('role:admin')->only(['destroy']);
        // $this->middleware('role:teacher,school_admin')->only(['store', 'update']);
    }

    /**
     * Display a listing of the resource.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Validate query parameters
            $validated = $request->validate([
                'page' => 'integer|min:1',
                'per_page' => 'integer|min:1|max:50',
                'search' => 'string|max:255',
                'sort_by' => 'string|in:id,name,created_at,updated_at',
                'sort_order' => 'string|in:asc,desc',
                // Add module-specific filters here
            ]);

            // Get paginated results
            ${modelVariable}s = $this->{modelVariable}Service->getPaginated(
                $validated['per_page'] ?? 15,
                $validated
            );

            return response()->json([
                'data' => {MODEL}Resource::collection(${modelVariable}s->items()),
                'meta' => [
                    'current_page' => ${modelVariable}s->currentPage(),
                    'last_page' => ${modelVariable}s->lastPage(),
                    'per_page' => ${modelVariable}s->perPage(),
                    'total' => ${modelVariable}s->total(),
                ],
                'links' => [
                    'first' => ${modelVariable}s->url(1),
                    'last' => ${modelVariable}s->url(${modelVariable}s->lastPage()),
                    'prev' => ${modelVariable}s->previousPageUrl(),
                    'next' => ${modelVariable}s->nextPageUrl(),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve {modelVariable}s',
                'error_code' => 'RETRIEVAL_FAILED',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created resource in storage.
     * 
     * @param {ACTION}Request $request
     * @return JsonResponse
     */
    public function store({ACTION}Request $request): JsonResponse
    {
        try {
            // Create the resource
            ${modelVariable} = $this->{modelVariable}Service->create($request->validated());

            return response()->json([
                'data' => new {MODEL}Resource(${modelVariable}),
                'message' => '{MODEL} created successfully',
            ], Response::HTTP_CREATED);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
                'error_code' => 'VALIDATION_ERROR',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create {modelVariable}',
                'error_code' => 'CREATION_FAILED',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     * 
     * @param {MODEL} ${modelVariable}
     * @return JsonResponse
     */
    public function show({MODEL} ${modelVariable}): JsonResponse
    {
        try {
            // Check authorization (uncomment if needed)
            // $this->authorize('view', ${modelVariable});

            // Load relationships if needed
            ${modelVariable}->load([
                // 'relationship1',
                // 'relationship2',
            ]);

            return response()->json([
                'data' => new {MODEL}Resource(${modelVariable}),
            ]);

        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'message' => 'Unauthorized to view this {modelVariable}',
                'error_code' => 'UNAUTHORIZED_ACCESS',
            ], Response::HTTP_FORBIDDEN);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve {modelVariable}',
                'error_code' => 'RETRIEVAL_FAILED',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the specified resource in storage.
     * 
     * @param {ACTION}Request $request
     * @param {MODEL} ${modelVariable}
     * @return JsonResponse
     */
    public function update({ACTION}Request $request, {MODEL} ${modelVariable}): JsonResponse
    {
        try {
            // Check authorization (uncomment if needed)
            // $this->authorize('update', ${modelVariable});

            // Update the resource
            ${modelVariable} = $this->{modelVariable}Service->update(${modelVariable}, $request->validated());

            return response()->json([
                'data' => new {MODEL}Resource(${modelVariable}),
                'message' => '{MODEL} updated successfully',
            ]);

        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'message' => 'Unauthorized to update this {modelVariable}',
                'error_code' => 'UNAUTHORIZED_ACCESS',
            ], Response::HTTP_FORBIDDEN);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
                'error_code' => 'VALIDATION_ERROR',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update {modelVariable}',
                'error_code' => 'UPDATE_FAILED',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     * 
     * @param {MODEL} ${modelVariable}
     * @return JsonResponse
     */
    public function destroy({MODEL} ${modelVariable}): JsonResponse
    {
        try {
            // Check authorization (uncomment if needed)
            // $this->authorize('delete', ${modelVariable});

            // Delete the resource
            $this->{modelVariable}Service->delete(${modelVariable});

            return response()->json([
                'message' => '{MODEL} deleted successfully',
            ], Response::HTTP_NO_CONTENT);

        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'message' => 'Unauthorized to delete this {modelVariable}',
                'error_code' => 'UNAUTHORIZED_ACCESS',
            ], Response::HTTP_FORBIDDEN);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete {modelVariable}',
                'error_code' => 'DELETION_FAILED',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Restore a soft-deleted resource.
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function restore(int $id): JsonResponse
    {
        try {
            ${modelVariable} = $this->{modelVariable}Service->restore($id);

            return response()->json([
                'data' => new {MODEL}Resource(${modelVariable}),
                'message' => '{MODEL} restored successfully',
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => '{MODEL} not found',
                'error_code' => 'RESOURCE_NOT_FOUND',
            ], Response::HTTP_NOT_FOUND);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to restore {modelVariable}',
                'error_code' => 'RESTORATION_FAILED',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get trashed (soft-deleted) resources.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function trashed(Request $request): JsonResponse
    {
        try {
            // Validate query parameters
            $validated = $request->validate([
                'page' => 'integer|min:1',
                'per_page' => 'integer|min:1|max:50',
            ]);

            ${modelVariable}s = $this->{modelVariable}Service->getTrashed(
                $validated['per_page'] ?? 15
            );

            return response()->json([
                'data' => {MODEL}Resource::collection(${modelVariable}s->items()),
                'meta' => [
                    'current_page' => ${modelVariable}s->currentPage(),
                    'last_page' => ${modelVariable}s->lastPage(),
                    'per_page' => ${modelVariable}s->perPage(),
                    'total' => ${modelVariable}s->total(),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve trashed {modelVariable}s',
                'error_code' => 'RETRIEVAL_FAILED',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Bulk operations on multiple resources.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function bulk(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'action' => 'required|string|in:delete,restore,update',
                'ids' => 'required|array|min:1',
                'ids.*' => 'integer|exists:{table_name},id',
                'data' => 'array', // For bulk updates
            ]);

            $result = $this->{modelVariable}Service->bulkOperation(
                $validated['action'],
                $validated['ids'],
                $validated['data'] ?? []
            );

            return response()->json([
                'message' => "Bulk {$validated['action']} completed successfully",
                'affected_count' => $result['affected_count'],
                'failed_count' => $result['failed_count'] ?? 0,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
                'error_code' => 'VALIDATION_ERROR',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Bulk operation failed',
                'error_code' => 'BULK_OPERATION_FAILED',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

/*
USAGE INSTRUCTIONS:

1. Replace placeholders:
   - {MODULE}: Core, Spark, or Shared
   - {MODEL}: Model name (e.g., Event, User, Program)
   - {ACTION}: Action name (e.g., Create, Update)
   - {modelVariable}: camelCase model name (e.g., event, user, program)
   - {table_name}: Database table name

2. Customize validation rules in each method based on your specific needs

3. Uncomment authorization middleware and checks as needed

4. Add module-specific methods below the standard CRUD operations

5. Update the relationships loaded in the show() method

6. Ensure corresponding Service, Request, and Resource classes exist

EXAMPLE USAGE:
- EventController in Core module
- ProgramController in Spark module
- UserController in Shared module
*/
