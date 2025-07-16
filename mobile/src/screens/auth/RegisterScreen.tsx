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

type RegisterScreenProps = AuthStackScreenProps<'Register'>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenProps['navigation']>();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = () => {
    // TODO: Implement actual registration logic
    console.log('Register attempt:', formData);
    
    // Navigate to role selection
    navigation.navigate('RoleSelection');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the Funlynk community</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>First Name</Text>
                <View style={styles.input}>
                  <Text style={styles.placeholder}>
                    {formData.firstName || 'First name'}
                  </Text>
                </View>
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Last Name</Text>
                <View style={styles.input}>
                  <Text style={styles.placeholder}>
                    {formData.lastName || 'Last name'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.input}>
                <Text style={styles.placeholder}>
                  {formData.email || 'Enter your email'}
                </Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.input}>
                <Text style={styles.placeholder}>
                  {formData.password || 'Create a password'}
                </Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.input}>
                <Text style={styles.placeholder}>
                  {formData.confirmPassword || 'Confirm your password'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Create Account</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
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
  registerButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: theme.touchTargets.minimum,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  registerButtonText: {
    ...theme.textStyles.headline,
    color: theme.colors.textOnPrimary,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    ...theme.textStyles.subhead,
    color: theme.colors.textSecondary,
  },
  loginLink: {
    ...theme.textStyles.subhead,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default RegisterScreen;
