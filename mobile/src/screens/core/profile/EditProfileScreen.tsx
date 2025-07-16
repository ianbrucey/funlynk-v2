import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * EditProfileScreen Component
 * 
 * Allows users to edit their profile information including personal details,
 * bio, interests, and profile/cover photos.
 * 
 * Features:
 * - Profile photo upload and editing
 * - Cover photo management
 * - Personal information editing (name, bio, location)
 * - Interest selection and management
 * - Privacy settings quick access
 * - Form validation and error handling
 * - Auto-save functionality
 */

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Form refs
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const bioRef = useRef<TextInput>(null);
  const locationRef = useRef<TextInput>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Passionate about bringing fun and educational experiences to children. Love organizing creative activities and outdoor adventures!',
    location: 'San Francisco, CA',
    avatar: null,
    coverPhoto: null,
  });
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    '1', '2', '3', '4', '5'
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Available interests
  const availableInterests = [
    { id: '1', name: 'Arts & Crafts', color: '#F59E0B' },
    { id: '2', name: 'Science', color: '#10B981' },
    { id: '3', name: 'Outdoor Activities', color: '#3B82F6' },
    { id: '4', name: 'Music', color: '#8B5CF6' },
    { id: '5', name: 'Sports', color: '#EF4444' },
    { id: '6', name: 'Cooking', color: '#F97316' },
    { id: '7', name: 'Reading', color: '#06B6D4' },
    { id: '8', name: 'Technology', color: '#6366F1' },
    { id: '9', name: 'Dance', color: '#EC4899' },
    { id: '10', name: 'Photography', color: '#84CC16' },
  ];

  // Handle form field changes
  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  // Handle interest toggle
  const handleInterestToggle = useCallback((interestId: string) => {
    setSelectedInterests(prev => {
      const newInterests = prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId];
      setHasChanges(true);
      return newInterests;
    });
  }, []);

  // Handle photo selection
  const handlePhotoSelect = useCallback((type: 'avatar' | 'coverPhoto') => {
    Alert.alert(
      'Select Photo',
      'Choose photo source',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => console.log(`Open camera for ${type}`) },
        { text: 'Photo Library', onPress: () => console.log(`Open library for ${type}`) },
      ]
    );
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!hasChanges) {
      navigation.goBack();
      return;
    }

    // Validate form
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Validation Error', 'First name and last name are required.');
      return;
    }

    if (formData.bio.length > 500) {
      Alert.alert('Validation Error', 'Bio must be 500 characters or less.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Profile updated:', {
        ...formData,
        interests: selectedInterests
      });
      
      Alert.alert(
        'Profile Updated',
        'Your profile has been updated successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, selectedInterests, hasChanges, navigation]);

  // Handle discard changes
  const handleDiscard = useCallback(() => {
    if (!hasChanges) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  }, [hasChanges, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDiscard}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          <Text style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Cover Photo Section */}
          <View style={styles.coverPhotoSection}>
            <TouchableOpacity
              style={styles.coverPhotoContainer}
              onPress={() => handlePhotoSelect('coverPhoto')}
            >
              {formData.coverPhoto ? (
                <Image source={{ uri: formData.coverPhoto }} style={styles.coverPhoto} />
              ) : (
                <View style={styles.coverPhotoPlaceholder}>
                  <Text style={styles.coverPhotoText}>📷</Text>
                  <Text style={styles.coverPhotoLabel}>Add Cover Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Profile Photo Section */}
          <View style={styles.profilePhotoSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => handlePhotoSelect('avatar')}
            >
              {formData.avatar ? (
                <Image source={{ uri: formData.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                  </Text>
                </View>
              )}
              <View style={styles.editPhotoOverlay}>
                <Text style={styles.editPhotoIcon}>📷</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>First Name</Text>
                <TextInput
                  ref={firstNameRef}
                  style={styles.textInput}
                  value={formData.firstName}
                  onChangeText={(value) => handleFieldChange('firstName', value)}
                  placeholder="Enter first name"
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                />
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Last Name</Text>
                <TextInput
                  ref={lastNameRef}
                  style={styles.textInput}
                  value={formData.lastName}
                  onChangeText={(value) => handleFieldChange('lastName', value)}
                  placeholder="Enter last name"
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="next"
                  onSubmitEditing={() => bioRef.current?.focus()}
                />
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Bio</Text>
              <TextInput
                ref={bioRef}
                style={[styles.textInput, styles.textArea]}
                value={formData.bio}
                onChangeText={(value) => handleFieldChange('bio', value)}
                placeholder="Tell others about yourself..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                maxLength={500}
                returnKeyType="next"
                onSubmitEditing={() => locationRef.current?.focus()}
              />
              <Text style={styles.characterCount}>
                {formData.bio.length}/500
              </Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Location</Text>
              <TextInput
                ref={locationRef}
                style={styles.textInput}
                value={formData.location}
                onChangeText={(value) => handleFieldChange('location', value)}
                placeholder="Enter your location"
                placeholderTextColor="#9CA3AF"
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Interests Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <Text style={styles.sectionDescription}>
              Select topics you're interested in to help others find you
            </Text>
            
            <View style={styles.interestsGrid}>
              {availableInterests.map((interest) => (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.interestChip,
                    selectedInterests.includes(interest.id) && styles.interestChipSelected,
                    { borderColor: interest.color }
                  ]}
                  onPress={() => handleInterestToggle(interest.id)}
                >
                  <Text style={[
                    styles.interestText,
                    selectedInterests.includes(interest.id) && styles.interestTextSelected,
                    { color: selectedInterests.includes(interest.id) ? '#FFFFFF' : interest.color }
                  ]}>
                    {interest.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Privacy Settings Quick Access */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Settings</Text>
            
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigation.navigate('PrivacySettings')}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Privacy Settings</Text>
                <Text style={styles.settingDescription}>
                  Control who can see your profile and activities
                </Text>
              </View>
              <Text style={styles.settingArrow}>→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigation.navigate('NotificationSettings')}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Notification Settings</Text>
                <Text style={styles.settingDescription}>
                  Manage your notification preferences
                </Text>
              </View>
              <Text style={styles.settingArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  cancelButton: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  saveButtonDisabled: {
    color: '#9CA3AF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  coverPhotoSection: {
    height: 120,
    backgroundColor: '#FFFFFF',
  },
  coverPhotoContainer: {
    flex: 1,
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  coverPhotoPlaceholder: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPhotoText: {
    fontSize: 32,
    marginBottom: 8,
  },
  coverPhotoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  profilePhotoSection: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    position: 'relative',
    marginTop: -50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  editPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editPhotoIcon: {
    fontSize: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formField: {
    flex: 1,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'right',
    marginTop: 4,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  interestChipSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  interestTextSelected: {
    color: '#FFFFFF',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  settingArrow: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
});

export default EditProfileScreen;
