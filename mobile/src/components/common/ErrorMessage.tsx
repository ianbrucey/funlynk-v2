import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
  testID?: string;
}

/**
 * ErrorMessage Component
 * 
 * Displays error messages with consistent styling and optional retry functionality.
 * 
 * Features:
 * - Consistent error styling
 * - Optional retry button
 * - Accessibility support
 * - Flexible usage across the app
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  showRetry = false,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.errorText}>{message}</Text>
      {showRetry && onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          testID={`${testID}-retry-button`}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.error[50],
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.error[200],
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error[600],
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily?.medium,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  retryText: {
    fontSize: 14,
    color: theme.colors.error[700],
    fontFamily: theme.typography.fontFamily?.medium,
    textDecorationLine: 'underline',
  },
});
