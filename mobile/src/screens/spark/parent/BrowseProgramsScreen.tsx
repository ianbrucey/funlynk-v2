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
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * BrowseProgramsScreen Component
 * 
 * Program discovery and booking interface for parents.
 * 
 * Features:
 * - Browse available Spark programs with detailed descriptions
 * - Filter by age group, subject, location, and availability
 * - Search programs by keywords and topics
 * - View program schedules and available time slots
 * - Read reviews and ratings from other parents
 * - Book programs directly with instant confirmation
 * - Add programs to wishlist for future booking
 * - View program photos and teacher profiles
 */

export const BrowseProgramsScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Mock data for development
  const programCategories = [
    { id: 'all', name: 'All Programs', icon: '📚' },
    { id: 'science', name: 'Science & STEM', icon: '🔬' },
    { id: 'character', name: 'Character Building', icon: '🌟' },
    { id: 'arts', name: 'Arts & Creativity', icon: '🎨' },
    { id: 'nature', name: 'Nature & Outdoors', icon: '🌿' },
    { id: 'sports', name: 'Sports & Fitness', icon: '⚽' },
    { id: 'technology', name: 'Technology', icon: '💻' },
  ];

  const ageGroups = [
    { id: 'all', name: 'All Ages' },
    { id: 'preschool', name: 'Preschool (3-5)' },
    { id: 'elementary', name: 'Elementary (6-10)' },
    { id: 'middle', name: 'Middle School (11-13)' },
    { id: 'high', name: 'High School (14-18)' },
  ];

  const mockPrograms = [
    {
      id: '1',
      title: 'Science Museum Adventure',
      description: 'Explore the wonders of science through interactive exhibits and hands-on experiments. Students will discover physics, chemistry, and biology concepts.',
      category: 'science',
      age_group: 'elementary',
      duration: 120,
      capacity: 30,
      price: 25.00,
      rating: 4.8,
      review_count: 156,
      teacher: {
        name: 'Ms. Sarah Johnson',
        photo_url: null,
        experience: '5 years',
        specialization: 'Science Education'
      },
      next_available: '2024-01-15',
      available_slots: [
        { date: '2024-01-15', time: '10:00 AM', spots_left: 8 },
        { date: '2024-01-18', time: '2:00 PM', spots_left: 12 },
        { date: '2024-01-22', time: '10:00 AM', spots_left: 5 }
      ],
      images: [],
      highlights: [
        'Hands-on experiments',
        'Interactive exhibits',
        'STEM learning',
        'Small group activities'
      ],
      requirements: [
        'Comfortable walking shoes',
        'Notebook and pencil',
        'Lunch if full day program'
      ],
      location: 'Lincoln Elementary School',
      is_featured: true,
      is_wishlisted: false
    },
    {
      id: '2',
      title: 'Character Building Workshop',
      description: 'Build strong character through engaging activities focused on honesty, respect, responsibility, and kindness. Interactive games and discussions.',
      category: 'character',
      age_group: 'elementary',
      duration: 90,
      capacity: 25,
      price: 20.00,
      rating: 4.9,
      review_count: 203,
      teacher: {
        name: 'Mr. David Wilson',
        photo_url: null,
        experience: '8 years',
        specialization: 'Character Development'
      },
      next_available: '2024-01-16',
      available_slots: [
        { date: '2024-01-16', time: '2:00 PM', spots_left: 15 },
        { date: '2024-01-19', time: '10:00 AM', spots_left: 20 },
        { date: '2024-01-23', time: '2:00 PM', spots_left: 10 }
      ],
      images: [],
      highlights: [
        'Interactive discussions',
        'Role-playing activities',
        'Team building exercises',
        'Values-based learning'
      ],
      requirements: [
        'Open mind and positive attitude',
        'Willingness to participate'
      ],
      location: 'Washington Middle School',
      is_featured: false,
      is_wishlisted: true
    },
    {
      id: '3',
      title: 'Art & Creativity Session',
      description: 'Unleash creativity through various art forms including painting, drawing, sculpture, and mixed media. Perfect for budding artists.',
      category: 'arts',
      age_group: 'elementary',
      duration: 105,
      capacity: 20,
      price: 30.00,
      rating: 4.7,
      review_count: 89,
      teacher: {
        name: 'Ms. Emily Chen',
        photo_url: null,
        experience: '6 years',
        specialization: 'Visual Arts'
      },
      next_available: '2024-01-17',
      available_slots: [
        { date: '2024-01-17', time: '9:00 AM', spots_left: 6 },
        { date: '2024-01-20', time: '1:00 PM', spots_left: 12 },
        { date: '2024-01-24', time: '9:00 AM', spots_left: 8 }
      ],
      images: [],
      highlights: [
        'Multiple art mediums',
        'Individual creativity focus',
        'Take home artwork',
        'Professional art supplies'
      ],
      requirements: [
        'Clothes that can get messy',
        'Apron or old shirt',
        'Enthusiasm for creativity'
      ],
      location: 'Roosevelt Elementary',
      is_featured: true,
      is_wishlisted: false
    }
  ];

  // Load programs on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Browse programs focused');
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

  // Filter programs based on search and filters
  const filteredPrograms = mockPrograms.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.teacher.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || program.category === selectedCategory;
    const matchesAgeGroup = selectedAgeGroup === 'all' || program.age_group === selectedAgeGroup;
    return matchesSearch && matchesCategory && matchesAgeGroup;
  });

  // Handle program actions
  const handleProgramPress = (program: any) => {
    console.log('Navigate to program details:', program.id);
    // navigation.navigate('ProgramDetails', { programId: program.id });
  };

  const handleBookProgram = (program: any, slot: any) => {
    console.log('Book program:', program.id, 'slot:', slot);
    // navigation.navigate('BookingConfirmation', { programId: program.id, slotId: slot });
  };

  const handleToggleWishlist = (programId: string) => {
    console.log('Toggle wishlist for program:', programId);
  };

  const handleViewTeacher = (teacher: any) => {
    console.log('View teacher profile:', teacher.name);
    // navigation.navigate('TeacherProfile', { teacherId: teacher.id });
  };

  const renderProgramCard = (program: any) => {
    return (
      <TouchableOpacity
        key={program.id}
        style={styles.programCard}
        onPress={() => handleProgramPress(program)}
      >
        {program.is_featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>FEATURED</Text>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => handleToggleWishlist(program.id)}
        >
          <Text style={[styles.wishlistIcon, program.is_wishlisted && styles.wishlistIconActive]}>
            {program.is_wishlisted ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>

        <View style={styles.programHeader}>
          <Text style={styles.programTitle}>{program.title}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>★ {program.rating}</Text>
            <Text style={styles.reviewCount}>({program.review_count})</Text>
          </View>
        </View>

        <Text style={styles.programDescription} numberOfLines={3}>
          {program.description}
        </Text>

        <View style={styles.programMeta}>
          <Text style={styles.metaText}>Duration: {program.duration} min</Text>
          <Text style={styles.metaText}>Capacity: {program.capacity}</Text>
          <Text style={styles.metaText}>Location: {program.location}</Text>
        </View>

        <TouchableOpacity
          style={styles.teacherInfo}
          onPress={() => handleViewTeacher(program.teacher)}
        >
          <View style={styles.teacherAvatar}>
            {program.teacher.photo_url ? (
              <Image source={{ uri: program.teacher.photo_url }} style={styles.teacherImage} />
            ) : (
              <Text style={styles.teacherInitials}>
                {program.teacher.name.split(' ').map(n => n.charAt(0)).join('')}
              </Text>
            )}
          </View>
          <View style={styles.teacherDetails}>
            <Text style={styles.teacherName}>{program.teacher.name}</Text>
            <Text style={styles.teacherExperience}>{program.teacher.experience} • {program.teacher.specialization}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.highlightsContainer}>
          {program.highlights.slice(0, 3).map((highlight, index) => (
            <View key={index} style={styles.highlightTag}>
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>

        <View style={styles.programFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${program.price.toFixed(2)}</Text>
            <Text style={styles.priceLabel}>per child</Text>
          </View>
          
          <View style={styles.availabilityContainer}>
            <Text style={styles.nextAvailable}>Next: {program.next_available}</Text>
            <Text style={styles.spotsLeft}>
              {program.available_slots[0]?.spots_left} spots left
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button
            variant="outline"
            size="sm"
            onPress={() => handleProgramPress(program)}
            style={styles.detailsButton}
          >
            View Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => handleBookProgram(program, program.available_slots[0])}
            style={styles.bookButton}
          >
            Book Now
          </Button>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Programs</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'list' && styles.viewToggleActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'grid' && styles.viewToggleActive]}
            onPress={() => setViewMode('grid')}
          >
            <Text style={[styles.viewToggleText, viewMode === 'grid' && styles.viewToggleTextActive]}>Grid</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search programs, teachers, or topics..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {programCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.categoryTabActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Age Group Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.ageGroupContainer}
        contentContainerStyle={styles.ageGroupContent}
      >
        {ageGroups.map((ageGroup) => (
          <TouchableOpacity
            key={ageGroup.id}
            style={[
              styles.ageGroupTab,
              selectedAgeGroup === ageGroup.id && styles.ageGroupTabActive
            ]}
            onPress={() => setSelectedAgeGroup(ageGroup.id)}
          >
            <Text style={[
              styles.ageGroupText,
              selectedAgeGroup === ageGroup.id && styles.ageGroupTextActive
            ]}>
              {ageGroup.name}
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
              {searchQuery ? 'Try adjusting your search criteria' : 'No programs match the selected filters'}
            </Text>
          </View>
        ) : (
          <View style={styles.programsList}>
            {filteredPrograms.map(renderProgramCard)}
          </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  viewToggleActive: {
    backgroundColor: '#3B82F6',
  },
  viewToggleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  viewToggleTextActive: {
    color: '#FFFFFF',
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
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: '#3B82F6',
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  ageGroupContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  ageGroupContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  ageGroupTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  ageGroupTabActive: {
    backgroundColor: '#10B981',
  },
  ageGroupText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  ageGroupTextActive: {
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
  },
  programsList: {
    gap: 16,
  },
  programCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  wishlistButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  wishlistIcon: {
    fontSize: 20,
  },
  wishlistIconActive: {
    fontSize: 20,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    marginTop: 8,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#F59E0B',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  programDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
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
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  teacherAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teacherImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  teacherInitials: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  teacherDetails: {
    flex: 1,
  },
  teacherName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
  },
  teacherExperience: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  highlightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  highlightTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  highlightText: {
    fontSize: 11,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  programFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: 'Inter-Bold',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  availabilityContainer: {
    alignItems: 'flex-end',
  },
  nextAvailable: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  spotsLeft: {
    fontSize: 11,
    color: '#EF4444',
    fontFamily: 'Inter-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsButton: {
    flex: 1,
  },
  bookButton: {
    flex: 1,
  },
});

export default BrowseProgramsScreen;
