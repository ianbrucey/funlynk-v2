import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';
// import { LoadingSpinner } from '@/components/shared/atoms/LoadingSpinner';
// import { EmptyState } from '@/components/shared/molecules/EmptyState';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * ProgramListScreen Component
 * 
 * List of teacher's Spark programs with management capabilities.
 * 
 * Features:
 * - List of teacher's Spark programs
 * - Program status indicators (active, draft, archived)
 * - Search and filter programs
 * - Quick edit and duplicate actions
 * - Program performance metrics
 * - Create new program button
 */

export const ProgramListScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Mock data for development
  const mockPrograms = [
    {
      id: '1',
      title: 'Science Museum Adventure',
      description: 'Explore the wonders of science through interactive exhibits',
      status: 'active',
      grade_levels: ['3rd', '4th', '5th'],
      duration: 120,
      capacity: 30,
      bookings_count: 15,
      rating: 4.8,
      created_at: '2024-01-01',
      updated_at: '2024-01-10'
    },
    {
      id: '2',
      title: 'Character Building Workshop',
      description: 'Building strong character through engaging activities',
      status: 'active',
      grade_levels: ['K', '1st', '2nd'],
      duration: 90,
      capacity: 25,
      bookings_count: 8,
      rating: 4.9,
      created_at: '2024-01-05',
      updated_at: '2024-01-12'
    },
    {
      id: '3',
      title: 'Art & Creativity Session',
      description: 'Unleash creativity through various art forms',
      status: 'draft',
      grade_levels: ['2nd', '3rd', '4th'],
      duration: 105,
      capacity: 20,
      bookings_count: 0,
      rating: 0,
      created_at: '2024-01-08',
      updated_at: '2024-01-08'
    }
  ];

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Archived', value: 'archived' },
  ];

  // Load programs data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Program list focused');
    }, [])
  );

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter programs based on search and filter
  const filteredPrograms = mockPrograms.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || program.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Handle program actions
  const handleProgramPress = (program: any) => {
    console.log('Navigate to program details:', program.id);
    // navigation.navigate('ProgramDetails', { programId: program.id });
  };

  const handleEditProgram = (program: any) => {
    console.log('Edit program:', program.id);
    // navigation.navigate('EditProgram', { programId: program.id });
  };

  const handleDuplicateProgram = (program: any) => {
    console.log('Duplicate program:', program.id);
  };

  const handleCreateProgram = () => {
    console.log('Create new program');
    // navigation.navigate('CreateProgram');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'draft':
        return '#F59E0B';
      case 'archived':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'draft':
        return 'Draft';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Programs</Text>
        <Button
          variant="primary"
          size="sm"
          onPress={handleCreateProgram}
        >
          Create Program
        </Button>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search programs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterTab,
              selectedFilter === filter.value && styles.filterTabActive
            ]}
            onPress={() => setSelectedFilter(filter.value)}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === filter.value && styles.filterTabTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Programs List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredPrograms.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No programs found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Create your first program to get started'}
            </Text>
            {!searchQuery && (
              <Button
                variant="primary"
                onPress={handleCreateProgram}
                style={styles.emptyStateButton}
              >
                Create Program
              </Button>
            )}
          </View>
        ) : (
          filteredPrograms.map((program) => (
            <TouchableOpacity
              key={program.id}
              style={styles.programCard}
              onPress={() => handleProgramPress(program)}
            >
              <View style={styles.programHeader}>
                <View style={styles.programTitleContainer}>
                  <Text style={styles.programTitle}>{program.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(program.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(program.status)}</Text>
                  </View>
                </View>
                <View style={styles.programActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditProgram(program)}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDuplicateProgram(program)}
                  >
                    <Text style={styles.actionButtonText}>Duplicate</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.programDescription}>{program.description}</Text>
              
              <View style={styles.programMeta}>
                <Text style={styles.metaText}>Grades: {program.grade_levels.join(', ')}</Text>
                <Text style={styles.metaText}>Duration: {program.duration} min</Text>
                <Text style={styles.metaText}>Capacity: {program.capacity}</Text>
              </View>
              
              <View style={styles.programStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{program.bookings_count}</Text>
                  <Text style={styles.statLabel}>Bookings</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{program.rating > 0 ? program.rating.toFixed(1) : 'N/A'}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Inter-Regular',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    minWidth: 150,
  },
  programCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  programTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  programActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  programDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    lineHeight: 20,
  },
  programMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  programStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    fontFamily: 'Inter-SemiBold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
});

export default ProgramListScreen;
