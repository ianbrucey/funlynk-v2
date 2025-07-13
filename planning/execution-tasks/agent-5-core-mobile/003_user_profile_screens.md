# Task 003: User Profile Screens Implementation
**Agent**: Core Mobile UI Developer  
**Estimated Time**: 6-7 hours  
**Priority**: Medium  
**Dependencies**: Agent 5 Task 001 (Authentication Screens), Agent 2 Task 001 (User Management API)  

## Overview
Implement comprehensive user profile management screens for Funlynk Core mobile app including profile viewing, editing, settings, preferences, and social features using the established design system and component library.

## Prerequisites
- Authentication screens complete (Agent 5 Task 001)
- User Management API endpoints available (Agent 2 Task 001)
- User authentication state management working
- Navigation system configured

## Step-by-Step Implementation

### Step 1: Create Profile View and Edit Screens (2.5 hours)

**Create ProfileScreen component:**
```bash
# Create profile screen directory
mkdir -p src/screens/core/profile

# Create ProfileScreen component
touch src/screens/core/profile/ProfileScreen.tsx
```

**Implement ProfileScreen.tsx using template pattern:**
```typescript
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '../../../components/shared/atoms/Button';
import { LoadingSpinner } from '../../../components/shared/atoms/LoadingSpinner';
import { EmptyState } from '../../../components/shared/molecules/EmptyState';

// Profile-specific components
import { ProfileHeader } from '../../../components/core/molecules/ProfileHeader';
import { ProfileStats } from '../../../components/core/molecules/ProfileStats';
import { InterestChips } from '../../../components/core/molecules/InterestChips';
import { EventGrid } from '../../../components/core/organisms/EventGrid';
import { FollowButton } from '../../../components/core/atoms/FollowButton';

// Hooks
import { useProfile } from '../../../hooks/core/useProfile';
import { useAuth } from '../../../hooks/shared/useAuth';
import { useErrorHandler } from '../../../hooks/shared/useErrorHandler';

// Types
import type { User, UserProfile } from '../../../types/user';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import type { CoreStackParamList } from '../../../navigation/CoreNavigator';

// Redux
import { profileActions } from '../../../store/slices/profileSlice';
import type { RootState } from '../../../store/store';

/**
 * ProfileScreen Component
 * 
 * Displays user profile information including personal details, interests,
 * hosted events, and social connections. Supports both own profile and
 * other users' profiles with appropriate permissions.
 * 
 * Features:
 * - Profile header with avatar, name, bio
 * - Profile statistics (events hosted, attended, followers)
 * - Interest tags and categories
 * - Hosted and attended events grid
 * - Follow/unfollow functionality for other users
 * - Settings access for own profile
 * - Share profile functionality
 */

type ProfileScreenNavigationProp = NavigationProp<CoreStackParamList, 'Profile'>;
type ProfileScreenRouteProp = RouteProp<CoreStackParamList, 'Profile'>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute<ProfileScreenRouteProp>();
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const { handleError } = useErrorHandler();
  
  // Route params
  const userId = route.params?.userId || currentUser?.id;
  const isOwnProfile = userId === currentUser?.id;
  
  // Redux state
  const {
    profiles,
    isLoading,
    isRefreshing,
    error,
  } = useSelector((state: RootState) => state.profile);
  
  const profile = profiles[userId];
  
  // Local state
  const [activeTab, setActiveTab] = useState<'hosted' | 'attended'>('hosted');

  // Custom hooks
  const {
    loadProfile,
    refreshProfile,
    followUser,
    unfollowUser,
    blockUser,
    reportUser,
  } = useProfile();

  // Load profile on screen focus
  useFocusEffect(
    useCallback(() => {
      if (userId && !profile) {
        loadProfile(userId);
      }
    }, [userId, profile, loadProfile])
  );

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    if (userId) {
      try {
        await refreshProfile(userId);
      } catch (error) {
        handleError(error);
      }
    }
  }, [userId, refreshProfile, handleError]);

  // Handle follow/unfollow
  const handleFollowToggle = useCallback(async () => {
    if (!profile || isOwnProfile) return;
    
    try {
      if (profile.isFollowing) {
        await unfollowUser(profile.id);
      } else {
        await followUser(profile.id);
      }
    } catch (error) {
      handleError(error);
    }
  }, [profile, isOwnProfile, followUser, unfollowUser, handleError]);

  // Handle block user
  const handleBlockUser = useCallback(async () => {
    if (!profile || isOwnProfile) return;
    
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${profile.firstName}? They won't be able to see your profile or contact you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUser(profile.id);
              navigation.goBack();
            } catch (error) {
              handleError(error);
            }
          },
        },
      ]
    );
  }, [profile, isOwnProfile, blockUser, navigation, handleError]);

  // Handle report user
  const handleReportUser = useCallback(async () => {
    if (!profile || isOwnProfile) return;
    
    navigation.navigate('ReportUser', { userId: profile.id });
  }, [profile, isOwnProfile, navigation]);

  // Handle share profile
  const handleShareProfile = useCallback(async () => {
    if (!profile) return;
    
    try {
      // Implement share functionality
      const shareUrl = `https://funlynk.com/profile/${profile.id}`;
      // Use React Native Share API
    } catch (error) {
      handleError(error);
    }
  }, [profile, handleError]);

  // Render loading state
  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="user"
          title="Profile not found"
          subtitle="This user profile could not be loaded"
          actionText="Go Back"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
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
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          onEditPress={() => navigation.navigate('EditProfile')}
          onSettingsPress={() => navigation.navigate('Settings')}
          onSharePress={handleShareProfile}
          onMorePress={() => {
            // Show action sheet with block/report options
            Alert.alert(
              'Profile Options',
              'Choose an action',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Report User', onPress: handleReportUser },
                { text: 'Block User', style: 'destructive', onPress: handleBlockUser },
              ]
            );
          }}
        />

        {/* Follow Button for Other Users */}
        {!isOwnProfile && (
          <View style={styles.followContainer}>
            <FollowButton
              isFollowing={profile.isFollowing}
              onPress={handleFollowToggle}
              loading={isLoading}
              testID="profile-follow-button"
            />
          </View>
        )}

        {/* Profile Statistics */}
        <ProfileStats
          stats={{
            eventsHosted: profile.eventsHosted,
            eventsAttended: profile.eventsAttended,
            followers: profile.followersCount,
            following: profile.followingCount,
          }}
          onStatsPress={(type) => {
            switch (type) {
              case 'followers':
                navigation.navigate('UserList', { 
                  type: 'followers', 
                  userId: profile.id,
                  title: 'Followers' 
                });
                break;
              case 'following':
                navigation.navigate('UserList', { 
                  type: 'following', 
                  userId: profile.id,
                  title: 'Following' 
                });
                break;
            }
          }}
        />

        {/* Bio Section */}
        {profile.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* Interests Section */}
        {profile.interests && profile.interests.length > 0 && (
          <View style={styles.interestsSection}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <InterestChips
              interests={profile.interests}
              onInterestPress={(interest) => {
                navigation.navigate('EventList', {
                  filter: { category: interest.id },
                  title: interest.name,
                });
              }}
            />
          </View>
        )}

        {/* Events Section */}
        <View style={styles.eventsSection}>
          <View style={styles.tabContainer}>
            <Button
              variant={activeTab === 'hosted' ? 'primary' : 'secondary'}
              size="medium"
              onPress={() => setActiveTab('hosted')}
              style={[styles.tabButton, activeTab === 'hosted' && styles.activeTab]}
              testID="hosted-events-tab"
            >
              Hosted ({profile.eventsHosted})
            </Button>
            <Button
              variant={activeTab === 'attended' ? 'primary' : 'secondary'}
              size="medium"
              onPress={() => setActiveTab('attended')}
              style={[styles.tabButton, activeTab === 'attended' && styles.activeTab]}
              testID="attended-events-tab"
            >
              Attended ({profile.eventsAttended})
            </Button>
          </View>

          <EventGrid
            events={activeTab === 'hosted' ? profile.hostedEvents : profile.attendedEvents}
            onEventPress={(event) => navigation.navigate('EventDetails', { eventId: event.id })}
            emptyMessage={
              activeTab === 'hosted' 
                ? isOwnProfile 
                  ? "You haven't hosted any events yet"
                  : `${profile.firstName} hasn't hosted any events yet`
                : isOwnProfile
                  ? "You haven't attended any events yet"
                  : `${profile.firstName} hasn't attended any public events`
            }
            emptyAction={
              activeTab === 'hosted' && isOwnProfile
                ? {
                    text: 'Create Event',
                    onPress: () => navigation.navigate('CreateEvent'),
                  }
                : undefined
            }
          />
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
    paddingBottom: 20,
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
  followContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  bioSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  interestsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  eventsSection: {
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
});
```

**Create EditProfileScreen component:**
```bash
touch src/screens/core/profile/EditProfileScreen.tsx
```

**Implement EditProfileScreen.tsx with comprehensive editing:**
- Personal information form (name, bio, location)
- Profile photo upload and cropping
- Interest selection and management
- Privacy settings configuration
- Social media links
- Contact preferences

### Step 2: Create Settings and Preferences Screens (2 hours)

**Create SettingsScreen component:**
```bash
touch src/screens/core/profile/SettingsScreen.tsx
```

**Implement SettingsScreen.tsx with organized settings sections:**
```typescript
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '../../../components/shared/atoms/Button';
import { SettingsItem } from '../../../components/shared/molecules/SettingsItem';
import { SettingsSection } from '../../../components/shared/molecules/SettingsSection';

