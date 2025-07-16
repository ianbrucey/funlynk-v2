import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@/constants/theme';

export const SparkProgramsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>📚</Text>
          <Text style={styles.placeholderTitle}>Programs</Text>
          <Text style={styles.placeholderSubtitle}>
            Browse and manage educational programs
          </Text>
          <TouchableOpacity style={styles.placeholderButton}>
            <Text style={styles.placeholderButtonText}>Coming Soon</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  placeholderTitle: {
    ...theme.textStyles.title2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  placeholderSubtitle: {
    ...theme.textStyles.subhead,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  placeholderButton: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  placeholderButtonText: {
    ...theme.textStyles.headline,
    color: theme.colors.textOnSecondary,
  },
});

export default SparkProgramsScreen;
