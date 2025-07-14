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
        Schema::create('spark_programs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->json('grade_levels');
            $table->integer('duration_minutes')->unsigned();
            $table->integer('max_students')->unsigned();
            $table->decimal('price_per_student', 8, 2);
            $table->json('character_topics');
            $table->json('learning_objectives');
            $table->json('materials_needed')->nullable();
            $table->json('resource_files')->nullable();
            $table->text('special_requirements')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spark_programs');
    }
};
