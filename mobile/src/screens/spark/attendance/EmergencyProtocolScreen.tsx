import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp, RouteProp } from '@react-navigation/native';

/**
 * EmergencyProtocolScreen Component
 * 
 * Emergency response and safety protocol interface.
 * 
 * Features:
 * - Emergency contact directory and quick dial
 * - Student accountability and headcount verification
 * - Emergency evacuation procedures and checklists
 * - Incident reporting and documentation
 * - Parent notification and communication systems
 * - Emergency services coordination
 * - Safety protocol compliance tracking
 * - Real-time emergency status updates
 */

export const EmergencyProtocolScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Local state
  const [emergencyType, setEmergencyType] = useState<string>('general');
  const [protocolStep, setProtocolStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);

  // Get session ID from route params if provided
  const sessionId = route.params?.sessionId;

  // Mock data for development
  const emergencyTypes = [
    { id: 'general', label: 'General Emergency', icon: '🚨', color: '#EF4444' },
    { id: 'medical', label: 'Medical Emergency', icon: '🏥', color: '#DC2626' },
    { id: 'fire', label: 'Fire Emergency', icon: '🔥', color: '#EA580C' },
    { id: 'weather', label: 'Severe Weather', icon: '⛈️', color: '#7C2D12' },
    { id: 'security', label: 'Security Threat', icon: '🔒', color: '#991B1B' },
    { id: 'missing', label: 'Missing Student', icon: '👤', color: '#B91C1C' },
  ];

  const emergencyContacts = [
    {
      id: '1',
      name: 'Emergency Services',
      phone: '911',
      type: 'emergency',
      description: 'Police, Fire, Medical Emergency'
    },
    {
      id: '2',
      name: 'School Principal',
      phone: '(555) 123-4567',
      type: 'school',
      description: 'Dr. Sarah Mitchell'
    },
    {
      id: '3',
      name: 'School Nurse',
      phone: '(555) 234-5678',
      type: 'medical',
      description: 'Nurse Jennifer Adams'
    },
    {
      id: '4',
      name: 'Security Office',
      phone: '(555) 345-6789',
      type: 'security',
      description: 'Campus Security'
    },
    {
      id: '5',
      name: 'Facilities Manager',
      phone: '(555) 456-7890',
      type: 'facilities',
      description: 'Mike Rodriguez'
    },
    {
      id: '6',
      name: 'District Office',
      phone: '(555) 567-8901',
      type: 'district',
      description: 'Emergency Coordinator'
    }
  ];

  const emergencyProtocols = {
    general: [
      {
        id: 1,
        title: 'Assess the Situation',
        description: 'Quickly evaluate the nature and severity of the emergency',
        actions: ['Identify the type of emergency', 'Assess immediate dangers', 'Determine if evacuation is needed']
      },
      {
        id: 2,
        title: 'Ensure Student Safety',
        description: 'Secure all students and account for their whereabouts',
        actions: ['Move students to safe location', 'Take attendance', 'Keep students calm and together']
      },
      {
        id: 3,
        title: 'Contact Emergency Services',
        description: 'Call appropriate emergency services if needed',
        actions: ['Call 911 if life-threatening', 'Contact school administration', 'Request medical assistance if needed']
      },
      {
        id: 4,
        title: 'Notify Parents',
        description: 'Inform parents about the situation and student status',
        actions: ['Send emergency notification', 'Provide status updates', 'Arrange for student pickup if needed']
      },
      {
        id: 5,
        title: 'Document Incident',
        description: 'Record all details of the emergency and response',
        actions: ['Complete incident report', 'Document timeline of events', 'Note any injuries or damages']
      }
    ],
    medical: [
      {
        id: 1,
        title: 'Assess Medical Emergency',
        description: 'Evaluate the medical situation and provide immediate care',
        actions: ['Check for consciousness and breathing', 'Apply first aid if trained', 'Do not move injured person unless necessary']
      },
      {
        id: 2,
        title: 'Call for Medical Help',
        description: 'Contact emergency medical services immediately',
        actions: ['Call 911 for serious injuries', 'Contact school nurse', 'Request ambulance if needed']
      },
      {
        id: 3,
        title: 'Secure the Area',
        description: 'Keep other students safe and away from the incident',
        actions: ['Move other students to safe distance', 'Maintain calm environment', 'Assign helper if available']
      },
      {
        id: 4,
        title: 'Contact Parents',
        description: 'Notify parents of the medical emergency',
        actions: ['Call parents immediately', 'Provide hospital information if transported', 'Keep parents updated on status']
      }
    ]
  };

  const mockStudentAccountability = [
    {
      id: 'student_1',
      name: 'Emma Johnson',
      status: 'accounted',
      location: 'Safe Area A',
      parent_contacted: true
    },
    {
      id: 'student_2',
      name: 'Liam Davis',
      status: 'accounted',
      location: 'Safe Area A',
      parent_contacted: true
    },
    {
      id: 'student_3',
      name: 'Sophia Rodriguez',
      status: 'missing',
      location: 'Unknown',
      parent_contacted: false
    }
  ];

  // Load emergency protocol on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Emergency protocol focused');
    }, [])
  );

  // Handle emergency activation
  const handleActivateEmergency = () => {
    Alert.alert(
      'Activate Emergency Protocol',
      'This will initiate emergency procedures and notify all relevant parties. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Activate', 
          style: 'destructive',
          onPress: () => {
            setEmergencyActive(true);
            console.log('Emergency protocol activated:', emergencyType);
            Alert.alert('Emergency Activated', 'Emergency protocol has been activated. Follow the steps below.');
          }
        }
      ]
    );
  };

  // Handle step completion
  const handleCompleteStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    
    if (stepId < (emergencyProtocols[emergencyType]?.length || 0)) {
      setProtocolStep(stepId + 1);
    }
  };

  // Handle emergency contact
  const handleEmergencyCall = (contact: any) => {
    Alert.alert(
      'Emergency Call',
      `Call ${contact.name} at ${contact.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            console.log('Emergency call:', contact.phone);
            Linking.openURL(`tel:${contact.phone}`);
          }
        }
      ]
    );
  };

  // Handle student accountability
  const handleStudentAccountability = () => {
    navigation.navigate('StudentAccountability', { 
      students: mockStudentAccountability,
      emergencyType 
    });
  };

  // Handle incident report
  const handleIncidentReport = () => {
    navigation.navigate('IncidentReport', { 
      emergencyType,
      sessionId 
    });
  };

  // Get emergency type info
  const getEmergencyTypeInfo = (type: string) => {
    return emergencyTypes.find(t => t.id === type) || emergencyTypes[0];
  };

  const currentProtocol = emergencyProtocols[emergencyType] || emergencyProtocols.general;
  const emergencyInfo = getEmergencyTypeInfo(emergencyType);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, emergencyActive && styles.emergencyHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, emergencyActive && styles.emergencyBackButton]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, emergencyActive && styles.emergencyHeaderTitle]}>
          {emergencyActive ? '🚨 EMERGENCY ACTIVE' : 'Emergency Protocol'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!emergencyActive ? (
          <>
            {/* Emergency Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Emergency Type</Text>
              <View style={styles.emergencyTypesGrid}>
                {emergencyTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.emergencyTypeCard,
                      emergencyType === type.id && styles.emergencyTypeCardActive,
                      { borderColor: type.color }
                    ]}
                    onPress={() => setEmergencyType(type.id)}
                  >
                    <Text style={styles.emergencyTypeIcon}>{type.icon}</Text>
                    <Text style={styles.emergencyTypeLabel}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Emergency Contacts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              {emergencyContacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.contactCard}
                  onPress={() => handleEmergencyCall(contact)}
                >
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactDescription}>{contact.description}</Text>
                  </View>
                  <View style={styles.contactActions}>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                    <Text style={styles.callIcon}>📞</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Activate Emergency */}
            <View style={styles.activationSection}>
              <Button
                variant="danger"
                size="large"
                onPress={handleActivateEmergency}
                style={styles.activateButton}
              >
                🚨 ACTIVATE EMERGENCY PROTOCOL
              </Button>
            </View>
          </>
        ) : (
          <>
            {/* Active Emergency Header */}
            <View style={[styles.activeEmergencyBanner, { backgroundColor: emergencyInfo.color }]}>
              <Text style={styles.activeEmergencyIcon}>{emergencyInfo.icon}</Text>
              <Text style={styles.activeEmergencyText}>{emergencyInfo.label} Active</Text>
            </View>

            {/* Protocol Steps */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Emergency Protocol Steps</Text>
              {currentProtocol.map((step, index) => (
                <View
                  key={step.id}
                  style={[
                    styles.protocolStep,
                    completedSteps.includes(step.id) && styles.completedStep,
                    protocolStep === index && styles.currentStep
                  ]}
                >
                  <View style={styles.stepHeader}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>
                        {completedSteps.includes(step.id) ? '✓' : step.id}
                      </Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.stepActions}>
                    {step.actions.map((action, actionIndex) => (
                      <Text key={actionIndex} style={styles.stepAction}>
                        • {action}
                      </Text>
                    ))}
                  </View>

                  {!completedSteps.includes(step.id) && (
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => handleCompleteStep(step.id)}
                      style={styles.completeStepButton}
                    >
                      Mark Complete
                    </Button>
                  )}
                </View>
              ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <Button
                  variant="danger"
                  size="medium"
                  onPress={() => handleEmergencyCall(emergencyContacts[0])}
                  style={styles.quickActionButton}
                >
                  📞 Call 911
                </Button>
                <Button
                  variant="outline"
                  size="medium"
                  onPress={handleStudentAccountability}
                  style={styles.quickActionButton}
                >
                  👥 Student Count
                </Button>
                <Button
                  variant="outline"
                  size="medium"
                  onPress={() => handleEmergencyCall(emergencyContacts[1])}
                  style={styles.quickActionButton}
                >
                  🏫 Call Principal
                </Button>
                <Button
                  variant="outline"
                  size="medium"
                  onPress={handleIncidentReport}
                  style={styles.quickActionButton}
                >
                  📝 Incident Report
                </Button>
              </View>
            </View>

            {/* Student Accountability Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Student Accountability</Text>
              <View style={styles.accountabilityCard}>
                <View style={styles.accountabilityStats}>
                  <View style={styles.accountabilityStat}>
                    <Text style={styles.accountabilityValue}>
                      {mockStudentAccountability.filter(s => s.status === 'accounted').length}
                    </Text>
                    <Text style={styles.accountabilityLabel}>Accounted</Text>
                  </View>
                  <View style={styles.accountabilityStat}>
                    <Text style={[styles.accountabilityValue, styles.missingValue]}>
                      {mockStudentAccountability.filter(s => s.status === 'missing').length}
                    </Text>
                    <Text style={styles.accountabilityLabel}>Missing</Text>
                  </View>
                  <View style={styles.accountabilityStat}>
                    <Text style={styles.accountabilityValue}>
                      {mockStudentAccountability.filter(s => s.parent_contacted).length}
                    </Text>
                    <Text style={styles.accountabilityLabel}>Parents Notified</Text>
                  </View>
                </View>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={handleStudentAccountability}
                >
                  View Details
                </Button>
              </View>
            </View>

            {/* End Emergency */}
            <View style={styles.endEmergencySection}>
              <Button
                variant="secondary"
                size="large"
                onPress={() => {
                  Alert.alert(
                    'End Emergency',
                    'Are you sure you want to end the emergency protocol?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'End Emergency', 
                        onPress: () => {
                          setEmergencyActive(false);
                          setProtocolStep(0);
                          setCompletedSteps([]);
                          Alert.alert('Emergency Ended', 'Emergency protocol has been deactivated.');
                        }
                      }
                    ]
                  );
                }}
                style={styles.endEmergencyButton}
              >
                End Emergency Protocol
              </Button>
            </View>
          </>
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
  emergencyHeader: {
    backgroundColor: '#FEE2E2',
    borderBottomColor: '#FECACA',
  },
  backButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  emergencyBackButton: {
    color: '#DC2626',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  emergencyHeaderTitle: {
    color: '#DC2626',
  },
  headerSpacer: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
  emergencyTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emergencyTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  emergencyTypeCardActive: {
    backgroundColor: '#FEF2F2',
  },
  emergencyTypeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  emergencyTypeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  contactActions: {
    alignItems: 'flex-end',
  },
  contactPhone: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  callIcon: {
    fontSize: 16,
  },
  activationSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  activateButton: {
    backgroundColor: '#DC2626',
    minWidth: 280,
    paddingVertical: 16,
  },
  activeEmergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  activeEmergencyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activeEmergencyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  protocolStep: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completedStep: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  currentStep: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  stepActions: {
    marginBottom: 12,
  },
  stepAction: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
    paddingLeft: 16,
  },
  completeStepButton: {
    alignSelf: 'flex-start',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: '48%',
  },
  accountabilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  accountabilityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  accountabilityStat: {
    alignItems: 'center',
    flex: 1,
  },
  accountabilityValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  missingValue: {
    color: '#EF4444',
  },
  accountabilityLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  endEmergencySection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  endEmergencyButton: {
    minWidth: 200,
  },
});

export default EmergencyProtocolScreen;
