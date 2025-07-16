import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import type { Event } from '@/store/api/coreApi';

interface EventCardProps {
  event: Event;
  onPress: (eventId: string) => void;
  onRSVP?: (eventId: string, status: 'going' | 'maybe' | 'not_going') => void;
  onShare?: (event: Event) => void;
  showRSVPButtons?: boolean;
  compact?: boolean;
  testID?: string;
}

/**
 * EventCard Component
 * 
 * Displays event information in a card format with optional RSVP and share functionality.
 * Used in event lists, search results, and user profiles.
 * 
 * Features:
 * - Event image, title, date, location, and attendee count
 * - Optional RSVP buttons
 * - Share functionality
 * - Compact mode for smaller displays
 * - Accessibility support
 */
export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  onRSVP,
  onShare,
  showRSVPButtons = true,
  compact = false,
  testID,
}) => {
  // Format date for display
  const formatEventDate = useCallback((startTime: string) => {
    const date = new Date(startTime);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }, []);

  const handlePress = useCallback(() => {
    onPress(event.id);
  }, [event.id, onPress]);

  const handleRSVP = useCallback((status: 'going' | 'maybe' | 'not_going') => {
    onRSVP?.(event.id, status);
  }, [event.id, onRSVP]);

  const handleShare = useCallback(() => {
    onShare?.(event);
  }, [event, onShare]);

  return (
    <TouchableOpacity 
      style={[styles.container, compact && styles.containerCompact]}
      onPress={handlePress}
      testID={testID}
    >
      {/* Event Image */}
      {event.imageUrl && !compact && (
        <Image 
          source={{ uri: event.imageUrl }} 
          style={styles.eventImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        {/* Event Header */}
        <View style={styles.header}>
          <Text 
            style={[styles.title, compact && styles.titleCompact]}
            numberOfLines={compact ? 1 : 2}
          >
            {event.title}
          </Text>
          <Text style={styles.attendees}>
            {event.attendeeCount || 0} going
          </Text>
        </View>

        {/* Event Details */}
        <Text style={styles.date}>
          {formatEventDate(event.startTime)}
        </Text>
        
        <Text 
          style={styles.location}
          numberOfLines={1}
        >
          📍 {event.location}
        </Text>

        {/* Price (if applicable) */}
        {event.price && event.price > 0 && (
          <Text style={styles.price}>
            ${event.price}
          </Text>
        )}

        {/* Description Preview */}
        {!compact && event.description && (
          <Text 
            style={styles.description}
            numberOfLines={2}
          >
            {event.description}
          </Text>
        )}

        {/* Action Buttons */}
        {showRSVPButtons && !compact && (
          <View style={styles.actions}>
            <Button
              variant="primary"
              size="sm"
              onPress={() => handleRSVP('going')}
              style={styles.rsvpButton}
              testID={`${testID}-rsvp-going`}
            >
              Going
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleRSVP('maybe')}
              style={styles.rsvpButton}
              testID={`${testID}-rsvp-maybe`}
            >
              Maybe
            </Button>
            
            {onShare && (
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                testID={`${testID}-share`}
              >
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  containerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  eventImage: {
    width: '100%',
    height: 150,
    backgroundColor: theme.colors.neutral[200],
  },
  content: {
    padding: theme.spacing.lg,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.semibold,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  titleCompact: {
    fontSize: 16,
  },
  attendees: {
    fontSize: 12,
    color: theme.colors.primary[600],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  date: {
    fontSize: 14,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
    marginBottom: theme.spacing.xs,
  },
  location: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    fontFamily: theme.typography.fontFamily?.regular,
    marginBottom: theme.spacing.xs,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.success[600],
    fontFamily: theme.typography.fontFamily?.semibold,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: 14,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rsvpButton: {
    flex: 1,
  },
  shareButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 14,
    color: theme.colors.neutral[700],
    fontFamily: theme.typography.fontFamily?.medium,
  },
});
