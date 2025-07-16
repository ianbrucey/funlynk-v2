import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { theme } from '@/constants/theme';

interface TextAreaProps extends Omit<TextInputProps, 'multiline'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  maxLength?: number;
  minHeight?: number;
  showCharacterCount?: boolean;
  containerStyle?: any;
}

/**
 * TextArea Component
 * 
 * Multi-line text input with character counting and validation.
 * Provides consistent styling and behavior across the app.
 * 
 * Features:
 * - Multi-line text input
 * - Character counting
 * - Error state display
 * - Helper text support
 * - Customizable height
 * - Accessibility support
 */
export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  required = false,
  maxLength,
  minHeight = 100,
  showCharacterCount = true,
  containerStyle,
  style,
  value,
  onChangeText,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [characterCount, setCharacterCount] = useState(value?.length || 0);

  const displayLabel = required && label ? `${label} *` : label;

  const handleChangeText = useCallback((text: string) => {
    setCharacterCount(text.length);
    onChangeText?.(text);
  }, [onChangeText]);

  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    props.onFocus?.(e);
  }, [props]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);
  }, [props]);

  return (
    <View style={[styles.container, containerStyle]}>
      {displayLabel && (
        <Text style={styles.label}>{displayLabel}</Text>
      )}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        <TextInput
          {...props}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline
          textAlignVertical="top"
          maxLength={maxLength}
          style={[
            styles.input,
            { minHeight },
            style,
          ]}
          placeholderTextColor={theme.colors.neutral[500]}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.leftFooter}>
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          {!error && helperText && (
            <Text style={styles.helperText}>{helperText}</Text>
          )}
        </View>

        {showCharacterCount && maxLength && (
          <Text
            style={[
              styles.characterCount,
              characterCount > maxLength * 0.9 && styles.characterCountWarning,
              characterCount >= maxLength && styles.characterCountError,
            ]}
          >
            {characterCount}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily?.medium,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary[500],
    shadowColor: theme.colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerError: {
    borderColor: theme.colors.error[500],
  },
  input: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.regular,
    lineHeight: 20,
    padding: 0, // Remove default padding
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  leftFooter: {
    flex: 1,
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error[500],
    fontFamily: theme.typography.fontFamily?.regular,
  },
  helperText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
  },
  characterCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500],
    fontFamily: theme.typography.fontFamily?.regular,
    marginLeft: theme.spacing.sm,
  },
  characterCountWarning: {
    color: theme.colors.warning[600],
  },
  characterCountError: {
    color: theme.colors.error[500],
  },
});
