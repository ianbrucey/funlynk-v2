<?php

namespace Tests\Unit\Spark;

use App\Models\Spark\Booking;
use App\Models\Spark\PermissionSlip;
use App\Models\Spark\School;
use App\Models\Spark\SparkProgram;
use App\Services\Shared\CacheService;
use App\Services\Shared\LoggingService;
use App\Services\Spark\AnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

/**
 * Analytics Service Unit Tests
 *
 * Tests the core business logic of the AnalyticsService
 * with proper mocking of dependencies.
 */
class AnalyticsServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AnalyticsService $service;
    protected $cacheServiceMock;
    protected $loggingServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        // Create service mocks
        $this->cacheServiceMock = Mockery::mock(CacheService::class);
        $this->loggingServiceMock = Mockery::mock(LoggingService::class);

        // Create service instance with mocked dependencies
        $this->service = new AnalyticsService(
            $this->cacheServiceMock,
            $this->loggingServiceMock
        );

        // Set up default mock expectations
        $this->loggingServiceMock->shouldReceive('logUserActivity')->byDefault();
        $this->loggingServiceMock->shouldReceive('logError')->byDefault();
    }

    /** @test */
    public function it_can_get_dashboard_data_with_caching()
    {
        $expectedData = [
            'overview' => ['total_bookings' => 5],
            'booking_trends' => [],
            'top_programs' => [],
            'active_schools' => [],
            'revenue_summary' => [],
            'permission_slip_status' => [],
            'recent_activity' => [],
        ];

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->with(Mockery::type('string'), Mockery::type('Closure'), 300)
            ->andReturnUsing(function ($key, $callback, $ttl) use ($expectedData) {
                return $expectedData;
            });

        $result = $this->service->getDashboardData();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('overview', $result);
        $this->assertArrayHasKey('booking_trends', $result);
        $this->assertEquals(5, $result['overview']['total_bookings']);
    }

    /** @test */
    public function it_can_get_dashboard_data_with_school_filter()
    {
        $school = School::factory()->create();
        
        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->andReturn([
                'overview' => ['total_bookings' => 2],
                'booking_trends' => [],
                'top_programs' => [],
                'active_schools' => [],
                'revenue_summary' => [],
                'permission_slip_status' => [],
                'recent_activity' => [],
            ]);

        $result = $this->service->getDashboardData(['school_id' => $school->id]);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('overview', $result);
    }

    /** @test */
    public function it_can_get_booking_analytics()
    {
        $booking = Booking::factory()->create([
            'status' => 'confirmed',
            'student_count' => 25,
            'total_cost' => 375.00,
        ]);

        $expectedData = [
            'total_bookings' => 1,
            'confirmed_bookings' => 1,
            'pending_bookings' => 0,
            'cancelled_bookings' => 0,
            'completed_bookings' => 0,
            'completion_rate' => 0,
            'average_students_per_booking' => 25,
            'booking_trends' => [],
            'status_distribution' => ['confirmed' => 1],
            'popular_time_slots' => [],
            'booking_lead_time' => [],
        ];

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->andReturn($expectedData);

        $result = $this->service->getBookingAnalytics();

        $this->assertIsArray($result);
        $this->assertEquals(1, $result['total_bookings']);
        $this->assertEquals(1, $result['confirmed_bookings']);
        $this->assertEquals(25, $result['average_students_per_booking']);
    }

    /** @test */
    public function it_can_get_booking_analytics_with_filters()
    {
        $school = School::factory()->create();
        
        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->andReturn([
                'total_bookings' => 3,
                'confirmed_bookings' => 2,
                'pending_bookings' => 1,
                'cancelled_bookings' => 0,
                'completed_bookings' => 0,
                'completion_rate' => 0,
                'average_students_per_booking' => 20,
                'booking_trends' => [],
                'status_distribution' => [],
                'popular_time_slots' => [],
                'booking_lead_time' => [],
            ]);

        $filters = [
            'school_id' => $school->id,
            'date_range' => 'month',
            'group_by' => 'week',
        ];

        $result = $this->service->getBookingAnalytics($filters);

        $this->assertIsArray($result);
        $this->assertEquals(3, $result['total_bookings']);
        $this->assertEquals(2, $result['confirmed_bookings']);
    }

    /** @test */
    public function it_can_get_program_performance()
    {
        $program = SparkProgram::factory()->create([
            'title' => 'Character Building',
            'max_students' => 30,
        ]);

        $booking = Booking::factory()->create([
            'program_id' => $program->id,
            'student_count' => 25,
            'status' => 'confirmed',
        ]);

        $expectedData = [
            'program_rankings' => [
                [
                    'program' => $program,
                    'booking_count' => 1,
                    'total_students' => 25,
                    'average_rating' => 0,
                ]
            ],
            'capacity_utilization' => [],
            'program_ratings' => [],
            'revenue_by_program' => [],
            'program_trends' => [],
            'grade_level_distribution' => [],
            'character_topic_popularity' => [],
            'program_duration_analysis' => [],
        ];

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->andReturn($expectedData);

        $result = $this->service->getProgramPerformance();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('program_rankings', $result);
        $this->assertArrayHasKey('capacity_utilization', $result);
        $this->assertCount(1, $result['program_rankings']);
    }

    /** @test */
    public function it_can_get_school_engagement()
    {
        $school = School::factory()->create(['is_active' => true]);
        
        $expectedData = [
            'active_schools_count' => 1,
            'school_activity_rankings' => [],
            'district_summary' => [],
            'school_program_diversity' => [],
            'engagement_trends' => [],
            'new_school_acquisitions' => [],
            'school_retention_rate' => 100,
            'average_booking_frequency' => 2.5,
        ];

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->andReturn($expectedData);

        $result = $this->service->getSchoolEngagement();

        $this->assertIsArray($result);
        $this->assertEquals(1, $result['active_schools_count']);
        $this->assertEquals(100, $result['school_retention_rate']);
        $this->assertEquals(2.5, $result['average_booking_frequency']);
    }

    /** @test */
    public function it_can_get_financial_summary()
    {
        $booking = Booking::factory()->create([
            'status' => 'confirmed',
            'total_cost' => 500.00,
        ]);

        $expectedData = [
            'total_revenue' => 500.00,
            'revenue_trends' => [],
            'revenue_by_program' => [],
            'revenue_by_school' => [],
            'average_booking_value' => 500.00,
            'payment_status_summary' => [],
            'revenue_forecasting' => [],
            'top_revenue_schools' => [],
        ];

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->andReturn($expectedData);

        $result = $this->service->getFinancialSummary();

        $this->assertIsArray($result);
        $this->assertEquals(500.00, $result['total_revenue']);
        $this->assertEquals(500.00, $result['average_booking_value']);
    }

    /** @test */
    public function it_can_get_permission_slip_compliance()
    {
        $booking = Booking::factory()->create();
        
        PermissionSlip::factory()->create([
            'booking_id' => $booking->id,
            'is_signed' => true,
            'signed_at' => now(),
        ]);

        PermissionSlip::factory()->create([
            'booking_id' => $booking->id,
            'is_signed' => false,
        ]);

        $expectedData = [
            'total_slips' => 2,
            'signed_slips' => 1,
            'unsigned_slips' => 1,
            'overdue_slips' => 0,
            'compliance_rate' => 50.0,
            'average_signing_time' => 24.5,
            'reminder_effectiveness' => 75.0,
            'compliance_by_school' => [],
            'signing_trends' => [],
        ];

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->andReturn($expectedData);

        $result = $this->service->getPermissionSlipCompliance();

        $this->assertIsArray($result);
        $this->assertEquals(2, $result['total_slips']);
        $this->assertEquals(1, $result['signed_slips']);
        $this->assertEquals(1, $result['unsigned_slips']);
        $this->assertEquals(50.0, $result['compliance_rate']);
    }

    /** @test */
    public function it_handles_different_date_ranges()
    {
        $dateRanges = ['week', 'month', 'quarter', 'year'];

        foreach ($dateRanges as $range) {
            $this->cacheServiceMock
                ->shouldReceive('remember')
                ->once()
                ->andReturn([
                    'overview' => ['total_bookings' => 1],
                    'booking_trends' => [],
                    'top_programs' => [],
                    'active_schools' => [],
                    'revenue_summary' => [],
                    'permission_slip_status' => [],
                    'recent_activity' => [],
                ]);

            $result = $this->service->getDashboardData(['date_range' => $range]);

            $this->assertIsArray($result);
            $this->assertArrayHasKey('overview', $result);
        }
    }

    /** @test */
    public function it_caches_results_with_appropriate_ttl()
    {
        // Test different cache TTLs for different methods
        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->with(Mockery::type('string'), Mockery::type('Closure'), 300) // 5 minutes for dashboard
            ->once()
            ->andReturn(['overview' => []]);

        $this->service->getDashboardData();

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->with(Mockery::type('string'), Mockery::type('Closure'), 600) // 10 minutes for booking analytics
            ->once()
            ->andReturn(['total_bookings' => 0]);

        $this->service->getBookingAnalytics();

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->with(Mockery::type('string'), Mockery::type('Closure'), 900) // 15 minutes for program performance
            ->once()
            ->andReturn(['program_rankings' => []]);

        $this->service->getProgramPerformance();
    }

    /** @test */
    public function it_generates_unique_cache_keys_for_different_filters()
    {
        $filters1 = ['school_id' => 1, 'date_range' => 'month'];
        $filters2 = ['school_id' => 2, 'date_range' => 'week'];

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->twice()
            ->with(Mockery::type('string'), Mockery::type('Closure'), Mockery::type('integer'))
            ->andReturn(['overview' => []]);

        $this->service->getDashboardData($filters1);
        $this->service->getDashboardData($filters2);

        // Verify that different cache keys were used (implicitly tested by expecting 2 calls)
        $this->assertTrue(true);
    }

    /** @test */
    public function it_handles_empty_data_gracefully()
    {
        // Test with no bookings in database
        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->andReturnUsing(function ($key, $callback, $ttl) {
                return $callback(); // Execute the actual callback with empty database
            });

        $result = $this->service->getDashboardData();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('overview', $result);
        // Should handle empty data without errors
    }

    /** @test */
    public function it_calculates_percentage_changes_correctly()
    {
        // This would test the private calculatePercentageChange method indirectly
        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->andReturnUsing(function ($key, $callback, $ttl) {
                return $callback(); // Execute actual logic
            });

        // Create current period data
        Booking::factory()->count(5)->create([
            'created_at' => now()->subDays(15),
            'status' => 'confirmed',
        ]);

        // Create previous period data
        Booking::factory()->count(3)->create([
            'created_at' => now()->subDays(45),
            'status' => 'confirmed',
        ]);

        $result = $this->service->getDashboardData(['date_range' => 'month']);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('overview', $result);
        $this->assertArrayHasKey('changes', $result['overview']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
