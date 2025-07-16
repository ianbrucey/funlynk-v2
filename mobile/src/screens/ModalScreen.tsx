import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '@/constants/theme';
import { RootStackScreenProps } from '@/types/navigation';

type ModalScreenProps = RootStackScreenProps<'Modal'>;

export const ModalScreen: React.FC = () => {
  const navigation = useNavigation<ModalScreenProps['navigation']>();
  const route = useRoute<ModalScreenProps['route']>();
  
  const { screen, params } = route.params;

  const handleClose = () => {
    navigation.goBack();
  };

  const renderModalContent = () => {
    switch (screen) {
      case 'CreateEvent':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Event</Text>
            <Text style={styles.modalSubtitle}>
              This is a placeholder for the Create Event modal
            </Text>
          </View>
        );
      case 'EditProfile':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.modalSubtitle}>
              This is a placeholder for the Edit Profile modal
            </Text>
          </View>
        );
      case 'Settings':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>
            <Text style={styles.modalSubtitle}>
              This is a placeholder for the Settings modal
            </Text>
          </View>
        );
      default:
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modal</Text>
            <Text style={styles.modalSubtitle}>
              Screen: {screen}
            </Text>
            {params && (
              <Text style={styles.paramsText}>
                Params: {JSON.stringify(params, null, 2)}
              </Text>
            )}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      {renderModalContent()}
      
      <TouchableOpacity style={styles.actionButton} onPress={handleClose}>
        <Text style={styles.actionButtonText}>Close Modal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalTitle: {
    ...theme.textStyles.title2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...theme.textStyles.subhead,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  paramsText: {
    ...theme.textStyles.caption1,
    color: theme.colors.textTertiary,
    fontFamily: 'monospace',
    backgroundColor: theme.colors.surfaceVariant,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    margin: theme.spacing.lg,
    minHeight: theme.touchTargets.minimum,
  },
  actionButtonText: {
    ...theme.textStyles.headline,
    color: theme.colors.textOnPrimary,
  },
});

export default ModalScreen;
