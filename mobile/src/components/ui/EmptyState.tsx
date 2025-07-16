import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@/constants/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  style?: any;
  testID?: string;
}

/**
 * EmptyState Component
 * 
 * Displays empty state with icon, title, subtitle, and optional actions.
 * Used when lists or content areas have no data to display.
 * 
 * Features:
 * - Customizable icon (emoji or text)
 * - Title and subtitle text
 * - Primary and secondary action buttons
 * - Consistent styling and spacing
 * - Accessibility support
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {icon && (
        <Text style={styles.icon}>{icon}</Text>
      )}
      
      <Text style={styles.title}>{title}</Text>
      
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
      
      {(actionText || secondaryActionText) && (
        <View style={styles.actions}>
          {actionText && onAction && (
            <Button
              variant="primary"
              size="md"
              onPress={onAction}
              style={styles.primaryAction}
              testID={`${testID}-primary-action`}
            >
              {actionText}
            </Button>
          )}
          
          {secondaryActionText && onSecondaryAction && (
            <Button
              variant="outline"
              size="md"
              onPress={onSecondaryAction}
              style={styles.secondaryAction}
              testID={`${testID}-secondary-action`}
            >
              {secondaryActionText}
            </Button>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  icon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.semibold,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  actions: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  primaryAction: {
    minWidth: 160,
  },
  secondaryAction: {
    minWidth: 160,
  },
});
