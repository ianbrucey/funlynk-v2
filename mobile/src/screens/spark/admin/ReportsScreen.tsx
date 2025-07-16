import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * ReportsScreen Component
 * 
 * Comprehensive analytics and reporting dashboard for administrators.
 * 
 * Features:
 * - Program participation and engagement metrics
 * - Teacher performance and satisfaction reports
 * - Parent feedback and satisfaction surveys
 * - Financial reports and revenue tracking
 * - Compliance and safety audit reports
 * - Student progress and outcome analytics
 * - Attendance and participation trends
 * - Custom report generation and export
 */

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Mock data for development
  const timeframeOptions = [
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Quarter', value: 'quarter' },
    { label: 'This Year', value: 'year' },
  ];

  const mockReportData = {
    overview_metrics: {
      total_programs: 15,
      total_sessions: 156,
      total_students: 342,
      total_teachers: 8,
      completion_rate: 94.2,
      satisfaction_score: 4.7,
      revenue: 45750,
      expenses: 32100
    },
    program_analytics: {
      most_popular: 'Science Museum Adventure',
      highest_rated: 'Art & Creativity Session',
      completion_rates: [
        { program: 'Science Museum Adventure', rate: 96.2 },
        { program: 'Art & Creativity Session', rate: 98.1 },
        { program: 'Character Building Workshop', rate: 92.5 },
        { program: 'Nature Discovery Walk', rate: 100.0 },
        { program: 'Music & Movement', rate: 89.3 }
      ],
      enrollment_trends: [
        { month: 'Sep', enrollments: 45 },
        { month: 'Oct', enrollments: 62 },
        { month: 'Nov', enrollments: 78 },
        { month: 'Dec', enrollments: 85 },
        { month: 'Jan', enrollments: 72 }
      ]
    },
    teacher_performance: {
      top_performers: [
        { name: 'Ms. Sarah Johnson', rating: 4.9, programs: 12, sessions: 48 },
        { name: 'Ms. Emily Chen', rating: 4.8, programs: 8, sessions: 32 },
        { name: 'Mr. David Wilson', rating: 4.7, programs: 6, sessions: 24 }
      ],
      average_rating: 4.7,
      retention_rate: 95.2,
      training_completion: 87.5
    },
    financial_summary: {
      total_revenue: 45750,
      program_costs: 28500,
      teacher_payments: 18200,
      materials_costs: 4800,
      facility_costs: 3200,
      net_profit: 13250,
      profit_margin: 28.9,
      revenue_by_program: [
        { program: 'Science Museum Adventure', revenue: 15625 },
        { program: 'Art & Creativity Session', revenue: 10800 },
        { program: 'Character Building Workshop', revenue: 8400 },
        { program: 'Nature Discovery Walk', revenue: 6750 },
        { program: 'Music & Movement', revenue: 4175 }
      ]
    },
    student_outcomes: {
      participation_rate: 94.2,
      completion_rate: 96.8,
      satisfaction_score: 4.6,
      skill_improvement: 89.3,
      parent_satisfaction: 4.8,
      repeat_enrollment: 76.4
    },
    compliance_metrics: {
      background_checks: 100,
      safety_training: 87.5,
      certification_current: 95.2,
      incident_rate: 0.2,
      policy_compliance: 98.7,
      audit_score: 96.3
    }
  };

  const reportCategories = [
    {
      id: 'program_performance',
      title: 'Program Performance',
      description: 'Enrollment, completion rates, and satisfaction scores',
      icon: '📊',
      color: '#3B82F6'
    },
    {
      id: 'teacher_analytics',
      title: 'Teacher Analytics',
      description: 'Performance ratings, training status, and feedback',
      icon: '👨‍🏫',
      color: '#10B981'
    },
    {
      id: 'financial_reports',
      title: 'Financial Reports',
      description: 'Revenue, expenses, and profitability analysis',
      icon: '💰',
      color: '#F59E0B'
    },
    {
      id: 'student_outcomes',
      title: 'Student Outcomes',
      description: 'Learning progress, skill development, and engagement',
      icon: '🎓',
      color: '#8B5CF6'
    },
    {
      id: 'compliance_audit',
      title: 'Compliance & Safety',
      description: 'Background checks, certifications, and safety metrics',
      icon: '🛡️',
      color: '#EF4444'
    },
    {
      id: 'parent_feedback',
      title: 'Parent Feedback',
      description: 'Satisfaction surveys and communication analytics',
      icon: '👨‍👩‍👧‍👦',
      color: '#06B6D4'
    }
  ];

  // Load reports on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Reports screen focused');
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

  // Handle report actions
  const handleGenerateReport = (categoryId: string) => {
    console.log('Generate report for category:', categoryId);
    Alert.alert('Generate Report', `Generating ${categoryId} report for ${selectedTimeframe}...`);
  };

  const handleExportReport = (categoryId: string) => {
    Alert.alert(
      'Export Report',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'PDF', onPress: () => console.log('Export PDF:', categoryId) },
        { text: 'Excel', onPress: () => console.log('Export Excel:', categoryId) },
        { text: 'CSV', onPress: () => console.log('Export CSV:', categoryId) }
      ]
    );
  };

  const handleViewDetails = (categoryId: string) => {
    console.log('Navigate to detailed report:', categoryId);
    // navigation.navigate('DetailedReport', { categoryId, timeframe: selectedTimeframe });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        {timeframeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.timeframeTab,
              selectedTimeframe === option.value && styles.timeframeTabActive
            ]}
            onPress={() => setSelectedTimeframe(option.value as any)}
          >
            <Text style={[
              styles.timeframeTabText,
              selectedTimeframe === option.value && styles.timeframeTabTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
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
        {/* Overview Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{mockReportData.overview_metrics.total_programs}</Text>
              <Text style={styles.metricLabel}>Total Programs</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{mockReportData.overview_metrics.total_sessions}</Text>
              <Text style={styles.metricLabel}>Sessions Completed</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{mockReportData.overview_metrics.total_students}</Text>
              <Text style={styles.metricLabel}>Students Served</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{mockReportData.overview_metrics.total_teachers}</Text>
              <Text style={styles.metricLabel}>Active Teachers</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, styles.percentageValue]}>
                {formatPercentage(mockReportData.overview_metrics.completion_rate)}
              </Text>
              <Text style={styles.metricLabel}>Completion Rate</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, styles.ratingValue]}>
                ★ {mockReportData.overview_metrics.satisfaction_score}
              </Text>
              <Text style={styles.metricLabel}>Satisfaction</Text>
            </View>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.financialCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Total Revenue</Text>
              <Text style={[styles.financialValue, styles.revenueValue]}>
                {formatCurrency(mockReportData.financial_summary.total_revenue)}
              </Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Total Expenses</Text>
              <Text style={[styles.financialValue, styles.expenseValue]}>
                {formatCurrency(mockReportData.overview_metrics.expenses)}
              </Text>
            </View>
            <View style={[styles.financialRow, styles.profitRow]}>
              <Text style={styles.profitLabel}>Net Profit</Text>
              <Text style={styles.profitValue}>
                {formatCurrency(mockReportData.financial_summary.net_profit)}
              </Text>
            </View>
            <View style={styles.marginRow}>
              <Text style={styles.marginLabel}>Profit Margin</Text>
              <Text style={styles.marginValue}>
                {formatPercentage(mockReportData.financial_summary.profit_margin)}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Performers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Teachers</Text>
          {mockReportData.teacher_performance.top_performers.map((teacher, index) => (
            <View key={index} style={styles.performerCard}>
              <View style={styles.performerRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.performerInfo}>
                <Text style={styles.performerName}>{teacher.name}</Text>
                <Text style={styles.performerStats}>
                  {teacher.programs} programs • {teacher.sessions} sessions
                </Text>
              </View>
              <View style={styles.performerRating}>
                <Text style={styles.ratingText}>★ {teacher.rating}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Report Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Reports</Text>
          <View style={styles.categoriesGrid}>
            {reportCategories.map((category) => (
              <View key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Text style={styles.categoryEmoji}>{category.icon}</Text>
                  </View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                </View>
                <Text style={styles.categoryDescription}>{category.description}</Text>
                <View style={styles.categoryActions}>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => handleViewDetails(category.id)}
                    style={styles.categoryButton}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => handleGenerateReport(category.id)}
                    style={styles.categoryButton}
                  >
                    Generate
                  </Button>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{formatPercentage(mockReportData.student_outcomes.participation_rate)}</Text>
              <Text style={styles.kpiLabel}>Participation Rate</Text>
              <Text style={styles.kpiTrend}>↗️ +2.3%</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{formatPercentage(mockReportData.student_outcomes.repeat_enrollment)}</Text>
              <Text style={styles.kpiLabel}>Repeat Enrollment</Text>
              <Text style={styles.kpiTrend}>↗️ +5.1%</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{formatPercentage(mockReportData.teacher_performance.retention_rate)}</Text>
              <Text style={styles.kpiLabel}>Teacher Retention</Text>
              <Text style={styles.kpiTrend}>→ 0.0%</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{formatPercentage(mockReportData.compliance_metrics.policy_compliance)}</Text>
              <Text style={styles.kpiLabel}>Compliance Score</Text>
              <Text style={styles.kpiTrend}>↗️ +1.2%</Text>
            </View>
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Options</Text>
          <View style={styles.exportCard}>
            <Text style={styles.exportDescription}>
              Generate comprehensive reports for the selected timeframe and export in your preferred format.
            </Text>
            <View style={styles.exportActions}>
              <Button
                variant="outline"
                size="medium"
                onPress={() => handleExportReport('comprehensive')}
                style={styles.exportButton}
              >
                Export All Data
              </Button>
              <Button
                variant="primary"
                size="medium"
                onPress={() => handleExportReport('summary')}
                style={styles.exportButton}
              >
                Export Summary
              </Button>
            </View>
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
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  timeframeTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  timeframeTabActive: {
    borderBottomColor: '#3B82F6',
  },
  timeframeTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  timeframeTabTextActive: {
    color: '#3B82F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
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
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  percentageValue: {
    color: '#10B981',
  },
  ratingValue: {
    color: '#F59E0B',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  financialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  financialLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  financialValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  revenueValue: {
    color: '#10B981',
  },
  expenseValue: {
    color: '#EF4444',
  },
  profitRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
  },
  profitLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  profitValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: 'Inter-Bold',
  },
  marginRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marginLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  marginValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  performerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  performerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  performerStats: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  performerRating: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    fontFamily: 'Inter-SemiBold',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  categoryHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryButton: {
    flex: 1,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
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
  kpiValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 4,
  },
  kpiTrend: {
    fontSize: 10,
    fontWeight: '500',
    color: '#10B981',
    fontFamily: 'Inter-Medium',
  },
  exportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  exportDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  exportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
  },
});

export default ReportsScreen;
