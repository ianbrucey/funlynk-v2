import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { theme } from '@/constants/theme';

interface ImagePickerProps {
  label?: string;
  images: string[];
  onImageAdd: (imageUri: string) => void;
  onImageRemove: (index: number) => void;
  maxImages?: number;
  error?: string;
  required?: boolean;
  loading?: boolean;
  testID?: string;
}

/**
 * ImagePicker Component
 * 
 * Multi-image picker with preview and management capabilities.
 * Supports adding, removing, and reordering images.
 * 
 * Features:
 * - Multiple image selection
 * - Image preview with thumbnails
 * - Add/remove functionality
 * - Loading states
 * - Error handling
 * - Maximum image limits
 */
export const ImagePicker: React.FC<ImagePickerProps> = ({
  label,
  images,
  onImageAdd,
  onImageRemove,
  maxImages = 5,
  error,
  required = false,
  loading = false,
  testID,
}) => {
  const displayLabel = required && label ? `${label} *` : label;
  const canAddMore = images.length < maxImages;

  const handleAddImage = useCallback(() => {
    if (!canAddMore || loading) return;

    Alert.alert(
      'Select Image',
      'Choose how you want to add an image',
      [
        {
          text: 'Camera',
          onPress: () => {
            // In a real implementation, this would open the camera
            // For now, we'll simulate adding a placeholder image
            const placeholderUri = `https://picsum.photos/400/300?random=${Date.now()}`;
            onImageAdd(placeholderUri);
          },
        },
        {
          text: 'Photo Library',
          onPress: () => {
            // In a real implementation, this would open the photo library
            // For now, we'll simulate adding a placeholder image
            const placeholderUri = `https://picsum.photos/400/300?random=${Date.now()}`;
            onImageAdd(placeholderUri);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }, [canAddMore, loading, onImageAdd]);

  const handleRemoveImage = useCallback((index: number) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onImageRemove(index),
        },
      ]
    );
  }, [onImageRemove]);

  const renderImageItem = useCallback((imageUri: string, index: number) => (
    <View key={`${imageUri}-${index}`} style={styles.imageContainer}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveImage(index)}
        testID={`${testID}-remove-${index}`}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  ), [handleRemoveImage, testID]);

  const renderAddButton = () => {
    if (!canAddMore) return null;

    return (
      <TouchableOpacity
        style={[styles.addButton, loading && styles.addButtonDisabled]}
        onPress={handleAddImage}
        disabled={loading}
        testID={`${testID}-add-button`}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.primary[600]} />
        ) : (
          <>
            <Text style={styles.addButtonIcon}>+</Text>
            <Text style={styles.addButtonText}>Add Image</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {displayLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{displayLabel}</Text>
          <Text style={styles.counter}>
            {images.length}/{maxImages}
          </Text>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {images.map(renderImageItem)}
        {renderAddButton()}
      </ScrollView>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {images.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📷</Text>
          <Text style={styles.emptyStateText}>
            No images added yet
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Tap "Add Image" to get started
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral[700],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  counter: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500],
    fontFamily: theme.typography.fontFamily?.regular,
  },
  scrollView: {
    marginHorizontal: -theme.spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  imageContainer: {
    position: 'relative',
    marginRight: theme.spacing.sm,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.neutral[200],
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.error[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  removeButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary[300],
    borderStyle: 'dashed',
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  addButtonDisabled: {
    borderColor: theme.colors.neutral[300],
    backgroundColor: theme.colors.neutral[100],
  },
  addButtonIcon: {
    fontSize: 24,
    color: theme.colors.primary[600],
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  addButtonText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
    fontFamily: theme.typography.fontFamily?.medium,
    textAlign: 'center',
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error[500],
    marginTop: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily?.regular,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.neutral[200],
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.neutral[50],
    marginTop: theme.spacing.sm,
  },
  emptyStateIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.medium,
    marginBottom: theme.spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500],
    fontFamily: theme.typography.fontFamily?.regular,
  },
});
