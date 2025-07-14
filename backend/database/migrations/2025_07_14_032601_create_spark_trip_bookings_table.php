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
        Schema::create('spark_trip_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('spark_programs')->onDelete('cascade');
            $table->foreignId('slot_id')->constrained('spark_program_availability_slots')->onDelete('cascade');
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->integer('students_count')->unsigned();
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
            $table->text('booking_notes')->nullable();
            $table->timestamps();

            $table->index('program_id');
            $table->index('slot_id');
            $table->index('school_id');
            $table->index('teacher_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spark_trip_bookings');
    }
};
