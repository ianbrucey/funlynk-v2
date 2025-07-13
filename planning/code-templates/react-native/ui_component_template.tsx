import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Design system
import { colors } from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

/**
 * {COMPONENT_NAME} Component
 * 
 * {DESCRIPTION}
 * 
 * Features:
 * - {FEATURE_1}
 * - {FEATURE_2}
 * - {FEATURE_3}
 * 
 * @example
 * ```tsx
 * <{COMPONENT_NAME}
 *   title="Example Title"
 *   onPress={() => console.log('Pressed')}
 *   variant="primary"
 *   size="medium"
 * />
 * ```
 */

// ========================================
// TYPES
// ========================================

export interface {COMPONENT_NAME}Props {
  // Content props
  title?: string;
  subtitle?: string;
  description?: string;
  
  // Appearance props
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  
  // Icon props
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  
  // Interaction props
  onPress?: () => void;
  onLongPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  
  // Style props
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  contentStyle?: ViewStyle;
  
  // Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  testID?: string;
  
  // Animation props
  animatePress?: boolean;
  animationDuration?: number;
  
  // Custom props (add based on component needs)
  badge?: number | string;
  showBorder?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

// ========================================
// COMPONENT
// ========================================

export const {COMPONENT_NAME}: React.FC<{COMPONENT_NAME}Props> = ({
  // Content
  title,
  subtitle,
  description,
  
  // Appearance
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  
  // Icons
  leftIcon,
  rightIcon,
  iconColor,
  
  // Interactions
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  
  // Styles
  style,
  titleStyle,
  subtitleStyle,
  contentStyle,
  
  // Accessibility
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  testID,
  
  // Animation
  animatePress = true,
  animationDuration = 150,
  
  // Custom
  badge,
  showBorder = false,
  fullWidth = false,
  children,
}) => {
  // ========================================
  // STATE & REFS
  // ========================================
  
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    if (disabled) {
      Animated.timing(opacityAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [disabled]);

  // ========================================
  // HANDLERS
  // ========================================

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    onPressIn?.();
    
    if (animatePress) {
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
    onPressOut?.();
    
    if (animatePress) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (disabled || loading) return;
    onPress?.();
  };

  const handleLongPress = () => {
    if (disabled || loading) return;
    onLongPress?.();
  };

  // ========================================
  // COMPUTED STYLES
  // ========================================

  const containerStyle = [
    styles.container,
    styles[`container_${variant}`],
    styles[`container_${size}`],
    fullWidth && styles.fullWidth,
    showBorder && styles.bordered,
    disabled && styles.disabled,
    isPressed && styles.pressed,
    style,
  ];

  const contentContainerStyle = [
    styles.content,
    styles[`content_${size}`],
    contentStyle,
  ];

  const titleTextStyle = [
    styles.title,
    styles[`title_${variant}`],
    styles[`title_${size}`],
    titleStyle,
  ];

  const subtitleTextStyle = [
    styles.subtitle,
    styles[`subtitle_${size}`],
    subtitleStyle,
  ];

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const finalIconColor = iconColor || getIconColor(variant);

  // ========================================
  // RENDER HELPERS
  // ========================================

  const renderLeftIcon = () => {
    if (!leftIcon) return null;
    
    return (
      <View style={styles.leftIconContainer}>
        <Ionicons 
          name={leftIcon} 
          size={iconSize} 
          color={finalIconColor} 
        />
      </View>
    );
  };

  const renderRightIcon = () => {
    if (!rightIcon) return null;
    
    return (
      <View style={styles.rightIconContainer}>
        <Ionicons 
          name={rightIcon} 
          size={iconSize} 
          color={finalIconColor} 
        />
      </View>
    );
  };

  const renderBadge = () => {
    if (!badge) return null;
    
    return (
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </Text>
      </View>
    );
  };

  const renderContent = () => {
    if (children) {
      return children;
    }

    return (
      <View style={contentContainerStyle}>
        {renderLeftIcon()}
        
        <View style={styles.textContainer}>
          {title && (
            <Text style={titleTextStyle} numberOfLines={2}>
              {title}
            </Text>
          )}
          
          {subtitle && (
            <Text style={subtitleTextStyle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
          
          {description && (
            <Text style={styles.description} numberOfLines={3}>
              {description}
            </Text>
          )}
        </View>
        
        {renderRightIcon()}
        {renderBadge()}
      </View>
    );
  };

  const renderLoadingState = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.loadingOverlay}>
        <Animated.View style={styles.loadingSpinner}>
          {/* Add your loading spinner component here */}
          <Text style={styles.loadingText}>Loading...</Text>
        </Animated.View>
      </View>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================

  const TouchableComponent = Platform.OS === 'ios' ? Pressable : TouchableOpacity;

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      <TouchableComponent
        style={containerStyle}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessible={true}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={{
          disabled: disabled || loading,
          busy: loading,
        }}
        testID={testID}
        android_ripple={{
          color: getRippleColor(variant),
          borderless: false,
        }}
      >
        {renderContent()}
        {renderLoadingState()}
      </TouchableComponent>
    </Animated.View>
  );
};

// ========================================
// HELPER FUNCTIONS
// ========================================

const getIconColor = (variant: string): string => {
  switch (variant) {
    case 'primary':
      return colors.white;
    case 'secondary':
      return colors.primary[600];
    case 'tertiary':
      return colors.primary[600];
    case 'danger':
      return colors.white;
    case 'success':
      return colors.white;
    default:
      return colors.neutral[600];
  }
};

const getRippleColor = (variant: string): string => {
  switch (variant) {
    case 'primary':
      return colors.primary[700];
    case 'secondary':
      return colors.primary[100];
    case 'tertiary':
      return colors.primary[100];
    case 'danger':
      return colors.error[700];
    case 'success':
      return colors.success[700];
    default:
      return colors.neutral[200];
  }
};

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  // Base container styles
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  
  // Variant styles
  container_primary: {
    backgroundColor: colors.primary[500],
  },
  container_secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  container_tertiary: {
    backgroundColor: 'transparent',
  },
  container_danger: {
    backgroundColor: colors.error[500],
  },
  container_success: {
    backgroundColor: colors.success[500],
  },
  
  // Size styles
  container_small: {
    minHeight: 36,
  },
  container_medium: {
    minHeight: 44,
  },
  container_large: {
    minHeight: 52,
  },
  
  // State styles
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  fullWidth: {
    width: '100%',
  },
  
  // Content styles
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content_small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  content_medium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  content_large: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  
  // Text container
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
  
  // Title styles
  title: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  title_primary: {
    color: colors.white,
  },
  title_secondary: {
    color: colors.primary[600],
  },
  title_tertiary: {
    color: colors.primary[600],
  },
  title_danger: {
    color: colors.white,
  },
  title_success: {
    color: colors.white,
  },
  title_small: {
    fontSize: typography.fontSize.sm,
  },
  title_medium: {
    fontSize: typography.fontSize.base,
  },
  title_large: {
    fontSize: typography.fontSize.lg,
  },
  
  // Subtitle styles
  subtitle: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: typography.fontWeight.normal,
    color: colors.neutral[500],
    marginTop: 2,
    textAlign: 'center',
  },
  subtitle_small: {
    fontSize: typography.fontSize.xs,
  },
  subtitle_medium: {
    fontSize: typography.fontSize.sm,
  },
  subtitle_large: {
    fontSize: typography.fontSize.base,
  },
  
  // Description styles
  description: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    color: colors.neutral[600],
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Icon styles
  leftIconContainer: {
    marginRight: spacing.sm,
  },
  rightIconContainer: {
    marginLeft: spacing.sm,
  },
  
  // Badge styles
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  
  // Loading styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: typography.fontSize.sm,
    color: colors.neutral[600],
  },
});

/*
USAGE INSTRUCTIONS:

1. Replace placeholders:
   - {COMPONENT_NAME}: Component name (e.g., Button, Card, ListItem)
   - {DESCRIPTION}: Component description
   - {FEATURE_1}, {FEATURE_2}, etc.: Key features

2. Customize props interface based on component needs

3. Update variant styles to match your design system

4. Add component-specific logic and interactions

5. Update accessibility properties as needed

6. Add any additional animations or effects

EXAMPLE USAGE:
- Button component with variants and sizes
- Card component with content and actions
- ListItem component with icons and badges

COMMON CUSTOMIZATIONS:
- Add haptic feedback
- Add sound effects
- Add custom animations
- Add gesture handling
- Add theme support
- Add RTL support
*/
