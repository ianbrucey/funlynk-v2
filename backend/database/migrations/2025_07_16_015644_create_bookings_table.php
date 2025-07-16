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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->foreignId('program_id')->constrained('spark_programs')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->string('booking_reference')->unique();
            $table->date('preferred_date');
            $table->time('preferred_time');
            $table->date('confirmed_date')->nullable();
            $table->datetime('confirmed_time')->nullable();
            $table->integer('student_count');
            $table->decimal('total_cost', 10, 2);
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
            $table->text('special_requests')->nullable();
            $table->json('contact_info');
            $table->datetime('confirmed_at')->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'refunded'])->default('pending');
            $table->date('payment_due_date')->nullable();
            $table->text('notes')->nullable();
            $table->integer('rating')->nullable();
            $table->text('feedback')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['school_id', 'status']);
            $table->index(['teacher_id', 'status']);
            $table->index(['program_id', 'status']);
            $table->index(['confirmed_date', 'status']);
            $table->index('booking_reference');
            $table->index('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
