import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import { AuthStackParamList } from '@/types/navigation';
import { theme } from '@/constants/theme';

// Import screens
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@/screens/auth/ResetPasswordScreen';
import RoleSelectionScreen from '@/screens/auth/RoleSelectionScreen';
import OnboardingScreen from '@/screens/auth/OnboardingScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        // Platform-specific header styles
        headerStyle: Platform.select({
          ios: {
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 0.5,
            borderBottomColor: theme.colors.ios.separator,
          },
          android: {
            backgroundColor: theme.colors.surface,
            elevation: 4,
          },
        }),
        headerTitleStyle: Platform.select({
          ios: {
            fontSize: 17,
            fontWeight: '600',
            color: theme.colors.textPrimary,
          },
          android: {
            fontSize: 20,
            fontWeight: '500',
            color: theme.colors.textPrimary,
          },
        }),
        headerBackTitleVisible: false,
        headerTintColor: Platform.OS === 'ios' ? theme.colors.ios.blue : theme.colors.android.blue,
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Sign In',
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          title: 'Create Account',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen}
        options={{
          title: 'New Password',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
        options={{
          title: 'Choose Your Role',
          headerShown: true,
          headerLeft: () => null, // Prevent going back
        }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          title: 'Welcome',
          headerShown: false,
          gestureEnabled: false, // Prevent going back
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
