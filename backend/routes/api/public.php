<?php

use App\Http\Controllers\Api\V1\Spark\PublicPermissionSlipController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
|
| Here are the public API routes that don't require authentication.
| These are primarily for parent access to permission slips and other
| public-facing functionality.
|
*/

// Public Permission Slip Routes (no authentication required)
Route::prefix('permission-slips')->group(function () {
    Route::get('/{token}', [PublicPermissionSlipController::class, 'showByToken']);
    Route::post('/{token}/sign', [PublicPermissionSlipController::class, 'sign']);
    Route::get('/{token}/validate', [PublicPermissionSlipController::class, 'validateToken']);
    Route::get('/{token}/template', [PublicPermissionSlipController::class, 'getTemplate']);
});
