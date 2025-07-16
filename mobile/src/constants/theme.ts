import { Platform } from 'react-native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Color Palette based on design system
export const colors = {
  // Primary Colors (Funlynk Blue)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Secondary Colors (Orange accent)
  secondary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Main secondary
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // Success Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning Colors
  warning: {
    50: '#fefce8',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error Colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Info Colors
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main info
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  // Neutral Colors
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Spark-specific colors
  spark: {
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7', // Main Spark primary
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
    },
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Main Spark accent
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
  },

  // Pure colors
  white: '#ffffff',
  black: '#000000',
};

// Spacing System
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border Radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Typography System
const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    semibold: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
});

export const typography = {
  fontFamily,
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Platform-specific typography styles
export const textStyles = {
  // Large title (iOS 11+ style)
  largeTitle: {
    fontSize: 34,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    fontFamily: fontFamily?.bold,
    lineHeight: 41,
  },
  
  // Title styles
  title1: {
    fontSize: 28,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily?.regular,
    lineHeight: 34,
  },
  
  title2: {
    fontSize: 22,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily?.regular,
    lineHeight: 28,
  },
  
  title3: {
    fontSize: 20,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily?.regular,
    lineHeight: 25,
  },
  
  // Headline
  headline: {
    fontSize: 17,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    fontFamily: fontFamily?.semibold,
    lineHeight: 22,
  },
  
  // Body text
  body: {
    fontSize: 17,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily?.regular,
    lineHeight: 22,
  },
  
  // Callout
  callout: {
    fontSize: 16,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily?.regular,
    lineHeight: 21,
  },
  
  // Subhead
  subhead: {
    fontSize: 15,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily?.regular,
    lineHeight: 20,
  },
  
  // Footnote
  footnote: {
    fontSize: 13,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily?.regular,
    lineHeight: 18,
  },
  
  // Caption
  caption1: {
    fontSize: 12,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily?.regular,
    lineHeight: 16,
  },
  
  caption2: {
    fontSize: 11,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily?.regular,
    lineHeight: 13,
  },
};

// Shadow System
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Touch Target Sizes
export const touchTargets = {
  minimum: Platform.OS === 'ios' ? 44 : 48,
  comfortable: Platform.OS === 'ios' ? 48 : 56,
};

// Animation Durations
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// React Native Paper theme integration
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary[500],
    primaryContainer: colors.primary[100],
    secondary: colors.secondary[500],
    secondaryContainer: colors.secondary[100],
    tertiary: colors.success[500],
    tertiaryContainer: colors.success[100],
    surface: colors.white,
    surfaceVariant: colors.neutral[50],
    background: colors.neutral[50],
    error: colors.error[500],
    errorContainer: colors.error[100],
    onPrimary: colors.white,
    onSecondary: colors.white,
    onTertiary: colors.white,
    onSurface: colors.neutral[900],
    onSurfaceVariant: colors.neutral[600],
    onBackground: colors.neutral[800],
    outline: colors.neutral[300],
    outlineVariant: colors.neutral[200],
    shadow: colors.black,
    scrim: colors.black,
    inverseSurface: colors.neutral[700],
    inverseOnSurface: colors.neutral[50],
    inversePrimary: colors.primary[200],
    // Custom colors
    success: colors.success[500],
    warning: colors.warning[500],
    info: colors.info[500],
    textPrimary: colors.neutral[800],
    textSecondary: colors.neutral[600],
    textTertiary: colors.neutral[400],
    border: colors.neutral[200],
    divider: colors.neutral[100],
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary[400],
    primaryContainer: colors.primary[700],
    secondary: colors.secondary[400],
    secondaryContainer: colors.secondary[700],
    tertiary: colors.success[400],
    tertiaryContainer: colors.success[700],
    surface: colors.neutral[800],
    surfaceVariant: colors.neutral[700],
    background: colors.neutral[900],
    error: colors.error[400],
    errorContainer: colors.error[700],
    onPrimary: colors.primary[900],
    onSecondary: colors.secondary[900],
    onTertiary: colors.success[900],
    onSurface: colors.neutral[50],
    onSurfaceVariant: colors.neutral[300],
    onBackground: colors.neutral[50],
    outline: colors.neutral[600],
    outlineVariant: colors.neutral[700],
    shadow: colors.black,
    scrim: colors.black,
    inverseSurface: colors.neutral[50],
    inverseOnSurface: colors.neutral[700],
    inversePrimary: colors.primary[700],
    // Custom colors
    success: colors.success[400],
    warning: colors.warning[400],
    info: colors.info[400],
    textPrimary: colors.neutral[50],
    textSecondary: colors.neutral[300],
    textTertiary: colors.neutral[400],
    border: colors.neutral[600],
    divider: colors.neutral[700],
  },
};

// Default theme object
export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  textStyles,
  shadows,
  touchTargets,
  animations,
  lightTheme,
  darkTheme,
};
