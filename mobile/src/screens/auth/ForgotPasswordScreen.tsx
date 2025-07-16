import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/constants/theme';
import { AuthStackScreenProps } from '@/types/navigation';

type ForgotPasswordScreenProps = AuthStackScreenProps<'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenProps['navigation']>();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    // TODO: Implement actual forgot password logic
    console.log('Forgot password for:', email);
    setIsSubmitted(true);
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent password reset instructions to {email}
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleBackToLogin}>
            <Text style={styles.buttonText}>Back to Sign In</Text>
          </TouchableOpacity>
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
        <View style={styles.content}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.input}>
              <Text style={styles.placeholder}>
                {email || 'Enter your email'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Send Reset Instructions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.textStyles.title2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.textStyles.subhead,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    ...theme.textStyles.subhead,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    minHeight: theme.touchTargets.minimum,
    justifyContent: 'center',
  },
  placeholder: {
    ...theme.textStyles.body,
    color: theme.colors.textTertiary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: theme.touchTargets.minimum,
    marginBottom: theme.spacing.lg,
  },
  buttonText: {
    ...theme.textStyles.headline,
    color: theme.colors.textOnPrimary,
  },
  backButton: {
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  backButtonText: {
    ...theme.textStyles.subhead,
    color: theme.colors.primary,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.xl,
  },
  successIconText: {
    fontSize: 40,
    color: theme.colors.textOnPrimary,
  },
});

export default ForgotPasswordScreen;
