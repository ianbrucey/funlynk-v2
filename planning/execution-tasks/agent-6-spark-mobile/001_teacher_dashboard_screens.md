# Task 001: Teacher Dashboard Screens Implementation
**Agent**: Spark Mobile UI Developer  
**Estimated Time**: 8-9 hours  
**Priority**: High  
**Dependencies**: Agent 4 Task 004 (Shared Component Library), Agent 3 Task 002 (Program Management API)  

## Overview
Implement comprehensive teacher dashboard screens for Funlynk Spark mobile app including program overview, booking management, student roster, and teaching resources using the established design system and component library.

## Prerequisites
- Mobile foundation setup complete (Agent 4 tasks)
- Spark Program Management API endpoints available (Agent 3 Task 002)
- Authentication system working
- Navigation system configured

## Step-by-Step Implementation

### Step 1: Create Teacher Dashboard Overview Screen (2.5 hours)

**Create TeacherDashboardScreen component:**
```bash
# Create spark screen directory
mkdir -p src/screens/spark/teacher

# Create TeacherDashboardScreen component
touch src/screens/spark/teacher/TeacherDashboardScreen.tsx
```

**Implement TeacherDashboardScreen.tsx using template pattern:**
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

// Spark-specific components
import { DashboardHeader } from '../../../components/spark/molecules/DashboardHeader';
import { QuickStats } from '../../../components/spark/molecules/QuickStats';
import { UpcomingBookings } from '../../../components/spark/organisms/UpcomingBookings';
import { ProgramOverview } from '../../../components/spark/organisms/ProgramOverview';
import { TeachingResources } from '../../../components/spark/organisms/TeachingResources';
import { WeeklySchedule } from '../../../components/spark/organisms/WeeklySchedule';

// Hooks
import { useSpark } from '../../../hooks/spark/useSpark';
import { useAuth } from '../../../hooks/shared/useAuth';
import { useErrorHandler } from '../../../hooks/shared/useErrorHandler';

// Types
import type { TeacherDashboardData, SparkBooking } from '../../../types/spark';
import type { NavigationProp } from '@react-navigation/native';
import type { SparkStackParamList } from '../../../navigation/SparkNavigator';

// Redux
import { sparkActions } from '../../../store/slices/sparkSlice';
import type { RootState } from '../../../store/store';

/**
 * TeacherDashboardScreen Component
 * 
 * Main dashboard for Spark teachers showing overview of programs, bookings,
 * upcoming sessions, and quick access to teaching resources.
 * 
 * Features:
 * - Quick statistics overview (total programs, bookings, students)
 * - Upcoming bookings with session details
 * - Program performance metrics
 * - Weekly schedule view
 * - Quick access to teaching resources
 * - Notification center for important updates
 * - Emergency contact information
 */

type TeacherDashboardScreenNavigationProp = NavigationProp<SparkStackParamList, 'TeacherDashboard'>;

