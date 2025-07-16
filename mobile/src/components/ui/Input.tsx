import React, { useState } from 'react';
import { TextInput, TextInputProps, HelperText } from 'react-native-paper';
import { View, ViewStyle } from 'react-native';
import styled from 'styled-components/native';
import { Text } from './Text';
import { theme } from '@/constants/theme';

interface InputProps extends Omit<TextInputProps, 'mode'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  variant?: 'outlined' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  containerStyle?: ViewStyle;
}

const InputContainer = styled(View)<{ $fullWidth: boolean }>`
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}
`;

const StyledTextInput = styled(TextInput)<{ 
  $hasError: boolean;
  $size: InputProps['size'];
}>`
  background-color: ${({ theme }) => theme.colors.white};
  ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return 'min-height: 40px;';
      case 'lg':
        return 'min-height: 56px;';
      default:
        return 'min-height: 48px;';
    }
  }}
`;

const LabelContainer = styled(View)`
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required = false,
  variant = 'outlined',
  size = 'md',
  fullWidth = true,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const displayLabel = required && label ? `${label} *` : label;

  const getInputStyle = () => {
    const baseStyle: any = {};
    
    switch (size) {
      case 'sm':
        baseStyle.fontSize = theme.typography.fontSize.sm;
        break;
      case 'lg':
        baseStyle.fontSize = theme.typography.fontSize.lg;
        break;
      default:
        baseStyle.fontSize = theme.typography.fontSize.base;
        break;
    }
    
    return { ...baseStyle, ...(style as any) };
  };

  const getContentStyle = () => {
    const baseContentStyle: any = {};
    
    switch (size) {
      case 'sm':
        baseContentStyle.paddingHorizontal = theme.spacing.sm;
        baseContentStyle.paddingVertical = theme.spacing.xs;
        break;
      case 'lg':
        baseContentStyle.paddingHorizontal = theme.spacing.lg;
        baseContentStyle.paddingVertical = theme.spacing.md;
        break;
      default:
        baseContentStyle.paddingHorizontal = theme.spacing.md;
        baseContentStyle.paddingVertical = theme.spacing.sm;
        break;
    }
    
    return baseContentStyle;
  };

  return (
    <InputContainer $fullWidth={fullWidth} style={containerStyle}>
      {label && variant === 'flat' && (
        <LabelContainer>
          <Text 
            variant="label" 
            color={error ? 'error' : 'textSecondary'}
            weight="medium"
          >
            {displayLabel}
          </Text>
        </LabelContainer>
      )}
      
      <StyledTextInput
        label={variant === 'outlined' ? displayLabel : undefined}
        mode={variant}
        error={!!error}
        $hasError={!!error}
        $size={size}
        style={getInputStyle()}
        contentStyle={getContentStyle()}
        theme={{
          colors: {
            primary: theme.colors.primary[500],
            error: theme.colors.error[500],
            outline: error ? theme.colors.error[500] : theme.colors.neutral[300],
            onSurfaceVariant: theme.colors.neutral[600],
            onSurface: theme.colors.neutral[800],
            surface: theme.colors.white,
            surfaceVariant: theme.colors.neutral[50],
          },
        }}
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
        <HelperText 
          type={error ? 'error' : 'info'} 
          visible={true}
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: error ? theme.colors.error[500] : theme.colors.neutral[500],
          }}
        >
          {error || helperText}
        </HelperText>
      )}
    </InputContainer>
  );
};
