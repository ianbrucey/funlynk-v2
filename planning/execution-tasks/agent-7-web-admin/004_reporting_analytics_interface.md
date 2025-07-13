# Task 004: Reporting and Analytics Interface
**Agent**: Web Admin Developer  
**Estimated Time**: 5-6 hours  
**Priority**: Medium  
**Dependencies**: Agent 7 Task 003 (Booking Management), Agent 2 Task 005 (Payment Integration)  

## Overview
Implement comprehensive reporting and analytics interface for Funlynk admin dashboard including business intelligence, performance metrics, financial reporting, and data visualization using React components and chart libraries.

## Prerequisites
- Booking and trip management complete (Agent 7 Task 003)
- Payment integration available (Agent 2 Task 005)
- Admin dashboard foundation working
- Chart libraries configured (Recharts)

## Step-by-Step Implementation

### Step 1: Create Analytics Dashboard and KPI Overview (2 hours)

**Create AnalyticsPage component (src/pages/analytics/AnalyticsPage.tsx):**
```typescript
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UsersIcon, 
  CalendarIcon,
  TrendingUpIcon,
  DocumentArrowDownIcon 
} from '@heroicons/react/24/outline';
import { KPICards } from '../../components/analytics/KPICards';
import { RevenueChart } from '../../components/charts/RevenueChart';
import { UserGrowthChart } from '../../components/charts/UserGrowthChart';
import { ProgramPerformanceChart } from '../../components/charts/ProgramPerformanceChart';
import { GeographicDistribution } from '../../components/analytics/GeographicDistribution';
import { TopMetrics } from '../../components/analytics/TopMetrics';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { Button } from '../../components/common/Button';
import { ExportModal } from '../../components/analytics/ExportModal';
import { loadAnalytics } from '../../store/slices/analyticsSlice';
import type { RootState } from '../../store/store';

export const AnalyticsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { analytics, isLoading, error } = useSelector((state: RootState) => state.analytics);
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    endDate: new Date(),
  });
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    dispatch(loadAnalytics(dateRange));
  }, [dispatch, dateRange]);

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Handle export functionality
    console.log(`Exporting analytics in ${format} format`);
    setShowExportModal(false);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error loading analytics: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Analytics & Reporting
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive insights and performance metrics for the Funlynk platform
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
          />
          <Button
            variant="secondary"
            onClick={() => setShowExportModal(true)}
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <KPICards
        kpis={[
          {
            title: 'Total Revenue',
            value: `$${(analytics?.totalRevenue || 0).toLocaleString()}`,
            change: analytics?.revenueGrowth || 0,
            changeType: 'currency',
            icon: CurrencyDollarIcon,
            trend: analytics?.revenueTrend || [],
          },
          {
            title: 'Active Users',
            value: (analytics?.activeUsers || 0).toLocaleString(),
            change: analytics?.userGrowth || 0,
            changeType: 'percentage',
            icon: UsersIcon,
            trend: analytics?.userTrend || [],
          },
          {
            title: 'Total Bookings',
            value: (analytics?.totalBookings || 0).toLocaleString(),
            change: analytics?.bookingGrowth || 0,
            changeType: 'percentage',
            icon: CalendarIcon,
            trend: analytics?.bookingTrend || [],
          },
          {
            title: 'Platform Growth',
            value: `${analytics?.platformGrowth || 0}%`,
            change: analytics?.growthChange || 0,
            changeType: 'percentage',
            icon: TrendingUpIcon,
            trend: analytics?.growthTrend || [],
          },
        ]}
      />

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Revenue Trends
            </h3>
            <RevenueChart 
              data={analytics?.revenueData || []} 
              height={300}
            />
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              User Growth
            </h3>
            <UserGrowthChart 
              data={analytics?.userGrowthData || []} 
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Program Performance */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Program Performance Analysis
          </h3>
          <ProgramPerformanceChart 
            data={analytics?.programPerformance || []} 
            height={400}
          />
        </div>
      </div>

      {/* Geographic and Top Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GeographicDistribution 
          data={analytics?.geographicData || []}
          title="User Distribution by Region"
        />
        <TopMetrics 
          metrics={{
            topPrograms: analytics?.topPrograms || [],
            topTeachers: analytics?.topTeachers || [],
            topSchools: analytics?.topSchools || [],
          }}
        />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        availableFormats={['pdf', 'excel', 'csv']}
        dateRange={dateRange}
      />
    </div>
  );
};
```

