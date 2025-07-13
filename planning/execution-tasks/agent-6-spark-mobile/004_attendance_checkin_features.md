# Task 004: Attendance Check-in Features Implementation
**Agent**: Spark Mobile UI Developer  
**Estimated Time**: 6-7 hours  
**Priority**: Medium  
**Dependencies**: Agent 6 Task 003 (School Admin Interface), Agent 3 Task 003 (Booking Management API)  

## Overview
Implement comprehensive attendance and check-in features for Funlynk Spark mobile app including QR code scanning, digital attendance tracking, real-time parent notifications, and session management using the established design system and component library.

## Prerequisites
- School admin interface complete (Agent 6 Task 003)
- Booking Management API endpoints available (Agent 3 Task 003)
- Camera permissions and QR code scanning capability
- Real-time notification system configured

## Step-by-Step Implementation

### Step 1: Create QR Code Check-in System (2.5 hours)

**Create QRCodeScannerScreen component:**
```bash
# Create attendance screen directory
mkdir -p src/screens/spark/attendance

# Create QRCodeScannerScreen component
touch src/screens/spark/attendance/QRCodeScannerScreen.tsx
```

**Implement QRCodeScannerScreen.tsx using template pattern:**
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Vibration,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';

// Shared components
import { Button } from '../../../components/shared/atoms/Button';
import { LoadingSpinner } from '../../../components/shared/atoms/LoadingSpinner';

// Attendance-specific components
import { ScannerOverlay } from '../../../components/spark/molecules/ScannerOverlay';
import { AttendanceHeader } from '../../../components/spark/molecules/AttendanceHeader';
import { StudentCheckInCard } from '../../../components/spark/molecules/StudentCheckInCard';

// Hooks
import { useAttendance } from '../../../hooks/spark/useAttendance';
import { useAuth } from '../../../hooks/shared/useAuth';
import { useErrorHandler } from '../../../hooks/shared/useErrorHandler';
import { usePermissions } from '../../../hooks/shared/usePermissions';

// Types
import type { Student, AttendanceRecord } from '../../../types/spark';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import type { SparkAttendanceStackParamList } from '../../../navigation/SparkAttendanceNavigator';

/**
 * QRCodeScannerScreen Component
 * 
 * QR code scanner for student check-in/check-out with real-time attendance
 * tracking and parent notifications.
 * 
 * Features:
 * - QR code scanning with camera integration
 * - Student identification and verification
 * - Check-in/check-out status tracking
 * - Real-time parent notifications
 * - Offline attendance recording
 * - Emergency contact integration
 * - Photo capture for verification
 * - Bulk check-in capabilities
 */

type QRCodeScannerScreenNavigationProp = NavigationProp<SparkAttendanceStackParamList, 'QRCodeScanner'>;
type QRCodeScannerScreenRouteProp = RouteProp<SparkAttendanceStackParamList, 'QRCodeScanner'>;

