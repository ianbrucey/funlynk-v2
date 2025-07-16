import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { theme } from '@/constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Log to crash reporting service in production
    if (!__DEV__) {
      // TODO: Add crash reporting service
      // crashlytics().recordError(error);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.errorIcon}>💥</Text>
            <Text variant="h3" align="center" color="error">
              Oops! Something went wrong
            </Text>
            <Text variant="body" color="textSecondary" align="center">
              We're sorry for the inconvenience. Please try restarting the app or contact support if the problem persists.
            </Text>
            {__DEV__ && this.state.error && (
              <Text variant="caption" color="error" align="center">
                {this.state.error.message}
              </Text>
            )}
            <Button variant="primary" onPress={this.handleRetry}>
              Try Again
            </Button>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.neutral[50],
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
});
