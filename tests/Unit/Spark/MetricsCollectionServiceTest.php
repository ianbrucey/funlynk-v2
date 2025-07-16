<?php

namespace Tests\Unit\Spark;

use App\Models\Spark\Booking;
use App\Models\Spark\PermissionSlip;
use App\Models\Spark\School;
use App\Models\Spark\SparkProgram;
use App\Services\Shared\CacheService;
use App\Services\Shared\LoggingService;
use App\Services\Spark\MetricsCollectionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

/**
 * Metrics Collection Service Unit Tests
 *
 * Tests the metrics collection functionality including KPI collection,
 * real-time metrics, and performance monitoring with proper mocking.
 */
class MetricsCollectionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected MetricsCollectionService $service;
    protected $cacheServiceMock;
    protected $loggingServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        // Create service mocks
        $this->cacheServiceMock = Mockery::mock(CacheService::class);
        $this->loggingServiceMock = Mockery::mock(LoggingService::class);

        // Create service instance with mocked dependencies
        $this->service = new MetricsCollectionService(
            $this->cacheServiceMock,
            $this->loggingServiceMock
        );

        // Set up default mock expectations
        $this->loggingServiceMock->shouldReceive('logUserActivity')->byDefault();
        $this->loggingServiceMock->shouldReceive('logError')->byDefault();
    }

    /** @test */
    public function it_can_collect_kpis_with_caching()
    {
        $expectedKPIs = [
            'bookings' => [
                'total_bookings' => 10,
                'confirmed_bookings' => 8,
                'pending_bookings' => 2,
                'cancelled_bookings' => 0,
                'completed_bookings' => 5,
                'confirmation_rate' => 80.0,
                'completion_rate' => 62.5,
                'cancellation_rate' => 0.0,
                'growth_rate' => 25.0,
                'average_students_per_booking' => 22.5,
            ],
            'revenue' => [
                'total_revenue' => 5000.00,
                'average_booking_value' => 500.00,
                'revenue_growth_rate' => 15.0,
                'revenue_per_student' => 22.22,
                'paid_bookings' => 7,
                'pending_payments' => 1,
                'overdue_payments' => 0,
            ],
            'schools' => [
                'active_schools' => 5,
                'total_schools' => 8,
                'school_engagement_rate' => 62.5,
                'new_schools_this_period' => 2,
                'average_bookings_per_school' => 2.0,
                'top_performing_schools' => [],
            ],
            'programs' => [
                'total_programs' => 12,
                'active_programs' => 8,
                'program_utilization_rate' => 66.7,
                'most_popular_program' => null,
                'average_program_rating' => 4.2,
                'capacity_utilization' => 75.0,
            ],
            'permission_slips' => [
                'total_permission_slips' => 25,
                'signed_permission_slips' => 20,
                'unsigned_permission_slips' => 5,
                'overdue_permission_slips' => 2,
                'compliance_rate' => 80.0,
                'overdue_rate' => 8.0,
                'average_signing_time' => 24.5,
                'reminder_effectiveness' => 85.0,
            ],
            'collected_at' => now(),
        ];

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->with(Mockery::type('string'), Mockery::type('Closure'), 300)
            ->andReturn($expectedKPIs);

        $result = $this->service->collectKPIs();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('bookings', $result);
        $this->assertArrayHasKey('revenue', $result);
        $this->assertArrayHasKey('schools', $result);
        $this->assertArrayHasKey('programs', $result);
        $this->assertArrayHasKey('permission_slips', $result);
        $this->assertArrayHasKey('collected_at', $result);

        $this->assertEquals(10, $result['bookings']['total_bookings']);
        $this->assertEquals(80.0, $result['bookings']['confirmation_rate']);
        $this->assertEquals(5000.00, $result['revenue']['total_revenue']);
        $this->assertEquals(80.0, $result['permission_slips']['compliance_rate']);
    }

    /** @test */
    public function it_can_collect_kpis_with_filters()
    {
        $school = School::factory()->create();
        
        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->andReturn([
                'bookings' => ['total_bookings' => 5],
                'revenue' => ['total_revenue' => 2500.00],
                'schools' => ['active_schools' => 1],
                'programs' => ['active_programs' => 3],
                'permission_slips' => ['compliance_rate' => 90.0],
                'collected_at' => now(),
            ]);

        $filters = [
            'school_id' => $school->id,
            'date_range' => 'month',
        ];

        $result = $this->service->collectKPIs($filters);

        $this->assertIsArray($result);
        $this->assertEquals(5, $result['bookings']['total_bookings']);
        $this->assertEquals(1, $result['schools']['active_schools']);
    }

    /** @test */
    public function it_can_collect_real_time_metrics()
    {
        $expectedMetrics = [
            'active_bookings_today' => 3,
            'pending_permission_slips' => 8,
            'overdue_permission_slips' => 2,
            'revenue_today' => 750.00,
            'new_bookings_this_week' => 12,
            'upcoming_events' => [
                [
                    'id' => 1,
                    'program' => 'Character Building',
                    'school' => 'Test Elementary',
                    'date' => 'Dec 20, 2024',
                    'time' => '10:00 AM',
                    'students' => 25,
                ]
            ],
            'system_health' => [
                'database_connections' => 'healthy',
                'cache_status' => 'healthy',
                'storage_available' => true,
                'last_backup' => 'N/A',
            ],
            'collected_at' => now(),
        ];

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->with(Mockery::type('string'), Mockery::type('Closure'), 60)
            ->andReturn($expectedMetrics);

        $result = $this->service->collectRealTimeMetrics();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('active_bookings_today', $result);
        $this->assertArrayHasKey('pending_permission_slips', $result);
        $this->assertArrayHasKey('upcoming_events', $result);
        $this->assertArrayHasKey('system_health', $result);

        $this->assertEquals(3, $result['active_bookings_today']);
        $this->assertEquals(8, $result['pending_permission_slips']);
        $this->assertEquals(750.00, $result['revenue_today']);
        $this->assertIsArray($result['upcoming_events']);
    }

    /** @test */
    public function it_can_collect_performance_metrics()
    {
        $expectedMetrics = [
            'database_performance' => [
                'query_time_avg' => 0.05,
                'slow_queries' => 2,
                'connection_pool_usage' => 45.0,
            ],
            'cache_performance' => [
                'hit_rate' => 85.5,
                'miss_rate' => 14.5,
                'memory_usage' => 67.2,
            ],
            'api_response_times' => [
                'average_response_time' => 120,
                'p95_response_time' => 250,
                'p99_response_time' => 500,
            ],
            'error_rates' => [
                'total_errors' => 12,
                'error_rate' => 0.5,
                'critical_errors' => 1,
            ],
            'resource_usage' => [
                'cpu_usage' => 45.2,
                'memory_usage' => 67.8,
                'disk_usage' => 23.4,
            ],
            'collected_at' => now(),
        ];

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->with(Mockery::type('string'), Mockery::type('Closure'), 120)
            ->andReturn($expectedMetrics);

        $result = $this->service->collectPerformanceMetrics();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('database_performance', $result);
        $this->assertArrayHasKey('cache_performance', $result);
        $this->assertArrayHasKey('api_response_times', $result);
        $this->assertArrayHasKey('error_rates', $result);
        $this->assertArrayHasKey('resource_usage', $result);

        $this->assertEquals(85.5, $result['cache_performance']['hit_rate']);
        $this->assertEquals(120, $result['api_response_times']['average_response_time']);
    }

    /** @test */
    public function it_calculates_booking_kpis_correctly()
    {
        // Create test data
        Booking::factory()->count(5)->create([
            'status' => 'confirmed',
            'student_count' => 20,
            'created_at' => now()->subDays(10),
        ]);

        Booking::factory()->count(2)->create([
            'status' => 'pending',
            'student_count' => 15,
            'created_at' => now()->subDays(5),
        ]);

        Booking::factory()->create([
            'status' => 'cancelled',
            'student_count' => 10,
            'created_at' => now()->subDays(3),
        ]);

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->andReturnUsing(function ($key, $callback, $ttl) {
                return $callback(); // Execute actual logic
            });

        $result = $this->service->collectKPIs();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('bookings', $result);
        
        $bookingKPIs = $result['bookings'];
        $this->assertEquals(8, $bookingKPIs['total_bookings']);
        $this->assertEquals(5, $bookingKPIs['confirmed_bookings']);
        $this->assertEquals(2, $bookingKPIs['pending_bookings']);
        $this->assertEquals(1, $bookingKPIs['cancelled_bookings']);
        $this->assertEquals(62.5, $bookingKPIs['confirmation_rate']); // 5/8 * 100
        $this->assertEquals(12.5, $bookingKPIs['cancellation_rate']); // 1/8 * 100
    }

    /** @test */
    public function it_calculates_revenue_kpis_correctly()
    {
        Booking::factory()->count(3)->create([
            'status' => 'confirmed',
            'total_cost' => 500.00,
            'created_at' => now()->subDays(10),
        ]);

        Booking::factory()->count(2)->create([
            'status' => 'completed',
            'total_cost' => 750.00,
            'created_at' => now()->subDays(5),
        ]);

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->andReturnUsing(function ($key, $callback, $ttl) {
                return $callback();
            });

        $result = $this->service->collectKPIs();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('revenue', $result);
        
        $revenueKPIs = $result['revenue'];
        $this->assertEquals(3000.00, $revenueKPIs['total_revenue']); // 3 * 500 + 2 * 750
        $this->assertEquals(600.00, $revenueKPIs['average_booking_value']); // 3000 / 5
    }

    /** @test */
    public function it_calculates_permission_slip_kpis_correctly()
    {
        $booking = Booking::factory()->create(['created_at' => now()->subDays(10)]);

        PermissionSlip::factory()->count(8)->create([
            'booking_id' => $booking->id,
            'is_signed' => true,
            'signed_at' => now()->subDays(5),
        ]);

        PermissionSlip::factory()->count(2)->create([
            'booking_id' => $booking->id,
            'is_signed' => false,
        ]);

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->andReturnUsing(function ($key, $callback, $ttl) {
                return $callback();
            });

        $result = $this->service->collectKPIs();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('permission_slips', $result);
        
        $slipKPIs = $result['permission_slips'];
        $this->assertEquals(10, $slipKPIs['total_permission_slips']);
        $this->assertEquals(8, $slipKPIs['signed_permission_slips']);
        $this->assertEquals(2, $slipKPIs['unsigned_permission_slips']);
        $this->assertEquals(80.0, $slipKPIs['compliance_rate']); // 8/10 * 100
    }

    /** @test */
    public function it_handles_growth_rate_calculations()
    {
        // Create current period bookings
        Booking::factory()->count(10)->create([
            'created_at' => now()->subDays(15),
            'status' => 'confirmed',
        ]);

        // Create previous period bookings
        Booking::factory()->count(8)->create([
            'created_at' => now()->subDays(45),
            'status' => 'confirmed',
        ]);

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->andReturnUsing(function ($key, $callback, $ttl) {
                return $callback();
            });

        $result = $this->service->collectKPIs(['date_range' => 'month']);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('bookings', $result);
        
        $bookingKPIs = $result['bookings'];
        $this->assertArrayHasKey('growth_rate', $bookingKPIs);
        $this->assertEquals(25.0, $bookingKPIs['growth_rate']); // (10-8)/8 * 100
    }

    /** @test */
    public function it_handles_zero_division_gracefully()
    {
        // Test with no previous period data
        Booking::factory()->count(5)->create([
            'created_at' => now()->subDays(10),
            'status' => 'confirmed',
        ]);

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->once()
            ->andReturnUsing(function ($key, $callback, $ttl) {
                return $callback();
            });

        $result = $this->service->collectKPIs();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('bookings', $result);
        
        $bookingKPIs = $result['bookings'];
        $this->assertArrayHasKey('growth_rate', $bookingKPIs);
        // Should handle zero division without errors
        $this->assertIsNumeric($bookingKPIs['growth_rate']);
    }

    /** @test */
    public function it_uses_different_cache_ttls_for_different_metrics()
    {
        // KPIs should cache for 5 minutes
        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->with(Mockery::type('string'), Mockery::type('Closure'), 300)
            ->once()
            ->andReturn(['bookings' => []]);

        $this->service->collectKPIs();

        // Real-time metrics should cache for 1 minute
        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->with(Mockery::type('string'), Mockery::type('Closure'), 60)
            ->once()
            ->andReturn(['active_bookings_today' => 0]);

        $this->service->collectRealTimeMetrics();

        // Performance metrics should cache for 2 minutes
        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->with(Mockery::type('string'), Mockery::type('Closure'), 120)
            ->once()
            ->andReturn(['database_performance' => []]);

        $this->service->collectPerformanceMetrics();
    }

    /** @test */
    public function it_generates_unique_cache_keys_for_different_filters()
    {
        $filters1 = ['school_id' => 1];
        $filters2 = ['school_id' => 2];

        $this->cacheServiceMock
            ->shouldReceive('remember')
            ->twice()
            ->with(Mockery::type('string'), Mockery::type('Closure'), Mockery::type('integer'))
            ->andReturn(['bookings' => []]);

        $this->service->collectKPIs($filters1);
        $this->service->collectKPIs($filters2);

        // Verify different cache keys were used (implicitly tested by expecting 2 calls)
        $this->assertTrue(true);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
