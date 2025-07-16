<?php

namespace App\Http\Resources\Spark;

use App\Http\Resources\BaseResource;
use Illuminate\Http\Request;

/**
 * Character Topic Resource.
 *
 * Transform character topic data for API responses with privacy considerations
 */
class CharacterTopicResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'category' => $this->category,
            'category_display' => $this->category_display,
            'age_group' => $this->age_group,
            'learning_outcomes' => $this->learning_outcomes,
            'is_active' => $this->is_active,

            // Admin-only fields
            ...($this->whenCan('manage-character-topics', [
                'sort_order' => $this->sort_order,
            ])),

            // Statistics
            'statistics' => [
                'programs_count' => $this->programs_count,
            ],

            // Relationships - lazy loaded
            'programs' => $this->whenLoadedCollection('programs', ProgramResource::class),

            // Timestamps
            ...$this->timestamps(),
        ];
    }
}
