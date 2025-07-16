import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Vibration,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp, RouteProp } from '@react-navigation/native';

/**
 * QRCodeScannerScreen Component
 * 
 * QR code scanning interface for student check-in and check-out.
 * 
 * Features:
 * - Real-time QR code scanning with camera integration
 * - Student identification and verification
 * - Check-in and check-out processing
 * - Parent notification triggers
 * - Emergency contact integration
 * - Attendance logging and tracking
 * - Manual entry fallback options
 * - Session validation and security checks
 */

const { width, height } = Dimensions.get('window');

export const QRCodeScannerScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Local state
  const [isScanning, setIsScanning] = useState(true);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'checkin' | 'checkout'>('checkin');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<number>(0);

  // Get scan mode from route params
  const initialMode = route.params?.mode || 'checkin';

  // Mock data for development
  const mockStudentData = {
    'QR001': {
      id: 'student_1',
      first_name: 'Emma',
      last_name: 'Johnson',
      grade: '3rd Grade',
      photo_url: null,
      parent_name: 'Sarah Johnson',
      parent_phone: '(555) 123-4567',
      emergency_contacts: [
        { name: 'Sarah Johnson', phone: '(555) 123-4567', relationship: 'Mother' },
        { name: 'Mike Johnson', phone: '(555) 987-6543', relationship: 'Father' }
      ],
      medical_alerts: ['Peanut allergy - carries EpiPen'],
      current_program: 'Science Museum Adventure',
      session_id: 'session_001',
      check_in_time: null,
      check_out_time: null,
      attendance_status: 'expected'
    },
    'QR002': {
      id: 'student_2',
      first_name: 'Liam',
      last_name: 'Davis',
      grade: '2nd Grade',
      photo_url: null,
      parent_name: 'Jennifer Davis',
      parent_phone: '(555) 234-5678',
      emergency_contacts: [
        { name: 'Jennifer Davis', phone: '(555) 234-5678', relationship: 'Mother' },
        { name: 'Robert Davis', phone: '(555) 876-5432', relationship: 'Father' }
      ],
      medical_alerts: [],
      current_program: 'Art & Creativity Session',
      session_id: 'session_002',
      check_in_time: '2024-01-16 10:15 AM',
      check_out_time: null,
      attendance_status: 'checked_in'
    }
  };

  const mockSessionData = {
    session_001: {
      id: 'session_001',
      program_name: 'Science Museum Adventure',
      teacher_name: 'Ms. Sarah Johnson',
      date: '2024-01-16',
      start_time: '10:00 AM',
      end_time: '12:00 PM',
      location: 'Science Lab',
      status: 'active',
      total_students: 25,
      checked_in: 18,
      checked_out: 0
    },
    session_002: {
      id: 'session_002',
      program_name: 'Art & Creativity Session',
      teacher_name: 'Ms. Emily Chen',
      date: '2024-01-16',
      start_time: '2:00 PM',
      end_time: '3:45 PM',
      location: 'Art Room',
      status: 'active',
      total_students: 18,
      checked_in: 12,
      checked_out: 0
    }
  };

  // Initialize scan mode
  useEffect(() => {
    setScanMode(initialMode);
  }, [initialMode]);

  // Handle screen focus
  useFocusEffect(
    useCallback(() => {
      setIsScanning(true);
      return () => {
        setIsScanning(false);
      };
    }, [])
  );

  // Simulate QR code scanning (in real implementation, this would use camera)
  const simulateQRScan = (qrCode: string) => {
    const now = Date.now();
    
    // Prevent duplicate scans within 2 seconds
    if (now - lastScanTime < 2000) {
      return;
    }
    
    setLastScanTime(now);
    setScannedData(qrCode);
    setIsScanning(false);
    
    // Vibrate on successful scan
    Vibration.vibrate(100);
    
    // Process the scanned QR code
    handleQRCodeScanned(qrCode);
  };

  // Handle QR code scan result
  const handleQRCodeScanned = (qrCode: string) => {
    const studentData = mockStudentData[qrCode];
    
    if (!studentData) {
      Alert.alert(
        'Invalid QR Code',
        'This QR code is not recognized. Please try again or use manual entry.',
        [
          { text: 'Try Again', onPress: () => resumeScanning() },
          { text: 'Manual Entry', onPress: () => handleManualEntry() }
        ]
      );
      return;
    }

    const sessionData = mockSessionData[studentData.session_id];
    
    if (!sessionData) {
      Alert.alert(
        'Session Not Found',
        'No active session found for this student.',
        [{ text: 'OK', onPress: () => resumeScanning() }]
      );
      return;
    }

    // Process check-in or check-out
    if (scanMode === 'checkin') {
      handleCheckIn(studentData, sessionData);
    } else {
      handleCheckOut(studentData, sessionData);
    }
  };

  // Handle student check-in
  const handleCheckIn = (student: any, session: any) => {
    if (student.attendance_status === 'checked_in') {
      Alert.alert(
        'Already Checked In',
        `${student.first_name} ${student.last_name} is already checked in to ${session.program_name}.`,
        [{ text: 'OK', onPress: () => resumeScanning() }]
      );
      return;
    }

    const checkInTime = new Date().toLocaleString();
    
    Alert.alert(
      'Check-In Successful',
      `${student.first_name} ${student.last_name} has been checked in to ${session.program_name} at ${checkInTime}.`,
      [
        {
          text: 'Continue Scanning',
          onPress: () => {
            // Update student status (in real app, this would be an API call)
            console.log('Check-in processed:', {
              student_id: student.id,
              session_id: session.id,
              check_in_time: checkInTime,
              mode: 'checkin'
            });
            
            // Send parent notification
            sendParentNotification(student, 'checkin', checkInTime);
            
            resumeScanning();
          }
        },
        {
          text: 'View Details',
          onPress: () => showStudentDetails(student, session, 'checkin')
        }
      ]
    );
  };

  // Handle student check-out
  const handleCheckOut = (student: any, session: any) => {
    if (student.attendance_status !== 'checked_in') {
      Alert.alert(
        'Not Checked In',
        `${student.first_name} ${student.last_name} is not currently checked in to any session.`,
        [{ text: 'OK', onPress: () => resumeScanning() }]
      );
      return;
    }

    const checkOutTime = new Date().toLocaleString();
    
    Alert.alert(
      'Check-Out Successful',
      `${student.first_name} ${student.last_name} has been checked out from ${session.program_name} at ${checkOutTime}.`,
      [
        {
          text: 'Continue Scanning',
          onPress: () => {
            // Update student status (in real app, this would be an API call)
            console.log('Check-out processed:', {
              student_id: student.id,
              session_id: session.id,
              check_out_time: checkOutTime,
              mode: 'checkout'
            });
            
            // Send parent notification
            sendParentNotification(student, 'checkout', checkOutTime);
            
            resumeScanning();
          }
        },
        {
          text: 'View Details',
          onPress: () => showStudentDetails(student, session, 'checkout')
        }
      ]
    );
  };

  // Send parent notification
  const sendParentNotification = (student: any, type: 'checkin' | 'checkout', time: string) => {
    console.log('Sending parent notification:', {
      parent_phone: student.parent_phone,
      student_name: `${student.first_name} ${student.last_name}`,
      type,
      time,
      program: student.current_program
    });
    
    // In real implementation, this would trigger SMS/email/push notification
    Alert.alert(
      'Parent Notified',
      `${student.parent_name} has been notified of the ${type} at ${time}.`,
      [{ text: 'OK' }]
    );
  };

  // Show student details
  const showStudentDetails = (student: any, session: any, action: string) => {
    navigation.navigate('StudentDetails', {
      student,
      session,
      action,
      returnTo: 'QRScanner'
    });
  };

  // Handle manual entry
  const handleManualEntry = () => {
    navigation.navigate('ManualAttendance', { mode: scanMode });
  };

  // Resume scanning
  const resumeScanning = () => {
    setScannedData(null);
    setIsScanning(true);
  };

  // Toggle flash
  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  // Switch scan mode
  const switchScanMode = () => {
    setScanMode(scanMode === 'checkin' ? 'checkout' : 'checkin');
    resumeScanning();
  };

  // Handle emergency
  const handleEmergency = () => {
    Alert.alert(
      'Emergency Protocol',
      'This will initiate emergency procedures. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Emergency', 
          style: 'destructive',
          onPress: () => navigation.navigate('EmergencyProtocol')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {scanMode === 'checkin' ? 'Check-In Scanner' : 'Check-Out Scanner'}
        </Text>
        <TouchableOpacity onPress={handleEmergency}>
          <Text style={styles.emergencyButton}>🚨</Text>
        </TouchableOpacity>
      </View>

      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeButton, scanMode === 'checkin' && styles.modeButtonActive]}
          onPress={() => setScanMode('checkin')}
        >
          <Text style={[styles.modeButtonText, scanMode === 'checkin' && styles.modeButtonTextActive]}>
            Check-In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, scanMode === 'checkout' && styles.modeButtonActive]}
          onPress={() => setScanMode('checkout')}
        >
          <Text style={[styles.modeButtonText, scanMode === 'checkout' && styles.modeButtonTextActive]}>
            Check-Out
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scanner Area */}
      <View style={styles.scannerContainer}>
        <View style={styles.cameraPlaceholder}>
          {isScanning ? (
            <View style={styles.scanningArea}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanningText}>
                Position QR code within the frame
              </Text>
              <Text style={styles.scanningSubtext}>
                {scanMode === 'checkin' ? 'Scanning for check-in' : 'Scanning for check-out'}
              </Text>
            </View>
          ) : (
            <View style={styles.scannedArea}>
              <Text style={styles.scannedText}>✓ QR Code Scanned</Text>
              <Text style={styles.scannedData}>{scannedData}</Text>
            </View>
          )}
        </View>

        {/* Scanner Controls */}
        <View style={styles.scannerControls}>
          <TouchableOpacity
            style={[styles.controlButton, flashEnabled && styles.controlButtonActive]}
            onPress={toggleFlash}
          >
            <Text style={styles.controlButtonText}>💡</Text>
            <Text style={styles.controlButtonLabel}>Flash</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleManualEntry}
          >
            <Text style={styles.controlButtonText}>⌨️</Text>
            <Text style={styles.controlButtonLabel}>Manual</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => navigation.navigate('AttendanceList')}
          >
            <Text style={styles.controlButtonText}>📋</Text>
            <Text style={styles.controlButtonLabel}>List</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Test Buttons (for development) */}
      <View style={styles.testSection}>
        <Text style={styles.testTitle}>Test QR Codes (Development)</Text>
        <View style={styles.testButtons}>
          <Button
            variant="outline"
            size="sm"
            onPress={() => simulateQRScan('QR001')}
            style={styles.testButton}
          >
            Emma Johnson
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => simulateQRScan('QR002')}
            style={styles.testButton}
          >
            Liam Davis
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => simulateQRScan('INVALID')}
            style={styles.testButton}
          >
            Invalid QR
          </Button>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <Text style={styles.instructionsText}>
          1. Select check-in or check-out mode
        </Text>
        <Text style={styles.instructionsText}>
          2. Point camera at student's QR code
        </Text>
        <Text style={styles.instructionsText}>
          3. Wait for automatic scan and confirmation
        </Text>
        <Text style={styles.instructionsText}>
          4. Parent will be notified automatically
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!isScanning && (
          <Button
            variant="primary"
            size="medium"
            onPress={resumeScanning}
            style={styles.actionButton}
          >
            Resume Scanning
          </Button>
        )}
        <Button
          variant="outline"
          size="medium"
          onPress={() => navigation.navigate('SessionManagement')}
          style={styles.actionButton}
        >
          Manage Sessions
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  emergencyButton: {
    fontSize: 24,
    padding: 4,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  scannerContainer: {
    flex: 1,
    margin: 16,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanningArea: {
    alignItems: 'center',
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    marginBottom: 24,
    position: 'relative',
  },
  scanningText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: 8,
  },
  scanningSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  scannedArea: {
    alignItems: 'center',
  },
  scannedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  scannedData: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  scannerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#374151',
    borderRadius: 8,
    marginTop: 16,
  },
  controlButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  controlButtonActive: {
    backgroundColor: '#3B82F6',
  },
  controlButtonText: {
    fontSize: 20,
    marginBottom: 4,
  },
  controlButtonLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
  },
  testSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  testTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  testButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  testButton: {
    flex: 1,
  },
  instructions: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
});

export default QRCodeScannerScreen;
