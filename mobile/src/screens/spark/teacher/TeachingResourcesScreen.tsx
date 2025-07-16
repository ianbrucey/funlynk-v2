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
 * TeachingResourcesScreen Component
 * 
 * Comprehensive resource library for Spark teachers.
 * 
 * Features:
 * - Comprehensive resource library with categories
 * - Downloadable lesson plans and activity guides
 * - Video tutorials and training materials
 * - Equipment checklists and setup guides
 * - Safety protocols and emergency procedures
 * - Character development curriculum resources
 * - Assessment tools and rubrics
 * - Parent communication templates
 */

export const TeachingResourcesScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  // Mock data for development
  const resourceCategories = [
    { id: 'all', name: 'All Resources', icon: '📚' },
    { id: 'lesson_plans', name: 'Lesson Plans', icon: '📝' },
    { id: 'activities', name: 'Activities', icon: '🎯' },
    { id: 'videos', name: 'Video Tutorials', icon: '🎥' },
    { id: 'safety', name: 'Safety Protocols', icon: '🛡️' },
    { id: 'equipment', name: 'Equipment Guides', icon: '🔧' },
    { id: 'assessment', name: 'Assessment Tools', icon: '📊' },
    { id: 'communication', name: 'Communication', icon: '💬' },
  ];

  const mockResources = [
    {
      id: '1',
      title: 'Science Museum Adventure - Complete Lesson Plan',
      category: 'lesson_plans',
      type: 'PDF',
      description: 'Comprehensive lesson plan for science museum field trips including pre-visit activities, guided tour structure, and post-visit assessments.',
      duration: '2 hours',
      grade_levels: ['3rd', '4th', '5th'],
      file_size: '2.4 MB',
      download_count: 156,
      rating: 4.8,
      last_updated: '2024-01-10',
      tags: ['science', 'museum', 'hands-on', 'STEM'],
      preview_url: null
    },
    {
      id: '2',
      title: 'Character Building Workshop Activities',
      category: 'activities',
      type: 'PDF',
      description: 'Collection of interactive activities focused on building character traits like honesty, respect, responsibility, and kindness.',
      duration: '90 minutes',
      grade_levels: ['K', '1st', '2nd', '3rd'],
      file_size: '1.8 MB',
      download_count: 203,
      rating: 4.9,
      last_updated: '2024-01-08',
      tags: ['character', 'values', 'interactive', 'group-work'],
      preview_url: null
    },
    {
      id: '3',
      title: 'Safety Protocols for Field Trips',
      category: 'safety',
      type: 'Video',
      description: 'Essential safety training video covering emergency procedures, student supervision, and risk management during educational field trips.',
      duration: '15 minutes',
      grade_levels: ['All'],
      file_size: '45 MB',
      download_count: 89,
      rating: 4.7,
      last_updated: '2024-01-05',
      tags: ['safety', 'emergency', 'procedures', 'training'],
      preview_url: 'https://example.com/video-thumbnail.jpg'
    },
    {
      id: '4',
      title: 'Equipment Setup Guide - Science Experiments',
      category: 'equipment',
      type: 'PDF',
      description: 'Step-by-step guide for setting up science experiment equipment including safety checks and troubleshooting tips.',
      duration: '30 minutes',
      grade_levels: ['3rd', '4th', '5th', '6th'],
      file_size: '3.2 MB',
      download_count: 124,
      rating: 4.6,
      last_updated: '2024-01-12',
      tags: ['equipment', 'setup', 'science', 'experiments'],
      preview_url: null
    },
    {
      id: '5',
      title: 'Student Assessment Rubric Template',
      category: 'assessment',
      type: 'Excel',
      description: 'Customizable rubric template for assessing student participation, learning outcomes, and character development during Spark programs.',
      duration: 'N/A',
      grade_levels: ['All'],
      file_size: '156 KB',
      download_count: 267,
      rating: 4.5,
      last_updated: '2024-01-06',
      tags: ['assessment', 'rubric', 'evaluation', 'template'],
      preview_url: null
    },
    {
      id: '6',
      title: 'Parent Communication Templates',
      category: 'communication',
      type: 'Word',
      description: 'Pre-written email templates for communicating with parents about program updates, student progress, and upcoming events.',
      duration: 'N/A',
      grade_levels: ['All'],
      file_size: '245 KB',
      download_count: 189,
      rating: 4.4,
      last_updated: '2024-01-09',
      tags: ['communication', 'parents', 'templates', 'email'],
      preview_url: null
    }
  ];

  // Load resources on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Teaching resources focused');
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

  // Filter resources based on search and category
  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle resource actions
  const handleResourcePress = (resource: any) => {
    setSelectedResource(selectedResource === resource.id ? null : resource.id);
  };

  const handleDownloadResource = (resource: any) => {
    console.log('Download resource:', resource.id);
    // Simulate download
    alert(`Downloading ${resource.title}...`);
  };

  const handlePreviewResource = (resource: any) => {
    console.log('Preview resource:', resource.id);
    // Navigate to preview screen or open preview modal
  };

  const handleShareResource = (resource: any) => {
    console.log('Share resource:', resource.id);
    // Implement sharing functionality
  };

  const getFileTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'video':
        return '🎥';
      case 'excel':
        return '📊';
      case 'word':
        return '📝';
      default:
        return '📁';
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '#EF4444';
      case 'video':
        return '#8B5CF6';
      case 'excel':
        return '#10B981';
      case 'word':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teaching Resources</Text>
        <Text style={styles.resourceCount}>{filteredResources.length} resources</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search resources..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.content}>
        {/* Left Panel - Categories */}
        <View style={styles.leftPanel}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          <ScrollView style={styles.categoriesList} showsVerticalScrollIndicator={false}>
            {resourceCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.selectedCategoryItem
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === category.id && styles.selectedCategoryName
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Right Panel - Resources */}
        <View style={styles.rightPanel}>
          <ScrollView
            style={styles.resourcesList}
            contentContainerStyle={styles.resourcesListContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#3B82F6"
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {filteredResources.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No resources found</Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery ? 'Try adjusting your search criteria' : 'No resources available in this category'}
                </Text>
              </View>
            ) : (
              filteredResources.map((resource) => (
                <TouchableOpacity
                  key={resource.id}
                  style={[
                    styles.resourceCard,
                    selectedResource === resource.id && styles.selectedResourceCard
                  ]}
                  onPress={() => handleResourcePress(resource)}
                >
                  <View style={styles.resourceHeader}>
                    <View style={styles.resourceInfo}>
                      <View style={styles.resourceTitleRow}>
                        <Text style={styles.fileTypeIcon}>{getFileTypeIcon(resource.type)}</Text>
                        <Text style={styles.resourceTitle}>{resource.title}</Text>
                        <View style={[styles.fileTypeBadge, { backgroundColor: getFileTypeColor(resource.type) }]}>
                          <Text style={styles.fileTypeText}>{resource.type}</Text>
                        </View>
                      </View>
                      <Text style={styles.resourceDescription} numberOfLines={2}>
                        {resource.description}
                      </Text>
                    </View>
                    <View style={styles.resourceMeta}>
                      <Text style={styles.rating}>★ {resource.rating}</Text>
                      <Text style={styles.downloads}>{resource.download_count} downloads</Text>
                    </View>
                  </View>

                  <View style={styles.resourceDetails}>
                    <Text style={styles.detailText}>Duration: {resource.duration}</Text>
                    <Text style={styles.detailText}>Grades: {resource.grade_levels.join(', ')}</Text>
                    <Text style={styles.detailText}>Size: {resource.file_size}</Text>
                    <Text style={styles.detailText}>Updated: {resource.last_updated}</Text>
                  </View>

                  <View style={styles.resourceTags}>
                    {resource.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  {selectedResource === resource.id && (
                    <View style={styles.resourceActions}>
                      <Button
                        variant="primary"
                        size="sm"
                        onPress={() => handleDownloadResource(resource)}
                        style={styles.actionButton}
                      >
                        Download
                      </Button>
                      {resource.preview_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => handlePreviewResource(resource)}
                          style={styles.actionButton}
                        >
                          Preview
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onPress={() => handleShareResource(resource)}
                        style={styles.actionButton}
                      >
                        Share
                      </Button>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
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
  resourceCount: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
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
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  rightPanel: {
    flex: 1,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoriesList: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedCategoryItem: {
    backgroundColor: '#EFF6FF',
    borderRightWidth: 3,
    borderRightColor: '#3B82F6',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
  selectedCategoryName: {
    color: '#3B82F6',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  resourcesList: {
    flex: 1,
  },
  resourcesListContent: {
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
  resourceCard: {
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
  selectedResourceCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#FEFEFE',
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resourceInfo: {
    flex: 1,
    marginRight: 12,
  },
  resourceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fileTypeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 8,
  },
  fileTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  fileTypeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  resourceDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  resourceMeta: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 14,
    color: '#F59E0B',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 4,
  },
  downloads: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  resourceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  resourceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  resourceActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
  },
});

export default TeachingResourcesScreen;
