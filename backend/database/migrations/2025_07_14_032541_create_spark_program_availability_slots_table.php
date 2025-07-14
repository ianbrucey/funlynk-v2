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
        Schema::create('spark_program_availability_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('spark_programs')->onDelete('cascade');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('max_capacity')->unsigned();
            $table->integer('booked_capacity')->unsigned()->default(0);
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->index('program_id');
            $table->index('date');
            $table->index('is_available');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spark_program_availability_slots');
    }
};
