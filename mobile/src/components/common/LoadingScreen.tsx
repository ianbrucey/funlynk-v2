import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';

interface LoadingScreenProps {
  message?: string;
  error?: string;
  size?: 'small' | 'large';
  onRetry?: () => void;
}

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  padding: ${({ theme }) => theme.spacing.xl}px;
`;

const ContentContainer = styled(View)`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg}px;
  max-width: 300px;
`;

const ErrorIcon = styled(Text)`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  error,
  size = 'large',
  onRetry
}) => {
  return (
    <LoadingContainer>
      <ContentContainer>
        {error ? (
          <>
            <ErrorIcon>⚠️</ErrorIcon>
            <Text variant="h3" align="center" color="error">
              Oops! Something went wrong
            </Text>
            <Text variant="body" color="textSecondary" align="center">
              {error}
            </Text>
            {onRetry && (
              <Button variant="primary" onPress={onRetry}>
                Try Again
              </Button>
            )}
          </>
        ) : (
          <>
            <ActivityIndicator
              size={size}
              color={theme.colors.primary[500]}
            />
            <Text variant="body" color="textSecondary" align="center">
              {message}
            </Text>
          </>
        )}
      </ContentContainer>
    </LoadingContainer>
  );
};

export default LoadingScreen;
