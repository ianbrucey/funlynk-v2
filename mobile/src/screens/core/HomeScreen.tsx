import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/constants/theme';
import { CoreTabScreenProps } from '@/types/navigation';

type HomeScreenProps = CoreTabScreenProps<'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();

  const handleCreateEvent = () => {
    // TODO: Navigate to create event screen
    console.log('Create event pressed');
  };

  const handleViewAllEvents = () => {
    navigation.navigate('Events');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.subtitle}>What's happening today?</Text>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={handleCreateEvent}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>+</Text>
              </View>
              <Text style={styles.actionTitle}>Create Event</Text>
              <Text style={styles.actionSubtitle}>Start something new</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleViewAllEvents}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>📅</Text>
              </View>
              <Text style={styles.actionTitle}>Browse Events</Text>
              <Text style={styles.actionSubtitle}>Find activities</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.upcomingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={handleViewAllEvents}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>Sample Event</Text>
            <Text style={styles.eventDate}>Tomorrow at 2:00 PM</Text>
            <Text style={styles.eventLocation}>Community Center</Text>
          </View>

          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>Another Event</Text>
            <Text style={styles.eventDate}>Friday at 6:00 PM</Text>
            <Text style={styles.eventLocation}>Local Park</Text>
          </View>
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>You joined "Community Cleanup"</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>New message from John</Text>
            <Text style={styles.activityTime}>5 hours ago</Text>
          </View>
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
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    ...theme.textStyles.title2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.textStyles.subhead,
    color: theme.colors.textSecondary,
  },
  quickActions: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.textStyles.headline,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    width: '48%',
    ...theme.shadows.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  actionIconText: {
    fontSize: 24,
    color: theme.colors.textOnPrimary,
  },
  actionTitle: {
    ...theme.textStyles.subhead,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  actionSubtitle: {
    ...theme.textStyles.caption1,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  upcomingSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  seeAllText: {
    ...theme.textStyles.subhead,
    color: theme.colors.primary,
  },
  eventCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  eventTitle: {
    ...theme.textStyles.subhead,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  eventDate: {
    ...theme.textStyles.caption1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  eventLocation: {
    ...theme.textStyles.caption1,
    color: theme.colors.textSecondary,
  },
  recentActivity: {
    marginBottom: theme.spacing.xl,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  activityText: {
    ...theme.textStyles.subhead,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  activityTime: {
    ...theme.textStyles.caption1,
    color: theme.colors.textSecondary,
  },
});

export default HomeScreen;
