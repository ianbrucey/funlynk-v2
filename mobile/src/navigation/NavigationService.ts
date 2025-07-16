import { createNavigationContainerRef, StackActions } from '@react-navigation/native';
import { RootStackParamList } from '@/types/navigation';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const NavigationService = {
  navigate: (name: keyof RootStackParamList, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name, params);
    }
  },

  goBack: () => {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },

  reset: (routeName: keyof RootStackParamList, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: routeName, params }],
      });
    }
  },

  push: (name: keyof RootStackParamList, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.push(name, params));
    }
  },

  replace: (name: keyof RootStackParamList, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.replace(name, params));
    }
  },

  getCurrentRoute: () => {
    if (navigationRef.isReady()) {
      return navigationRef.getCurrentRoute();
    }
    return null;
  },

  getRootState: () => {
    if (navigationRef.isReady()) {
      return navigationRef.getRootState();
    }
    return null;
  },

  // Helper methods for common navigation patterns
  navigateToAuth: () => {
    NavigationService.reset('Auth');
  },

  navigateToMain: () => {
    NavigationService.reset('Main');
  },

  openModal: (screen: string, params?: any) => {
    NavigationService.navigate('Modal', { screen, params });
  },

  // Deep linking helpers
  handleDeepLink: (url: string) => {
    // This will be handled by the linking configuration
    // but can be extended for custom deep link handling
    console.log('Handling deep link:', url);
  },
};
