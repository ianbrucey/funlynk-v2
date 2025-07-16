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
        Schema::create('activity_feeds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('activity_type'); // follow, event_created, event_joined, comment, share, etc.
            $table->morphs('activityable'); // Polymorphic relationship to events, comments, follows, etc.
            $table->foreignId('actor_id')->constrained('users')->onDelete('cascade'); // Who performed the action
            $table->json('activity_data')->nullable(); // Additional context data
            $table->text('activity_text')->nullable(); // Human-readable activity description
            $table->enum('privacy_level', ['public', 'friends', 'private'])->default('public');
            $table->boolean('is_read')->default(false);
            $table->boolean('is_visible')->default(true);
            $table->integer('engagement_score')->default(0); // For feed ranking
            $table->timestamp('activity_timestamp'); // When the original activity occurred
            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance (morphs() already creates activityable_type, activityable_id index)
            $table->index(['user_id', 'is_visible', 'activity_timestamp']);
            $table->index(['actor_id', 'activity_type']);
            $table->index(['privacy_level', 'is_visible']);
            $table->index(['engagement_score', 'activity_timestamp']);
            $table->index(['is_read', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_feeds');
    }
};
