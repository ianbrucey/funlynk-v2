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
        Schema::create('friend_suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('suggested_user_id')->constrained('users')->onDelete('cascade');
            $table->string('suggestion_type'); // mutual_friends, shared_interests, location, events, etc.
            $table->decimal('confidence_score', 5, 4)->default(0.0000); // 0.0000 to 1.0000
            $table->json('suggestion_reasons')->nullable(); // Array of reasons for suggestion
            $table->json('mutual_connections')->nullable(); // Mutual friends, events, interests
            $table->integer('mutual_friends_count')->default(0);
            $table->integer('shared_interests_count')->default(0);
            $table->integer('shared_events_count')->default(0);
            $table->boolean('is_dismissed')->default(false);
            $table->timestamp('dismissed_at')->nullable();
            $table->boolean('is_contacted')->default(false);
            $table->timestamp('contacted_at')->nullable();
            $table->boolean('is_followed')->default(false);
            $table->timestamp('followed_at')->nullable();
            $table->timestamp('expires_at')->nullable(); // Suggestions can expire
            $table->timestamps();

            // Indexes for performance
            $table->index(['user_id', 'is_dismissed', 'confidence_score']);
            $table->index(['suggested_user_id']);
            $table->index(['suggestion_type', 'confidence_score']);
            $table->index(['expires_at', 'is_dismissed']);
            $table->index(['is_contacted', 'contacted_at']);
            $table->index(['is_followed', 'followed_at']);

            // Unique constraint to prevent duplicate suggestions
            $table->unique(['user_id', 'suggested_user_id'], 'unique_user_suggestion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('friend_suggestions');
    }
};
