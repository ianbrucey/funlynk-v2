import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '@/constants/theme';
import { AuthStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/store/hooks';
import { Button } from '@/components/ui/Button';

type OnboardingScreenProps = AuthStackScreenProps<'Onboarding'>;

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  component: React.ReactNode;
}

const { width: screenWidth } = Dimensions.get('window');

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenProps['navigation']>();
  const route = useRoute<OnboardingScreenProps['route']>();
  const { finishOnboarding } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interests = [
    'Sports', 'Music', 'Art', 'Technology', 'Food', 'Travel',
    'Photography', 'Reading', 'Gaming', 'Fitness', 'Movies', 'Nature'
  ];

  const handleInterestToggle = useCallback((interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    // Save user preferences and complete onboarding
    finishOnboarding();
    // Navigation will be handled by RootNavigator
  }, [finishOnboarding]);

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.stepTitle}>Welcome to Funlynk!</Text>
      <Text style={styles.stepSubtitle}>
        Let's get you set up with a personalized experience
      </Text>
    </View>
  );

  const renderInterestsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>🎯</Text>
      <Text style={styles.stepTitle}>What interests you?</Text>
      <Text style={styles.stepSubtitle}>
        Select at least 3 interests to help us personalize your experience
      </Text>
      
      <View style={styles.interestsGrid}>
        {interests.map((interest) => (
          <TouchableOpacity
            key={interest}
            style={[
              styles.interestChip,
              selectedInterests.includes(interest) && styles.interestChipSelected
            ]}
            onPress={() => handleInterestToggle(interest)}
          >
            <Text style={[
              styles.interestText,
              selectedInterests.includes(interest) && styles.interestTextSelected
            ]}>
              {interest}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPermissionsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>🔔</Text>
      <Text style={styles.stepTitle}>Stay Connected</Text>
      <Text style={styles.stepSubtitle}>
        Enable notifications to stay updated on events and activities
      </Text>
      
      <View style={styles.permissionsList}>
        <View style={styles.permissionItem}>
          <Text style={styles.permissionTitle}>Push Notifications</Text>
          <Text style={styles.permissionDescription}>
            Get notified about new events and updates
          </Text>
        </View>
        
        <View style={styles.permissionItem}>
          <Text style={styles.permissionTitle}>Location Services</Text>
          <Text style={styles.permissionDescription}>
            Find events and activities near you
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCompletionStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>✨</Text>
      <Text style={styles.stepTitle}>You're all set!</Text>
      <Text style={styles.stepSubtitle}>
        Welcome to the Funlynk community. Let's start exploring!
      </Text>
    </View>
  );

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 0,
      title: 'Welcome',
      subtitle: 'Get started with Funlynk',
      component: renderWelcomeStep(),
    },
    {
      id: 1,
      title: 'Interests',
      subtitle: 'Tell us what you like',
      component: renderInterestsStep(),
    },
    {
      id: 2,
      title: 'Permissions',
      subtitle: 'Stay connected',
      component: renderPermissionsStep(),
    },
    {
      id: 3,
      title: 'Complete',
      subtitle: 'Ready to go!',
      component: renderCompletionStep(),
    },
  ];

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const canProceed = currentStep !== 1 || selectedInterests.length >= 3;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive
              ]}
            />
          ))}
        </View>
        
        <Text style={styles.stepCounter}>
          {currentStep + 1} of {onboardingSteps.length}
        </Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {currentStepData.component}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <Button
            variant="outline"
            size="lg"
            onPress={handleBack}
            style={styles.backButton}
          >
            Back
          </Button>
        )}
        
        <Button
          variant="primary"
          size="lg"
          onPress={handleNext}
          disabled={!canProceed}
          style={styles.nextButton}
        >
          {isLastStep ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.neutral[300],
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: theme.colors.primary[500],
  },
  stepCounter: {
    fontSize: 14,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  stepSubtitle: {
    fontSize: 16,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
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
  },
  interestChipSelected: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  interestText: {
    fontSize: 14,
    color: theme.colors.neutral[700],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  interestTextSelected: {
    color: theme.colors.primary[700],
  },
  permissionsList: {
    width: '100%',
    gap: theme.spacing.lg,
  },
  permissionItem: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.semibold,
    marginBottom: theme.spacing.xs,
  },
  permissionDescription: {
    fontSize: 14,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});

export default OnboardingScreen;
