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
use Symfony\Component\HttpKernel\Exception\HttpException;
use App\Services\Shared\LoggingService;
use Throwable;

/**
 * Application Exception Handler
 *
 * Handles exceptions and provides consistent API error responses
 */
class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            if (app()->bound(LoggingService::class)) {
                app(LoggingService::class)->logError($e);
            }
        });
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param Request $request
     * @param Throwable $e
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function render($request, Throwable $e)
    {
        if ($request->expectsJson()) {
            return $this->handleApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    /**
     * Handle API exceptions with consistent JSON responses
     *
     * @param Request $request
     * @param Throwable $e
     * @return JsonResponse
     */
    private function handleApiException(Request $request, Throwable $e): JsonResponse
    {
        $statusCode = 500;
        $message = 'Internal server error';
        $errors = [];

        if ($e instanceof ValidationException) {
            $statusCode = 422;
            $message = 'Validation failed';
            $errors = $e->errors();
        } elseif ($e instanceof AuthenticationException) {
            $statusCode = 401;
            $message = 'Unauthenticated';
        } elseif ($e instanceof AuthorizationException) {
            $statusCode = 403;
            $message = 'Forbidden';
        } elseif ($e instanceof ModelNotFoundException) {
            $statusCode = 404;
            $message = 'Resource not found';
        } elseif ($e instanceof NotFoundHttpException) {
            $statusCode = 404;
            $message = 'Endpoint not found';
        } elseif ($e instanceof MethodNotAllowedHttpException) {
            $statusCode = 405;
            $message = 'Method not allowed';
        } elseif ($e instanceof HttpException) {
            $statusCode = $e->getStatusCode();
            $message = $e->getMessage() ?: 'HTTP error';
        } elseif (config('app.debug')) {
            $message = $e->getMessage();
            $errors = [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => explode("\n", $e->getTraceAsString())
            ];
        }

        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => now()->toISOString(),
        ], $statusCode);
    }
}
