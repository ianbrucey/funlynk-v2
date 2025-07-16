<?php

namespace App\Services\Spark;

use App\Models\Spark\AnalyticsReport;
use App\Models\Spark\Booking;
use App\Models\Spark\SparkProgram;
use App\Models\Spark\School;
use App\Models\Spark\PermissionSlip;
use App\Models\User;
use App\Services\Shared\CacheService;
use App\Services\Shared\LoggingService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Exception;

/**
 * Analytics Service
 *
 * Provides comprehensive analytics and reporting functionality for the Spark
 * educational program system, including booking metrics, program performance,
 * school engagement, and financial reporting.
 */
class AnalyticsService
{
    public function __construct(
        private CacheService $cacheService,
        private LoggingService $loggingService
    ) {}

    /**
     * Get dashboard overview data.
     *
     * @param array $filters
     * @return array
     */
    public function getDashboardData(array $filters = []): array
    {
        $cacheKey = 'analytics.dashboard.' . md5(serialize($filters));
        
        return $this->cacheService->remember($cacheKey, function () use ($filters) {
            $dateRange = $this->getDateRange($filters['date_range'] ?? 'month');
            $schoolId = $filters['school_id'] ?? null;

            return [
                'overview' => $this->getOverviewMetrics($dateRange, $schoolId),
                'booking_trends' => $this->getBookingTrends($dateRange, $schoolId),
                'top_programs' => $this->getTopPrograms($dateRange, $schoolId, 5),
                'active_schools' => $this->getActiveSchools($dateRange, $schoolId),
                'revenue_summary' => $this->getRevenueSummary($dateRange, $schoolId),
                'permission_slip_status' => $this->getPermissionSlipStatus($dateRange, $schoolId),
                'recent_activity' => $this->getRecentActivity($schoolId, 10),
            ];
        }, 300); // Cache for 5 minutes
    }

    /**
     * Get booking analytics data.
     *
     * @param array $filters
     * @return array
     */
    public function getBookingAnalytics(array $filters = []): array
    {
        $cacheKey = 'analytics.bookings.' . md5(serialize($filters));
        
        return $this->cacheService->remember($cacheKey, function () use ($filters) {
            $dateRange = $this->getDateRange($filters['date_range'] ?? 'month');
            $schoolId = $filters['school_id'] ?? null;
            $groupBy = $filters['group_by'] ?? 'day';

            $query = Booking::whereBetween('created_at', $dateRange);
            if ($schoolId) {
                $query->where('school_id', $schoolId);
            }

            return [
                'total_bookings' => $query->count(),
                'confirmed_bookings' => (clone $query)->confirmed()->count(),
                'pending_bookings' => (clone $query)->pending()->count(),
                'cancelled_bookings' => (clone $query)->cancelled()->count(),
                'completed_bookings' => (clone $query)->completed()->count(),
                'completion_rate' => $this->calculateCompletionRate($query),
                'average_students_per_booking' => $this->getAverageStudentsPerBooking($query),
                'booking_trends' => $this->getBookingTrendsByPeriod($query, $groupBy),
                'status_distribution' => $this->getBookingStatusDistribution($query),
                'popular_time_slots' => $this->getPopularTimeSlots($query),
                'booking_lead_time' => $this->getBookingLeadTime($query),
            ];
        }, 600); // Cache for 10 minutes
    }

    /**
     * Get program performance metrics.
     *
     * @param array $filters
     * @return array
     */
    public function getProgramPerformance(array $filters = []): array
    {
        $cacheKey = 'analytics.programs.' . md5(serialize($filters));
        
        return $this->cacheService->remember($cacheKey, function () use ($filters) {
            $dateRange = $this->getDateRange($filters['date_range'] ?? 'month');
            $schoolId = $filters['school_id'] ?? null;

            $bookingsQuery = Booking::whereBetween('created_at', $dateRange);
            if ($schoolId) {
                $bookingsQuery->where('school_id', $schoolId);
            }

            return [
                'program_rankings' => $this->getProgramRankings($bookingsQuery),
                'capacity_utilization' => $this->getCapacityUtilization($bookingsQuery),
                'program_ratings' => $this->getProgramRatings($bookingsQuery),
                'revenue_by_program' => $this->getRevenueByProgram($bookingsQuery),
                'program_trends' => $this->getProgramTrends($bookingsQuery),
                'grade_level_distribution' => $this->getGradeLevelDistribution($bookingsQuery),
                'character_topic_popularity' => $this->getCharacterTopicPopularity($bookingsQuery),
                'program_duration_analysis' => $this->getProgramDurationAnalysis($bookingsQuery),
            ];
        }, 900); // Cache for 15 minutes
    }

