import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'teacher' | 'school_admin' | 'district_admin' | 'parent';
  profileImage?: string;
  isEmailVerified: boolean;
  phone?: string;
  dateOfBirth?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'friends' | 'private';
      showEmail: boolean;
      showPhone: boolean;
    };
    language: string;
    timezone: string;
  };
  stats: {
    eventsAttended: number;
    eventsCreated: number;
    connections: number;
    joinedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  error: string | null;
  lastLoginAt: string | null;
  loginAttempts: number;
  isLocked: boolean;
  lockoutUntil: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  hasCompletedOnboarding: false,
  user: null,
  token: null,
  refreshToken: null,
  error: null,
  lastLoginAt: null,
  loginAttempts: 0,
  isLocked: false,
  lockoutUntil: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
      state.lastLoginAt = new Date().toISOString();
      state.loginAttempts = 0;
      state.isLocked = false;
      state.lockoutUntil = null;
    },
    
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = action.payload;
      state.loginAttempts += 1;
      
      // Lock account after max attempts
      if (state.loginAttempts >= 5) {
        state.isLocked = true;
        state.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
      }
    },
    
    logout: (state) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      state.lastLoginAt = null;
      state.loginAttempts = 0;
      state.isLocked = false;
      state.lockoutUntil = null;
    },
    
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    setTokens: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    
    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    clearLockout: (state) => {
      state.isLocked = false;
      state.lockoutUntil = null;
      state.loginAttempts = 0;
    },
    
    updateUserPreferences: (state, action: PayloadAction<Partial<User['preferences']>>) => {
      if (state.user) {
        state.user.preferences = { ...state.user.preferences, ...action.payload };
      }
    },
    
    incrementEventStats: (state, action: PayloadAction<'attended' | 'created'>) => {
      if (state.user) {
        if (action.payload === 'attended') {
          state.user.stats.eventsAttended += 1;
        } else if (action.payload === 'created') {
          state.user.stats.eventsCreated += 1;
        }
      }
    },
  },
});

export const {
  setLoading,
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  setTokens,
  completeOnboarding,
  clearError,
  clearLockout,
  updateUserPreferences,
  incrementEventStats,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsLocked = (state: { auth: AuthState }) => state.auth.isLocked;
export const selectHasCompletedOnboarding = (state: { auth: AuthState }) => state.auth.hasCompletedOnboarding;
