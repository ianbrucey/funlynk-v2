import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Share,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters, type EventFiltersType } from '@/components/events/EventFilters';
import { useGetEventsQuery, useRsvpToEventMutation } from '@/store/api/coreApi';
import type { Event } from '@/store/api/coreApi';
import type { EventsStackParamList } from '@/types/navigation';

interface EventsScreenProps {}

export const EventsScreen: React.FC<EventsScreenProps> = () => {
  const navigation = useNavigation();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<EventFiltersType>({
    category: '',
    location: '',
    dateFrom: '',
    dateTo: '',
    priceMin: '',
    priceMax: '',
    radius: '',
  });
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // API Queries
  const {
    data: eventsData,
    isLoading,
    isError,
    refetch,
  } = useGetEventsQuery({
    page,
    limit: 20,
    search: searchQuery,
    category: filters.category || undefined,
    location: filters.location || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    priceMin: filters.priceMin ? Number(filters.priceMin) : undefined,
    priceMax: filters.priceMax ? Number(filters.priceMax) : undefined,
    radius: filters.radius ? Number(filters.radius) : undefined,
  });

  const [rsvpToEvent] = useRsvpToEventMutation();

  const events = eventsData?.data || [];
  const hasMore = eventsData?.hasMore || false;

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isLoading]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleEventPress = useCallback((eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  }, [navigation]);

  const handleCreateEvent = useCallback(() => {
    navigation.navigate('CreateEvent');
  }, [navigation]);

  const handleApplyFilters = useCallback((newFilters: EventFiltersType) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleRSVP = useCallback(async (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    try {
      await rsvpToEvent({ eventId, status }).unwrap();
      // Refetch events to update attendee counts
      refetch();
    } catch (error) {
      console.error('RSVP failed:', error);
    }
  }, [rsvpToEvent, refetch]);

  const handleShare = useCallback(async (event: Event) => {
    try {
      await Share.share({
        message: `Check out this event: ${event.title}\n\n${event.description}\n\nLocation: ${event.location}`,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  }, []);

  // Render event item
  const renderEventItem = useCallback(({ item }: { item: Event }) => (
    <EventCard
      event={item}
      onPress={handleEventPress}
      onRSVP={handleRSVP}
      onShare={handleShare}
      testID={`event-card-${item.id}`}
    />
  ), [handleEventPress, handleRSVP, handleShare]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Events</Text>
        <Button
          variant="primary"
          size="sm"
          onPress={handleCreateEvent}
          style={styles.createButton}
        >
          + Create
        </Button>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={theme.colors.neutral[500]}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {isLoading ? 'Loading events...' : 'No events found'}
            </Text>
          </View>
        }
      />

      {/* Categories Section */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <View style={styles.categoriesGrid}>
          {[
            { icon: '🎨', title: 'Arts & Culture', key: 'arts' },
            { icon: '🏃‍♂️', title: 'Sports & Fitness', key: 'sports' },
            { icon: '🌱', title: 'Environment', key: 'environment' },
            { icon: '🎓', title: 'Education', key: 'education' },
          ].map((category) => (
            <TouchableOpacity
              key={category.key}
              style={styles.categoryCard}
              onPress={() => {
                setFilters(prev => ({ ...prev, category: category.key }));
                setPage(1);
              }}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Event Filters Modal */}
      <EventFilters
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
        testID="event-filters-modal"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.bold,
  },
  createButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily?.regular,
    backgroundColor: theme.colors.white,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 16,
    color: theme.colors.neutral[700],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.neutral[500],
    fontFamily: theme.typography.fontFamily?.regular,
  },

  categoriesSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.semibold,
    marginBottom: theme.spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    width: '48%',
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  categoryTitle: {
    fontSize: 12,
    color: theme.colors.neutral[700],
    fontFamily: theme.typography.fontFamily?.medium,
    textAlign: 'center',
  },
});

export default EventsScreen;