    /**
     * Get school engagement metrics.
     *
     * @param array $filters
     * @return array
     */
    public function getSchoolEngagement(array $filters = []): array
    {
        $cacheKey = 'analytics.schools.' . md5(serialize($filters));
        
        return $this->cacheService->remember($cacheKey, function () use ($filters) {
            $dateRange = $this->getDateRange($filters['date_range'] ?? 'month');
            $districtId = $filters['district_id'] ?? null;

            $schoolsQuery = School::active();
            if ($districtId) {
                $schoolsQuery->where('district_id', $districtId);
            }

            return [
                'active_schools_count' => $schoolsQuery->count(),
                'school_activity_rankings' => $this->getSchoolActivityRankings($dateRange, $districtId),
                'district_summary' => $this->getDistrictSummary($dateRange, $districtId),
                'school_program_diversity' => $this->getSchoolProgramDiversity($dateRange, $districtId),
                'engagement_trends' => $this->getSchoolEngagementTrends($dateRange, $districtId),
                'new_school_acquisitions' => $this->getNewSchoolAcquisitions($dateRange, $districtId),
                'school_retention_rate' => $this->getSchoolRetentionRate($dateRange, $districtId),
                'average_booking_frequency' => $this->getAverageBookingFrequency($dateRange, $districtId),
            ];
        }, 1200); // Cache for 20 minutes
    }

    /**
     * Get financial summary data.
     *
     * @param array $filters
     * @return array
     */
    public function getFinancialSummary(array $filters = []): array
    {
        $cacheKey = 'analytics.financial.' . md5(serialize($filters));
        
        return $this->cacheService->remember($cacheKey, function () use ($filters) {
            $dateRange = $this->getDateRange($filters['date_range'] ?? 'month');
            $schoolId = $filters['school_id'] ?? null;
            $groupBy = $filters['group_by'] ?? 'month';

            $bookingsQuery = Booking::whereBetween('created_at', $dateRange)
                ->whereIn('status', ['confirmed', 'completed']);
            
            if ($schoolId) {
                $bookingsQuery->where('school_id', $schoolId);
            }

            return [
                'total_revenue' => $this->getTotalRevenue($bookingsQuery),
                'revenue_trends' => $this->getRevenueTrends($bookingsQuery, $groupBy),
                'revenue_by_program' => $this->getRevenueByProgram($bookingsQuery),
                'revenue_by_school' => $this->getRevenueBySchool($bookingsQuery),
                'average_booking_value' => $this->getAverageBookingValue($bookingsQuery),
                'payment_status_summary' => $this->getPaymentStatusSummary($bookingsQuery),
                'revenue_forecasting' => $this->getRevenueForecasting($bookingsQuery),
                'top_revenue_schools' => $this->getTopRevenueSchools($bookingsQuery, 10),
            ];
        }, 600); // Cache for 10 minutes
    }

    /**
     * Get permission slip compliance metrics.
     *
     * @param array $filters
     * @return array
     */
    public function getPermissionSlipCompliance(array $filters = []): array
    {
        $cacheKey = 'analytics.permission_slips.' . md5(serialize($filters));
        
        return $this->cacheService->remember($cacheKey, function () use ($filters) {
            $dateRange = $this->getDateRange($filters['date_range'] ?? 'month');
            $schoolId = $filters['school_id'] ?? null;

            $slipsQuery = PermissionSlip::whereHas('booking', function ($query) use ($dateRange) {
                $query->whereBetween('created_at', $dateRange);
            });

            if ($schoolId) {
                $slipsQuery->whereHas('booking', function ($query) use ($schoolId) {
                    $query->where('school_id', $schoolId);
                });
            }

            return [
                'total_slips' => $slipsQuery->count(),
                'signed_slips' => (clone $slipsQuery)->signed()->count(),
                'unsigned_slips' => (clone $slipsQuery)->unsigned()->count(),
                'overdue_slips' => (clone $slipsQuery)->overdue()->count(),
                'compliance_rate' => $this->calculateComplianceRate($slipsQuery),
                'average_signing_time' => $this->getAverageSigningTime($slipsQuery),
                'reminder_effectiveness' => $this->getReminderEffectiveness($slipsQuery),
                'compliance_by_school' => $this->getComplianceBySchool($slipsQuery),
                'signing_trends' => $this->getSigningTrends($slipsQuery),
            ];
        }, 300); // Cache for 5 minutes
    }

