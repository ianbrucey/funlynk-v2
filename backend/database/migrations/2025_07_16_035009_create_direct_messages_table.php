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
        Schema::create('direct_messages', function (Blueprint $table) {
            $table->id();
            $table->string('conversation_id'); // UUID for conversation grouping
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('recipient_id')->constrained('users')->onDelete('cascade');
            $table->text('message_content');
            $table->enum('message_type', ['text', 'image', 'file', 'location', 'event_share'])->default('text');
            $table->json('attachments')->nullable(); // File paths, image URLs, etc.
            $table->json('metadata')->nullable(); // Message reactions, edit history, etc.
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->boolean('is_edited')->default(false);
            $table->timestamp('edited_at')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->timestamp('deleted_at')->nullable();
            $table->foreignId('reply_to_id')->nullable()->constrained('direct_messages')->onDelete('set null');
            $table->timestamps();

            // Indexes for performance
            $table->index(['conversation_id', 'created_at']);
            $table->index(['sender_id', 'recipient_id']);
            $table->index(['recipient_id', 'is_read']);
            $table->index(['is_deleted', 'created_at']);
            $table->index(['reply_to_id']);

            // Composite index for conversation queries
            $table->index(['conversation_id', 'is_deleted', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('direct_messages');
    }
};
