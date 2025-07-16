import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/constants/theme';

// Components
import { SearchInput } from '@/components/ui/SearchInput';
import { EventCard } from '@/components/events/EventCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';

// Hooks
import { useEvents } from '@/hooks/core/useEvents';
import { useAuth } from '@/store/hooks';

// API
import { useGetEventsQuery } from '@/store/api/coreApi';
import type { Event } from '@/store/api/coreApi';

/**
 * EventBrowseScreen Component
 * 
 * Category-based event browsing with featured events, trending events,
 * and location-based recommendations.
 * 
 * Features:
 * - Category grid layout with visual icons
 * - Featured events section
 * - Trending events section
 * - Location-based recommendations
 * - Quick filter chips for popular categories
 */

interface EventCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count?: number;
}

const EVENT_CATEGORIES: EventCategory[] = [
  { id: 'arts', name: 'Arts & Culture', icon: '🎨', color: '#8B5CF6' },
  { id: 'sports', name: 'Sports & Fitness', icon: '🏃‍♂️', color: '#10B981' },
  { id: 'environment', name: 'Environment', icon: '🌱', color: '#059669' },
  { id: 'education', name: 'Education', icon: '🎓', color: '#3B82F6' },
  { id: 'community', name: 'Community', icon: '🤝', color: '#F59E0B' },
  { id: 'technology', name: 'Technology', icon: '💻', color: '#6366F1' },
  { id: 'food', name: 'Food & Drink', icon: '🍽️', color: '#EF4444' },
  { id: 'music', name: 'Music', icon: '🎵', color: '#EC4899' },
];

export const EventBrowseScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { rsvpToEvent } = useEvents();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // API queries
  const {
    data: featuredEvents,
    isLoading: featuredLoading,
  } = useGetEventsQuery({
    page: 1,
    limit: 5,
    featured: true,
  });

  const {
    data: trendingEvents,
    isLoading: trendingLoading,
  } = useGetEventsQuery({
    page: 1,
    limit: 10,
    trending: true,
  });

  const {
    data: categoryEvents,
    isLoading: categoryLoading,
  } = useGetEventsQuery({
    page: 1,
    limit: 20,
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
  });

  // Handlers
  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  }, [selectedCategory]);

  const handleEventPress = useCallback((eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  }, [navigation]);

  const handleRSVP = useCallback(async (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    try {
      await rsvpToEvent(eventId, status);
    } catch (error) {
      console.error('RSVP failed:', error);
    }
  }, [rsvpToEvent]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query && !selectedCategory) {
      // Auto-select a relevant category or show all
      setSelectedCategory(null);
    }
  }, [selectedCategory]);

  // Render category item
  const renderCategoryItem = useCallback((category: EventCategory) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryCard,
        selectedCategory === category.id && styles.categoryCardSelected,
        { borderColor: category.color },
      ]}
      onPress={() => handleCategoryPress(category.id)}
      testID={`category-${category.id}`}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={[
        styles.categoryName,
        selectedCategory === category.id && styles.categoryNameSelected,
      ]}>
        {category.name}
      </Text>
      {category.count && (
        <Text style={styles.categoryCount}>{category.count} events</Text>
      )}
    </TouchableOpacity>
  ), [selectedCategory, handleCategoryPress]);

  // Render event item
  const renderEventItem = useCallback(({ item }: { item: Event }) => (
    <EventCard
      event={item}
      onPress={() => handleEventPress(item.id)}
      onRSVP={(status) => handleRSVP(item.id, status)}
      currentUserId={user?.id}
      compact={false}
      style={styles.eventCard}
      testID={`event-card-${item.id}`}
    />
  ), [handleEventPress, handleRSVP, user?.id]);

  // Render featured event item (horizontal)
  const renderFeaturedEventItem = useCallback(({ item }: { item: Event }) => (
    <EventCard
      event={item}
      onPress={() => handleEventPress(item.id)}
      onRSVP={(status) => handleRSVP(item.id, status)}
      currentUserId={user?.id}
      compact={true}
      style={styles.featuredEventCard}
      testID={`featured-event-card-${item.id}`}
    />
  ), [handleEventPress, handleRSVP, user?.id]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Browse Events</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search events by name, location..."
            testID="browse-search-input"
          />
        </View>

        {/* Categories Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <View style={styles.categoriesGrid}>
            {EVENT_CATEGORIES.map(renderCategoryItem)}
          </View>
        </View>

        {/* Featured Events */}
        {!selectedCategory && !searchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Events</Text>
            {featuredLoading ? (
              <LoadingSpinner size="medium" />
            ) : featuredEvents?.data?.length ? (
              <FlatList
                data={featuredEvents.data}
                renderItem={renderFeaturedEventItem}
                keyExtractor={(item) => `featured-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            ) : (
              <EmptyState
                icon="⭐"
                title="No featured events"
                subtitle="Check back later for featured events"
              />
            )}
          </View>
        )}

        {/* Trending Events */}
        {!selectedCategory && !searchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            {trendingLoading ? (
              <LoadingSpinner size="medium" />
            ) : trendingEvents?.data?.length ? (
              <FlatList
                data={trendingEvents.data.slice(0, 3)}
                renderItem={renderEventItem}
                keyExtractor={(item) => `trending-${item.id}`}
                scrollEnabled={false}
              />
            ) : (
              <EmptyState
                icon="🔥"
                title="No trending events"
                subtitle="Be the first to create a trending event"
              />
            )}
          </View>
        )}

        {/* Category/Search Results */}
        {(selectedCategory || searchQuery) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedCategory 
                ? `${EVENT_CATEGORIES.find(c => c.id === selectedCategory)?.name} Events`
                : 'Search Results'
              }
            </Text>
            {categoryLoading ? (
              <LoadingSpinner size="medium" />
            ) : categoryEvents?.data?.length ? (
              <FlatList
                data={categoryEvents.data}
                renderItem={renderEventItem}
                keyExtractor={(item) => `category-${item.id}`}
                scrollEnabled={false}
              />
            ) : (
              <EmptyState
                icon="🔍"
                title="No events found"
                subtitle={selectedCategory 
                  ? "No events in this category yet"
                  : "Try adjusting your search terms"
                }
                actionText="Clear filters"
                onAction={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                }}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
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
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.semibold,
    marginBottom: theme.spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.neutral[200],
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  categoryCardSelected: {
    backgroundColor: theme.colors.primary[50],
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  categoryName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral[700],
    fontFamily: theme.typography.fontFamily?.medium,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  categoryNameSelected: {
    color: theme.colors.primary[700],
  },
  categoryCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500],
    fontFamily: theme.typography.fontFamily?.regular,
  },
  horizontalList: {
    paddingRight: theme.spacing.lg,
  },
  featuredEventCard: {
    width: 280,
    marginRight: theme.spacing.md,
  },
  eventCard: {
    marginBottom: theme.spacing.md,
  },
});
