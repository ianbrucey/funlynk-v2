import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '@/constants/theme';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'bodyLarge' | 'caption' | 'label' | 'overline';
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning' | 'info' | 'textPrimary' | 'textSecondary' | 'textTertiary' | 'white' | 'black';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

const StyledText = styled(RNText)<{
  $variant: TextProps['variant'];
  $color: TextProps['color'];
  $weight: TextProps['weight'];
  $align: TextProps['align'];
  $transform: TextProps['transform'];
}>`
  color: ${({ $color, theme }) => {
    switch ($color) {
      case 'primary':
        return theme.colors.primary[500];
      case 'secondary':
        return theme.colors.secondary[500];
      case 'tertiary':
        return theme.colors.success[500];
      case 'error':
        return theme.colors.error[500];
      case 'success':
        return theme.colors.success[500];
      case 'warning':
        return theme.colors.warning[500];
      case 'info':
        return theme.colors.info[500];
      case 'textSecondary':
        return theme.colors.neutral[600];
      case 'textTertiary':
        return theme.colors.neutral[400];
      case 'white':
        return theme.colors.white;
      case 'black':
        return theme.colors.black;
      default:
        return theme.colors.neutral[800];
    }
  }};
  
  font-size: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'h1':
        return theme.typography.fontSize['4xl'];
      case 'h2':
        return theme.typography.fontSize['3xl'];
      case 'h3':
        return theme.typography.fontSize['2xl'];
      case 'h4':
        return theme.typography.fontSize.xl;
      case 'h5':
        return theme.typography.fontSize.lg;
      case 'h6':
        return theme.typography.fontSize.md;
      case 'bodyLarge':
        return theme.typography.fontSize.lg;
      case 'caption':
        return theme.typography.fontSize.sm;
      case 'label':
        return theme.typography.fontSize.xs;
      case 'overline':
        return theme.typography.fontSize.xs;
      default:
        return theme.typography.fontSize.base;
    }
  }}px;
  
  font-weight: ${({ $weight, theme }) => {
    switch ($weight) {
      case 'medium':
        return theme.typography.fontWeight.medium;
      case 'semibold':
        return theme.typography.fontWeight.semibold;
      case 'bold':
        return theme.typography.fontWeight.bold;
      default:
        return theme.typography.fontWeight.normal;
    }
  }};
  
  font-family: ${({ $weight, theme }) => {
    switch ($weight) {
      case 'medium':
        return theme.typography.fontFamily?.medium;
      case 'semibold':
        return theme.typography.fontFamily?.semibold;
      case 'bold':
        return theme.typography.fontFamily?.bold;
      default:
        return theme.typography.fontFamily?.regular;
    }
  }};
  
  text-align: ${({ $align = 'left' }) => $align};
  
  text-transform: ${({ $transform = 'none' }) => $transform};
  
  line-height: ${({ $variant, theme }) => {
    const fontSize = (() => {
      switch ($variant) {
        case 'h1':
          return theme.typography.fontSize['4xl'];
        case 'h2':
          return theme.typography.fontSize['3xl'];
        case 'h3':
          return theme.typography.fontSize['2xl'];
        case 'h4':
          return theme.typography.fontSize.xl;
        case 'h5':
          return theme.typography.fontSize.lg;
        case 'h6':
          return theme.typography.fontSize.md;
        case 'bodyLarge':
          return theme.typography.fontSize.lg;
        case 'caption':
          return theme.typography.fontSize.sm;
        case 'label':
          return theme.typography.fontSize.xs;
        case 'overline':
          return theme.typography.fontSize.xs;
        default:
          return theme.typography.fontSize.base;
      }
    })();
    
    const lineHeightMultiplier = (() => {
      switch ($variant) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
          return theme.typography.lineHeight.tight;
        case 'caption':
        case 'label':
        case 'overline':
          return theme.typography.lineHeight.normal;
        default:
          return theme.typography.lineHeight.normal;
      }
    })();
    
    return fontSize * lineHeightMultiplier;
  }}px;
  
  ${({ $variant }) => $variant === 'overline' && 'letter-spacing: 0.5px;'}
`;

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'textPrimary',
  weight = 'normal',
  align = 'left',
  transform = 'none',
  children,
  ...props
}) => {
  return (
    <StyledText
      $variant={variant}
      $color={color}
      $weight={weight}
      $align={align}
      $transform={transform}
      {...props}
    >
      {children}
    </StyledText>
  );
};
