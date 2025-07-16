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
        Schema::table('spark_program_character_topics', function (Blueprint $table) {
            // Drop the existing character_topic column
            $table->dropColumn('character_topic');
            
            // Add the proper foreign key reference
            $table->foreignId('character_topic_id')->constrained('character_topics')->onDelete('cascade');
            
            // Update the unique constraint
            $table->dropUnique('unique_program_topic');
            $table->unique(['program_id', 'character_topic_id'], 'unique_program_character_topic');
            
            // Update the index
            $table->dropIndex(['character_topic']);
            $table->index('character_topic_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spark_program_character_topics', function (Blueprint $table) {
            // Reverse the changes
            $table->dropForeign(['character_topic_id']);
            $table->dropUnique('unique_program_character_topic');
            $table->dropIndex(['character_topic_id']);
            $table->dropColumn('character_topic_id');
            
            // Add back the original column
            $table->string('character_topic', 100);
            $table->unique(['program_id', 'character_topic'], 'unique_program_topic');
            $table->index('character_topic');
        });
    }
};
