import React from 'react';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import { ViewStyle, TextStyle } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '@/constants/theme';

interface ButtonProps extends Omit<PaperButtonProps, 'mode'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
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
        return 'min-height: 52px;';
      default:
        return 'min-height: 44px;';
    }
  }}
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  style,
  contentStyle,
  labelStyle,
  disabled,
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
    
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = theme.colors.primary[500];
        break;
      case 'secondary':
        baseStyle.backgroundColor = theme.colors.secondary[500];
        break;
      case 'danger':
        baseStyle.backgroundColor = theme.colors.error[500];
        break;
      case 'success':
        baseStyle.backgroundColor = theme.colors.success[500];
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderColor = theme.colors.primary[500];
        baseStyle.borderWidth = 2;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
    }
    
    return { ...baseStyle, ...(style as ViewStyle) };
  };

  const getContentStyle = (): ViewStyle => {
    const baseContentStyle: ViewStyle = {};
    
    switch (size) {
      case 'sm':
        baseContentStyle.paddingHorizontal = theme.spacing.sm;
        baseContentStyle.paddingVertical = theme.spacing.xs;
        break;
      case 'lg':
        baseContentStyle.paddingHorizontal = theme.spacing.xl;
        baseContentStyle.paddingVertical = theme.spacing.md;
        break;
      default:
        baseContentStyle.paddingHorizontal = theme.spacing.lg;
        baseContentStyle.paddingVertical = theme.spacing.sm;
        break;
    }
    
    return { ...baseContentStyle, ...(contentStyle as ViewStyle) };
  };

  const getLabelStyle = (): TextStyle => {
    const baseLabelStyle: TextStyle = {
      fontFamily: theme.typography.fontFamily?.medium,
      fontWeight: theme.typography.fontWeight.medium,
    };
    
    switch (size) {
      case 'sm':
        baseLabelStyle.fontSize = theme.typography.fontSize.sm;
        break;
      case 'lg':
        baseLabelStyle.fontSize = theme.typography.fontSize.lg;
        break;
      default:
        baseLabelStyle.fontSize = theme.typography.fontSize.base;
        break;
    }

    // Text color based on variant
    switch (variant) {
      case 'outline':
        baseLabelStyle.color = theme.colors.primary[600];
        break;
      case 'ghost':
        baseLabelStyle.color = theme.colors.primary[600];
        break;
      default:
        baseLabelStyle.color = theme.colors.white;
        break;
    }
    
    return { ...baseLabelStyle, ...(labelStyle as TextStyle) };
  };

  return (
    <StyledButton
      mode={getButtonMode()}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      style={getButtonStyle()}
      contentStyle={getContentStyle()}
      labelStyle={getLabelStyle()}
      loading={loading}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </StyledButton>
  );
};
