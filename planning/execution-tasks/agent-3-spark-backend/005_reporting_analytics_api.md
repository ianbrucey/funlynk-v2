# Task 005: Reporting and Analytics API
**Agent**: Spark Backend Developer  
**Estimated Time**: 5-6 hours  
**Priority**: Medium  
**Dependencies**: Task 004 (Permission Slip Management)  

## Overview
Implement comprehensive reporting and analytics API for Spark including booking analytics, program performance metrics, school engagement reports, and financial summaries.

## Prerequisites
- Task 004 completed successfully
- All Spark models and relationships working
- Booking and permission slip data available
- Payment integration available

## Step-by-Step Implementation

### Step 1: Create Analytics Models (60 minutes)

**Create AnalyticsReport model (app/Models/Spark/AnalyticsReport.php):**
```php
<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class AnalyticsReport extends Model
{
    protected $fillable = [
        'user_id',
        'report_type',
        'title',
        'description',
        'filters',
        'data',
        'generated_at',
        'file_path',
        'is_scheduled',
        'schedule_frequency',
        'next_run_at',
    ];

    protected $casts = [
        'filters' => 'array',
        'data' => 'array',
        'generated_at' => 'datetime',
        'is_scheduled' => 'boolean',
        'next_run_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeByType($query, string $type)
    {
        return $query->where('report_type', $type);
    }

    public function scopeScheduled($query)
    {
        return $query->where('is_scheduled', true);
    }

    public function scopeDueForGeneration($query)
    {
        return $query->scheduled()
                    ->where('next_run_at', '<=', now());
    }
}
```

**Create ReportMetric model (app/Models/Spark/ReportMetric.php):**
```php
<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;

class ReportMetric extends Model
{
    protected $fillable = [
        'metric_key',
        'metric_name',
        'metric_value',
        'metric_type',
        'date_recorded',
        'metadata',
    ];

    protected $casts = [
        'metric_value' => 'decimal:2',
        'date_recorded' => 'date',
        'metadata' => 'array',
    ];

    // Scopes
    public function scopeByKey($query, string $key)
    {
        return $query->where('metric_key', $key);
    }

    public function scopeByDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('date_recorded', [$startDate, $endDate]);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('metric_type', $type);
    }
}
```

### Step 2: Create Analytics Controllers (120 minutes)

