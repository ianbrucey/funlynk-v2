<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\SignPermissionSlipRequest;
use App\Http\Resources\Spark\PermissionSlipResource;
use App\Services\Spark\PermissionSlipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public Permission Slip Controller.
 *
 * Handles public permission slip endpoints for parent access (no authentication required)
 */
class PublicPermissionSlipController extends BaseApiController
{
    public function __construct(
        private PermissionSlipService $permissionSlipService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get permission slip by token (public access).
     */
    public function showByToken(string $token): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($token) {
            $permissionSlip = $this->permissionSlipService->getPermissionSlipByToken($token);

            if (!$permissionSlip) {
                return $this->notFoundResponse('Permission slip not found or invalid token');
            }

            // Check if token is still valid (not expired)
            if ($this->permissionSlipService->isTokenExpired($permissionSlip)) {
                return $this->errorResponse('Permission slip token has expired', 410);
            }

            return $this->successResponse(
                new PermissionSlipResource($permissionSlip),
                'Permission slip retrieved successfully'
            );
        });
    }

    /**
     * Sign permission slip (public access).
     */
    public function sign(string $token, SignPermissionSlipRequest $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $token) {
            $permissionSlip = $this->permissionSlipService->getPermissionSlipByToken($token);

            if (!$permissionSlip) {
                return $this->notFoundResponse('Permission slip not found or invalid token');
            }

            // Check if already signed
            if ($permissionSlip->is_signed) {
                return $this->errorResponse('Permission slip has already been signed', 409);
            }

            // Check if token is still valid (not expired)
            if ($this->permissionSlipService->isTokenExpired($permissionSlip)) {
                return $this->errorResponse('Permission slip token has expired', 410);
            }

            $signedSlip = $this->permissionSlipService->signPermissionSlip(
                $permissionSlip,
                $request->validated(),
                $request->ip()
            );

            return $this->successResponse(
                new PermissionSlipResource($signedSlip),
                'Permission slip signed successfully'
            );
        });
    }

    /**
     * Validate permission slip token (public access).
     */
    public function validateToken(string $token): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($token) {
            $permissionSlip = $this->permissionSlipService->getPermissionSlipByToken($token);

            if (!$permissionSlip) {
                return $this->errorResponse('Invalid token', 404);
            }

            $isExpired = $this->permissionSlipService->isTokenExpired($permissionSlip);
            $isAlreadySigned = $permissionSlip->is_signed;

            $status = 'valid';
            if ($isExpired) {
                $status = 'expired';
            } elseif ($isAlreadySigned) {
                $status = 'already_signed';
            }

            return $this->successResponse([
                'token' => $token,
                'status' => $status,
                'is_valid' => $status === 'valid',
                'is_expired' => $isExpired,
                'is_signed' => $isAlreadySigned,
                'booking_reference' => $permissionSlip->booking->booking_reference ?? null,
                'student_name' => $permissionSlip->student->full_name ?? null,
            ], 'Token validation completed');
        });
    }

    /**
     * Get permission slip template content for public display.
     */
    public function getTemplate(string $token): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($token) {
            $permissionSlip = $this->permissionSlipService->getPermissionSlipByToken($token);

            if (!$permissionSlip) {
                return $this->notFoundResponse('Permission slip not found or invalid token');
            }

            $templateContent = $this->permissionSlipService->getTemplateContent($permissionSlip);

            return $this->successResponse([
                'content' => $templateContent,
                'required_fields' => $permissionSlip->template->required_fields_list ?? [],
                'emergency_contact_fields' => $permissionSlip->template->emergency_contact_fields_list ?? [],
                'medical_fields' => $permissionSlip->template->medical_fields_list ?? [],
                'photo_permission_text' => $permissionSlip->template->photo_permission_text ?? null,
                'signature_text' => $permissionSlip->template->signature_text ?? 'I hereby give permission for my child to participate in this program.',
            ], 'Template content retrieved successfully');
        });
    }
}
