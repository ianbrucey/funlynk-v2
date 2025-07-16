<?php

namespace Tests\Feature\Spark;

use App\Models\Spark\Booking;
use App\Models\Spark\School;
use App\Models\Spark\SparkProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Report Generation Feature Tests
 *
 * Tests the report generation API endpoints including custom report creation,
 * scheduling, export functionality, and various report formats.
 */
class ReportGenerationTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $teacherUser;
    protected School $school;
    protected SparkProgram $program;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'teacher']);

        // Create test users
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('admin');

        $this->teacherUser = User::factory()->create();
        $this->teacherUser->assignRole('teacher');

        // Create test data
        $this->school = School::factory()->create(['is_active' => true]);
        $this->program = SparkProgram::factory()->create([
            'is_active' => true,
            'max_students' => 30,
            'price_per_student' => 15.00,
        ]);

        // Create test bookings
        Booking::factory()->count(5)->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
            'status' => 'confirmed',
            'total_cost' => 375.00,
        ]);

        // Mock storage for testing
        Storage::fake('local');
    }

    /** @test */
    public function admin_can_generate_booking_summary_report()
    {
        Sanctum::actingAs($this->adminUser);

        $reportData = [
            'report_type' => 'booking_summary',
            'title' => 'Monthly Booking Summary',
            'description' => 'Summary of all bookings for the month',
            'format' => 'pdf',
            'filters' => [
                'date_range' => 'month',
                'school_id' => $this->school->id,
            ],
        ];

        $response = $this->postJson('/api/v1/spark/analytics/reports', $reportData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'title',
                    'type',
                    'format',
                    'file_path',
                    'file_size',
                    'status',
                    'generated_at',
                ]
            ]);

        $data = $response->json('data');
        $this->assertEquals('booking_summary', $data['type']);
        $this->assertEquals('pdf', $data['format']);
        $this->assertEquals('completed', $data['status']);
        $this->assertNotNull($data['file_path']);

        // Verify file was created
        Storage::assertExists($data['file_path']);
    }

    /** @test */
    public function admin_can_generate_program_performance_report()
    {
        Sanctum::actingAs($this->adminUser);

        $reportData = [
            'report_type' => 'program_performance',
            'title' => 'Program Performance Analysis',
            'format' => 'excel',
            'filters' => [
                'date_range' => 'quarter',
            ],
        ];

        $response = $this->postJson('/api/v1/spark/analytics/reports', $reportData);

        $response->assertStatus(201);
        
        $data = $response->json('data');
        $this->assertEquals('program_performance', $data['type']);
        $this->assertEquals('excel', $data['format']);
        
        Storage::assertExists($data['file_path']);
    }

    /** @test */
    public function admin_can_generate_financial_summary_report()
    {
        Sanctum::actingAs($this->adminUser);

        $reportData = [
            'report_type' => 'financial_summary',
            'title' => 'Financial Summary Report',
            'format' => 'csv',
            'filters' => [
                'start_date' => now()->subMonth()->toDateString(),
                'end_date' => now()->toDateString(),
            ],
        ];

        $response = $this->postJson('/api/v1/spark/analytics/reports', $reportData);

        $response->assertStatus(201);
        
        $data = $response->json('data');
        $this->assertEquals('financial_summary', $data['type']);
        $this->assertEquals('csv', $data['format']);
    }

    /** @test */
    public function report_generation_validates_required_fields()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson('/api/v1/spark/analytics/reports', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'report_type',
                'title',
                'filters',
            ]);
    }

    /** @test */
    public function report_generation_validates_report_type()
    {
        Sanctum::actingAs($this->adminUser);

        $reportData = [
            'report_type' => 'invalid_type',
            'title' => 'Test Report',
            'filters' => ['date_range' => 'month'],
        ];

        $response = $this->postJson('/api/v1/spark/analytics/reports', $reportData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['report_type']);
    }

    /** @test */
    public function report_generation_validates_format()
    {
        Sanctum::actingAs($this->adminUser);

        $reportData = [
            'report_type' => 'booking_summary',
            'title' => 'Test Report',
            'format' => 'invalid_format',
            'filters' => ['date_range' => 'month'],
        ];

        $response = $this->postJson('/api/v1/spark/analytics/reports', $reportData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['format']);
    }

    /** @test */
    public function report_generation_validates_date_ranges()
    {
        Sanctum::actingAs($this->adminUser);

        $reportData = [
            'report_type' => 'booking_summary',
            'title' => 'Test Report',
            'filters' => [
                'date_range' => 'custom',
                'start_date' => '2024-12-31',
                'end_date' => '2024-01-01', // End before start
            ],
        ];

        $response = $this->postJson('/api/v1/spark/analytics/reports', $reportData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['filters.start_date']);
    }

    /** @test */
    public function report_generation_validates_school_exists()
    {
        Sanctum::actingAs($this->adminUser);

        $reportData = [
            'report_type' => 'booking_summary',
            'title' => 'Test Report',
            'filters' => [
                'date_range' => 'month',
                'school_id' => 99999, // Non-existent school
            ],
        ];

        $response = $this->postJson('/api/v1/spark/analytics/reports', $reportData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['filters.school_id']);
    }

    /** @test */
    public function admin_can_schedule_recurring_report()
    {
        Sanctum::actingAs($this->adminUser);

        $reportData = [
            'report_type' => 'booking_summary',
            'title' => 'Weekly Booking Report',
            'format' => 'pdf',
            'filters' => ['date_range' => 'week'],
            'schedule' => [
                'frequency' => 'weekly',
                'day_of_week' => 1, // Monday
                'time' => '09:00',
                'recipients' => ['admin@example.com'],
            ],
        ];

        $response = $this->postJson('/api/v1/spark/analytics/reports', $reportData);

        $response->assertStatus(201);
        
        $data = $response->json('data');
        $this->assertEquals('booking_summary', $data['type']);
        $this->assertNotNull($data['file_path']);
    }

    /** @test */
    public function scheduled_report_validates_frequency_requirements()
    {
        Sanctum::actingAs($this->adminUser);

        // Weekly frequency requires day_of_week
        $reportData = [
            'report_type' => 'booking_summary',
            'title' => 'Weekly Report',
            'filters' => ['date_range' => 'week'],
            'schedule' => [
                'frequency' => 'weekly',
                // Missing day_of_week
            ],
        ];

        $response = $this->postJson('/api/v1/spark/analytics/reports', $reportData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['schedule.day_of_week']);
    }

    /** @test */
    public function scheduled_report_validates_monthly_day_limit()
    {
        Sanctum::actingAs($this->adminUser);

        $reportData = [
            'report_type' => 'booking_summary',
            'title' => 'Monthly Report',
            'filters' => ['date_range' => 'month'],
            'schedule' => [
                'frequency' => 'monthly',
                'day_of_month' => 32, // Invalid day
            ],
        ];

        $response = $this->postJson('/api/v1/spark/analytics/reports', $reportData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['schedule.day_of_month']);
    }

    /** @test */
    public function admin_can_export_data_in_different_formats()
    {
        Sanctum::actingAs($this->adminUser);

        $formats = ['csv', 'excel', 'pdf'];

        foreach ($formats as $format) {
            $exportData = [
                'data_type' => 'bookings',
                'format' => $format,
                'filters' => [
                    'start_date' => now()->subMonth()->toDateString(),
                    'end_date' => now()->toDateString(),
                ],
            ];

            $response = $this->postJson('/api/v1/spark/analytics/export', $exportData);

            $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'file_path',
                        'filename',
                        'format',
                        'file_size',
                    ]
                ]);

            $data = $response->json('data');
            $this->assertEquals($format, $data['format']);
            Storage::assertExists($data['file_path']);
        }
    }

    /** @test */
    public function export_validates_data_type()
    {
        Sanctum::actingAs($this->adminUser);

        $exportData = [
            'data_type' => 'invalid_type',
            'format' => 'csv',
        ];

        $response = $this->postJson('/api/v1/spark/analytics/export', $exportData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['data_type']);
    }

    /** @test */
    public function export_validates_format()
    {
        Sanctum::actingAs($this->adminUser);

        $exportData = [
            'data_type' => 'bookings',
            'format' => 'invalid_format',
        ];

        $response = $this->postJson('/api/v1/spark/analytics/export', $exportData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['format']);
    }

    /** @test */
    public function export_supports_column_selection()
    {
        Sanctum::actingAs($this->adminUser);

        $exportData = [
            'data_type' => 'bookings',
            'format' => 'csv',
            'columns' => ['id', 'booking_reference', 'school_name', 'total_cost'],
            'filters' => ['date_range' => 'month'],
        ];

        $response = $this->postJson('/api/v1/spark/analytics/export', $exportData);

        $response->assertStatus(200);
        
        $data = $response->json('data');
        Storage::assertExists($data['file_path']);
    }

    /** @test */
    public function export_validates_column_names()
    {
        Sanctum::actingAs($this->adminUser);

        $exportData = [
            'data_type' => 'bookings',
            'format' => 'csv',
            'columns' => ['invalid_column'],
        ];

        $response = $this->postJson('/api/v1/spark/analytics/export', $exportData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['columns']);
    }

    /** @test */
    public function export_supports_sorting_and_limiting()
    {
        Sanctum::actingAs($this->adminUser);

        $exportData = [
            'data_type' => 'bookings',
            'format' => 'csv',
            'sort_by' => 'created_at',
            'sort_direction' => 'desc',
            'limit' => 100,
        ];

        $response = $this->postJson('/api/v1/spark/analytics/export', $exportData);

        $response->assertStatus(200);
    }

    /** @test */
    public function export_validates_sort_direction()
    {
        Sanctum::actingAs($this->adminUser);

        $exportData = [
            'data_type' => 'bookings',
            'format' => 'csv',
            'sort_direction' => 'invalid',
        ];

        $response = $this->postJson('/api/v1/spark/analytics/export', $exportData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['sort_direction']);
    }

    /** @test */
    public function admin_can_get_user_reports_list()
    {
        Sanctum::actingAs($this->adminUser);

        // Generate a report first
        $this->postJson('/api/v1/spark/analytics/reports', [
            'report_type' => 'booking_summary',
            'title' => 'Test Report',
            'filters' => ['date_range' => 'month'],
        ]);

        $response = $this->getJson('/api/v1/spark/analytics/reports');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'title',
                            'type',
                            'format',
                            'status',
                            'generated_at',
                        ]
                    ],
                    'current_page',
                    'per_page',
                    'total',
                ]
            ]);
    }

    /** @test */
    public function teacher_cannot_generate_reports()
    {
        Sanctum::actingAs($this->teacherUser);

        $reportData = [
            'report_type' => 'booking_summary',
            'title' => 'Test Report',
            'filters' => ['date_range' => 'month'],
        ];

        $response = $this->postJson('/api/v1/spark/analytics/reports', $reportData);

        $response->assertStatus(403);
    }

    /** @test */
    public function unauthenticated_user_cannot_generate_reports()
    {
        $reportData = [
            'report_type' => 'booking_summary',
            'title' => 'Test Report',
            'filters' => ['date_range' => 'month'],
        ];

        $response = $this->postJson('/api/v1/spark/analytics/reports', $reportData);

        $response->assertStatus(401);
    }

    /** @test */
    public function report_generation_handles_large_datasets()
    {
        // Create a large number of bookings
        Booking::factory()->count(1000)->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'status' => 'confirmed',
        ]);

        Sanctum::actingAs($this->adminUser);

        $reportData = [
            'report_type' => 'booking_summary',
            'title' => 'Large Dataset Report',
            'format' => 'csv',
            'filters' => ['date_range' => 'year'],
        ];

        $response = $this->postJson('/api/v1/spark/analytics/reports', $reportData);

        $response->assertStatus(201);
        
        $data = $response->json('data');
        $this->assertGreaterThan(0, $data['file_size']);
        Storage::assertExists($data['file_path']);
    }
}
