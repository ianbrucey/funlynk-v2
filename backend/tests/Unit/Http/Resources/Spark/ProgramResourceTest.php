<?php

namespace Tests\Unit\Http\Resources\Spark;

use App\Http\Resources\Spark\ProgramResource;
use App\Models\Spark\Program;
use App\Models\Spark\CharacterTopic;
use App\Models\Spark\ProgramAvailability;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class ProgramResourceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create permissions for testing
        Permission::create(['name' => 'view-program-analytics']);
        Permission::create(['name' => 'manage-character-topics']);
        
        // Create roles
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'user']);
    }

    public function testProgramResourceStructure(): void
    {
        $program = Program::factory()->create([
            'title' => 'Test Program',
            'description' => 'This is a test program',
            'grade_levels' => ['1', '2', '3'],
            'duration_minutes' => 60,
            'max_students' => 25,
            'price_per_student' => 10.00,
            'character_topics' => ['Respect', 'Responsibility'],
            'learning_objectives' => ['Objective 1', 'Objective 2'],
            'materials_needed' => ['Material 1', 'Material 2'],
            'special_requirements' => 'None',
            'resource_files' => ['file1.pdf', 'file2.pdf'],
            'is_active' => true,
        ]);
        
        $resource = new ProgramResource($program);
        $resourceArray = $resource->resolve();

        // Test basic structure
        $this->assertArrayHasKey('id', $resourceArray);
        $this->assertArrayHasKey('title', $resourceArray);
        $this->assertArrayHasKey('description', $resourceArray);
        $this->assertArrayHasKey('is_active', $resourceArray);
        $this->assertArrayHasKey('grade_levels', $resourceArray);
        $this->assertArrayHasKey('formatted_grade_levels', $resourceArray);
        $this->assertArrayHasKey('duration_minutes', $resourceArray);
        $this->assertArrayHasKey('formatted_duration', $resourceArray);
        $this->assertArrayHasKey('max_students', $resourceArray);
        $this->assertArrayHasKey('price_per_student', $resourceArray);
        $this->assertArrayHasKey('formatted_price', $resourceArray);
        $this->assertArrayHasKey('character_topics', $resourceArray);
        $this->assertArrayHasKey('formatted_character_topics', $resourceArray);
        $this->assertArrayHasKey('learning_objectives', $resourceArray);
        $this->assertArrayHasKey('materials_needed', $resourceArray);
        $this->assertArrayHasKey('special_requirements', $resourceArray);
        $this->assertArrayHasKey('statistics', $resourceArray);
        $this->assertArrayHasKey('created_at', $resourceArray);
        $this->assertArrayHasKey('updated_at', $resourceArray);
        
        // Test values
        $this->assertEquals('Test Program', $resourceArray['title']);
        $this->assertEquals('This is a test program', $resourceArray['description']);
        $this->assertTrue($resourceArray['is_active']);
        $this->assertEquals(['1', '2', '3'], $resourceArray['grade_levels']);
        $this->assertEquals(60, $resourceArray['duration_minutes']);
        $this->assertEquals(25, $resourceArray['max_students']);
        $this->assertEquals(10.00, $resourceArray['price_per_student']);
        $this->assertEquals(['Respect', 'Responsibility'], $resourceArray['character_topics']);
        $this->assertEquals(['Objective 1', 'Objective 2'], $resourceArray['learning_objectives']);
        $this->assertEquals(['Material 1', 'Material 2'], $resourceArray['materials_needed']);
        $this->assertEquals('None', $resourceArray['special_requirements']);
        
        // Test statistics structure
        $this->assertArrayHasKey('booking_count', $resourceArray['statistics']);
        $this->assertArrayHasKey('confirmed_booking_count', $resourceArray['statistics']);
        $this->assertArrayHasKey('available_slots_count', $resourceArray['statistics']);
    }

    public function testProgramResourceWithoutAuthentication(): void
    {
        $program = Program::factory()->create([
            'resource_files' => ['file1.pdf', 'file2.pdf'],
        ]);
        
        $resource = new ProgramResource($program);
        $resourceArray = $resource->resolve();

        // Resource files should not be present without authentication
        $this->assertArrayNotHasKey('resource_files', $resourceArray);
    }

    public function testProgramResourceWithAuthentication(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        
        $program = Program::factory()->create([
            'resource_files' => ['file1.pdf', 'file2.pdf'],
        ]);
        
        $resource = new ProgramResource($program);
        $resourceArray = $resource->resolve();

        // Resource files should be present with authentication
        $this->assertArrayHasKey('resource_files', $resourceArray);
        $this->assertEquals(['file1.pdf', 'file2.pdf'], $resourceArray['resource_files']);
    }

    public function testProgramResourceWithAdminPermissions(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view-program-analytics');
        $this->actingAs($user);
        
        $program = Program::factory()->create();
        
        $resource = new ProgramResource($program);
        $resourceArray = $resource->resolve();

        // Admin-only statistics should be present
        $this->assertArrayHasKey('total_participants', $resourceArray['statistics']);
        $this->assertArrayHasKey('revenue', $resourceArray['statistics']);
    }

    public function testProgramResourceLazyLoadRelationships(): void
    {
        $program = Program::factory()->create();
        
        // Create related character topics
        $characterTopic = CharacterTopic::factory()->create();
        $program->characterTopics()->attach($characterTopic);
        
        // Create availability
        $availability = ProgramAvailability::factory()->create(['program_id' => $program->id]);
        
        // Load relationships
        $program->load('characterTopics', 'availability');
        
        $resource = new ProgramResource($program);
        $resourceArray = $resource->resolve();

        $this->assertArrayHasKey('character_topics_rel', $resourceArray);
        $this->assertArrayHasKey('availability', $resourceArray);
        $this->assertNotNull($resourceArray['character_topics_rel']);
        $this->assertNotNull($resourceArray['availability']);
    }

    public function testProgramResourceJsonSnapshot(): void
    {
        $program = Program::factory()->create([
            'title' => 'Character Building Workshop',
            'description' => 'A comprehensive program for character development',
            'grade_levels' => ['3', '4', '5'],
            'duration_minutes' => 90,
            'max_students' => 30,
            'price_per_student' => 15.00,
            'character_topics' => ['Respect', 'Responsibility', 'Integrity'],
            'learning_objectives' => ['Understand character traits', 'Practice respectful behavior'],
            'materials_needed' => ['Worksheets', 'Markers', 'Flipchart'],
            'special_requirements' => 'Projector needed',
            'is_active' => true,
        ]);
        
        $resource = new ProgramResource($program);
        $resourceArray = $resource->resolve();
        
        // Create expected JSON structure for comparison
        $expectedStructure = [
            'id' => $program->id,
            'title' => 'Character Building Workshop',
            'description' => 'A comprehensive program for character development',
            'is_active' => true,
            'grade_levels' => ['3', '4', '5'],
            'formatted_grade_levels' => '3, 4, 5',
            'duration_minutes' => 90,
            'formatted_duration' => '1 hour 30 minutes',
            'max_students' => 30,
            'price_per_student' => 15.00,
            'formatted_price' => '$15.00 per student',
            'character_topics' => ['Respect', 'Responsibility', 'Integrity'],
            'formatted_character_topics' => 'Respect, Responsibility, Integrity',
            'learning_objectives' => ['Understand character traits', 'Practice respectful behavior'],
            'materials_needed' => ['Worksheets', 'Markers', 'Flipchart'],
            'special_requirements' => 'Projector needed',
        ];
        
        // Assert key fields match expected structure
        foreach ($expectedStructure as $key => $value) {
            $this->assertArrayHasKey($key, $resourceArray);
            $this->assertEquals($value, $resourceArray[$key]);
        }
    }
}

