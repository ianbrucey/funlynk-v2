# Task 003: School Admin Interface Implementation
**Agent**: Spark Mobile UI Developer  
**Estimated Time**: 7-8 hours  
**Priority**: Medium  
**Dependencies**: Agent 6 Task 002 (Parent Interface), Agent 3 Task 001 (School Management API)  

## Overview
Implement comprehensive school administrator interface screens for Funlynk Spark mobile app including program management, booking oversight, teacher coordination, and reporting using the established design system and component library.

## Prerequisites
- Parent interface screens complete (Agent 6 Task 002)
- School Management API endpoints available (Agent 3 Task 001)
- Authentication system working
- Navigation system configured

## Step-by-Step Implementation

### Step 1: Create School Admin Dashboard and Overview (2.5 hours)

**Create SchoolAdminDashboardScreen component:**
```bash
# Create school admin screen directory
mkdir -p src/screens/spark/admin

# Create SchoolAdminDashboardScreen component
touch src/screens/spark/admin/SchoolAdminDashboardScreen.tsx
```

**Implement SchoolAdminDashboardScreen.tsx using template pattern:**
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '../../../components/shared/atoms/Button';
import { LoadingSpinner } from '../../../components/shared/atoms/LoadingSpinner';
import { EmptyState } from '../../../components/shared/molecules/EmptyState';

// Spark admin-specific components
import { AdminHeader } from '../../../components/spark/molecules/AdminHeader';
import { SchoolOverview } from '../../../components/spark/organisms/SchoolOverview';
import { ProgramMetrics } from '../../../components/spark/organisms/ProgramMetrics';
import { TeacherManagement } from '../../../components/spark/organisms/TeacherManagement';
import { BookingOverview } from '../../../components/spark/organisms/BookingOverview';
import { ParentEngagement } from '../../../components/spark/organisms/ParentEngagement';
import { ComplianceStatus } from '../../../components/spark/organisms/ComplianceStatus';

// Hooks
import { useSparkAdmin } from '../../../hooks/spark/useSparkAdmin';
import { useAuth } from '../../../hooks/shared/useAuth';
import { useErrorHandler } from '../../../hooks/shared/useErrorHandler';

// Types
import type { SchoolAdminDashboardData, School, Teacher } from '../../../types/spark';
import type { NavigationProp } from '@react-navigation/native';
import type { SparkAdminStackParamList } from '../../../navigation/SparkAdminNavigator';

/**
 * SchoolAdminDashboardScreen Component
 * 
 * Main dashboard for school administrators showing overview of Spark programs,
 * teacher management, booking statistics, and compliance status.
 * 
 * Features:
 * - School overview with key metrics
 * - Program performance analytics
 * - Teacher management and coordination
 * - Booking and scheduling overview
 * - Parent engagement metrics
 * - Compliance and safety status
 * - Quick access to administrative functions
 */

type SchoolAdminDashboardScreenNavigationProp = NavigationProp<SparkAdminStackParamList, 'AdminDashboard'>;

