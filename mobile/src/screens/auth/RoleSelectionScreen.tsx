import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/constants/theme';
import { AuthStackScreenProps } from '@/types/navigation';

type RoleSelectionScreenProps = AuthStackScreenProps<'RoleSelection'>;

interface Role {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const roles: Role[] = [
  {
    id: 'user',
    title: 'Community Member',
    description: 'Join events and connect with your community',
    icon: '👤',
  },
  {
    id: 'parent',
    title: 'Parent',
    description: 'Manage your children\'s activities and events',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 'teacher',
    title: 'Teacher',
    description: 'Organize educational programs and field trips',
    icon: '👩‍🏫',
  },
  {
    id: 'school_admin',
    title: 'School Administrator',
    description: 'Manage school programs and oversee activities',
    icon: '🏫',
  },
];

export const RoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation<RoleSelectionScreenProps['navigation']>();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    
    // TODO: Save role to user profile
    console.log('Selected role:', selectedRole);
    
    // Navigate to main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select the option that best describes you to personalize your experience
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.roleCardSelected,
              ]}
              onPress={() => handleRoleSelect(role.id)}
            >
              <View style={styles.roleIcon}>
                <Text style={styles.roleIconText}>{role.icon}</Text>
              </View>
              <View style={styles.roleContent}>
                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </View>
              <View style={styles.roleSelector}>
                <View style={[
                  styles.radioButton,
                  selectedRole === role.id && styles.radioButtonSelected,
                ]}>
                  {selectedRole === role.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[
            styles.continueButton,
            !selectedRole && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
        >
          <Text style={[
            styles.continueButtonText,
            !selectedRole && styles.continueButtonTextDisabled,
          ]}>
            Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.textStyles.title2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.textStyles.subhead,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  rolesContainer: {
    marginBottom: theme.spacing.xl,
  },
  roleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },
  roleCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  roleIconText: {
    fontSize: 24,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    ...theme.textStyles.headline,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  roleDescription: {
    ...theme.textStyles.caption1,
    color: theme.colors.textSecondary,
  },
  roleSelector: {
    marginLeft: theme.spacing.md,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: theme.touchTargets.minimum,
    marginTop: 'auto',
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.textTertiary,
  },
  continueButtonText: {
    ...theme.textStyles.headline,
    color: theme.colors.textOnPrimary,
  },
  continueButtonTextDisabled: {
    color: theme.colors.textSecondary,
  },
});

export default RoleSelectionScreen;
