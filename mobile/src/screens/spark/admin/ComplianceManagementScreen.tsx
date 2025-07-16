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
 * ComplianceManagementScreen Component
 * 
 * Comprehensive compliance and safety oversight system.
 * 
 * Features:
 * - Background check status tracking and management
 * - Certification and training requirements monitoring
 * - Safety protocol compliance verification
 * - Documentation and record keeping systems
 * - Incident reporting and investigation tools
 * - Policy updates and acknowledgment tracking
 * - Audit preparation and management tools
 * - Regulatory compliance monitoring and reporting
 */

export const ComplianceManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('overview');

  // Mock data for development
  const complianceCategories = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'background_checks', label: 'Background Checks', icon: '🔍' },
    { id: 'certifications', label: 'Certifications', icon: '📜' },
    { id: 'safety_protocols', label: 'Safety Protocols', icon: '🛡️' },
    { id: 'incidents', label: 'Incidents', icon: '⚠️' },
    { id: 'audits', label: 'Audits', icon: '📋' },
  ];

  const mockComplianceData = {
    overview: {
      compliance_score: 96.3,
      total_requirements: 45,
      completed_requirements: 43,
      pending_requirements: 2,
      overdue_requirements: 0,
      last_audit_date: '2023-12-15',
      next_audit_date: '2024-06-15',
      critical_issues: 0,
      warnings: 2,
      recommendations: 5
    },
    background_checks: {
      total_teachers: 8,
      approved: 8,
      pending: 0,
      expired: 0,
      rejected: 0,
      renewal_due_30_days: 1,
      renewal_due_60_days: 2,
      checks: [
        {
          id: '1',
          teacher_name: 'Ms. Sarah Johnson',
          status: 'approved',
          completion_date: '2023-08-15',
          expiry_date: '2025-08-15',
          agency: 'State Bureau of Investigation',
          notes: 'Clean background check completed'
        },
        {
          id: '2',
          teacher_name: 'Mr. David Wilson',
          status: 'approved',
          completion_date: '2023-09-10',
          expiry_date: '2025-09-10',
          agency: 'State Bureau of Investigation',
          notes: 'Background check approved'
        },
        {
          id: '3',
          teacher_name: 'Ms. Emily Chen',
          status: 'pending',
          completion_date: null,
          expiry_date: null,
          agency: 'State Bureau of Investigation',
          notes: 'Background check in progress'
        }
      ]
    },
    certifications: {
      required_certifications: ['First Aid/CPR', 'Child Protection', 'Safety Training'],
      teachers_current: 6,
      teachers_expired: 1,
      teachers_pending: 1,
      certifications: [
        {
          id: '1',
          type: 'First Aid/CPR',
          teachers_certified: 7,
          teachers_expired: 1,
          next_expiry: '2024-03-15',
          renewal_required: true
        },
        {
          id: '2',
          type: 'Child Protection',
          teachers_certified: 8,
          teachers_expired: 0,
          next_expiry: '2024-08-20',
          renewal_required: false
        },
        {
          id: '3',
          type: 'Safety Training',
          teachers_certified: 6,
          teachers_expired: 2,
          next_expiry: '2024-02-28',
          renewal_required: true
        }
      ]
    },
    safety_protocols: {
      total_protocols: 12,
      implemented: 12,
      under_review: 0,
      last_updated: '2024-01-10',
      protocols: [
        {
          id: '1',
          title: 'Emergency Evacuation Procedures',
          status: 'current',
          last_review: '2024-01-10',
          next_review: '2024-07-10',
          compliance_rate: 100
        },
        {
          id: '2',
          title: 'Child Protection Protocols',
          status: 'current',
          last_review: '2023-12-15',
          next_review: '2024-06-15',
          compliance_rate: 98.5
        },
        {
          id: '3',
          title: 'Health and Safety Guidelines',
          status: 'current',
          last_review: '2024-01-05',
          next_review: '2024-07-05',
          compliance_rate: 95.2
        }
      ]
    },
    incidents: {
      total_incidents: 3,
      resolved: 2,
      under_investigation: 1,
      critical: 0,
      recent_incidents: [
        {
          id: '1',
          date: '2024-01-12',
          type: 'Minor Injury',
          severity: 'low',
          status: 'resolved',
          description: 'Student scraped knee during outdoor activity',
          teacher: 'Mr. James Rodriguez',
          actions_taken: 'First aid administered, parents notified',
          follow_up_required: false
        },
        {
          id: '2',
          date: '2024-01-08',
          type: 'Equipment Malfunction',
          severity: 'medium',
          status: 'resolved',
          description: 'Art room ventilation system not working properly',
          teacher: 'Ms. Emily Chen',
          actions_taken: 'Maintenance called, room ventilated manually',
          follow_up_required: false
        },
        {
          id: '3',
          date: '2024-01-15',
          type: 'Policy Violation',
          severity: 'medium',
          status: 'under_investigation',
          description: 'Unauthorized person on school grounds during program',
          teacher: 'Ms. Sarah Johnson',
          actions_taken: 'Security notified, incident documented',
          follow_up_required: true
        }
      ]
    },
    audits: {
      last_audit: {
        date: '2023-12-15',
        auditor: 'State Education Department',
        score: 96.3,
        findings: 2,
        recommendations: 5,
        status: 'passed'
      },
      next_audit: {
        date: '2024-06-15',
        type: 'Annual Compliance Review',
        preparation_status: 'in_progress'
      },
      action_items: [
        {
          id: '1',
          description: 'Update emergency contact procedures',
          priority: 'medium',
          due_date: '2024-02-15',
          assigned_to: 'Principal Office',
          status: 'in_progress'
        },
        {
          id: '2',
          description: 'Renew facility insurance documentation',
          priority: 'high',
          due_date: '2024-01-31',
          assigned_to: 'Administration',
          status: 'pending'
        }
      ]
    }
  };

  // Load compliance data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Compliance management focused');
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

  // Handle compliance actions
  const handleViewDetails = (item: any, type: string) => {
    console.log('View details for:', type, item.id);
    Alert.alert('View Details', `Detailed view for ${type} would be implemented here.`);
  };

  const handleUpdateStatus = (item: any, type: string) => {
    Alert.alert('Update Status', `Status update for ${type} would be implemented here.`);
  };

  const handleScheduleRenewal = (item: any) => {
    Alert.alert('Schedule Renewal', `Renewal scheduling for ${item.type || item.title} would be implemented here.`);
  };

  const handleReportIncident = () => {
    console.log('Navigate to incident reporting');
    Alert.alert('Report Incident', 'Incident reporting form would be implemented here.');
  };

  const handleGenerateReport = () => {
    Alert.alert('Generate Report', 'Compliance report generation would be implemented here.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'current':
      case 'resolved':
      case 'passed':
        return '#10B981';
      case 'pending':
      case 'in_progress':
      case 'under_review':
        return '#F59E0B';
      case 'expired':
      case 'rejected':
      case 'failed':
        return '#EF4444';
      case 'under_investigation':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'high':
      case 'critical':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderOverview = () => (
    <View>
      {/* Compliance Score */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>Overall Compliance Score</Text>
        <Text style={styles.scoreValue}>{mockComplianceData.overview.compliance_score}%</Text>
        <View style={styles.scoreBar}>
          <View 
            style={[
              styles.scoreProgress, 
              { width: `${mockComplianceData.overview.compliance_score}%` }
            ]} 
          />
        </View>
        <Text style={styles.scoreDescription}>
          {mockComplianceData.overview.completed_requirements} of {mockComplianceData.overview.total_requirements} requirements met
        </Text>
      </View>

      {/* Status Summary */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{mockComplianceData.overview.critical_issues}</Text>
          <Text style={styles.summaryLabel}>Critical Issues</Text>
          <View style={[styles.summaryIndicator, { backgroundColor: mockComplianceData.overview.critical_issues > 0 ? '#EF4444' : '#10B981' }]} />
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{mockComplianceData.overview.warnings}</Text>
          <Text style={styles.summaryLabel}>Warnings</Text>
          <View style={[styles.summaryIndicator, { backgroundColor: mockComplianceData.overview.warnings > 0 ? '#F59E0B' : '#10B981' }]} />
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{mockComplianceData.overview.recommendations}</Text>
          <Text style={styles.summaryLabel}>Recommendations</Text>
          <View style={[styles.summaryIndicator, { backgroundColor: '#3B82F6' }]} />
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{mockComplianceData.overview.pending_requirements}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
          <View style={[styles.summaryIndicator, { backgroundColor: mockComplianceData.overview.pending_requirements > 0 ? '#F59E0B' : '#10B981' }]} />
        </View>
      </View>

      {/* Audit Information */}
      <View style={styles.auditCard}>
        <Text style={styles.auditTitle}>Audit Information</Text>
        <View style={styles.auditRow}>
          <Text style={styles.auditLabel}>Last Audit:</Text>
          <Text style={styles.auditValue}>{formatDate(mockComplianceData.overview.last_audit_date)}</Text>
        </View>
        <View style={styles.auditRow}>
          <Text style={styles.auditLabel}>Next Audit:</Text>
          <Text style={styles.auditValue}>{formatDate(mockComplianceData.overview.next_audit_date)}</Text>
        </View>
        <View style={styles.auditActions}>
          <Button
            variant="outline"
            size="sm"
            onPress={handleGenerateReport}
            style={styles.auditButton}
          >
            Generate Report
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => console.log('Prepare for audit')}
            style={styles.auditButton}
          >
            Audit Prep
          </Button>
        </View>
      </View>
    </View>
  );

  const renderBackgroundChecks = () => (
    <View>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mockComplianceData.background_checks.approved}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mockComplianceData.background_checks.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mockComplianceData.background_checks.expired}</Text>
          <Text style={styles.statLabel}>Expired</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mockComplianceData.background_checks.renewal_due_30_days}</Text>
          <Text style={styles.statLabel}>Due Soon</Text>
        </View>
      </View>

      {mockComplianceData.background_checks.checks.map((check) => (
        <View key={check.id} style={styles.checkCard}>
          <View style={styles.checkHeader}>
            <Text style={styles.checkName}>{check.teacher_name}</Text>
            <View style={[styles.checkStatus, { backgroundColor: getStatusColor(check.status) }]}>
              <Text style={styles.checkStatusText}>{check.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.checkAgency}>{check.agency}</Text>
          {check.completion_date && (
            <Text style={styles.checkDate}>Completed: {formatDate(check.completion_date)}</Text>
          )}
          {check.expiry_date && (
            <Text style={styles.checkExpiry}>Expires: {formatDate(check.expiry_date)}</Text>
          )}
          <Text style={styles.checkNotes}>{check.notes}</Text>
          <View style={styles.checkActions}>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleViewDetails(check, 'background_check')}
              style={styles.checkButton}
            >
              View Details
            </Button>
            {check.status === 'approved' && (
              <Button
                variant="secondary"
                size="sm"
                onPress={() => handleScheduleRenewal(check)}
                style={styles.checkButton}
              >
                Schedule Renewal
              </Button>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderCertifications = () => (
    <View>
      {mockComplianceData.certifications.certifications.map((cert) => (
        <View key={cert.id} style={styles.certCard}>
          <View style={styles.certHeader}>
            <Text style={styles.certType}>{cert.type}</Text>
            {cert.renewal_required && (
              <View style={styles.renewalBadge}>
                <Text style={styles.renewalText}>RENEWAL REQUIRED</Text>
              </View>
            )}
          </View>
          <View style={styles.certStats}>
            <Text style={styles.certStat}>
              {cert.teachers_certified} certified • {cert.teachers_expired} expired
            </Text>
            <Text style={styles.certExpiry}>Next expiry: {formatDate(cert.next_expiry)}</Text>
          </View>
          <View style={styles.certActions}>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleViewDetails(cert, 'certification')}
              style={styles.certButton}
            >
              View Details
            </Button>
            {cert.renewal_required && (
              <Button
                variant="primary"
                size="sm"
                onPress={() => handleScheduleRenewal(cert)}
                style={styles.certButton}
              >
                Schedule Training
              </Button>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderSafetyProtocols = () => (
    <View>
      {mockComplianceData.safety_protocols.protocols.map((protocol) => (
        <View key={protocol.id} style={styles.protocolCard}>
          <View style={styles.protocolHeader}>
            <Text style={styles.protocolTitle}>{protocol.title}</Text>
            <View style={[styles.protocolStatus, { backgroundColor: getStatusColor(protocol.status) }]}>
              <Text style={styles.protocolStatusText}>{protocol.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.protocolDetails}>
            <Text style={styles.protocolDetail}>Last Review: {formatDate(protocol.last_review)}</Text>
            <Text style={styles.protocolDetail}>Next Review: {formatDate(protocol.next_review)}</Text>
            <Text style={styles.protocolDetail}>Compliance: {protocol.compliance_rate}%</Text>
          </View>
          <View style={styles.complianceBar}>
            <View 
              style={[
                styles.complianceProgress, 
                { width: `${protocol.compliance_rate}%` }
              ]} 
            />
          </View>
          <View style={styles.protocolActions}>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleViewDetails(protocol, 'protocol')}
              style={styles.protocolButton}
            >
              View Protocol
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => handleUpdateStatus(protocol, 'protocol')}
              style={styles.protocolButton}
            >
              Update Status
            </Button>
          </View>
        </View>
      ))}
    </View>
  );

  const renderIncidents = () => (
    <View>
      <View style={styles.incidentHeader}>
        <Text style={styles.incidentTitle}>Recent Incidents</Text>
        <Button
          variant="primary"
          size="sm"
          onPress={handleReportIncident}
        >
          Report Incident
        </Button>
      </View>

      {mockComplianceData.incidents.recent_incidents.map((incident) => (
        <View key={incident.id} style={styles.incidentCard}>
          <View style={styles.incidentCardHeader}>
            <View style={styles.incidentInfo}>
              <Text style={styles.incidentType}>{incident.type}</Text>
              <Text style={styles.incidentDate}>{formatDate(incident.date)}</Text>
            </View>
            <View style={styles.incidentBadges}>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(incident.severity) }]}>
                <Text style={styles.severityText}>{incident.severity.toUpperCase()}</Text>
              </View>
              <View style={[styles.incidentStatus, { backgroundColor: getStatusColor(incident.status) }]}>
                <Text style={styles.incidentStatusText}>{incident.status.replace('_', ' ').toUpperCase()}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.incidentDescription}>{incident.description}</Text>
          <Text style={styles.incidentTeacher}>Teacher: {incident.teacher}</Text>
          <Text style={styles.incidentActions}>Actions: {incident.actions_taken}</Text>
          {incident.follow_up_required && (
            <Text style={styles.followUpRequired}>⚠️ Follow-up required</Text>
          )}
          <View style={styles.incidentCardActions}>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleViewDetails(incident, 'incident')}
              style={styles.incidentButton}
            >
              View Details
            </Button>
            {incident.status === 'under_investigation' && (
              <Button
                variant="primary"
                size="sm"
                onPress={() => handleUpdateStatus(incident, 'incident')}
                style={styles.incidentButton}
              >
                Update Status
              </Button>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (selectedCategory) {
      case 'overview':
        return renderOverview();
      case 'background_checks':
        return renderBackgroundChecks();
      case 'certifications':
        return renderCertifications();
      case 'safety_protocols':
        return renderSafetyProtocols();
      case 'incidents':
        return renderIncidents();
      case 'audits':
        return renderOverview(); // For now, show overview for audits
      default:
        return renderOverview();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compliance Management</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Category Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {complianceCategories.map((category) => (
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
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
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
        {renderContent()}
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
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
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
    position: 'relative',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  summaryIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  auditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  auditTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  auditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  auditLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  auditValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
  },
  auditActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  auditButton: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  checkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  checkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  checkStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  checkStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  checkAgency: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  checkDate: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  checkExpiry: {
    fontSize: 12,
    color: '#F59E0B',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  checkNotes: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  checkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  checkButton: {
    flex: 1,
  },
  certCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  certType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  renewalBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  renewalText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  certStats: {
    marginBottom: 12,
  },
  certStat: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  certExpiry: {
    fontSize: 12,
    color: '#F59E0B',
    fontFamily: 'Inter-Regular',
  },
  certActions: {
    flexDirection: 'row',
    gap: 8,
  },
  certButton: {
    flex: 1,
  },
  protocolCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  protocolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  protocolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 12,
  },
  protocolStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  protocolStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  protocolDetails: {
    marginBottom: 8,
  },
  protocolDetail: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  complianceBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 12,
  },
  complianceProgress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  protocolActions: {
    flexDirection: 'row',
    gap: 8,
  },
  protocolButton: {
    flex: 1,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  incidentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  incidentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  incidentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  incidentInfo: {
    flex: 1,
  },
  incidentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  incidentDate: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  incidentBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  severityText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  incidentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  incidentStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  incidentDescription: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
    lineHeight: 20,
  },
  incidentTeacher: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  incidentActions: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  followUpRequired: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F59E0B',
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
  },
  incidentCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  incidentButton: {
    flex: 1,
  },
});

export default ComplianceManagementScreen;
