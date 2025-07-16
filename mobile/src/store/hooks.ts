import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from './index';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout as logoutAction,
  clearError,
  updateUser,
  completeOnboarding,
} from './slices/authSlice';
import { 
  showToast, 
  hideToast,
  showModal,
  hideModal,
  setTheme,
  updateNotificationSettings,
} from './slices/uiSlice';
import { 
  useLoginMutation, 
  useLogoutMutation, 
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from './api/authApi';
import { handleApiError } from './api/baseApi';

// Authentication hook
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    try {
      dispatch(loginStart());
      const result = await loginMutation({ email, password, rememberMe }).unwrap();
      dispatch(loginSuccess(result));
      dispatch(showToast({ message: 'Welcome back!', type: 'success' }));
      return result;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      dispatch(loginFailure(errorMessage));
      dispatch(showToast({ message: errorMessage, type: 'error' }));
      throw error;
    }
  }, [dispatch, loginMutation]);

  const register = useCallback(async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    dateOfBirth?: string;
  }) => {
    try {
      dispatch(loginStart());
      const result = await registerMutation(userData).unwrap();
      dispatch(loginSuccess(result));
      dispatch(showToast({ message: 'Account created successfully!', type: 'success' }));
      return result;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      dispatch(loginFailure(errorMessage));
      dispatch(showToast({ message: errorMessage, type: 'error' }));
      throw error;
    }
  }, [dispatch, registerMutation]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      dispatch(logoutAction());
      dispatch(showToast({ message: 'Logged out successfully', type: 'success' }));
    }
  }, [dispatch, logoutMutation]);

  const updateProfile = useCallback((updates: any) => {
    dispatch(updateUser(updates));
  }, [dispatch]);

  const finishOnboarding = useCallback(() => {
    dispatch(completeOnboarding());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    ...auth,
    login,
    register,
    logout,
    updateProfile,
    finishOnboarding,
    clearAuthError,
    isLoginLoading,
    isLogoutLoading,
    isRegisterLoading,
  };
};

// Toast notifications hook
export const useToast = () => {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.ui.toast);

  const showSuccessToast = useCallback((message: string, duration?: number) => {
    dispatch(showToast({ message, type: 'success', duration }));
  }, [dispatch]);

  const showErrorToast = useCallback((message: string, duration?: number) => {
    dispatch(showToast({ message, type: 'error', duration }));
  }, [dispatch]);

  const showWarningToast = useCallback((message: string, duration?: number) => {
    dispatch(showToast({ message, type: 'warning', duration }));
  }, [dispatch]);

  const showInfoToast = useCallback((message: string, duration?: number) => {
    dispatch(showToast({ message, type: 'info', duration }));
  }, [dispatch]);

  const hideToastMessage = useCallback(() => {
    dispatch(hideToast());
  }, [dispatch]);

  return {
    toast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    hideToast: hideToastMessage,
  };
};

// Modal management hook
export const useModal = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((state) => state.ui.modal);

  const openModal = useCallback((type: string, data?: any) => {
    dispatch(showModal({ type, data }));
  }, [dispatch]);

  const closeModal = useCallback(() => {
    dispatch(hideModal());
  }, [dispatch]);

  return {
    modal,
    openModal,
    closeModal,
  };
};

// Theme management hook
export const useTheme = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const isOnline = useAppSelector((state) => state.ui.isOnline);

  const changeTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    dispatch(setTheme(newTheme));
  }, [dispatch]);

  return {
    theme,
    isOnline,
    changeTheme,
  };
};

// Password reset hook
export const usePasswordReset = () => {
  const dispatch = useAppDispatch();
  const [forgotPasswordMutation, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
  const [resetPasswordMutation, { isLoading: isResetLoading }] = useResetPasswordMutation();

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const result = await forgotPasswordMutation({ email }).unwrap();
      dispatch(showToast({ 
        message: 'Password reset instructions sent to your email', 
        type: 'success' 
      }));
      return result;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      dispatch(showToast({ message: errorMessage, type: 'error' }));
      throw error;
    }
  }, [dispatch, forgotPasswordMutation]);

  const resetPassword = useCallback(async (token: string, password: string, confirmPassword: string) => {
    try {
      const result = await resetPasswordMutation({ token, password, confirmPassword }).unwrap();
      dispatch(showToast({ 
        message: 'Password reset successfully', 
        type: 'success' 
      }));
      return result;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      dispatch(showToast({ message: errorMessage, type: 'error' }));
      throw error;
    }
  }, [dispatch, resetPasswordMutation]);

  return {
    forgotPassword,
    resetPassword,
    isForgotLoading,
    isResetLoading,
  };
};

// Notification settings hook
export const useNotificationSettings = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.ui.notifications);

  const updateSettings = useCallback((updates: Partial<typeof settings>) => {
    dispatch(updateNotificationSettings(updates));
  }, [dispatch]);

  return {
    settings,
    updateSettings,
  };
};

// Network status hook
export const useNetworkStatus = () => {
  const isOnline = useAppSelector((state) => state.ui.isOnline);
  
  return {
    isOnline,
    isOffline: !isOnline,
  };
};

// User role hook
export const useUserRole = () => {
  const user = useAppSelector((state) => state.auth.user);
  
  const isUser = user?.role === 'user';
  const isParent = user?.role === 'parent';
  const isTeacher = user?.role === 'teacher';
  const isSchoolAdmin = user?.role === 'school_admin';
  const isDistrictAdmin = user?.role === 'district_admin';
  
  const isCoreUser = isUser || isParent;
  const isSparkUser = isTeacher || isSchoolAdmin || isDistrictAdmin;
  
  return {
    user,
    role: user?.role,
    isUser,
    isParent,
    isTeacher,
    isSchoolAdmin,
    isDistrictAdmin,
    isCoreUser,
    isSparkUser,
  };
};
