<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('report_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('metric_key'); // e.g., 'total_bookings', 'revenue_monthly', 'program_popularity'
            $table->string('metric_type'); // e.g., 'count', 'sum', 'average', 'percentage'
            $table->decimal('metric_value', 15, 4); // Numeric value of the metric
            $table->string('metric_unit')->nullable(); // e.g., 'USD', 'count', 'percentage'
            $table->json('dimensions')->nullable(); // Grouping dimensions (school_id, program_id, date_period)
            $table->date('metric_date'); // Date this metric applies to
            $table->enum('period_type', ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);
            $table->date('period_start'); // Start of the period
            $table->date('period_end'); // End of the period
            $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
            $table->foreignId('program_id')->nullable()->constrained('spark_programs')->onDelete('cascade');
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->onDelete('cascade');
            $table->json('metadata')->nullable(); // Additional context data
            $table->timestamp('calculated_at'); // When this metric was calculated
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['metric_key', 'metric_date']);
            $table->index(['metric_key', 'period_type', 'period_start']);
            $table->index(['school_id', 'metric_date']);
            $table->index(['program_id', 'metric_date']);
            $table->index(['booking_id']);
            $table->index(['period_type', 'period_start', 'period_end']);
            $table->index(['calculated_at']);
            
            // Composite indexes for common queries
            $table->index(['metric_key', 'school_id', 'period_start']);
            $table->index(['metric_key', 'program_id', 'period_start']);
            
            // Unique constraint to prevent duplicate metrics
            $table->unique([
                'metric_key', 
                'metric_date', 
                'period_type', 
                'school_id', 
                'program_id', 
                'booking_id'
            ], 'unique_metric_record');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_metrics');
    }
};
