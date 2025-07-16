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

type RegisterScreenProps = AuthStackScreenProps<'Register'>;

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
}

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenProps['navigation']>();
  const { register, isRegisterLoading, error, clearAuthError } = useAuth();

  // Form state
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Form validation
  const validateForm = useCallback((data: RegisterFormData): RegisterFormErrors => {
    const newErrors: RegisterFormErrors = {};

    // First name validation
    if (!data.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (data.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!data.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (data.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!data.password) {
      newErrors.password = 'Password is required';
    } else if (data.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!data.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement validation
    if (!data.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof RegisterFormData, value: string | boolean) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Real-time validation
    const newErrors = validateForm(newFormData);
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  }, [formData, validateForm]);

  const handleRegister = async () => {
    try {
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: 'user', // Default role, will be updated in role selection
      });

      // Navigate to role selection after successful registration
      navigation.navigate('RoleSelection');
    } catch (error) {
      // Error is already handled by the useAuth hook
      console.log('Registration failed:', error);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  // Handle social login
  const handleSocialLogin = useCallback(async (provider: 'google' | 'apple') => {
    try {
      // TODO: Implement social login API calls
      console.log(`Social registration with ${provider}`);
      // For now, just show a placeholder message
      setErrors({ general: `${provider} registration not yet implemented` });
    } catch (error) {
      console.log(`${provider} registration failed:`, error);
      setErrors({ general: `${provider} registration failed. Please try again.` });
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
            title="Create Account"
            subtitle="Join the Funlynk community"
          />

          <View style={styles.form}>
            {/* Name Row */}
            <View style={styles.row}>
              <Input
                label="First Name"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                placeholder="First name"
                autoCapitalize="words"
                autoComplete="given-name"
                error={errors.firstName}
                containerStyle={[styles.inputContainer, styles.halfWidth]}
                testID="register-firstname-input"
              />

              <Input
                label="Last Name"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                placeholder="Last name"
                autoCapitalize="words"
                autoComplete="family-name"
                error={errors.lastName}
                containerStyle={[styles.inputContainer, styles.halfWidth]}
                testID="register-lastname-input"
              />
            </View>

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
              testID="register-email-input"
            />

            {/* Password Input */}
            <Input
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Create a password"
              secureTextEntry
              autoComplete="new-password"
              error={errors.password}
              helperText="Must be 8+ characters with uppercase, lowercase, and number"
              containerStyle={styles.inputContainer}
              testID="register-password-input"
            />

            {/* Confirm Password Input */}
            <Input
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              placeholder="Confirm your password"
              secureTextEntry
              autoComplete="new-password"
              error={errors.confirmPassword}
              containerStyle={styles.inputContainer}
              testID="register-confirm-password-input"
            />

            {/* Terms Agreement */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => handleInputChange('agreeToTerms', !formData.agreeToTerms)}
              testID="terms-agreement-checkbox"
            >
              <View style={[styles.checkbox, formData.agreeToTerms && styles.checkboxChecked]}>
                {formData.agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.agreeToTerms && (
              <Text style={styles.termsError}>{errors.agreeToTerms}</Text>
            )}

            {/* General Error */}
            {(error || errors.general) && (
              <ErrorMessage
                message={error || errors.general || ''}
                testID="register-error-message"
              />
            )}

            {/* Register Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleRegister}
              disabled={!isFormValid || isRegisterLoading}
              loading={isRegisterLoading}
              style={styles.registerButton}
              testID="register-submit-button"
            >
              {isRegisterLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </View>

          {/* Social Login Section */}
          <SocialLoginButtons
            onGoogleLogin={() => handleSocialLogin('google')}
            onAppleLogin={() => handleSocialLogin('apple')}
            loading={isRegisterLoading}
          />

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin} testID="login-link-button">
              <Text style={styles.loginLink}>Sign In</Text>
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
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  form: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  halfWidth: {
    width: '48%',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.neutral[300],
    borderRadius: 4,
    marginRight: theme.spacing.sm,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  checkmark: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
    lineHeight: 20,
  },
  termsLink: {
    color: theme.colors.primary[600],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  termsError: {
    fontSize: 12,
    color: theme.colors.error[600],
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.xs,
  },
  registerButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  loginText: {
    fontSize: 16,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
  },
  loginLink: {
    fontSize: 16,
    color: theme.colors.primary[600],
    fontFamily: theme.typography.fontFamily?.medium,
  },
});

export default RegisterScreen;
