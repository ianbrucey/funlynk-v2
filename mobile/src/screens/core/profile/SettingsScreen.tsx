import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

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

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Mock user data
  const mockUser = {
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  // Settings state
  const [settings, setSettings] = useState({
    shareLocation: true,
    showActivityStatus: false,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    eventReminders: true,
    socialNotifications: true,
    marketingEmails: false,
    darkMode: false,
    language: 'English',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Handle setting toggle
  const handleSettingToggle = useCallback(async (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    try {
      // Simulate API call
      console.log(`Update setting ${key}:`, value);
      // In real app, would call API to update setting
    } catch (error) {
      console.error('Setting update failed:', error);
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: !value }));
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  }, []);

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
                    setIsLoading(true);
                    try {
                      // Simulate API call
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      console.log('Account deleted');
                      Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
                    } catch (error) {
                      console.error('Account deletion failed:', error);
                      Alert.alert('Error', 'Failed to delete account. Please try again.');
                    } finally {
                      setIsLoading(false);
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
  }, []);

  // Handle data export
  const handleExportData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert(
        'Data Export',
        'Your data export has been initiated. You will receive an email with download instructions within 24 hours.'
      );
    } catch (error) {
      console.error('Data export failed:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          onPress: () => {
            console.log('User logged out');
            // In real app, would clear auth state and navigate to login
          }
        },
      ]
    );
  }, []);

  // Render setting item
  const renderSettingItem = useCallback((
    title: string,
    subtitle?: string,
    icon?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode,
    destructive?: boolean
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !rightComponent}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, destructive && styles.destructiveText]}>
            {icon && `${icon} `}{title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
        {rightComponent || (onPress && (
          <Text style={styles.settingArrow}>→</Text>
        ))}
      </View>
    </TouchableOpacity>
  ), []);

  // Render section
  const renderSection = useCallback((title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        {renderSection('Account', (
          <>
            {renderSettingItem(
              'Edit Profile',
              'Update your personal information',
              '👤',
              () => navigation.navigate('EditProfile')
            )}
            {renderSettingItem(
              'Change Email',
              mockUser.email,
              '✉️',
              () => Alert.alert('Change Email', 'Email change functionality would be implemented here.')
            )}
            {renderSettingItem(
              'Change Password',
              'Update your password',
              '🔒',
              () => Alert.alert('Change Password', 'Password change functionality would be implemented here.')
            )}
          </>
        ))}

        {/* Privacy Section */}
        {renderSection('Privacy', (
          <>
            {renderSettingItem(
              'Profile Visibility',
              'Who can see your profile',
              '👁️',
              () => Alert.alert('Profile Visibility', 'Privacy settings would be implemented here.')
            )}
            {renderSettingItem(
              'Location Sharing',
              'Share your location with others',
              '📍',
              undefined,
              <Switch
                value={settings.shareLocation}
                onValueChange={(value) => handleSettingToggle('shareLocation', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            )}
            {renderSettingItem(
              'Activity Status',
              'Show when you\'re active',
              '🟢',
              undefined,
              <Switch
                value={settings.showActivityStatus}
                onValueChange={(value) => handleSettingToggle('showActivityStatus', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            )}
          </>
        ))}

        {/* Notifications Section */}
        {renderSection('Notifications', (
          <>
            {renderSettingItem(
              'Push Notifications',
              'Receive notifications on your device',
              '🔔',
              undefined,
              <Switch
                value={settings.pushNotifications}
                onValueChange={(value) => handleSettingToggle('pushNotifications', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            )}
            {renderSettingItem(
              'Email Notifications',
              'Receive notifications via email',
              '📧',
              undefined,
              <Switch
                value={settings.emailNotifications}
                onValueChange={(value) => handleSettingToggle('emailNotifications', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            )}
            {renderSettingItem(
              'Event Reminders',
              'Get reminded about upcoming events',
              '⏰',
              undefined,
              <Switch
                value={settings.eventReminders}
                onValueChange={(value) => handleSettingToggle('eventReminders', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            )}
            {renderSettingItem(
              'Notification Preferences',
              'Customize what notifications you receive',
              '⚙️',
              () => navigation.navigate('NotificationSettings')
            )}
          </>
        ))}

        {/* App Preferences Section */}
        {renderSection('App Preferences', (
          <>
            {renderSettingItem(
              'Theme',
              settings.darkMode ? 'Dark mode' : 'Light mode',
              '🌙',
              undefined,
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => handleSettingToggle('darkMode', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            )}
            {renderSettingItem(
              'Language',
              settings.language,
              '🌐',
              () => Alert.alert('Language', 'Language selection would be implemented here.')
            )}
            {renderSettingItem(
              'Accessibility',
              'Accessibility options',
              '♿',
              () => Alert.alert('Accessibility', 'Accessibility settings would be implemented here.')
            )}
          </>
        ))}

        {/* Data & Privacy Section */}
        {renderSection('Data & Privacy', (
          <>
            {renderSettingItem(
              'Download Your Data',
              'Export your account data',
              '📥',
              handleExportData
            )}
            {renderSettingItem(
              'Privacy Policy',
              'Read our privacy policy',
              '🛡️',
              () => Alert.alert('Privacy Policy', 'Privacy policy would be displayed here.')
            )}
            {renderSettingItem(
              'Terms of Service',
              'Read our terms of service',
              '📄',
              () => Alert.alert('Terms of Service', 'Terms of service would be displayed here.')
            )}
          </>
        ))}

        {/* Support Section */}
        {renderSection('Support', (
          <>
            {renderSettingItem(
              'Help Center',
              'Get help and support',
              '❓',
              () => Alert.alert('Help Center', 'Help center would be implemented here.')
            )}
            {renderSettingItem(
              'Contact Support',
              'Get in touch with our team',
              '💬',
              () => Alert.alert('Contact Support', 'Support contact would be implemented here.')
            )}
            {renderSettingItem(
              'Send Feedback',
              'Help us improve the app',
              '💭',
              () => Alert.alert('Send Feedback', 'Feedback form would be implemented here.')
            )}
          </>
        ))}

        {/* Account Actions Section */}
        {renderSection('Account Actions', (
          <>
            {renderSettingItem(
              'Sign Out',
              'Sign out of your account',
              '🚪',
              handleLogout
            )}
            {renderSettingItem(
              'Delete Account',
              'Permanently delete your account',
              '🗑️',
              handleDeleteAccount,
              undefined,
              true
            )}
          </>
        ))}

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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  headerSpacer: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  settingItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  settingArrow: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  destructiveText: {
    color: '#EF4444',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
});

export default SettingsScreen;
