<?php

namespace Tests\Unit\Spark;

use App\Models\Spark\Program;
use App\Models\Spark\ProgramAvailability;
use App\Models\Spark\CharacterTopic;
use App\Services\Spark\SparkProgramService;
use App\Services\Shared\FileUploadService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;

class ProgramServiceTest extends TestCase
{
    use RefreshDatabase;

    protected SparkProgramService $service;
    protected FileUploadService $mockFileUploadService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->mockFileUploadService = Mockery::mock(FileUploadService::class);
        $this->service = new SparkProgramService($this->mockFileUploadService);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_can_get_paginated_programs()
    {
        // Create test programs
        Program::factory()->count(5)->create(['is_active' => true]);
        Program::factory()->count(2)->create(['is_active' => false]);

        $result = $this->service->getPrograms();

        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
        $this->assertCount(5, $result->items());
    }

    /** @test */
    public function it_can_filter_programs_by_grade_level()
    {
        SparkProgram::factory()->create([
            'title' => 'Elementary Program',
            'grade_levels' => ['K', '1', '2'],
            'is_active' => true,
        ]);

        SparkProgram::factory()->create([
            'title' => 'High School Program',
            'grade_levels' => ['9', '10', '11', '12'],
            'is_active' => true,
        ]);

        $result = $this->service->getPrograms(['grade_level' => 'K']);

        $this->assertCount(1, $result->items());
        $this->assertEquals('Elementary Program', $result->items()[0]->title);
    }

    /** @test */
    public function it_can_filter_programs_by_character_topic()
    {
        $program = SparkProgram::factory()->create([
            'title' => 'Leadership Program',
            'character_topics' => ['leadership', 'teamwork'],
            'is_active' => true,
        ]);

        SparkProgram::factory()->create([
            'title' => 'Other Program',
            'character_topics' => ['respect'],
            'is_active' => true,
        ]);

        $result = $this->service->getPrograms(['character_topic' => 'leadership']);

        $this->assertCount(1, $result->items());
        $this->assertEquals('Leadership Program', $result->items()[0]->title);
    }

    /** @test */
    public function it_can_filter_programs_by_duration_range()
    {
        SparkProgram::factory()->create([
            'title' => 'Short Program',
            'duration_minutes' => 30,
            'is_active' => true,
        ]);

        SparkProgram::factory()->create([
            'title' => 'Long Program',
            'duration_minutes' => 120,
            'is_active' => true,
        ]);

        $result = $this->service->getPrograms(['min_duration' => 60, 'max_duration' => 180]);

        $this->assertCount(1, $result->items());
        $this->assertEquals('Long Program', $result->items()[0]->title);
    }

    /** @test */
    public function it_can_filter_programs_by_capacity_range()
    {
        SparkProgram::factory()->create([
            'title' => 'Small Program',
            'max_students' => 15,
            'is_active' => true,
        ]);

        SparkProgram::factory()->create([
            'title' => 'Large Program',
            'max_students' => 50,
            'is_active' => true,
        ]);

        $result = $this->service->getPrograms(['min_capacity' => 30, 'max_capacity' => 60]);

        $this->assertCount(1, $result->items());
        $this->assertEquals('Large Program', $result->items()[0]->title);
    }

    /** @test */
    public function it_can_search_programs_by_title_and_description()
    {
        SparkProgram::factory()->create([
            'title' => 'Amazing Leadership Workshop',
            'description' => 'Learn leadership skills',
            'is_active' => true,
        ]);

        SparkProgram::factory()->create([
            'title' => 'Teamwork Session',
            'description' => 'Build amazing teamwork',
            'is_active' => true,
        ]);

        SparkProgram::factory()->create([
            'title' => 'Other Program',
            'description' => 'Different content',
            'is_active' => true,
        ]);

        $result = $this->service->getPrograms(['search' => 'amazing']);

        $this->assertCount(2, $result->items());
    }

