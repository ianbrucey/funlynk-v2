import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout as logoutAction,
  clearError,
  updateUser,
  completeOnboarding,
} from '@/store/slices/authSlice';
import { 
  useLoginMutation, 
  useLogoutMutation, 
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGoogleAuthMutation,
  useAppleAuthMutation,
} from '@/store/api/authApi';
import { useErrorHandler } from '@/hooks/shared/useErrorHandler';
import { useToast } from '@/store/hooks';

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  dateOfBirth?: string;
}

interface SocialAuthData {
  idToken?: string;
  identityToken?: string;
  authorizationCode?: string;
}

/**
 * Enhanced Authentication Hook
 * 
 * Provides comprehensive authentication functionality with improved error handling,
 * social login support, and better user experience.
 * 
 * Features:
 * - Email/password authentication
 * - Social login (Google, Apple)
 * - Registration with validation
 * - Password reset functionality
 * - Enhanced error handling
 * - Loading states management
 * - User session management
 */
export const useAuthEnhanced = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const { handleErrorWithToast } = useErrorHandler();
  const { showSuccessToast } = useToast();

  // API mutations
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [forgotPasswordMutation, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
  const [resetPasswordMutation, { isLoading: isResetLoading }] = useResetPasswordMutation();
  const [googleAuthMutation, { isLoading: isGoogleLoading }] = useGoogleAuthMutation();
  const [appleAuthMutation, { isLoading: isAppleLoading }] = useAppleAuthMutation();

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch(loginStart());
      const result = await loginMutation(credentials).unwrap();
      dispatch(loginSuccess(result));
      showSuccessToast('Welcome back!');
      return { success: true, data: result };
    } catch (error: any) {
      const errorMessage = handleErrorWithToast(error);
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  }, [dispatch, loginMutation, handleErrorWithToast, showSuccessToast]);

  const register = useCallback(async (userData: RegisterData) => {
    try {
      dispatch(loginStart());
      const result = await registerMutation(userData).unwrap();
      dispatch(loginSuccess(result));
      showSuccessToast('Account created successfully!');
      return { success: true, data: result };
    } catch (error: any) {
      const errorMessage = handleErrorWithToast(error);
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  }, [dispatch, registerMutation, handleErrorWithToast, showSuccessToast]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      dispatch(logoutAction());
      showSuccessToast('Logged out successfully');
    }
  }, [dispatch, logoutMutation, showSuccessToast]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const result = await forgotPasswordMutation({ email }).unwrap();
      showSuccessToast('Password reset instructions sent to your email');
      return { success: true, data: result };
    } catch (error: any) {
      const errorMessage = handleErrorWithToast(error);
      return { success: false, error: errorMessage };
    }
  }, [forgotPasswordMutation, handleErrorWithToast, showSuccessToast]);

  const resetPassword = useCallback(async (token: string, password: string, confirmPassword: string) => {
    try {
      const result = await resetPasswordMutation({ token, password, confirmPassword }).unwrap();
      showSuccessToast('Password reset successfully');
      return { success: true, data: result };
    } catch (error: any) {
      const errorMessage = handleErrorWithToast(error);
      return { success: false, error: errorMessage };
    }
  }, [resetPasswordMutation, handleErrorWithToast, showSuccessToast]);

  const googleLogin = useCallback(async (authData: SocialAuthData) => {
    try {
      dispatch(loginStart());
      const result = await googleAuthMutation(authData).unwrap();
      dispatch(loginSuccess(result));
      showSuccessToast('Welcome to Funlynk!');
      return { success: true, data: result };
    } catch (error: any) {
      const errorMessage = handleErrorWithToast(error);
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  }, [dispatch, googleAuthMutation, handleErrorWithToast, showSuccessToast]);

  const appleLogin = useCallback(async (authData: SocialAuthData) => {
    try {
      dispatch(loginStart());
      const result = await appleAuthMutation(authData).unwrap();
      dispatch(loginSuccess(result));
      showSuccessToast('Welcome to Funlynk!');
      return { success: true, data: result };
    } catch (error: any) {
      const errorMessage = handleErrorWithToast(error);
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  }, [dispatch, appleAuthMutation, handleErrorWithToast, showSuccessToast]);

  const updateProfile = useCallback((updates: any) => {
    dispatch(updateUser(updates));
  }, [dispatch]);

  const finishOnboarding = useCallback(() => {
    dispatch(completeOnboarding());
    showSuccessToast('Welcome to Funlynk! Let\'s get started.');
  }, [dispatch, showSuccessToast]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    ...auth,
    
    // Actions
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    googleLogin,
    appleLogin,
    updateProfile,
    finishOnboarding,
    clearAuthError,
    
    // Loading states
    isLoginLoading,
    isLogoutLoading,
    isRegisterLoading,
    isForgotLoading,
    isResetLoading,
    isGoogleLoading,
    isAppleLoading,
    
    // Computed states
    isLoading: isLoginLoading || isLogoutLoading || isRegisterLoading || 
               isForgotLoading || isResetLoading || isGoogleLoading || isAppleLoading,
  };
};
