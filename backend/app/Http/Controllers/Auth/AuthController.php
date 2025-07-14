<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\PasswordResetRequest;
use App\Http\Resources\Auth\UserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends BaseApiController
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Handle user login.
     *
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $credentials = $request->validated();
            $clientType = $request->attributes->get('client_type', 'mobile');
            $result = $this->authService->login($credentials, $request->boolean('remember'), $clientType);

            $response = [
                'user' => new UserResource($result['user']),
                'token_type' => $result['token_type'],
                'expires_at' => $result['expires_at'],
            ];

            // Only include token for mobile clients
            if ($clientType === 'mobile') {
                $response['token'] = $result['token'];
            }

            $message = $result['message'] ?? 'Login successful';
            return $this->successResponse($response, $message);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors(), 'Login failed');
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Login failed. Please try again.');
        }
    }

    /**
     * Handle user registration.
     *
     * @param RegisterRequest $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $userData = $request->validated();
            $clientType = $request->attributes->get('client_type', 'mobile');
            $result = $this->authService->register($userData, $clientType);

            $response = [
                'user' => new UserResource($result['user']),
                'token_type' => $result['token_type'],
                'expires_at' => $result['expires_at'],
            ];

            // Only include token for mobile clients
            if ($clientType === 'mobile') {
                $response['token'] = $result['token'];
            }

            $message = $result['message'] ?? 'Registration successful';
            return $this->successResponse($response, $message, 201);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors(), 'Registration failed');
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Registration failed. Please try again.');
        }
    }

    /**
     * Handle password reset.
     *
     * @param PasswordResetRequest $request
     * @return JsonResponse
     */
    public function resetPassword(PasswordResetRequest $request): JsonResponse
    {
        try {
            $credentials = $request->validated();
            $result = $this->authService->resetPassword($credentials);

            return $this->successResponse([
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
                'token_type' => $result['token_type'],
                'expires_at' => $result['expires_at'],
            ], $result['message']);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors(), 'Password reset failed');
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Password reset failed. Please try again.');
        }
    }

    /**
     * Send password reset link.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        try {
            $result = $this->authService->sendPasswordResetLink($request->email);
            return $this->successResponse(null, $result['message']);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors(), 'Failed to send reset link');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to send reset link. Please try again.', null, 500);
        }
    }

    /**
     * Handle user logout.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $result = $this->authService->logout($user);

            return $this->successResponse(null, $result['message']);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Logout failed. Please try again.');
        }
    }

    /**
     * Logout from all devices.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logoutAll(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $result = $this->authService->logoutFromAllDevices($user);

            return $this->successResponse(null, $result['message']);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Logout failed. Please try again.');
        }
    }

    /**
     * Get current authenticated user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $userWithRoles = $this->authService->getUserWithRoles($user);

            return $this->successResponse(
                new UserResource($userWithRoles),
                'User retrieved successfully'
            );

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve user information.', null, 500);
        }
    }

    /**
     * Refresh user token.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function refresh(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $remember = $request->boolean('remember');
            $result = $this->authService->refreshToken($user, $remember);

            return $this->successResponse([
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
                'token_type' => $result['token_type'],
                'expires_at' => $result['expires_at'],
            ], 'Token refreshed successfully');

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Token refresh failed. Please try again.');
        }
    }
}
