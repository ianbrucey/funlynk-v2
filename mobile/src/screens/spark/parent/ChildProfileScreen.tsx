import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp, RouteProp } from '@react-navigation/native';

/**
 * ChildProfileScreen Component
 * 
 * Comprehensive child profile management for parents.
 * 
 * Features:
 * - Complete child profile with photo and basic information
 * - Academic progress tracking across programs
 * - Behavioral development notes and milestones
 * - Interest and preference tracking
 * - Medical information and emergency contacts
 * - Achievement badges and certificates
 * - Program history and attendance records
 * - Parent notes and observations
 */

export const ChildProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'medical' | 'history'>('overview');

  // Get child ID from route params
  const childId = route.params?.childId || '1';

  // Mock data for development
  const mockChildProfile = {
    id: childId,
    first_name: 'Emma',
    last_name: 'Johnson',
    photo_url: null,
    date_of_birth: '2015-03-15',
    age: 8,
    grade: '3rd Grade',
    school: 'Lincoln Elementary School',
    parent_name: 'Sarah Johnson',
    created_date: '2023-09-01',
    interests: ['Science', 'Art', 'Reading', 'Animals', 'Music'],
    personality_traits: ['Curious', 'Creative', 'Helpful', 'Energetic'],
    learning_style: 'Visual and hands-on learner',
    favorite_subjects: ['Science', 'Art'],
    goals: [
      'Improve confidence in group presentations',
      'Develop leadership skills',
      'Explore STEM activities'
    ],
    emergency_contacts: [
      {
        id: '1',
        name: 'Sarah Johnson',
        relationship: 'Mother',
        phone: '(555) 123-4567',
        email: 'sarah.johnson@email.com',
        is_primary: true
      },
      {
        id: '2',
        name: 'Mike Johnson',
        relationship: 'Father',
        phone: '(555) 987-6543',
        email: 'mike.johnson@email.com',
        is_primary: false
      },
      {
        id: '3',
        name: 'Mary Johnson',
        relationship: 'Grandmother',
        phone: '(555) 555-1234',
        email: 'mary.johnson@email.com',
        is_primary: false
      }
    ],
    medical_information: {
      allergies: [
        { name: 'Peanuts', severity: 'Severe', notes: 'Carries EpiPen' },
        { name: 'Shellfish', severity: 'Moderate', notes: 'Avoid all shellfish' }
      ],
      medications: [
        { name: 'ADHD Medication', dosage: '10mg daily', time: 'Morning with breakfast' }
      ],
      special_needs: [
        'ADHD - requires frequent breaks and clear instructions',
        'Needs quiet space for sensory breaks'
      ],
      medical_conditions: [],
      doctor_info: {
        name: 'Dr. Smith',
        phone: '(555) 555-5555',
        practice: 'Children\'s Medical Center'
      },
      insurance_info: {
        provider: 'Blue Cross Blue Shield',
        policy_number: 'BC123456789',
        group_number: 'GRP001'
      }
    },
    academic_progress: {
      overall_rating: 4.2,
      programs_completed: 12,
      total_hours: 48,
      favorite_program: 'Science Museum Adventure',
      strengths: [
        'Excellent participation in hands-on activities',
        'Shows strong curiosity and asks thoughtful questions',
        'Works well in small group settings',
        'Demonstrates creativity in problem-solving'
      ],
      areas_for_improvement: [
        'Building confidence in large group presentations',
        'Developing patience during detailed instructions',
        'Improving focus during longer activities'
      ],
      recent_achievements: [
        {
          id: '1',
          title: 'Science Explorer',
          description: 'Completed 5 science experiments with excellence',
          date: '2024-01-10',
          badge_icon: '🔬'
        },
        {
          id: '2',
          title: 'Team Player',
          description: 'Demonstrated excellent collaboration skills',
          date: '2024-01-08',
          badge_icon: '🤝'
        },
        {
          id: '3',
          title: 'Creative Thinker',
          description: 'Showed outstanding creativity in art projects',
          date: '2024-01-05',
          badge_icon: '🎨'
        }
      ]
    },
    program_history: [
      {
        id: '1',
        program_name: 'Science Museum Adventure',
        date: '2024-01-10',
        duration: 120,
        attendance: 'Present',
        rating: 5,
        teacher_notes: 'Emma showed excellent curiosity and asked great questions about the volcano experiment.',
        parent_notes: 'She came home very excited and explained everything she learned.'
      },
      {
        id: '2',
        program_name: 'Character Building Workshop',
        date: '2024-01-08',
        duration: 90,
        attendance: 'Present',
        rating: 4,
        teacher_notes: 'Great teamwork and leadership skills demonstrated during group activities.',
        parent_notes: 'Noticed improvement in sharing and helping her brother at home.'
      },
      {
        id: '3',
        program_name: 'Art & Creativity Session',
        date: '2024-01-05',
        duration: 105,
        attendance: 'Present',
        rating: 5,
        teacher_notes: 'Outstanding creativity and attention to detail in her artwork.',
        parent_notes: 'Very proud of her painting - she wants to frame it for her room.'
      }
    ],
    attendance_stats: {
      total_sessions: 15,
      attended: 14,
      missed: 1,
      attendance_rate: 93.3
    }
  };

  // Load child profile on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Child profile focused for child:', childId);
    }, [childId])
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

  // Handle profile actions
  const handleEditProfile = () => {
    console.log('Navigate to edit profile');
    // navigation.navigate('EditChildProfile', { childId });
  };

  const handleUpdateMedical = () => {
    console.log('Navigate to update medical info');
    // navigation.navigate('UpdateMedicalInfo', { childId });
  };

  const handleViewProgress = () => {
    console.log('Navigate to detailed progress');
    // navigation.navigate('ChildProgress', { childId });
  };

  const handleAddNote = () => {
    Alert.alert('Add Note', 'Parent note functionality would be implemented here.');
  };

  const handleEmergencyContact = (contact: any) => {
    Alert.alert(
      'Emergency Contact',
      `Call ${contact.name} at ${contact.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Call:', contact.phone) }
      ]
    );
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Age</Text>
                  <Text style={styles.infoValue}>{calculateAge(mockChildProfile.date_of_birth)} years old</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Grade</Text>
                  <Text style={styles.infoValue}>{mockChildProfile.grade}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>School</Text>
                  <Text style={styles.infoValue}>{mockChildProfile.school}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Birth Date</Text>
                  <Text style={styles.infoValue}>{mockChildProfile.date_of_birth}</Text>
                </View>
              </View>
            </View>

            {/* Interests & Personality */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests & Personality</Text>
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Interests</Text>
                <View style={styles.tagsContainer}>
                  {mockChildProfile.interests.map((interest, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Personality Traits</Text>
                <View style={styles.tagsContainer}>
                  {mockChildProfile.personality_traits.map((trait, index) => (
                    <View key={index} style={[styles.tag, styles.personalityTag]}>
                      <Text style={[styles.tagText, styles.personalityTagText]}>{trait}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Learning Style</Text>
                <Text style={styles.learningStyle}>{mockChildProfile.learning_style}</Text>
              </View>
            </View>

            {/* Goals */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Development Goals</Text>
              {mockChildProfile.goals.map((goal, index) => (
                <View key={index} style={styles.goalItem}>
                  <Text style={styles.goalText}>• {goal}</Text>
                </View>
              ))}
            </View>

            {/* Emergency Contacts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              {mockChildProfile.emergency_contacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.contactCard}
                  onPress={() => handleEmergencyContact(contact)}
                >
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>
                      {contact.name}
                      {contact.is_primary && <Text style={styles.primaryBadge}> (Primary)</Text>}
                    </Text>
                    <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                  <Text style={styles.callButton}>📞</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'progress':
        return (
          <View style={styles.tabContent}>
            {/* Progress Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Academic Progress</Text>
              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatValue}>{mockChildProfile.academic_progress.overall_rating}</Text>
                  <Text style={styles.progressStatLabel}>Overall Rating</Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatValue}>{mockChildProfile.academic_progress.programs_completed}</Text>
                  <Text style={styles.progressStatLabel}>Programs Completed</Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatValue}>{mockChildProfile.academic_progress.total_hours}h</Text>
                  <Text style={styles.progressStatLabel}>Total Hours</Text>
                </View>
              </View>
            </View>

            {/* Strengths */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Strengths</Text>
              {mockChildProfile.academic_progress.strengths.map((strength, index) => (
                <View key={index} style={styles.strengthItem}>
                  <Text style={styles.strengthText}>✓ {strength}</Text>
                </View>
              ))}
            </View>

            {/* Areas for Improvement */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Areas for Improvement</Text>
              {mockChildProfile.academic_progress.areas_for_improvement.map((area, index) => (
                <View key={index} style={styles.improvementItem}>
                  <Text style={styles.improvementText}>→ {area}</Text>
                </View>
              ))}
            </View>

            {/* Recent Achievements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Achievements</Text>
              <View style={styles.achievementsGrid}>
                {mockChildProfile.academic_progress.recent_achievements.map((achievement) => (
                  <View key={achievement.id} style={styles.achievementCard}>
                    <Text style={styles.achievementIcon}>{achievement.badge_icon}</Text>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                    <Text style={styles.achievementDate}>{achievement.date}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );

      case 'medical':
        return (
          <View style={styles.tabContent}>
            {/* Allergies */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Allergies</Text>
              {mockChildProfile.medical_information.allergies.map((allergy, index) => (
                <View key={index} style={styles.allergyCard}>
                  <View style={styles.allergyHeader}>
                    <Text style={styles.allergyName}>{allergy.name}</Text>
                    <View style={[
                      styles.severityBadge,
                      { backgroundColor: allergy.severity === 'Severe' ? '#EF4444' : '#F59E0B' }
                    ]}>
                      <Text style={styles.severityText}>{allergy.severity}</Text>
                    </View>
                  </View>
                  <Text style={styles.allergyNotes}>{allergy.notes}</Text>
                </View>
              ))}
            </View>

            {/* Medications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medications</Text>
              {mockChildProfile.medical_information.medications.map((medication, index) => (
                <View key={index} style={styles.medicationCard}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationDosage}>Dosage: {medication.dosage}</Text>
                  <Text style={styles.medicationTime}>Time: {medication.time}</Text>
                </View>
              ))}
            </View>

            {/* Special Needs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Special Needs</Text>
              {mockChildProfile.medical_information.special_needs.map((need, index) => (
                <View key={index} style={styles.specialNeedItem}>
                  <Text style={styles.specialNeedText}>• {need}</Text>
                </View>
              ))}
            </View>

            {/* Doctor Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Primary Care Doctor</Text>
              <View style={styles.doctorCard}>
                <Text style={styles.doctorName}>{mockChildProfile.medical_information.doctor_info.name}</Text>
                <Text style={styles.doctorPractice}>{mockChildProfile.medical_information.doctor_info.practice}</Text>
                <Text style={styles.doctorPhone}>{mockChildProfile.medical_information.doctor_info.phone}</Text>
              </View>
            </View>
          </View>
        );

      case 'history':
        return (
          <View style={styles.tabContent}>
            {/* Attendance Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attendance Statistics</Text>
              <View style={styles.attendanceStats}>
                <View style={styles.attendanceStat}>
                  <Text style={styles.attendanceStatValue}>{mockChildProfile.attendance_stats.attendance_rate}%</Text>
                  <Text style={styles.attendanceStatLabel}>Attendance Rate</Text>
                </View>
                <View style={styles.attendanceStat}>
                  <Text style={styles.attendanceStatValue}>{mockChildProfile.attendance_stats.attended}</Text>
                  <Text style={styles.attendanceStatLabel}>Sessions Attended</Text>
                </View>
                <View style={styles.attendanceStat}>
                  <Text style={styles.attendanceStatValue}>{mockChildProfile.attendance_stats.missed}</Text>
                  <Text style={styles.attendanceStatLabel}>Sessions Missed</Text>
                </View>
              </View>
            </View>

            {/* Program History */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Program History</Text>
              {mockChildProfile.program_history.map((program) => (
                <View key={program.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyProgram}>{program.program_name}</Text>
                    <View style={styles.historyRating}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text
                          key={star}
                          style={[
                            styles.star,
                            { color: star <= program.rating ? '#F59E0B' : '#E5E7EB' }
                          ]}
                        >
                          ★
                        </Text>
                      ))}
                    </View>
                  </View>
                  <Text style={styles.historyDate}>{program.date} • {program.duration} minutes</Text>
                  <Text style={styles.historyAttendance}>Attendance: {program.attendance}</Text>
                  
                  {program.teacher_notes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.notesTitle}>Teacher Notes:</Text>
                      <Text style={styles.notesText}>"{program.teacher_notes}"</Text>
                    </View>
                  )}
                  
                  {program.parent_notes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.notesTitle}>Parent Notes:</Text>
                      <Text style={styles.notesText}>"{program.parent_notes}"</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Button
          variant="outline"
          size="sm"
          onPress={handleEditProfile}
        >
          Edit Profile
        </Button>
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          {mockChildProfile.photo_url ? (
            <Image source={{ uri: mockChildProfile.photo_url }} style={styles.profileImage} />
          ) : (
            <Text style={styles.profileInitials}>
              {mockChildProfile.first_name.charAt(0)}{mockChildProfile.last_name.charAt(0)}
            </Text>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {mockChildProfile.first_name} {mockChildProfile.last_name}
          </Text>
          <Text style={styles.profileDetails}>
            {mockChildProfile.grade} • {mockChildProfile.school}
          </Text>
          <Text style={styles.profileParent}>Parent: {mockChildProfile.parent_name}</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'progress', label: 'Progress' },
          { key: 'medical', label: 'Medical' },
          { key: 'history', label: 'History' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
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
        {renderTabContent()}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddNote}>
        <Text style={styles.fabIcon}>📝</Text>
      </TouchableOpacity>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInitials: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  profileParent: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  tabContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
  },
  subsection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  personalityTag: {
    backgroundColor: '#F0FDF4',
  },
  personalityTagText: {
    color: '#16A34A',
  },
  learningStyle: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  goalItem: {
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  primaryBadge: {
    fontSize: 12,
    color: '#10B981',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  contactRelationship: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  callButton: {
    fontSize: 24,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    fontFamily: 'Inter-Bold',
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    textAlign: 'center',
  },
  strengthItem: {
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 14,
    color: '#10B981',
    fontFamily: 'Inter-Regular',
  },
  improvementItem: {
    marginBottom: 8,
  },
  improvementText: {
    fontSize: 14,
    color: '#F59E0B',
    fontFamily: 'Inter-Regular',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  allergyCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  allergyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  allergyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    fontFamily: 'Inter-SemiBold',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  allergyNotes: {
    fontSize: 14,
    color: '#92400E',
    fontFamily: 'Inter-Regular',
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  medicationTime: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  specialNeedItem: {
    marginBottom: 8,
  },
  specialNeedText: {
    fontSize: 14,
    color: '#F59E0B',
    fontFamily: 'Inter-Regular',
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  doctorPractice: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  doctorPhone: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  attendanceStat: {
    alignItems: 'center',
  },
  attendanceStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: 'Inter-Bold',
  },
  attendanceStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyProgram: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  historyRating: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
    marginLeft: 2,
  },
  historyDate: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  historyAttendance: {
    fontSize: 14,
    color: '#10B981',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 12,
  },
  notesSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 24,
  },
});

export default ChildProfileScreen;
