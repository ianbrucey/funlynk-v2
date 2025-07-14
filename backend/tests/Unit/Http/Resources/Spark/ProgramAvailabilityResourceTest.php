<?php

namespace Tests\Unit\Http\Resources\Spark;

use App\Http\Resources\Spark\ProgramAvailabilityResource;
use App\Models\Spark\ProgramAvailability;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProgramAvailabilityResourceTest extends TestCase
{
    use RefreshDatabase;

    public function testProgramAvailabilityResourceStructure(): void
    {
        $availability = ProgramAvailability::factory()->create();
        $resource = new ProgramAvailabilityResource($availability);
        $resourceArray = $resource->resolve();

        $this->assertArrayHasKey('id', $resourceArray);
        $this->assertArrayHasKey('date', $resourceArray);
        $this->assertArrayHasKey('start_time', $resourceArray);
        // Add further assertions for all expected fields
    }

    public function testProgramAvailabilityResourceLazyLoadRelationships(): void
    {
        $availability = ProgramAvailability::with('program')->factory()->create();
        $resource = new ProgramAvailabilityResource($availability);
        $resourceArray = $resource->resolve();

        $this->assertArrayHasKey('program', $resourceArray);
    }
}
