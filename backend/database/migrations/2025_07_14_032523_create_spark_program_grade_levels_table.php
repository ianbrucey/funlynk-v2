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
        Schema::create('spark_program_grade_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('spark_programs')->onDelete('cascade');
            $table->string('grade_level', 10);

            $table->unique(['program_id', 'grade_level'], 'unique_program_grade');
            $table->index('program_id');
            $table->index('grade_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spark_program_grade_levels');
    }
};
