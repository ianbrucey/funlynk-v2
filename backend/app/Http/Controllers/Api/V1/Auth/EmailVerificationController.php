<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class EmailVerificationController extends Controller
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
     * Handle email verification.
     *
     * @param Request $request
     * @param int     $id
     * @param string  $hash
     *
     * @return JsonResponse
     */
    public function verify(Request $request, int $id, string $hash): JsonResponse
    {
        try {
            $result = $this->authService->verifyEmail($id, $hash);

            return $this->successResponse(null, $result['message']);
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse(
                'An error occurred while verifying the email.',
                null,
                500
            );
        }
    }

    /**
     * Handle email verification resend.
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function resend(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return $this->errorResponse('User not authenticated', null, 401);
            }

            $result = $this->authService->resendEmailVerification($user);

            return $this->successResponse(null, $result['message']);
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse(
                'An error occurred while resending the email verification.',
                null,
                500
            );
        }
    }
}
