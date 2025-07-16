import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { theme } from '@/constants/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
  testID?: string;
}

/**
 * LoadingSpinner Component
 * 
 * Customizable loading spinner with optional message and overlay.
 * Provides consistent loading states across the app.
 * 
 * Features:
 * - Multiple sizes (small, medium, large)
 * - Customizable color
 * - Optional loading message
 * - Overlay mode for full-screen loading
 * - Smooth rotation animation
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = theme.colors.primary[600],
  message,
  overlay = false,
  testID,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spinAnimation.start();

    return () => {
      spinAnimation.stop();
    };
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 40;
      default:
        return 30;
    }
  };

  const getMessageStyle = () => {
    switch (size) {
      case 'small':
        return styles.messageSmall;
      case 'large':
        return styles.messageLarge;
      default:
        return styles.messageMedium;
    }
  };

  const spinnerSize = getSpinnerSize();

  const renderSpinner = () => (
    <View style={styles.container} testID={testID}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderColor: `${color}20`,
            borderTopColor: color,
            transform: [{ rotate: spin }],
          },
        ]}
      />
      {message && (
        <Text style={[styles.message, getMessageStyle()]}>
          {message}
        </Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>
          {renderSpinner()}
        </View>
      </View>
    );
  }

  return renderSpinner();
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderWidth: 2,
    borderRadius: 50,
    borderStyle: 'solid',
  },
  message: {
    textAlign: 'center',
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
    marginTop: theme.spacing.sm,
  },
  messageSmall: {
    fontSize: theme.typography.fontSize.sm,
  },
  messageMedium: {
    fontSize: theme.typography.fontSize.base,
  },
  messageLarge: {
    fontSize: theme.typography.fontSize.lg,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 120,
  },
});
