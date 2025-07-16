<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Shared\LoggingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Base API Controller.
 *
 * Provides consistent response formats and logging for all API controllers
 */
class BaseApiController extends Controller
{
    protected LoggingService $loggingService;

    public function __construct(LoggingService $loggingService)
    {
        $this->loggingService = $loggingService;
    }

    /**
     * Success response with data.
     *
     * @param mixed  $data
     * @param string $message
     * @param int    $statusCode
     *
     * @return JsonResponse
     */
    protected function successResponse($data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
            'timestamp' => now()->toISOString(),
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Error response.
     *
     * @param string $message
     * @param int    $statusCode
     * @param array  $errors
     *
     * @return JsonResponse
     */
    protected function errorResponse(string $message = 'Error', $data = null, int $status = 400): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
            'timestamp' => now()->toISOString(),
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $status);
    }

    /**
     * Validation error response.
     *
     * @param array $errors
     *
     * @return JsonResponse
     */
    protected function validationErrorResponse(array $errors): JsonResponse
    {
        return $this->errorResponse('Validation failed', ['errors' => $errors], 422);
    }

    /**
     * Not found response.
     *
     * @param string $message
     *
     * @return JsonResponse
     */
    protected function notFoundResponse(string $message = 'Resource not found'): JsonResponse
    {
        return $this->errorResponse($message, 404);
    }

    /**
     * Unauthorized response.
     *
     * @param string $message
     *
     * @return JsonResponse
     */
    protected function unauthorizedResponse(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->errorResponse($message, 401);
    }

    /**
     * Forbidden response.
     *
     * @param string $message
     *
     * @return JsonResponse
     */
    protected function forbiddenResponse(string $message = 'Forbidden'): JsonResponse
    {
        return $this->errorResponse($message, 403);
    }

    /**
     * Server error response.
     *
     * @param string $message
     *
     * @return JsonResponse
     */
    protected function serverErrorResponse(string $message = 'Internal server error'): JsonResponse
    {
        return $this->errorResponse($message, 500);
    }

    /**
     * Paginated response.
     *
     * @param LengthAwarePaginator $paginator
     * @param string               $message
     *
     * @return JsonResponse
     */
    protected function paginatedResponse(LengthAwarePaginator $paginator, string $message = 'Success'): JsonResponse
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
                'links' => [
                    'first' => $paginator->url(1),
                    'last' => $paginator->url($paginator->lastPage()),
                    'prev' => $paginator->previousPageUrl(),
                    'next' => $paginator->nextPageUrl(),
                ],
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Collection response for multiple items.
     *
     * @param mixed  $collection
     * @param string $message
     * @param array  $meta
     *
     * @return JsonResponse
     */
    protected function collectionResponse($collection, string $message = 'Success', array $meta = []): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $collection,
            'timestamp' => now()->toISOString(),
        ];

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response);
    }

    /**
     * Created response for resource creation.
     *
     * @param mixed  $data
     * @param string $message
     *
     * @return JsonResponse
     */
    protected function createdResponse($data = null, string $message = 'Resource created successfully'): JsonResponse
    {
        return $this->successResponse($data, $message, 201);
    }

    /**
     * Updated response for resource updates.
     *
     * @param mixed  $data
     * @param string $message
     *
     * @return JsonResponse
     */
    protected function updatedResponse($data = null, string $message = 'Resource updated successfully'): JsonResponse
    {
        return $this->successResponse($data, $message, 200);
    }

    /**
     * Deleted response for resource deletion.
     *
     * @param string $message
     *
     * @return JsonResponse
     */
    protected function deletedResponse(string $message = 'Resource deleted successfully'): JsonResponse
    {
        return $this->successResponse(null, $message, 200);
    }

    /**
     * Log API request.
     *
     * @param Request $request
     */
    protected function logRequest(Request $request): void
    {
        $this->loggingService->logApiRequest(
            $request->method(),
            $request->fullUrl(),
            $request->except(['password', 'password_confirmation', 'current_password']),
            auth()->id()
        );
    }

    /**
     * Log API response.
     *
     * @param Request $request
     * @param int     $statusCode
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

    /**
     * Handle common API operations with logging.
     *
     * @param Request  $request
     * @param callable $operation
     *
     * @return JsonResponse
     */
    protected function handleApiOperation(Request $request, callable $operation): JsonResponse
    {
        $this->logRequest($request);

        try {
            $result = $operation();
            $statusCode = $result->getStatusCode();
            $this->logResponse($request, $statusCode);

            return $result;
        } catch (\Exception $e) {
            $this->loggingService->logError($e, [
                'request_url' => $request->fullUrl(),
                'request_method' => $request->method(),
                'user_id' => auth()->id()
            ]);

            $this->logResponse($request, 500);

            return $this->serverErrorResponse('An error occurred while processing your request');
        }
    }
}
