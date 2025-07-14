<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Base Resource
 * 
 * Provides common functionality for all API resources
 */
class BaseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'timestamp' => now()->toISOString(),
                'version' => '1.0',
            ],
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     *
     * @param Request $request
     * @param \Illuminate\Http\JsonResponse $response
     * @return void
     */
    public function withResponse(Request $request, $response): void
    {
        $response->header('X-Resource-Type', class_basename(static::class));
    }

    /**
     * Include timestamps in a consistent format
     *
     * @return array
     */
    protected function timestamps(): array
    {
        return [
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Include soft delete timestamp if applicable
     *
     * @return array
     */
    protected function softDeleteTimestamp(): array
    {
        if (property_exists($this->resource, 'deleted_at')) {
            return [
                'deleted_at' => $this->deleted_at?->toISOString(),
            ];
        }

        return [];
    }

    /**
     * Format a relationship conditionally
     *
     * @param string $relationship
     * @param string $resourceClass
     * @return mixed
     */
    protected function whenLoadedResource(string $relationship, string $resourceClass)
    {
        return $this->whenLoaded($relationship, function () use ($resourceClass) {
            return new $resourceClass($this->resource->$relationship);
        });
    }

    /**
     * Format a collection relationship conditionally
     *
     * @param string $relationship
     * @param string $resourceClass
     * @return mixed
     */
    protected function whenLoadedCollection(string $relationship, string $resourceClass)
    {
        return $this->whenLoaded($relationship, function () use ($resourceClass) {
            return $resourceClass::collection($this->resource->$relationship);
        });
    }

    /**
     * Include user-specific data if authenticated
     *
     * @param array $data
     * @return array
     */
    protected function whenAuthenticated(array $data): array
    {
        return auth()->check() ? $data : [];
    }

    /**
     * Include data based on user permissions
     *
     * @param string|array $permissions
     * @param array $data
     * @return array
     */
    protected function whenCan($permissions, array $data): array
    {
        if (is_string($permissions)) {
            $permissions = [$permissions];
        }

        foreach ($permissions as $permission) {
            if (auth()->user()?->can($permission)) {
                return $data;
            }
        }

        return [];
    }

    /**
     * Include data based on user roles
     *
     * @param string|array $roles
     * @param array $data
     * @return array
     */
    protected function whenHasRole($roles, array $data): array
    {
        if (is_string($roles)) {
            $roles = [$roles];
        }

        foreach ($roles as $role) {
            if (auth()->user()?->hasRole($role)) {
                return $data;
            }
        }

        return [];
    }

    /**
     * Format currency values
     *
     * @param float|null $amount
     * @param string $currency
     * @return array|null
     */
    protected function formatCurrency(?float $amount, string $currency = 'USD'): ?array
    {
        if ($amount === null) {
            return null;
        }

        return [
            'amount' => $amount,
            'currency' => $currency,
            'formatted' => '$' . number_format($amount, 2),
        ];
    }

    /**
     * Format file information
     *
     * @param string|null $path
     * @return array|null
     */
    protected function formatFile(?string $path): ?array
    {
        if (!$path) {
            return null;
        }

        return [
            'path' => $path,
            'url' => asset('storage/' . $path),
            'name' => basename($path),
        ];
    }

    /**
     * Format coordinates
     *
     * @param float|null $latitude
     * @param float|null $longitude
     * @return array|null
     */
    protected function formatCoordinates(?float $latitude, ?float $longitude): ?array
    {
        if ($latitude === null || $longitude === null) {
            return null;
        }

        return [
            'latitude' => $latitude,
            'longitude' => $longitude,
            'coordinates' => [$longitude, $latitude], // GeoJSON format
        ];
    }
}
