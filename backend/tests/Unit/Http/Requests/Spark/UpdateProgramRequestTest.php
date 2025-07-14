<?php

namespace Tests\Unit\Http\Requests\Spark;

use App\Http\Requests\Spark\UpdateProgramRequest;
use App\Models\Spark\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UpdateProgramRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create default roles
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'spark_admin']);
        Role::firstOrCreate(['name' => 'user']);
    }

    public function test_authorizes_admin_users(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        $program = Program::factory()->create();

        $this->actingAs($user);

        $request = new UpdateProgramRequest();
        $request->setRouteResolver(function () use ($program) {
            return new class ($program) {
                public function __construct(private Program $program)
                {
                }

                public function parameter($name)
                {
                    return $this->program;
                }

                public function route($name)
                {
                    return $this->program;
                }
            };
        });

        $this->assertTrue($request->authorize());
    }

    public function test_authorizes_spark_admin_users(): void
    {
        $user = User::factory()->create();
        $user->assignRole('spark_admin');
        $program = Program::factory()->create();

        $this->actingAs($user);

        $request = new UpdateProgramRequest();
        $request->setRouteResolver(function () use ($program) {
            return new class ($program) {
                public function __construct(private Program $program)
                {
                }

                public function parameter($name)
                {
                    return $this->program;
                }

                public function route($name)
                {
                    return $this->program;
                }
            };
        });

        $this->assertTrue($request->authorize());
    }

    public function test_denies_regular_users(): void
    {
        $user = User::factory()->create();
        $user->assignRole('user');
        $program = Program::factory()->create();

        $this->actingAs($user);

        $request = new UpdateProgramRequest();
        $request->setRouteResolver(function () use ($program) {
            return new class ($program) {
                public function __construct(private Program $program)
                {
                }

                public function parameter($name)
                {
                    return $this->program;
                }

                public function route($name)
                {
                    return $this->program;
                }
            };
        });

        $this->assertFalse($request->authorize());
    }

    public function test_denies_unauthenticated_users(): void
    {
        $program = Program::factory()->create();

        $request = new UpdateProgramRequest();
        $request->setRouteResolver(function () use ($program) {
            return new class ($program) {
                public function __construct(private Program $program)
                {
                }

                public function parameter($name)
                {
                    return $this->program;
                }

                public function route($name)
                {
                    return $this->program;
                }
            };
        });

        $this->assertFalse($request->authorize());
    }

    public function test_passes_validation_with_valid_data(): void
    {
        $request = new UpdateProgramRequest();
        $data = [
            'title' => 'Updated Program Title',
            'description' => 'Updated program description',
            'grade_levels' => ['K', '1', '2'],
            'duration_minutes' => 45,
            'max_students' => 25,
            'price_per_student' => 15.99,
            'character_topics' => ['respect', 'responsibility'],
            'learning_objectives' => ['Learn respect', 'Learn responsibility'],
            'is_active' => true,
        ];

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->passes());
    }

    public function test_passes_validation_with_partial_data(): void
    {
        $request = new UpdateProgramRequest();
        $data = [
            'title' => 'Updated Program Title',
            'duration_minutes' => 45,
        ];

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->passes());
    }

    public function test_fails_validation_with_invalid_title(): void
    {
        $request = new UpdateProgramRequest();
        $data = [
            'title' => str_repeat('a', 300), // Too long
        ];

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('title'));
    }

    public function test_fails_validation_with_invalid_grade_levels(): void
    {
        $request = new UpdateProgramRequest();
        $data = [
            'grade_levels' => ['invalid_grade'],
        ];

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('grade_levels.0'));
    }

    public function test_fails_validation_with_invalid_duration(): void
    {
        $request = new UpdateProgramRequest();
        $data = [
            'duration_minutes' => 10, // Too short
        ];

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('duration_minutes'));
    }

    public function test_fails_validation_with_invalid_max_students(): void
    {
        $request = new UpdateProgramRequest();
        $data = [
            'max_students' => 0, // Too few
        ];

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('max_students'));
    }

    public function test_fails_validation_with_invalid_price(): void
    {
        $request = new UpdateProgramRequest();
        $data = [
            'price_per_student' => -5, // Negative
        ];

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('price_per_student'));
    }

    public function test_cleans_character_topics_array(): void
    {
        $request = new UpdateProgramRequest();
        $request->replace([
            'character_topics' => ['  respect  ', '', 'responsibility', 'respect'],
        ]);

        // Use reflection to call the protected method
        $reflection = new \ReflectionMethod($request, 'prepareForValidation');
        $reflection->setAccessible(true);
        $reflection->invoke($request);

        $cleanedTopics = $request->get('character_topics');

        $this->assertCount(2, $cleanedTopics);
        $this->assertContains('respect', $cleanedTopics);
        $this->assertContains('responsibility', $cleanedTopics);
        $this->assertNotContains('', $cleanedTopics);
    }

    public function test_cleans_learning_objectives_array(): void
    {
        $request = new UpdateProgramRequest();
        $request->replace([
            'learning_objectives' => ['Learn respect', '', '  Learn responsibility  '],
        ]);

        // Use reflection to call the protected method
        $reflection = new \ReflectionMethod($request, 'prepareForValidation');
        $reflection->setAccessible(true);
        $reflection->invoke($request);

        $cleanedObjectives = $request->get('learning_objectives');

        $this->assertCount(2, $cleanedObjectives);
        $this->assertContains('Learn respect', $cleanedObjectives);
        $this->assertContains('  Learn responsibility  ', $cleanedObjectives);
        $this->assertNotContains('', $cleanedObjectives);
    }

    public function test_converts_is_active_to_boolean(): void
    {
        $request = new UpdateProgramRequest();
        $request->replace([
            'is_active' => '1',
        ]);

        // Use reflection to call the protected method
        $reflection = new \ReflectionMethod($request, 'prepareForValidation');
        $reflection->setAccessible(true);
        $reflection->invoke($request);

        $this->assertTrue($request->get('is_active'));
    }

    public function test_inherits_rules_from_create_program_request_with_sometimes_modifier(): void
    {
        $request = new UpdateProgramRequest();
        $rules = $request->rules();

        // Check that all rules have 'sometimes' modifier
        foreach ($rules as $field => $fieldRules) {
            if (is_array($fieldRules)) {
                $this->assertEquals('sometimes', $fieldRules[0]);
            } else {
                $this->assertStringStartsWith('sometimes|', $fieldRules);
            }
        }
    }

    public function test_inherits_messages_from_create_program_request(): void
    {
        $createRequest = new \App\Http\Requests\Spark\CreateProgramRequest();
        $updateRequest = new UpdateProgramRequest();

        $this->assertEquals($createRequest->messages(), $updateRequest->messages());
    }

    public function test_inherits_attributes_from_create_program_request(): void
    {
        $createRequest = new \App\Http\Requests\Spark\CreateProgramRequest();
        $updateRequest = new UpdateProgramRequest();

        $this->assertEquals($createRequest->attributes(), $updateRequest->attributes());
    }
}
