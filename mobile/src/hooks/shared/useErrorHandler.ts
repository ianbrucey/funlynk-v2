import { useCallback } from 'react';
import { useToast } from '@/store/hooks';

/**
 * useErrorHandler Hook
 * 
 * Provides centralized error handling functionality across the app.
 * Handles different types of errors and provides user-friendly messages.
 * 
 * Features:
 * - API error handling
 * - Network error handling
 * - Validation error handling
 * - User-friendly error messages
 * - Toast notifications for errors
 */
export const useErrorHandler = () => {
  const { showErrorToast } = useToast();

  const handleError = useCallback((error: any): string => {
    let errorMessage = 'An unexpected error occurred';

    if (error?.response) {
      // API error response
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = data?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Authentication failed. Please sign in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 422:
          // Validation errors
          if (data?.errors) {
            const validationErrors = Object.values(data.errors).flat();
            errorMessage = validationErrors[0] as string || 'Validation failed.';
          } else {
            errorMessage = data?.message || 'Validation failed.';
          }
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          errorMessage = data?.message || `Request failed with status ${status}`;
      }
    } else if (error?.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error?.message) {
      // JavaScript error
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      // String error
      errorMessage = error;
    }

    return errorMessage;
  }, []);

  const handleErrorWithToast = useCallback((error: any, customMessage?: string) => {
    const errorMessage = customMessage || handleError(error);
    showErrorToast(errorMessage);
    return errorMessage;
  }, [handleError, showErrorToast]);

  const clearError = useCallback(() => {
    // This can be used to clear error states if needed
  }, []);

  return {
    handleError,
    handleErrorWithToast,
    clearError,
  };
};
