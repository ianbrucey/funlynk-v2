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
        Schema::create('core_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('occupation')->nullable();
            $table->string('company')->nullable();
            $table->string('location')->nullable();
            $table->string('website')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('facebook_url')->nullable();
            $table->json('interests')->nullable();
            $table->json('skills')->nullable();
            $table->string('experience_level')->nullable();
            $table->text('education')->nullable();
            $table->text('certifications')->nullable();
            $table->json('languages_spoken')->nullable();
            $table->enum('availability_status', ['available', 'busy', 'away', 'do_not_disturb'])->default('available');
            $table->enum('preferred_contact_method', ['email', 'phone', 'message', 'video_call'])->default('email');
            $table->json('visibility_settings')->nullable();
            $table->integer('profile_completion_score')->default(0);
            $table->boolean('is_verified')->default(false);
            $table->json('verification_documents')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('is_verified');
            $table->index('profile_completion_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('core_profiles');
    }
};
