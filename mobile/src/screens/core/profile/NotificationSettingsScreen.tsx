import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * NotificationSettingsScreen Component
 *
 * Granular notification controls for different types of notifications
 * and delivery preferences.
 *
 * Features:
 * - Event notifications (new events, RSVPs, updates)
 * - Social notifications (follows, messages, mentions)
 * - System notifications (security, updates, maintenance)
 * - Frequency settings (immediate, daily digest, weekly)
 * - Quiet hours configuration
 * - Delivery method preferences (push, email, SMS)
 */

export const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Notification settings state
  const [settings, setSettings] = useState({
    // Event Notifications
    newEvents: true,
    eventUpdates: true,
    eventReminders: true,
    eventCancellations: true,
    rsvpConfirmations: true,
    
    // Social Notifications
    newFollowers: true,
    directMessages: true,
    mentions: false,
    activityLikes: false,
    activityComments: true,
    
    // System Notifications
    securityAlerts: true,
    appUpdates: false,
    maintenanceNotices: true,
    policyUpdates: false,
    
    // Delivery Methods
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    
    // Frequency Settings
    eventFrequency: 'immediate', // immediate, daily, weekly
    socialFrequency: 'immediate',
    systemFrequency: 'immediate',
    
    // Quiet Hours
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Handle setting toggle
  const handleSettingToggle = useCallback(async (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    try {
      // Simulate API call
      console.log(`Update notification setting ${key}:`, value);
      // In real app, would call API to update setting
    } catch (error) {
      console.error('Setting update failed:', error);
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: !value }));
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  }, []);

  // Handle frequency change
  const handleFrequencyChange = useCallback((category: string, frequency: string) => {
    const key = `${category}Frequency`;
    setSettings(prev => ({ ...prev, [key]: frequency }));
    
    try {
      console.log(`Update ${category} frequency:`, frequency);
      // In real app, would call API to update setting
    } catch (error) {
      console.error('Frequency update failed:', error);
      Alert.alert('Error', 'Failed to update frequency. Please try again.');
    }
  }, []);

  // Handle quiet hours configuration
  const handleQuietHoursConfig = useCallback(() => {
    Alert.alert(
      'Quiet Hours',
      'Configure quiet hours when you won\'t receive notifications',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Configure', onPress: () => {
          Alert.alert('Quiet Hours', 'Time picker for quiet hours would be implemented here.');
        }},
      ]
    );
  }, []);

  // Render setting item with switch
  const renderSwitchItem = useCallback((
    title: string,
    subtitle: string,
    key: string,
    value: boolean
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => handleSettingToggle(key, newValue)}
        trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
        thumbColor="#FFFFFF"
      />
    </View>
  ), [handleSettingToggle]);

  // Render frequency selector
  const renderFrequencySelector = useCallback((
    title: string,
    category: string,
    currentValue: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>
          Current: {currentValue === 'immediate' ? 'Immediate' : 
                   currentValue === 'daily' ? 'Daily digest' : 'Weekly digest'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.frequencyButton}
        onPress={() => {
          Alert.alert(
            'Notification Frequency',
            'Choose how often you want to receive these notifications',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Immediate', onPress: () => handleFrequencyChange(category, 'immediate') },
              { text: 'Daily Digest', onPress: () => handleFrequencyChange(category, 'daily') },
              { text: 'Weekly Digest', onPress: () => handleFrequencyChange(category, 'weekly') },
            ]
          );
        }}
      >
        <Text style={styles.frequencyButtonText}>Change</Text>
      </TouchableOpacity>
    </View>
  ), [handleFrequencyChange]);

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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Methods */}
        {renderSection('Delivery Methods', (
          <>
            {renderSwitchItem(
              'Push Notifications',
              'Receive notifications on your device',
              'pushNotifications',
              settings.pushNotifications
            )}
            {renderSwitchItem(
              'Email Notifications',
              'Receive notifications via email',
              'emailNotifications',
              settings.emailNotifications
            )}
            {renderSwitchItem(
              'SMS Notifications',
              'Receive notifications via text message',
              'smsNotifications',
              settings.smsNotifications
            )}
          </>
        ))}

        {/* Event Notifications */}
        {renderSection('Event Notifications', (
          <>
            {renderSwitchItem(
              'New Events',
              'Notify when new events are posted in your interests',
              'newEvents',
              settings.newEvents
            )}
            {renderSwitchItem(
              'Event Updates',
              'Notify when events you\'re attending are updated',
              'eventUpdates',
              settings.eventUpdates
            )}
            {renderSwitchItem(
              'Event Reminders',
              'Remind you about upcoming events',
              'eventReminders',
              settings.eventReminders
            )}
            {renderSwitchItem(
              'Event Cancellations',
              'Notify when events are cancelled',
              'eventCancellations',
              settings.eventCancellations
            )}
            {renderSwitchItem(
              'RSVP Confirmations',
              'Confirm when you RSVP to events',
              'rsvpConfirmations',
              settings.rsvpConfirmations
            )}
            {renderFrequencySelector(
              'Event Notification Frequency',
              'event',
              settings.eventFrequency
            )}
          </>
        ))}

        {/* Social Notifications */}
        {renderSection('Social Notifications', (
          <>
            {renderSwitchItem(
              'New Followers',
              'Notify when someone follows you',
              'newFollowers',
              settings.newFollowers
            )}
            {renderSwitchItem(
              'Direct Messages',
              'Notify when you receive direct messages',
              'directMessages',
              settings.directMessages
            )}
            {renderSwitchItem(
              'Mentions',
              'Notify when someone mentions you',
              'mentions',
              settings.mentions
            )}
            {renderSwitchItem(
              'Activity Likes',
              'Notify when someone likes your activity',
              'activityLikes',
              settings.activityLikes
            )}
            {renderSwitchItem(
              'Activity Comments',
              'Notify when someone comments on your activity',
              'activityComments',
              settings.activityComments
            )}
            {renderFrequencySelector(
              'Social Notification Frequency',
              'social',
              settings.socialFrequency
            )}
          </>
        ))}

        {/* System Notifications */}
        {renderSection('System Notifications', (
          <>
            {renderSwitchItem(
              'Security Alerts',
              'Important security and account notifications',
              'securityAlerts',
              settings.securityAlerts
            )}
            {renderSwitchItem(
              'App Updates',
              'Notify about new app features and updates',
              'appUpdates',
              settings.appUpdates
            )}
            {renderSwitchItem(
              'Maintenance Notices',
              'Notify about scheduled maintenance',
              'maintenanceNotices',
              settings.maintenanceNotices
            )}
            {renderSwitchItem(
              'Policy Updates',
              'Notify about privacy policy and terms updates',
              'policyUpdates',
              settings.policyUpdates
            )}
            {renderFrequencySelector(
              'System Notification Frequency',
              'system',
              settings.systemFrequency
            )}
          </>
        ))}

        {/* Quiet Hours */}
        {renderSection('Quiet Hours', (
          <>
            {renderSwitchItem(
              'Enable Quiet Hours',
              'Pause notifications during specified hours',
              'quietHoursEnabled',
              settings.quietHoursEnabled
            )}
            {settings.quietHoursEnabled && (
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleQuietHoursConfig}
              >
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Configure Quiet Hours</Text>
                  <Text style={styles.settingSubtitle}>
                    Currently: {settings.quietHoursStart} - {settings.quietHoursEnd}
                  </Text>
                </View>
                <Text style={styles.settingArrow}>→</Text>
              </TouchableOpacity>
            )}
          </>
        ))}

        {/* Test Notifications */}
        {renderSection('Test', (
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              Alert.alert('Test Notification', 'A test notification would be sent to verify your settings.');
            }}
          >
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  frequencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  testButton: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
});

export default NotificationSettingsScreen;
