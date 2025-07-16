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
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * ProgramManagementScreen Component
 * 
 * Comprehensive program oversight and management for school administrators.
 * 
 * Features:
 * - Program approval and oversight workflows
 * - Performance analytics and success metrics
 * - Budget tracking and resource allocation
 * - Quality assurance and compliance monitoring
 * - Teacher assignment and coordination
 * - Student participation tracking
 * - Program scheduling and availability
 * - Feedback collection and analysis
 */

export const ProgramManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  // Mock data for development
  const filterOptions = [
    { label: 'All Programs', value: 'all', count: 15 },
    { label: 'Pending Approval', value: 'pending', count: 3 },
    { label: 'Active', value: 'active', count: 8 },
    { label: 'Completed', value: 'completed', count: 4 },
  ];

  const mockPrograms = [
    {
      id: '1',
      title: 'Science Museum Adventure',
      category: 'STEM',
      status: 'active',
      teacher: 'Ms. Sarah Johnson',
      teacher_id: 'teacher_1',
      grade_levels: ['3rd', '4th', '5th'],
      duration: 120,
      capacity: 30,
      enrolled_students: 25,
      sessions_completed: 8,
      total_sessions: 12,
      success_rate: 94.2,
      satisfaction_score: 4.8,
      budget_allocated: 2500,
      budget_used: 1875,
      next_session: '2024-01-16',
      created_date: '2023-12-01',
      approved_date: '2023-12-05',
      compliance_status: 'compliant',
      safety_incidents: 0,
      parent_feedback_count: 18,
      description: 'Interactive science exploration through museum exhibits and hands-on experiments.',
      learning_objectives: [
        'Understand basic scientific principles',
        'Develop curiosity and observation skills',
        'Practice scientific method'
      ],
      required_materials: ['Safety goggles', 'Lab notebooks', 'Experiment kits'],
      special_requirements: 'Wheelchair accessible venue required'
    },
    {
      id: '2',
      title: 'Character Building Workshop',
      category: 'Social-Emotional',
      status: 'pending',
      teacher: 'Mr. David Wilson',
      teacher_id: 'teacher_2',
      grade_levels: ['K', '1st', '2nd'],
      duration: 90,
      capacity: 25,
      enrolled_students: 0,
      sessions_completed: 0,
      total_sessions: 6,
      success_rate: null,
      satisfaction_score: null,
      budget_allocated: 1800,
      budget_used: 0,
      next_session: '2024-01-20',
      created_date: '2024-01-10',
      approved_date: null,
      compliance_status: 'pending_review',
      safety_incidents: 0,
      parent_feedback_count: 0,
      description: 'Building strong character through interactive activities focused on values and ethics.',
      learning_objectives: [
        'Develop empathy and kindness',
        'Learn conflict resolution skills',
        'Practice teamwork and cooperation'
      ],
      required_materials: ['Activity worksheets', 'Role-play props', 'Storybooks'],
      special_requirements: 'Quiet space for reflection activities'
    },
    {
      id: '3',
      title: 'Art & Creativity Session',
      category: 'Arts',
      status: 'active',
      teacher: 'Ms. Emily Chen',
      teacher_id: 'teacher_3',
      grade_levels: ['2nd', '3rd', '4th'],
      duration: 105,
      capacity: 20,
      enrolled_students: 18,
      sessions_completed: 4,
      total_sessions: 8,
      success_rate: 96.8,
      satisfaction_score: 4.9,
      budget_allocated: 2200,
      budget_used: 1320,
      next_session: '2024-01-18',
      created_date: '2023-11-15',
      approved_date: '2023-11-20',
      compliance_status: 'compliant',
      safety_incidents: 0,
      parent_feedback_count: 15,
      description: 'Unleash creativity through various art forms and mixed media projects.',
      learning_objectives: [
        'Explore different art techniques',
        'Express creativity and imagination',
        'Develop fine motor skills'
      ],
      required_materials: ['Art supplies', 'Canvases', 'Protective clothing'],
      special_requirements: 'Well-ventilated room for paint activities'
    },
    {
      id: '4',
      title: 'Nature Discovery Walk',
      category: 'Environmental',
      status: 'completed',
      teacher: 'Mr. James Rodriguez',
      teacher_id: 'teacher_4',
      grade_levels: ['1st', '2nd', '3rd'],
      duration: 150,
      capacity: 15,
      enrolled_students: 15,
      sessions_completed: 6,
      total_sessions: 6,
      success_rate: 100,
      satisfaction_score: 4.6,
      budget_allocated: 1500,
      budget_used: 1450,
      next_session: null,
      created_date: '2023-10-01',
      approved_date: '2023-10-05',
      compliance_status: 'compliant',
      safety_incidents: 0,
      parent_feedback_count: 12,
      description: 'Outdoor exploration and environmental education through guided nature walks.',
      learning_objectives: [
        'Learn about local ecosystems',
        'Develop observation skills',
        'Foster environmental awareness'
      ],
      required_materials: ['Field guides', 'Magnifying glasses', 'Collection bags'],
      special_requirements: 'Weather-dependent scheduling'
    }
  ];

  // Load programs on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Program management focused');
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

  // Filter programs
  const filteredPrograms = mockPrograms.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || program.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Handle program actions
  const handleProgramPress = (program: any) => {
    setSelectedProgram(selectedProgram === program.id ? null : program.id);
  };

  const handleApproveProgram = (program: any) => {
    Alert.alert(
      'Approve Program',
      `Are you sure you want to approve "${program.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          onPress: () => {
            console.log('Approve program:', program.id);
            Alert.alert('Success', 'Program approved successfully!');
          }
        }
      ]
    );
  };

  const handleRejectProgram = (program: any) => {
    Alert.alert(
      'Reject Program',
      `Are you sure you want to reject "${program.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: () => {
            console.log('Reject program:', program.id);
            Alert.alert('Program Rejected', 'Program has been rejected. Teacher will be notified.');
          }
        }
      ]
    );
  };

  const handleSuspendProgram = (program: any) => {
    Alert.alert(
      'Suspend Program',
      `Are you sure you want to suspend "${program.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Suspend', 
          style: 'destructive',
          onPress: () => {
            console.log('Suspend program:', program.id);
            Alert.alert('Program Suspended', 'Program has been suspended. All participants will be notified.');
          }
        }
      ]
    );
  };

  const handleViewTeacher = (teacherId: string) => {
    console.log('Navigate to teacher details:', teacherId);
    // navigation.navigate('TeacherDetails', { teacherId });
  };

  const handleViewAnalytics = (program: any) => {
    console.log('Navigate to program analytics:', program.id);
    // navigation.navigate('ProgramAnalytics', { programId: program.id });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'completed':
        return '#3B82F6';
      case 'suspended':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending Approval';
      case 'completed':
        return 'Completed';
      case 'suspended':
        return 'Suspended';
      default:
        return status;
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return '#10B981';
      case 'pending_review':
        return '#F59E0B';
      case 'non_compliant':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getComplianceText = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'Compliant';
      case 'pending_review':
        return 'Pending Review';
      case 'non_compliant':
        return 'Non-Compliant';
      default:
        return status;
    }
  };

  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const calculateBudgetUtilization = (used: number, allocated: number) => {
    return allocated > 0 ? (used / allocated) * 100 : 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Program Management</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search programs, teachers, or categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
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
            <View style={[
              styles.filterTabBadge,
              selectedFilter === filter.value && styles.filterTabBadgeActive
            ]}>
              <Text style={[
                styles.filterTabBadgeText,
                selectedFilter === filter.value && styles.filterTabBadgeTextActive
              ]}>
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

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
              {searchQuery ? 'Try adjusting your search criteria' : 'No programs match the selected filter'}
            </Text>
          </View>
        ) : (
          filteredPrograms.map((program) => (
            <TouchableOpacity
              key={program.id}
              style={[
                styles.programCard,
                selectedProgram === program.id && styles.selectedProgramCard
              ]}
              onPress={() => handleProgramPress(program)}
            >
              <View style={styles.programHeader}>
                <View style={styles.programTitleContainer}>
                  <Text style={styles.programTitle}>{program.title}</Text>
                  <Text style={styles.programCategory}>{program.category}</Text>
                </View>
                <View style={styles.programBadges}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(program.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(program.status)}</Text>
                  </View>
                  <View style={[styles.complianceBadge, { backgroundColor: getComplianceColor(program.compliance_status) }]}>
                    <Text style={styles.complianceText}>{getComplianceText(program.compliance_status)}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.teacherInfo}
                onPress={() => handleViewTeacher(program.teacher_id)}
              >
                <Text style={styles.teacherLabel}>Teacher:</Text>
                <Text style={styles.teacherName}>{program.teacher}</Text>
                <Text style={styles.viewTeacherText}>View →</Text>
              </TouchableOpacity>

              <View style={styles.programStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{program.enrolled_students}/{program.capacity}</Text>
                  <Text style={styles.statLabel}>Enrolled</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{program.sessions_completed}/{program.total_sessions}</Text>
                  <Text style={styles.statLabel}>Sessions</Text>
                </View>
                {program.success_rate && (
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, styles.successRate]}>{program.success_rate}%</Text>
                    <Text style={styles.statLabel}>Success Rate</Text>
                  </View>
                )}
                {program.satisfaction_score && (
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, styles.satisfaction]}>★ {program.satisfaction_score}</Text>
                    <Text style={styles.statLabel}>Satisfaction</Text>
                  </View>
                )}
              </View>

              <View style={styles.budgetInfo}>
                <Text style={styles.budgetLabel}>Budget: ${program.budget_used} / ${program.budget_allocated}</Text>
                <View style={styles.budgetBar}>
                  <View 
                    style={[
                      styles.budgetProgress, 
                      { width: `${calculateBudgetUtilization(program.budget_used, program.budget_allocated)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.budgetPercentage}>
                  {calculateBudgetUtilization(program.budget_used, program.budget_allocated).toFixed(1)}% utilized
                </Text>
              </View>

              {selectedProgram === program.id && (
                <View style={styles.expandedContent}>
                  <Text style={styles.programDescription}>{program.description}</Text>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>Learning Objectives:</Text>
                    {program.learning_objectives.map((objective, index) => (
                      <Text key={index} style={styles.objectiveText}>• {objective}</Text>
                    ))}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>Grade Levels:</Text>
                    <Text style={styles.detailText}>{program.grade_levels.join(', ')}</Text>
                  </View>

                  {program.special_requirements && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailTitle}>Special Requirements:</Text>
                      <Text style={styles.requirementText}>{program.special_requirements}</Text>
                    </View>
                  )}

                  <View style={styles.actionButtons}>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => handleViewAnalytics(program)}
                      style={styles.actionButton}
                    >
                      Analytics
                    </Button>
                    
                    {program.status === 'pending' && (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          onPress={() => handleRejectProgram(program)}
                          style={styles.actionButton}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onPress={() => handleApproveProgram(program)}
                          style={styles.actionButton}
                        >
                          Approve
                        </Button>
                      </>
                    )}
                    
                    {program.status === 'active' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onPress={() => handleSuspendProgram(program)}
                        style={styles.actionButton}
                      >
                        Suspend
                      </Button>
                    )}
                  </View>
                </View>
              )}
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
  backButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  headerSpacer: {
    width: 50,
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
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    marginRight: 6,
  },
  filterTabTextActive: {
    color: '#3B82F6',
  },
  filterTabBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterTabBadgeActive: {
    backgroundColor: '#3B82F6',
  },
  filterTabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'Inter-SemiBold',
  },
  filterTabBadgeTextActive: {
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
  selectedProgramCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#FEFEFE',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    marginBottom: 2,
  },
  programCategory: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  programBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  complianceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  complianceText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  teacherLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginRight: 6,
  },
  teacherName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  viewTeacherText: {
    fontSize: 12,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  programStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  successRate: {
    color: '#10B981',
  },
  satisfaction: {
    color: '#F59E0B',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  budgetInfo: {
    marginBottom: 12,
  },
  budgetLabel: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  budgetBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 4,
  },
  budgetProgress: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  budgetPercentage: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  expandedContent: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  programDescription: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
  objectiveText: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  requirementText: {
    fontSize: 13,
    color: '#F59E0B',
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
});

export default ProgramManagementScreen;
