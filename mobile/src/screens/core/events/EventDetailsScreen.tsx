import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { 
  useGetEventQuery, 
  useRsvpToEventMutation, 
  useGetEventAttendeesQuery 
} from '@/store/api/coreApi';
import type { EventsStackParamList } from '@/types/navigation';
import type { RouteProp } from '@react-navigation/native';

type EventDetailsScreenRouteProp = RouteProp<EventsStackParamList, 'EventDetails'>;

interface EventDetailsScreenProps {}

export const EventDetailsScreen: React.FC<EventDetailsScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute<EventDetailsScreenRouteProp>();
  const { eventId } = route.params;

  // State
  const [userRSVPStatus, setUserRSVPStatus] = useState<'going' | 'maybe' | 'not_going' | null>(null);

  // API Queries
  const {
    data: event,
    isLoading: eventLoading,
    isError: eventError,
    refetch: refetchEvent,
  } = useGetEventQuery(eventId);

  const {
    data: attendeesData,
    isLoading: attendeesLoading,
  } = useGetEventAttendeesQuery({ eventId, page: 1, limit: 10 });

  const [rsvpToEvent, { isLoading: rsvpLoading }] = useRsvpToEventMutation();

  // Format date for display
  const formatEventDate = useCallback((startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    const dateStr = start.toLocaleDateString([], dateOptions);
    const startTimeStr = start.toLocaleTimeString([], timeOptions);
    const endTimeStr = end.toLocaleTimeString([], timeOptions);

    return {
      date: dateStr,
      time: `${startTimeStr} - ${endTimeStr}`,
    };
  }, []);

  // Handle RSVP
  const handleRSVP = useCallback(async (status: 'going' | 'maybe' | 'not_going') => {
    try {
      await rsvpToEvent({ eventId, status }).unwrap();
      setUserRSVPStatus(status);
      refetchEvent();
      
      const statusText = status === 'going' ? 'attending' : 
                        status === 'maybe' ? 'maybe attending' : 'not attending';
      Alert.alert('RSVP Updated', `You are now ${statusText} this event.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update RSVP. Please try again.');
    }
  }, [eventId, rsvpToEvent, refetchEvent]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!event) return;
    
    try {
      await Share.share({
        message: `Check out this event: ${event.title}\n\n${event.description}\n\nLocation: ${event.location}\nTime: ${formatEventDate(event.startTime, event.endTime).date}`,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  }, [event, formatEventDate]);

  if (eventLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (eventError || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load event</Text>
          <Button variant="outline" onPress={() => refetchEvent()}>
            Try Again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const { date, time } = formatEventDate(event.startTime, event.endTime);
  const attendees = attendeesData?.data || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Event Image */}
        {event.imageUrl && (
          <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
        )}

        <View style={styles.content}>
          {/* Event Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{event.title}</Text>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Event Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>Date & Time</Text>
                <Text style={styles.detailText}>{date}</Text>
                <Text style={styles.detailText}>{time}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>Location</Text>
                <Text style={styles.detailText}>{event.location}</Text>
              </View>
            </View>

            {event.price && event.price > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>💰</Text>
                <View style={styles.detailContent}>
                  <Text style={styles.detailTitle}>Price</Text>
                  <Text style={styles.detailText}>${event.price}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Attendees */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Attendees ({event.attendeeCount || 0})
            </Text>
            {attendees.length > 0 && (
              <View style={styles.attendeesList}>
                {attendees.slice(0, 5).map((attendee) => (
                  <View key={attendee.id} style={styles.attendeeItem}>
                    <View style={styles.attendeeAvatar}>
                      <Text style={styles.attendeeInitial}>
                        {attendee.firstName.charAt(0)}
                      </Text>
                    </View>
                    <Text style={styles.attendeeName}>
                      {attendee.firstName} {attendee.lastName}
                    </Text>
                  </View>
                ))}
                {(event.attendeeCount || 0) > 5 && (
                  <Text style={styles.moreAttendees}>
                    +{(event.attendeeCount || 0) - 5} more
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* RSVP Actions */}
      <View style={styles.rsvpContainer}>
        <View style={styles.rsvpButtons}>
          <Button
            variant={userRSVPStatus === 'going' ? 'primary' : 'outline'}
            size="sm"
            onPress={() => handleRSVP('going')}
            disabled={rsvpLoading}
            style={styles.rsvpButton}
          >
            Going
          </Button>
          <Button
            variant={userRSVPStatus === 'maybe' ? 'primary' : 'outline'}
            size="sm"
            onPress={() => handleRSVP('maybe')}
            disabled={rsvpLoading}
            style={styles.rsvpButton}
          >
            Maybe
          </Button>
          <Button
            variant={userRSVPStatus === 'not_going' ? 'primary' : 'outline'}
            size="sm"
            onPress={() => handleRSVP('not_going')}
            disabled={rsvpLoading}
            style={styles.rsvpButton}
          >
            Can't Go
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.neutral[500],
    fontFamily: theme.typography.fontFamily?.regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error[600],
    fontFamily: theme.typography.fontFamily?.medium,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  eventImage: {
    width: '100%',
    height: 250,
    backgroundColor: theme.colors.neutral[200],
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.bold,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  shareButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.borderRadius.sm,
  },
  shareButtonText: {
    fontSize: 14,
    color: theme.colors.neutral[700],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  detailsSection: {
    marginBottom: theme.spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.semibold,
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
    lineHeight: 20,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.semibold,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: 16,
    color: theme.colors.neutral[700],
    fontFamily: theme.typography.fontFamily?.regular,
    lineHeight: 24,
  },
  attendeesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  attendeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  attendeeInitial: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary[700],
    fontFamily: theme.typography.fontFamily?.semibold,
  },
  attendeeName: {
    fontSize: 14,
    color: theme.colors.neutral[700],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  moreAttendees: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    fontFamily: theme.typography.fontFamily?.regular,
    marginTop: theme.spacing.sm,
  },
  rsvpContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.white,
  },
  rsvpButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  rsvpButton: {
    flex: 1,
  },
});
