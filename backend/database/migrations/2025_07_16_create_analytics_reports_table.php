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
        Schema::create('analytics_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->enum('report_type', [
                'dashboard_overview',
                'booking_analytics', 
                'program_performance',
                'school_engagement',
                'financial_summary',
                'custom_report'
            ]);
            $table->json('filters')->nullable(); // Date ranges, school IDs, program IDs, etc.
            $table->json('data')->nullable(); // Cached report data
            $table->enum('status', ['pending', 'generating', 'completed', 'failed'])->default('pending');
            $table->enum('format', ['json', 'pdf', 'csv'])->default('json');
            $table->string('file_path')->nullable(); // For generated PDF/CSV files
            $table->integer('file_size')->nullable(); // File size in bytes
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('expires_at')->nullable(); // Cache expiration
            $table->boolean('is_scheduled')->default(false);
            $table->string('schedule_frequency')->nullable(); // daily, weekly, monthly
            $table->json('schedule_config')->nullable(); // Cron-like config
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamp('next_run_at')->nullable();
            $table->json('email_recipients')->nullable(); // For scheduled reports
            $table->text('error_message')->nullable();
            $table->integer('generation_time_ms')->nullable(); // Performance tracking
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index(['user_id', 'report_type']);
            $table->index(['status']);
            $table->index(['is_scheduled', 'next_run_at']);
            $table->index(['generated_at']);
            $table->index(['expires_at']);
            $table->index(['report_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_reports');
    }
};
