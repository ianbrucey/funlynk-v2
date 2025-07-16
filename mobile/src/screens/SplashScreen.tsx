import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/constants/theme';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      // For now, navigate to Auth - later this will check auth state
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Funlynk</Text>
      <Text style={styles.subtitle}>Connecting Communities</Text>
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary} 
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  title: {
    ...theme.textStyles.largeTitle,
    color: theme.colors.textOnPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.textStyles.subhead,
    color: theme.colors.textOnPrimary,
    opacity: 0.8,
    marginBottom: theme.spacing.xl,
  },
  loader: {
    marginTop: theme.spacing.lg,
  },
});

export default SplashScreen;
