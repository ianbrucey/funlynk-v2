import React, { useState } from 'react';
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

type LoginScreenProps = AuthStackScreenProps<'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenProps['navigation']>();
  const { login, isLoginLoading, error, clearAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      await login(email.trim(), password);
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

  // Clear error when component mounts or when user starts typing
  React.useEffect(() => {
    if (error) {
      clearAuthError();
    }
  }, [email, password]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            {/* TODO: Replace with actual Input components */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.input}>
                <Text style={styles.placeholder}>
                  {email || 'Enter your email'}
                </Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.input}>
                <Text style={styles.placeholder}>
                  {password || 'Enter your password'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, isLoginLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoginLoading || !email.trim() || !password.trim()}
            >
              <Text style={styles.loginButtonText}>
                {isLoginLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.textStyles.title1,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.textStyles.subhead,
    color: theme.colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.xl,
  },
  forgotPasswordText: {
    ...theme.textStyles.subhead,
    color: theme.colors.primary,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: theme.touchTargets.minimum,
    marginBottom: theme.spacing.lg,
  },
  loginButtonDisabled: {
    backgroundColor: theme.colors.textTertiary,
    opacity: 0.6,
  },
  loginButtonText: {
    ...theme.textStyles.headline,
    color: theme.colors.textOnPrimary,
  },
  errorContainer: {
    backgroundColor: theme.colors.errorContainer,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
  },
  errorText: {
    ...theme.textStyles.subhead,
    color: theme.colors.error,
    textAlign: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    ...theme.textStyles.subhead,
    color: theme.colors.textSecondary,
  },
  registerLink: {
    ...theme.textStyles.subhead,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default LoginScreen;
