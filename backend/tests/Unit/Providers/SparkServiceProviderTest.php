<?php

namespace Tests\Unit\Providers;

use App\Services\Spark\CharacterTopicService;
use App\Services\Spark\ProgramService;
use Tests\TestCase;

class SparkServiceProviderTest extends TestCase
{
    /**
     * Test if ProgramService is resolved by the container.
     */
    public function testProgramServiceIsResolved(): void
    {
        $service = app(ProgramService::class);
        $this->assertInstanceOf(ProgramService::class, $service);
    }

    /**
     * Test if CharacterTopicService is resolved by the container.
     */
    public function testCharacterTopicServiceIsResolved(): void
    {
        $service = app(CharacterTopicService::class);
        $this->assertInstanceOf(CharacterTopicService::class, $service);
    }

    /**
     * Test if both services are singletons (same instance returned).
     */
    public function testServicesAreSingletons(): void
    {
        $service1 = app(ProgramService::class);
        $service2 = app(ProgramService::class);
        $this->assertSame($service1, $service2);

        $service3 = app(CharacterTopicService::class);
        $service4 = app(CharacterTopicService::class);
        $this->assertSame($service3, $service4);
    }
}
