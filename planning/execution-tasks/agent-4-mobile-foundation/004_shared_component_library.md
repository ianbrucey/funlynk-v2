# Task 004: Shared Component Library
**Agent**: Mobile Foundation Developer  
**Estimated Time**: 5-6 hours  
**Priority**: High  
**Dependencies**: Task 003 (State Management Setup)  

## Overview
Create a comprehensive shared component library with design system implementation, reusable UI components, form components, and utility components for both Core and Spark applications.

## Prerequisites
- Task 003 completed successfully
- State management configured
- UI libraries (React Native Paper, Vector Icons) installed

## Step-by-Step Implementation

### Step 1: Create Design System Foundation (75 minutes)

**Create theme configuration (src/constants/theme.ts):**
```typescript
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366F1', // Indigo
    primaryContainer: '#E0E7FF',
    secondary: '#EC4899', // Pink
    secondaryContainer: '#FCE7F3',
    tertiary: '#10B981', // Emerald
    tertiaryContainer: '#D1FAE5',
    surface: '#FFFFFF',
    surfaceVariant: '#F8FAFC',
    background: '#FAFAFA',
    error: '#EF4444',
    errorContainer: '#FEE2E2',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: '#1F2937',
    onSurfaceVariant: '#6B7280',
    onBackground: '#111827',
    outline: '#D1D5DB',
    outlineVariant: '#E5E7EB',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#374151',
    inverseOnSurface: '#F9FAFB',
    inversePrimary: '#A5B4FC',
    // Custom colors
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    divider: '#F3F4F6',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818CF8',
    primaryContainer: '#4338CA',
    secondary: '#F472B6',
    secondaryContainer: '#BE185D',
    tertiary: '#34D399',
    tertiaryContainer: '#047857',
    surface: '#1F2937',
    surfaceVariant: '#374151',
    background: '#111827',
    error: '#F87171',
    errorContainer: '#DC2626',
    onPrimary: '#1E1B4B',
    onSecondary: '#831843',
    onTertiary: '#064E3B',
    onSurface: '#F9FAFB',
    onSurfaceVariant: '#D1D5DB',
    onBackground: '#F9FAFB',
    outline: '#6B7280',
    outlineVariant: '#4B5563',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#F9FAFB',
    inverseOnSurface: '#374151',
    inversePrimary: '#4338CA',
    // Custom colors
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    border: '#4B5563',
    divider: '#374151',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
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
};

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
};

export const theme = lightTheme;
```

**Create styled components utilities (src/utils/styled.ts):**
```typescript
import styled from 'styled-components/native';
import { theme } from '@/constants/theme';

export const Container = styled.View<{ padding?: keyof typeof theme.spacing }>`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ padding = 'md', theme }) => theme.spacing[padding]}px;
`;

export const Card = styled.View<{ padding?: keyof typeof theme.spacing }>`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ padding = 'md', theme }) => theme.spacing[padding]}px;
  shadow-color: ${({ theme }) => theme.shadows.md.shadowColor};
  shadow-offset: ${({ theme }) => `${theme.shadows.md.shadowOffset.width}px ${theme.shadows.md.shadowOffset.height}px`};
  shadow-opacity: ${({ theme }) => theme.shadows.md.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.md.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.md.elevation};
`;

export const Row = styled.View<{ 
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: keyof typeof theme.spacing;
}>`
  flex-direction: row;
  justify-content: ${({ justify = 'flex-start' }) => justify};
  align-items: ${({ align = 'center' }) => align};
  gap: ${({ gap = 'sm', theme }) => theme.spacing[gap]}px;
`;

export const Column = styled.View<{
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: keyof typeof theme.spacing;
}>`
  flex-direction: column;
  justify-content: ${({ justify = 'flex-start' }) => justify};
  align-items: ${({ align = 'flex-start' }) => align};
  gap: ${({ gap = 'sm', theme }) => theme.spacing[gap]}px;
`;
```

### Step 2: Create Basic UI Components (90 minutes)

**Create Button component (src/components/ui/Button.tsx):**
```typescript
import React from 'react';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import { ViewStyle } from 'react-native';
import styled from 'styled-components/native';

interface ButtonProps extends Omit<PaperButtonProps, 'mode'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const StyledButton = styled(PaperButton)<{ 
  $variant: ButtonProps['variant'];
  $size: ButtonProps['size'];
  $fullWidth: boolean;
}>`
  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}
  ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return 'min-height: 36px;';
      case 'lg':
        return 'min-height: 48px;';
      default:
        return 'min-height: 40px;';
    }
  }}
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  style,
  ...props
}) => {
  const getButtonMode = (): PaperButtonProps['mode'] => {
    switch (variant) {
      case 'outline':
        return 'outlined';
      case 'ghost':
        return 'text';
      default:
        return 'contained';
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {};
    
    if (variant === 'danger') {
      baseStyle.backgroundColor = '#EF4444';
    }
    
    return { ...baseStyle, ...(style as ViewStyle) };
  };

  return (
    <StyledButton
      mode={getButtonMode()}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      style={getButtonStyle()}
      {...props}
    >
      {children}
    </StyledButton>
  );
};
```

**Create Text component (src/components/ui/Text.tsx):**
```typescript
import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '@/constants/theme';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning';
  weight?: 'regular' | 'medium' | 'bold';
  align?: 'left' | 'center' | 'right';
}

