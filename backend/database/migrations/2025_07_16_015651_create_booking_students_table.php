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
        Schema::create('booking_students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('student_id')->nullable()->constrained('students')->onDelete('set null');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('grade_level');
            $table->string('student_id_number')->nullable();
            $table->json('emergency_contact')->nullable();
            $table->json('medical_info')->nullable();
            $table->json('dietary_restrictions')->nullable();
            $table->json('special_needs')->nullable();
            $table->string('parent_name');
            $table->string('parent_email');
            $table->string('parent_phone');
            $table->boolean('is_attending')->default(true);
            $table->datetime('checked_in_at')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index(['booking_id', 'is_attending']);
            $table->index(['booking_id', 'checked_in_at']);
            $table->index('parent_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_students');
    }
};
