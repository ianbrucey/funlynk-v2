import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface EventFiltersProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: EventFilters) => void;
  initialFilters?: EventFilters;
  testID?: string;
}

export interface EventFilters {
  category: string;
  location: string;
  dateFrom: string;
  dateTo: string;
  priceMin: string;
  priceMax: string;
  radius: string;
}

const CATEGORIES = [
  { key: '', label: 'All Categories' },
  { key: 'arts', label: 'Arts & Culture' },
  { key: 'sports', label: 'Sports & Fitness' },
  { key: 'environment', label: 'Environment' },
  { key: 'education', label: 'Education' },
  { key: 'technology', label: 'Technology' },
  { key: 'food', label: 'Food & Drink' },
  { key: 'music', label: 'Music' },
  { key: 'business', label: 'Business' },
  { key: 'health', label: 'Health & Wellness' },
];

const RADIUS_OPTIONS = [
  { key: '', label: 'Any Distance' },
  { key: '5', label: 'Within 5 miles' },
  { key: '10', label: 'Within 10 miles' },
  { key: '25', label: 'Within 25 miles' },
  { key: '50', label: 'Within 50 miles' },
];

/**
 * EventFilters Component
 * 
 * Modal component for filtering events by various criteria including
 * category, location, date range, price range, and distance.
 * 
 * Features:
 * - Category selection
 * - Location-based filtering
 * - Date range picker
 * - Price range filtering
 * - Distance radius selection
 * - Reset and apply functionality
 */
export const EventFilters: React.FC<EventFiltersProps> = ({
  visible,
  onClose,
  onApplyFilters,
  initialFilters = {
    category: '',
    location: '',
    dateFrom: '',
    dateTo: '',
    priceMin: '',
    priceMax: '',
    radius: '',
  },
  testID,
}) => {
  const [filters, setFilters] = useState<EventFilters>(initialFilters);

  const handleFilterChange = useCallback((key: keyof EventFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    const resetFilters: EventFilters = {
      category: '',
      location: '',
      dateFrom: '',
      dateTo: '',
      priceMin: '',
      priceMax: '',
      radius: '',
    };
    setFilters(resetFilters);
  }, []);

  const handleApply = useCallback(() => {
    onApplyFilters(filters);
    onClose();
  }, [filters, onApplyFilters, onClose]);

  const getActiveFiltersCount = useCallback(() => {
    return Object.values(filters).filter(value => value.trim() !== '').length;
  }, [filters]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container} testID={testID}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Filter Events</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Category Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryChip,
                    filters.category === category.key && styles.categoryChipSelected,
                  ]}
                  onPress={() => handleFilterChange('category', category.key)}
                  testID={`filter-category-${category.key}`}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      filters.category === category.key && styles.categoryChipTextSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Input
              value={filters.location}
              onChangeText={(value) => handleFilterChange('location', value)}
              placeholder="Enter city or address"
              containerStyle={styles.inputContainer}
              testID="filter-location-input"
            />
          </View>

          {/* Distance Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distance</Text>
            <View style={styles.radiusOptions}>
              {RADIUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.radiusOption,
                    filters.radius === option.key && styles.radiusOptionSelected,
                  ]}
                  onPress={() => handleFilterChange('radius', option.key)}
                  testID={`filter-radius-${option.key}`}
                >
                  <Text
                    style={[
                      styles.radiusOptionText,
                      filters.radius === option.key && styles.radiusOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Range Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date Range</Text>
            <View style={styles.dateRow}>
              <Input
                label="From"
                value={filters.dateFrom}
                onChangeText={(value) => handleFilterChange('dateFrom', value)}
                placeholder="YYYY-MM-DD"
                containerStyle={[styles.inputContainer, styles.dateInput]}
                testID="filter-date-from-input"
              />
              <Input
                label="To"
                value={filters.dateTo}
                onChangeText={(value) => handleFilterChange('dateTo', value)}
                placeholder="YYYY-MM-DD"
                containerStyle={[styles.inputContainer, styles.dateInput]}
                testID="filter-date-to-input"
              />
            </View>
          </View>

          {/* Price Range Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceRow}>
              <Input
                label="Min Price"
                value={filters.priceMin}
                onChangeText={(value) => handleFilterChange('priceMin', value)}
                placeholder="$0"
                keyboardType="numeric"
                containerStyle={[styles.inputContainer, styles.priceInput]}
                testID="filter-price-min-input"
              />
              <Input
                label="Max Price"
                value={filters.priceMax}
                onChangeText={(value) => handleFilterChange('priceMax', value)}
                placeholder="No limit"
                keyboardType="numeric"
                containerStyle={[styles.inputContainer, styles.priceInput]}
                testID="filter-price-max-input"
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleApply}
            testID="apply-filters-button"
          >
            Apply Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  closeButton: {
    paddingVertical: theme.spacing.sm,
  },
  closeButtonText: {
    fontSize: 16,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.semibold,
  },
  resetButton: {
    paddingVertical: theme.spacing.sm,
  },
  resetButtonText: {
    fontSize: 16,
    color: theme.colors.primary[600],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginVertical: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.semibold,
    marginBottom: theme.spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    backgroundColor: theme.colors.white,
  },
  categoryChipSelected: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  categoryChipText: {
    fontSize: 14,
    color: theme.colors.neutral[700],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  categoryChipTextSelected: {
    color: theme.colors.primary[700],
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  radiusOptions: {
    gap: theme.spacing.sm,
  },
  radiusOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    backgroundColor: theme.colors.white,
  },
  radiusOptionSelected: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  radiusOptionText: {
    fontSize: 16,
    color: theme.colors.neutral[700],
    fontFamily: theme.typography.fontFamily?.regular,
  },
  radiusOptionTextSelected: {
    color: theme.colors.primary[700],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  dateRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  dateInput: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  priceInput: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
  },
});
