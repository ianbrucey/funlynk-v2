<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('student_id', 50)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('parent_email')->nullable();
            $table->string('parent_phone', 20)->nullable();
            $table->string('parent_name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('school_id');
            $table->index('class_id');
            $table->index(['first_name', 'last_name']);
            $table->index('parent_email');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
