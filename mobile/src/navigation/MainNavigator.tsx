import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { useAppSelector } from '@/store';

import CoreNavigator from './CoreNavigator';
import SparkNavigator from './SparkNavigator';

export const MainNavigator: React.FC = () => {
  // Get user role from Redux state
  const userRole = useAppSelector((state) => state.auth.user?.role);

  // Route to appropriate app based on user role
  switch (userRole) {
    case 'teacher':
    case 'school_admin':
    case 'district_admin':
      return <SparkNavigator />;
    case 'user':
    case 'parent':
    default:
      return <CoreNavigator />;
  }
};

// Fallback component for unknown roles
const UnknownRoleScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Unknown User Role</Text>
    <Text style={styles.subtitle}>
      Please contact support to resolve this issue.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.textStyles.title2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.textStyles.subhead,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default MainNavigator;
