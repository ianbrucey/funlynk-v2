import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/constants/theme';
import { AuthStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/store/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { ErrorMessage } from '@/components/common/ErrorMessage';

type LoginScreenProps = AuthStackScreenProps<'Login'>;

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenProps['navigation']>();
  const { login, isLoginLoading, error, clearAuthError } = useAuth();

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

  const handleLogin = async () => {
    try {
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      await login(formData.email.trim().toLowerCase(), formData.password);
      // Navigation will be handled automatically by RootNavigator when auth state changes
    } catch (error) {
      // Error is already handled by the useAuth hook
      console.log('Login failed:', error);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  // Handle social login
  const handleSocialLogin = useCallback(async (provider: 'google' | 'apple') => {
    try {
      // TODO: Implement social login API calls
      console.log(`Social login with ${provider}`);
      // For now, just show a placeholder message
      setErrors({ general: `${provider} login not yet implemented` });
    } catch (error) {
      console.log(`${provider} login failed:`, error);
      setErrors({ general: `${provider} login failed. Please try again.` });
    }
  }, []);

  // Clear error when component mounts or when user starts typing
  React.useEffect(() => {
    if (error) {
      clearAuthError();
    }
  }, [formData.email, formData.password]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader
            title="Welcome Back"
            subtitle="Sign in to continue to Funlynk"
          />

          <View style={styles.form}>
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
              containerStyle={styles.inputContainer}
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
              containerStyle={styles.inputContainer}
              testID="login-password-input"
            />

            {/* General Error */}
            {(error || errors.general) && (
              <ErrorMessage
                message={error || errors.general || ''}
                testID="login-error-message"
              />
            )}

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              testID="forgot-password-button"
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleLogin}
              disabled={!isFormValid || isLoginLoading}
              loading={isLoginLoading}
              style={styles.loginButton}
              testID="login-submit-button"
            >
              {isLoginLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </View>

          {/* Social Login Section */}
          <SocialLoginButtons
            onGoogleLogin={() => handleSocialLogin('google')}
            onAppleLogin={() => handleSocialLogin('apple')}
            loading={isLoginLoading}
          />

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegister} testID="register-link-button">
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  form: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  forgotPasswordText: {
    fontSize: 16,
    color: theme.colors.primary[600],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  loginButton: {
    marginBottom: theme.spacing.lg,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  registerText: {
    fontSize: 16,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
  },
  registerLink: {
    fontSize: 16,
    color: theme.colors.primary[600],
    fontFamily: theme.typography.fontFamily?.medium,
  },
});

export default LoginScreen;
