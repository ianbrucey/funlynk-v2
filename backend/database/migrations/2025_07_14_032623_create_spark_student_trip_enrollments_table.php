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
        Schema::create('spark_student_trip_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('spark_trip_bookings')->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->boolean('attended')->nullable();
            $table->timestamp('attendance_timestamp')->nullable();
            $table->timestamps();

            $table->unique(['booking_id', 'student_id'], 'unique_booking_student');
            $table->index('booking_id');
            $table->index('student_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spark_student_trip_enrollments');
    }
};