    /**
     * Get overview metrics for dashboard.
     *
     * @param array $dateRange
     * @param int|null $schoolId
     * @return array
     */
    private function getOverviewMetrics(array $dateRange, ?int $schoolId = null): array
    {
        $bookingsQuery = Booking::whereBetween('created_at', $dateRange);
        if ($schoolId) {
            $bookingsQuery->where('school_id', $schoolId);
        }

        $totalBookings = $bookingsQuery->count();
        $confirmedBookings = (clone $bookingsQuery)->confirmed()->count();
        $totalRevenue = (clone $bookingsQuery)->whereIn('status', ['confirmed', 'completed'])
            ->sum('total_cost');

        // Calculate previous period for comparison
        $previousPeriod = $this->getPreviousPeriod($dateRange);
        $previousBookingsQuery = Booking::whereBetween('created_at', $previousPeriod);
        if ($schoolId) {
            $previousBookingsQuery->where('school_id', $schoolId);
        }
        
        $previousTotalBookings = $previousBookingsQuery->count();
        $previousRevenue = (clone $previousBookingsQuery)->whereIn('status', ['confirmed', 'completed'])
            ->sum('total_cost');

        return [
            'total_bookings' => $totalBookings,
            'confirmed_bookings' => $confirmedBookings,
            'total_revenue' => $totalRevenue,
            'active_schools' => $this->getActiveSchoolsCount($dateRange, $schoolId),
            'completion_rate' => $totalBookings > 0 ? round(($confirmedBookings / $totalBookings) * 100, 2) : 0,
            'changes' => [
                'bookings' => $this->calculatePercentageChange($totalBookings, $previousTotalBookings),
                'revenue' => $this->calculatePercentageChange($totalRevenue, $previousRevenue),
            ],
        ];
    }