    /** @test */
    public function it_can_create_a_new_program()
    {
        $data = [
            'title' => 'New Program',
            'description' => 'Program description',
            'duration_minutes' => 90,
            'max_students' => 25,
            'price_per_student' => 15.00,
            'grade_levels' => ['6', '7', '8'],
            'character_topics' => ['leadership', 'teamwork'],
            'learning_objectives' => ['Learn leadership', 'Build confidence'],
            'is_active' => true,
        ];

        $program = $this->service->createProgram($data);

        $this->assertInstanceOf(SparkProgram::class, $program);
        $this->assertEquals('New Program', $program->title);
        $this->assertEquals(90, $program->duration_minutes);
        $this->assertEquals(['6', '7', '8'], $program->grade_levels);
        $this->assertTrue($program->is_active);
        $this->assertDatabaseHas('spark_programs', ['title' => 'New Program']);
    }

    /** @test */
    public function it_can_get_program_by_id()
    {
        $program = SparkProgram::factory()->create(['title' => 'Test Program']);

        $result = $this->service->getProgramById($program->id);

        $this->assertInstanceOf(SparkProgram::class, $result);
        $this->assertEquals('Test Program', $result->title);
        $this->assertEquals($program->id, $result->id);
    }

    /** @test */
    public function it_returns_null_for_nonexistent_program()
    {
        $result = $this->service->getProgramById(999);

        $this->assertNull($result);
    }

    /** @test */
    public function it_can_update_a_program()
    {
        $program = SparkProgram::factory()->create([
            'title' => 'Original Title',
            'duration_minutes' => 60,
        ]);

        $updateData = [
            'title' => 'Updated Title',
            'duration_minutes' => 90,
        ];

        $updatedProgram = $this->service->updateProgram($program, $updateData);

        $this->assertEquals('Updated Title', $updatedProgram->title);
        $this->assertEquals(90, $updatedProgram->duration_minutes);
        $this->assertDatabaseHas('spark_programs', [
            'id' => $program->id,
            'title' => 'Updated Title',
            'duration_minutes' => 90,
        ]);
    }

    /** @test */
    public function it_can_delete_a_program_without_active_bookings()
    {
        $program = SparkProgram::factory()->create();

        $result = $this->service->deleteProgram($program);

        $this->assertTrue($result);
        $this->assertSoftDeleted('spark_programs', ['id' => $program->id]);
    }

    /** @test */
    public function it_cannot_delete_program_with_active_bookings()
    {
        $program = SparkProgram::factory()->hasBookings(1, ['status' => 'confirmed'])->create();

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Cannot delete program with active bookings');

        $this->service->deleteProgram($program);
    }

    /** @test */
    public function it_can_upload_resource_files()
    {
        Storage::fake('s3');
        $program = SparkProgram::factory()->create(['resource_files' => []]);
        
        $file = UploadedFile::fake()->create('test.pdf', 1024);
        $files = [$file];

        $this->mockFileUploadService
            ->shouldReceive('uploadDocument')
            ->once()
            ->with($file, 'spark/programs')
            ->andReturn([
                'original_name' => 'test.pdf',
                'url' => 'https://example.com/test.pdf',
                'size' => 1024,
                'mime_type' => 'application/pdf',
            ]);

        $result = $this->service->uploadResourceFiles($program, $files);

        $this->assertInstanceOf(SparkProgram::class, $result);
        $this->assertCount(1, $result->resource_files);
        $this->assertEquals('test.pdf', $result->resource_files[0]['name']);
        $this->assertEquals('https://example.com/test.pdf', $result->resource_files[0]['url']);
    }

    /** @test */
    public function it_can_get_program_availability()
    {
        $program = SparkProgram::factory()->create();
        
        // Create availability slots
        ProgramAvailability::factory()->count(3)->create([
            'program_id' => $program->id,
            'date' => now()->addDays(1)->toDateString(),
        ]);

        // Create past availability (should be filtered out)
        ProgramAvailability::factory()->create([
            'program_id' => $program->id,
            'date' => now()->subDays(1)->toDateString(),
        ]);

        $result = $this->service->getProgramAvailability($program->id);

        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
        $this->assertCount(3, $result->items());
    }

    /** @test */
    public function it_can_filter_program_availability_by_date_range()
    {
        $program = SparkProgram::factory()->create();
        
        ProgramAvailability::factory()->create([
            'program_id' => $program->id,
            'date' => now()->addDays(1)->toDateString(),
        ]);

        ProgramAvailability::factory()->create([
            'program_id' => $program->id,
            'date' => now()->addDays(5)->toDateString(),
        ]);

        ProgramAvailability::factory()->create([
            'program_id' => $program->id,
            'date' => now()->addDays(10)->toDateString(),
        ]);

        $startDate = now()->addDays(2)->toDateString();
        $endDate = now()->addDays(7)->toDateString();

        $result = $this->service->getProgramAvailability($program->id, $startDate, $endDate);

        $this->assertCount(1, $result->items());
    }

