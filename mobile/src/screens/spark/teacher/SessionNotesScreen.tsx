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
 * SessionNotesScreen Component
 * 
 * Session documentation and note-taking for teachers.
 * 
 * Features:
 * - Session documentation with structured templates
 * - Student behavior and participation tracking
 * - Learning outcomes assessment
 * - Photo and video attachment capabilities
 * - Incident reporting functionality
 * - Parent communication notes
 * - Session rating and feedback
 * - Export session reports
 */

export const SessionNotesScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [noteForm, setNoteForm] = useState({
    session_summary: '',
    learning_outcomes: '',
    student_participation: '',
    behavioral_observations: '',
    challenges_faced: '',
    improvements_needed: '',
    parent_communication: '',
    session_rating: 5,
    follow_up_actions: ''
  });

  // Mock data for development
  const mockCurrentSessions = [
    {
      id: '1',
      program_name: 'Science Museum Adventure',
      school_name: 'Lincoln Elementary',
      date: '2024-01-15',
      time: '10:00 AM - 12:00 PM',
      student_count: 25,
      status: 'in_progress',
      notes_completed: false
    },
    {
      id: '2',
      program_name: 'Character Building Workshop',
      school_name: 'Washington Middle School',
      date: '2024-01-16',
      time: '2:00 PM - 3:30 PM',
      student_count: 30,
      status: 'upcoming',
      notes_completed: false
    }
  ];

  const mockSessionHistory = [
    {
      id: '3',
      program_name: 'Art & Creativity Session',
      school_name: 'Roosevelt Elementary',
      date: '2024-01-10',
      time: '9:00 AM - 10:45 AM',
      student_count: 20,
      status: 'completed',
      notes_completed: true,
      session_rating: 4,
      session_summary: 'Excellent session with high student engagement. Students created beautiful artwork and demonstrated creativity.',
      learning_outcomes: 'Students successfully learned color theory and basic painting techniques.',
      student_participation: 'All students actively participated. Emma and Marcus showed exceptional creativity.',
      behavioral_observations: 'Generally well-behaved group. One minor disruption quickly resolved.',
      challenges_faced: 'Limited art supplies for larger group than expected.',
      improvements_needed: 'Need more paint brushes and larger workspace.',
      parent_communication: 'Sent photos to parents via school communication app.',
      follow_up_actions: 'Order additional art supplies for next session.'
    },
    {
      id: '4',
      program_name: 'Science Experiment Lab',
      school_name: 'Kennedy High School',
      date: '2024-01-08',
      time: '1:00 PM - 3:00 PM',
      student_count: 35,
      status: 'completed',
      notes_completed: true,
      session_rating: 5,
      session_summary: 'Outstanding session with volcano experiment. Students were amazed by the chemical reactions.',
      learning_outcomes: 'Students learned about chemical reactions, acids, and bases.',
      student_participation: 'Excellent participation from all students. Great questions asked.',
      behavioral_observations: 'Very engaged and respectful group throughout the session.',
      challenges_faced: 'None - session went perfectly as planned.',
      improvements_needed: 'Consider adding more advanced experiments for gifted students.',
      parent_communication: 'Positive feedback shared with teachers for parent newsletters.',
      follow_up_actions: 'Prepare advanced experiment variations for next visit.'
    }
  ];

  // Load session notes on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Session notes focused');
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

  // Handle session selection
  const handleSessionSelect = (sessionId: string) => {
    setSelectedSession(sessionId);
    const session = [...mockCurrentSessions, ...mockSessionHistory].find(s => s.id === sessionId);
    if (session && session.notes_completed) {
      setNoteForm({
        session_summary: session.session_summary || '',
        learning_outcomes: session.learning_outcomes || '',
        student_participation: session.student_participation || '',
        behavioral_observations: session.behavioral_observations || '',
        challenges_faced: session.challenges_faced || '',
        improvements_needed: session.improvements_needed || '',
        parent_communication: session.parent_communication || '',
        session_rating: session.session_rating || 5,
        follow_up_actions: session.follow_up_actions || ''
      });
    } else {
      // Reset form for new notes
      setNoteForm({
        session_summary: '',
        learning_outcomes: '',
        student_participation: '',
        behavioral_observations: '',
        challenges_faced: '',
        improvements_needed: '',
        parent_communication: '',
        session_rating: 5,
        follow_up_actions: ''
      });
    }
  };

  // Handle save notes
  const handleSaveNotes = () => {
    Alert.alert(
      'Save Session Notes',
      'Are you sure you want to save these session notes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: () => {
            console.log('Session notes saved:', noteForm);
            setIsEditing(false);
            Alert.alert('Success', 'Session notes saved successfully!');
          }
        }
      ]
    );
  };

  // Handle export session report
  const handleExportReport = (sessionId: string) => {
    console.log('Export session report:', sessionId);
    Alert.alert('Export', 'Session report exported successfully!');
  };

  // Handle add photos/videos
  const handleAddMedia = () => {
    console.log('Add photos/videos');
    Alert.alert('Media', 'Photo/video upload functionality would be implemented here.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in_progress':
        return '#3B82F6';
      case 'upcoming':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'upcoming':
        return 'Upcoming';
      default:
        return status;
    }
  };

  const renderSessionList = (sessions: any[]) => {
    return sessions.map((session) => (
      <TouchableOpacity
        key={session.id}
        style={[
          styles.sessionCard,
          selectedSession === session.id && styles.selectedSessionCard
        ]}
        onPress={() => handleSessionSelect(session.id)}
      >
        <View style={styles.sessionHeader}>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionProgram}>{session.program_name}</Text>
            <Text style={styles.sessionSchool}>{session.school_name}</Text>
            <Text style={styles.sessionDateTime}>{session.date} • {session.time}</Text>
          </View>
          <View style={styles.sessionStatus}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) }]}>
              <Text style={styles.statusText}>{getStatusText(session.status)}</Text>
            </View>
            {session.notes_completed && (
              <Text style={styles.notesCompleted}>✓ Notes Complete</Text>
            )}
          </View>
        </View>
        
        <View style={styles.sessionFooter}>
          <Text style={styles.studentCount}>{session.student_count} students</Text>
          {session.status === 'completed' && (
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => handleExportReport(session.id)}
            >
              <Text style={styles.exportButtonText}>Export Report</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    ));
  };

  const renderNotesForm = () => {
    if (!selectedSession) {
      return (
        <View style={styles.noSelectionContainer}>
          <Text style={styles.noSelectionText}>Select a session to view or add notes</Text>
        </View>
      );
    }

    const session = [...mockCurrentSessions, ...mockSessionHistory].find(s => s.id === selectedSession);
    const canEdit = session?.status === 'completed' || session?.status === 'in_progress';

    return (
      <View style={styles.notesForm}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Session Notes</Text>
          {canEdit && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.editButtonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
          {/* Session Summary */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Session Summary</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={noteForm.session_summary}
              onChangeText={(text) => setNoteForm({...noteForm, session_summary: text})}
              placeholder="Provide an overall summary of the session..."
              multiline
              numberOfLines={3}
              editable={isEditing}
            />
          </View>

          {/* Learning Outcomes */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Learning Outcomes</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={noteForm.learning_outcomes}
              onChangeText={(text) => setNoteForm({...noteForm, learning_outcomes: text})}
              placeholder="What did students learn or achieve?"
              multiline
              numberOfLines={3}
              editable={isEditing}
            />
          </View>

          {/* Student Participation */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Student Participation</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={noteForm.student_participation}
              onChangeText={(text) => setNoteForm({...noteForm, student_participation: text})}
              placeholder="How did students participate? Any standout performers?"
              multiline
              numberOfLines={3}
              editable={isEditing}
            />
          </View>

          {/* Behavioral Observations */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Behavioral Observations</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={noteForm.behavioral_observations}
              onChangeText={(text) => setNoteForm({...noteForm, behavioral_observations: text})}
              placeholder="Note any behavioral observations or incidents..."
              multiline
              numberOfLines={3}
              editable={isEditing}
            />
          </View>

          {/* Challenges Faced */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Challenges Faced</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={noteForm.challenges_faced}
              onChangeText={(text) => setNoteForm({...noteForm, challenges_faced: text})}
              placeholder="What challenges or difficulties were encountered?"
              multiline
              numberOfLines={2}
              editable={isEditing}
            />
          </View>

          {/* Improvements Needed */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Improvements Needed</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={noteForm.improvements_needed}
              onChangeText={(text) => setNoteForm({...noteForm, improvements_needed: text})}
              placeholder="What could be improved for future sessions?"
              multiline
              numberOfLines={2}
              editable={isEditing}
            />
          </View>

          {/* Session Rating */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Session Rating (1-5)</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    noteForm.session_rating >= rating && styles.ratingButtonActive
                  ]}
                  onPress={() => isEditing && setNoteForm({...noteForm, session_rating: rating})}
                  disabled={!isEditing}
                >
                  <Text style={[
                    styles.ratingButtonText,
                    noteForm.session_rating >= rating && styles.ratingButtonTextActive
                  ]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Follow-up Actions */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Follow-up Actions</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={noteForm.follow_up_actions}
              onChangeText={(text) => setNoteForm({...noteForm, follow_up_actions: text})}
              placeholder="What follow-up actions are needed?"
              multiline
              numberOfLines={2}
              editable={isEditing}
            />
          </View>

          {/* Media Section */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Photos & Videos</Text>
            <Button
              variant="outline"
              onPress={handleAddMedia}
              style={styles.mediaButton}
              disabled={!isEditing}
            >
              Add Photos/Videos
            </Button>
          </View>
        </ScrollView>

        {/* Save Button */}
        {isEditing && (
          <View style={styles.saveButtonContainer}>
            <Button
              variant="primary"
              onPress={handleSaveNotes}
              style={styles.saveButton}
            >
              Save Session Notes
            </Button>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Session Notes</Text>
      </View>

      <View style={styles.content}>
        {/* Left Panel - Session List */}
        <View style={styles.leftPanel}>
          {/* Tab Navigation */}
          <View style={styles.tabNavigation}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'current' && styles.activeTab]}
              onPress={() => setActiveTab('current')}
            >
              <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
                Current
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'history' && styles.activeTab]}
              onPress={() => setActiveTab('history')}
            >
              <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                History
              </Text>
            </TouchableOpacity>
          </View>

          {/* Session List */}
          <ScrollView
            style={styles.sessionList}
            contentContainerStyle={styles.sessionListContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#3B82F6"
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'current' 
              ? renderSessionList(mockCurrentSessions)
              : renderSessionList(mockSessionHistory)
            }
          </ScrollView>
        </View>

        {/* Right Panel - Notes Form */}
        <View style={styles.rightPanel}>
          {renderNotesForm()}
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
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    width: '40%',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  rightPanel: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabNavigation: {
    flexDirection: 'row',
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
  sessionList: {
    flex: 1,
  },
  sessionListContent: {
    padding: 12,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedSessionCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionInfo: {
    flex: 1,
    marginRight: 8,
  },
  sessionProgram: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  sessionSchool: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  sessionDateTime: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  sessionStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  notesCompleted: {
    fontSize: 10,
    color: '#10B981',
    fontFamily: 'Inter-Regular',
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentCount: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  exportButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
  exportButtonText: {
    fontSize: 10,
    color: '#374151',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noSelectionText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  notesForm: {
    flex: 1,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  formContent: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Inter-Regular',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingButtonActive: {
    backgroundColor: '#FCD34D',
  },
  ratingButtonText: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  ratingButtonTextActive: {
    color: '#F59E0B',
  },
  mediaButton: {
    alignSelf: 'flex-start',
  },
  saveButtonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    width: '100%',
  },
});

export default SessionNotesScreen;
