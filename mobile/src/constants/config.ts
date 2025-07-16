import { Platform } from 'react-native';

// Environment configuration
const isDevelopment = __DEV__;
const isProduction = !__DEV__;

// API Configuration
export const Config = {
  // API Base URLs
  API_BASE_URL: isDevelopment 
    ? 'http://localhost:3000/api/v1' 
    : 'https://api.funlynk.com/v1',
  
  // API Timeouts
  API_TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 120000, // 2 minutes for file uploads
  
  // App Configuration
  APP_NAME: 'Funlynk',
  APP_VERSION: '1.0.0',
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    THEME: 'theme_preference',
    LANGUAGE: 'language_preference',
    ONBOARDING: 'onboarding_completed',
  },
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  
  // Push Notifications
  PUSH_NOTIFICATION_TOPICS: {
    EVENTS: 'events',
    SOCIAL: 'social',
    SPARK: 'spark',
    SYSTEM: 'system',
  },
  
  // Deep Linking
  URL_SCHEMES: ['funlynk', 'https://app.funlynk.com'],
  
  // Feature Flags
  FEATURES: {
    SOCIAL_FEATURES: true,
    SPARK_FEATURES: true,
    PUSH_NOTIFICATIONS: true,
    OFFLINE_MODE: true,
    ANALYTICS: isProduction,
    DEBUG_MODE: isDevelopment,
  },
  
  // Platform-specific
  PLATFORM: {
    IS_IOS: Platform.OS === 'ios',
    IS_ANDROID: Platform.OS === 'android',
    IS_WEB: Platform.OS === 'web',
  },
  
  // Development
  DEV: {
    ENABLE_FLIPPER: isDevelopment && Platform.OS !== 'web',
    ENABLE_REACTOTRON: isDevelopment,
    LOG_LEVEL: isDevelopment ? 'debug' : 'error',
  },
  
  // Security
  SECURITY: {
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  },
  
  // UI Configuration
  UI: {
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
    TOAST_DURATION: 3000,
    LOADING_TIMEOUT: 30000,
  },
  
  // Validation
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
  },
};

export default Config;
