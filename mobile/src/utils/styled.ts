import styled from 'styled-components/native';
import { theme } from '@/constants/theme';

export const Container = styled.View<{ 
  padding?: keyof typeof theme.spacing;
  margin?: keyof typeof theme.spacing;
  backgroundColor?: string;
}>`
  flex: 1;
  background-color: ${({ backgroundColor, theme }) => backgroundColor || theme.colors.neutral[50]};
  padding: ${({ padding = 'md', theme }) => theme.spacing[padding]}px;
  ${({ margin, theme }) => margin && `margin: ${theme.spacing[margin]}px;`}
`;

export const Card = styled.View<{ 
  padding?: keyof typeof theme.spacing;
  margin?: keyof typeof theme.spacing;
  elevation?: keyof typeof theme.shadows;
}>`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ padding = 'md', theme }) => theme.spacing[padding]}px;
  ${({ margin, theme }) => margin && `margin: ${theme.spacing[margin]}px;`}
  ${({ elevation = 'md', theme }) => {
    const shadow = theme.shadows[elevation];
    return `
      shadow-color: ${shadow.shadowColor};
      shadow-offset: ${shadow.shadowOffset.width}px ${shadow.shadowOffset.height}px;
      shadow-opacity: ${shadow.shadowOpacity};
      shadow-radius: ${shadow.shadowRadius}px;
      elevation: ${shadow.elevation};
    `;
  }}
`;

export const Row = styled.View<{ 
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: keyof typeof theme.spacing;
  wrap?: boolean;
  flex?: number;
}>`
  flex-direction: row;
  justify-content: ${({ justify = 'flex-start' }) => justify};
  align-items: ${({ align = 'center' }) => align};
  ${({ gap = 'sm', theme }) => `gap: ${theme.spacing[gap]}px;`}
  ${({ wrap }) => wrap && 'flex-wrap: wrap;'}
  ${({ flex }) => flex && `flex: ${flex};`}
`;

export const Column = styled.View<{
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: keyof typeof theme.spacing;
  flex?: number;
}>`
  flex-direction: column;
  justify-content: ${({ justify = 'flex-start' }) => justify};
  align-items: ${({ align = 'flex-start' }) => align};
  ${({ gap = 'sm', theme }) => `gap: ${theme.spacing[gap]}px;`}
  ${({ flex }) => flex && `flex: ${flex};`}
`;

export const Spacer = styled.View<{
  size?: keyof typeof theme.spacing;
  horizontal?: boolean;
}>`
  ${({ size = 'md', horizontal, theme }) => 
    horizontal 
      ? `width: ${theme.spacing[size]}px;`
      : `height: ${theme.spacing[size]}px;`
  }
`;

export const Divider = styled.View<{
  color?: string;
  thickness?: number;
  margin?: keyof typeof theme.spacing;
}>`
  height: ${({ thickness = 1 }) => thickness}px;
  background-color: ${({ color, theme }) => color || theme.colors.neutral[200]};
  ${({ margin, theme }) => margin && `margin: ${theme.spacing[margin]}px 0;`}
`;

export const SafeContainer = styled.SafeAreaView<{
  backgroundColor?: string;
}>`
  flex: 1;
  background-color: ${({ backgroundColor, theme }) => backgroundColor || theme.colors.neutral[50]};
`;

export const ScrollContainer = styled.ScrollView<{
  padding?: keyof typeof theme.spacing;
  backgroundColor?: string;
}>`
  flex: 1;
  background-color: ${({ backgroundColor, theme }) => backgroundColor || theme.colors.neutral[50]};
  ${({ padding = 'md', theme }) => `padding: ${theme.spacing[padding]}px;`}
`;

export const CenterContainer = styled.View<{
  backgroundColor?: string;
  padding?: keyof typeof theme.spacing;
}>`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ backgroundColor, theme }) => backgroundColor || theme.colors.neutral[50]};
  ${({ padding, theme }) => padding && `padding: ${theme.spacing[padding]}px;`}
`;

export const TouchableContainer = styled.TouchableOpacity<{
  padding?: keyof typeof theme.spacing;
  margin?: keyof typeof theme.spacing;
  backgroundColor?: string;
  borderRadius?: keyof typeof theme.borderRadius;
  disabled?: boolean;
}>`
  ${({ padding, theme }) => padding && `padding: ${theme.spacing[padding]}px;`}
  ${({ margin, theme }) => margin && `margin: ${theme.spacing[margin]}px;`}
  ${({ backgroundColor, theme }) => backgroundColor && `background-color: ${backgroundColor};`}
  ${({ borderRadius, theme }) => borderRadius && `border-radius: ${theme.borderRadius[borderRadius]}px;`}
  ${({ disabled }) => disabled && 'opacity: 0.5;'}
`;