export const TeacherDashboardScreen: React.FC = () => {
  const navigation = useNavigation<TeacherDashboardScreenNavigationProp>();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  
  // Redux state
  const {
    dashboardData,
    upcomingBookings,
    programs,
    isLoading,
    isRefreshing,
    error,
  } = useSelector((state: RootState) => state.spark);
  
  // Local state
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  // Custom hooks
  const {
    loadTeacherDashboard,
    refreshTeacherDashboard,
    loadUpcomingBookings,
    markBookingAsComplete,
    cancelBooking,
  } = useSpark();

  // Load dashboard data on screen focus
  useFocusEffect(
    useCallback(() => {
      if (!dashboardData) {
        loadTeacherDashboard();
      }
      if (upcomingBookings.length === 0) {
        loadUpcomingBookings();
      }
    }, [dashboardData, upcomingBookings.length, loadTeacherDashboard, loadUpcomingBookings])
  );

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refreshTeacherDashboard();
    } catch (error) {
      handleError(error);
    }
  }, [refreshTeacherDashboard, handleError]);

  // Handle booking action
  const handleBookingAction = useCallback(async (bookingId: string, action: 'complete' | 'cancel') => {
    try {
      if (action === 'complete') {
        await markBookingAsComplete(bookingId);
      } else {
        await cancelBooking(bookingId);
      }
    } catch (error) {
      handleError(error);
    }
  }, [markBookingAsComplete, cancelBooking, handleError]);

  // Handle navigation to booking details
  const handleBookingPress = useCallback((booking: SparkBooking) => {
    navigation.navigate('BookingDetails', { bookingId: booking.id });
  }, [navigation]);

  // Render loading state
  if (isLoading && !dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error && !dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="alert-circle"
          title="Unable to load dashboard"
          subtitle="Please check your connection and try again"
          actionText="Retry"
          onAction={loadTeacherDashboard}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <DashboardHeader
        teacherName={user?.firstName || 'Teacher'}
        notificationCount={dashboardData?.unreadNotifications || 0}
        onNotificationsPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('TeacherProfile')}
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
        {/* Quick Statistics */}
        <QuickStats
          stats={{
            totalPrograms: dashboardData?.totalPrograms || 0,
            activeBookings: dashboardData?.activeBookings || 0,
            totalStudents: dashboardData?.totalStudents || 0,
            completedSessions: dashboardData?.completedSessions || 0,
            averageRating: dashboardData?.averageRating || 0,
            monthlyEarnings: dashboardData?.monthlyEarnings || 0,
          }}
          onStatsPress={(type) => {
            switch (type) {
              case 'programs':
                navigation.navigate('ProgramList');
                break;
              case 'bookings':
                navigation.navigate('BookingList');
                break;
              case 'students':
                navigation.navigate('StudentRoster');
                break;
              case 'earnings':
                navigation.navigate('EarningsReport');
                break;
            }
          }}
          style={styles.quickStats}
        />

        {/* Upcoming Bookings */}
        <UpcomingBookings
          bookings={upcomingBookings.slice(0, 3)} // Show only next 3
          onBookingPress={handleBookingPress}
          onBookingAction={handleBookingAction}
          onViewAllPress={() => navigation.navigate('BookingList')}
          style={styles.upcomingBookings}
        />

        {/* Weekly Schedule */}
        <WeeklySchedule
          selectedWeek={selectedWeek}
          bookings={upcomingBookings}
          onWeekChange={setSelectedWeek}
          onBookingPress={handleBookingPress}
          onAddAvailability={() => navigation.navigate('ManageAvailability')}
          style={styles.weeklySchedule}
        />

        {/* Program Overview */}
        <ProgramOverview
          programs={programs.slice(0, 2)} // Show top 2 programs
          onProgramPress={(program) => navigation.navigate('ProgramDetails', { programId: program.id })}
          onViewAllPress={() => navigation.navigate('ProgramList')}
          style={styles.programOverview}
        />

        {/* Teaching Resources */}
        <TeachingResources
          recentResources={dashboardData?.recentResources || []}
          onResourcePress={(resource) => navigation.navigate('ResourceViewer', { resourceId: resource.id })}
          onViewAllPress={() => navigation.navigate('TeachingResources')}
          style={styles.teachingResources}
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <Button
              variant="secondary"
              size="medium"
              onPress={() => navigation.navigate('CreateProgram')}
              style={styles.actionButton}
              testID="create-program-button"
            >
              Create Program
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onPress={() => navigation.navigate('ManageAvailability')}
              style={styles.actionButton}
              testID="manage-availability-button"
            >
              Set Availability
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onPress={() => navigation.navigate('StudentRoster')}
              style={styles.actionButton}
              testID="view-students-button"
            >
              View Students
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onPress={() => navigation.navigate('TeachingResources')}
              style={styles.actionButton}
              testID="teaching-resources-button"
            >
              Resources
            </Button>
          </View>
        </View>

        {/* Emergency Information */}
        <View style={styles.emergencyInfo}>
          <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
          <Text style={styles.emergencyText}>
            School Admin: {dashboardData?.emergencyContacts?.admin || 'N/A'}
          </Text>
          <Text style={styles.emergencyText}>
            Spark Support: {dashboardData?.emergencyContacts?.support || '1-800-SPARK-HELP'}
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
  quickStats: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  upcomingBookings: {
    marginBottom: 24,
  },
  weeklySchedule: {
    marginBottom: 24,
  },
  programOverview: {
    marginBottom: 24,
  },
  teachingResources: {
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

**Create ProgramListScreen component:**
```bash
touch src/screens/spark/teacher/ProgramListScreen.tsx
```

**Implement ProgramListScreen.tsx for program management:**
- List of teacher's Spark programs
- Program status indicators (active, draft, archived)
- Search and filter programs
- Quick edit and duplicate actions
- Program performance metrics
- Create new program button

### Step 2: Create Booking Management Screens (2.5 hours)

**Create BookingListScreen component:**
```bash
touch src/screens/spark/teacher/BookingListScreen.tsx
```

**Implement BookingListScreen.tsx for booking overview:**
- List of all bookings with status filters
- Calendar view toggle for schedule visualization
- Booking details preview cards
- Quick actions (confirm, reschedule, cancel)
- Search bookings by school or date
- Export booking data functionality

**Create BookingDetailsScreen component:**
```bash
touch src/screens/spark/teacher/BookingDetailsScreen.tsx
```

**Implement BookingDetailsScreen.tsx for detailed booking management:**
- Complete booking information display
- School and contact details
- Student roster with special needs notes
- Program materials and preparation checklist
- Travel directions and parking information
- Session notes and feedback forms
- Photo/video upload for session documentation
- Communication with school administrators

### Step 3: Create Student and Session Management Screens (2 hours)

**Create StudentRosterScreen component:**
```bash
touch src/screens/spark/teacher/StudentRosterScreen.tsx
```

**Implement StudentRosterScreen.tsx for student management:**
- Comprehensive student list across all bookings
- Student profiles with photos and notes
- Special needs and accommodation tracking
- Attendance history and patterns
- Parent contact information
- Student progress tracking
- Behavioral notes and observations
- Emergency contact information

**Create SessionNotesScreen component:**
```bash
touch src/screens/spark/teacher/SessionNotesScreen.tsx
```

**Implement SessionNotesScreen.tsx for session documentation:**
- Session planning and preparation notes
- Real-time session notes during teaching
- Student participation tracking
- Behavior observations and incidents
- Learning objective achievement tracking
- Photo and video documentation
- Follow-up recommendations
- Share notes with school administrators

### Step 4: Create Teaching Resources and Tools Screens (1 hour)

**Create TeachingResourcesScreen component:**
```bash
touch src/screens/spark/teacher/TeachingResourcesScreen.tsx
```

**Implement TeachingResourcesScreen.tsx for resource management:**
- Categorized teaching materials library
- Program-specific resource collections
- Interactive activity guides
- Character education materials
- Assessment tools and rubrics
- Video tutorials and training materials
- Downloadable worksheets and handouts
- Personal resource uploads and organization

**Create AvailabilityManagementScreen component:**
```bash
touch src/screens/spark/teacher/AvailabilityManagementScreen.tsx
```

**Implement AvailabilityManagementScreen.tsx for schedule management:**
- Calendar interface for setting availability
- Recurring availability patterns
- Blackout dates and time-off requests
- Travel time and distance preferences
- Preferred schools and grade levels
- Rate and pricing management
- Automatic booking acceptance settings

## Acceptance Criteria

### Functional Requirements
- [ ] Teacher dashboard displays comprehensive overview
- [ ] Program list shows all teacher programs with management options
- [ ] Booking list displays all bookings with filtering and search
- [ ] Booking details provide complete session information
- [ ] Student roster shows all students with detailed profiles
- [ ] Session notes allow comprehensive documentation
- [ ] Teaching resources provide organized material access
- [ ] Availability management allows flexible scheduling
- [ ] All screens support pull-to-refresh functionality

### Technical Requirements
- [ ] All screens follow established component template patterns
- [ ] Redux integration for Spark state management
- [ ] TypeScript types are properly defined and used
- [ ] Accessibility labels and hints are implemented
- [ ] Error handling follows established patterns
- [ ] API integration uses established service patterns
- [ ] Offline functionality for critical features
- [ ] Performance optimized for teacher workflows

### Design Requirements
- [ ] Screens match design system specifications exactly
- [ ] Teacher-focused UI patterns are consistent
- [ ] Educational content displays are clear and organized
- [ ] Status indicators are intuitive and color-coded
- [ ] Loading and error states are visually consistent
- [ ] Mobile-first design optimized for tablet use

### Testing Requirements
- [ ] Unit tests for all custom hooks
- [ ] Component tests for all screen components
- [ ] Integration tests for teacher workflows
- [ ] Manual testing on iOS and Android devices
- [ ] Tablet-specific testing for larger screens
- [ ] Offline functionality testing
- [ ] Performance testing with large datasets

## Manual Testing Instructions

### Test Case 1: Dashboard Overview
1. Open teacher dashboard and verify all sections load
2. Test pull-to-refresh functionality
3. Test navigation to different sections
4. Verify quick stats display correctly
5. Test upcoming bookings interactions
6. Test weekly schedule navigation

### Test Case 2: Program Management
1. Navigate to program list and verify all programs display
2. Test search and filtering functionality
3. Test program creation and editing
4. Test program status changes
5. Test program duplication
6. Verify program metrics display

### Test Case 3: Booking Management
1. View booking list with different filters
2. Test booking details navigation
3. Test booking status updates
4. Test communication features
5. Test session documentation
6. Test calendar view functionality

### Test Case 4: Student Management
1. View student roster across all bookings
2. Test student profile viewing and editing
3. Test attendance tracking
4. Test special needs documentation
5. Test parent contact features
6. Test progress tracking

## API Integration Requirements

### Spark Teacher Endpoints Used
- `GET /api/spark/teacher/dashboard` - Get dashboard data
- `GET /api/spark/teacher/programs` - Get teacher programs
- `GET /api/spark/teacher/bookings` - Get teacher bookings
- `PUT /api/spark/bookings/{id}/status` - Update booking status
- `GET /api/spark/students` - Get student roster
- `POST /api/spark/sessions/{id}/notes` - Save session notes
- `GET /api/spark/resources` - Get teaching resources
- `PUT /api/spark/teacher/availability` - Update availability

### Data Validation
- Session notes content validation
- Availability time slot validation
- Student information privacy compliance
- Photo/video upload restrictions
- Emergency contact verification

## Dependencies and Integration Points

### Required Components (from Agent 4)
- Button, Input, TextArea components
- Calendar, DatePicker components
- LoadingSpinner, EmptyState components
- Navigation system setup
- Redux store configuration

### API Dependencies (from Agent 3)
- Spark program management endpoints
- Booking management system
- Student and school data
- Resource management system
- Availability and scheduling APIs

### Design System Dependencies
- Educational interface patterns
- Teacher workflow optimizations
- Status indicator designs
- Resource organization patterns
- Mobile-tablet responsive layouts

## Completion Checklist

- [ ] All screen components implemented and tested
- [ ] Teacher-specific components created
- [ ] Custom hooks implemented and tested
- [ ] Navigation configuration updated
- [ ] Redux integration working
- [ ] API integration complete
- [ ] Form validation working
- [ ] File upload functionality working
- [ ] Offline capabilities implemented
- [ ] Tablet optimization complete
- [ ] Manual testing completed
- [ ] Educational workflow testing completed
- [ ] Code review completed
- [ ] Documentation updated

## Notes for Next Tasks
- Teacher dashboard establishes foundation for educational workflows
- Booking management patterns can be reused for parent interfaces
- Student management provides basis for attendance and progress tracking
- Resource organization patterns applicable to parent and admin interfaces
- Session documentation patterns important for compliance and reporting
