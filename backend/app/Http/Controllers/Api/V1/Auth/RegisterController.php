<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\Auth\UserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
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
     * Handle a registration request for the application.
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:20'],
            'country_code' => ['nullable', 'string', 'max:5'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'string', Rule::in(['male', 'female', 'other'])],
            'timezone' => ['nullable', 'string', 'max:50'],
            'language' => ['nullable', 'string', 'max:10'],
        ]);

        try {
            $userData = $request->only([
                'first_name',
                'last_name',
                'email',
                'password',
                'phone',
                'country_code',
                'date_of_birth',
                'gender',
                'timezone',
                'language',
            ]);

            $result = $this->authService->register($userData);

            return $this->successResponse([
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
                'token_type' => $result['token_type'],
                'expires_at' => $result['expires_at'],
            ], 'Registration successful', 201);
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse(
                'An error occurred during registration. Please try again.',
                null,
                500
            );
        }
    }
}
