<?php

namespace Tests\Feature\Spark;

use App\Models\Spark\Booking;
use App\Models\Spark\BookingStudent;
use App\Models\Spark\PermissionSlip;
use App\Models\Spark\School;
use App\Models\Spark\SparkProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Analytics API Feature Tests
 *
 * Tests the complete analytics API endpoints including dashboard data,
 * booking analytics, program performance, school engagement, and financial reporting.
 */
class AnalyticsApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $teacherUser;
    protected User $regularUser;
    protected School $school;
    protected SparkProgram $program;
    protected Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'teacher']);
        Role::firstOrCreate(['name' => 'user']);

        // Create test users
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('admin');

        $this->teacherUser = User::factory()->create();
        $this->teacherUser->assignRole('teacher');

        $this->regularUser = User::factory()->create();
        $this->regularUser->assignRole('user');

        // Create test data
        $this->school = School::factory()->create(['is_active' => true]);
        $this->program = SparkProgram::factory()->create([
            'is_active' => true,
            'max_students' => 30,
            'price_per_student' => 15.00,
        ]);

        $this->booking = Booking::factory()->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
            'status' => 'confirmed',
            'confirmed_date' => now()->addWeek(),
            'confirmed_time' => now()->addWeek()->setTime(10, 0),
            'student_count' => 25,
            'total_cost' => 375.00,
        ]);

        // Create students and permission slips
        BookingStudent::factory()->count(3)->create([
            'booking_id' => $this->booking->id,
        ]);

        PermissionSlip::factory()->count(2)->create([
            'booking_id' => $this->booking->id,
            'is_signed' => true,
            'signed_at' => now(),
        ]);

        PermissionSlip::factory()->create([
            'booking_id' => $this->booking->id,
            'is_signed' => false,
        ]);
    }

    /** @test */
    public function admin_can_get_dashboard_data()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/spark/analytics/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'overview' => [
                        'total_bookings',
                        'confirmed_bookings',
                        'total_revenue',
                        'active_schools',
                        'completion_rate',
                        'changes',
                    ],
                    'booking_trends',
                    'top_programs',
                    'active_schools',
                    'revenue_summary',
                    'permission_slip_status',
                    'recent_activity',
                ]
            ]);

        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(1, $data['overview']['total_bookings']);
        $this->assertGreaterThanOrEqual(1, $data['overview']['confirmed_bookings']);
        $this->assertGreaterThan(0, $data['overview']['total_revenue']);
    }

    /** @test */
    public function admin_can_filter_dashboard_by_school()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson("/api/v1/spark/analytics/dashboard?school_id={$this->school->id}");

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertArrayHasKey('overview', $data);
        $this->assertArrayHasKey('booking_trends', $data);
    }

    /** @test */
    public function admin_can_get_booking_analytics()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/spark/analytics/bookings');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_bookings',
                    'confirmed_bookings',
                    'pending_bookings',
                    'cancelled_bookings',
                    'completed_bookings',
                    'completion_rate',
                    'average_students_per_booking',
                    'booking_trends',
                    'status_distribution',
                    'popular_time_slots',
                    'booking_lead_time',
                ]
            ]);

        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(1, $data['total_bookings']);
        $this->assertIsArray($data['booking_trends']);
        $this->assertIsArray($data['status_distribution']);
    }

    /** @test */
    public function admin_can_filter_booking_analytics_by_date_range()
    {
        Sanctum::actingAs($this->adminUser);

        $startDate = now()->subMonth()->toDateString();
        $endDate = now()->toDateString();

        $response = $this->getJson("/api/v1/spark/analytics/bookings?start_date={$startDate}&end_date={$endDate}");

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertArrayHasKey('total_bookings', $data);
        $this->assertArrayHasKey('booking_trends', $data);
    }

    /** @test */
    public function admin_can_get_program_performance()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/spark/analytics/programs');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'program_rankings',
                    'capacity_utilization',
                    'program_ratings',
                    'revenue_by_program',
                    'program_trends',
                    'grade_level_distribution',
                    'character_topic_popularity',
                    'program_duration_analysis',
                ]
            ]);

        $data = $response->json('data');
        $this->assertIsArray($data['program_rankings']);
        $this->assertIsArray($data['capacity_utilization']);
    }

    /** @test */
    public function admin_can_get_school_engagement()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/spark/analytics/schools');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'active_schools_count',
                    'school_activity_rankings',
                    'district_summary',
                    'school_program_diversity',
                    'engagement_trends',
                    'new_school_acquisitions',
                    'school_retention_rate',
                    'average_booking_frequency',
                ]
            ]);

        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(1, $data['active_schools_count']);
        $this->assertIsArray($data['school_activity_rankings']);
    }

    /** @test */
    public function admin_can_get_financial_summary()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/spark/analytics/financial');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_revenue',
                    'revenue_trends',
                    'revenue_by_program',
                    'revenue_by_school',
                    'average_booking_value',
                    'payment_status_summary',
                    'revenue_forecasting',
                    'top_revenue_schools',
                ]
            ]);

        $data = $response->json('data');
        $this->assertGreaterThan(0, $data['total_revenue']);
        $this->assertIsArray($data['revenue_trends']);
    }

    /** @test */
    public function admin_can_get_permission_slip_compliance()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/spark/analytics/permission-slips');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_slips',
                    'signed_slips',
                    'unsigned_slips',
                    'overdue_slips',
                    'compliance_rate',
                    'average_signing_time',
                    'reminder_effectiveness',
                    'compliance_by_school',
                    'signing_trends',
                ]
            ]);

        $data = $response->json('data');
        $this->assertEquals(3, $data['total_slips']);
        $this->assertEquals(2, $data['signed_slips']);
        $this->assertEquals(1, $data['unsigned_slips']);
        $this->assertGreaterThan(0, $data['compliance_rate']);
    }

    /** @test */
    public function analytics_endpoints_support_date_range_filters()
    {
        Sanctum::actingAs($this->adminUser);

        $endpoints = [
            '/api/v1/spark/analytics/dashboard',
            '/api/v1/spark/analytics/bookings',
            '/api/v1/spark/analytics/programs',
            '/api/v1/spark/analytics/schools',
            '/api/v1/spark/analytics/financial',
            '/api/v1/spark/analytics/permission-slips',
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->getJson($endpoint . '?date_range=week');
            $response->assertStatus(200);

            $response = $this->getJson($endpoint . '?date_range=month');
            $response->assertStatus(200);

            $response = $this->getJson($endpoint . '?date_range=quarter');
            $response->assertStatus(200);
        }
    }

    /** @test */
    public function analytics_endpoints_validate_invalid_date_ranges()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/spark/analytics/dashboard?date_range=invalid');
        $response->assertStatus(422);

        $response = $this->getJson('/api/v1/spark/analytics/bookings?start_date=invalid-date');
        $response->assertStatus(422);

        $response = $this->getJson('/api/v1/spark/analytics/bookings?start_date=2024-01-01&end_date=2023-12-31');
        $response->assertStatus(422);
    }

    /** @test */
    public function analytics_endpoints_validate_school_filters()
    {
        Sanctum::actingAs($this->adminUser);

        // Valid school ID
        $response = $this->getJson("/api/v1/spark/analytics/dashboard?school_id={$this->school->id}");
        $response->assertStatus(200);

        // Invalid school ID
        $response = $this->getJson('/api/v1/spark/analytics/dashboard?school_id=99999');
        $response->assertStatus(422);

        // Non-numeric school ID
        $response = $this->getJson('/api/v1/spark/analytics/dashboard?school_id=invalid');
        $response->assertStatus(422);
    }

    /** @test */
    public function teacher_can_access_analytics_for_their_school()
    {
        Sanctum::actingAs($this->teacherUser);

        // Assuming teacher has access to their school's analytics
        $response = $this->getJson("/api/v1/spark/analytics/dashboard?school_id={$this->school->id}");
        $response->assertStatus(200);
    }

    /** @test */
    public function regular_user_cannot_access_analytics()
    {
        Sanctum::actingAs($this->regularUser);

        $endpoints = [
            '/api/v1/spark/analytics/dashboard',
            '/api/v1/spark/analytics/bookings',
            '/api/v1/spark/analytics/programs',
            '/api/v1/spark/analytics/schools',
            '/api/v1/spark/analytics/financial',
            '/api/v1/spark/analytics/permission-slips',
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->getJson($endpoint);
            $response->assertStatus(403);
        }
    }

    /** @test */
    public function unauthenticated_user_cannot_access_analytics()
    {
        $response = $this->getJson('/api/v1/spark/analytics/dashboard');
        $response->assertStatus(401);
    }

    /** @test */
    public function analytics_responses_are_cached()
    {
        Sanctum::actingAs($this->adminUser);

        // First request
        $start = microtime(true);
        $response1 = $this->getJson('/api/v1/spark/analytics/dashboard');
        $time1 = microtime(true) - $start;

        // Second request (should be faster due to caching)
        $start = microtime(true);
        $response2 = $this->getJson('/api/v1/spark/analytics/dashboard');
        $time2 = microtime(true) - $start;

        $response1->assertStatus(200);
        $response2->assertStatus(200);

        // Second request should be faster (cached)
        $this->assertLessThan($time1, $time2);
        
        // Data should be identical
        $this->assertEquals($response1->json('data'), $response2->json('data'));
    }

    /** @test */
    public function analytics_handles_empty_data_gracefully()
    {
        // Clear all test data
        Booking::truncate();
        PermissionSlip::truncate();
        BookingStudent::truncate();

        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/spark/analytics/dashboard');

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertEquals(0, $data['overview']['total_bookings']);
        $this->assertEquals(0, $data['overview']['total_revenue']);
        $this->assertIsArray($data['booking_trends']);
        $this->assertIsArray($data['top_programs']);
    }

    /** @test */
    public function analytics_supports_grouping_parameters()
    {
        Sanctum::actingAs($this->adminUser);

        $groupByOptions = ['day', 'week', 'month', 'quarter', 'year'];

        foreach ($groupByOptions as $groupBy) {
            $response = $this->getJson("/api/v1/spark/analytics/bookings?group_by={$groupBy}");
            $response->assertStatus(200);
            
            $data = $response->json('data');
            $this->assertArrayHasKey('booking_trends', $data);
        }
    }

    /** @test */
    public function analytics_returns_consistent_data_structure()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/spark/analytics/dashboard');
        $response->assertStatus(200);

        $data = $response->json('data');
        
        // Verify all required keys are present
        $requiredKeys = [
            'overview', 'booking_trends', 'top_programs', 'active_schools',
            'revenue_summary', 'permission_slip_status', 'recent_activity'
        ];

        foreach ($requiredKeys as $key) {
            $this->assertArrayHasKey($key, $data, "Missing key: {$key}");
        }

        // Verify overview structure
        $overviewKeys = [
            'total_bookings', 'confirmed_bookings', 'total_revenue',
            'active_schools', 'completion_rate', 'changes'
        ];

        foreach ($overviewKeys as $key) {
            $this->assertArrayHasKey($key, $data['overview'], "Missing overview key: {$key}");
        }
    }
}
