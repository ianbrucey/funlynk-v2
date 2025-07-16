import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseApi';
import { User } from '../slices/authSlice';

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'teacher' | 'school_admin' | 'district_admin' | 'parent';
  phone?: string;
  dateOfBirth?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface VerifyEmailRequest {
  token: string;
}

interface ResendVerificationRequest {
  email: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'User'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
    
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
    
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
    
    refreshToken: builder.mutation<{ token: string; refreshToken: string; expiresIn: number }, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),
    
    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    
    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),
    
    verifyEmail: builder.mutation<{ message: string }, VerifyEmailRequest>({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    
    resendVerification: builder.mutation<{ message: string }, ResendVerificationRequest>({
      query: (body) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body,
      }),
    }),
    
    checkAuthStatus: builder.query<{ isValid: boolean; user?: User }, void>({
      query: () => '/auth/status',
      providesTags: ['Auth'],
    }),
    
    getProfile: builder.query<User, void>({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),
    
    updateProfile: builder.mutation<User, Partial<User>>({
      query: (profile) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: profile,
      }),
      invalidatesTags: ['User'],
    }),
    
    deleteAccount: builder.mutation<{ message: string }, { password: string; reason?: string }>({
      query: (body) => ({
        url: '/auth/delete-account',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
    
    // Social auth endpoints
    googleAuth: builder.mutation<AuthResponse, { idToken: string }>({
      query: (body) => ({
        url: '/auth/google',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
    
    appleAuth: builder.mutation<AuthResponse, { identityToken: string; authorizationCode: string }>({
      query: (body) => ({
        url: '/auth/apple',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useCheckAuthStatusQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
  useGoogleAuthMutation,
  useAppleAuthMutation,
} = authApi;
