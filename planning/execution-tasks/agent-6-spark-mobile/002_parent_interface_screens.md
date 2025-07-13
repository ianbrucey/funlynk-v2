# Task 002: Parent Interface Screens Implementation
**Agent**: Spark Mobile UI Developer  
**Estimated Time**: 7-8 hours  
**Priority**: High  
**Dependencies**: Agent 6 Task 001 (Teacher Dashboard), Agent 3 Task 004 (Permission Slip Management)  

## Overview
Implement comprehensive parent interface screens for Funlynk Spark mobile app including program discovery, booking management, permission slips, and child progress tracking using the established design system and component library.

## Prerequisites
- Teacher dashboard screens complete (Agent 6 Task 001)
- Permission Slip Management API endpoints available (Agent 3 Task 004)
- Authentication system working
- Navigation system configured

## Step-by-Step Implementation

### Step 1: Create Parent Dashboard and Program Discovery (2.5 hours)

**Create ParentDashboardScreen component:**
```bash
# Create parent screen directory
mkdir -p src/screens/spark/parent

# Create ParentDashboardScreen component
touch src/screens/spark/parent/ParentDashboardScreen.tsx
```

**Implement ParentDashboardScreen.tsx using template pattern:**
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

// Spark parent-specific components
import { ParentHeader } from '../../../components/spark/molecules/ParentHeader';
import { ChildrenOverview } from '../../../components/spark/organisms/ChildrenOverview';
import { UpcomingPrograms } from '../../../components/spark/organisms/UpcomingPrograms';
import { PendingActions } from '../../../components/spark/organisms/PendingActions';
import { ProgramRecommendations } from '../../../components/spark/organisms/ProgramRecommendations';
import { SchoolUpdates } from '../../../components/spark/organisms/SchoolUpdates';

// Hooks
import { useSparkParent } from '../../../hooks/spark/useSparkParent';
import { useAuth } from '../../../hooks/shared/useAuth';
import { useErrorHandler } from '../../../hooks/shared/useErrorHandler';

// Types
import type { ParentDashboardData, Child, SparkProgram } from '../../../types/spark';
import type { NavigationProp } from '@react-navigation/native';
import type { SparkParentStackParamList } from '../../../navigation/SparkParentNavigator';

/**
 * ParentDashboardScreen Component
 * 
 * Main dashboard for parents showing overview of children's Spark programs,
 * upcoming sessions, pending permission slips, and program recommendations.
 * 
 * Features:
 * - Children overview with quick access to individual profiles
 * - Upcoming Spark programs and sessions
 * - Pending permission slips and forms
 * - Program recommendations based on child's interests
 * - School announcements and updates
 * - Quick access to booking new programs
 * - Emergency contact information
 */

type ParentDashboardScreenNavigationProp = NavigationProp<SparkParentStackParamList, 'ParentDashboard'>;

