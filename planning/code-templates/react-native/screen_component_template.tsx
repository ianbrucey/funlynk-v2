import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '../../../components/shared/atoms/Button';
import { Input } from '../../../components/shared/atoms/Input';
import { ErrorMessage } from '../../../components/shared/molecules/ErrorMessage';
import { LoadingSpinner } from '../../../components/shared/atoms/LoadingSpinner';
import { EmptyState } from '../../../components/shared/molecules/EmptyState';

// Module-specific components
import { {MODULE}Header } from '../../../components/{module}/molecules/{MODULE}Header';
import { {MODEL}Card } from '../../../components/{module}/molecules/{MODEL}Card';
import { {MODEL}Form } from '../../../components/{module}/organisms/{MODEL}Form';

// Hooks
import { use{MODEL}s } from '../../../hooks/{module}/use{MODEL}s';
import { useAuth } from '../../../hooks/shared/useAuth';
import { useErrorHandler } from '../../../hooks/shared/useErrorHandler';

// Services
import { {model}Api } from '../../../services/api/{module}/{model}Api';

// Types
import type { {MODEL} } from '../../../types/{module}';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import type { {MODULE}StackParamList } from '../../../navigation/{MODULE}Navigator';

// Redux
import { {model}Actions } from '../../../store/slices/{module}Slice';
import type { RootState } from '../../../store/store';

/**
 * {SCREEN_NAME} Screen Component
 * 
 * {DESCRIPTION}
 * 
 * Features:
 * - {FEATURE_1}
 * - {FEATURE_2}
 * - {FEATURE_3}
 */

type {SCREEN_NAME}NavigationProp = NavigationProp<{MODULE}StackParamList, '{SCREEN_ROUTE}'>;
type {SCREEN_NAME}RouteProp = RouteProp<{MODULE}StackParamList, '{SCREEN_ROUTE}'>;

interface {SCREEN_NAME}Props {
  navigation: {SCREEN_NAME}NavigationProp;
  route: {SCREEN_NAME}RouteProp;
}

