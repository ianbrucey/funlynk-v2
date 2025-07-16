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
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '@/constants/theme';
import { AuthStackScreenProps } from '@/types/navigation';

type ResetPasswordScreenProps = AuthStackScreenProps<'ResetPassword'>;

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordScreenProps['navigation']>();
  const route = useRoute<ResetPasswordScreenProps['route']>();
  const { token } = route.params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = () => {
    // TODO: Implement actual password reset logic
    console.log('Reset password with token:', token);
    console.log('New password:', password);
    
    // Navigate back to login
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Enter your new password below
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.input}>
              <Text style={styles.placeholder}>
                {password || 'Enter new password'}
              </Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.input}>
              <Text style={styles.placeholder}>
                {confirmPassword || 'Confirm new password'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Update Password</Text>
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
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: theme.touchTargets.minimum,
    marginTop: theme.spacing.md,
  },
  buttonText: {
    ...theme.textStyles.headline,
    color: theme.colors.textOnPrimary,
  },
});

export default ResetPasswordScreen;
