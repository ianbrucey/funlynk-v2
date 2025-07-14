<?php

namespace App\Http\Middleware;

use App\Services\Shared\LoggingService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * API Middleware.
 *
 * Handles common API request processing including headers, logging, and response formatting
 */
class ApiMiddleware
{
    public function __construct(
        private LoggingService $loggingService
    ) {
    }

    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     *
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Set API headers
        $request->headers->set('Accept', 'application/json');

        // Log the API request
        $this->loggingService->logApiRequest(
            $request->method(),
            $request->fullUrl(),
            $request->except(['password', 'password_confirmation', 'current_password']),
            auth()->id()
        );

        // Process the request
        $response = $next($request);

        // Add CORS headers
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        // Add API version header
        $response->headers->set('X-API-Version', '1.0');

        // Add response time header
        if (defined('LARAVEL_START')) {
            $responseTime = round((microtime(true) - LARAVEL_START) * 1000, 2);
            $response->headers->set('X-Response-Time', $responseTime . 'ms');
        }

        // Log the API response
        $this->loggingService->logApiResponse(
            $request->method(),
            $request->fullUrl(),
            $response->getStatusCode(),
            auth()->id()
        );

        return $response;
    }
}
