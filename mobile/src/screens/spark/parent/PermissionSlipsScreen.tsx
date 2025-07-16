import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * PermissionSlipsScreen Component
 * 
 * Digital permission slip management for parents.
 * 
 * Features:
 * - Digital permission slip management with e-signatures
 * - Status tracking (pending, signed, expired)
 * - Automatic reminders for upcoming deadlines
 * - Bulk signing for multiple children
 * - Document history and archival
 * - Emergency contact verification
 * - Medical information updates
 * - Photo/video consent management
 */

export const PermissionSlipsScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('pending');
  const [selectedChild, setSelectedChild] = useState<string>('all');

  // Mock data for development
  const mockChildren = [
    { id: '1', name: 'Emma Johnson' },
    { id: '2', name: 'Liam Johnson' }
  ];

  const filterOptions = [
    { label: 'Pending', value: 'pending', count: 3 },
    { label: 'Signed', value: 'signed', count: 8 },
    { label: 'Expired', value: 'expired', count: 1 },
    { label: 'All', value: 'all', count: 12 },
  ];

  const mockPermissionSlips = [
    {
      id: '1',
      title: 'Science Museum Field Trip Permission',
      program_name: 'Science Museum Adventure',
      child_name: 'Emma Johnson',
      child_id: '1',
      due_date: '2024-01-12',
      created_date: '2024-01-05',
      status: 'pending',
      priority: 'high',
      description: 'Permission required for field trip to the Science Museum including transportation and activities.',
      requirements: [
        'Parent/guardian signature',
        'Emergency contact information',
        'Medical information update',
        'Photo/video consent'
      ],
      details: {
        date: '2024-01-15',
        time: '10:00 AM - 3:00 PM',
        location: 'City Science Museum',
        transportation: 'School bus provided',
        cost: '$25.00',
        lunch: 'Bring packed lunch',
        chaperones_needed: true
      },
      emergency_contacts: [
        { name: 'Sarah Johnson', phone: '(555) 123-4567', relationship: 'Mother' },
        { name: 'Mike Johnson', phone: '(555) 987-6543', relationship: 'Father' }
      ],
      medical_info: {
        allergies: ['Peanuts', 'Shellfish'],
        medications: [],
        special_needs: ['ADHD - requires frequent breaks'],
        emergency_medical_contact: 'Dr. Smith - (555) 555-5555'
      }
    },
    {
      id: '2',
      title: 'Character Building Workshop Consent',
      program_name: 'Character Building Workshop',
      child_name: 'Emma Johnson',
      child_id: '1',
      due_date: '2024-01-18',
      created_date: '2024-01-08',
      status: 'pending',
      priority: 'medium',
      description: 'Consent form for participation in character building activities and discussions.',
      requirements: [
        'Parent/guardian signature',
        'Behavioral expectations acknowledgment'
      ],
      details: {
        date: '2024-01-20',
        time: '2:00 PM - 3:30 PM',
        location: 'Lincoln Elementary - Room 101',
        transportation: 'No transportation needed',
        cost: '$20.00',
        lunch: 'Not applicable',
        chaperones_needed: false
      },
      emergency_contacts: [
        { name: 'Sarah Johnson', phone: '(555) 123-4567', relationship: 'Mother' }
      ],
      medical_info: {
        allergies: ['Peanuts'],
        medications: [],
        special_needs: ['ADHD - requires frequent breaks'],
        emergency_medical_contact: 'Dr. Smith - (555) 555-5555'
      }
    },
    {
      id: '3',
      title: 'Art Workshop Permission',
      program_name: 'Art & Creativity Session',
      child_name: 'Liam Johnson',
      child_id: '2',
      due_date: '2024-01-22',
      created_date: '2024-01-10',
      status: 'pending',
      priority: 'low',
      description: 'Permission for art activities involving various materials and potential mess.',
      requirements: [
        'Parent/guardian signature',
        'Clothing/mess acknowledgment'
      ],
      details: {
        date: '2024-01-25',
        time: '9:00 AM - 11:00 AM',
        location: 'Roosevelt Elementary - Art Room',
        transportation: 'Parent drop-off/pickup',
        cost: '$30.00',
        lunch: 'Not applicable',
        chaperones_needed: true
      },
      emergency_contacts: [
        { name: 'Sarah Johnson', phone: '(555) 123-4567', relationship: 'Mother' }
      ],
      medical_info: {
        allergies: [],
        medications: [],
        special_needs: [],
        emergency_medical_contact: 'Dr. Smith - (555) 555-5555'
      }
    },
    {
      id: '4',
      title: 'Nature Walk Permission - SIGNED',
      program_name: 'Nature Discovery Walk',
      child_name: 'Emma Johnson',
      child_id: '1',
      due_date: '2024-01-08',
      created_date: '2024-01-01',
      status: 'signed',
      priority: 'medium',
      signed_date: '2024-01-07',
      signed_by: 'Sarah Johnson',
      description: 'Permission for outdoor nature exploration and walking activities.',
      requirements: [
        'Parent/guardian signature ✓',
        'Weather acknowledgment ✓'
      ]
    },
    {
      id: '5',
      title: 'Swimming Activity - EXPIRED',
      program_name: 'Water Safety Program',
      child_name: 'Liam Johnson',
      child_id: '2',
      due_date: '2024-01-05',
      created_date: '2023-12-28',
      status: 'expired',
      priority: 'high',
      description: 'Permission for swimming and water safety activities.',
      requirements: [
        'Parent/guardian signature',
        'Swimming ability confirmation',
        'Medical clearance'
      ]
    }
  ];

  // Load permission slips on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Permission slips focused');
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

  // Filter permission slips
  const filteredSlips = mockPermissionSlips.filter(slip => {
    const matchesStatus = selectedFilter === 'all' || slip.status === selectedFilter;
    const matchesChild = selectedChild === 'all' || slip.child_id === selectedChild;
    return matchesStatus && matchesChild;
  });

  // Handle permission slip actions
  const handleSlipPress = (slip: any) => {
    console.log('Navigate to permission slip details:', slip.id);
    // navigation.navigate('PermissionSlipDetails', { slipId: slip.id });
  };

  const handleQuickSign = (slip: any) => {
    if (slip.status !== 'pending') return;
    
    Alert.alert(
      'Quick Sign',
      `Are you sure you want to sign the permission slip for "${slip.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign', 
          onPress: () => {
            console.log('Quick sign permission slip:', slip.id);
            Alert.alert('Success', 'Permission slip signed successfully!');
          }
        }
      ]
    );
  };

  const handleBulkSign = () => {
    const pendingSlips = filteredSlips.filter(slip => slip.status === 'pending');
    if (pendingSlips.length === 0) {
      Alert.alert('No Pending Slips', 'There are no pending permission slips to sign.');
      return;
    }

    Alert.alert(
      'Bulk Sign',
      `Sign all ${pendingSlips.length} pending permission slips?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign All', 
          onPress: () => {
            console.log('Bulk sign permission slips');
            Alert.alert('Success', `${pendingSlips.length} permission slips signed successfully!`);
          }
        }
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'signed':
        return '#10B981';
      case 'expired':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Signature';
      case 'signed':
        return 'Signed';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Permission Slips</Text>
        {filteredSlips.filter(slip => slip.status === 'pending').length > 1 && (
          <Button
            variant="primary"
            size="sm"
            onPress={handleBulkSign}
          >
            Sign All
          </Button>
        )}
      </View>

      {/* Child Filter */}
      {mockChildren.length > 1 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.childFilterContainer}
          contentContainerStyle={styles.childFilterContent}
        >
          <TouchableOpacity
            style={[
              styles.childFilterTab,
              selectedChild === 'all' && styles.childFilterTabActive
            ]}
            onPress={() => setSelectedChild('all')}
          >
            <Text style={[
              styles.childFilterText,
              selectedChild === 'all' && styles.childFilterTextActive
            ]}>
              All Children
            </Text>
          </TouchableOpacity>
          {mockChildren.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={[
                styles.childFilterTab,
                selectedChild === child.id && styles.childFilterTabActive
              ]}
              onPress={() => setSelectedChild(child.id)}
            >
              <Text style={[
                styles.childFilterText,
                selectedChild === child.id && styles.childFilterTextActive
              ]}>
                {child.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Status Filter Tabs */}
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

      {/* Permission Slips List */}
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
        {filteredSlips.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No permission slips found</Text>
            <Text style={styles.emptyStateText}>
              No permission slips match the selected filter
            </Text>
          </View>
        ) : (
          filteredSlips.map((slip) => {
            const daysUntilDue = getDaysUntilDue(slip.due_date);
            const isUrgent = daysUntilDue <= 2 && slip.status === 'pending';
            
            return (
              <TouchableOpacity
                key={slip.id}
                style={[
                  styles.slipCard,
                  isUrgent && styles.urgentSlipCard
                ]}
                onPress={() => handleSlipPress(slip)}
              >
                <View style={styles.slipHeader}>
                  <View style={styles.slipTitleContainer}>
                    <Text style={styles.slipTitle}>{slip.title}</Text>
                    <View style={styles.slipBadges}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(slip.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(slip.status)}</Text>
                      </View>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(slip.priority) }]}>
                        <Text style={styles.priorityText}>{slip.priority.toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <Text style={styles.slipProgram}>{slip.program_name}</Text>
                <Text style={styles.slipChild}>For: {slip.child_name}</Text>
                <Text style={styles.slipDescription} numberOfLines={2}>
                  {slip.description}
                </Text>

                <View style={styles.slipMeta}>
                  <Text style={styles.slipDueDate}>
                    Due: {slip.due_date}
                    {slip.status === 'pending' && (
                      <Text style={[styles.daysRemaining, isUrgent && styles.urgentText]}>
                        {daysUntilDue > 0 ? ` (${daysUntilDue} days left)` : ' (OVERDUE)'}
                      </Text>
                    )}
                  </Text>
                  {slip.signed_date && (
                    <Text style={styles.signedInfo}>
                      Signed on {slip.signed_date} by {slip.signed_by}
                    </Text>
                  )}
                </View>

                {slip.status === 'pending' && (
                  <View style={styles.slipActions}>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => handleSlipPress(slip)}
                      style={styles.detailsButton}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => handleQuickSign(slip)}
                      style={styles.signButton}
                    >
                      Quick Sign
                    </Button>
                  </View>
                )}

                {isUrgent && (
                  <View style={styles.urgentBanner}>
                    <Text style={styles.urgentBannerText}>⚠️ URGENT: Due soon!</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
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
  childFilterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  childFilterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  childFilterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  childFilterTabActive: {
    backgroundColor: '#10B981',
  },
  childFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  childFilterTextActive: {
    color: '#FFFFFF',
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
    fontSize: 14,
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
    fontSize: 11,
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
  slipCard: {
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
    position: 'relative',
  },
  urgentSlipCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    backgroundColor: '#FFFBEB',
  },
  slipHeader: {
    marginBottom: 8,
  },
  slipTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  slipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 12,
  },
  slipBadges: {
    flexDirection: 'row',
    gap: 6,
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
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  slipProgram: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 4,
  },
  slipChild: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  slipDescription: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  slipMeta: {
    marginBottom: 12,
  },
  slipDueDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  daysRemaining: {
    fontSize: 12,
    color: '#F59E0B',
    fontFamily: 'Inter-Regular',
  },
  urgentText: {
    color: '#EF4444',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  signedInfo: {
    fontSize: 12,
    color: '#10B981',
    fontFamily: 'Inter-Regular',
  },
  slipActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailsButton: {
    flex: 1,
  },
  signButton: {
    flex: 1,
  },
  urgentBanner: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  urgentBannerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
});

export default PermissionSlipsScreen;
