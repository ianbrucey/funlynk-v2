<?php

namespace App\Services\Spark;

use App\Models\Spark\Booking;
use App\Models\Spark\SparkProgram;
use App\Models\Spark\School;
use App\Models\Spark\PermissionSlip;
use App\Services\Shared\CacheService;
use App\Services\Shared\LoggingService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

/**
 * Metrics Collection Service
 *
 * Handles real-time metrics collection, aggregation, and caching for
 * performance optimization. Provides efficient data collection methods
 * for analytics and reporting systems.
 */
class MetricsCollectionService
{
    public function __construct(
        private CacheService $cacheService,
        private LoggingService $loggingService
    ) {}

    /**
     * Collect and cache key performance indicators.
     *
     * @param array $filters
     * @return array
     */
    public function collectKPIs(array $filters = []): array
    {
        $cacheKey = 'metrics.kpis.' . md5(serialize($filters));
        
        return $this->cacheService->remember($cacheKey, function () use ($filters) {
            $dateRange = $this->getDateRange($filters['date_range'] ?? 'month');
            $schoolId = $filters['school_id'] ?? null;

            return [
                'bookings' => $this->collectBookingKPIs($dateRange, $schoolId),
                'revenue' => $this->collectRevenueKPIs($dateRange, $schoolId),
                'schools' => $this->collectSchoolKPIs($dateRange, $schoolId),
                'programs' => $this->collectProgramKPIs($dateRange, $schoolId),
                'permission_slips' => $this->collectPermissionSlipKPIs($dateRange, $schoolId),
                'collected_at' => now(),
            ];
        }, 300); // Cache for 5 minutes
    }

    /**
     * Collect real-time metrics for dashboard.
     *
     * @param array $filters
     * @return array
     */
    public function collectRealTimeMetrics(array $filters = []): array
    {
        $cacheKey = 'metrics.realtime.' . md5(serialize($filters));
        
        return $this->cacheService->remember($cacheKey, function () use ($filters) {
            $schoolId = $filters['school_id'] ?? null;

            return [
                'active_bookings_today' => $this->getActiveBookingsToday($schoolId),
                'pending_permission_slips' => $this->getPendingPermissionSlips($schoolId),
                'overdue_permission_slips' => $this->getOverduePermissionSlips($schoolId),
                'revenue_today' => $this->getRevenueToday($schoolId),
                'new_bookings_this_week' => $this->getNewBookingsThisWeek($schoolId),
                'upcoming_events' => $this->getUpcomingEvents($schoolId, 7),
                'system_health' => $this->getSystemHealthMetrics(),
                'collected_at' => now(),
            ];
        }, 60); // Cache for 1 minute
    }

    /**
     * Collect performance metrics for system monitoring.
     *
     * @return array
     */
    public function collectPerformanceMetrics(): array
    {
        $cacheKey = 'metrics.performance';
        
        return $this->cacheService->remember($cacheKey, function () {
            return [
                'database_performance' => $this->getDatabasePerformanceMetrics(),
                'cache_performance' => $this->getCachePerformanceMetrics(),
                'api_response_times' => $this->getApiResponseTimeMetrics(),
                'error_rates' => $this->getErrorRateMetrics(),
                'resource_usage' => $this->getResourceUsageMetrics(),
                'collected_at' => now(),
            ];
        }, 120); // Cache for 2 minutes
    }

    /**
     * Get specific metrics by keys.
     *
     * @param array $metricKeys
     * @param array $filters
     * @return array
     */
    public function getSpecificMetrics(array $metricKeys, array $filters = []): array
    {
        $cacheKey = 'metrics.specific.' . md5(serialize($metricKeys) . serialize($filters));

        return $this->cacheService->remember($cacheKey, function () use ($metricKeys, $filters) {
            $dateRange = $this->getDateRange($filters['date_range'] ?? 'month');
            $schoolId = $filters['school_id'] ?? null;
            $result = [];

            foreach ($metricKeys as $key) {
                $result[$key] = $this->getMetricByKey($key, $dateRange, $schoolId, $filters);
            }

            return $result;
        }, 300); // Cache for 5 minutes
    }

    /**
     * Get individual metric by key.
     *
     * @param string $key
     * @param array $dateRange
     * @param int|null $schoolId
     * @param array $filters
     * @return mixed
     */
    private function getMetricByKey(string $key, array $dateRange, ?int $schoolId, array $filters)
    {
        return match ($key) {
            'total_bookings' => $this->getTotalBookings($dateRange, $schoolId),
            'confirmed_bookings' => $this->getConfirmedBookings($dateRange, $schoolId),
            'total_revenue' => $this->getTotalRevenue($dateRange, $schoolId),
            'active_schools' => $this->getActiveSchools($dateRange, $schoolId),
            'signed_permission_slips' => $this->getSignedPermissionSlips($dateRange, $schoolId),
            'overdue_permission_slips' => $this->getOverduePermissionSlips($schoolId),
            default => null,
        };
    }

