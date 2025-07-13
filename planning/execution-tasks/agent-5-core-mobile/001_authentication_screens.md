# Task 001: Authentication Screens Implementation
**Agent**: Core Mobile UI Developer  
**Estimated Time**: 7-8 hours  
**Priority**: High  
**Dependencies**: Agent 4 Task 004 (Shared Component Library), Agent 1 Task 002 (Authentication System)  

## Overview
Implement complete authentication flow screens for Funlynk Core mobile app including login, registration, onboarding, and password reset functionality using the established design system and component library.

## Prerequisites
- Mobile foundation setup complete (Agent 4 tasks)
- Authentication API endpoints available (Agent 1 Task 002)
- Design system components implemented
- Redux store and navigation configured

## Step-by-Step Implementation

### Step 1: Create Authentication Screen Components (2.5 hours)

**Create LoginScreen component:**
```bash
# Create authentication screen directory
mkdir -p src/screens/core/auth

# Create LoginScreen component
touch src/screens/core/auth/LoginScreen.tsx
```

**Implement LoginScreen.tsx using template pattern:**
```typescript
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '../../../components/shared/atoms/Button';
import { Input } from '../../../components/shared/atoms/Input';
import { ErrorMessage } from '../../../components/shared/molecules/ErrorMessage';
import { LoadingSpinner } from '../../../components/shared/atoms/LoadingSpinner';

// Auth-specific components
import { AuthHeader } from '../../../components/core/molecules/AuthHeader';
import { SocialLoginButtons } from '../../../components/core/molecules/SocialLoginButtons';

// Hooks
import { useAuth } from '../../../hooks/shared/useAuth';
import { useErrorHandler } from '../../../hooks/shared/useErrorHandler';

// Types
import type { NavigationProp } from '@react-navigation/native';
import type { AuthStackParamList } from '../../../navigation/AuthNavigator';

// Redux
import { authActions } from '../../../store/slices/authSlice';
import type { RootState } from '../../../store/store';

/**
 * LoginScreen Component
 * 
 * Handles user authentication with email/password and social login options.
 * Includes form validation, error handling, and navigation to registration.
 * 
 * Features:
 * - Email/password login form
 * - Social login buttons (Google, Apple)
 * - Form validation with real-time feedback
 * - Loading states and error handling
 * - Navigation to registration and password reset
 * - Accessibility support
 */

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

type LoginScreenNavigationProp = NavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();
  const { handleError } = useErrorHandler();
  
  // Redux state
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Form validation
  const validateForm = useCallback((data: LoginFormData): LoginFormErrors => {
    const newErrors: LoginFormErrors = {};
    
    // Email validation
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!data.password) {
      newErrors.password = 'Password is required';
    } else if (data.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof LoginFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Real-time validation
    const newErrors = validateForm(newFormData);
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  }, [formData, validateForm]);

  // Handle login submission
  const handleLogin = useCallback(async () => {
    try {
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      dispatch(authActions.loginStart());
      
      // Call authentication API
      const result = await authApi.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (result.success) {
        dispatch(authActions.loginSuccess({
          user: result.user,
          token: result.token,
        }));
        // Navigation handled by auth state change
      } else {
        dispatch(authActions.loginFailure(result.error));
        setErrors({ general: result.error });
      }
    } catch (error) {
      const errorMessage = handleError(error);
      dispatch(authActions.loginFailure(errorMessage));
      setErrors({ general: errorMessage });
    }
  }, [formData, validateForm, dispatch, handleError]);

  // Handle social login
  const handleSocialLogin = useCallback(async (provider: 'google' | 'apple') => {
    try {
      dispatch(authActions.socialLoginStart(provider));
      
      const result = await authApi.socialLogin(provider);
      
      if (result.success) {
        dispatch(authActions.loginSuccess({
          user: result.user,
          token: result.token,
        }));
      } else {
        dispatch(authActions.loginFailure(result.error));
        setErrors({ general: result.error });
      }
    } catch (error) {
      const errorMessage = handleError(error);
      dispatch(authActions.loginFailure(errorMessage));
      setErrors({ general: errorMessage });
    }
  }, [dispatch, handleError]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader
            title="Welcome Back"
            subtitle="Sign in to continue to Funlynk"
          />

          <View style={styles.formContainer}>
            {/* Email Input */}
            <Input
              label="Email Address"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
              testID="login-email-input"
            />

            {/* Password Input */}
            <Input
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Enter your password"
              secureTextEntry
              autoComplete="password"
              error={errors.password}
              testID="login-password-input"
            />

            {/* General Error */}
            {errors.general && (
              <ErrorMessage
                message={errors.general}
                testID="login-error-message"
              />
            )}

            {/* Login Button */}
            <Button
              variant="primary"
              size="large"
              onPress={handleLogin}
              disabled={!isFormValid || isLoading}
              loading={isLoading}
              testID="login-submit-button"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Forgot Password Link */}
            <Button
              variant="text"
              size="medium"
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPasswordButton}
              testID="forgot-password-button"
            >
              Forgot your password?
            </Button>
          </View>

          {/* Social Login Section */}
          <SocialLoginButtons
            onGoogleLogin={() => handleSocialLogin('google')}
            onAppleLogin={() => handleSocialLogin('apple')}
            loading={isLoading}
          />

          {/* Registration Link */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>
              Don't have an account?{' '}
            </Text>
            <Button
              variant="text"
              size="medium"
              onPress={() => navigation.navigate('Register')}
              testID="register-link-button"
            >
              Sign Up
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  formContainer: {
    marginTop: 32,
    marginBottom: 32,
  },
  forgotPasswordButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
});
```

