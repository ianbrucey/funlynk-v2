<?php

namespace App\Http\Middleware;

use App\Services\Shared\LoggingService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

/**
 * Rate Limiting Middleware.
 *
 * Implements rate limiting for API endpoints with configurable limits
 */
class RateLimitMiddleware
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
     * @param int     $maxAttempts
     * @param int     $decayMinutes
     *
     * @return Response
     */
    public function handle(Request $request, Closure $next, int $maxAttempts = 60, int $decayMinutes = 1): Response
    {
        $key = $this->resolveRequestSignature($request);
        $attempts = Cache::get($key, 0);

        if ($attempts >= $maxAttempts) {
            $this->loggingService->logSecurityEvent('rate_limit_exceeded', [
                'ip' => $request->ip(),
                'user_id' => auth()->id(),
                'endpoint' => $request->path(),
                'attempts' => $attempts,
                'limit' => $maxAttempts
            ], 'warning');

            return response()->json([
                'success' => false,
                'message' => 'Too many requests. Please try again later.',
                'retry_after' => $decayMinutes * 60
            ], 429);
        }

        // Increment attempt counter
        Cache::put($key, $attempts + 1, $decayMinutes * 60);

        $response = $next($request);

        // Add rate limit headers
        $response->headers->set('X-RateLimit-Limit', $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', max(0, $maxAttempts - $attempts - 1));
        $response->headers->set('X-RateLimit-Reset', now()->addMinutes($decayMinutes)->timestamp);

        return $response;
    }

    /**
     * Resolve request signature for rate limiting.
     *
     * @param Request $request
     *
     * @return string
     */
    protected function resolveRequestSignature(Request $request): string
    {
        $userId = auth()->id();
        $ip = $request->ip();
        $route = $request->route()?->getName() ?? $request->path();

        // Use user ID if authenticated, otherwise use IP
        $identifier = $userId ? "user:{$userId}" : "ip:{$ip}";

        return "rate_limit:{$identifier}:{$route}";
    }
}
