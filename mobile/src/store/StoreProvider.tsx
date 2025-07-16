import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import NetInfo from '@react-native-community/netinfo';
import { store, persistor, useAppDispatch } from './index';
import { setOnlineStatus } from './slices/uiSlice';
import LoadingScreen from '@/components/common/LoadingScreen';

interface StoreProviderProps {
  children: React.ReactNode;
}

// Network status monitor component
const NetworkMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch(setOnlineStatus(state.isConnected ?? false));
    });

    // Get initial network state
    NetInfo.fetch().then(state => {
      dispatch(setOnlineStatus(state.isConnected ?? false));
    });

    return unsubscribe;
  }, [dispatch]);

  return <>{children}</>;
};

// Loading component for PersistGate
const PersistLoading: React.FC = () => {
  return <LoadingScreen message="Loading your data..." />;
};

// Error boundary for Redux errors
class ReduxErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Redux Error Boundary caught an error:', error, errorInfo);
    
    // Log to crash reporting service in production
    if (!__DEV__) {
      // TODO: Add crash reporting service
      // crashlytics().recordError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <LoadingScreen 
          message="Something went wrong. Please restart the app." 
          error={this.state.error?.message}
        />
      );
    }

    return this.props.children;
  }
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return (
    <ReduxErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<PersistLoading />} persistor={persistor}>
          <NetworkMonitor>
            {children}
          </NetworkMonitor>
        </PersistGate>
      </Provider>
    </ReduxErrorBoundary>
  );
};

export default StoreProvider;
