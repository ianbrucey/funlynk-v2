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

export const ProfileScreen: React.FC = () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: 'Member since March 2024',
    eventsAttended: 12,
    eventsCreated: 3,
    connections: 24,
  };

  const menuItems = [
    { id: '1', title: 'Edit Profile', icon: '✏️', action: 'edit' },
    { id: '2', title: 'My Events', icon: '📅', action: 'events' },
    { id: '3', title: 'Notifications', icon: '🔔', action: 'notifications' },
    { id: '4', title: 'Privacy Settings', icon: '🔒', action: 'privacy' },
    { id: '5', title: 'Help & Support', icon: '❓', action: 'help' },
    { id: '6', title: 'Settings', icon: '⚙️', action: 'settings' },
  ];

  const handleMenuPress = (action: string) => {
    console.log('Menu action:', action);
    // TODO: Navigate to appropriate screen
  };

  const handleLogout = () => {
    console.log('Logout pressed');
    // TODO: Implement logout logic
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {mockUser.name.split(' ').map(n => n.charAt(0)).join('')}
            </Text>
          </View>
          <Text style={styles.userName}>{mockUser.name}</Text>
          <Text style={styles.userEmail}>{mockUser.email}</Text>
          <Text style={styles.joinDate}>{mockUser.joinDate}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockUser.eventsAttended}</Text>
            <Text style={styles.statLabel}>Events Attended</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockUser.eventsCreated}</Text>
            <Text style={styles.statLabel}>Events Created</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockUser.connections}</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.action)}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>🏆</Text>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>Community Champion</Text>
              <Text style={styles.achievementDescription}>
                Attended 10+ community events
              </Text>
            </View>
          </View>
          <View style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>🌟</Text>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>Event Organizer</Text>
              <Text style={styles.achievementDescription}>
                Successfully organized your first event
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    ...theme.textStyles.title3,
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  userName: {
    ...theme.textStyles.title3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    ...theme.textStyles.subhead,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  joinDate: {
    ...theme.textStyles.caption1,
    color: theme.colors.textTertiary,
  },
  statsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...theme.textStyles.title3,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.textStyles.caption1,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.borderLight,
  },
  menuContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  menuTitle: {
    ...theme.textStyles.subhead,
    color: theme.colors.textPrimary,
  },
  menuArrow: {
    ...theme.textStyles.title2,
    color: theme.colors.textTertiary,
  },
  achievementsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.textStyles.headline,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  achievementCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    ...theme.textStyles.subhead,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  achievementDescription: {
    ...theme.textStyles.caption1,
    color: theme.colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: theme.touchTargets.minimum,
  },
  logoutButtonText: {
    ...theme.textStyles.headline,
    color: theme.colors.textOnPrimary,
  },
});

export default ProfileScreen;
