import React from 'react';
import { Avatar as PaperAvatar } from 'react-native-paper';
import { ViewStyle } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '@/constants/theme';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: number;
  variant?: 'circular' | 'rounded' | 'square';
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

const AvatarContainer = styled.View<{
  $size: number;
  $variant: AvatarProps['variant'];
  $backgroundColor?: string;
  $onPress?: boolean;
}>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size, $variant }) => {
    switch ($variant) {
      case 'square':
        return 0;
      case 'rounded':
        return Math.min($size * 0.2, 12);
      default:
        return $size / 2;
    }
  }}px;
  overflow: hidden;
  ${({ $backgroundColor }) => $backgroundColor && `background-color: ${$backgroundColor};`}
  ${({ $onPress }) => $onPress && 'opacity: 0.8;'}
`;

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 40,
  variant = 'circular',
  backgroundColor,
  textColor,
  style,
  onPress,
}) => {
  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = (): string => {
    if (backgroundColor) return backgroundColor;
    
    // Generate a consistent color based on name
    if (name) {
      const colors = [
        theme.colors.primary[500],
        theme.colors.secondary[500],
        theme.colors.success[500],
        theme.colors.warning[500],
        theme.colors.info[500],
        theme.colors.neutral[500],
      ];
      
      const hash = name.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      
      return colors[Math.abs(hash) % colors.length];
    }
    
    return theme.colors.neutral[400];
  };

  const getTextColor = (): string => {
    if (textColor) return textColor;
    return theme.colors.white;
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: variant === 'circular' ? size / 2 : variant === 'rounded' ? Math.min(size * 0.2, 12) : 0,
    ...style,
  };

  const renderAvatar = () => {
    if (source) {
      return (
        <PaperAvatar.Image
          source={{ uri: source }}
          size={size}
          style={avatarStyle}
        />
      );
    }

    if (name) {
      const initials = getInitials(name);
      return (
        <PaperAvatar.Text
          label={initials}
          size={size}
          style={{
            ...avatarStyle,
            backgroundColor: getBackgroundColor(),
          }}
          labelStyle={{
            color: getTextColor(),
            fontSize: size * 0.4,
            fontWeight: theme.typography.fontWeight.medium,
            fontFamily: theme.typography.fontFamily?.medium,
          }}
        />
      );
    }

    return (
      <PaperAvatar.Icon
        icon="account"
        size={size}
        style={{
          ...avatarStyle,
          backgroundColor: getBackgroundColor(),
        }}
        color={getTextColor()}
      />
    );
  };

  if (onPress) {
    return (
      <AvatarContainer
        as="TouchableOpacity"
        $size={size}
        $variant={variant}
        $backgroundColor={backgroundColor}
        $onPress={true}
        onPress={onPress}
        style={style}
      >
        {renderAvatar()}
      </AvatarContainer>
    );
  }

  return renderAvatar();
};
