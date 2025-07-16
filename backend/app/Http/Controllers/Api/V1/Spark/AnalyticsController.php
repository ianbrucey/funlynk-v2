<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\GenerateReportRequest;
use App\Http\Resources\Spark\AnalyticsReportResource;
use App\Services\Spark\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Analytics Controller.
 *
 * Handles analytics and reporting API endpoints for Spark programs
 */
class AnalyticsController extends BaseApiController
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get dashboard overview analytics.
     */
    public function dashboard(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'date_range' => 'sometimes|string|in:today,week,month,quarter,year',
                'school_ids' => 'sometimes|array',
                'school_ids.*' => 'exists:schools,id',
                'program_ids' => 'sometimes|array',
                'program_ids.*' => 'exists:spark_programs,id',
            ]);

            $analytics = $this->analyticsService->getDashboardOverview($request->validated());

            return $this->successResponse($analytics, 'Dashboard analytics retrieved successfully');
        });
    }

    /**
     * Get booking analytics.
     */
    public function bookingAnalytics(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
                'group_by' => 'sometimes|string|in:day,week,month,quarter,year',
                'school_ids' => 'sometimes|array',
                'school_ids.*' => 'exists:schools,id',
                'program_ids' => 'sometimes|array',
                'program_ids.*' => 'exists:spark_programs,id',
                'status' => 'sometimes|array',
                'status.*' => 'in:pending,confirmed,cancelled,completed',
            ]);

            $analytics = $this->analyticsService->getBookingAnalytics($request->validated());

            return $this->successResponse($analytics, 'Booking analytics retrieved successfully');
        });
    }

    /**
     * Get program performance analytics.
     */
    public function programPerformance(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
                'program_ids' => 'sometimes|array',
                'program_ids.*' => 'exists:spark_programs,id',
                'sort_by' => 'sometimes|string|in:bookings,revenue,rating,capacity_utilization',
                'sort_direction' => 'sometimes|string|in:asc,desc',
                'limit' => 'sometimes|integer|min:1|max:100',
            ]);

            $analytics = $this->analyticsService->getProgramPerformance($request->validated());

            return $this->successResponse($analytics, 'Program performance analytics retrieved successfully');
        });
    }

    /**
     * Get school engagement analytics.
     */
    public function schoolEngagement(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
                'school_ids' => 'sometimes|array',
                'school_ids.*' => 'exists:schools,id',
                'district_ids' => 'sometimes|array',
                'district_ids.*' => 'exists:districts,id',
                'sort_by' => 'sometimes|string|in:bookings,revenue,engagement_score,last_booking',
                'sort_direction' => 'sometimes|string|in:asc,desc',
                'limit' => 'sometimes|integer|min:1|max:100',
            ]);

            $analytics = $this->analyticsService->getSchoolEngagement($request->validated());

            return $this->successResponse($analytics, 'School engagement analytics retrieved successfully');
        });
    }

    /**
     * Get financial summary analytics.
     */
    public function financialSummary(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
                'group_by' => 'sometimes|string|in:day,week,month,quarter,year',
                'school_ids' => 'sometimes|array',
                'school_ids.*' => 'exists:schools,id',
                'program_ids' => 'sometimes|array',
                'program_ids.*' => 'exists:spark_programs,id',
                'payment_status' => 'sometimes|array',
                'payment_status.*' => 'in:pending,paid,refunded',
            ]);

            $analytics = $this->analyticsService->getFinancialSummary($request->validated());

            return $this->successResponse($analytics, 'Financial summary retrieved successfully');
        });
    }

    /**
     * Generate custom report.
     */
    public function generateReport(GenerateReportRequest $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $report = $this->analyticsService->generateReport($request->validated());

            return $this->createdResponse(
                new AnalyticsReportResource($report),
                'Report generation started successfully'
            );
        });
    }

    /**
     * Get report by ID.
     */
    public function getReport(int $id): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($id) {
            $report = $this->analyticsService->getReportById($id);

            if (!$report) {
                return $this->notFoundResponse('Report not found');
            }

            $this->authorize('view', $report);

            return $this->successResponse(
                new AnalyticsReportResource($report),
                'Report retrieved successfully'
            );
        });
    }

    /**
     * Get user's reports list.
     */
    public function getUserReports(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'report_type' => 'sometimes|string|in:dashboard_overview,booking_analytics,program_performance,school_engagement,financial_summary,custom_report',
                'status' => 'sometimes|string|in:pending,generating,completed,failed',
                'is_scheduled' => 'sometimes|boolean',
                'per_page' => 'sometimes|integer|min:1|max:100',
            ]);

            $reports = $this->analyticsService->getUserReports(auth()->id(), $request->validated());

            return $this->paginatedResponse($reports, 'Reports retrieved successfully');
        });
    }

    /**
     * Delete report.
     */
    public function deleteReport(int $id): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($id) {
            $report = $this->analyticsService->getReportById($id);

            if (!$report) {
                return $this->notFoundResponse('Report not found');
            }

            $this->authorize('delete', $report);

            $this->analyticsService->deleteReport($report);

            return $this->deletedResponse('Report deleted successfully');
        });
    }

    /**
     * Export report data.
     */
    public function exportReport(int $id, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $request->validate([
                'format' => 'required|string|in:pdf,csv,excel',
                'include_charts' => 'sometimes|boolean',
                'template' => 'sometimes|string',
            ]);

            $report = $this->analyticsService->getReportById($id);

            if (!$report) {
                return $this->notFoundResponse('Report not found');
            }

            $this->authorize('export', $report);

            $exportData = $this->analyticsService->exportReport($report, $request->validated());

            return $this->successResponse($exportData, 'Report export generated successfully');
        });
    }

    /**
     * Schedule report generation.
     */
    public function scheduleReport(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'report_id' => 'required|exists:analytics_reports,id',
                'frequency' => 'required|string|in:daily,weekly,monthly,quarterly,yearly',
                'email_recipients' => 'required|array|min:1',
                'email_recipients.*' => 'email',
                'start_date' => 'sometimes|date|after_or_equal:today',
            ]);

            $report = $this->analyticsService->scheduleReport($request->validated());

            return $this->successResponse(
                new AnalyticsReportResource($report),
                'Report scheduled successfully'
            );
        });
    }

    /**
     * Get analytics metrics.
     */
    public function getMetrics(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'metric_keys' => 'sometimes|array',
                'metric_keys.*' => 'string',
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
                'period_type' => 'sometimes|string|in:daily,weekly,monthly,quarterly,yearly',
                'school_ids' => 'sometimes|array',
                'school_ids.*' => 'exists:schools,id',
                'program_ids' => 'sometimes|array',
                'program_ids.*' => 'exists:spark_programs,id',
            ]);

            $metrics = $this->analyticsService->getMetrics($request->validated());

            return $this->successResponse($metrics, 'Metrics retrieved successfully');
        });
    }
}
