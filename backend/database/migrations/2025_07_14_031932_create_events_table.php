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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('host_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('event_categories');
            $table->string('title');
            $table->text('description');
            $table->string('short_description', 500)->nullable();
            $table->datetime('start_time');
            $table->datetime('end_time');
            $table->string('location_address');
            $table->decimal('location_latitude', 10, 8);
            $table->decimal('location_longitude', 11, 8);
            $table->enum('visibility', ['public', 'friends', 'private'])->default('public');
            $table->integer('max_capacity')->unsigned()->nullable();
            $table->decimal('price', 8, 2)->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_virtual')->default(false);
            $table->string('virtual_url')->nullable();
            $table->enum('status', ['draft', 'published', 'cancelled', 'completed'])->default('published');
            $table->timestamps();

            $table->index('host_id');
            $table->index('category_id');
            $table->index('start_time');
            $table->index(['location_latitude', 'location_longitude']);
            $table->index('visibility');
            $table->index('status');
            $table->index('created_at');
            $table->index('price');
            $table->index('max_capacity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
