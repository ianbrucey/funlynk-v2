import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { theme } from '@/constants/theme';

interface InterestSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  minimumSelection?: number;
  maximumSelection?: number;
  showSearch?: boolean;
  testID?: string;
}

const DEFAULT_INTERESTS = [
  'Sports', 'Music', 'Art', 'Technology', 'Food', 'Travel',
  'Photography', 'Reading', 'Gaming', 'Fitness', 'Movies', 'Nature',
  'Fashion', 'Science', 'History', 'Cooking', 'Dancing', 'Writing',
  'Volunteering', 'Gardening', 'Crafts', 'Business', 'Health', 'Education'
];

/**
 * InterestSelector Component
 * 
 * Allows users to select their interests from a predefined list or search for custom ones.
 * Used primarily in onboarding and profile setup flows.
 * 
 * Features:
 * - Grid layout of interest chips
 * - Multi-select functionality
 * - Search/filter capabilities
 * - Minimum/maximum selection validation
 * - Visual feedback for selections
 * - Accessibility support
 */
export const InterestSelector: React.FC<InterestSelectorProps> = ({
  selectedInterests,
  onInterestsChange,
  minimumSelection = 3,
  maximumSelection = 10,
  showSearch = true,
  testID,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customInterests, setCustomInterests] = useState<string[]>([]);

  // Filter interests based on search query
  const filteredInterests = [...DEFAULT_INTERESTS, ...customInterests].filter(interest =>
    interest.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInterestToggle = useCallback((interest: string) => {
    if (selectedInterests.includes(interest)) {
      // Remove interest
      onInterestsChange(selectedInterests.filter(i => i !== interest));
    } else {
      // Add interest (if under maximum)
      if (selectedInterests.length < maximumSelection) {
        onInterestsChange([...selectedInterests, interest]);
      }
    }
  }, [selectedInterests, onInterestsChange, maximumSelection]);

  const handleSearchSubmit = useCallback(() => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery && 
        !DEFAULT_INTERESTS.includes(trimmedQuery) && 
        !customInterests.includes(trimmedQuery) &&
        !selectedInterests.includes(trimmedQuery)) {
      setCustomInterests(prev => [...prev, trimmedQuery]);
      handleInterestToggle(trimmedQuery);
      setSearchQuery('');
    }
  }, [searchQuery, customInterests, selectedInterests, handleInterestToggle]);

  const isMinimumMet = selectedInterests.length >= minimumSelection;
  const isMaximumReached = selectedInterests.length >= maximumSelection;

  return (
    <View style={styles.container} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Interests</Text>
        <Text style={styles.subtitle}>
          Choose at least {minimumSelection} interests to personalize your experience
        </Text>
        <Text style={styles.counter}>
          {selectedInterests.length} of {maximumSelection} selected
        </Text>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search or add custom interest..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="done"
            testID={`${testID}-search-input`}
          />
        </View>
      )}

      {/* Interests Grid */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.interestsGrid}>
          {filteredInterests.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            const isDisabled = !isSelected && isMaximumReached;
            
            return (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestChip,
                  isSelected && styles.interestChipSelected,
                  isDisabled && styles.interestChipDisabled,
                ]}
                onPress={() => handleInterestToggle(interest)}
                disabled={isDisabled}
                testID={`${testID}-interest-${interest.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Text style={[
                  styles.interestText,
                  isSelected && styles.interestTextSelected,
                  isDisabled && styles.interestTextDisabled,
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Validation Message */}
      {!isMinimumMet && (
        <View style={styles.validationContainer}>
          <Text style={styles.validationText}>
            Please select at least {minimumSelection - selectedInterests.length} more interest{minimumSelection - selectedInterests.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.semibold,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.sm,
  },
  counter: {
    fontSize: 14,
    color: theme.colors.primary[600],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  searchContainer: {
    marginBottom: theme.spacing.lg,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily?.regular,
    backgroundColor: theme.colors.white,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.lg,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  interestChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.neutral[300],
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  interestChipSelected: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  interestChipDisabled: {
    borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.neutral[50],
    opacity: 0.6,
  },
  interestText: {
    fontSize: 14,
    color: theme.colors.neutral[700],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  interestTextSelected: {
    color: theme.colors.primary[700],
  },
  interestTextDisabled: {
    color: theme.colors.neutral[400],
  },
  validationContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.warning[50],
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.md,
  },
  validationText: {
    fontSize: 14,
    color: theme.colors.warning[700],
    fontFamily: theme.typography.fontFamily?.medium,
  },
});
