# Task 003: State Management Setup
**Agent**: Mobile Foundation Developer  
**Estimated Time**: 6-7 hours  
**Priority**: High  
**Dependencies**: Task 002 (Navigation System Implementation)  

## Overview
Implement comprehensive state management using Redux Toolkit with RTK Query for API calls, Redux Persist for data persistence, and proper TypeScript integration for both Core and Spark applications.

## Prerequisites
- Task 002 completed successfully
- Redux Toolkit and related dependencies installed
- Navigation system implemented

## Step-by-Step Implementation

### Step 1: Configure Redux Store (60 minutes)

**Create store configuration (src/store/index.ts):**
```typescript
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { MMKV } from 'react-native-mmkv';

// Import slice reducers
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import eventsSlice from './slices/eventsSlice';
import socialSlice from './slices/socialSlice';
import sparkSlice from './slices/sparkSlice';
import uiSlice from './slices/uiSlice';

// Import API slices
import { coreApi } from './api/coreApi';
import { sparkApi } from './api/sparkApi';
import { authApi } from './api/authApi';

// Configure MMKV storage
const storage = new MMKV();

const reduxStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return Promise.resolve(value);
  },
  removeItem: (key: string) => {
    storage.delete(key);
    return Promise.resolve();
  },
};

// Configure persist
const persistConfig = {
  key: 'root',
  storage: reduxStorage,
  whitelist: ['auth', 'user', 'ui'], // Only persist these reducers
  blacklist: ['events', 'social', 'spark'], // Don't persist these (they'll be refetched)
};

const rootReducer = combineReducers({
  auth: authSlice,
  user: userSlice,
  events: eventsSlice,
  social: socialSlice,
  spark: sparkSlice,
  ui: uiSlice,
  [coreApi.reducerPath]: coreApi.reducer,
  [sparkApi.reducerPath]: sparkApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(coreApi.middleware)
      .concat(sparkApi.middleware)
      .concat(authApi.middleware),
  devTools: __DEV__,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**Create store provider (src/store/StoreProvider.tsx):**
```typescript
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './index';
import LoadingScreen from '@/components/common/LoadingScreen';

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};
```

### Step 2: Create Authentication Slice (75 minutes)

**Create auth slice (src/store/slices/authSlice.ts):**
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'teacher' | 'school_admin' | 'district_admin' | 'parent';
  profileImage?: string;
  isEmailVerified: boolean;
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
    },
    
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = action.payload;
    },
    
    logout: (state) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      state.lastLoginAt = null;
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
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
```

### Step 3: Create API Slices with RTK Query (90 minutes)

**Create base API configuration (src/store/api/baseApi.ts):**
```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { Config } from '@/constants/config';

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
        api.dispatch(setTokens(refreshResult.data));
        
        // Retry original request
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

export { baseQueryWithReauth };
```

**Create Auth API (src/store/api/authApi.ts):**
```typescript
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseApi';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    
    refreshToken: builder.mutation<{ token: string; refreshToken: string }, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),
    
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    
    resetPassword: builder.mutation<{ message: string }, { token: string; password: string }>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    
    verifyEmail: builder.mutation<{ message: string }, { token: string }>({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body,
      }),
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
  useVerifyEmailMutation,
} = authApi;
```

**Create Core API (src/store/api/coreApi.ts):**
```typescript
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseApi';

export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  price: number;
  maxAttendees: number;
  currentAttendees: number;
  hostId: string;
  host: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  images: string[];
  tags: string[];
  isPublic: boolean;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export const coreApi = createApi({
  reducerPath: 'coreApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Event', 'User', 'Social'],
  endpoints: (builder) => ({
    // Events
    getEvents: builder.query<{ data: Event[]; pagination: any }, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: '/core/events',
        params,
      }),
      providesTags: ['Event'],
    }),
    
    getEvent: builder.query<Event, string>({
      query: (id) => `/core/events/${id}`,
      providesTags: (result, error, id) => [{ type: 'Event', id }],
    }),
    
    createEvent: builder.mutation<Event, Partial<Event>>({
      query: (event) => ({
        url: '/core/events',
        method: 'POST',
        body: event,
      }),
      invalidatesTags: ['Event'],
    }),
    
    updateEvent: builder.mutation<Event, { id: string; event: Partial<Event> }>({
      query: ({ id, event }) => ({
        url: `/core/events/${id}`,
        method: 'PUT',
        body: event,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Event', id }],
    }),
    
    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/core/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Event'],
    }),
    
    // RSVP
    rsvpToEvent: builder.mutation<void, { eventId: string; status: string }>({
      query: ({ eventId, status }) => ({
        url: `/core/events/${eventId}/rsvp`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Event', id: eventId }],
    }),
    
    // Users
    getProfile: builder.query<User, void>({
      query: () => '/core/users/profile',
      providesTags: ['User'],
    }),
    
    updateProfile: builder.mutation<User, Partial<User>>({
      query: (profile) => ({
        url: '/core/users/profile',
        method: 'PUT',
        body: profile,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Social
    getFeed: builder.query<any[], { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/core/social/feed',
        params,
      }),
      providesTags: ['Social'],
    }),
    
    getMessages: builder.query<any[], void>({
      query: () => '/core/social/conversations',
      providesTags: ['Social'],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useRsvpToEventMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetFeedQuery,
  useGetMessagesQuery,
} = coreApi;
```

