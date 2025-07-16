import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * SupportScreen Component
 * 
 * Comprehensive support and help center for parents.
 * 
 * Features:
 * - FAQ section with searchable questions and answers
 * - Contact information for support team
 * - Live chat support integration
 * - Ticket submission system
 * - Video tutorials and guides
 * - Emergency contact procedures
 * - Feedback and suggestion submission
 * - App version and update information
 */

export const SupportScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // Mock data for development
  const supportCategories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'programs', name: 'Programs', icon: '📝' },
    { id: 'payments', name: 'Payments', icon: '💳' },
    { id: 'technical', name: 'Technical', icon: '🔧' },
    { id: 'safety', name: 'Safety', icon: '🛡️' },
  ];

  const mockFAQs = [
    {
      id: '1',
      category: 'account',
      question: 'How do I update my child\'s information?',
      answer: 'You can update your child\'s information by going to the Child Profile screen and tapping the "Edit Profile" button. From there, you can modify basic information, emergency contacts, and medical details.',
      helpful_count: 45,
      last_updated: '2024-01-10'
    },
    {
      id: '2',
      category: 'programs',
      question: 'How do I book a program for my child?',
      answer: 'To book a program, go to the Browse Programs screen, select the program you\'re interested in, choose an available time slot, and follow the booking process. You\'ll need to complete any required permission slips before the program date.',
      helpful_count: 67,
      last_updated: '2024-01-08'
    },
    {
      id: '3',
      category: 'programs',
      question: 'What should I do if my child can\'t attend a booked program?',
      answer: 'If your child cannot attend a booked program, please cancel as soon as possible through the app or contact us directly. Cancellations made at least 24 hours in advance are eligible for a full refund.',
      helpful_count: 23,
      last_updated: '2024-01-05'
    },
    {
      id: '4',
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and digital wallets like Apple Pay and Google Pay. Payment is processed securely at the time of booking.',
      helpful_count: 34,
      last_updated: '2024-01-12'
    },
    {
      id: '5',
      category: 'safety',
      question: 'What safety measures are in place during programs?',
      answer: 'All our programs follow strict safety protocols including background-checked staff, first aid trained teachers, emergency procedures, and appropriate adult-to-child ratios. We also maintain detailed emergency contact information for all participants.',
      helpful_count: 89,
      last_updated: '2024-01-06'
    },
    {
      id: '6',
      category: 'technical',
      question: 'The app is running slowly. What should I do?',
      answer: 'Try closing and reopening the app first. If the problem persists, restart your device. Make sure you have the latest version of the app installed. If issues continue, please contact our technical support team.',
      helpful_count: 12,
      last_updated: '2024-01-09'
    }
  ];

  const contactMethods = [
    {
      id: '1',
      type: 'phone',
      title: 'Call Support',
      subtitle: 'Mon-Fri, 8AM-6PM EST',
      value: '1-800-SPARK-HELP',
      icon: '📞',
      action: 'call'
    },
    {
      id: '2',
      type: 'email',
      title: 'Email Support',
      subtitle: 'Response within 24 hours',
      value: 'support@sparkprograms.com',
      icon: '📧',
      action: 'email'
    },
    {
      id: '3',
      type: 'chat',
      title: 'Live Chat',
      subtitle: 'Available during business hours',
      value: 'Start Chat',
      icon: '💬',
      action: 'chat'
    },
    {
      id: '4',
      type: 'emergency',
      title: 'Emergency Line',
      subtitle: '24/7 for urgent matters',
      value: '1-800-EMERGENCY',
      icon: '🚨',
      action: 'emergency'
    }
  ];

  const quickActions = [
    {
      id: '1',
      title: 'Submit Feedback',
      description: 'Share your thoughts and suggestions',
      icon: '💭',
      action: 'feedback'
    },
    {
      id: '2',
      title: 'Report an Issue',
      description: 'Report technical or safety concerns',
      icon: '⚠️',
      action: 'report'
    },
    {
      id: '3',
      title: 'Video Tutorials',
      description: 'Watch helpful how-to videos',
      icon: '🎥',
      action: 'tutorials'
    },
    {
      id: '4',
      title: 'App Information',
      description: 'Version info and updates',
      icon: 'ℹ️',
      action: 'info'
    }
  ];

  // Load support data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Support screen focused');
    }, [])
  );

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter FAQs
  const filteredFAQs = mockFAQs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle FAQ actions
  const handleFAQPress = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleFAQHelpful = (faqId: string) => {
    console.log('Mark FAQ as helpful:', faqId);
    Alert.alert('Thank you!', 'Your feedback helps us improve our support.');
  };

  // Handle contact actions
  const handleContactAction = async (contact: any) => {
    switch (contact.action) {
      case 'call':
        const phoneUrl = `tel:${contact.value.replace(/[^0-9]/g, '')}`;
        const canCall = await Linking.canOpenURL(phoneUrl);
        if (canCall) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Unable to make phone calls on this device.');
        }
        break;
      case 'email':
        const emailUrl = `mailto:${contact.value}`;
        const canEmail = await Linking.canOpenURL(emailUrl);
        if (canEmail) {
          Linking.openURL(emailUrl);
        } else {
          Alert.alert('Error', 'Unable to open email client.');
        }
        break;
      case 'chat':
        console.log('Start live chat');
        Alert.alert('Live Chat', 'Live chat functionality would be implemented here.');
        break;
      case 'emergency':
        Alert.alert(
          'Emergency Contact',
          'This will call our emergency line. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call', onPress: () => Linking.openURL(`tel:${contact.value.replace(/[^0-9]/g, '')}`) }
          ]
        );
        break;
    }
  };

  // Handle quick actions
  const handleQuickAction = (action: any) => {
    switch (action.action) {
      case 'feedback':
        console.log('Navigate to feedback form');
        Alert.alert('Feedback', 'Feedback form would be implemented here.');
        break;
      case 'report':
        console.log('Navigate to issue report');
        Alert.alert('Report Issue', 'Issue reporting form would be implemented here.');
        break;
      case 'tutorials':
        console.log('Navigate to video tutorials');
        Alert.alert('Tutorials', 'Video tutorials would be implemented here.');
        break;
      case 'info':
        Alert.alert(
          'App Information',
          'Spark Parent App\nVersion 1.0.0\nBuild 100\n\nLast Updated: January 15, 2024'
        );
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support & Help</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          <View style={styles.contactGrid}>
            {contactMethods.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[
                  styles.contactCard,
                  contact.type === 'emergency' && styles.emergencyCard
                ]}
                onPress={() => handleContactAction(contact)}
              >
                <Text style={styles.contactIcon}>{contact.icon}</Text>
                <Text style={styles.contactTitle}>{contact.title}</Text>
                <Text style={styles.contactSubtitle}>{contact.subtitle}</Text>
                <Text style={[
                  styles.contactValue,
                  contact.type === 'emergency' && styles.emergencyValue
                ]}>
                  {contact.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => handleQuickAction(action)}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search FAQs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {supportCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && styles.categoryTabActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* FAQ List */}
          <View style={styles.faqList}>
            {filteredFAQs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No FAQs found</Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery ? 'Try adjusting your search criteria' : 'No FAQs available in this category'}
                </Text>
              </View>
            ) : (
              filteredFAQs.map((faq) => (
                <View key={faq.id} style={styles.faqCard}>
                  <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() => handleFAQPress(faq.id)}
                  >
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    <Text style={styles.faqToggle}>
                      {expandedFAQ === faq.id ? '−' : '+'}
                    </Text>
                  </TouchableOpacity>
                  
                  {expandedFAQ === faq.id && (
                    <View style={styles.faqContent}>
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
                      <View style={styles.faqFooter}>
                        <Text style={styles.faqMeta}>
                          Updated: {faq.last_updated} • {faq.helpful_count} found this helpful
                        </Text>
                        <TouchableOpacity
                          style={styles.helpfulButton}
                          onPress={() => handleFAQHelpful(faq.id)}
                        >
                          <Text style={styles.helpfulButtonText}>👍 Helpful</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </View>

        {/* Emergency Information */}
        <View style={styles.section}>
          <View style={styles.emergencySection}>
            <Text style={styles.emergencyTitle}>🚨 Emergency Information</Text>
            <Text style={styles.emergencyText}>
              For immediate safety concerns or emergencies during programs, call our 24/7 emergency line at 1-800-EMERGENCY.
            </Text>
            <Text style={styles.emergencyText}>
              For medical emergencies, always call 911 first, then notify our emergency line.
            </Text>
          </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  contactIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  emergencyValue: {
    color: '#EF4444',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: '#3B82F6',
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  faqList: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    flex: 1,
    marginRight: 12,
  },
  faqToggle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
    fontFamily: 'Inter-SemiBold',
  },
  faqContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  faqFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqMeta: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  helpfulButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  helpfulButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  emergencySection: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#991B1B',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default SupportScreen;
