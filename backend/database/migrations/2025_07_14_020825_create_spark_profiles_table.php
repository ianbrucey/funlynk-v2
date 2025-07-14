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
        Schema::create('spark_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('personality_type')->nullable();
            $table->json('fun_facts')->nullable();
            $table->json('hobbies')->nullable();
            $table->json('favorite_books')->nullable();
            $table->json('favorite_movies')->nullable();
            $table->json('favorite_music')->nullable();
            $table->json('favorite_quotes')->nullable();
            $table->json('bucket_list')->nullable();
            $table->json('pet_peeves')->nullable();
            $table->json('dream_destinations')->nullable();
            $table->text('life_motto')->nullable();
            $table->string('current_mood')->nullable();
            $table->string('relationship_status')->nullable();
            $table->string('looking_for')->nullable();
            $table->text('deal_breakers')->nullable();
            $table->text('ideal_first_date')->nullable();
            $table->json('conversation_starters')->nullable();
            $table->json('icebreaker_questions')->nullable();
            $table->json('fun_challenges')->nullable();
            $table->json('quirky_habits')->nullable();
            $table->json('hidden_talents')->nullable();
            $table->json('guilty_pleasures')->nullable();
            $table->string('spirit_animal')->nullable();
            $table->string('superpowers_wish')->nullable();
            $table->string('time_travel_destination')->nullable();
            $table->json('desert_island_items')->nullable();
            $table->string('karaoke_song')->nullable();
            $table->json('pizza_toppings')->nullable();
            $table->string('coffee_order')->nullable();
            $table->text('weekend_plans')->nullable();
            $table->enum('adventure_level', ['low', 'medium', 'high', 'extreme'])->default('medium');
            $table->enum('humor_style', ['witty', 'sarcastic', 'silly', 'dry', 'playful', 'quirky'])->nullable();
            $table->enum('communication_style', ['direct', 'diplomatic', 'casual', 'formal', 'expressive'])->nullable();
            $table->enum('energy_level', ['low', 'medium', 'high', 'very_high'])->default('medium');
            $table->enum('spontaneity_level', ['planned', 'flexible', 'spontaneous', 'very_spontaneous'])->default('flexible');
            $table->enum('social_battery', ['introvert', 'ambivert', 'extrovert'])->nullable();
            $table->enum('love_language', ['words_of_affirmation', 'acts_of_service', 'receiving_gifts', 'quality_time', 'physical_touch'])->nullable();
            $table->text('conflict_resolution')->nullable();
            $table->text('decision_making_style')->nullable();
            $table->text('stress_relief')->nullable();
            $table->text('celebration_style')->nullable();
            $table->text('learning_style')->nullable();
            $table->text('creativity_outlet')->nullable();
            $table->text('fitness_routine')->nullable();
            $table->json('food_preferences')->nullable();
            $table->text('travel_style')->nullable();
            $table->json('entertainment_preferences')->nullable();
            $table->json('social_causes')->nullable();
            $table->json('volunteer_work')->nullable();
            $table->json('mentorship_interests')->nullable();
            $table->json('networking_goals')->nullable();
            $table->json('personal_growth')->nullable();
            $table->json('future_aspirations')->nullable();
            $table->json('legacy_goals')->nullable();
            $table->integer('spark_score')->default(0);
            $table->boolean('profile_visibility')->default(true);
            $table->timestamp('last_spark_update')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('spark_score');
            $table->index('profile_visibility');
            $table->index('last_spark_update');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spark_profiles');
    }
};
