<?php

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Tests\Traits\TestHelpers;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication, TestHelpers, RefreshDatabase;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        $this->createDefaultRoles();
    }
}
