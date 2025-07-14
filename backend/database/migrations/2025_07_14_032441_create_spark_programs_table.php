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
            $table->string('short_summary', 500);
            $table->integer('duration_minutes')->unsigned();
            $table->decimal('cost', 8, 2)->default(0.00);
            $table->string('location_address');
            $table->string('location_city', 100);
            $table->string('location_state', 50);
            $table->string('location_zip', 10);
            $table->decimal('location_latitude', 10, 8);
            $table->decimal('location_longitude', 11, 8);
            $table->text('what_to_bring')->nullable();
            $table->text('special_instructions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['location_latitude', 'location_longitude']);
            $table->index(['location_city', 'location_state']);
            $table->index('is_active');
            $table->fullText(['title', 'description']);
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