export const ParentDashboardScreen: React.FC = () => {
  const navigation = useNavigation<ParentDashboardScreenNavigationProp>();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  
  // Redux state
  const {
    dashboardData,
    children,
    upcomingPrograms,
    pendingActions,
    recommendations,
    isLoading,
    isRefreshing,
    error,
  } = useSelector((state: RootState) => state.sparkParent);

  // Custom hooks
  const {
    loadParentDashboard,
    refreshParentDashboard,
    loadChildren,
    bookProgram,
    signPermissionSlip,
  } = useSparkParent();

  // Load dashboard data on screen focus
  useFocusEffect(
    useCallback(() => {
      if (!dashboardData) {
        loadParentDashboard();
      }
      if (children.length === 0) {
        loadChildren();
      }
    }, [dashboardData, children.length, loadParentDashboard, loadChildren])
  );

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refreshParentDashboard();
    } catch (error) {
      handleError(error);
    }
  }, [refreshParentDashboard, handleError]);

  // Handle child selection
  const handleChildPress = useCallback((child: Child) => {
    navigation.navigate('ChildProfile', { childId: child.id });
  }, [navigation]);

  // Handle program booking
  const handleProgramBook = useCallback(async (program: SparkProgram, childId: string) => {
    try {
      await bookProgram(program.id, childId);
      navigation.navigate('BookingConfirmation', { 
        programId: program.id, 
        childId 
      });
    } catch (error) {
      handleError(error);
    }
  }, [bookProgram, navigation, handleError]);

  // Handle permission slip signing
  const handlePermissionSlipSign = useCallback(async (permissionSlipId: string) => {
    try {
      navigation.navigate('PermissionSlip', { permissionSlipId });
    } catch (error) {
      handleError(error);
    }
  }, [navigation, handleError]);

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

  return (
    <SafeAreaView style={styles.container}>
      <ParentHeader
        parentName={user?.firstName || 'Parent'}
        notificationCount={dashboardData?.unreadNotifications || 0}
        onNotificationsPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('ParentProfile')}
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
        {/* Children Overview */}
        <ChildrenOverview
          children={children}
          onChildPress={handleChildPress}
          onAddChildPress={() => navigation.navigate('AddChild')}
          style={styles.childrenOverview}
        />

        {/* Pending Actions */}
        {pendingActions && pendingActions.length > 0 && (
          <PendingActions
            actions={pendingActions}
            onPermissionSlipPress={handlePermissionSlipSign}
            onPaymentPress={(paymentId) => navigation.navigate('Payment', { paymentId })}
            onFormPress={(formId) => navigation.navigate('Form', { formId })}
            style={styles.pendingActions}
          />
        )}

        {/* Upcoming Programs */}
        <UpcomingPrograms
          programs={upcomingPrograms}
          onProgramPress={(program) => navigation.navigate('ProgramDetails', { programId: program.id })}
          onViewAllPress={() => navigation.navigate('ProgramSchedule')}
          style={styles.upcomingPrograms}
        />

        {/* Program Recommendations */}
        <ProgramRecommendations
          recommendations={recommendations}
          children={children}
          onProgramPress={(program) => navigation.navigate('ProgramDetails', { programId: program.id })}
          onBookPress={handleProgramBook}
          onViewAllPress={() => navigation.navigate('BrowsePrograms')}
          style={styles.recommendations}
        />

        {/* School Updates */}
        <SchoolUpdates
          updates={dashboardData?.schoolUpdates || []}
          onUpdatePress={(update) => navigation.navigate('UpdateDetails', { updateId: update.id })}
          onViewAllPress={() => navigation.navigate('SchoolUpdates')}
          style={styles.schoolUpdates}
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <Button
              variant="primary"
              size="medium"
              onPress={() => navigation.navigate('BrowsePrograms')}
              style={styles.actionButton}
              testID="browse-programs-button"
            >
              Browse Programs
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onPress={() => navigation.navigate('ProgramSchedule')}
              style={styles.actionButton}
              testID="view-schedule-button"
            >
              View Schedule
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onPress={() => navigation.navigate('PermissionSlips')}
              style={styles.actionButton}
              testID="permission-slips-button"
            >
              Permission Slips
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onPress={() => navigation.navigate('ContactSchool')}
              style={styles.actionButton}
              testID="contact-school-button"
            >
              Contact School
            </Button>
          </View>
        </View>

        {/* Emergency Information */}
        <View style={styles.emergencyInfo}>
          <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
          <Text style={styles.emergencyText}>
            School Office: {dashboardData?.emergencyContacts?.school || 'N/A'}
          </Text>
          <Text style={styles.emergencyText}>
            Spark Support: {dashboardData?.emergencyContacts?.spark || '1-800-SPARK-HELP'}
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
  childrenOverview: {
    marginBottom: 24,
  },
  pendingActions: {
    marginBottom: 24,
  },
  upcomingPrograms: {
    marginBottom: 24,
  },
  recommendations: {
    marginBottom: 24,
  },
  schoolUpdates: {
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

**Create BrowseProgramsScreen component:**
```bash
touch src/screens/spark/parent/BrowseProgramsScreen.tsx
```

**Implement BrowseProgramsScreen.tsx for program discovery:**
- Search and filter Spark programs by grade level, topic, date
- Program cards with details, ratings, and availability
- Favorite programs functionality
- Program comparison feature
- Quick booking with child selection
- Program reviews and ratings from other parents

### Step 2: Create Permission Slip and Forms Management (2.5 hours)

**Create PermissionSlipsScreen component:**
```bash
touch src/screens/spark/parent/PermissionSlipsScreen.tsx
```

**Implement PermissionSlipsScreen.tsx for permission slip management:**
- List of all permission slips by status (pending, signed, expired)
- Digital signature functionality with legal compliance
- Form auto-fill with saved child information
- Photo ID upload for verification
- Emergency contact verification
- Medical information and allergies documentation
- Transportation authorization
- Photo/video consent management

**Create PermissionSlipDetailsScreen component:**
```bash
touch src/screens/spark/parent/PermissionSlipDetailsScreen.tsx
```

**Implement PermissionSlipDetailsScreen.tsx for detailed form handling:**
- Complete permission slip form display
- Section-by-section completion tracking
- Digital signature capture with timestamp
- Document attachment functionality
- Form validation and error handling
- Save draft functionality
- Submit and confirmation process
- Email confirmation and receipt

### Step 3: Create Child Profile and Progress Tracking (2 hours)

**Create ChildProfileScreen component:**
```bash
touch src/screens/spark/parent/ChildProfileScreen.tsx
```

**Implement ChildProfileScreen.tsx for individual child management:**
- Child's personal information and photo
- Program participation history
- Progress tracking and achievements
- Behavioral observations from teachers
- Learning goals and milestones
- Medical information and allergies
- Emergency contacts specific to child
- Communication log with teachers
- Photo gallery from Spark sessions

**Create ChildProgressScreen component:**
```bash
touch src/screens/spark/parent/ChildProgressScreen.tsx
```

**Implement ChildProgressScreen.tsx for progress monitoring:**
- Character development progress charts
- Learning objective achievement tracking
- Behavioral improvement metrics
- Teacher feedback and observations
- Photo and video documentation from sessions
- Comparison with grade-level expectations
- Goal setting and milestone planning
- Progress sharing with family members

### Step 4: Create Communication and Support Screens (1 hour)

**Create MessagesScreen component:**
```bash
touch src/screens/spark/parent/MessagesScreen.tsx
```

**Implement MessagesScreen.tsx for parent-school communication:**
- Message threads with teachers and school staff
- Automated notifications and reminders
- Program updates and announcements
- Emergency alerts and important notices
- Photo and document sharing
- Read receipts and delivery confirmation
- Message search and filtering
- Contact directory for school staff

**Create SupportScreen component:**
```bash
touch src/screens/spark/parent/SupportScreen.tsx
```

**Implement SupportScreen.tsx for help and support:**
- FAQ section for common questions
- Contact information for Spark support
- Program information and resources
- Troubleshooting guides
- Feedback and suggestion submission
- Parent resources and tips
- Community forum access
- Video tutorials and guides

## Acceptance Criteria

### Functional Requirements
- [ ] Parent dashboard displays comprehensive child and program overview
- [ ] Program browsing allows effective discovery and filtering
- [ ] Permission slip management handles digital signatures legally
- [ ] Child profiles show complete information and progress
- [ ] Progress tracking displays meaningful metrics and achievements
- [ ] Communication features enable effective parent-school interaction
- [ ] Support features provide comprehensive help and resources
- [ ] All forms validate input and handle errors gracefully

### Technical Requirements
- [ ] All screens follow established component template patterns
- [ ] Redux integration for Spark parent state management
- [ ] TypeScript types are properly defined and used
- [ ] Accessibility labels and hints are implemented
- [ ] Error handling follows established patterns
- [ ] API integration uses established service patterns
- [ ] Digital signature compliance with legal requirements
- [ ] Secure handling of child information and documents

### Design Requirements
- [ ] Screens match design system specifications exactly
- [ ] Parent-focused UI patterns are intuitive and family-friendly
- [ ] Child information displays are clear and organized
- [ ] Form layouts are simple and easy to complete
- [ ] Progress visualizations are engaging and informative
- [ ] Loading and error states are visually consistent

### Testing Requirements
- [ ] Unit tests for all custom hooks
- [ ] Component tests for all screen components
- [ ] Integration tests for parent workflows
- [ ] Digital signature functionality testing
- [ ] Manual testing on iOS and Android devices
- [ ] Privacy and security testing for child data
- [ ] Legal compliance testing for permission slips

## Manual Testing Instructions

### Test Case 1: Parent Dashboard
1. Open parent dashboard and verify all sections load
2. Test child overview and navigation to profiles
3. Test pending actions and quick completion
4. Test program recommendations and booking
5. Test emergency contact display
6. Test pull-to-refresh functionality

### Test Case 2: Permission Slip Management
1. Navigate to permission slips list
2. Test opening and completing a permission slip
3. Test digital signature functionality
4. Test form validation and error handling
5. Test draft saving and resuming
6. Test submission and confirmation process

### Test Case 3: Child Profile and Progress
1. View child profile with complete information
2. Test progress tracking visualizations
3. Test teacher feedback and observations
4. Test photo gallery and documentation
5. Test goal setting and milestone tracking
6. Test sharing progress with family

### Test Case 4: Communication Features
1. Test messaging with teachers and school
2. Test notification reception and handling
3. Test photo and document sharing
4. Test emergency alert functionality
5. Test message search and organization

## API Integration Requirements

### Spark Parent Endpoints Used
- `GET /api/spark/parent/dashboard` - Get parent dashboard data
- `GET /api/spark/parent/children` - Get children information
- `GET /api/spark/programs/browse` - Browse available programs
- `POST /api/spark/bookings` - Book program for child
- `GET /api/spark/permission-slips` - Get permission slips
- `POST /api/spark/permission-slips/{id}/sign` - Sign permission slip
- `GET /api/spark/children/{id}/progress` - Get child progress
- `POST /api/spark/messages` - Send message to school

### Data Validation
- Child information privacy compliance
- Digital signature legal requirements
- Medical information accuracy
- Emergency contact verification
- Photo/video consent validation
- Form completion requirements

## Dependencies and Integration Points

### Required Components (from Agent 4)
- Button, Input, TextArea components
- Signature capture component
- Photo/document upload components
- LoadingSpinner, EmptyState components
- Navigation system setup
- Redux store configuration

### API Dependencies (from Agent 3)
- Permission slip management system
- Child and parent data management
- Program booking and scheduling
- Progress tracking and reporting
- Communication and messaging system

### Design System Dependencies
- Parent-friendly interface patterns
- Child-focused design elements
- Form and signature capture designs
- Progress visualization patterns
- Family-oriented color schemes

## Completion Checklist

- [ ] All screen components implemented and tested
- [ ] Parent-specific components created
- [ ] Custom hooks implemented and tested
- [ ] Navigation configuration updated
- [ ] Redux integration working
- [ ] API integration complete
- [ ] Digital signature functionality working
- [ ] Form validation working
- [ ] Progress tracking working
- [ ] Communication features working
- [ ] Manual testing completed
- [ ] Privacy and security testing completed
- [ ] Legal compliance verification completed
- [ ] Code review completed
- [ ] Documentation updated

## Notes for Next Tasks
- Parent interface establishes family engagement foundation
- Permission slip patterns important for legal compliance
- Child progress tracking provides basis for educational outcomes
- Communication patterns can be extended to teacher-parent collaboration
- Digital signature implementation critical for legal requirements
- Privacy and security patterns essential for child data protection
