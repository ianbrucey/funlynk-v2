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

export const SparkDashboardScreen: React.FC = () => {
  const mockStats = {
    totalPrograms: 12,
    activeBookings: 8,
    totalStudents: 156,
    upcomingTrips: 3,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Spark</Text>
          <Text style={styles.welcomeSubtitle}>
            Manage your educational programs and field trips
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockStats.totalPrograms}</Text>
            <Text style={styles.statLabel}>Total Programs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockStats.activeBookings}</Text>
            <Text style={styles.statLabel}>Active Bookings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockStats.totalStudents}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockStats.upcomingTrips}</Text>
            <Text style={styles.statLabel}>Upcoming Trips</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📚</Text>
              <Text style={styles.actionTitle}>Browse Programs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionTitle}>New Booking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionTitle}>Manage Students</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>View Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>New booking for Science Museum</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Permission slip submitted</Text>
            <Text style={styles.activityTime}>4 hours ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Student roster updated</Text>
            <Text style={styles.activityTime}>1 day ago</Text>
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
  welcomeSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  welcomeTitle: {
    ...theme.textStyles.title2,
    color: theme.colors.secondary, // Use secondary color for Spark branding
    marginBottom: theme.spacing.sm,
  },
  welcomeSubtitle: {
    ...theme.textStyles.subhead,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    width: '48%',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  statNumber: {
    ...theme.textStyles.title2,
    color: theme.colors.secondary,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.textStyles.caption1,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    width: '48%',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  actionTitle: {
    ...theme.textStyles.caption1,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
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

export default SparkDashboardScreen;
