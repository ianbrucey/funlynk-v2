<?php

namespace App\Services\Spark;

use App\Services\Shared\EmailService;
use App\Services\Shared\LoggingService;
use App\Services\Shared\CacheService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Exception;

/**
 * Report Generation Service
 *
 * Handles the generation, scheduling, and delivery of various analytics reports
 * in multiple formats (PDF, Excel, CSV) with customizable filters and templates.
 */
class ReportGenerationService
{
    public function __construct(
        private AnalyticsService $analyticsService,
        private EmailService $emailService,
        private LoggingService $loggingService,
        private CacheService $cacheService
    ) {}

    /**
     * Generate a custom report.
     *
     * @param array $reportConfig
     * @param int $userId
     * @return array
     * @throws Exception
     */
    public function generateReport(array $reportConfig, int $userId): array
    {
        try {
            $reportId = Str::uuid();
            $reportType = $reportConfig['report_type'];
            $format = $reportConfig['format'] ?? 'pdf';
            
            // Log report generation start
            $this->loggingService->logUserActivity(
                $userId,
                'report_generation_started',
                'Report',
                null,
                [
                    'report_id' => $reportId,
                    'report_type' => $reportType,
                    'format' => $format,
                ]
            );

            // Generate report data based on type
            $reportData = $this->generateReportData($reportType, $reportConfig['filters']);
            
            // Generate report file
            $filePath = $this->generateReportFile($reportData, $reportConfig, $reportId);
            
            // Create report record
            $report = [
                'id' => $reportId,
                'title' => $reportConfig['title'],
                'description' => $reportConfig['description'] ?? null,
                'type' => $reportType,
                'format' => $format,
                'file_path' => $filePath,
                'filters' => $reportConfig['filters'],
                'generated_by' => $userId,
                'generated_at' => now(),
                'file_size' => Storage::size($filePath),
                'status' => 'completed',
            ];

            // Schedule report if requested
            if (isset($reportConfig['schedule'])) {
                $this->scheduleReport($report, $reportConfig['schedule'], $userId);
            }

            // Log successful generation
            $this->loggingService->logUserActivity(
                $userId,
                'report_generated',
                'Report',
                $reportId,
                [
                    'report_type' => $reportType,
                    'format' => $format,
                    'file_size' => $report['file_size'],
                ]
            );

            return $report;

        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'user_id' => $userId,
                'report_config' => $reportConfig,
                'operation' => 'generate_report'
            ]);