export const QRCodeScannerScreen: React.FC = () => {
  const navigation = useNavigation<QRCodeScannerScreenNavigationProp>();
  const route = useRoute<QRCodeScannerScreenRouteProp>();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  
  // Route params
  const { sessionId, mode = 'checkin' } = route.params || {};
  
  // Redux state
  const {
    currentSession,
    attendanceRecords,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.attendance);
  
  // Local state
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Camera setup
  const devices = useCameraDevices();
  const device = devices.back;
  
  // QR code scanning
  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true,
  });

  // Custom hooks
  const {
    checkInStudent,
    checkOutStudent,
    loadSessionAttendance,
    verifyStudentQR,
    sendParentNotification,
  } = useAttendance();
  
  const { requestCameraPermission } = usePermissions();

  // Request camera permission on mount
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const granted = await requestCameraPermission();
        setHasPermission(granted);
      } catch (error) {
        handleError(error);
      }
    };
    
    requestPermission();
  }, [requestCameraPermission, handleError]);

  // Load session attendance data
  useEffect(() => {
    if (sessionId) {
      loadSessionAttendance(sessionId);
    }
  }, [sessionId, loadSessionAttendance]);

  // Handle QR code scan
  useEffect(() => {
    if (barcodes.length > 0 && isScanning) {
      const qrCode = barcodes[0];
      handleQRCodeScan(qrCode.displayValue);
    }
  }, [barcodes, isScanning]);

  // Process QR code scan
  const handleQRCodeScan = useCallback(async (qrData: string) => {
    try {
      setIsScanning(false);
      Vibration.vibrate(100);
      
      // Verify QR code and get student information
      const student = await verifyStudentQR(qrData, sessionId);
      
      if (student) {
        setScannedStudent(student);
        setShowConfirmation(true);
      } else {
        Alert.alert(
          'Invalid QR Code',
          'This QR code is not valid for this session.',
          [{ text: 'OK', onPress: () => setIsScanning(true) }]
        );
      }
    } catch (error) {
      handleError(error);
      setIsScanning(true);
    }
  }, [sessionId, verifyStudentQR, handleError]);

  // Handle check-in confirmation
  const handleCheckInConfirm = useCallback(async () => {
    if (!scannedStudent) return;
    
    try {
      if (mode === 'checkin') {
        await checkInStudent(scannedStudent.id, sessionId);
        await sendParentNotification(scannedStudent.id, 'checkin', sessionId);
      } else {
        await checkOutStudent(scannedStudent.id, sessionId);
        await sendParentNotification(scannedStudent.id, 'checkout', sessionId);
      }
      
      Alert.alert(
        'Success',
        `${scannedStudent.firstName} has been ${mode === 'checkin' ? 'checked in' : 'checked out'} successfully.`,
        [{ text: 'OK', onPress: handleResetScanner }]
      );
    } catch (error) {
      handleError(error);
      handleResetScanner();
    }
  }, [scannedStudent, mode, sessionId, checkInStudent, checkOutStudent, sendParentNotification, handleError]);

  // Reset scanner for next scan
  const handleResetScanner = useCallback(() => {
    setScannedStudent(null);
    setShowConfirmation(false);
    setIsScanning(true);
  }, []);

  // Handle manual entry
  const handleManualEntry = useCallback(() => {
    navigation.navigate('ManualAttendance', { sessionId, mode });
  }, [navigation, sessionId, mode]);

  // Render permission request
  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            Please allow camera access to scan QR codes for attendance.
          </Text>
          <Button
            variant="primary"
            size="large"
            onPress={requestCameraPermission}
            style={styles.permissionButton}
          >
            Grant Permission
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Render loading state
  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Initializing camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AttendanceHeader
        title={`Student ${mode === 'checkin' ? 'Check-In' : 'Check-Out'}`}
        sessionName={currentSession?.programName || 'Spark Session'}
        onBackPress={() => navigation.goBack()}
        onManualEntryPress={handleManualEntry}
      />

      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          device={device}
          isActive={isScanning && !showConfirmation}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
        />
        
        <ScannerOverlay
          isScanning={isScanning}
          mode={mode}
          instructions={`Point camera at student's QR code to ${mode === 'checkin' ? 'check in' : 'check out'}`}
        />
      </View>

      {/* Student Confirmation Modal */}
      {showConfirmation && scannedStudent && (
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationModal}>
            <StudentCheckInCard
              student={scannedStudent}
              mode={mode}
              sessionInfo={currentSession}
              onConfirm={handleCheckInConfirm}
              onCancel={handleResetScanner}
              loading={isLoading}
            />
          </View>
        </View>
      )}

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          variant="secondary"
          size="medium"
          onPress={() => navigation.navigate('AttendanceList', { sessionId })}
          style={styles.actionButton}
        >
          View Attendance
        </Button>
        <Button
          variant="secondary"
          size="medium"
          onPress={handleManualEntry}
          style={styles.actionButton}
        >
          Manual Entry
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    minWidth: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  confirmationModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
```

**Create ManualAttendanceScreen component:**
```bash
touch src/screens/spark/attendance/ManualAttendanceScreen.tsx
```

**Implement ManualAttendanceScreen.tsx for manual check-in:**
- Student list with search and filter capabilities
- Manual check-in/check-out with reason codes
- Bulk attendance actions
- Late arrival and early departure tracking
- Absence reason documentation
- Parent notification triggers

### Step 2: Create Attendance Management and Reporting (2 hours)

**Create AttendanceListScreen component:**
```bash
touch src/screens/spark/attendance/AttendanceListScreen.tsx
```

**Implement AttendanceListScreen.tsx for attendance overview:**
- Real-time attendance status for current session
- Student list with check-in/check-out times
- Attendance statistics and summaries
- Missing student alerts and notifications
- Export attendance reports
- Historical attendance data
- Parent contact information for absences
- Emergency contact protocols

**Create AttendanceReportScreen component:**
```bash
touch src/screens/spark/attendance/AttendanceReportScreen.tsx
```

**Implement AttendanceReportScreen.tsx for detailed reporting:**
- Comprehensive attendance analytics
- Attendance trends and patterns
- Individual student attendance history
- Program-specific attendance rates
- Teacher performance metrics
- Parent engagement correlation
- Compliance reporting for school districts
- Custom report generation and export

### Step 3: Create Session Management and Coordination (1.5 hours)

**Create SessionManagementScreen component:**
```bash
touch src/screens/spark/attendance/SessionManagementScreen.tsx
```

**Implement SessionManagementScreen.tsx for session oversight:**
- Active session monitoring and control
- Student roster management
- Real-time attendance tracking
- Session notes and observations
- Incident reporting and documentation
- Emergency procedures and contacts
- Session completion and wrap-up
- Handoff to next teacher or staff

**Create EmergencyProtocolScreen component:**
```bash
touch src/screens/spark/attendance/EmergencyProtocolScreen.tsx
```

**Implement EmergencyProtocolScreen.tsx for emergency management:**
- Emergency contact information
- Evacuation procedures and protocols
- Student accountability during emergencies
- Parent notification systems
- Emergency services contact
- Incident documentation and reporting
- Recovery and reunification procedures
- Communication with school administration

## Acceptance Criteria

### Functional Requirements
- [ ] QR code scanning works reliably for student identification
- [ ] Check-in/check-out process is fast and accurate
- [ ] Manual attendance entry provides comprehensive options
- [ ] Real-time parent notifications are sent successfully
- [ ] Attendance reports provide meaningful insights
- [ ] Session management enables effective oversight
- [ ] Emergency protocols are easily accessible
- [ ] Offline functionality works when network is unavailable

### Technical Requirements
- [ ] All screens follow established component template patterns
- [ ] Camera integration works on both iOS and Android
- [ ] QR code scanning is optimized for performance
- [ ] Real-time updates work reliably
- [ ] Offline data synchronization functions correctly
- [ ] Error handling covers all edge cases
- [ ] Security measures protect student data
- [ ] Performance optimized for quick check-ins

### Design Requirements
- [ ] Screens match design system specifications exactly
- [ ] Scanner interface is intuitive and user-friendly
- [ ] Attendance status indicators are clear and color-coded
- [ ] Emergency information is prominently displayed
- [ ] Loading and error states are visually consistent
- [ ] Mobile-first design optimized for quick interactions

### Testing Requirements
- [ ] Unit tests for all custom hooks
- [ ] Component tests for all screen components
- [ ] Integration tests for attendance workflows
- [ ] QR code scanning functionality testing
- [ ] Real-time notification testing
- [ ] Offline functionality testing
- [ ] Emergency protocol testing
- [ ] Performance testing with large student groups

## Manual Testing Instructions

### Test Case 1: QR Code Check-in
1. Open QR scanner and verify camera functionality
2. Test QR code scanning with valid student codes
3. Test check-in confirmation and parent notification
4. Test invalid QR code handling
5. Test offline check-in functionality
6. Verify attendance record creation

### Test Case 2: Manual Attendance
1. Navigate to manual attendance screen
2. Test student search and filtering
3. Test manual check-in with reason codes
4. Test bulk attendance actions
5. Test late arrival documentation
6. Test absence reason recording

### Test Case 3: Attendance Management
1. View real-time attendance list
2. Test attendance statistics and summaries
3. Test missing student alerts
4. Test attendance report generation
5. Test historical data access
6. Test export functionality

### Test Case 4: Emergency Protocols
1. Access emergency protocol information
2. Test emergency contact functionality
3. Test incident reporting
4. Test evacuation procedure access
5. Test parent notification systems
6. Test communication with administration

## API Integration Requirements

### Attendance Endpoints Used
- `POST /api/spark/attendance/checkin` - Check in student
- `POST /api/spark/attendance/checkout` - Check out student
- `GET /api/spark/sessions/{id}/attendance` - Get session attendance
- `POST /api/spark/attendance/manual` - Manual attendance entry
- `GET /api/spark/attendance/reports` - Generate attendance reports
- `POST /api/spark/notifications/parent` - Send parent notifications
- `POST /api/spark/incidents` - Report incidents
- `GET /api/spark/students/{id}/qr` - Verify student QR code

### Real-time Integration
- WebSocket connection for live attendance updates
- Push notification service for parent alerts
- Real-time session monitoring
- Live attendance status updates
- Emergency notification broadcasting

## Dependencies and Integration Points

### Required Components (from Agent 4)
- Camera and QR code scanning components
- Button, Input, SearchInput components
- LoadingSpinner, EmptyState components
- Real-time notification system
- Navigation system setup
- Redux store configuration

### API Dependencies (from Agent 3)
- Booking and session management
- Student and parent data
- Attendance tracking system
- Notification and messaging APIs
- Emergency contact systems

### Design System Dependencies
- Attendance interface patterns
- Scanner overlay designs
- Status indicator specifications
- Emergency alert designs
- Real-time update indicators

## Completion Checklist

- [ ] All screen components implemented and tested
- [ ] Attendance-specific components created
- [ ] Custom hooks implemented and tested
- [ ] QR code scanning functionality working
- [ ] Camera integration complete
- [ ] Real-time features working
- [ ] Offline functionality implemented
- [ ] Parent notification system working
- [ ] Emergency protocols accessible
- [ ] Attendance reporting working
- [ ] Manual testing completed
- [ ] Performance testing completed
- [ ] Security testing completed
- [ ] Code review completed
- [ ] Documentation updated

## Notes for Next Tasks
- Attendance system provides critical safety and accountability features
- QR code patterns can be reused for other identification needs
- Real-time notification patterns important for emergency communications
- Offline functionality critical for reliable attendance tracking
- Emergency protocols essential for educational institution compliance
- Parent notification integration supports family engagement and safety
