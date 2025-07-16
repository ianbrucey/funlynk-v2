<?php

namespace App\Http\Controllers\Api\V1\Spark;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Spark\CreatePermissionSlipRequest;
use App\Http\Resources\Spark\PermissionSlipResource;
use App\Services\Spark\PermissionSlipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Permission Slip Controller.
 *
 * Handles permission slip API endpoints for Spark programs
 */
class PermissionSlipController extends BaseApiController
{
    public function __construct(
        private PermissionSlipService $permissionSlipService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get permission slips list.
     */
    public function index(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'booking_id' => 'sometimes|exists:bookings,id',
                'is_signed' => 'sometimes|boolean',
                'is_overdue' => 'sometimes|boolean',
                'search' => 'sometimes|string|max:255',
                'per_page' => 'sometimes|integer|min:1|max:100',
            ]);

            $permissionSlips = $this->permissionSlipService->getPermissionSlips($request->validated());
            
            return $this->paginatedResponse($permissionSlips, 'Permission slips retrieved successfully');
        });
    }

    /**
     * Create new permission slip.
     */
    public function store(CreatePermissionSlipRequest $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $permissionSlip = $this->permissionSlipService->createPermissionSlipFromRequest($request->validated());

            return $this->createdResponse(
                new PermissionSlipResource($permissionSlip),
                'Permission slip created successfully'
            );
        });
    }

    /**
     * Get permission slip by ID.
     */
    public function show(int $id): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($id) {
            $permissionSlip = $this->permissionSlipService->getPermissionSlipById($id);

            if (!$permissionSlip) {
                return $this->notFoundResponse('Permission slip not found');
            }

            $this->authorize('view', $permissionSlip);

            return $this->successResponse(
                new PermissionSlipResource($permissionSlip),
                'Permission slip retrieved successfully'
            );
        });
    }

    /**
     * Update permission slip.
     */
    public function update(int $id, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $id) {
            $request->validate([
                'parent_name' => 'sometimes|string|max:255',
                'parent_email' => 'sometimes|email|max:255',
                'parent_phone' => 'sometimes|string|max:20',
                'emergency_contacts' => 'sometimes|array',
                'medical_info' => 'sometimes|array',
                'special_instructions' => 'sometimes|string|max:1000',
                'photo_permission' => 'sometimes|boolean',
            ]);

            $permissionSlip = $this->permissionSlipService->getPermissionSlipById($id);

            if (!$permissionSlip) {
                return $this->notFoundResponse('Permission slip not found');
            }

            $this->authorize('update', $permissionSlip);

            $updatedSlip = $this->permissionSlipService->updatePermissionSlip($permissionSlip, $request->validated());

            return $this->successResponse(
                new PermissionSlipResource($updatedSlip),
                'Permission slip updated successfully'
            );
        });
    }

    /**
     * Delete permission slip.
     */
    public function destroy(int $id): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($id) {
            $permissionSlip = $this->permissionSlipService->getPermissionSlipById($id);

            if (!$permissionSlip) {
                return $this->notFoundResponse('Permission slip not found');
            }

            $this->authorize('delete', $permissionSlip);

            $this->permissionSlipService->deletePermissionSlip($permissionSlip);

            return $this->deletedResponse('Permission slip deleted successfully');
        });
    }

    /**
     * Send reminder for permission slip.
     */
    public function sendReminder(int $id): JsonResponse
    {
        return $this->handleApiOperation(request(), function () use ($id) {
            $permissionSlip = $this->permissionSlipService->getPermissionSlipById($id);

            if (!$permissionSlip) {
                return $this->notFoundResponse('Permission slip not found');
            }

            $this->authorize('sendReminder', $permissionSlip);

            $result = $this->permissionSlipService->sendReminder($permissionSlip);

            if (!$result) {
                return $this->errorResponse('Unable to send reminder', 400);
            }

            return $this->successResponse(null, 'Reminder sent successfully');
        });
    }

    /**
     * Send bulk reminders.
     */
    public function sendBulkReminders(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'booking_id' => 'sometimes|exists:bookings,id',
                'permission_slip_ids' => 'sometimes|array',
                'permission_slip_ids.*' => 'exists:permission_slips,id',
                'filter' => 'sometimes|string|in:unsigned,overdue',
            ]);

            $result = $this->permissionSlipService->sendBulkReminders($request->validated());

            return $this->successResponse($result, 'Bulk reminders sent successfully');
        });
    }

    /**
     * Get permission slip statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'booking_id' => 'sometimes|exists:bookings,id',
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
            ]);

            $statistics = $this->permissionSlipService->getStatistics($request->validated());

            return $this->successResponse($statistics, 'Statistics retrieved successfully');
        });
    }

    /**
     * Export permission slips.
     */
    public function export(int $bookingId, Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request, $bookingId) {
            $request->validate([
                'format' => 'required|string|in:pdf,csv',
                'include_signatures' => 'sometimes|boolean',
            ]);

            $exportData = $this->permissionSlipService->exportPermissionSlips($bookingId, $request->validated());

            return $this->successResponse($exportData, 'Export generated successfully');
        });
    }

    /**
     * Create bulk permission slips for booking.
     */
    public function createBulk(Request $request): JsonResponse
    {
        return $this->handleApiOperation($request, function () use ($request) {
            $request->validate([
                'booking_id' => 'required|exists:bookings,id',
                'template_id' => 'sometimes|exists:permission_slip_templates,id',
            ]);

            $result = $this->permissionSlipService->createBulkPermissionSlips($request->validated());

            return $this->successResponse($result, 'Bulk permission slips created successfully');
        });
    }

    /**
     * Get permission slip templates.
     */
    public function templates(): JsonResponse
    {
        return $this->handleApiOperation(request(), function () {
            $templates = $this->permissionSlipService->getTemplates();

            return $this->collectionResponse($templates, 'Templates retrieved successfully');
        });
    }
}
