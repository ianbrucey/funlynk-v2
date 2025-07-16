<?php

namespace App\Models\Spark;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class ReportMetric extends Model
{
    protected $fillable = [
        'metric_key',
        'metric_type',
        'metric_value',
        'metric_unit',
        'dimensions',
        'metric_date',
        'period_type',
        'period_start',
        'period_end',
        'school_id',
        'program_id',
        'booking_id',
        'metadata',
        'calculated_at',
    ];

    protected $casts = [
        'metric_value' => 'decimal:4',
        'dimensions' => 'array',
        'metadata' => 'array',
        'metric_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
        'calculated_at' => 'datetime',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(SparkProgram::class, 'program_id');
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    // Scopes
    public function scopeByMetric($query, string $metricKey)
    {
        return $query->where('metric_key', $metricKey);
    }

    public function scopeByPeriod($query, string $periodType)
    {
        return $query->where('period_type', $periodType);
    }

    public function scopeByDateRange($query, Carbon $startDate, Carbon $endDate)
    {
        return $query->whereBetween('metric_date', [$startDate, $endDate]);
    }

    public function scopeBySchool($query, int $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeByProgram($query, int $programId)
    {
        return $query->where('program_id', $programId);
    }

    public function scopeForPeriod($query, Carbon $periodStart, Carbon $periodEnd)
    {
        return $query->where('period_start', '>=', $periodStart)
                    ->where('period_end', '<=', $periodEnd);
    }

    public function scopeLatest($query)
    {
        return $query->orderBy('calculated_at', 'desc');
    }

    public function scopeByType($query, string $metricType)
    {
        return $query->where('metric_type', $metricType);
    }

    // Accessors
    public function getFormattedValueAttribute(): string
    {
        return match ($this->metric_type) {
            'percentage' => number_format($this->metric_value, 2) . '%',
            'currency' => '$' . number_format($this->metric_value, 2),
            'count' => number_format($this->metric_value, 0),
            'average' => number_format($this->metric_value, 2),
            'sum' => number_format($this->metric_value, 2),
            default => (string) $this->metric_value,
        };
    }

    public function getPeriodLabelAttribute(): string
    {
        return match ($this->period_type) {
            'daily' => $this->period_start->format('M j, Y'),
            'weekly' => $this->period_start->format('M j') . ' - ' . $this->period_end->format('M j, Y'),
            'monthly' => $this->period_start->format('F Y'),
            'quarterly' => 'Q' . $this->period_start->quarter . ' ' . $this->period_start->year,
            'yearly' => $this->period_start->format('Y'),
            default => $this->period_start->format('M j, Y'),
        };
    }

    // Methods
    public function isStale(int $maxAgeHours = 24): bool
    {
        return $this->calculated_at->diffInHours(now()) > $maxAgeHours;
    }

    public function recalculate(): void
    {
        $this->update(['calculated_at' => now()]);
    }

    // Static methods
    public static function getMetricTypes(): array
    {
        return [
            'count' => 'Count',
            'sum' => 'Sum',
            'average' => 'Average',
            'percentage' => 'Percentage',
            'currency' => 'Currency',
            'ratio' => 'Ratio',
        ];
    }

    public static function getPeriodTypes(): array
    {
        return [
            'daily' => 'Daily',
            'weekly' => 'Weekly',
            'monthly' => 'Monthly',
            'quarterly' => 'Quarterly',
            'yearly' => 'Yearly',
        ];
    }

    public static function getCommonMetrics(): array
    {
        return [
            // Booking metrics
            'total_bookings' => 'Total Bookings',
            'confirmed_bookings' => 'Confirmed Bookings',
            'cancelled_bookings' => 'Cancelled Bookings',
            'completed_bookings' => 'Completed Bookings',
            'booking_completion_rate' => 'Booking Completion Rate',
            'average_booking_value' => 'Average Booking Value',
            'total_revenue' => 'Total Revenue',
            
            // Program metrics
            'program_bookings' => 'Program Bookings',
            'program_revenue' => 'Program Revenue',
            'program_capacity_utilization' => 'Program Capacity Utilization',
            'program_rating_average' => 'Program Rating Average',
            'program_popularity_score' => 'Program Popularity Score',
            
            // School metrics
            'school_bookings' => 'School Bookings',
            'school_revenue' => 'School Revenue',
            'school_engagement_score' => 'School Engagement Score',
            'active_schools' => 'Active Schools',
            'new_schools' => 'New Schools',
            
            // Student metrics
            'total_students' => 'Total Students',
            'average_students_per_booking' => 'Average Students per Booking',
            
            // Financial metrics
            'monthly_revenue' => 'Monthly Revenue',
            'revenue_growth_rate' => 'Revenue Growth Rate',
            'average_revenue_per_school' => 'Average Revenue per School',
            'payment_completion_rate' => 'Payment Completion Rate',
        ];
    }

    public static function createMetric(array $data): self
    {
        return static::create(array_merge($data, [
            'calculated_at' => now(),
        ]));
    }

    public static function updateOrCreateMetric(array $identifiers, array $data): self
    {
        return static::updateOrCreate($identifiers, array_merge($data, [
            'calculated_at' => now(),
        ]));
    }
}
