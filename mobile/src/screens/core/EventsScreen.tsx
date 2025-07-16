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

export const EventsScreen: React.FC = () => {
  const mockEvents = [
    {
      id: '1',
      title: 'Community Cleanup',
      date: 'Tomorrow at 9:00 AM',
      location: 'Central Park',
      attendees: 24,
    },
    {
      id: '2',
      title: 'Food Drive',
      date: 'Friday at 3:00 PM',
      location: 'Community Center',
      attendees: 12,
    },
    {
      id: '3',
      title: 'Book Club Meeting',
      date: 'Saturday at 2:00 PM',
      location: 'Library',
      attendees: 8,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Upcoming Events</Text>
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>+ Create</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventsContainer}>
          {mockEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventAttendees}>{event.attendees} going</Text>
              </View>
              <Text style={styles.eventDate}>{event.date}</Text>
              <Text style={styles.eventLocation}>📍 {event.location}</Text>
              
              <View style={styles.eventActions}>
                <TouchableOpacity style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>Join Event</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton}>
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <View style={styles.categoriesGrid}>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>🎨</Text>
              <Text style={styles.categoryTitle}>Arts & Culture</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>🏃‍♂️</Text>
              <Text style={styles.categoryTitle}>Sports & Fitness</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>🌱</Text>
              <Text style={styles.categoryTitle}>Environment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>🎓</Text>
              <Text style={styles.categoryTitle}>Education</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.textStyles.title3,
    color: theme.colors.textPrimary,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  createButtonText: {
    ...theme.textStyles.subhead,
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  eventsContainer: {
    marginBottom: theme.spacing.xl,
  },
  eventCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  eventTitle: {
    ...theme.textStyles.headline,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  eventAttendees: {
    ...theme.textStyles.caption1,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  eventDate: {
    ...theme.textStyles.subhead,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  eventLocation: {
    ...theme.textStyles.caption1,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  eventActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  joinButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    flex: 1,
    alignItems: 'center',
  },
  joinButtonText: {
    ...theme.textStyles.subhead,
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  shareButtonText: {
    ...theme.textStyles.subhead,
    color: theme.colors.textPrimary,
  },
  categoriesSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.textStyles.headline,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    width: '48%',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  categoryTitle: {
    ...theme.textStyles.caption1,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default EventsScreen;
