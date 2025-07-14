<?php

namespace App\Http\Resources\Core;

use App\Http\Resources\BaseResourceCollection;
use Illuminate\Http\Request;

/**
 * Core Event Collection Resource
 * 
 * Transforms event collections for Core Funlynk API responses
 */
class EventCollection extends BaseResourceCollection
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
            'data' => EventResource::collection($this->collection),
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
                    'category_id' => $request->input('category_id'),
                    'status' => $request->input('status'),
                    'visibility' => $request->input('visibility'),
                    'upcoming' => $request->boolean('upcoming'),
                    'location' => [
                        'latitude' => $request->input('latitude'),
                        'longitude' => $request->input('longitude'),
                        'radius' => $request->input('radius', 50),
                    ],
                    'price_range' => [
                        'min' => $request->input('price_min'),
                        'max' => $request->input('price_max'),
                    ],
                    'date_range' => [
                        'from' => $request->input('date_from'),
                        'to' => $request->input('date_to'),
                    ],
                    'tags' => $request->input('tags', []),
                ],
            ]),
        ]);
    }
}