export const SchoolAdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<SchoolAdminDashboardScreenNavigationProp>();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  
  // Redux state
  const {
    dashboardData,
    school,
    teachers,
    programs,
    bookings,
    isLoading,
    isRefreshing,
    error,
  } = useSelector((state: RootState) => state.sparkAdmin);

  // Custom hooks
  const {
    loadAdminDashboard,
    refreshAdminDashboard,
    loadSchoolData,
    approveTeacher,
    suspendTeacher,
    approveProgram,
    cancelBooking,
  } = useSparkAdmin();

  // Load dashboard data on screen focus
  useFocusEffect(
    useCallback(() => {
      if (!dashboardData) {
        loadAdminDashboard();
      }
      if (!school) {
        loadSchoolData();
      }
    }, [dashboardData, school, loadAdminDashboard, loadSchoolData])
  );

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refreshAdminDashboard();
    } catch (error) {
      handleError(error);
    }
  }, [refreshAdminDashboard, handleError]);

  // Handle teacher actions
  const handleTeacherAction = useCallback(async (teacherId: string, action: 'approve' | 'suspend') => {
    try {
      if (action === 'approve') {
        await approveTeacher(teacherId);
      } else {
        await suspendTeacher(teacherId);
      }
    } catch (error) {
      handleError(error);
    }
  }, [approveTeacher, suspendTeacher, handleError]);

  // Handle program approval
  const handleProgramApproval = useCallback(async (programId: string) => {
    try {
      await approveProgram(programId);
    } catch (error) {
      handleError(error);
    }
  }, [approveProgram, handleError]);

  // Render loading state
  if (isLoading && !dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading admin dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeader
        schoolName={school?.name || 'School'}
        adminName={user?.firstName || 'Admin'}
        notificationCount={dashboardData?.unreadNotifications || 0}
        onNotificationsPress={() => navigation.navigate('AdminNotifications')}
        onProfilePress={() => navigation.navigate('AdminProfile')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* School Overview */}
        <SchoolOverview
          school={school}
          metrics={{
            totalStudents: dashboardData?.totalStudents || 0,
            activePrograms: dashboardData?.activePrograms || 0,
            approvedTeachers: dashboardData?.approvedTeachers || 0,
            monthlyBookings: dashboardData?.monthlyBookings || 0,
            parentSatisfaction: dashboardData?.parentSatisfaction || 0,
            complianceScore: dashboardData?.complianceScore || 0,
          }}
          onEditSchoolPress={() => navigation.navigate('EditSchool')}
          style={styles.schoolOverview}
        />

        {/* Program Metrics */}
        <ProgramMetrics
          metrics={{
            totalPrograms: dashboardData?.programMetrics?.total || 0,
            activePrograms: dashboardData?.programMetrics?.active || 0,
            pendingApproval: dashboardData?.programMetrics?.pending || 0,
            averageRating: dashboardData?.programMetrics?.averageRating || 0,
            totalBookings: dashboardData?.programMetrics?.totalBookings || 0,
            revenue: dashboardData?.programMetrics?.revenue || 0,
          }}
          onViewProgramsPress={() => navigation.navigate('ProgramManagement')}
          style={styles.programMetrics}
        />

        {/* Teacher Management */}
        <TeacherManagement
          teachers={teachers.slice(0, 3)} // Show top 3 teachers
          pendingApprovals={dashboardData?.pendingTeacherApprovals || 0}
          onTeacherPress={(teacher) => navigation.navigate('TeacherDetails', { teacherId: teacher.id })}
          onTeacherAction={handleTeacherAction}
          onViewAllPress={() => navigation.navigate('TeacherManagement')}
          style={styles.teacherManagement}
        />

        {/* Booking Overview */}
        <BookingOverview
          bookings={{
            upcoming: dashboardData?.bookingOverview?.upcoming || 0,
            today: dashboardData?.bookingOverview?.today || 0,
            thisWeek: dashboardData?.bookingOverview?.thisWeek || 0,
            cancelled: dashboardData?.bookingOverview?.cancelled || 0,
          }}
          recentBookings={bookings.slice(0, 3)}
          onBookingPress={(booking) => navigation.navigate('BookingDetails', { bookingId: booking.id })}
          onViewAllPress={() => navigation.navigate('BookingManagement')}
          style={styles.bookingOverview}
        />

        {/* Parent Engagement */}
        <ParentEngagement
          metrics={{
            activeParents: dashboardData?.parentEngagement?.active || 0,
            permissionSlipCompletion: dashboardData?.parentEngagement?.permissionSlips || 0,
            communicationResponse: dashboardData?.parentEngagement?.communication || 0,
            feedbackScore: dashboardData?.parentEngagement?.feedback || 0,
          }}
          onViewDetailsPress={() => navigation.navigate('ParentEngagement')}
          style={styles.parentEngagement}
        />

        {/* Compliance Status */}
        <ComplianceStatus
          status={{
            backgroundChecks: dashboardData?.compliance?.backgroundChecks || 0,
            certifications: dashboardData?.compliance?.certifications || 0,
            safetyProtocols: dashboardData?.compliance?.safety || 0,
            documentation: dashboardData?.compliance?.documentation || 0,
          }}
          alerts={dashboardData?.complianceAlerts || []}
          onViewDetailsPress={() => navigation.navigate('ComplianceManagement')}
          style={styles.complianceStatus}
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <Button
              variant="primary"
              size="medium"
              onPress={() => navigation.navigate('ProgramManagement')}
              style={styles.actionButton}
              testID="manage-programs-button"
            >
              Manage Programs
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onPress={() => navigation.navigate('TeacherManagement')}
              style={styles.actionButton}
              testID="manage-teachers-button"
            >
              Manage Teachers
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onPress={() => navigation.navigate('BookingManagement')}
              style={styles.actionButton}
              testID="manage-bookings-button"
            >
              View Bookings
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onPress={() => navigation.navigate('Reports')}
              style={styles.actionButton}
              testID="view-reports-button"
            >
              View Reports
            </Button>
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.emergencyInfo}>
          <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
          <Text style={styles.emergencyText}>
            District Office: {dashboardData?.emergencyContacts?.district || 'N/A'}
          </Text>
          <Text style={styles.emergencyText}>
            Spark Support: {dashboardData?.emergencyContacts?.spark || '1-800-SPARK-HELP'}
          </Text>
          <Text style={styles.emergencyText}>
            Emergency Services: 911
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  schoolOverview: {
    marginBottom: 24,
  },
  programMetrics: {
    marginBottom: 24,
  },
  teacherManagement: {
    marginBottom: 24,
  },
  bookingOverview: {
    marginBottom: 24,
  },
  parentEngagement: {
    marginBottom: 24,
  },
  complianceStatus: {
    marginBottom: 24,
  },
  quickActions: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: 12,
  },
  emergencyInfo: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#92400E',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
});
```

**Create ProgramManagementScreen component:**
```bash
touch src/screens/spark/admin/ProgramManagementScreen.tsx
```

**Implement ProgramManagementScreen.tsx for program oversight:**
- List of all Spark programs with approval status
- Program approval and rejection workflow
- Program performance metrics and analytics
- Teacher assignment and scheduling
- Program content review and feedback
- Pricing and availability management

### Step 2: Create Teacher and Staff Management (2 hours)

**Create TeacherManagementScreen component:**
```bash
touch src/screens/spark/admin/TeacherManagementScreen.tsx
```

**Implement TeacherManagementScreen.tsx for teacher oversight:**
- List of all Spark teachers with status and ratings
- Teacher approval and background check verification
- Performance metrics and parent feedback
- Schedule coordination and availability management
- Communication and messaging with teachers
- Training and certification tracking
- Incident reporting and resolution

**Create TeacherDetailsScreen component:**
```bash
touch src/screens/spark/admin/TeacherDetailsScreen.tsx
```

**Implement TeacherDetailsScreen.tsx for individual teacher management:**
- Complete teacher profile and credentials
- Background check and certification status
- Program assignments and performance history
- Parent and student feedback compilation
- Schedule and availability overview
- Communication history and notes
- Performance improvement plans if needed
- Emergency contact and backup information

### Step 3: Create Booking and Schedule Management (2 hours)

**Create BookingManagementScreen component:**
```bash
touch src/screens/spark/admin/BookingManagementScreen.tsx
```

**Implement BookingManagementScreen.tsx for booking oversight:**
- Calendar view of all school bookings
- Booking approval and coordination workflow
- Resource allocation and room scheduling
- Parent communication and updates
- Cancellation and rescheduling management
- Payment tracking and invoicing
- Attendance verification and reporting
- Special accommodations and requirements

**Create ReportsScreen component:**
```bash
touch src/screens/spark/admin/ReportsScreen.tsx
```

**Implement ReportsScreen.tsx for analytics and reporting:**
- Program participation and engagement metrics
- Teacher performance and satisfaction reports
- Parent feedback and satisfaction surveys
- Financial reports and revenue tracking
- Compliance and safety audit reports
- Student progress and outcome analytics
- Attendance and participation trends
- Custom report generation and export

### Step 4: Create Compliance and Communication Tools (1.5 hours)

**Create ComplianceManagementScreen component:**
```bash
touch src/screens/spark/admin/ComplianceManagementScreen.tsx
```

**Implement ComplianceManagementScreen.tsx for compliance oversight:**
- Background check status tracking
- Certification and training requirements
- Safety protocol compliance monitoring
- Documentation and record keeping
- Incident reporting and investigation
- Policy updates and acknowledgments
- Audit preparation and management
- Regulatory compliance tracking

**Create CommunicationCenterScreen component:**
```bash
touch src/screens/spark/admin/CommunicationCenterScreen.tsx
```

**Implement CommunicationCenterScreen.tsx for school communication:**
- Broadcast messages to parents and teachers
- Emergency notification system
- Program announcements and updates
- Policy changes and important notices
- Event coordination and scheduling
- Feedback collection and surveys
- Community engagement initiatives
- Multi-language communication support

## Acceptance Criteria

### Functional Requirements
- [ ] Admin dashboard displays comprehensive school overview
- [ ] Program management allows effective oversight and approval
- [ ] Teacher management handles verification and performance tracking
- [ ] Booking management coordinates scheduling and resources
- [ ] Reports provide meaningful analytics and insights
- [ ] Compliance management ensures regulatory adherence
- [ ] Communication tools enable effective school-wide messaging
- [ ] All administrative workflows are streamlined and efficient

### Technical Requirements
- [ ] All screens follow established component template patterns
- [ ] Redux integration for Spark admin state management
- [ ] TypeScript types are properly defined and used
- [ ] Accessibility labels and hints are implemented
- [ ] Error handling follows established patterns
- [ ] API integration uses established service patterns
- [ ] Role-based access control implemented
- [ ] Audit logging for administrative actions

### Design Requirements
- [ ] Screens match design system specifications exactly
- [ ] Admin-focused UI patterns are professional and efficient
- [ ] Data visualizations are clear and actionable
- [ ] Status indicators are intuitive and color-coded
- [ ] Loading and error states are visually consistent
- [ ] Responsive design works on tablets and phones

### Testing Requirements
- [ ] Unit tests for all custom hooks
- [ ] Component tests for all screen components
- [ ] Integration tests for admin workflows
- [ ] Role-based access testing
- [ ] Manual testing on iOS and Android devices
- [ ] Compliance and audit trail testing
- [ ] Performance testing with large datasets

## Manual Testing Instructions

### Test Case 1: Admin Dashboard
1. Open admin dashboard and verify all metrics display
2. Test navigation to different management sections
3. Test emergency contact information
4. Test notification handling
5. Test pull-to-refresh functionality
6. Verify role-based access controls

### Test Case 2: Program Management
1. View program list with different status filters
2. Test program approval and rejection workflow
3. Test program performance analytics
4. Test teacher assignment functionality
5. Test program content review process
6. Test pricing and availability updates

### Test Case 3: Teacher Management
1. View teacher list with status and performance data
2. Test teacher approval and verification process
3. Test performance tracking and feedback
4. Test communication with teachers
5. Test schedule coordination
6. Test incident reporting and resolution

### Test Case 4: Compliance and Reporting
1. Test compliance status monitoring
2. Test report generation and export
3. Test audit trail functionality
4. Test emergency notification system
5. Test policy update distribution
6. Test regulatory compliance tracking

## API Integration Requirements

### Spark Admin Endpoints Used
- `GET /api/spark/admin/dashboard` - Get admin dashboard data
- `GET /api/spark/admin/programs` - Get programs for approval
- `PUT /api/spark/programs/{id}/approve` - Approve program
- `GET /api/spark/admin/teachers` - Get teacher list
- `PUT /api/spark/teachers/{id}/approve` - Approve teacher
- `GET /api/spark/admin/bookings` - Get booking overview
- `GET /api/spark/admin/reports` - Generate reports
- `GET /api/spark/admin/compliance` - Get compliance status

### Data Validation
- Administrative action authorization
- Compliance requirement verification
- Teacher credential validation
- Program content approval criteria
- Financial data accuracy
- Audit trail completeness

## Dependencies and Integration Points

### Required Components (from Agent 4)
- Button, Input, TextArea components
- Calendar, DatePicker components
- Chart and visualization components
- LoadingSpinner, EmptyState components
- Navigation system setup
- Redux store configuration

### API Dependencies (from Agent 3)
- School management endpoints
- Program approval workflows
- Teacher verification systems
- Booking coordination APIs
- Reporting and analytics systems

### Design System Dependencies
- Administrative interface patterns
- Data visualization specifications
- Status indicator designs
- Professional color schemes
- Tablet-optimized layouts

## Completion Checklist

- [ ] All screen components implemented and tested
- [ ] Admin-specific components created
- [ ] Custom hooks implemented and tested
- [ ] Navigation configuration updated
- [ ] Redux integration working
- [ ] API integration complete
- [ ] Role-based access control working
- [ ] Compliance features working
- [ ] Reporting functionality working
- [ ] Communication tools working
- [ ] Manual testing completed
- [ ] Security and compliance testing completed
- [ ] Code review completed
- [ ] Documentation updated

## Notes for Next Tasks
- Admin interface provides oversight foundation for educational programs
- Compliance patterns critical for educational institution requirements
- Reporting patterns can be extended for district-level analytics
- Communication tools establish foundation for school-wide engagement
- Teacher management patterns important for quality assurance
- Audit trails essential for regulatory compliance and accountability
