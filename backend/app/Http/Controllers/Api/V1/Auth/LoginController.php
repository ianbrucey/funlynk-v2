<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\Auth\UserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * The authentication service instance.
     */
    private AuthService $authService;

    /**
     * Create a new controller instance.
     */
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Handle a login request to the application.
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ]);

        try {
            $credentials = $request->only('email', 'password');
            $remember = $request->boolean('remember', false);

            $result = $this->authService->login($credentials, $remember);

            return $this->successResponse([
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
                'token_type' => $result['token_type'],
                'expires_at' => $result['expires_at'],
            ], 'Login successful');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse(
                'An error occurred during login. Please try again.',
                null,
                500
            );
        }
    }

    /**
     * Handle a logout request to the application.
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return $this->errorResponse('User not authenticated', null, 401);
            }

            $result = $this->authService->logout($user);

            return $this->successResponse(null, $result['message']);
        } catch (\Exception $e) {
            return $this->errorResponse(
                'An error occurred during logout. Please try again.',
                null,
                500
            );
        }
    }

    /**
     * Get the authenticated user information.
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return $this->errorResponse('User not authenticated', null, 401);
            }

            // Check user status
            $this->authService->checkUserStatus($user);

            // Get user with roles and permissions
            $userWithRoles = $this->authService->getUserWithRoles($user);

            return $this->successResponse(
                new UserResource($userWithRoles),
                'User information retrieved successfully'
            );
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse(
                'An error occurred while retrieving user information.',
                null,
                500
            );
        }
    }
}
