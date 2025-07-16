import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  testID?: string;
}

/**
 * AuthHeader Component
 * 
 * Displays consistent header styling across authentication screens
 * with title and optional subtitle text.
 * 
 * Features:
 * - Consistent typography and spacing
 * - Optional subtitle support
 * - Accessibility support
 * - Responsive design
 */
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
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
    textAlign: 'center',
    lineHeight: 24,
  },
});
