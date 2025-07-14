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
        Schema::create('spark_permission_slips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('spark_student_trip_enrollments')->onDelete('cascade');
            $table->string('token')->unique();
            $table->string('parent_name')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();
            $table->string('emergency_contact_relationship', 100)->nullable();
            $table->text('medical_notes')->nullable();
            $table->boolean('consent_given')->default(false);
            $table->timestamp('signed_at')->nullable();
            $table->enum('status', ['sent', 'signed', 'overdue'])->default('sent');
            $table->timestamps();

            $table->unique('enrollment_id');
            $table->index('token');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spark_permission_slips');
    }
};
