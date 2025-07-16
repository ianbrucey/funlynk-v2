import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  Animated,
} from 'react-native';
import { theme } from '@/constants/theme';

interface SearchInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  debounceMs?: number;
  showClearButton?: boolean;
  containerStyle?: any;
}

/**
 * SearchInput Component
 * 
 * Specialized input component for search functionality with debouncing,
 * clear button, and search-specific styling.
 * 
 * Features:
 * - Search icon and clear button
 * - Debounced input handling
 * - Animated focus states
 * - Accessibility support
 * - Customizable styling
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  onClear,
  onFocus,
  onBlur,
  debounceMs = 300,
  showClearButton = true,
  containerStyle,
  placeholder = 'Search...',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout>();
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced change handler
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (localValue !== value) {
        onChangeText(localValue);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localValue, value, onChangeText, debounceMs]);

  // Focus animation
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, animatedValue]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleChangeText = useCallback((text: string) => {
    setLocalValue(text);
  }, []);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChangeText('');
    onClear?.();
  }, [onChangeText, onClear]);

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.neutral[300], theme.colors.primary[500]],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.white, theme.colors.primary[50]],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor,
          backgroundColor,
        },
        containerStyle,
      ]}
    >
      {/* Search Icon */}
      <View style={styles.searchIcon}>
        <Animated.Text
          style={[
            styles.iconText,
            {
              color: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [theme.colors.neutral[500], theme.colors.primary[600]],
              }),
            },
          ]}
        >
          🔍
        </Animated.Text>
      </View>

      {/* Text Input */}
      <TextInput
        {...props}
        value={localValue}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.neutral[500]}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="never" // We'll handle this ourselves
      />

      {/* Clear Button */}
      {showClearButton && localValue.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Animated.Text
            style={[
              styles.clearButtonText,
              {
                color: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [theme.colors.neutral[500], theme.colors.primary[600]],
                }),
              },
            ]}
          >
            ×
          </Animated.Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  iconText: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.regular,
    padding: 0, // Remove default padding
  },
  clearButton: {
    marginLeft: theme.spacing.sm,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
});
