import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { Config } from '@/constants/config';
import { setTokens, logout } from '../slices/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: Config.API_BASE_URL,
  timeout: Config.API_TIMEOUT,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('content-type', 'application/json');
    headers.set('accept', 'application/json');
    headers.set('x-app-version', Config.APP_VERSION);
    headers.set('x-platform', Config.PLATFORM.IS_IOS ? 'ios' : 'android');
    
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Try to refresh token
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refresh_token: refreshToken },
        },
        api,
        extraOptions
      );
      
      if (refreshResult.data) {
        // Store new tokens
        const { token, refreshToken: newRefreshToken } = refreshResult.data as any;
        api.dispatch(setTokens({ token, refreshToken: newRefreshToken }));
        
        // Retry original request with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, logout user
        api.dispatch(logout());
      }
    } else {
      // No refresh token, logout user
      api.dispatch(logout());
    }
  }
  
  return result;
};

// Error handling utility
export const handleApiError = (error: any) => {
  if (error.status === 'FETCH_ERROR') {
    return 'Network error. Please check your connection.';
  }
  
  if (error.status === 'TIMEOUT_ERROR') {
    return 'Request timed out. Please try again.';
  }
  
  if (error.data?.message) {
    return error.data.message;
  }
  
  if (error.data?.error) {
    return error.data.error;
  }
  
  switch (error.status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please log in.';
    case 403:
      return 'Access denied. You don\'t have permission.';
    case 404:
      return 'Resource not found.';
    case 409:
      return 'Conflict. Resource already exists.';
    case 422:
      return 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

export { baseQueryWithReauth };