**Create KPICards component (src/components/analytics/KPICards.tsx):**
```typescript
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { MiniChart } from './MiniChart';

interface KPI {
  title: string;
  value: string;
  change: number;
  changeType: 'percentage' | 'currency' | 'number';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend: number[];
}

interface KPICardsProps {
  kpis: KPI[];
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  const formatChange = (change: number, type: string) => {
    const isPositive = change >= 0;
    const prefix = isPositive ? '+' : '';
    
    switch (type) {
      case 'percentage':
        return `${prefix}${change.toFixed(1)}%`;
      case 'currency':
        return `${prefix}$${Math.abs(change).toLocaleString()}`;
      default:
        return `${prefix}${change.toLocaleString()}`;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const isPositive = kpi.change >= 0;
        
        return (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {kpi.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {kpi.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? (
                          <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {isPositive ? 'Increased' : 'Decreased'} by
                        </span>
                        {formatChange(kpi.change, kpi.changeType)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <MiniChart data={kpi.trend} color={isPositive ? '#10B981' : '#EF4444'} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

### Step 2: Create Financial Reporting and Revenue Analytics (1.5 hours)

**Create FinancialReportsPage component (src/pages/analytics/FinancialReportsPage.tsx):**
```typescript
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RevenueBreakdownChart } from '../../components/charts/RevenueBreakdownChart';
import { PaymentMethodChart } from '../../components/charts/PaymentMethodChart';
import { RefundAnalysisChart } from '../../components/charts/RefundAnalysisChart';
import { FinancialSummaryTable } from '../../components/analytics/FinancialSummaryTable';
import { TaxReportGenerator } from '../../components/analytics/TaxReportGenerator';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { loadFinancialReports } from '../../store/slices/financialSlice';
import type { RootState } from '../../store/store';

export const FinancialReportsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { financialData, isLoading } = useSelector((state: RootState) => state.financial);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
    endDate: new Date(),
  });

  useEffect(() => {
    dispatch(loadFinancialReports(dateRange));
  }, [dispatch, dateRange]);

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Financial Reports
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive financial analytics and revenue reporting
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
          />
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Revenue Breakdown
            </h3>
            <RevenueBreakdownChart data={financialData?.revenueBreakdown || []} />
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Payment Methods
            </h3>
            <PaymentMethodChart data={financialData?.paymentMethods || []} />
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <FinancialSummaryTable data={financialData?.summary || []} />

      {/* Refund Analysis */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Refund Analysis
          </h3>
          <RefundAnalysisChart data={financialData?.refundData || []} />
        </div>
      </div>

      {/* Tax Report Generator */}
      <TaxReportGenerator dateRange={dateRange} />
    </div>
  );
};
```

### Step 3: Create Custom Report Builder and Data Export (1.5 hours)

**Create ReportBuilderPage component (src/pages/analytics/ReportBuilderPage.tsx):**
```typescript
import React, { useState } from 'react';
import { ReportConfigPanel } from '../../components/analytics/ReportConfigPanel';
import { ReportPreview } from '../../components/analytics/ReportPreview';
import { SavedReports } from '../../components/analytics/SavedReports';
import { Button } from '../../components/common/Button';
import type { ReportConfig } from '../../types/analytics';

export const ReportBuilderPage: React.FC = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    name: '',
    type: 'table',
    dataSource: 'users',
    filters: {},
    columns: [],
    groupBy: [],
    sortBy: [],
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
  });
  const [showPreview, setShowPreview] = useState(false);

  const handleConfigChange = (newConfig: Partial<ReportConfig>) => {
    setReportConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleSaveReport = () => {
    // Save report configuration
    console.log('Saving report:', reportConfig);
  };

  const handleGenerateReport = () => {
    // Generate and download report
    console.log('Generating report:', reportConfig);
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Report Builder
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Create custom reports and analytics dashboards
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            variant="secondary"
            onClick={handleSaveReport}
            disabled={!reportConfig.name}
          >
            Save Report
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerateReport}
            disabled={!reportConfig.dataSource}
          >
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <ReportConfigPanel
            config={reportConfig}
            onChange={handleConfigChange}
          />
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          {showPreview ? (
            <ReportPreview config={reportConfig} />
          ) : (
            <SavedReports onLoadReport={setReportConfig} />
          )}
        </div>
      </div>
    </div>
  );
};
```

### Step 4: Create Performance Monitoring and System Health (1 hour)

**Create SystemHealthPage component (src/pages/analytics/SystemHealthPage.tsx):**
```typescript
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SystemMetricsChart } from '../../components/charts/SystemMetricsChart';
import { PerformanceIndicators } from '../../components/analytics/PerformanceIndicators';
import { ErrorLogTable } from '../../components/analytics/ErrorLogTable';
import { AlertsPanel } from '../../components/analytics/AlertsPanel';
import { loadSystemHealth } from '../../store/slices/systemSlice';
import type { RootState } from '../../store/store';