export const {SCREEN_NAME}: React.FC<{SCREEN_NAME}Props> = () => {
  // Navigation and routing
  const navigation = useNavigation<{SCREEN_NAME}NavigationProp>();
  const route = useRoute<{SCREEN_NAME}RouteProp>();
  
  // Redux
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { {model}s, loading, error } = useSelector((state: RootState) => state.{module});

  // Custom hooks
  const { 
    {model}s: {model}Data, 
    loading: {model}Loading, 
    error: {model}Error,
    refresh: refresh{MODEL}s,
    loadMore: loadMore{MODEL}s,
    hasMore
  } = use{MODEL}s();
  
  const { showError, clearError } = useErrorHandler();

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);

  // Route parameters
  const { {model}Id, mode } = route.params || {};

  // ========================================
  // EFFECTS
  // ========================================

  // Focus effect - refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [])
  );

  // Search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        loadInitialData();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Error handling effect
  useEffect(() => {
    if ({model}Error) {
      showError({model}Error);
    }
  }, [{model}Error]);

  // ========================================
  // DATA LOADING
  // ========================================

  const loadInitialData = async () => {
    try {
      await refresh{MODEL}s();
    } catch (error) {
      showError('Failed to load data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh{MODEL}s();
    } catch (error) {
      showError('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || {model}Loading) return;
    
    try {
      await loadMore{MODEL}s();
    } catch (error) {
      showError('Failed to load more data');
    }
  };

  const handleSearch = async (query: string) => {
    try {
      dispatch({model}Actions.setSearchQuery(query));
      // Implement search logic
    } catch (error) {
      showError('Search failed');
    }
  };

  // ========================================
  // USER INTERACTIONS
  // ========================================

  const handleCreate{MODEL} = () => {
    if (mode === 'select') {
      // Handle selection mode
      setShowForm(true);
    } else {
      navigation.navigate('Create{MODEL}');
    }
  };

  const handle{MODEL}Press = ({model}: {MODEL}) => {
    if (mode === 'select') {
      // Handle selection and go back
      navigation.goBack();
      // Pass selected item back
      route.params?.onSelect?.({model});
    } else {
      navigation.navigate('{MODEL}Detail', { {model}Id: {model}.id });
    }
  };

  const handle{MODEL}Edit = ({model}: {MODEL}) => {
    navigation.navigate('Edit{MODEL}', { {model}Id: {model}.id });
  };

  const handle{MODEL}Delete = async ({model}: {MODEL}) => {
    Alert.alert(
      'Delete {MODEL}',
      'Are you sure you want to delete this {model}? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await {model}Api.delete({model}.id);
              dispatch({model}Actions.remove{MODEL}({model}.id));
              Alert.alert('Success', '{MODEL} deleted successfully');
            } catch (error) {
              showError('Failed to delete {model}');
            }
          },
        },
      ]
    );
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    dispatch({model}Actions.setFilter(filter));
  };

  // ========================================
  // RENDER HELPERS
  // ========================================

  const renderHeader = () => (
    <{MODULE}Header
      title="{SCREEN_TITLE}"
      showBack={navigation.canGoBack()}
      onBackPress={() => navigation.goBack()}
      rightAction={{
        icon: 'plus',
        onPress: handleCreate{MODEL},
        disabled: !user,
      }}
    />
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Input
        placeholder="Search {model}s..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftIcon="search"
        clearable
        onClear={() => setSearchQuery('')}
      />
    </View>
  );

  const renderFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filtersContainer}
      contentContainerStyle={styles.filtersContent}
    >
      {FILTER_OPTIONS.map((filter) => (
        <Button
          key={filter.value}
          title={filter.label}
          variant={selectedFilter === filter.value ? 'primary' : 'tertiary'}
          size="small"
          onPress={() => handleFilterChange(filter.value)}
          style={styles.filterButton}
        />
      ))}
    </ScrollView>
  );

  const render{MODEL}Item = ({ item: {model} }: { item: {MODEL} }) => (
    <{MODEL}Card
      {model}={{model}}
      onPress={() => handle{MODEL}Press({model})}
      onEdit={() => handle{MODEL}Edit({model})}
      onDelete={() => handle{MODEL}Delete({model})}
      showActions={user?.id === {model}.userId}
      mode={mode}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="calendar"
      title="No {model}s found"
      description={
        searchQuery 
          ? "No {model}s match your search criteria"
          : "Get started by creating your first {model}"
      }
      actionLabel={searchQuery ? "Clear search" : "Create {MODEL}"}
      onActionPress={searchQuery ? () => setSearchQuery('') : handleCreate{MODEL}}
    />
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <LoadingSpinner size="large" />
      <Text style={styles.loadingText}>Loading {model}s...</Text>
    </View>
  );

  const renderErrorState = () => (
    <ErrorMessage
      error={error || {model}Error}
      onRetry={loadInitialData}
      showRetry
    />
  );

  const renderContent = () => {
    if ({model}Loading && {model}Data.length === 0) {
      return renderLoadingState();
    }

    if (error && {model}Data.length === 0) {
      return renderErrorState();
    }

    if ({model}Data.length === 0) {
      return renderEmptyState();
    }

    return (
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']} // Android
            tintColor="#3b82f6" // iOS
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          
          if (isCloseToBottom && hasMore && !{model}Loading) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {renderSearchBar()}
        {renderFilters()}
        
        <View style={styles.listContainer}>
          {{model}Data.map((item) => (
            <View key={item.id} style={styles.listItem}>
              {render{MODEL}Item({ item })}
            </View>
          ))}
          
          {/* Load more indicator */}
          {{model}Loading && {model}Data.length > 0 && (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.loadMoreText}>Loading more...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderContent()}
      
      {/* Form Modal */}
      {showForm && (
        <{MODEL}Form
          visible={showForm}
          onClose={() => setShowForm(false)}
          onSuccess={(new{MODEL}) => {
            setShowForm(false);
            dispatch({model}Actions.add{MODEL}(new{MODEL}));
            if (mode === 'select') {
              route.params?.onSelect?.(new{MODEL});
              navigation.goBack();
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

// ========================================
// CONSTANTS
// ========================================

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Past', value: 'past' },
  // Add module-specific filters
];

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
  },
  listItem: {
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

/*
USAGE INSTRUCTIONS:

1. Replace placeholders:
   - {SCREEN_NAME}: Screen component name (e.g., EventListScreen, ProgramListScreen)
   - {SCREEN_TITLE}: Display title (e.g., "Events", "Programs")
   - {SCREEN_ROUTE}: Route name (e.g., 'EventList', 'ProgramList')
   - {MODULE}: Module name (e.g., Core, Spark)
   - {module}: Lowercase module name (e.g., core, spark)
   - {MODEL}: Model name (e.g., Event, Program)
   - {model}: Lowercase model name (e.g., event, program)
   - {DESCRIPTION}: Screen description
   - {FEATURE_1}, {FEATURE_2}, etc.: Key features

2. Customize filter options based on your data model

3. Update navigation routes to match your navigation structure

4. Implement module-specific business logic

5. Add any additional UI components or interactions

EXAMPLE USAGE:
- EventListScreen in Core module
- ProgramListScreen in Spark module
- StudentListScreen in Spark module

COMMON CUSTOMIZATIONS:
- Add sorting options
- Add advanced filtering
- Add bulk actions
- Add offline support
- Add real-time updates
- Add analytics tracking
*/
