import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, Platform } from 'react-native';

import { RootStackParamList } from '@/types/navigation';
import { theme } from '@/constants/theme';
import { linking } from './LinkingConfiguration';
import { navigationRef } from './NavigationService';
import { useAppSelector } from '@/store';

// Import navigators and screens
import SplashScreen from '@/screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import ModalScreen from '@/screens/ModalScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  // Get authentication state from Redux
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = useAppSelector(
    (state) => ({
      isAuthenticated: state.auth.isAuthenticated,
      isLoading: state.auth.isLoading,
      hasCompletedOnboarding: state.auth.hasCompletedOnboarding,
    })
  );

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <>
      <StatusBar 
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={theme.colors.primary}
      />
      <NavigationContainer 
        ref={navigationRef}
        linking={linking}
        theme={{
          dark: false,
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.textPrimary,
            border: theme.colors.border,
            notification: theme.colors.error,
          },
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          {!hasCompletedOnboarding ? (
            <Stack.Screen 
              name="Onboarding" 
              component={OnboardingScreen}
              options={{
                animationTypeForReplace: 'push',
              }}
            />
          ) : !isAuthenticated ? (
            <Stack.Screen 
              name="Auth" 
              component={AuthNavigator}
              options={{
                animationTypeForReplace: 'push',
              }}
            />
          ) : (
            <>
              <Stack.Screen 
                name="Main" 
                component={MainNavigator}
                options={{
                  animationTypeForReplace: 'push',
                }}
              />
              <Stack.Group 
                screenOptions={{ 
                  presentation: 'modal',
                  animation: Platform.OS === 'ios' ? 'slide_from_bottom' : 'fade_from_bottom',
                }}
              >
                <Stack.Screen 
                  name="Modal" 
                  component={ModalScreen}
                  options={{
                    headerShown: false,
                  }}
                />
              </Stack.Group>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

// Placeholder Onboarding Screen
const OnboardingScreen: React.FC = () => {
  return <SplashScreen />;
};

export default RootNavigator;
