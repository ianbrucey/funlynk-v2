<?php

namespace App\Services\Auth;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Illuminate\Auth\Events\Verified;

class AuthService
{
    /**
     * Authenticate a user and return a token.
     *
     * @param array $credentials
     * @param bool $remember
     * @param string|null $clientType
     * @return array
     * @throws ValidationException
     */
    public function login(array $credentials, bool $remember = false, ?string $clientType = null): array
    {
        $email = $credentials['email'] ?? null;
        $password = $credentials['password'] ?? null;

        // Find the user
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Check if user is active
        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated. Please contact support.'],
            ]);
        }

        // Verify password
        if (!Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Update last login timestamp
        $user->update([
            'last_login_at' => Carbon::now(),
        ]);

        // Create token with optional remember me functionality
        $tokenName = 'auth_token';
        $abilities = ['*'];

        if ($remember) {
            // Token expires in 30 days for remember me
            $token = $user->createToken($tokenName, $abilities, Carbon::now()->addDays(30));
        } else {
            // Default token expiry (usually 24 hours based on sanctum config)
            $token = $user->createToken($tokenName, $abilities);
        }

        $response = [
            'user' => $user->load(['roles', 'permissions']),
            'expires_at' => $remember ? Carbon::now()->addDays(30)->toISOString() : null,
        ];

        // For web clients, store token in HTTP-only cookie
        if ($clientType === 'web') {
            // Set secure HTTP-only cookie
            $cookieName = config('sanctum.cookie_name', 'auth_token');
            $domain = config('sanctum.cookie_domain');
            $secure = config('app.env') === 'production';
            $httpOnly = true;
            $sameSite = 'Strict';

            cookie(
                $cookieName,
                $token->plainTextToken,
                $remember ? 43200 : 1440,
                '/',
                $domain,
                $secure,
                $httpOnly,
                false,
                $sameSite
            );

            $response['token_type'] = 'Cookie';
            $response['message'] = 'Authentication successful. Token stored in secure cookie.';
        } else {
            // For mobile clients, return bearer token
            $response['token'] = $token->plainTextToken;
            $response['token_type'] = 'Bearer';
        }

        return $response;
    }

    /**
     * Register a new user.
     *
     * @param array $userData
     * @param string|null $clientType
     * @return array
     * @throws ValidationException
     */
    public function register(array $userData, ?string $clientType = null): array
    {
        // Check if email already exists
        if (User::where('email', $userData['email'])->exists()) {
            throw ValidationException::withMessages([
                'email' => ['The email address has already been taken.'],
            ]);
        }

        DB::beginTransaction();

        try {
            // Create the user
            $user = User::create([
                'first_name' => $userData['first_name'],
                'last_name' => $userData['last_name'],
                'name' => trim($userData['first_name'] . ' ' . $userData['last_name']),
                'email' => strtolower($userData['email']),
                'password' => $userData['password'], // Will be hashed automatically due to cast
                'phone' => $userData['phone'] ?? null,
                'country_code' => $userData['country_code'] ?? null,
                'date_of_birth' => $userData['date_of_birth'] ?? null,
                'gender' => $userData['gender'] ?? null,
                'timezone' => $userData['timezone'] ?? 'UTC',
                'language' => $userData['language'] ?? 'en',
                'is_active' => true,
                'last_login_at' => Carbon::now(),
            ]);

            // Assign default 'user' role
            $userRole = Role::where('name', 'user')->first();
            if (!$userRole) {
                // Create the user role if it doesn't exist
                $userRole = Role::create(['name' => 'user']);
            }
            $user->assignRole($userRole);

            // Fire the registered event
            event(new Registered($user));

            // Create authentication token
            $token = $user->createToken('auth_token', ['*']);

            DB::commit();

            $response = [
                'user' => $user->load(['roles', 'permissions']),
                'expires_at' => null,
            ];

            // For web clients, store token in HTTP-only cookie
            if ($clientType === 'web') {
                // Set secure HTTP-only cookie
                $cookieName = config('sanctum.cookie_name', 'auth_token');
                $domain = config('sanctum.cookie_domain');
                $secure = config('app.env') === 'production';
                $httpOnly = true;
                $sameSite = 'Strict';

                cookie($cookieName, $token->plainTextToken, 1440, '/', $domain, $secure, $httpOnly, false, $sameSite);

                $response['token_type'] = 'Cookie';
                $response['message'] = 'Registration successful. Token stored in secure cookie.';
            } else {
                // For mobile clients, return bearer token
                $response['token'] = $token->plainTextToken;
                $response['token_type'] = 'Bearer';
            }

            return $response;
        } catch (\Exception $e) {
            DB::rollBack();

            throw ValidationException::withMessages([
                'email' => ['Registration failed. Please try again.'],
            ]);
        }
    }

    /**
     * Reset user password using token.
     *
     * @param array $credentials
     * @return array
     * @throws ValidationException
     */
    public function resetPassword(array $credentials): array
    {
        $email = $credentials['email'] ?? null;
        $token = $credentials['token'] ?? null;
        $password = $credentials['password'] ?? null;

        // Find the user
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['We cannot find a user with that email address.'],
            ]);
        }

        // Check if user is active
        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['This account has been deactivated and cannot reset password.'],
            ]);
        }

        // Verify the password reset token
        $tokenRecord = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$tokenRecord) {
            throw ValidationException::withMessages([
                'token' => ['This password reset token is invalid.'],
            ]);
        }

        if (!Hash::check($token, $tokenRecord->token)) {
            throw ValidationException::withMessages([
                'token' => ['This password reset token is invalid.'],
            ]);
        }

        // Check if token has expired (default expiry is 60 minutes)
        $expiry = config('auth.passwords.users.expire', 60);
        $tokenCreatedAt = Carbon::parse($tokenRecord->created_at);

        if ($tokenCreatedAt->addMinutes($expiry)->isPast()) {
            throw ValidationException::withMessages([
                'token' => ['This password reset token has expired.'],
            ]);
        }

        DB::beginTransaction();

        try {
            // Update user password
            $user->update([
                'password' => $password, // Will be hashed automatically due to cast
            ]);

            // Delete the used token
            DB::table('password_reset_tokens')
                ->where('email', $email)
                ->delete();

            // Revoke all existing tokens for security
            $user->tokens()->delete();

            // Create new authentication token
            $token = $user->createToken('auth_token', ['*']);

            DB::commit();

            return [
                'user' => $user->load(['roles', 'permissions']),
                'token' => $token->plainTextToken,
                'token_type' => 'Bearer',
                'expires_at' => null,
                'message' => 'Password reset successfully.',
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            throw ValidationException::withMessages([
                'password' => ['Password reset failed. Please try again.'],
            ]);
        }
    }

    /**
     * Send password reset link to user.
     *
     * @param string $email
     * @return array
     * @throws ValidationException
     */
    public function sendPasswordResetLink(string $email): array
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['We cannot find a user with that email address.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['This account has been deactivated and cannot reset password.'],
            ]);
        }

        $status = Password::sendResetLink(['email' => $email]);

        if ($status === Password::RESET_LINK_SENT) {
            return [
                'message' => 'Password reset link sent to your email address.',
                'status' => 'success',
            ];
        }

        throw ValidationException::withMessages([
            'email' => ['We are unable to send password reset link. Please try again.'],
        ]);
    }

    /**
     * Logout user by revoking current token.
     *
     * @param User $user
     * @return array
     */
    public function logout(User $user): array
    {
        // Revoke the current token
        $user->currentAccessToken()->delete();

        return [
            'message' => 'Successfully logged out.',
            'status' => 'success',
        ];
    }

    /**
     * Logout user from all devices by revoking all tokens.
     *
     * @param User $user
     * @return array
     */
    public function logoutFromAllDevices(User $user): array
    {
        // Revoke all tokens
        $user->tokens()->delete();

        return [
            'message' => 'Successfully logged out from all devices.',
            'status' => 'success',
        ];
    }

    /**
     * Refresh user token.
     *
     * @param User $user
     * @param bool $remember
     * @return array
     */
    public function refreshToken(User $user, bool $remember = false): array
    {
        // Revoke current token
        $user->currentAccessToken()->delete();

        // Create new token
        $tokenName = 'auth_token';
        $abilities = ['*'];

        if ($remember) {
            $token = $user->createToken($tokenName, $abilities, Carbon::now()->addDays(30));
        } else {
            $token = $user->createToken($tokenName, $abilities);
        }

        return [
            'user' => $user->load(['roles', 'permissions']),
            'token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $remember ? Carbon::now()->addDays(30)->toISOString() : null,
        ];
    }

    /**
     * Check if user account is active and handle inactive users.
     *
     * @param User $user
     * @return bool
     * @throws ValidationException
     */
    public function checkUserStatus(User $user): bool
    {
        if (!$user->is_active) {
            // Revoke all tokens for inactive users
            $user->tokens()->delete();

            throw ValidationException::withMessages([
                'account' => ['Your account has been deactivated. Please contact support.'],
            ]);
        }

        return true;
    }

    /**
     * Deactivate user account.
     *
     * @param User $user
     * @return array
     */
    public function deactivateUser(User $user): array
    {
        DB::beginTransaction();

        try {
            // Deactivate user
            $user->update(['is_active' => false]);

            // Revoke all tokens
            $user->tokens()->delete();

            DB::commit();

            return [
                'message' => 'User account has been deactivated.',
                'status' => 'success',
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            throw ValidationException::withMessages([
                'account' => ['Failed to deactivate user account. Please try again.'],
            ]);
        }
    }

    /**
     * Activate user account.
     *
     * @param User $user
     * @return array
     */
    public function activateUser(User $user): array
    {
        $user->update(['is_active' => true]);

        return [
            'message' => 'User account has been activated.',
            'status' => 'success',
        ];
    }

    /**
     * Get user with roles and permissions.
     *
     * @param User $user
     * @return User
     */
    public function getUserWithRoles(User $user): User
    {
        return $user->load(['roles', 'permissions']);
    }

    /**
     * Assign role to user.
     *
     * @param User $user
     * @param string $roleName
     * @return array
     * @throws ValidationException
     */
    public function assignRole(User $user, string $roleName): array
    {
        $role = Role::where('name', $roleName)->first();

        if (!$role) {
            throw ValidationException::withMessages([
                'role' => ['The specified role does not exist.'],
            ]);
        }

        if ($user->hasRole($roleName)) {
            throw ValidationException::withMessages([
                'role' => ['User already has this role.'],
            ]);
        }

        $user->assignRole($role);

        return [
            'message' => "Role '{$roleName}' assigned successfully.",
            'status' => 'success',
            'user' => $user->load(['roles', 'permissions']),
        ];
    }

    /**
     * Remove role from user.
     *
     * @param User $user
     * @param string $roleName
     * @return array
     * @throws ValidationException
     */
    public function removeRole(User $user, string $roleName): array
    {
        if (!$user->hasRole($roleName)) {
            throw ValidationException::withMessages([
                'role' => ['User does not have this role.'],
            ]);
        }

        $user->removeRole($roleName);

        return [
            'message' => "Role '{$roleName}' removed successfully.",
            'status' => 'success',
            'user' => $user->load(['roles', 'permissions']),
        ];
    }

    /**
     * Verify user email using token.
     *
     * @param int $userId
     * @param string $hash
     * @return array
     * @throws ValidationException
     */
    public function verifyEmail(int $userId, string $hash): array
    {
        $user = User::findOrFail($userId);

        if (!hash_equals($hash, sha1($user->email))) {
            throw ValidationException::withMessages([
                'email' => ['Invalid verification link.'],
            ]);
        }

        if ($user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => ['Email is already verified.'],
            ]);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return [
            'message' => 'Email verified successfully.',
            'status' => 'success',
        ];
    }

    /**
     * Resend email verification notification.
     *
     * @param User $user
     * @return array
     * @throws ValidationException
     */
    public function resendEmailVerification(User $user): array
    {
        if ($user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => ['Email is already verified.'],
            ]);
        }

        $user->sendEmailVerificationNotification();

        return [
            'message' => 'Email verification link sent.',
            'status' => 'success',
        ];
    }
}