    /**
     * Get total bookings for period.
     */
    private function getTotalBookings(array $dateRange, ?int $schoolId): int
    {
        $query = Booking::whereBetween('created_at', $dateRange);
        if ($schoolId) $query->where('school_id', $schoolId);
        return $query->count();
    }

    /**
     * Get confirmed bookings for period.
     */
    private function getConfirmedBookings(array $dateRange, ?int $schoolId): int
    {
        $query = Booking::whereBetween('created_at', $dateRange)->confirmed();
        if ($schoolId) $query->where('school_id', $schoolId);
        return $query->count();
    }

    /**
     * Get total revenue for period.
     */
    private function getTotalRevenue(array $dateRange, ?int $schoolId): float
    {
        $query = Booking::whereBetween('created_at', $dateRange)->whereIn('status', ['confirmed', 'completed']);
        if ($schoolId) $query->where('school_id', $schoolId);
        return $query->sum('total_cost');
    }

    /**
     * Get active schools for period.
     */
    private function getActiveSchools(array $dateRange, ?int $schoolId): int
    {
        $query = School::whereHas('bookings', function ($q) use ($dateRange) {
            $q->whereBetween('created_at', $dateRange);
        });
        if ($schoolId) $query->where('id', $schoolId);
        return $query->count();
    }