    /** @test */
    public function it_can_set_program_availability()
    {
        $program = SparkProgram::factory()->create();
        
        $availabilityData = [
            [
                'date' => now()->addDays(1)->toDateString(),
                'start_time' => '09:00',
                'end_time' => '10:00',
                'max_bookings' => 3,
                'notes' => 'Morning session',
            ],
            [
                'date' => now()->addDays(2)->toDateString(),
                'start_time' => '14:00',
                'end_time' => '15:00',
                'max_bookings' => 2,
                'notes' => 'Afternoon session',
            ],
        ];

        $result = $this->service->setProgramAvailability($program->id, $availabilityData);

        $this->assertIsArray($result);
        $this->assertEquals(2, $result['created_count']);
        $this->assertCount(2, $result['availability_slots']);
        
        $this->assertDatabaseHas('program_availability', [
            'program_id' => $program->id,
            'date' => now()->addDays(1)->toDateString(),
            'max_bookings' => 3,
            'notes' => 'Morning session',
        ]);

        $this->assertDatabaseHas('program_availability', [
            'program_id' => $program->id,
            'date' => now()->addDays(2)->toDateString(),
            'max_bookings' => 2,
            'notes' => 'Afternoon session',
        ]);
    }

    /** @test */
    public function it_can_update_existing_availability_slot()
    {
        $program = SparkProgram::factory()->create();
        
        // Create existing availability
        $existingAvailability = ProgramAvailability::factory()->create([
            'program_id' => $program->id,
            'date' => now()->addDays(1)->toDateString(),
            'start_time' => now()->addDays(1)->setTime(9, 0),
            'max_bookings' => 2,
        ]);

        $availabilityData = [
            [
                'date' => now()->addDays(1)->toDateString(),
                'start_time' => '09:00',
                'end_time' => '10:00',
                'max_bookings' => 5, // Updated capacity
                'notes' => 'Updated session',
            ],
        ];

        $result = $this->service->setProgramAvailability($program->id, $availabilityData);

        $this->assertEquals(1, $result['created_count']);
        
        // Check that the existing slot was updated
        $this->assertDatabaseHas('program_availability', [
            'id' => $existingAvailability->id,
            'max_bookings' => 5,
            'notes' => 'Updated session',
        ]);
    }

    /** @test */
    public function it_throws_exception_for_invalid_program_id_in_availability()
    {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $this->service->setProgramAvailability(999, [
            [
                'date' => now()->addDays(1)->toDateString(),
                'start_time' => '09:00',
                'end_time' => '10:00',
                'max_bookings' => 3,
            ],
        ]);
    }

    /** @test */
    public function it_can_append_multiple_resource_files()
    {
        Storage::fake('s3');
        $program = SparkProgram::factory()->create([
            'resource_files' => [
                [
                    'name' => 'existing.pdf',
                    'url' => 'https://example.com/existing.pdf',
                    'size' => 512,
                    'type' => 'application/pdf',
                    'uploaded_at' => now()->subDays(1)->toISOString(),
                ],
            ],
        ]);
        
        $file1 = UploadedFile::fake()->create('new1.pdf', 1024);
        $file2 = UploadedFile::fake()->create('new2.docx', 2048);
        $files = [$file1, $file2];

        $this->mockFileUploadService
            ->shouldReceive('uploadDocument')
            ->twice()
            ->andReturn(
                [
                    'original_name' => 'new1.pdf',
                    'url' => 'https://example.com/new1.pdf',
                    'size' => 1024,
                    'mime_type' => 'application/pdf',
                ],
                [
                    'original_name' => 'new2.docx',
                    'url' => 'https://example.com/new2.docx',
                    'size' => 2048,
                    'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                ]
            );

        $result = $this->service->uploadResourceFiles($program, $files);

        $this->assertCount(3, $result->resource_files);
        $this->assertEquals('existing.pdf', $result->resource_files[0]['name']);
        $this->assertEquals('new1.pdf', $result->resource_files[1]['name']);
        $this->assertEquals('new2.docx', $result->resource_files[2]['name']);
    }
}