### Step 4: Create Additional Slices (60 minutes)

**Create UI slice (src/store/slices/uiSlice.ts):**
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  isOnline: boolean;
  activeTab: string;
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
  language: string;
  isLoading: boolean;
  error: string | null;
  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null;
}

const initialState: UIState = {
  theme: 'system',
  isOnline: true,
  activeTab: 'Home',
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
  },
  language: 'en',
  isLoading: false,
  error: null,
  toast: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    
    updateNotificationSettings: (state, action: PayloadAction<Partial<UIState['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'warning' | 'info' }>) => {
      state.toast = {
        visible: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    },
    
    hideToast: (state) => {
      state.toast = null;
    },
  },
});

export const {
  setTheme,
  setOnlineStatus,
  setActiveTab,
  updateNotificationSettings,
  setLanguage,
  setLoading,
  setError,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectIsOnline = (state: { ui: UIState }) => state.ui.isOnline;
export const selectNotificationSettings = (state: { ui: UIState }) => state.ui.notifications;
export const selectToast = (state: { ui: UIState }) => state.ui.toast;
```

### Step 5: Create Hooks and Utilities (30 minutes)

**Create custom hooks (src/store/hooks.ts):**
```typescript
import { useAppSelector, useAppDispatch } from './index';
import { loginStart, loginSuccess, loginFailure, logout } from './slices/authSlice';
import { showToast } from './slices/uiSlice';
import { useLoginMutation, useLogoutMutation } from './api/authApi';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();

  const login = async (email: string, password: string) => {
    try {
      dispatch(loginStart());
      const result = await loginMutation({ email, password }).unwrap();
      dispatch(loginSuccess(result));
      dispatch(showToast({ message: 'Login successful', type: 'success' }));
      return result;
    } catch (error: any) {
      dispatch(loginFailure(error.message || 'Login failed'));
      dispatch(showToast({ message: error.message || 'Login failed', type: 'error' }));
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      dispatch(logout());
      dispatch(showToast({ message: 'Logged out successfully', type: 'success' }));
    }
  };

  return {
    ...auth,
    login,
    logout: logoutUser,
  };
};

export const useToast = () => {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.ui.toast);

  const showSuccessToast = (message: string) => {
    dispatch(showToast({ message, type: 'success' }));
  };

  const showErrorToast = (message: string) => {
    dispatch(showToast({ message, type: 'error' }));
  };

  const showWarningToast = (message: string) => {
    dispatch(showToast({ message, type: 'warning' }));
  };

  const showInfoToast = (message: string) => {
    dispatch(showToast({ message, type: 'info' }));
  };

  return {
    toast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
  };
};
```

## Acceptance Criteria

### Redux Store Configuration
- [ ] Redux Toolkit store configured with proper middleware
- [ ] Redux Persist configured for data persistence
- [ ] MMKV storage integration for fast persistence
- [ ] TypeScript integration with typed hooks and selectors

### State Management
- [ ] Authentication state management with login/logout flow
- [ ] User profile state management
- [ ] UI state management (theme, notifications, loading states)
- [ ] Error handling and toast notifications

### API Integration
- [ ] RTK Query configured for API calls
- [ ] Automatic token refresh on 401 errors
- [ ] Proper request/response typing
- [ ] Cache invalidation and tag-based updates

### Custom Hooks
- [ ] useAuth hook for authentication operations
- [ ] useToast hook for notification management
- [ ] Typed useAppSelector and useAppDispatch hooks
- [ ] Reusable hooks for common operations

## Testing Instructions

### State Management Testing
```bash
# Test TypeScript compilation
npx tsc --noEmit

# Test Redux DevTools integration
# Open app and check Redux DevTools in browser/Reactotron

# Test persistence
# Login, close app, reopen - should maintain auth state
```

### Manual Testing
- [ ] Test login/logout flow with state persistence
- [ ] Test API calls with automatic token refresh
- [ ] Test offline/online state management
- [ ] Test theme switching and UI state persistence
- [ ] Test error handling and toast notifications

## Next Steps
After completion, proceed to:
- Task 004: Shared Component Library
- Integrate state management with navigation
- Create API error boundary components

## Documentation
- Document state management architecture
- Create Redux store structure guide
- Document API integration patterns
- Create custom hooks usage guide
