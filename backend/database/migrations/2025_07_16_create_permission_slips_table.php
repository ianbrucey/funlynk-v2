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
        Schema::create('permission_slips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('booking_students')->onDelete('cascade');
            $table->foreignId('template_id')->nullable()->constrained('permission_slip_templates')->onDelete('set null');
            $table->string('token')->unique();
            $table->string('parent_name')->nullable();
            $table->string('parent_email')->nullable();
            $table->string('parent_phone')->nullable();
            $table->json('emergency_contacts')->nullable();
            $table->json('medical_info')->nullable();
            $table->text('special_instructions')->nullable();
            $table->boolean('photo_permission')->default(false);
            $table->boolean('is_signed')->default(false);
            $table->text('signature_data')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->string('signed_ip')->nullable();
            $table->integer('reminder_sent_count')->default(0);
            $table->timestamp('last_reminder_sent_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index(['booking_id']);
            $table->index(['student_id']);
            $table->index(['token']);
            $table->index(['is_signed']);
            $table->index(['parent_email']);
            $table->index(['signed_at']);
            
            // Unique constraint to prevent duplicate permission slips
            $table->unique(['booking_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permission_slips');
    }
};
