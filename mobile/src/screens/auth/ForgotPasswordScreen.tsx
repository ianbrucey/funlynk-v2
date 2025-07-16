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
import { usePasswordReset } from '@/store/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { ErrorMessage } from '@/components/common/ErrorMessage';

type ForgotPasswordScreenProps = AuthStackScreenProps<'ForgotPassword'>;

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormErrors {
  email?: string;
  general?: string;
}

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenProps['navigation']>();
  const { forgotPassword, isForgotLoading } = usePasswordReset();

  // Form state
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Form validation
  const validateForm = useCallback((data: ForgotPasswordFormData): ForgotPasswordFormErrors => {
    const newErrors: ForgotPasswordFormErrors = {};

    // Email validation
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    return newErrors;
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof ForgotPasswordFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Real-time validation
    const newErrors = validateForm(newFormData);
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  }, [formData, validateForm]);

  const handleSubmit = async () => {
    try {
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      await forgotPassword(formData.email.trim().toLowerCase());
      setIsSubmitted(true);
    } catch (error) {
      console.log('Forgot password failed:', error);
      setErrors({ general: 'Failed to send reset email. Please try again.' });
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <Text style={styles.successEmoji}>📧</Text>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successSubtitle}>
              We've sent password reset instructions to{'\n'}
              <Text style={styles.emailText}>{formData.email}</Text>
            </Text>

            <Text style={styles.instructionsText}>
              Click the link in the email to reset your password.
              If you don't see it, check your spam folder.
            </Text>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleBackToLogin}
              style={styles.backButton}
              testID="back-to-login-button"
            >
              Back to Sign In
            </Button>

            <TouchableOpacity
              style={styles.resendContainer}
              onPress={() => setIsSubmitted(false)}
              testID="resend-email-button"
            >
              <Text style={styles.resendText}>
                Didn't receive the email? <Text style={styles.resendLink}>Try again</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
            title="Reset Password"
            subtitle="Enter your email address and we'll send you instructions to reset your password."
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
              testID="forgot-password-email-input"
            />

            {/* General Error */}
            {errors.general && (
              <ErrorMessage
                message={errors.general}
                testID="forgot-password-error-message"
              />
            )}

            {/* Submit Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleSubmit}
              disabled={!isFormValid || isForgotLoading}
              loading={isForgotLoading}
              style={styles.submitButton}
              testID="forgot-password-submit-button"
            >
              {isForgotLoading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>

            {/* Back to Login Link */}
            <TouchableOpacity
              style={styles.backToLoginContainer}
              onPress={handleBackToLogin}
              testID="back-to-login-link"
            >
              <Text style={styles.backToLoginText}>
                Remember your password? <Text style={styles.backToLoginLink}>Sign In</Text>
              </Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
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
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  submitButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  backToLoginContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  backToLoginText: {
    fontSize: 16,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
  },
  backToLoginLink: {
    color: theme.colors.primary[600],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  // Success screen styles
  successContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  successSubtitle: {
    fontSize: 16,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  emailText: {
    fontFamily: theme.typography.fontFamily?.medium,
    color: theme.colors.neutral[800],
  },
  instructionsText: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    fontFamily: theme.typography.fontFamily?.regular,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    marginBottom: theme.spacing.lg,
  },
  resendContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  resendText: {
    fontSize: 14,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
  },
  resendLink: {
    color: theme.colors.primary[600],
    fontFamily: theme.typography.fontFamily?.medium,
  },
});

export default ForgotPasswordScreen;