const StyledText = styled(RNText)<{
  $variant: TextProps['variant'];
  $color: TextProps['color'];
  $weight: TextProps['weight'];
  $align: TextProps['align'];
}>`
  color: ${({ $color, theme }) => {
    switch ($color) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.textSecondary;
      case 'tertiary':
        return theme.colors.textTertiary;
      case 'error':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.textPrimary;
    }
  }};
  
  font-size: ${({ $variant }) => {
    switch ($variant) {
      case 'h1':
        return theme.typography.fontSize['4xl'];
      case 'h2':
        return theme.typography.fontSize['3xl'];
      case 'h3':
        return theme.typography.fontSize['2xl'];
      case 'h4':
        return theme.typography.fontSize.xl;
      case 'caption':
        return theme.typography.fontSize.sm;
      case 'label':
        return theme.typography.fontSize.xs;
      default:
        return theme.typography.fontSize.base;
    }
  }}px;
  
  font-weight: ${({ $weight }) => {
    switch ($weight) {
      case 'medium':
        return '500';
      case 'bold':
        return '700';
      default:
        return '400';
    }
  }};
  
  text-align: ${({ $align = 'left' }) => $align};
  
  line-height: ${({ $variant }) => {
    switch ($variant) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
        return theme.typography.lineHeight.tight;
      case 'caption':
      case 'label':
        return theme.typography.lineHeight.normal;
      default:
        return theme.typography.lineHeight.normal;
    }
  }};
`;

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  weight = 'regular',
  align = 'left',
  children,
  ...props
}) => {
  return (
    <StyledText
      $variant={variant}
      $color={color}
      $weight={weight}
      $align={align}
      {...props}
    >
      {children}
    </StyledText>
  );
};
```

**Create Input component (src/components/ui/Input.tsx):**
```typescript
import React, { useState } from 'react';
import { TextInput, TextInputProps, HelperText } from 'react-native-paper';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { Text } from './Text';

interface InputProps extends Omit<TextInputProps, 'mode'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  variant?: 'outlined' | 'flat';
}

const InputContainer = styled(View)`
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const StyledTextInput = styled(TextInput)<{ $hasError: boolean }>`
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required = false,
  variant = 'outlined',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const displayLabel = required && label ? `${label} *` : label;

  return (
    <InputContainer>
      <StyledTextInput
        label={displayLabel}
        mode={variant}
        error={!!error}
        $hasError={!!error}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {(error || helperText) && (
        <HelperText type={error ? 'error' : 'info'} visible={true}>
          {error || helperText}
        </HelperText>
      )}
    </InputContainer>
  );
};
```

### Step 3: Create Form Components (60 minutes)

**Create Form component (src/components/forms/Form.tsx):**
```typescript
import React from 'react';
import { useForm, FormProvider, UseFormProps, FieldValues } from 'react-hook-form';
import { View, ViewProps } from 'react-native';
import styled from 'styled-components/native';

interface FormProps<T extends FieldValues> extends ViewProps {
  children: React.ReactNode;
  onSubmit: (data: T) => void | Promise<void>;
  formOptions?: UseFormProps<T>;
}

const FormContainer = styled(View)`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export function Form<T extends FieldValues>({
  children,
  onSubmit,
  formOptions,
  ...props
}: FormProps<T>) {
  const methods = useForm<T>(formOptions);

  return (
    <FormProvider {...methods}>
      <FormContainer {...props}>
        {children}
      </FormContainer>
    </FormProvider>
  );
}
```

**Create FormInput component (src/components/forms/FormInput.tsx):**
```typescript
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { TextInputProps } from 'react-native-paper';

interface FormInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  name: string;
  rules?: any;
  defaultValue?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  rules,
  defaultValue = '',
  ...props
}) => {
  const { control } = useFormContext();
  const {
    field: { onChange, onBlur, value },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
  });

  return (
    <Input
      value={value}
      onChangeText={onChange}
      onBlur={onBlur}
      error={error?.message}
      {...props}
    />
  );
};
```

### Step 4: Create Common Components (75 minutes)

**Create LoadingScreen component (src/components/common/LoadingScreen.tsx):**
```typescript
import React from 'react';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import styled from 'styled-components/native';
import { Text } from '@/components/ui/Text';

interface LoadingScreenProps {
  message?: string;
  size?: 'small' | 'large';
}

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  size = 'large',
}) => {
  return (
    <LoadingContainer>
      <ActivityIndicator size={size} />
      <Text variant="body" color="secondary">
        {message}
      </Text>
    </LoadingContainer>
  );
};
```

**Create ErrorBoundary component (src/components/common/ErrorBoundary.tsx):**
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const ErrorContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <Text variant="h3" align="center">
            Oops! Something went wrong
          </Text>
          <Text variant="body" color="secondary" align="center">
            We're sorry for the inconvenience. Please try again.
          </Text>
          {__DEV__ && this.state.error && (
            <Text variant="caption" color="error" align="center">
              {this.state.error.message}
            </Text>
          )}
          <Button variant="primary" onPress={this.handleRetry}>
            Try Again
          </Button>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}
