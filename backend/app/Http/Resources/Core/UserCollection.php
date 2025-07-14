<?php

namespace App\Http\Resources\Core;

use App\Http\Resources\BaseResourceCollection;
use Illuminate\Http\Request;

/**
 * Core User Collection Resource
 * 
 * Transforms user collections for Core Funlynk API responses
 */
class UserCollection extends BaseResourceCollection
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
            'data' => UserResource::collection($this->collection),
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
        return array_merge(parent::with($request), [
            'meta' => array_merge(parent::with($request)['meta'], [
                'search_query' => $request->input('query'),
                'filters' => [
                    'interests' => $request->input('interests', []),
                ],
            ]),
        ]);
    }
}
