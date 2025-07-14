<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Services\Auth\AuthService;
use Carbon\Carbon;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authService = new AuthService();
        
        // Create default roles
        Role::create(['name' => 'user']);
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'moderator']);
    }

    public function test_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        $result = $this->authService->login([
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $this->assertArrayHasKey('user', $result);
        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('token_type', $result);
        $this->assertEquals('Bearer', $result['token_type']);
        $this->assertInstanceOf(User::class, $result['user']);
        $this->assertEquals($user->id, $result['user']->id);
    }

    public function test_login_with_invalid_email(): void
    {
        $this->expectException(ValidationException::class);
        
        $this->authService->login([
            'email' => 'nonexistent@example.com',
            'password' => 'password',
        ]);
    }

    public function test_login_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->expectException(ValidationException::class);
        
        $this->authService->login([
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);
    }

    public function test_login_with_inactive_user(): void
    {
        User::factory()->inactive()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->expectException(ValidationException::class);
        
        $this->authService->login([
            'email' => 'test@example.com',
            'password' => 'password',
        ]);
    }

    public function test_login_with_remember_me(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        $result = $this->authService->login([
            'email' => 'test@example.com',
            'password' => 'password',
        ], true);

        $this->assertArrayHasKey('expires_at', $result);
        $this->assertNotNull($result['expires_at']);
        
        // Check that the token has extended expiry
        $token = $user->tokens()->first();
        $this->assertNotNull($token->expires_at);
    }

    public function test_login_updates_last_login_at(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'last_login_at' => Carbon::now()->subDays(5),
        ]);

        $oldLastLogin = $user->last_login_at;

        $this->authService->login([
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $user->refresh();
        $this->assertNotEquals($oldLastLogin, $user->last_login_at);
        $this->assertTrue($user->last_login_at->isAfter($oldLastLogin));
    }

    public function test_register_creates_user_with_valid_data(): void
    {
        Event::fake();

        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'phone' => '1234567890',
            'country_code' => '1',
            'date_of_birth' => '1990-01-01',
            'gender' => 'male',
            'timezone' => 'UTC',
            'language' => 'en',
        ];

        $result = $this->authService->register($userData);

        $this->assertArrayHasKey('user', $result);
        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('token_type', $result);
        $this->assertEquals('Bearer', $result['token_type']);

        $user = $result['user'];
        $this->assertEquals('John', $user->first_name);
        $this->assertEquals('Doe', $user->last_name);
        $this->assertEquals('john@example.com', $user->email);
        $this->assertTrue($user->hasRole('user'));
        $this->assertTrue($user->is_active);

        Event::assertDispatched(Registered::class);
    }

    public function test_register_fails_with_existing_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $this->expectException(ValidationException::class);

        $this->authService->register([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'existing@example.com',
            'password' => 'password123',
        ]);
    }

    public function test_register_assigns_default_user_role(): void
    {
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ];

        $result = $this->authService->register($userData);
        
        $this->assertTrue($result['user']->hasRole('user'));
    }

    public function test_logout_revokes_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token');
        
        // Simulate the current token
        $user->withAccessToken($token->accessToken);

        $result = $this->authService->logout($user);

        $this->assertArrayHasKey('message', $result);
        $this->assertEquals('Successfully logged out.', $result['message']);
        
        // Verify token is deleted
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token->accessToken->id,
        ]);
    }

    public function test_logout_from_all_devices(): void
    {
        $user = User::factory()->create();
        $token1 = $user->createToken('token1');
        $token2 = $user->createToken('token2');

        $result = $this->authService->logoutFromAllDevices($user);

        $this->assertArrayHasKey('message', $result);
        $this->assertEquals('Successfully logged out from all devices.', $result['message']);
        
        // Verify all tokens are deleted
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token1->accessToken->id,
        ]);
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token2->accessToken->id,
        ]);
    }

    public function test_refresh_token(): void
    {
        $user = User::factory()->create();
        $oldToken = $user->createToken('old-token');
        
        // Simulate the current token
        $user->withAccessToken($oldToken->accessToken);

        $result = $this->authService->refreshToken($user);

        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('user', $result);
        $this->assertArrayHasKey('token_type', $result);
        $this->assertEquals('Bearer', $result['token_type']);
        
        // Verify old token is deleted
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $oldToken->accessToken->id,
        ]);
        
        // Verify new token exists
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => User::class,
        ]);
    }

    public function test_check_user_status_with_active_user(): void
    {
        $user = User::factory()->active()->create();

        $result = $this->authService->checkUserStatus($user);

        $this->assertTrue($result);
    }

    public function test_check_user_status_with_inactive_user(): void
    {
        $user = User::factory()->inactive()->create();
        $token = $user->createToken('test-token');

        $this->expectException(ValidationException::class);

        $this->authService->checkUserStatus($user);
        
        // Verify tokens are revoked
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token->accessToken->id,
        ]);
    }

    public function test_deactivate_user(): void
    {
        $user = User::factory()->active()->create();
        $token = $user->createToken('test-token');

        $result = $this->authService->deactivateUser($user);

        $this->assertArrayHasKey('message', $result);
        $this->assertEquals('User account has been deactivated.', $result['message']);
        
        $user->refresh();
        $this->assertFalse($user->is_active);
        
        // Verify tokens are revoked
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token->accessToken->id,
        ]);
    }

    public function test_activate_user(): void
    {
        $user = User::factory()->inactive()->create();

        $result = $this->authService->activateUser($user);

        $this->assertArrayHasKey('message', $result);
        $this->assertEquals('User account has been activated.', $result['message']);
        
        $user->refresh();
        $this->assertTrue($user->is_active);
    }

    public function test_get_user_with_roles(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $result = $this->authService->getUserWithRoles($user);

        $this->assertInstanceOf(User::class, $result);
        $this->assertTrue($result->relationLoaded('roles'));
        $this->assertTrue($result->relationLoaded('permissions'));
    }

    public function test_assign_role_to_user(): void
    {
        $user = User::factory()->create();

        $result = $this->authService->assignRole($user, 'admin');

        $this->assertArrayHasKey('message', $result);
        $this->assertArrayHasKey('user', $result);
        $this->assertTrue($user->hasRole('admin'));
    }

    public function test_assign_role_fails_with_nonexistent_role(): void
    {
        $user = User::factory()->create();

        $this->expectException(ValidationException::class);

        $this->authService->assignRole($user, 'nonexistent-role');
    }

    public function test_assign_role_fails_when_user_already_has_role(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $this->expectException(ValidationException::class);

        $this->authService->assignRole($user, 'admin');
    }

    public function test_remove_role_from_user(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $result = $this->authService->removeRole($user, 'admin');

        $this->assertArrayHasKey('message', $result);
        $this->assertArrayHasKey('user', $result);
        $this->assertFalse($user->hasRole('admin'));
    }

    public function test_remove_role_fails_when_user_does_not_have_role(): void
    {
        $user = User::factory()->create();

        $this->expectException(ValidationException::class);

        $this->authService->removeRole($user, 'admin');
    }

    public function test_verify_email_with_valid_hash(): void
    {
        Event::fake();
        
        $user = User::factory()->unverified()->create();
        $hash = sha1($user->email);

        $result = $this->authService->verifyEmail($user->id, $hash);

        $this->assertArrayHasKey('message', $result);
        $this->assertEquals('Email verified successfully.', $result['message']);
        
        $user->refresh();
        $this->assertNotNull($user->email_verified_at);
        
        Event::assertDispatched(Verified::class);
    }

    public function test_verify_email_with_invalid_hash(): void
    {
        $user = User::factory()->unverified()->create();

        $this->expectException(ValidationException::class);

        $this->authService->verifyEmail($user->id, 'invalid-hash');
    }

    public function test_verify_email_fails_when_already_verified(): void
    {
        $user = User::factory()->create(); // Already verified
        $hash = sha1($user->email);

        $this->expectException(ValidationException::class);

        $this->authService->verifyEmail($user->id, $hash);
    }

    public function test_resend_email_verification(): void
    {
        $user = User::factory()->unverified()->create();

        $result = $this->authService->resendEmailVerification($user);

        $this->assertArrayHasKey('message', $result);
        $this->assertEquals('Email verification link sent.', $result['message']);
    }

    public function test_resend_email_verification_fails_when_already_verified(): void
    {
        $user = User::factory()->create(); // Already verified

        $this->expectException(ValidationException::class);

        $this->authService->resendEmailVerification($user);
    }

    public function test_reset_password_with_valid_token(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        $token = 'reset-token';
        
        // Insert password reset token
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $result = $this->authService->resetPassword([
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'newpassword',
        ]);

        $this->assertArrayHasKey('user', $result);
        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('message', $result);
        
        // Verify password was updated
        $user->refresh();
        $this->assertTrue(Hash::check('newpassword', $user->password));
        
        // Verify token was deleted
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);
    }

    public function test_reset_password_with_invalid_token(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        
        // Insert password reset token
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make('correct-token'),
            'created_at' => now(),
        ]);

        $this->expectException(ValidationException::class);

        $this->authService->resetPassword([
            'email' => 'test@example.com',
            'token' => 'wrong-token',
            'password' => 'newpassword',
        ]);
    }

    public function test_reset_password_with_expired_token(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        $token = 'reset-token';
        
        // Insert expired password reset token
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now()->subMinutes(120), // Expired
        ]);

        $this->expectException(ValidationException::class);

        $this->authService->resetPassword([
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'newpassword',
        ]);
    }

    public function test_send_password_reset_link(): void
    {
        Password::shouldReceive('sendResetLink')
            ->once()
            ->andReturn(Password::RESET_LINK_SENT);

        $user = User::factory()->create(['email' => 'test@example.com']);

        $result = $this->authService->sendPasswordResetLink('test@example.com');

        $this->assertArrayHasKey('message', $result);
        $this->assertEquals('Password reset link sent to your email address.', $result['message']);
    }

    public function test_send_password_reset_link_fails_for_nonexistent_user(): void
    {
        $this->expectException(ValidationException::class);

        $this->authService->sendPasswordResetLink('nonexistent@example.com');
    }

    public function test_send_password_reset_link_fails_for_inactive_user(): void
    {
        User::factory()->inactive()->create(['email' => 'test@example.com']);

        $this->expectException(ValidationException::class);

        $this->authService->sendPasswordResetLink('test@example.com');
    }
}