```

**Create Toast component (src/components/common/Toast.tsx):**
```typescript
import React, { useEffect } from 'react';
import { Snackbar } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '@/store';
import { hideToast } from '@/store/slices/uiSlice';

export const Toast: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.ui.toast);

  useEffect(() => {
    if (toast?.visible) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [toast?.visible, dispatch]);

  if (!toast?.visible) {
    return null;
  }

  return (
    <Snackbar
      visible={toast.visible}
      onDismiss={() => dispatch(hideToast())}
      duration={4000}
      style={{
        backgroundColor: 
          toast.type === 'error' ? '#EF4444' :
          toast.type === 'success' ? '#10B981' :
          toast.type === 'warning' ? '#F59E0B' :
          '#3B82F6',
      }}
    >
      {toast.message}
    </Snackbar>
  );
};
```

**Create Avatar component (src/components/ui/Avatar.tsx):**
```typescript
import React from 'react';
import { Avatar as PaperAvatar } from 'react-native-paper';
import { ViewStyle } from 'react-native';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 40,
  style,
}) => {
  if (source) {
    return (
      <PaperAvatar.Image
        source={{ uri: source }}
        size={size}
        style={style}
      />
    );
  }

  if (name) {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <PaperAvatar.Text
        label={initials}
        size={size}
        style={style}
      />
    );
  }

  return (
    <PaperAvatar.Icon
      icon="account"
      size={size}
      style={style}
    />
  );
};
```

### Step 5: Create Component Index and Theme Provider (30 minutes)

**Create component index (src/components/index.ts):**
```typescript
// UI Components
export { Button } from './ui/Button';
export { Text } from './ui/Text';
export { Input } from './ui/Input';
export { Avatar } from './ui/Avatar';

// Form Components
export { Form } from './forms/Form';
export { FormInput } from './forms/FormInput';

// Common Components
export { LoadingScreen } from './common/LoadingScreen';
export { ErrorBoundary } from './common/ErrorBoundary';
export { Toast } from './common/Toast';

// Styled Components
export { Container, Card, Row, Column } from '@/utils/styled';
```

**Create Theme Provider (src/components/providers/ThemeProvider.tsx):**
```typescript
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { useAppSelector } from '@/store';
import { lightTheme, darkTheme } from '@/constants/theme';
import { useColorScheme } from 'react-native';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themePreference = useAppSelector((state) => state.ui.theme);
  const systemColorScheme = useColorScheme();

  const getTheme = () => {
    if (themePreference === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themePreference === 'dark' ? darkTheme : lightTheme;
  };

  const theme = getTheme();

  return (
    <PaperProvider theme={theme}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </PaperProvider>
  );
};
```

**Update App.tsx to use providers:**
```typescript
import React from 'react';
import { StatusBar } from 'react-native';
import { StoreProvider } from '@/store/StoreProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Toast } from '@/components/common/Toast';
import { RootNavigator } from '@/navigation/RootNavigator';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <ThemeProvider>
          <StatusBar barStyle="dark-content" />
          <RootNavigator />
          <Toast />
        </ThemeProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
};

export default App;
```

## Acceptance Criteria

### Design System
- [ ] Complete theme configuration with light and dark modes
- [ ] Typography system with consistent font sizes and weights
- [ ] Color palette with semantic color naming
- [ ] Spacing and layout utilities
- [ ] Shadow and border radius definitions

### UI Components
- [ ] Button component with multiple variants and sizes
- [ ] Text component with typography variants
- [ ] Input component with validation and error states
- [ ] Avatar component with image, initials, and icon fallbacks
- [ ] Consistent styling across all components

### Form Components
- [ ] Form wrapper with react-hook-form integration
- [ ] FormInput with automatic validation display
- [ ] Type-safe form handling
- [ ] Reusable form patterns

### Common Components
- [ ] LoadingScreen with customizable messages
- [ ] ErrorBoundary with retry functionality
- [ ] Toast notification system
- [ ] Theme provider with system theme detection

### Integration
- [ ] All components work with Redux state management
- [ ] Theme switching functionality
- [ ] TypeScript support for all components
- [ ] Styled-components integration

## Testing Instructions

### Component Testing
```bash
# Test component compilation
npx tsc --noEmit

# Test theme switching
# Change theme in app settings and verify all components update

# Test form validation
# Create test form and verify validation works
```

### Manual Testing
- [ ] Test all UI components in both light and dark themes
- [ ] Test form components with validation
- [ ] Test error boundary by throwing test errors
- [ ] Test toast notifications with different types
- [ ] Test loading screens and states

## Next Steps
After completion:
- Agents 5, 6, 7 can use these components for screen development
- Create component documentation and Storybook
- Add accessibility features to components
- Create component testing suite

## Documentation
- Document component API and usage examples
- Create design system documentation
- Document theme customization process
- Create component testing guidelines