    /**
     * Get booking trends over time.
     *
     * @param array $dateRange
     * @param int|null $schoolId
     * @return array
     */
    private function getBookingTrends(array $dateRange, ?int $schoolId = null): array
    {
        $query = Booking::whereBetween('created_at', $dateRange)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN status = "confirmed" THEN 1 ELSE 0 END) as confirmed'),
                DB::raw('SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending')
            )
            ->groupBy('date')
            ->orderBy('date');

        if ($schoolId) {
            $query->where('school_id', $schoolId);
        }

        return $query->get()->toArray();
    }

    /**
     * Get top performing programs.
     *
     * @param array $dateRange
     * @param int|null $schoolId
     * @param int $limit
     * @return array
     */
    private function getTopPrograms(array $dateRange, ?int $schoolId = null, int $limit = 5): array
    {
        $query = Booking::whereBetween('created_at', $dateRange)
            ->with('program')
            ->select('program_id', DB::raw('COUNT(*) as booking_count'), DB::raw('SUM(total_cost) as revenue'))
            ->groupBy('program_id')
            ->orderBy('booking_count', 'desc')
            ->limit($limit);

        if ($schoolId) {
            $query->where('school_id', $schoolId);
        }

        return $query->get()->map(function ($item) {
            return [
                'program' => $item->program,
                'booking_count' => $item->booking_count,
                'revenue' => $item->revenue,
            ];
        })->toArray();
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

    /**
     * Calculate percentage change between two values.
     *
     * @param float $current
     * @param float $previous
     * @return float
     */
    private function calculatePercentageChange(float $current, float $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 2);
    }

    /**
     * Get active schools count.
     *
     * @param array $dateRange
     * @param int|null $schoolId
     * @return int
     */
    private function getActiveSchoolsCount(array $dateRange, ?int $schoolId = null): int
    {
        $query = School::whereHas('bookings', function ($query) use ($dateRange) {
            $query->whereBetween('created_at', $dateRange);
        });

        if ($schoolId) {
            $query->where('id', $schoolId);
        }

        return $query->count();
    }

    /**
     * Get recent activity for dashboard.
     *
     * @param int|null $schoolId
     * @param int $limit
     * @return array
     */
    private function getRecentActivity(?int $schoolId = null, int $limit = 10): array
    {
        $query = Booking::with(['school', 'program', 'teacher'])
            ->orderBy('created_at', 'desc')
            ->limit($limit);

        if ($schoolId) {
            $query->where('school_id', $schoolId);
        }

        return $query->get()->map(function ($booking) {
            return [
                'id' => $booking->id,
                'type' => 'booking',
                'title' => "New booking for {$booking->program->title}",
                'school' => $booking->school->name,
                'teacher' => $booking->teacher->name ?? 'Unknown',
                'status' => $booking->status,
                'created_at' => $booking->created_at,
            ];
        })->toArray();
    }

    /**
     * Calculate booking completion rate.
     *
     * @param $query
     * @return float
     */
    private function calculateCompletionRate($query): float
    {
        $total = (clone $query)->count();
        $completed = (clone $query)->completed()->count();

        return $total > 0 ? round(($completed / $total) * 100, 2) : 0;
    }

    /**
     * Get average students per booking.
     *
     * @param $query
     * @return float
     */
    private function getAverageStudentsPerBooking($query): float
    {
        return round((clone $query)->avg('student_count') ?? 0, 2);
    }

    /**
     * Get booking trends by time period.
     *
     * @param $query
     * @param string $groupBy
     * @return array
     */
    private function getBookingTrendsByPeriod($query, string $groupBy): array
    {
        $dateFormat = match ($groupBy) {
            'hour' => '%Y-%m-%d %H:00:00',
            'day' => '%Y-%m-%d',
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            'year' => '%Y',
            default => '%Y-%m-%d',
        };

        return (clone $query)
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$dateFormat}') as period"),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total_cost) as revenue')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->toArray();
    }

    /**
     * Get booking status distribution.
     *
     * @param $query
     * @return array
     */
    private function getBookingStatusDistribution($query): array
    {
        return (clone $query)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();
    }

    /**
     * Get popular time slots.
     *
     * @param $query
     * @return array
     */
    private function getPopularTimeSlots($query): array
    {
        return (clone $query)
            ->whereNotNull('confirmed_time')
            ->select(
                DB::raw('HOUR(confirmed_time) as hour'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'time_slot' => sprintf('%02d:00', $item->hour),
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Get booking lead time analysis.
     *
     * @param $query
     * @return array
     */
    private function getBookingLeadTime($query): array
    {
        $bookings = (clone $query)
            ->whereNotNull('confirmed_date')
            ->select('created_at', 'confirmed_date')
            ->get();

        $leadTimes = $bookings->map(function ($booking) {
            return Carbon::parse($booking->created_at)
                ->diffInDays(Carbon::parse($booking->confirmed_date));
        });

        return [
            'average_lead_time' => round($leadTimes->avg(), 2),
            'median_lead_time' => $leadTimes->median(),
            'min_lead_time' => $leadTimes->min(),
            'max_lead_time' => $leadTimes->max(),
        ];
    }

    /**
     * Get program rankings by booking count.
     *
     * @param $query
     * @return array
     */
    private function getProgramRankings($query): array
    {
        return (clone $query)
            ->with('program')
            ->select(
                'program_id',
                DB::raw('COUNT(*) as booking_count'),
                DB::raw('SUM(student_count) as total_students'),
                DB::raw('AVG(rating) as average_rating')
            )
            ->groupBy('program_id')
            ->orderBy('booking_count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'program' => $item->program,
                    'booking_count' => $item->booking_count,
                    'total_students' => $item->total_students,
                    'average_rating' => round($item->average_rating ?? 0, 2),
                ];
            })
            ->toArray();
    }

    /**
     * Get capacity utilization by program.
     *
     * @param $query
     * @return array
     */
    private function getCapacityUtilization($query): array
    {
        return (clone $query)
            ->with('program')
            ->select(
                'program_id',
                DB::raw('AVG(student_count) as avg_students'),
                DB::raw('COUNT(*) as booking_count')
            )
            ->groupBy('program_id')
            ->get()
            ->map(function ($item) {
                $maxStudents = $item->program->max_students ?? 1;
                $utilization = ($item->avg_students / $maxStudents) * 100;

                return [
                    'program' => $item->program,
                    'average_students' => round($item->avg_students, 2),
                    'max_capacity' => $maxStudents,
                    'utilization_rate' => round($utilization, 2),
                    'booking_count' => $item->booking_count,
                ];
            })
            ->toArray();
    }

    /**
     * Get dashboard overview data (alias for getDashboardData for controller compatibility).
     *
     * @param array $filters
     * @return array
     */
    public function getDashboardOverview(array $filters = []): array
    {
        return $this->getDashboardData($filters);
    }

    /**
     * Generate a report.
     *
     * @param array $data
     * @return AnalyticsReport
     */
    public function generateReport(array $data): AnalyticsReport
    {
        $report = AnalyticsReport::create([
            'user_id' => auth()->id(),
            'name' => $data['name'] ?? 'Custom Report',
            'report_type' => $data['report_type'] ?? 'custom_report',
            'filters' => $data['filters'] ?? [],
            'status' => 'pending',
            'format' => $data['format'] ?? 'json',
        ]);

        // Queue report generation
        dispatch(function () use ($report) {
            $this->processReportGeneration($report);
        });

        return $report;
    }

    /**
     * Get report by ID.
     *
     * @param int $id
     * @return AnalyticsReport|null
     */
    public function getReportById(int $id): ?AnalyticsReport
    {
        return AnalyticsReport::find($id);
    }

    /**
     * Get user's reports.
     *
     * @param int $userId
     * @param array $filters
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getUserReports(int $userId, array $filters = [])
    {
        $query = AnalyticsReport::where('user_id', $userId);

        if (isset($filters['report_type'])) {
            $query->where('report_type', $filters['report_type']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['is_scheduled'])) {
            $query->where('is_scheduled', $filters['is_scheduled']);
        }

        return $query->orderBy('created_at', 'desc')
                    ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Delete report.
     *
     * @param AnalyticsReport $report
     * @return bool
     */
    public function deleteReport(AnalyticsReport $report): bool
    {
        // Delete associated file if exists
        if ($report->file_path && Storage::exists($report->file_path)) {
            Storage::delete($report->file_path);
        }

        return $report->delete();
    }

    /**
     * Export report.
     *
     * @param AnalyticsReport $report
     * @param array $options
     * @return array
     */
    public function exportReport(AnalyticsReport $report, array $options = []): array
    {
        $format = $options['format'] ?? 'pdf';

        // Use ReportGenerationService for export
        $reportService = app(ReportGenerationService::class);

        return $reportService->exportReport($report->id, $format, $options);
    }

    /**
     * Schedule report.
     *
     * @param array $data
     * @return AnalyticsReport
     */
    public function scheduleReport(array $data): AnalyticsReport
    {
        $report = AnalyticsReport::findOrFail($data['report_id']);

        $report->update([
            'is_scheduled' => true,
            'schedule_frequency' => $data['frequency'],
            'email_recipients' => $data['email_recipients'],
            'next_run_at' => $this->calculateNextRunTime($data['frequency'], $data['start_date'] ?? null),
        ]);

        return $report;
    }

    /**
     * Get metrics data.
     *
     * @param array $filters
     * @return array
     */
    public function getMetrics(array $filters = []): array
    {
        $metricsService = app(MetricsCollectionService::class);

        if (isset($filters['metric_keys'])) {
            return $metricsService->getSpecificMetrics($filters['metric_keys'], $filters);
        }

        return $metricsService->collectKPIs($filters);
    }

    /**
     * Process report generation.
     *
     * @param AnalyticsReport $report
     * @return void
     */
    private function processReportGeneration(AnalyticsReport $report): void
    {
        try {
            $report->markAsGenerating();

            $data = match ($report->report_type) {
                'dashboard_overview' => $this->getDashboardData($report->filters ?? []),
                'booking_analytics' => $this->getBookingAnalytics($report->filters ?? []),
                'program_performance' => $this->getProgramPerformance($report->filters ?? []),
                'school_engagement' => $this->getSchoolEngagement($report->filters ?? []),
                'financial_summary' => $this->getFinancialSummary($report->filters ?? []),
                default => ['error' => 'Unknown report type'],
            };

            $report->markAsCompleted($data);
        } catch (\Exception $e) {
            $report->markAsFailed($e->getMessage());
        }
    }

    /**
     * Calculate next run time for scheduled reports.
     *
     * @param string $frequency
     * @param string|null $startDate
     * @return \Carbon\Carbon
     */
    private function calculateNextRunTime(string $frequency, ?string $startDate = null): \Carbon\Carbon
    {
        $start = $startDate ? \Carbon\Carbon::parse($startDate) : now();

        return match ($frequency) {
            'daily' => $start->addDay(),
            'weekly' => $start->addWeek(),
            'monthly' => $start->addMonth(),
            'quarterly' => $start->addMonths(3),
            'yearly' => $start->addYear(),
            default => $start->addDay(),
        };
    }
}
