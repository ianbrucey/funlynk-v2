<?php

namespace App\Models\Spark;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class AnalyticsReport extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'report_type',
        'filters',
        'data',
        'status',
        'format',
        'file_path',
        'file_size',
        'generated_at',
        'expires_at',
        'is_scheduled',
        'schedule_frequency',
        'schedule_config',
        'last_sent_at',
        'next_run_at',
        'email_recipients',
        'error_message',
        'generation_time_ms',
    ];

    protected $casts = [
        'filters' => 'array',
        'data' => 'array',
        'schedule_config' => 'array',
        'email_recipients' => 'array',
        'generated_at' => 'datetime',
        'expires_at' => 'datetime',
        'last_sent_at' => 'datetime',
        'next_run_at' => 'datetime',
        'is_scheduled' => 'boolean',
        'file_size' => 'integer',
        'generation_time_ms' => 'integer',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(ReportMetric::class, 'report_id');
    }

    // Scopes
    public function scopeByType($query, string $type)
    {
        return $query->where('report_type', $type);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeScheduled($query)
    {
        return $query->where('is_scheduled', true);
    }

    public function scopeDue($query)
    {
        return $query->where('is_scheduled', true)
                    ->where('next_run_at', '<=', now());
    }

    public function scopeExpired($query)
    {
        return $query->whereNotNull('expires_at')
                    ->where('expires_at', '<', now());
    }

    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Accessors
    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function getIsDueAttribute(): bool
    {
        return $this->is_scheduled && 
               $this->next_run_at && 
               $this->next_run_at->isPast();
    }

    public function getFileSizeHumanAttribute(): string
    {
        if (!$this->file_size) {
            return 'N/A';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->file_size;
        $unit = 0;

        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, 2) . ' ' . $units[$unit];
    }

    public function getGenerationTimeHumanAttribute(): string
    {
        if (!$this->generation_time_ms) {
            return 'N/A';
        }

        if ($this->generation_time_ms < 1000) {
            return $this->generation_time_ms . 'ms';
        }

        return round($this->generation_time_ms / 1000, 2) . 's';
    }

    // Methods
    public function markAsGenerating(): void
    {
        $this->update([
            'status' => 'generating',
            'error_message' => null,
        ]);
    }

    public function markAsCompleted(array $data, ?string $filePath = null, ?int $fileSize = null, ?int $generationTime = null): void
    {
        $this->update([
            'status' => 'completed',
            'data' => $data,
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'generated_at' => now(),
            'expires_at' => $this->calculateExpirationDate(),
            'generation_time_ms' => $generationTime,
            'error_message' => null,
        ]);
    }

    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
        ]);
    }

    public function updateNextRunTime(): void
    {
        if (!$this->is_scheduled || !$this->schedule_frequency) {
            return;
        }

        $nextRun = match ($this->schedule_frequency) {
            'daily' => now()->addDay(),
            'weekly' => now()->addWeek(),
            'monthly' => now()->addMonth(),
            'quarterly' => now()->addMonths(3),
            'yearly' => now()->addYear(),
            default => now()->addDay(),
        };

        $this->update([
            'next_run_at' => $nextRun,
            'last_sent_at' => now(),
        ]);
    }

    public function shouldRegenerate(): bool
    {
        return $this->status !== 'completed' || 
               $this->is_expired || 
               ($this->is_scheduled && $this->is_due);
    }

    private function calculateExpirationDate(): Carbon
    {
        // Reports expire based on their type
        return match ($this->report_type) {
            'dashboard_overview' => now()->addHours(1), // Real-time data
            'booking_analytics' => now()->addHours(6),
            'program_performance' => now()->addHours(12),
            'school_engagement' => now()->addDay(),
            'financial_summary' => now()->addDays(3),
            'custom_report' => now()->addHours(6),
            default => now()->addHours(6),
        };
    }

    // Static methods
    public static function getReportTypes(): array
    {
        return [
            'dashboard_overview' => 'Dashboard Overview',
            'booking_analytics' => 'Booking Analytics',
            'program_performance' => 'Program Performance',
            'school_engagement' => 'School Engagement',
            'financial_summary' => 'Financial Summary',
            'custom_report' => 'Custom Report',
        ];
    }

    public static function getScheduleFrequencies(): array
    {
        return [
            'daily' => 'Daily',
            'weekly' => 'Weekly',
            'monthly' => 'Monthly',
            'quarterly' => 'Quarterly',
            'yearly' => 'Yearly',
        ];
    }
}
