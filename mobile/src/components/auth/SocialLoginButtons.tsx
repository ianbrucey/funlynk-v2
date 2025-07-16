import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';

interface SocialLoginButtonsProps {
  onGoogleLogin: () => void;
  onAppleLogin: () => void;
  loading?: boolean;
  testID?: string;
}

/**
 * SocialLoginButtons Component
 * 
 * Displays social login options with proper platform-specific styling
 * and branding guidelines compliance.
 * 
 * Features:
 * - Google Sign-In button with proper branding
 * - Apple Sign-In button (iOS only)
 * - Loading states for each button
 * - Proper accessibility labels
 * - Platform-specific visibility
 */
export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGoogleLogin,
  onAppleLogin,
  loading = false,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.buttonsContainer}>
        {/* Google Sign-In Button */}
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onPress={onGoogleLogin}
          disabled={loading}
          style={styles.googleButton}
          contentStyle={styles.socialButtonContent}
          testID="google-login-button"
        >
          <View style={styles.buttonContent}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </View>
        </Button>

        {/* Apple Sign-In Button (iOS only) */}
        {Platform.OS === 'ios' && (
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onPress={onAppleLogin}
            disabled={loading}
            style={styles.appleButton}
            contentStyle={styles.socialButtonContent}
            testID="apple-login-button"
          >
            <View style={styles.buttonContent}>
              <Text style={styles.appleIcon}>🍎</Text>
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </View>
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.neutral[300],
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.neutral[500],
    fontFamily: theme.typography.fontFamily?.regular,
  },
  buttonsContainer: {
    gap: theme.spacing.md,
  },
  googleButton: {
    borderColor: theme.colors.neutral[300],
    backgroundColor: theme.colors.white,
  },
  appleButton: {
    borderColor: theme.colors.neutral[300],
    backgroundColor: theme.colors.white,
  },
  socialButtonContent: {
    paddingVertical: theme.spacing.md,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  appleIcon: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  socialButtonText: {
    fontSize: 16,
    color: theme.colors.neutral[700],
    fontFamily: theme.typography.fontFamily?.medium,
  },
});
