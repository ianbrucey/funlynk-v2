import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { MMKV } from 'react-native-mmkv';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Import slice reducers
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import eventsSlice from './slices/eventsSlice';
import socialSlice from './slices/socialSlice';
import sparkSlice from './slices/sparkSlice';

// Import API slices
import { authApi } from './api/authApi';
import { coreApi } from './api/coreApi';
import { sparkApi } from './api/sparkApi';

// Configure MMKV storage
const storage = new MMKV({
  id: 'funlynk-storage',
  encryptionKey: 'funlynk-encryption-key-2024',
});

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
  whitelist: ['auth', 'ui'], // Only persist these reducers
  blacklist: ['events', 'social', 'spark'], // Don't persist these (they'll be refetched)
  version: 1,
  migrate: (state: any) => {
    // Handle migration if needed
    return Promise.resolve(state);
  },
};

const rootReducer = combineReducers({
  auth: authSlice,
  ui: uiSlice,
  events: eventsSlice,
  social: socialSlice,
  spark: sparkSlice,
  [authApi.reducerPath]: authApi.reducer,
  [coreApi.reducerPath]: coreApi.reducer,
  [sparkApi.reducerPath]: sparkApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
      immutableCheck: {
        ignoredPaths: ['items.dates'],
      },
    })
      .concat(authApi.middleware)
      .concat(coreApi.middleware)
      .concat(sparkApi.middleware),
  devTools: __DEV__ && {
    name: 'Funlynk Mobile',
    trace: true,
    traceLimit: 25,
  },
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Store utilities
export const resetStore = () => {
  storage.clearAll();
  persistor.purge();
};

export const getStorageSize = () => {
  // Get approximate storage size (MMKV doesn't provide exact size)
  const keys = storage.getAllKeys();
  let totalSize = 0;
  keys.forEach(key => {
    const value = storage.getString(key);
    if (value) {
      totalSize += value.length;
    }
  });
  return totalSize;
};

// Development utilities
if (__DEV__) {
  // Expose store to global for debugging
  (global as any).store = store;
  (global as any).persistor = persistor;
  (global as any).resetStore = resetStore;
  
  // Log store size periodically in development
  setInterval(() => {
    const size = getStorageSize();
    if (size > 1024 * 1024) { // Log if over 1MB
      console.log(`Store size: ${(size / 1024 / 1024).toFixed(2)}MB`);
    }
  }, 30000);
}

export default store;
