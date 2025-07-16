import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  isOnline: boolean;
  activeTab: string;
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    events: boolean;
    social: boolean;
    spark: boolean;
    marketing: boolean;
  };
  language: string;
  isLoading: boolean;
  error: string | null;
  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  } | null;
  modal: {
    visible: boolean;
    type: string;
    data?: any;
  } | null;
  bottomSheet: {
    visible: boolean;
    content: string;
    data?: any;
  } | null;
  searchHistory: string[];
  recentlyViewed: {
    type: 'event' | 'user' | 'program';
    id: string;
    title: string;
    timestamp: string;
  }[];
  preferences: {
    autoPlayVideos: boolean;
    dataUsage: 'low' | 'medium' | 'high';
    locationServices: boolean;
    analytics: boolean;
  };
}

const initialState: UIState = {
  theme: 'system',
  isOnline: true,
  activeTab: 'Home',
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    events: true,
    social: true,
    spark: true,
    marketing: false,
  },
  language: 'en',
  isLoading: false,
  error: null,
  toast: null,
  modal: null,
  bottomSheet: null,
  searchHistory: [],
  recentlyViewed: [],
  preferences: {
    autoPlayVideos: true,
    dataUsage: 'medium',
    locationServices: true,
    analytics: true,
  },
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
    
    showToast: (state, action: PayloadAction<{ 
      message: string; 
      type: 'success' | 'error' | 'warning' | 'info';
      duration?: number;
    }>) => {
      state.toast = {
        visible: true,
        message: action.payload.message,
        type: action.payload.type,
        duration: action.payload.duration || 3000,
      };
    },
    
    hideToast: (state) => {
      state.toast = null;
    },
    
    showModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.modal = {
        visible: true,
        type: action.payload.type,
        data: action.payload.data,
      };
    },
    
    hideModal: (state) => {
      state.modal = null;
    },
    
    showBottomSheet: (state, action: PayloadAction<{ content: string; data?: any }>) => {
      state.bottomSheet = {
        visible: true,
        content: action.payload.content,
        data: action.payload.data,
      };
    },
    
    hideBottomSheet: (state) => {
      state.bottomSheet = null;
    },
    
    addToSearchHistory: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (query && !state.searchHistory.includes(query)) {
        state.searchHistory.unshift(query);
        // Keep only last 10 searches
        state.searchHistory = state.searchHistory.slice(0, 10);
      }
    },
    
    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },
    
    addToRecentlyViewed: (state, action: PayloadAction<{
      type: 'event' | 'user' | 'program';
      id: string;
      title: string;
    }>) => {
      const item = {
        ...action.payload,
        timestamp: new Date().toISOString(),
      };
      
      // Remove if already exists
      state.recentlyViewed = state.recentlyViewed.filter(
        (viewed) => !(viewed.type === item.type && viewed.id === item.id)
      );
      
      // Add to beginning
      state.recentlyViewed.unshift(item);
      
      // Keep only last 20 items
      state.recentlyViewed = state.recentlyViewed.slice(0, 20);
    },
    
    clearRecentlyViewed: (state) => {
      state.recentlyViewed = [];
    },
    
    updatePreferences: (state, action: PayloadAction<Partial<UIState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    resetUI: (state) => {
      // Reset to initial state but keep theme and language preferences
      const { theme, language, preferences } = state;
      return {
        ...initialState,
        theme,
        language,
        preferences,
      };
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
  showModal,
  hideModal,
  showBottomSheet,
  hideBottomSheet,
  addToSearchHistory,
  clearSearchHistory,
  addToRecentlyViewed,
  clearRecentlyViewed,
  updatePreferences,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectIsOnline = (state: { ui: UIState }) => state.ui.isOnline;
export const selectActiveTab = (state: { ui: UIState }) => state.ui.activeTab;
export const selectNotificationSettings = (state: { ui: UIState }) => state.ui.notifications;
export const selectLanguage = (state: { ui: UIState }) => state.ui.language;
export const selectIsLoading = (state: { ui: UIState }) => state.ui.isLoading;
export const selectError = (state: { ui: UIState }) => state.ui.error;
export const selectToast = (state: { ui: UIState }) => state.ui.toast;
export const selectModal = (state: { ui: UIState }) => state.ui.modal;
export const selectBottomSheet = (state: { ui: UIState }) => state.ui.bottomSheet;
export const selectSearchHistory = (state: { ui: UIState }) => state.ui.searchHistory;
export const selectRecentlyViewed = (state: { ui: UIState }) => state.ui.recentlyViewed;
export const selectPreferences = (state: { ui: UIState }) => state.ui.preferences;
