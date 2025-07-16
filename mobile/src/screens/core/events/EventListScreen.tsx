import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { theme } from '@/constants/theme';

// Shared components
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';

// Event-specific components
import { EventCard } from '@/components/events/EventCard';
import { EventFilters } from '@/components/events/EventFilters';

// Hooks
import { useEvents } from '@/hooks/core/useEvents';
import { useAuth } from '@/store/hooks';
import { useErrorHandler } from '@/hooks/shared/useErrorHandler';

// API
import { useGetEventsQuery } from '@/store/api/coreApi';
import type { Event } from '@/store/api/coreApi';

/**
 * EventListScreen Component
 * 
 * Displays a list of events with search, filtering, and browsing capabilities.
 * Includes pull-to-refresh, infinite scrolling, and real-time updates.
 * 
 * Features:
 * - Event list with infinite scrolling
 * - Search functionality with debounced input
 * - Filter options (category, date, location, price)
 * - Pull-to-refresh functionality
 * - Empty states and loading indicators
 * - Navigation to event details and creation
 * - RSVP quick actions
 */

interface EventFiltersType {
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  radius?: number;
}

export const EventListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { handleErrorWithToast } = useErrorHandler();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<EventFiltersType>({});
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [allEvents, setAllEvents] = useState<Event[]>([]);

  // API query
  const {
    data: eventsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetEventsQuery({
    page,
    limit: 20,
    search: searchQuery,
    category: filters.category,
    location: filters.location,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    radius: filters.radius,
  });

  // Custom hooks
  const { rsvpToEvent } = useEvents();

  // Update events list when data changes
  useEffect(() => {
    if (eventsData?.data) {
      if (page === 1) {
        setAllEvents(eventsData.data);
      } else {
        setAllEvents(prev => [...prev, ...eventsData.data]);
      }
    }
  }, [eventsData, page]);

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
    setAllEvents([]);
  }, [searchQuery, filters]);

  // Load events on screen focus
  useFocusEffect(
    useCallback(() => {
      if (allEvents.length === 0 && !isLoading) {
        refetch();
      }
    }, [allEvents.length, isLoading, refetch])
  );

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    setPage(1);
    setAllEvents([]);
    try {
      await refetch();
    } catch (error) {
      handleErrorWithToast(error, 'Failed to refresh events');
    }
  }, [refetch, handleErrorWithToast]);

  // Handle load more events
  const handleLoadMore = useCallback(() => {
    if (!isLoading && !isFetching && eventsData?.pagination?.hasNext) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, isFetching, eventsData?.pagination?.hasNext]);

  // Handle event RSVP
  const handleRSVP = useCallback(async (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    try {
      await rsvpToEvent(eventId, status);
      // Refetch to update attendee counts
      refetch();
    } catch (error) {
      handleErrorWithToast(error, 'Failed to update RSVP');
    }
  }, [rsvpToEvent, refetch, handleErrorWithToast]);

  // Handle filter application
  const handleApplyFilters = useCallback((newFilters: EventFiltersType) => {
    setFilters(newFilters);
    setShowFilters(false);
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Render event item
  const renderEventItem = useCallback(({ item }: { item: Event }) => (
    <EventCard
      event={item}
      onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
      onRSVP={(status) => handleRSVP(item.id, status)}
      currentUserId={user?.id}
      style={styles.eventCard}
      testID={`event-card-${item.id}`}
    />
  ), [navigation, handleRSVP, user?.id]);

  // Render list footer
  const renderListFooter = useCallback(() => {
    if (!isFetching || allEvents.length === 0) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <LoadingSpinner size="small" />
        <Text style={styles.loadingText}>Loading more events...</Text>
      </View>
    );
  }, [isFetching, allEvents.length]);

  // Render empty state
  const renderEmptyState = useCallback(() => {
    if (isLoading && allEvents.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <LoadingSpinner size="large" message="Loading events..." />
        </View>
      );
    }

    if (searchQuery || Object.keys(filters).some(key => filters[key as keyof EventFiltersType])) {
      return (
        <EmptyState
          icon="🔍"
          title="No events found"
          subtitle="Try adjusting your search or filters"
          actionText="Clear filters"
          onAction={() => {
            setSearchQuery('');
            setFilters({});
          }}
          testID="events-empty-search"
        />
      );
    }

    return (
      <EmptyState
        icon="📅"
        title="No events yet"
        subtitle="Be the first to create an event in your area"
        actionText="Create Event"
        onAction={() => navigation.navigate('CreateEvent')}
        testID="events-empty-default"
      />
    );
  }, [isLoading, allEvents.length, searchQuery, filters, navigation]);

  const filterCount = Object.keys(filters).filter(key => filters[key as keyof EventFiltersType]).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <Button
          variant="primary"
          size="sm"
          onPress={() => navigation.navigate('CreateEvent')}
          testID="create-event-button"
        >
          + Create
        </Button>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <SearchInput
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search events..."
          containerStyle={styles.searchInput}
          testID="event-search-input"
        />
        <Button
          variant="outline"
          size="sm"
          onPress={() => setShowFilters(true)}
          style={styles.filterButton}
          testID="filter-button"
        >
          Filter {filterCount > 0 && `(${filterCount})`}
        </Button>
      </View>

      {/* Events List */}
      <FlatList
        data={allEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          allEvents.length === 0 && styles.emptyListContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && page === 1}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        testID="event-list"
      />

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
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  eventCard: {
    marginBottom: theme.spacing.md,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
