<?php

namespace Tests\Unit\Http\Resources\Spark;

use App\Http\Resources\Spark\CharacterTopicResource;
use App\Models\Spark\CharacterTopic;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CharacterTopicResourceTest extends TestCase
{
    use RefreshDatabase;

    public function testCharacterTopicResourceStructure(): void
    {
        $characterTopic = CharacterTopic::factory()->create();
        $resource = new CharacterTopicResource($characterTopic);
        $resourceArray = $resource->resolve();

        $this->assertArrayHasKey('id', $resourceArray);
        $this->assertArrayHasKey('name', $resourceArray);
        $this->assertArrayHasKey('slug', $resourceArray);
        // Add further assertions for all expected fields
    }

    public function testCharacterTopicResourceLazyLoadRelationships(): void
    {
        $characterTopic = CharacterTopic::with('programs')->factory()->create();
        $resource = new CharacterTopicResource($characterTopic);
        $resourceArray = $resource->resolve();

        $this->assertArrayHasKey('programs', $resourceArray);
    }
}