            throw $e;
        }
    }

    /**
     * Generate report data based on type.
     *
     * @param string $reportType
     * @param array $filters
     * @return array
     * @throws Exception
     */
    private function generateReportData(string $reportType, array $filters): array
    {
        return match ($reportType) {
            'booking_summary' => $this->generateBookingSummaryData($filters),
            'program_performance' => $this->generateProgramPerformanceData($filters),
            'school_engagement' => $this->generateSchoolEngagementData($filters),
            'financial_summary' => $this->generateFinancialSummaryData($filters),
            'permission_slip_compliance' => $this->generatePermissionSlipComplianceData($filters),
            default => throw new Exception("Unsupported report type: {$reportType}")
        };
    }

    /**
     * Generate booking summary report data.
     *
     * @param array $filters
     * @return array
     */
    private function generateBookingSummaryData(array $filters): array
    {
        $analytics = $this->analyticsService->getBookingAnalytics($filters);
        
        return [
            'title' => 'Booking Summary Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'period' => $this->formatDateRange($filters),
            'summary' => [
                'Total Bookings' => $analytics['total_bookings'],
                'Confirmed Bookings' => $analytics['confirmed_bookings'],
                'Pending Bookings' => $analytics['pending_bookings'],
                'Cancelled Bookings' => $analytics['cancelled_bookings'],
                'Completion Rate' => $analytics['completion_rate'] . '%',
                'Average Students per Booking' => $analytics['average_students_per_booking'],
            ],
            'trends' => $analytics['booking_trends'],
            'status_distribution' => $analytics['status_distribution'],
            'popular_time_slots' => $analytics['popular_time_slots'],
            'lead_time_analysis' => $analytics['booking_lead_time'],
        ];
    }

    /**
     * Generate program performance report data.
     *
     * @param array $filters
     * @return array
     */
    private function generateProgramPerformanceData(array $filters): array
    {
        $analytics = $this->analyticsService->getProgramPerformance($filters);
        
        return [
            'title' => 'Program Performance Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'period' => $this->formatDateRange($filters),
            'program_rankings' => $analytics['program_rankings'],
            'capacity_utilization' => $analytics['capacity_utilization'],
            'program_ratings' => $analytics['program_ratings'] ?? [],
            'revenue_by_program' => $analytics['revenue_by_program'] ?? [],
            'grade_level_distribution' => $analytics['grade_level_distribution'] ?? [],
            'character_topic_popularity' => $analytics['character_topic_popularity'] ?? [],
        ];
    }

    /**
     * Generate school engagement report data.
     *
     * @param array $filters
     * @return array
     */
    private function generateSchoolEngagementData(array $filters): array
    {
        $analytics = $this->analyticsService->getSchoolEngagement($filters);
        
        return [
            'title' => 'School Engagement Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'period' => $this->formatDateRange($filters),
            'summary' => [
                'Active Schools' => $analytics['active_schools_count'],
                'Average Booking Frequency' => $analytics['average_booking_frequency'] ?? 0,
                'School Retention Rate' => ($analytics['school_retention_rate'] ?? 0) . '%',
            ],
            'school_rankings' => $analytics['school_activity_rankings'] ?? [],
            'district_summary' => $analytics['district_summary'] ?? [],
            'program_diversity' => $analytics['school_program_diversity'] ?? [],
            'engagement_trends' => $analytics['engagement_trends'] ?? [],
        ];
    }

    /**
     * Generate financial summary report data.
     *
     * @param array $filters
     * @return array
     */
    private function generateFinancialSummaryData(array $filters): array
    {
        $analytics = $this->analyticsService->getFinancialSummary($filters);
        
        return [
            'title' => 'Financial Summary Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'period' => $this->formatDateRange($filters),
            'summary' => [
                'Total Revenue' => '$' . number_format($analytics['total_revenue'], 2),
                'Average Booking Value' => '$' . number_format($analytics['average_booking_value'], 2),
            ],
            'revenue_trends' => $analytics['revenue_trends'],
            'revenue_by_program' => $analytics['revenue_by_program'],
            'revenue_by_school' => $analytics['revenue_by_school'],
            'payment_status_summary' => $analytics['payment_status_summary'],
            'top_revenue_schools' => $analytics['top_revenue_schools'],
            'forecasting' => $analytics['revenue_forecasting'] ?? [],
        ];
    }

    /**
     * Generate permission slip compliance report data.
     *
     * @param array $filters
     * @return array
     */
    private function generatePermissionSlipComplianceData(array $filters): array
    {
        $analytics = $this->analyticsService->getPermissionSlipCompliance($filters);
        
        return [
            'title' => 'Permission Slip Compliance Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'period' => $this->formatDateRange($filters),
            'summary' => [
                'Total Permission Slips' => $analytics['total_slips'],
                'Signed Slips' => $analytics['signed_slips'],
                'Unsigned Slips' => $analytics['unsigned_slips'],
                'Overdue Slips' => $analytics['overdue_slips'],
                'Compliance Rate' => $analytics['compliance_rate'] . '%',
                'Average Signing Time' => $analytics['average_signing_time'] . ' hours',
            ],
            'compliance_by_school' => $analytics['compliance_by_school'],
            'signing_trends' => $analytics['signing_trends'],
            'reminder_effectiveness' => $analytics['reminder_effectiveness'],
        ];
    }

    /**
     * Generate report file in specified format.
     *
     * @param array $reportData
     * @param array $reportConfig
     * @param string $reportId
     * @return string
     * @throws Exception
     */
    private function generateReportFile(array $reportData, array $reportConfig, string $reportId): string
    {
        $format = $reportConfig['format'] ?? 'pdf';
        $filename = "reports/{$reportId}.{$format}";

        return match ($format) {
            'pdf' => $this->generatePdfReport($reportData, $filename),
            'excel' => $this->generateExcelReport($reportData, $filename),
            'csv' => $this->generateCsvReport($reportData, $filename),
            default => throw new Exception("Unsupported format: {$format}")
        };
    }

    /**
     * Generate PDF report.
     *
     * @param array $reportData
     * @param string $filename
     * @return string
     */
    private function generatePdfReport(array $reportData, string $filename): string
    {
        // For now, generate a simple text-based PDF
        // In production, you would use a library like TCPDF or DomPDF
        $content = $this->generateTextContent($reportData);
        
        Storage::put($filename, $content);
        
        return $filename;
    }

    /**
     * Generate Excel report.
     *
     * @param array $reportData
     * @param string $filename
     * @return string
     */
    private function generateExcelReport(array $reportData, string $filename): string
    {
        // For now, generate CSV format
        // In production, you would use PhpSpreadsheet
        return $this->generateCsvReport($reportData, $filename);
    }

    /**
     * Generate CSV report.
     *
     * @param array $reportData
     * @param string $filename
     * @return string
     */
    private function generateCsvReport(array $reportData, string $filename): string
    {
        $csvContent = $this->convertArrayToCsv($reportData);
        
        Storage::put($filename, $csvContent);
        
        return $filename;
    }

    /**
     * Generate text content from report data.
     *
     * @param array $reportData
     * @return string
     */
    private function generateTextContent(array $reportData): string
    {
        $content = [];
        $content[] = strtoupper($reportData['title']);
        $content[] = str_repeat('=', strlen($reportData['title']));
        $content[] = '';
        $content[] = 'Generated: ' . $reportData['generated_at'];
        $content[] = 'Period: ' . $reportData['period'];
        $content[] = '';

        if (isset($reportData['summary'])) {
            $content[] = 'SUMMARY';
            $content[] = str_repeat('-', 7);
            foreach ($reportData['summary'] as $key => $value) {
                $content[] = "{$key}: {$value}";
            }
            $content[] = '';
        }

        return implode("\n", $content);
    }

    /**
     * Convert array data to CSV format.
     *
     * @param array $data
     * @return string
     */
    private function convertArrayToCsv(array $data): string
    {
        $output = fopen('php://temp', 'r+');
        
        // Add header
        fputcsv($output, ['Report', $data['title']]);
        fputcsv($output, ['Generated', $data['generated_at']]);
        fputcsv($output, ['Period', $data['period']]);
        fputcsv($output, []);

        // Add summary if exists
        if (isset($data['summary'])) {
            fputcsv($output, ['SUMMARY']);
            foreach ($data['summary'] as $key => $value) {
                fputcsv($output, [$key, $value]);
            }
            fputcsv($output, []);
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Schedule a report for automatic generation.
     *
     * @param array $report
     * @param array $schedule
     * @param int $userId
     * @return void
     */
    private function scheduleReport(array $report, array $schedule, int $userId): void
    {
        // This would integrate with Laravel's job scheduling system
        // For now, we'll just log the scheduling request
        $this->loggingService->logUserActivity(
            $userId,
            'report_scheduled',
            'Report',
            $report['id'],
            [
                'schedule' => $schedule,
                'report_type' => $report['type'],
            ]
        );
    }

    /**
     * Format date range for display.
     *
     * @param array $filters
     * @return string
     */
    private function formatDateRange(array $filters): string
    {
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            return Carbon::parse($filters['start_date'])->format('M j, Y') . 
                   ' - ' . 
                   Carbon::parse($filters['end_date'])->format('M j, Y');
        }

        $range = $filters['date_range'] ?? 'month';
        return match ($range) {
            'week' => 'Last 7 days',
            'month' => 'Last 30 days',
            'quarter' => 'Last 90 days',
            'year' => 'Last 365 days',
            default => 'Last 30 days',
        };
    }
}
