import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '@/constants/theme';

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  testID?: string;
}

/**
 * DatePicker Component
 * 
 * Cross-platform date and time picker with consistent styling.
 * Handles platform differences between iOS and Android.
 * 
 * Features:
 * - Date, time, and datetime modes
 * - Min/max date constraints
 * - Error state display
 * - Accessibility support
 * - Platform-specific UI
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
  error,
  placeholder = 'Select date',
  required = false,
  disabled = false,
  testID,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(value);

  const displayLabel = required && label ? `${label} *` : label;

  const formatDate = useCallback((date: Date | null): string => {
    if (!date) return placeholder;

    switch (mode) {
      case 'time':
        return date.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      case 'datetime':
        return date.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      default:
        return date.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
    }
  }, [mode, placeholder]);

  const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempDate(selectedDate);
      } else {
        onChange(selectedDate);
      }
    }
  }, [onChange]);

  const handleConfirm = useCallback(() => {
    onChange(tempDate);
    setShowPicker(false);
  }, [onChange, tempDate]);

  const handleCancel = useCallback(() => {
    setTempDate(value);
    setShowPicker(false);
  }, [value]);

  const openPicker = useCallback(() => {
    if (!disabled) {
      setTempDate(value);
      setShowPicker(true);
    }
  }, [disabled, value]);

  const renderIOSPicker = () => (
    <Modal
      visible={showPicker}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancel} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{displayLabel || 'Select Date'}</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.modalButton}>
              <Text style={[styles.modalButtonText, styles.confirmButton]}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempDate || new Date()}
            mode={mode}
            display="spinner"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            style={styles.picker}
          />
        </View>
      </View>
    </Modal>
  );

  const renderAndroidPicker = () => {
    if (!showPicker) return null;

    return (
      <DateTimePicker
        value={value || new Date()}
        mode={mode}
        display="default"
        onChange={handleDateChange}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    );
  };

  return (
    <View style={styles.container}>
      {displayLabel && (
        <Text style={styles.label}>{displayLabel}</Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.input,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
        onPress={openPicker}
        disabled={disabled}
        testID={testID}
      >
        <Text
          style={[
            styles.inputText,
            !value && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
        >
          {formatDate(value)}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {Platform.OS === 'ios' ? renderIOSPicker() : renderAndroidPicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily?.medium,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    minHeight: 48,
  },
  inputError: {
    borderColor: theme.colors.error[500],
  },
  inputDisabled: {
    backgroundColor: theme.colors.neutral[100],
    borderColor: theme.colors.neutral[200],
  },
  inputText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.regular,
    flex: 1,
  },
  placeholderText: {
    color: theme.colors.neutral[500],
  },
  disabledText: {
    color: theme.colors.neutral[400],
  },
  icon: {
    fontSize: 18,
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error[500],
    marginTop: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily?.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    paddingBottom: 34, // Safe area for iOS
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.semibold,
  },
  modalButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  modalButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[600],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  confirmButton: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  picker: {
    backgroundColor: theme.colors.white,
  },
});
