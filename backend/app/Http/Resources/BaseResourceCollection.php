<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

/**
 * Base Resource Collection
 * 
 * Provides common functionality for all API resource collections
 */
class BaseResourceCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @param Request $request
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
        ];
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
                'count' => $this->collection->count(),
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
        $response->header('X-Collection-Count', $this->collection->count());
    }

    /**
     * Create a paginated collection response
     *
     * @param Request $request
     * @return array
     */
    public function paginationInformation(Request $request): array
    {
        $paginated = $this->resource;

        if (method_exists($paginated, 'currentPage')) {
            return [
                'pagination' => [
                    'current_page' => $paginated->currentPage(),
                    'last_page' => $paginated->lastPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                    'from' => $paginated->firstItem(),
                    'to' => $paginated->lastItem(),
                    'has_more_pages' => $paginated->hasMorePages(),
                    'links' => [
                        'first' => $paginated->url(1),
                        'last' => $paginated->url($paginated->lastPage()),
                        'prev' => $paginated->previousPageUrl(),
                        'next' => $paginated->nextPageUrl(),
                    ],
                ],
            ];
        }

        return [];
    }
}
