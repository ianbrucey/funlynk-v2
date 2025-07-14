<?php

namespace App\Services\Shared;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Cache Service.
 *
 * Centralized caching service with consistent patterns and error handling
 */
class CacheService
{
    private const DEFAULT_TTL = 3600; // 1 hour
    private const LONG_TTL = 86400; // 24 hours
    private const SHORT_TTL = 300; // 5 minutes

    public function __construct(
        private LoggingService $loggingService
    ) {
    }

    /**
     * Get cached value or execute callback and cache result.
     *
     * @param string   $key
     * @param callable $callback
     * @param int|null $ttl
     *
     * @return mixed
     */
    public function remember(string $key, callable $callback, ?int $ttl = null): mixed
    {
        $ttl = $ttl ?? self::DEFAULT_TTL;

        try {
            return Cache::remember($key, $ttl, $callback);
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'cache_key' => $key,
                'operation' => 'remember'
            ]);

            // Fallback: execute callback without caching
            return $callback();
        }
    }

    /**
     * Get value from cache.
     *
     * @param string $key
     * @param mixed  $default
     *
     * @return mixed
     */
    public function get(string $key, mixed $default = null): mixed
    {
        try {
            return Cache::get($key, $default);
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'cache_key' => $key,
                'operation' => 'get'
            ]);

            return $default;
        }
    }

    /**
     * Store value in cache.
     *
     * @param string   $key
     * @param mixed    $value
     * @param int|null $ttl
     *
     * @return bool
     */
    public function put(string $key, mixed $value, ?int $ttl = null): bool
    {
        $ttl = $ttl ?? self::DEFAULT_TTL;

        try {
            return Cache::put($key, $value, $ttl);
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'cache_key' => $key,
                'operation' => 'put'
            ]);

            return false;
        }
    }

    /**
     * Store value in cache forever.
     *
     * @param string $key
     * @param mixed  $value
     *
     * @return bool
     */
    public function forever(string $key, mixed $value): bool
    {
        try {
            return Cache::forever($key, $value);
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'cache_key' => $key,
                'operation' => 'forever'
            ]);

            return false;
        }
    }

    /**
     * Remove value from cache.
     *
     * @param string $key
     *
     * @return bool
     */
    public function forget(string $key): bool
    {
        try {
            return Cache::forget($key);
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'cache_key' => $key,
                'operation' => 'forget'
            ]);

            return false;
        }
    }

    /**
     * Check if key exists in cache.
     *
     * @param string $key
     *
     * @return bool
     */
    public function has(string $key): bool
    {
        try {
            return Cache::has($key);
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'cache_key' => $key,
                'operation' => 'has'
            ]);

            return false;
        }
    }

    /**
     * Increment cached value.
     *
     * @param string $key
     * @param int    $value
     *
     * @return int|bool
     */
    public function increment(string $key, int $value = 1): int|bool
    {
        try {
            return Cache::increment($key, $value);
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'cache_key' => $key,
                'operation' => 'increment'
            ]);

            return false;
        }
    }

    /**
     * Decrement cached value.
     *
     * @param string $key
     * @param int    $value
     *
     * @return int|bool
     */
    public function decrement(string $key, int $value = 1): int|bool
    {
        try {
            return Cache::decrement($key, $value);
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'cache_key' => $key,
                'operation' => 'decrement'
            ]);

            return false;
        }
    }

    /**
     * Cache user-specific data.
     *
     * @param int      $userId
     * @param string   $key
     * @param mixed    $value
     * @param int|null $ttl
     *
     * @return bool
     */
    public function putUserData(int $userId, string $key, mixed $value, ?int $ttl = null): bool
    {
        $cacheKey = $this->getUserCacheKey($userId, $key);

        return $this->put($cacheKey, $value, $ttl);
    }

    /**
     * Get user-specific cached data.
     *
     * @param int    $userId
     * @param string $key
     * @param mixed  $default
     *
     * @return mixed
     */
    public function getUserData(int $userId, string $key, mixed $default = null): mixed
    {
        $cacheKey = $this->getUserCacheKey($userId, $key);

        return $this->get($cacheKey, $default);
    }

    /**
     * Forget user-specific cached data.
     *
     * @param int    $userId
     * @param string $key
     *
     * @return bool
     */
    public function forgetUserData(int $userId, string $key): bool
    {
        $cacheKey = $this->getUserCacheKey($userId, $key);

        return $this->forget($cacheKey);
    }

    /**
     * Clear all cache for a user.
     *
     * @param int $userId
     *
     * @return bool
     */
    public function clearUserCache(int $userId): bool
    {
        try {
            $pattern = "user:{$userId}:*";
            $keys = Cache::getRedis()->keys($pattern);

            if (!empty($keys)) {
                Cache::getRedis()->del($keys);
            }

            Log::info('User cache cleared', ['user_id' => $userId, 'keys_cleared' => count($keys)]);

            return true;
        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'user_id' => $userId,
                'operation' => 'clearUserCache'
            ]);

            return false;
        }
    }

    /**
     * Cache API response.
     *
     * @param string $endpoint
     * @param array  $params
     * @param mixed  $response
     * @param int    $ttl
     *
     * @return bool
     */
    public function cacheApiResponse(string $endpoint, array $params, mixed $response, int $ttl = self::SHORT_TTL): bool
    {
        $key = $this->getApiCacheKey($endpoint, $params);

        return $this->put($key, $response, $ttl);
    }

    /**
     * Get cached API response.
     *
     * @param string $endpoint
     * @param array  $params
     *
     * @return mixed
     */
    public function getCachedApiResponse(string $endpoint, array $params): mixed
    {
        $key = $this->getApiCacheKey($endpoint, $params);

        return $this->get($key);
    }

    /**
     * Cache database query result.
     *
     * @param string $query
     * @param array  $bindings
     * @param mixed  $result
     * @param int    $ttl
     *
     * @return bool
     */
    public function cacheQueryResult(string $query, array $bindings, mixed $result, int $ttl = self::DEFAULT_TTL): bool
    {
        $key = $this->getQueryCacheKey($query, $bindings);

        return $this->put($key, $result, $ttl);
    }

    /**
     * Get cached query result.
     *
     * @param string $query
     * @param array  $bindings
     *
     * @return mixed
     */
    public function getCachedQueryResult(string $query, array $bindings): mixed
    {
        $key = $this->getQueryCacheKey($query, $bindings);

        return $this->get($key);
    }

    /**
     * Generate user cache key.
     *
     * @param int    $userId
     * @param string $key
     *
     * @return string
     */
    private function getUserCacheKey(int $userId, string $key): string
    {
        return "user:{$userId}:{$key}";
    }

    /**
     * Generate API cache key.
     *
     * @param string $endpoint
     * @param array  $params
     *
     * @return string
     */
    private function getApiCacheKey(string $endpoint, array $params): string
    {
        $paramHash = md5(serialize($params));

        return "api:{$endpoint}:{$paramHash}";
    }

    /**
     * Generate query cache key.
     *
     * @param string $query
     * @param array  $bindings
     *
     * @return string
     */
    private function getQueryCacheKey(string $query, array $bindings): string
    {
        $hash = md5($query . serialize($bindings));

        return "query:{$hash}";
    }
}