    /**
     * Get signed permission slips for period.
     */
    private function getSignedPermissionSlips(array $dateRange, ?int $schoolId): int
    {
        $query = PermissionSlip::signed()->whereHas('booking', function ($q) use ($dateRange) {
            $q->whereBetween('created_at', $dateRange);
        });
        if ($schoolId) {
            $query->whereHas('booking', function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            });
        }
        return $query->count();
    }

    /**
     * Collect booking KPIs.
     *
     * @param array $dateRange
     * @param int|null $schoolId
     * @return array
     */
    private function collectBookingKPIs(array $dateRange, ?int $schoolId = null): array
    {
        $query = Booking::whereBetween('created_at', $dateRange);
        if ($schoolId) {
            $query->where('school_id', $schoolId);
        }

        $total = $query->count();
        $confirmed = (clone $query)->confirmed()->count();
        $pending = (clone $query)->pending()->count();
        $cancelled = (clone $query)->cancelled()->count();
        $completed = (clone $query)->completed()->count();

        // Calculate previous period for comparison
        $previousPeriod = $this->getPreviousPeriod($dateRange);
        $previousQuery = Booking::whereBetween('created_at', $previousPeriod);
        if ($schoolId) {
            $previousQuery->where('school_id', $schoolId);
        }
        $previousTotal = $previousQuery->count();

        return [
            'total_bookings' => $total,
            'confirmed_bookings' => $confirmed,
            'pending_bookings' => $pending,
            'cancelled_bookings' => $cancelled,
            'completed_bookings' => $completed,
            'confirmation_rate' => $total > 0 ? round(($confirmed / $total) * 100, 2) : 0,
            'completion_rate' => $confirmed > 0 ? round(($completed / $confirmed) * 100, 2) : 0,
            'cancellation_rate' => $total > 0 ? round(($cancelled / $total) * 100, 2) : 0,
            'growth_rate' => $this->calculateGrowthRate($total, $previousTotal),
            'average_students_per_booking' => round($query->avg('student_count') ?? 0, 2),
        ];
    }

    /**
     * Collect revenue KPIs.
     *
     * @param array $dateRange
     * @param int|null $schoolId
     * @return array
     */
    private function collectRevenueKPIs(array $dateRange, ?int $schoolId = null): array
    {
        $query = Booking::whereBetween('created_at', $dateRange)
            ->whereIn('status', ['confirmed', 'completed']);
        
        if ($schoolId) {
            $query->where('school_id', $schoolId);
        }

        $totalRevenue = $query->sum('total_cost');
        $bookingCount = $query->count();
        $averageBookingValue = $bookingCount > 0 ? $totalRevenue / $bookingCount : 0;

        // Previous period comparison
        $previousPeriod = $this->getPreviousPeriod($dateRange);
        $previousQuery = Booking::whereBetween('created_at', $previousPeriod)
            ->whereIn('status', ['confirmed', 'completed']);
        if ($schoolId) {
            $previousQuery->where('school_id', $schoolId);
        }
        $previousRevenue = $previousQuery->sum('total_cost');

        return [
            'total_revenue' => $totalRevenue,
            'average_booking_value' => round($averageBookingValue, 2),
            'revenue_growth_rate' => $this->calculateGrowthRate($totalRevenue, $previousRevenue),
            'revenue_per_student' => $this->calculateRevenuePerStudent($query),
            'paid_bookings' => (clone $query)->where('payment_status', 'paid')->count(),
            'pending_payments' => (clone $query)->where('payment_status', 'pending')->count(),
            'overdue_payments' => (clone $query)->where('payment_status', 'overdue')->count(),
        ];
    }

    /**
     * Collect school KPIs.
     *
     * @param array $dateRange
     * @param int|null $schoolId
     * @return array
     */
    private function collectSchoolKPIs(array $dateRange, ?int $schoolId = null): array
    {
        $activeSchoolsQuery = School::whereHas('bookings', function ($query) use ($dateRange) {
            $query->whereBetween('created_at', $dateRange);
        });

        if ($schoolId) {
            $activeSchoolsQuery->where('id', $schoolId);
        }

        $activeSchools = $activeSchoolsQuery->count();
        $totalSchools = School::active()->count();

        return [
            'active_schools' => $activeSchools,
            'total_schools' => $totalSchools,
            'school_engagement_rate' => $totalSchools > 0 ? round(($activeSchools / $totalSchools) * 100, 2) : 0,
            'new_schools_this_period' => $this->getNewSchoolsCount($dateRange),
            'average_bookings_per_school' => $this->getAverageBookingsPerSchool($dateRange, $schoolId),
            'top_performing_schools' => $this->getTopPerformingSchools($dateRange, 5),
        ];
    }

    /**
     * Collect program KPIs.
     *
     * @param array $dateRange
     * @param int|null $schoolId
     * @return array
     */
    private function collectProgramKPIs(array $dateRange, ?int $schoolId = null): array
    {
        $bookingsQuery = Booking::whereBetween('created_at', $dateRange);
        if ($schoolId) {
            $bookingsQuery->where('school_id', $schoolId);
        }

        $totalPrograms = SparkProgram::active()->count();
        $activePrograms = $bookingsQuery->distinct('program_id')->count();

        return [
            'total_programs' => $totalPrograms,
            'active_programs' => $activePrograms,
            'program_utilization_rate' => $totalPrograms > 0 ? round(($activePrograms / $totalPrograms) * 100, 2) : 0,
            'most_popular_program' => $this->getMostPopularProgram($dateRange, $schoolId),
            'average_program_rating' => $this->getAverageProgramRating($dateRange, $schoolId),
            'capacity_utilization' => $this->getOverallCapacityUtilization($dateRange, $schoolId),
        ];
    }

    /**
     * Collect permission slip KPIs.
     *
     * @param array $dateRange
     * @param int|null $schoolId
     * @return array
     */
    private function collectPermissionSlipKPIs(array $dateRange, ?int $schoolId = null): array
    {
        $slipsQuery = PermissionSlip::whereHas('booking', function ($query) use ($dateRange) {
            $query->whereBetween('created_at', $dateRange);
        });

        if ($schoolId) {
            $slipsQuery->whereHas('booking', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            });
        }

        $total = $slipsQuery->count();
        $signed = (clone $slipsQuery)->signed()->count();
        $overdue = (clone $slipsQuery)->overdue()->count();

        return [
            'total_permission_slips' => $total,
            'signed_permission_slips' => $signed,
            'unsigned_permission_slips' => $total - $signed,
            'overdue_permission_slips' => $overdue,
            'compliance_rate' => $total > 0 ? round(($signed / $total) * 100, 2) : 0,
            'overdue_rate' => $total > 0 ? round(($overdue / $total) * 100, 2) : 0,
            'average_signing_time' => $this->getAverageSigningTime($slipsQuery),
            'reminder_effectiveness' => $this->getReminderEffectiveness($slipsQuery),
        ];
    }

    /**
     * Get active bookings for today.
     *
     * @param int|null $schoolId
     * @return int
     */
    private function getActiveBookingsToday(?int $schoolId = null): int
    {
        $query = Booking::whereDate('confirmed_date', today())
            ->whereIn('status', ['confirmed', 'completed']);

        if ($schoolId) {
            $query->where('school_id', $schoolId);
        }

        return $query->count();
    }

    /**
     * Get pending permission slips count.
     *
     * @param int|null $schoolId
     * @return int
     */
    private function getPendingPermissionSlips(?int $schoolId = null): int
    {
        $query = PermissionSlip::unsigned();

        if ($schoolId) {
            $query->whereHas('booking', function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            });
        }

        return $query->count();
    }

    /**
     * Get overdue permission slips count.
     *
     * @param int|null $schoolId
     * @return int
     */
    private function getOverduePermissionSlips(?int $schoolId = null): int
    {
        $query = PermissionSlip::overdue();

        if ($schoolId) {
            $query->whereHas('booking', function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            });
        }

        return $query->count();
    }

    /**
     * Get today's revenue.
     *
     * @param int|null $schoolId
     * @return float
     */
    private function getRevenueToday(?int $schoolId = null): float
    {
        $query = Booking::whereDate('created_at', today())
            ->whereIn('status', ['confirmed', 'completed']);

        if ($schoolId) {
            $query->where('school_id', $schoolId);
        }

        return $query->sum('total_cost');
    }

    /**
     * Get new bookings this week.
     *
     * @param int|null $schoolId
     * @return int
     */
    private function getNewBookingsThisWeek(?int $schoolId = null): int
    {
        $query = Booking::whereBetween('created_at', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);

        if ($schoolId) {
            $query->where('school_id', $schoolId);
        }

        return $query->count();
    }

    /**
     * Get upcoming events.
     *
     * @param int|null $schoolId
     * @param int $days
     * @return array
     */
    private function getUpcomingEvents(?int $schoolId = null, int $days = 7): array
    {
        $query = Booking::whereBetween('confirmed_date', [
            now()->toDateString(),
            now()->addDays($days)->toDateString()
        ])
        ->whereIn('status', ['confirmed'])
        ->with(['school', 'program'])
        ->orderBy('confirmed_date');

        if ($schoolId) {
            $query->where('school_id', $schoolId);
        }

        return $query->limit(10)->get()->map(function ($booking) {
            return [
                'id' => $booking->id,
                'program' => $booking->program->title,
                'school' => $booking->school->name,
                'date' => $booking->confirmed_date->format('M j, Y'),
                'time' => $booking->confirmed_time?->format('g:i A'),
                'students' => $booking->student_count,
            ];
        })->toArray();
    }

    /**
     * Get system health metrics.
     *
     * @return array
     */
    private function getSystemHealthMetrics(): array
    {
        return [
            'database_connections' => DB::connection()->getPdo() ? 'healthy' : 'unhealthy',
            'cache_status' => $this->cacheService->get('health_check', 'healthy'),
            'storage_available' => disk_free_space(storage_path()) > 1000000000, // 1GB
            'last_backup' => 'N/A', // Would be implemented with actual backup system
        ];
    }

    /**
     * Calculate growth rate between two values.
     *
     * @param float $current
     * @param float $previous
     * @return float
     */
    private function calculateGrowthRate(float $current, float $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 2);
    }

    /**
     * Get date range based on period.
     *
     * @param string $period
     * @return array
     */
    private function getDateRange(string $period): array
    {
        $now = Carbon::now();
        
        return match ($period) {
            'week' => [$now->copy()->subWeek(), $now],
            'month' => [$now->copy()->subMonth(), $now],
            'quarter' => [$now->copy()->subQuarter(), $now],
            'year' => [$now->copy()->subYear(), $now],
            default => [$now->copy()->subMonth(), $now],
        };
    }

    /**
     * Get previous period for comparison.
     *
     * @param array $dateRange
     * @return array
     */
    private function getPreviousPeriod(array $dateRange): array
    {
        $start = Carbon::parse($dateRange[0]);
        $end = Carbon::parse($dateRange[1]);
        $duration = $start->diffInDays($end);

        return [
            $start->copy()->subDays($duration + 1),
            $start->copy()->subDay(),
        ];
    }

    // Additional helper methods would be implemented here...
    // For brevity, I'm including placeholders for the remaining methods

    private function calculateRevenuePerStudent($query): float { return 0; }
    private function getNewSchoolsCount(array $dateRange): int { return 0; }
    private function getAverageBookingsPerSchool(array $dateRange, ?int $schoolId): float { return 0; }
    private function getTopPerformingSchools(array $dateRange, int $limit): array { return []; }
    private function getMostPopularProgram(array $dateRange, ?int $schoolId): ?array { return null; }
    private function getAverageProgramRating(array $dateRange, ?int $schoolId): float { return 0; }
    private function getOverallCapacityUtilization(array $dateRange, ?int $schoolId): float { return 0; }
    private function getAverageSigningTime($query): float { return 0; }
    private function getReminderEffectiveness($query): float { return 0; }
    private function getDatabasePerformanceMetrics(): array { return []; }
    private function getCachePerformanceMetrics(): array { return []; }
    private function getApiResponseTimeMetrics(): array { return []; }
    private function getErrorRateMetrics(): array { return []; }
    private function getResourceUsageMetrics(): array { return []; }
}