export const SystemHealthPage: React.FC = () => {
  const dispatch = useDispatch();
  const { systemHealth, isLoading } = useSelector((state: RootState) => state.system);

  useEffect(() => {
    dispatch(loadSystemHealth());

    // Set up real-time updates
    const interval = setInterval(() => {
      dispatch(loadSystemHealth());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            System Health
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Monitor platform performance and system metrics
          </p>
        </div>
      </div>

      {/* Performance Indicators */}
      <PerformanceIndicators metrics={systemHealth?.metrics || {}} />

      {/* System Metrics Chart */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            System Performance
          </h3>
          <SystemMetricsChart data={systemHealth?.performanceData || []} />
        </div>
      </div>

      {/* Alerts and Error Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsPanel alerts={systemHealth?.alerts || []} />
        <ErrorLogTable errors={systemHealth?.errorLogs || []} />
      </div>
    </div>
  );
};
```

## Acceptance Criteria

### Functional Requirements
- [ ] Analytics dashboard displays comprehensive platform metrics
- [ ] Financial reports provide detailed revenue and payment analysis
- [ ] Custom report builder allows flexible report creation
- [ ] System health monitoring shows real-time performance data
- [ ] Data export functionality works in multiple formats
- [ ] Date range filtering works across all analytics
- [ ] Charts and visualizations are interactive and informative
- [ ] Real-time updates reflect current platform status

### Technical Requirements
- [ ] React components follow established admin patterns
- [ ] Chart libraries (Recharts) integrated properly
- [ ] Redux state management handles analytics data efficiently
- [ ] TypeScript types ensure type safety across components
- [ ] API integration with backend analytics endpoints
- [ ] Performance optimized for large datasets
- [ ] Error handling covers all edge cases
- [ ] Accessibility standards met throughout interface

### Design Requirements
- [ ] Interface matches admin dashboard design system
- [ ] Charts and visualizations are visually appealing
- [ ] KPI cards provide clear metric summaries
- [ ] Report builder interface is intuitive and user-friendly
- [ ] Loading and error states provide clear feedback
- [ ] Color coding helps distinguish different data categories

### Testing Requirements
- [ ] Unit tests for all components and utilities
- [ ] Integration tests for analytics workflows
- [ ] Chart rendering and interaction testing
- [ ] Data export functionality testing
- [ ] Performance testing with large datasets
- [ ] User acceptance testing for reporting workflows

## Manual Testing Instructions

### Test Case 1: Analytics Dashboard
1. Access analytics dashboard
2. Test date range selection and filtering
3. Verify KPI card calculations and trends
4. Test chart interactions and data accuracy
5. Test export functionality
6. Verify responsive design

### Test Case 2: Financial Reporting
1. Navigate to financial reports
2. Test revenue breakdown analysis
3. Test payment method analytics
4. Test refund analysis functionality
5. Test tax report generation
6. Verify financial data accuracy

### Test Case 3: Custom Report Builder
1. Access report builder interface
2. Test report configuration options
3. Test preview functionality
4. Test report saving and loading
5. Test report generation and export
6. Verify custom filter functionality

### Test Case 4: System Health Monitoring
1. Navigate to system health page
2. Test real-time metric updates
3. Test performance indicator accuracy
4. Test alert and error log functionality
5. Verify system status displays

## API Integration Requirements

### Analytics Endpoints Used
- `GET /api/admin/analytics/overview` - Get platform analytics overview
- `GET /api/admin/analytics/financial` - Get financial reports data
- `GET /api/admin/analytics/custom` - Generate custom reports
- `GET /api/admin/system/health` - Get system health metrics
- `POST /api/admin/reports/export` - Export reports in various formats
- `GET /api/admin/analytics/kpis` - Get key performance indicators
- `POST /api/admin/reports/save` - Save custom report configurations

### Data Validation
- Date range validation for analytics queries
- Report configuration validation
- Export format and size limitations
- System metric accuracy verification
- Financial data reconciliation

## Dependencies and Integration Points

### Required Components (from previous tasks)
- Admin layout and navigation
- Common UI components (Button, DatePicker, etc.)
- Chart components (Recharts integration)
- Redux store and state management
- Authentication and permission systems

### API Dependencies (from previous agents)
- Analytics and reporting APIs
- Financial data and payment integration
- System monitoring and health APIs
- User and booking data for analytics
- Export and file generation services

### Design System Dependencies
- Admin interface patterns
- Chart and visualization specifications
- Dashboard layout patterns
- Report and table designs
- Data visualization color schemes

## Completion Checklist

- [ ] Analytics dashboard and KPI overview implemented
- [ ] Financial reporting and revenue analytics created
- [ ] Custom report builder and data export built
- [ ] Performance monitoring and system health developed
- [ ] Redux state management configured
- [ ] API integration completed
- [ ] Chart libraries integrated
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Responsive design implemented
- [ ] Accessibility features added
- [ ] Unit tests written and passing
- [ ] Integration tests completed
- [ ] Manual testing completed
- [ ] Code review completed
- [ ] Documentation updated

## Notes for Next Tasks
- Reporting interface completes the admin dashboard functionality
- Analytics patterns can be extended for user-facing insights
- Custom report builder provides flexibility for business needs
- System health monitoring ensures platform reliability
- Financial reporting supports business operations and compliance
- Data export capabilities enable external analysis and reporting
