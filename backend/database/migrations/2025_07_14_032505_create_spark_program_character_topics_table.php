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
        Schema::create('spark_program_character_topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('spark_programs')->onDelete('cascade');
            $table->string('character_topic', 100);

            $table->unique(['program_id', 'character_topic'], 'unique_program_topic');
            $table->index('program_id');
            $table->index('character_topic');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spark_program_character_topics');
    }
};