// Hooks
import { useAuth } from '../../../hooks/shared/useAuth';
import { useSettings } from '../../../hooks/core/useSettings';
import { useErrorHandler } from '../../../hooks/shared/useErrorHandler';

// Types
import type { NavigationProp } from '@react-navigation/native';
import type { CoreStackParamList } from '../../../navigation/CoreNavigator';
import type { UserSettings } from '../../../types/user';

/**
 * SettingsScreen Component
 *
 * Comprehensive settings management including account, privacy,
 * notifications, and app preferences.
 *
 * Features:
 * - Account management (email, password, delete account)
 * - Privacy settings (profile visibility, location sharing)
 * - Notification preferences (push, email, SMS)
 * - App preferences (theme, language, accessibility)
 * - Data management (export, delete data)
 * - Support and feedback options
 */

type SettingsScreenNavigationProp = NavigationProp<CoreStackParamList, 'Settings'>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const { handleError } = useErrorHandler();

  // Redux state
  const { settings, isLoading } = useSelector((state: RootState) => state.settings);

  // Custom hooks
  const { updateSettings, deleteAccount, exportData } = useSettings();

  // Handle setting toggle
  const handleSettingToggle = useCallback(async (key: keyof UserSettings, value: boolean) => {
    try {
      await updateSettings({ [key]: value });
    } catch (error) {
      handleError(error);
    }
  }, [updateSettings, handleError]);

  // Handle account deletion
  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteAccount();
                      await logout();
                    } catch (error) {
                      handleError(error);
                    }
                  },
                },
              ],
              { cancelable: false }
            );
          },
        },
      ]
    );
  }, [deleteAccount, logout, handleError]);

  // Handle data export
  const handleExportData = useCallback(async () => {
    try {
      await exportData();
      Alert.alert(
        'Data Export',
        'Your data export has been initiated. You will receive an email with download instructions within 24 hours.'
      );
    } catch (error) {
      handleError(error);
    }
  }, [exportData, handleError]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingsItem
            title="Edit Profile"
            subtitle="Update your personal information"
            icon="user"
            onPress={() => navigation.navigate('EditProfile')}
            testID="edit-profile-setting"
          />
          <SettingsItem
            title="Change Email"
            subtitle={user?.email}
            icon="mail"
            onPress={() => navigation.navigate('ChangeEmail')}
            testID="change-email-setting"
          />
          <SettingsItem
            title="Change Password"
            subtitle="Update your password"
            icon="lock"
            onPress={() => navigation.navigate('ChangePassword')}
            testID="change-password-setting"
          />
        </SettingsSection>

        {/* Privacy Section */}
        <SettingsSection title="Privacy">
          <SettingsItem
            title="Profile Visibility"
            subtitle="Who can see your profile"
            icon="eye"
            onPress={() => navigation.navigate('PrivacySettings')}
            testID="profile-visibility-setting"
          />
          <SettingsItem
            title="Location Sharing"
            subtitle="Share your location with others"
            icon="map-pin"
            rightComponent={
              <Switch
                value={settings?.shareLocation || false}
                onValueChange={(value) => handleSettingToggle('shareLocation', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            }
            testID="location-sharing-setting"
          />
          <SettingsItem
            title="Activity Status"
            subtitle="Show when you're active"
            icon="activity"
            rightComponent={
              <Switch
                value={settings?.showActivityStatus || false}
                onValueChange={(value) => handleSettingToggle('showActivityStatus', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            }
            testID="activity-status-setting"
          />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingsItem
            title="Push Notifications"
            subtitle="Receive notifications on your device"
            icon="bell"
            rightComponent={
              <Switch
                value={settings?.pushNotifications || false}
                onValueChange={(value) => handleSettingToggle('pushNotifications', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            }
            testID="push-notifications-setting"
          />
          <SettingsItem
            title="Email Notifications"
            subtitle="Receive notifications via email"
            icon="mail"
            rightComponent={
              <Switch
                value={settings?.emailNotifications || false}
                onValueChange={(value) => handleSettingToggle('emailNotifications', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            }
            testID="email-notifications-setting"
          />
          <SettingsItem
            title="Notification Preferences"
            subtitle="Customize what notifications you receive"
            icon="settings"
            onPress={() => navigation.navigate('NotificationSettings')}
            testID="notification-preferences-setting"
          />
        </SettingsSection>

        {/* App Preferences Section */}
        <SettingsSection title="App Preferences">
          <SettingsItem
            title="Theme"
            subtitle="Light or dark mode"
            icon="moon"
            onPress={() => navigation.navigate('ThemeSettings')}
            testID="theme-setting"
          />
          <SettingsItem
            title="Language"
            subtitle="English"
            icon="globe"
            onPress={() => navigation.navigate('LanguageSettings')}
            testID="language-setting"
          />
          <SettingsItem
            title="Accessibility"
            subtitle="Accessibility options"
            icon="accessibility"
            onPress={() => navigation.navigate('AccessibilitySettings')}
            testID="accessibility-setting"
          />
        </SettingsSection>

        {/* Data & Privacy Section */}
        <SettingsSection title="Data & Privacy">
          <SettingsItem
            title="Download Your Data"
            subtitle="Export your account data"
            icon="download"
            onPress={handleExportData}
            testID="export-data-setting"
          />
          <SettingsItem
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            icon="shield"
            onPress={() => navigation.navigate('PrivacyPolicy')}
            testID="privacy-policy-setting"
          />
          <SettingsItem
            title="Terms of Service"
            subtitle="Read our terms of service"
            icon="file-text"
            onPress={() => navigation.navigate('TermsOfService')}
            testID="terms-service-setting"
          />
        </SettingsSection>

        {/* Support Section */}
        <SettingsSection title="Support">
          <SettingsItem
            title="Help Center"
            subtitle="Get help and support"
            icon="help-circle"
            onPress={() => navigation.navigate('HelpCenter')}
            testID="help-center-setting"
          />
          <SettingsItem
            title="Contact Support"
            subtitle="Get in touch with our team"
            icon="message-circle"
            onPress={() => navigation.navigate('ContactSupport')}
            testID="contact-support-setting"
          />
          <SettingsItem
            title="Send Feedback"
            subtitle="Help us improve the app"
            icon="message-square"
            onPress={() => navigation.navigate('SendFeedback')}
            testID="send-feedback-setting"
          />
        </SettingsSection>

        {/* Account Actions Section */}
        <SettingsSection title="Account Actions">
          <SettingsItem
            title="Sign Out"
            subtitle="Sign out of your account"
            icon="log-out"
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign Out', onPress: logout },
                ]
              );
            }}
            testID="sign-out-setting"
          />
          <SettingsItem
            title="Delete Account"
            subtitle="Permanently delete your account"
            icon="trash-2"
            onPress={handleDeleteAccount}
            destructive
            testID="delete-account-setting"
          />
        </SettingsSection>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Funlynk v1.0.0</Text>
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
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
});
```

**Create NotificationSettingsScreen component:**
```bash
touch src/screens/core/profile/NotificationSettingsScreen.tsx
```

**Implement NotificationSettingsScreen.tsx with granular notification controls:**
- Event notifications (new events, RSVPs, updates)
- Social notifications (follows, messages, mentions)
- System notifications (security, updates, maintenance)
- Frequency settings (immediate, daily digest, weekly)
- Quiet hours configuration

### Step 3: Create Social Features Screens (1.5 hours)

**Create FollowersScreen component:**
```bash
touch src/screens/core/profile/FollowersScreen.tsx
```

**Implement FollowersScreen.tsx for social connections:**
- Followers and following lists
- Search and filter users
- Follow/unfollow actions
- User profile previews
- Mutual connections display

**Create BlockedUsersScreen component:**
```bash
touch src/screens/core/profile/BlockedUsersScreen.tsx
```

**Implement BlockedUsersScreen.tsx for user management:**
- List of blocked users
- Unblock functionality
- Block reasons display
- Search blocked users

### Step 4: Create Profile-Specific Components and Hooks (0.5 hours)

**Create ProfileHeader molecule component:**
```bash
touch src/components/core/molecules/ProfileHeader.tsx
```

**Implement ProfileHeader.tsx:**
- Profile avatar with status indicator
- Name, username, and verification badge
- Bio and location display
- Action buttons (edit, settings, share, more)
- Cover photo support

**Create useProfile hook:**
```bash
touch src/hooks/core/useProfile.ts
```

**Implement useProfile.ts:**
- Profile CRUD operations
- Follow/unfollow functionality
- Block/report user actions
- Profile caching and state management
- Privacy settings management

## Acceptance Criteria

### Functional Requirements
- [ ] Profile screen displays user information correctly
- [ ] Edit profile form validates and saves changes
- [ ] Settings screen provides comprehensive options
- [ ] Notification preferences work correctly
- [ ] Follow/unfollow functionality works
- [ ] Block/report user functionality works
- [ ] Profile sharing works correctly
- [ ] Privacy settings are enforced
- [ ] Data export functionality works

### Technical Requirements
- [ ] All screens follow established component template patterns
- [ ] Redux integration for profile state management
- [ ] TypeScript types are properly defined and used
- [ ] Accessibility labels and hints are implemented
- [ ] Error handling follows established patterns
- [ ] API integration uses established service patterns
- [ ] Image upload and cropping works correctly
- [ ] Form validation is comprehensive

### Design Requirements
- [ ] Screens match design system specifications exactly
- [ ] Profile layouts are consistent and responsive
- [ ] Settings follow platform conventions
- [ ] Avatar and image handling follows guidelines
- [ ] Loading and error states are visually consistent

### Testing Requirements
- [ ] Unit tests for all custom hooks
- [ ] Component tests for all screen components
- [ ] Integration tests for profile flows
- [ ] Manual testing on iOS and Android devices
- [ ] Privacy and security testing
- [ ] Accessibility testing

## Manual Testing Instructions

### Test Case 1: Profile Viewing
1. View own profile and verify all information displays
2. View other users' profiles with different privacy settings
3. Test follow/unfollow functionality
4. Test profile sharing
5. Test navigation to hosted/attended events

### Test Case 2: Profile Editing
1. Edit profile information and verify saves
2. Upload and crop profile photo
3. Update interests and verify changes
4. Test form validation with invalid inputs
5. Test privacy settings changes

### Test Case 3: Settings Management
1. Navigate through all settings sections
2. Toggle notification preferences
3. Test account management features
4. Test data export functionality
5. Test account deletion flow (in staging only)

### Test Case 4: Social Features
1. Test followers/following lists
2. Test user search and filtering
3. Test block/unblock functionality
4. Test report user functionality
5. Test mutual connections display

## API Integration Requirements

### Profile Endpoints Used
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile
- `POST /api/users/{id}/follow` - Follow user
- `DELETE /api/users/{id}/follow` - Unfollow user
- `POST /api/users/{id}/block` - Block user
- `POST /api/users/{id}/report` - Report user
- `GET /api/users/{id}/followers` - Get followers
- `GET /api/users/{id}/following` - Get following
- `GET /api/users/settings` - Get user settings
- `PUT /api/users/settings` - Update user settings

### Data Validation
- Profile information validation
- Image format and size validation
- Privacy settings validation
- Notification preferences validation
- Bio length and content validation

## Dependencies and Integration Points

### Required Components (from Agent 4)
- Button, Input, TextArea components
- ImagePicker, Switch components
- LoadingSpinner, EmptyState components
- Navigation system setup
- Redux store configuration

### API Dependencies (from Agent 2)
- User management endpoints
- Profile and settings APIs
- Image upload service
- Social features APIs
- Privacy and security features

### Design System Dependencies
- Profile layout specifications
- Settings screen patterns
- Avatar and image guidelines
- Social interaction patterns
- Privacy indicator designs

## Completion Checklist

- [ ] All screen components implemented and tested
- [ ] Profile-specific components created
- [ ] Custom hooks implemented and tested
- [ ] Navigation configuration updated
- [ ] Redux integration working
- [ ] API integration complete
- [ ] Form validation working
- [ ] Image upload functionality working
- [ ] Privacy settings working
- [ ] Social features working
- [ ] Manual testing completed
- [ ] Security testing completed
- [ ] Code review completed
- [ ] Documentation updated

## Notes for Next Tasks
- Profile management establishes user identity foundation
- Privacy patterns can be reused across other features
- Social connection patterns established for messaging features
- Settings patterns can be extended for app-wide preferences
- Image handling patterns established for event and other content