**Create RegisterScreen component:**
```bash
touch src/screens/core/auth/RegisterScreen.tsx
```

**Implement RegisterScreen.tsx with similar pattern but extended form:**
- Full name, email, password, confirm password fields
- Terms of service acceptance checkbox
- Age verification (13+ requirement)
- Interest selection during registration
- Email verification flow initiation

**Create OnboardingScreen component:**
```bash
touch src/screens/core/auth/OnboardingScreen.tsx
```

**Implement OnboardingScreen.tsx with multi-step flow:**
- Welcome screen with app introduction
- Interest selection with category chips
- Location permission request
- Notification permission request
- Profile photo upload (optional)
- Completion and navigation to main app

**Create ForgotPasswordScreen component:**
```bash
touch src/screens/core/auth/ForgotPasswordScreen.tsx
```

**Implement ForgotPasswordScreen.tsx:**
- Email input for password reset
- Reset code verification
- New password creation
- Success confirmation

### Step 2: Create Authentication-Specific Components (2 hours)

**Create AuthHeader molecule component:**
```bash
mkdir -p src/components/core/molecules
touch src/components/core/molecules/AuthHeader.tsx
```

**Implement AuthHeader.tsx:**
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  testID?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
});
```

**Create SocialLoginButtons molecule component:**
```bash
touch src/components/core/molecules/SocialLoginButtons.tsx
```

**Implement SocialLoginButtons.tsx:**
- Google Sign-In button with proper branding
- Apple Sign-In button (iOS only)
- Loading states for each button
- Proper accessibility labels
- Error handling for social auth failures

**Create InterestSelector organism component:**
```bash
mkdir -p src/components/core/organisms
touch src/components/core/organisms/InterestSelector.tsx
```

**Implement InterestSelector.tsx:**
- Grid layout of interest category chips
- Multi-select functionality
- Search/filter capabilities
- Minimum selection requirement (3-5 interests)
- Visual feedback for selections

### Step 3: Implement Authentication Hooks (1.5 hours)

**Create useAuth hook:**
```bash
mkdir -p src/hooks/shared
touch src/hooks/shared/useAuth.ts
```

**Implement useAuth.ts:**
```typescript
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authApi } from '../../services/api/auth/authApi';
import { authActions } from '../../store/slices/authSlice';
import { useErrorHandler } from './useErrorHandler';
import type { RootState } from '../../store/store';
import type { LoginCredentials, RegisterData, User } from '../../types/auth';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { handleError } = useErrorHandler();

  const {
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
  } = useSelector((state: RootState) => state.auth);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch(authActions.loginStart());
      const result = await authApi.login(credentials);

      if (result.success) {
        dispatch(authActions.loginSuccess({
          user: result.user,
          token: result.token,
        }));
        return { success: true };
      } else {
        dispatch(authActions.loginFailure(result.error));
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = handleError(error);
      dispatch(authActions.loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  }, [dispatch, handleError]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      dispatch(authActions.registerStart());
      const result = await authApi.register(data);

      if (result.success) {
        dispatch(authActions.registerSuccess({
          user: result.user,
          token: result.token,
        }));
        return { success: true };
      } else {
        dispatch(authActions.registerFailure(result.error));
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = handleError(error);
      dispatch(authActions.registerFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  }, [dispatch, handleError]);

  const logout = useCallback(async () => {
    try {
      dispatch(authActions.logoutStart());
      await authApi.logout();
      dispatch(authActions.logoutSuccess());
    } catch (error) {
      // Even if logout fails on server, clear local state
      dispatch(authActions.logoutSuccess());
    }
  }, [dispatch]);

  const refreshToken = useCallback(async () => {
    try {
      const result = await authApi.refreshToken();
      if (result.success) {
        dispatch(authActions.tokenRefreshed({
          token: result.token,
          user: result.user,
        }));
        return { success: true };
      } else {
        dispatch(authActions.logoutSuccess());
        return { success: false };
      }
    } catch (error) {
      dispatch(authActions.logoutSuccess());
      return { success: false };
    }
  }, [dispatch]);

  return {
    // State
    user,
    token,
    isLoading,
    isAuthenticated,
    error,

    // Actions
    login,
    register,
    logout,
    refreshToken,
  };
};
```

**Create useOnboarding hook:**
```bash
touch src/hooks/core/useOnboarding.ts
```

**Implement useOnboarding.ts:**
- Multi-step onboarding flow management
- Progress tracking and validation
- Interest selection handling
- Permission request management
- Profile completion tracking

### Step 4: Configure Authentication Navigation (1 hour)

**Create AuthNavigator:**
```bash
mkdir -p src/navigation
touch src/navigation/AuthNavigator.tsx
```

**Implement AuthNavigator.tsx:**
```typescript
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import { LoginScreen } from '../screens/core/auth/LoginScreen';
import { RegisterScreen } from '../screens/core/auth/RegisterScreen';
import { OnboardingScreen } from '../screens/core/auth/OnboardingScreen';
import { ForgotPasswordScreen } from '../screens/core/auth/ForgotPasswordScreen';

// Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: { userId: string };
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => ({
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
          },
        }),
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
          title: 'Sign Up',
        }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          title: 'Welcome',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password',
        }}
      />
    </Stack.Navigator>
  );
};
```

**Update main App navigator to include AuthNavigator:**
- Conditional rendering based on authentication state
- Smooth transitions between auth and main app
- Deep linking support for auth flows

## Acceptance Criteria

### Functional Requirements
- [ ] Login screen accepts email/password and validates input
- [ ] Registration screen collects required user information
- [ ] Onboarding flow guides new users through app setup
- [ ] Password reset flow works end-to-end
- [ ] Social login integration works for Google and Apple
- [ ] Form validation provides real-time feedback
- [ ] Loading states are shown during API calls
- [ ] Error messages are displayed clearly
- [ ] Navigation between auth screens works smoothly

### Technical Requirements
- [ ] All screens follow established component template patterns
- [ ] Redux integration for authentication state management
- [ ] TypeScript types are properly defined and used
- [ ] Accessibility labels and hints are implemented
- [ ] Error handling follows established patterns
- [ ] API integration uses established service patterns
- [ ] Responsive design works on different screen sizes
- [ ] Platform-specific optimizations (iOS/Android)

### Design Requirements
- [ ] Screens match design system specifications exactly
- [ ] Color palette and typography are consistent
- [ ] Button styles and interactions follow design system
- [ ] Form layouts follow established patterns
- [ ] Loading and error states are visually consistent
- [ ] Social login buttons follow platform guidelines
- [ ] Accessibility contrast ratios meet WCAG standards

### Testing Requirements
- [ ] Unit tests for all custom hooks
- [ ] Component tests for all screen components
- [ ] Integration tests for authentication flows
- [ ] Accessibility testing with screen readers
- [ ] Manual testing on iOS and Android devices
- [ ] Error scenario testing (network failures, invalid inputs)

## Manual Testing Instructions

### Test Case 1: Login Flow
1. Open app and verify login screen displays
2. Test form validation with invalid inputs
3. Test successful login with valid credentials
4. Verify navigation to main app after login
5. Test "Remember Me" functionality
6. Test social login buttons (Google/Apple)

### Test Case 2: Registration Flow
1. Navigate to registration from login screen
2. Test form validation for all fields
3. Test password confirmation matching
4. Test terms of service acceptance requirement
5. Complete registration and verify email verification
6. Test navigation to onboarding flow

### Test Case 3: Onboarding Flow
1. Complete registration and enter onboarding
2. Test each onboarding step progression
3. Test interest selection (minimum requirements)
4. Test permission requests (location, notifications)
5. Test optional profile photo upload
6. Verify completion and navigation to main app

### Test Case 4: Password Reset Flow
1. Navigate to forgot password from login
2. Enter email and request reset code
3. Verify reset code input and validation
4. Test new password creation and confirmation
5. Verify successful reset and return to login

### Test Case 5: Error Handling
1. Test network failure scenarios
2. Test invalid credential handling
3. Test server error responses
4. Test form validation edge cases
5. Verify error message clarity and helpfulness

## API Integration Requirements

### Authentication Endpoints Used
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation
- `POST /api/auth/social/google` - Google OAuth
- `POST /api/auth/social/apple` - Apple Sign-In

### Data Validation
- Email format validation
- Password strength requirements (8+ chars, mixed case, numbers)
- Age verification (13+ years)
- Terms of service acceptance
- Interest selection (minimum 3 categories)

## Dependencies and Integration Points

### Required Components (from Agent 4)
- Button component with all variants
- Input component with validation support
- ErrorMessage component
- LoadingSpinner component
- Navigation system setup
- Redux store configuration

### API Dependencies (from Agent 1)
- Authentication endpoints implemented
- User model and relationships
- JWT token management
- Social OAuth configuration
- Email verification system

### Design System Dependencies
- Color palette variables
- Typography scale
- Component specifications
- Layout and spacing system
- Mobile design guidelines

## Completion Checklist

- [ ] All screen components implemented and tested
- [ ] Authentication-specific components created
- [ ] Custom hooks implemented and tested
- [ ] Navigation configuration complete
- [ ] Redux integration working
- [ ] API integration complete
- [ ] Form validation working
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Accessibility features added
- [ ] Manual testing completed
- [ ] Code review completed
- [ ] Documentation updated

## Notes for Next Tasks
- Authentication screens provide foundation for all other user flows
- User state management established for use in other features
- Navigation patterns established for consistent UX
- Form patterns can be reused in event creation and profile editing
- Error handling patterns should be consistent across all features