**Create AnalyticsController (app/Http/Controllers/Api/V1/Spark/AnalyticsController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\Spark\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends BaseApiController
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get dashboard overview
     */
    public function dashboard(Request $request): JsonResponse
    {
        $request->validate([
            'date_range' => 'sometimes|string|in:week,month,quarter,year',
            'school_id' => 'sometimes|exists:schools,id',
        ]);

        $dashboard = $this->analyticsService->getDashboardData($request->validated());
        
        return $this->successResponse($dashboard, 'Dashboard data retrieved successfully');
    }

    /**
     * Get booking analytics
     */
    public function bookingAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'school_id' => 'sometimes|exists:schools,id',
            'program_id' => 'sometimes|exists:spark_programs,id',
            'group_by' => 'sometimes|string|in:day,week,month,quarter',
        ]);

        $analytics = $this->analyticsService->getBookingAnalytics($request->validated());
        
        return $this->successResponse($analytics, 'Booking analytics retrieved successfully');
    }

    /**
     * Get program performance metrics
     */
    public function programPerformance(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'program_id' => 'sometimes|exists:spark_programs,id',
            'sort_by' => 'sometimes|string|in:bookings,revenue,rating,completion_rate',
            'sort_order' => 'sometimes|string|in:asc,desc',
        ]);

        $performance = $this->analyticsService->getProgramPerformance($request->validated());
        
        return $this->successResponse($performance, 'Program performance retrieved successfully');
    }

    /**
     * Get school engagement metrics
     */
    public function schoolEngagement(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'school_id' => 'sometimes|exists:schools,id',
            'district_id' => 'sometimes|exists:districts,id',
        ]);

        $engagement = $this->analyticsService->getSchoolEngagement($request->validated());
        
        return $this->successResponse($engagement, 'School engagement retrieved successfully');
    }

    /**
     * Get financial summary
     */
    public function financialSummary(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'group_by' => 'sometimes|string|in:day,week,month,quarter',
        ]);

        $financial = $this->analyticsService->getFinancialSummary($request->validated());
        
        return $this->successResponse($financial, 'Financial summary retrieved successfully');
    }

    /**
     * Get permission slip compliance
     */
    public function permissionSlipCompliance(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'school_id' => 'sometimes|exists:schools,id',
        ]);

        $compliance = $this->analyticsService->getPermissionSlipCompliance($request->validated());
        
        return $this->successResponse($compliance, 'Permission slip compliance retrieved successfully');
    }

    /**
     * Generate custom report
     */
    public function generateReport(Request $request): JsonResponse
    {
        $request->validate([
            'report_type' => 'required|string|in:booking_summary,program_performance,school_engagement,financial_summary,permission_slip_compliance',
            'title' => 'required|string|max:255',
            'description' => 'sometimes|string|max:1000',
            'filters' => 'required|array',
            'format' => 'sometimes|string|in:pdf,excel,csv',
            'schedule' => 'sometimes|array',
            'schedule.frequency' => 'required_with:schedule|string|in:daily,weekly,monthly,quarterly',
            'schedule.day_of_week' => 'sometimes|integer|min:0|max:6',
            'schedule.day_of_month' => 'sometimes|integer|min:1|max:31',
        ]);

        try {
            $report = $this->analyticsService->generateReport(
                auth()->user(),
                $request->validated()
            );
            
            return $this->successResponse($report, 'Report generated successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get user's reports
     */
    public function userReports(Request $request): JsonResponse
    {
        $request->validate([
            'report_type' => 'sometimes|string',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $reports = $this->analyticsService->getUserReports(
            auth()->id(),
            $request->validated()
        );
        
        return $this->paginatedResponse($reports, 'User reports retrieved successfully');
    }

    /**
     * Export analytics data
     */
    public function export(Request $request): JsonResponse
    {
        $request->validate([
            'data_type' => 'required|string|in:bookings,programs,schools,financial,permission_slips',
            'format' => 'required|string|in:csv,excel,pdf',
            'filters' => 'sometimes|array',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
        ]);

        try {
            $export = $this->analyticsService->exportData($request->validated());
            
            return $this->successResponse($export, 'Data exported successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
```

### Step 3: Create Analytics Service (150 minutes)

**Create AnalyticsService (app/Services/Spark/AnalyticsService.php):**
```php
<?php

namespace App\Services\Spark;

use App\Models\Spark\Booking;
use App\Models\Spark\SparkProgram;
use App\Models\Spark\School;
use App\Models\Spark\PermissionSlip;
use App\Models\Spark\AnalyticsReport;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsService
{
    public function getDashboardData(array $filters = []): array
    {
        $dateRange = $this->getDateRange($filters['date_range'] ?? 'month');
        $schoolId = $filters['school_id'] ?? null;

        $bookingsQuery = Booking::whereBetween('created_at', $dateRange);
        if ($schoolId) {
            $bookingsQuery->where('school_id', $schoolId);
        }

        $totalBookings = $bookingsQuery->count();
        $confirmedBookings = $bookingsQuery->clone()->confirmed()->count();
        $completedBookings = $bookingsQuery->clone()->completed()->count();
        $totalRevenue = $bookingsQuery->clone()->confirmed()->sum('total_cost');

        $permissionSlipsQuery = PermissionSlip::whereBetween('created_at', $dateRange);
        if ($schoolId) {
            $permissionSlipsQuery->whereHas('booking', function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            });
        }

        $totalPermissionSlips = $permissionSlipsQuery->count();
        $signedPermissionSlips = $permissionSlipsQuery->clone()->signed()->count();

        return [
            'period' => $filters['date_range'] ?? 'month',
            'date_range' => [
                'start' => $dateRange[0]->format('Y-m-d'),
                'end' => $dateRange[1]->format('Y-m-d'),
            ],
            'bookings' => [
                'total' => $totalBookings,
                'confirmed' => $confirmedBookings,
                'completed' => $completedBookings,
                'pending' => $totalBookings - $confirmedBookings,
                'confirmation_rate' => $totalBookings > 0 ? round(($confirmedBookings / $totalBookings) * 100, 2) : 0,
                'completion_rate' => $confirmedBookings > 0 ? round(($completedBookings / $confirmedBookings) * 100, 2) : 0,
            ],
            'revenue' => [
                'total' => $totalRevenue,
                'average_per_booking' => $confirmedBookings > 0 ? round($totalRevenue / $confirmedBookings, 2) : 0,
            ],
            'permission_slips' => [
                'total' => $totalPermissionSlips,
                'signed' => $signedPermissionSlips,
                'unsigned' => $totalPermissionSlips - $signedPermissionSlips,
                'compliance_rate' => $totalPermissionSlips > 0 ? round(($signedPermissionSlips / $totalPermissionSlips) * 100, 2) : 0,
            ],
            'top_programs' => $this->getTopPrograms($dateRange, $schoolId, 5),
            'recent_bookings' => $this->getRecentBookings($schoolId, 10),
        ];
    }

    public function getBookingAnalytics(array $filters = []): array
    {
        $dateRange = $this->getDateRangeFromFilters($filters);
        $groupBy = $filters['group_by'] ?? 'week';

        $query = Booking::whereBetween('created_at', $dateRange);

        if (isset($filters['school_id'])) {
            $query->where('school_id', $filters['school_id']);
        }

        if (isset($filters['program_id'])) {
            $query->where('program_id', $filters['program_id']);
        }

        $bookings = $query->get();

        return [
            'summary' => [
                'total_bookings' => $bookings->count(),
                'confirmed_bookings' => $bookings->where('status', 'confirmed')->count(),
                'completed_bookings' => $bookings->where('status', 'completed')->count(),
                'cancelled_bookings' => $bookings->where('status', 'cancelled')->count(),
                'total_revenue' => $bookings->where('status', 'confirmed')->sum('total_cost'),
                'total_students' => $bookings->sum('student_count'),
            ],
            'trends' => $this->getBookingTrends($bookings, $groupBy),
            'status_distribution' => $this->getStatusDistribution($bookings),
            'program_breakdown' => $this->getProgramBreakdown($bookings),
            'school_breakdown' => $this->getSchoolBreakdown($bookings),
        ];
    }

    public function getProgramPerformance(array $filters = []): array
    {
        $dateRange = $this->getDateRangeFromFilters($filters);
        $sortBy = $filters['sort_by'] ?? 'bookings';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        $query = SparkProgram::with(['bookings' => function ($q) use ($dateRange) {
            $q->whereBetween('created_at', $dateRange);
        }]);

        if (isset($filters['program_id'])) {
            $query->where('id', $filters['program_id']);
        }

        $programs = $query->get()->map(function ($program) {
            $bookings = $program->bookings;
            $confirmedBookings = $bookings->where('status', 'confirmed');
            $completedBookings = $bookings->where('status', 'completed');

            return [
                'id' => $program->id,
                'title' => $program->title,
                'grade_levels' => $program->grade_levels_display,
                'duration' => $program->duration_display,
                'price_per_student' => $program->price_per_student,
                'metrics' => [
                    'total_bookings' => $bookings->count(),
                    'confirmed_bookings' => $confirmedBookings->count(),
                    'completed_bookings' => $completedBookings->count(),
                    'total_revenue' => $confirmedBookings->sum('total_cost'),
                    'total_students' => $confirmedBookings->sum('student_count'),
                    'average_rating' => $completedBookings->whereNotNull('rating')->avg('rating'),
                    'completion_rate' => $confirmedBookings->count() > 0 ?
                        round(($completedBookings->count() / $confirmedBookings->count()) * 100, 2) : 0,
                ],
            ];
        });

        // Sort programs
        $programs = $programs->sortBy(function ($program) use ($sortBy) {
            return match($sortBy) {
                'bookings' => $program['metrics']['total_bookings'],
                'revenue' => $program['metrics']['total_revenue'],
                'rating' => $program['metrics']['average_rating'] ?? 0,
                'completion_rate' => $program['metrics']['completion_rate'],
                default => $program['metrics']['total_bookings'],
            };
        }, SORT_REGULAR, $sortOrder === 'desc');

        return [
            'programs' => $programs->values()->all(),
            'summary' => [
                'total_programs' => $programs->count(),
                'active_programs' => $programs->where('metrics.total_bookings', '>', 0)->count(),
                'total_bookings' => $programs->sum('metrics.total_bookings'),
                'total_revenue' => $programs->sum('metrics.total_revenue'),
                'average_rating' => $programs->whereNotNull('metrics.average_rating')->avg('metrics.average_rating'),
            ],
        ];
    }

    public function getSchoolEngagement(array $filters = []): array
    {
        $dateRange = $this->getDateRangeFromFilters($filters);

        $query = School::with(['bookings' => function ($q) use ($dateRange) {
            $q->whereBetween('created_at', $dateRange);
        }]);

        if (isset($filters['school_id'])) {
            $query->where('id', $filters['school_id']);
        }

        if (isset($filters['district_id'])) {
            $query->where('district_id', $filters['district_id']);
        }

        $schools = $query->get()->map(function ($school) {
            $bookings = $school->bookings;
            $confirmedBookings = $bookings->where('status', 'confirmed');

            return [
                'id' => $school->id,
                'name' => $school->name,
                'district' => $school->district->name,
                'grade_levels' => $school->grade_levels_display,
                'metrics' => [
                    'total_bookings' => $bookings->count(),
                    'confirmed_bookings' => $confirmedBookings->count(),
                    'total_students_served' => $confirmedBookings->sum('student_count'),
                    'total_spent' => $confirmedBookings->sum('total_cost'),
                    'unique_programs' => $bookings->pluck('program_id')->unique()->count(),
                    'last_booking_date' => $bookings->max('created_at'),
                ],
            ];
        });

        return [
            'schools' => $schools->sortByDesc('metrics.total_bookings')->values()->all(),
            'summary' => [
                'total_schools' => $schools->count(),
                'active_schools' => $schools->where('metrics.total_bookings', '>', 0)->count(),
                'total_bookings' => $schools->sum('metrics.total_bookings'),
                'total_students_served' => $schools->sum('metrics.total_students_served'),
                'total_revenue' => $schools->sum('metrics.total_spent'),
            ],
        ];
    }

    private function getDateRange(string $period): array
    {
        return match($period) {
            'week' => [now()->startOfWeek(), now()->endOfWeek()],
            'month' => [now()->startOfMonth(), now()->endOfMonth()],
            'quarter' => [now()->startOfQuarter(), now()->endOfQuarter()],
            'year' => [now()->startOfYear(), now()->endOfYear()],
            default => [now()->startOfMonth(), now()->endOfMonth()],
        };
    }

    private function getDateRangeFromFilters(array $filters): array
    {
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            return [Carbon::parse($filters['start_date']), Carbon::parse($filters['end_date'])];
        }

        return [now()->subMonth(), now()];
    }

    private function getTopPrograms(array $dateRange, ?int $schoolId, int $limit): array
    {
        $query = SparkProgram::withCount(['bookings' => function ($q) use ($dateRange, $schoolId) {
            $q->whereBetween('created_at', $dateRange)->confirmed();
            if ($schoolId) {
                $q->where('school_id', $schoolId);
            }
        }]);

        return $query->orderByDesc('bookings_count')
                    ->limit($limit)
                    ->get()
                    ->map(function ($program) {
                        return [
                            'id' => $program->id,
                            'title' => $program->title,
                            'bookings_count' => $program->bookings_count,
                        ];
                    })
                    ->toArray();
    }

    private function getRecentBookings(?int $schoolId, int $limit): array
    {
        $query = Booking::with(['school', 'program']);

        if ($schoolId) {
            $query->where('school_id', $schoolId);
        }

        return $query->orderByDesc('created_at')
                    ->limit($limit)
                    ->get()
                    ->map(function ($booking) {
                        return [
                            'id' => $booking->id,
                            'reference' => $booking->booking_reference,
                            'school_name' => $booking->school->name,
                            'program_title' => $booking->program->title,
                            'status' => $booking->status,
                            'student_count' => $booking->student_count,
                            'created_at' => $booking->created_at->format('Y-m-d H:i:s'),
                        ];
                    })
                    ->toArray();
    }
}
```

### Step 4: Create Routes and Complete Implementation (45 minutes)

**Update routes/api/spark.php:**
```php
// Add to existing routes

Route::prefix('analytics')->group(function () {
    Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
    Route::get('/bookings', [AnalyticsController::class, 'bookingAnalytics']);
    Route::get('/programs', [AnalyticsController::class, 'programPerformance']);
    Route::get('/schools', [AnalyticsController::class, 'schoolEngagement']);
    Route::get('/financial', [AnalyticsController::class, 'financialSummary']);
    Route::get('/permission-slips', [AnalyticsController::class, 'permissionSlipCompliance']);

    // Reports
    Route::post('/reports', [AnalyticsController::class, 'generateReport']);
    Route::get('/reports', [AnalyticsController::class, 'userReports']);
    Route::post('/export', [AnalyticsController::class, 'export']);
});
```

## Acceptance Criteria

### Dashboard Analytics
- [ ] Overview metrics for bookings, revenue, permission slips
- [ ] Configurable date ranges (week, month, quarter, year)
- [ ] School-specific filtering
- [ ] Top programs and recent bookings

### Booking Analytics
- [ ] Booking trends over time with grouping options
- [ ] Status distribution and conversion rates
- [ ] Program and school breakdown analysis
- [ ] Revenue and student count metrics

### Program Performance
- [ ] Program ranking by bookings, revenue, rating
- [ ] Completion rates and average ratings
- [ ] Student engagement metrics
- [ ] Performance comparison tools

### School Engagement
- [ ] School activity and engagement metrics
- [ ] District-level aggregation
- [ ] Program diversity and spending analysis
- [ ] Engagement trend tracking

### Reporting System
- [ ] Custom report generation with filters
- [ ] Scheduled report automation
- [ ] Multiple export formats (PDF, Excel, CSV)
- [ ] Report history and management

## Testing Instructions

### Manual Testing
```bash
# Get dashboard data
curl -X GET "http://localhost:8000/api/v1/spark/analytics/dashboard?date_range=month" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get booking analytics
curl -X GET "http://localhost:8000/api/v1/spark/analytics/bookings?start_date=2024-01-01&end_date=2024-12-31&group_by=month" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get program performance
curl -X GET "http://localhost:8000/api/v1/spark/analytics/programs?sort_by=revenue&sort_order=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Generate custom report
curl -X POST http://localhost:8000/api/v1/spark/analytics/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"report_type":"booking_summary","title":"Monthly Booking Report","filters":{"date_range":"month"}}'
```

## Next Steps
After completion:
- Coordinate with Agent 6 on mobile analytics UI
- Set up automated report scheduling
- Test all analytics endpoints
- Document analytics API for frontend teams

## Documentation
- Update API documentation with analytics endpoints
- Document report generation and scheduling
- Create analytics dashboard integration guide
- Document export functionality and formats
