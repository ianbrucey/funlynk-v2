<?php

namespace Tests\Traits;

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;

trait TestHelpers
{
    /**
     * Create a user with specific role.
     */
    protected function createUserWithRole(string $role, array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $user->assignRole($role);

        return $user;
    }

    /**
     * Create an admin user.
     */
    protected function createAdminUser(array $attributes = []): User
    {
        return $this->createUserWithRole('admin', $attributes);
    }

    /**
     * Create a moderator user.
     */
    protected function createModeratorUser(array $attributes = []): User
    {
        return $this->createUserWithRole('moderator', $attributes);
    }

    /**
     * Create a regular user.
     */
    protected function createRegularUser(array $attributes = []): User
    {
        return $this->createUserWithRole('user', $attributes);
    }

    /**
     * Authenticate a user with Sanctum.
     */
    protected function actingAsUser(User $user, array $abilities = ['*']): self
    {
        Sanctum::actingAs($user, $abilities);

        return $this;
    }

    /**
     * Authenticate an admin user.
     */
    protected function actingAsAdmin(array $attributes = []): self
    {
        $admin = $this->createAdminUser($attributes);

        return $this->actingAsUser($admin);
    }

    /**
     * Authenticate a moderator user.
     */
    protected function actingAsModerator(array $attributes = []): self
    {
        $moderator = $this->createModeratorUser($attributes);

        return $this->actingAsUser($moderator);
    }

    /**
     * Create default roles for testing.
     */
    protected function createDefaultRoles(): void
    {
        Role::firstOrCreate(['name' => 'user']);
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'moderator']);
    }

    /**
     * Assert that a user has a specific role.
     */
    protected function assertUserHasRole(User $user, string $role): void
    {
        $this->assertTrue(
            $user->hasRole($role),
            "User {$user->id} does not have the '{$role}' role"
        );
    }

    /**
     * Assert that a user does not have a specific role.
     */
    protected function assertUserDoesNotHaveRole(User $user, string $role): void
    {
        $this->assertFalse(
            $user->hasRole($role),
            "User {$user->id} has the '{$role}' role but should not"
        );
    }

    /**
     * Assert that a user is active.
     */
    protected function assertUserIsActive(User $user): void
    {
        $this->assertTrue(
            $user->is_active,
            "User {$user->id} is not active"
        );
    }

    /**
     * Assert that a user is inactive.
     */
    protected function assertUserIsInactive(User $user): void
    {
        $this->assertFalse(
            $user->is_active,
            "User {$user->id} is active but should be inactive"
        );
    }

    /**
     * Assert that a user's email is verified.
     */
    protected function assertUserEmailIsVerified(User $user): void
    {
        $this->assertNotNull(
            $user->email_verified_at,
            "User {$user->id} email is not verified"
        );
    }

    /**
     * Assert that a user's email is not verified.
     */
    protected function assertUserEmailIsNotVerified(User $user): void
    {
        $this->assertNull(
            $user->email_verified_at,
            "User {$user->id} email is verified but should not be"
        );
    }

    /**
     * Assert that a user has tokens.
     */
    protected function assertUserHasTokens(User $user, int $count = null): void
    {
        $tokenCount = $user->tokens()->count();

        if ($count === null) {
            $this->assertGreaterThan(0, $tokenCount, "User {$user->id} has no tokens");
        } else {
            $this->assertEquals($count, $tokenCount, "User {$user->id} does not have {$count} tokens");
        }
    }

    /**
     * Assert that a user has no tokens.
     */
    protected function assertUserHasNoTokens(User $user): void
    {
        $this->assertEquals(
            0,
            $user->tokens()->count(),
            "User {$user->id} has tokens but should not"
        );
    }

    /**
     * Assert JSON response has authentication structure.
     */
    protected function assertJsonHasAuthStructure($response): void
    {
        $response->assertJsonStructure([
            'success',
            'data' => [
                'user' => [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'is_active',
                    'roles',
                ],
                'token',
                'token_type',
                'expires_at',
            ],
            'message',
        ]);
    }

    /**
     * Assert JSON response has error structure.
     */
    protected function assertJsonHasErrorStructure($response): void
    {
        $response->assertJsonStructure([
            'success',
            'data',
            'message',
        ])
        ->assertJson([
            'success' => false,
        ]);
    }

    /**
     * Assert JSON response has validation error structure.
     */
    protected function assertJsonHasValidationErrorStructure($response): void
    {
        $response->assertJsonStructure([
            'success',
            'data',
            'message',
            'errors',
        ])
        ->assertJson([
            'success' => false,
        ])
        ->assertStatus(422);
    }

    /**
     * Generate a valid registration payload.
     */
    protected function getValidRegistrationPayload(array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '1234567890',
            'country_code' => '1',
            'date_of_birth' => '1990-01-01',
            'gender' => 'male',
            'timezone' => 'UTC',
            'language' => 'en',
        ], $overrides);
    }

    /**
     * Generate a valid login payload.
     */
    protected function getValidLoginPayload(array $overrides = []): array
    {
        return array_merge([
            'email' => 'test@example.com',
            'password' => 'password123',
        ], $overrides);
    }

    /**
     * Generate a valid password reset payload.
     */
    protected function getValidPasswordResetPayload(array $overrides = []): array
    {
        return array_merge([
            'email' => 'test@example.com',
            'token' => 'reset-token',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ], $overrides);
    }

    /**
     * Create a user with API token.
     */
    protected function createUserWithToken(array $userAttributes = [], array $tokenAbilities = ['*']): array
    {
        $user = User::factory()->create($userAttributes);
        $token = $user->createToken('test-token', $tokenAbilities);

        return [
            'user' => $user,
            'token' => $token->plainTextToken,
            'accessToken' => $token->accessToken,
        ];
    }

    /**
     * Make authenticated request with bearer token.
     */
    protected function authenticatedRequest(string $method, string $uri, string $token, array $data = []): \Illuminate\Testing\TestResponse
    {
        return $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->json($method, $uri, $data);
    }

    /**
     * Make authenticated GET request.
     */
    protected function authenticatedGet(string $uri, string $token): \Illuminate\Testing\TestResponse
    {
        return $this->authenticatedRequest('GET', $uri, $token);
    }

    /**
     * Make authenticated POST request.
     */
    protected function authenticatedPost(string $uri, string $token, array $data = []): \Illuminate\Testing\TestResponse
    {
        return $this->authenticatedRequest('POST', $uri, $token, $data);
    }

    /**
     * Make authenticated PUT request.
     */
    protected function authenticatedPut(string $uri, string $token, array $data = []): \Illuminate\Testing\TestResponse
    {
        return $this->authenticatedRequest('PUT', $uri, $token, $data);
    }

    /**
     * Make authenticated DELETE request.
     */
    protected function authenticatedDelete(string $uri, string $token): \Illuminate\Testing\TestResponse
    {
        return $this->authenticatedRequest('DELETE', $uri, $token);
    }
}
