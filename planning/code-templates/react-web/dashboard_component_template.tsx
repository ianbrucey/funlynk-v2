import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// UI Components
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  Skeleton,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';

// Icons
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Event as EventIcon,
  School as SchoolIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

// Charts
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Hooks
import { use{MODEL}Stats } from '../../../hooks/{module}/use{MODEL}Stats';
import { use{MODEL}s } from '../../../hooks/{module}/use{MODEL}s';
import { usePermissions } from '../../../hooks/shared/usePermissions';

// Types
import type { {MODEL}, DashboardStats, ChartData } from '../../../types/{module}';

// Utils
import { formatNumber, formatCurrency, formatPercentage } from '../../../utils/formatters';
import { getTimeRangeData } from '../../../utils/dateUtils';

/**
 * {DASHBOARD_NAME} Component
 * 
 * {DESCRIPTION}
 * 
 * Features:
 * - Key metrics and KPIs
 * - Interactive charts and graphs
 * - Recent activity feed
 * - Quick actions and shortcuts
 * - Real-time data updates
 * - Responsive design
 */

// ========================================
// TYPES
// ========================================

export interface {DASHBOARD_NAME}Props {
  timeRange?: '7d' | '30d' | '90d' | '1y';
  refreshInterval?: number;
}

// ========================================
// COMPONENT
// ========================================

export const {DASHBOARD_NAME}: React.FC<{DASHBOARD_NAME}Props> = ({
  timeRange = '30d',
  refreshInterval = 30000, // 30 seconds
}) => {
  // ========================================
  // HOOKS
  // ========================================

  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  
  const {
    stats,
    chartData,
    loading: statsLoading,
    error: statsError,
    refresh: refreshStats,
  } = use{MODEL}Stats({ timeRange, refreshInterval });

  const {
    {model}s: recent{MODEL}s,
    loading: {model}sLoading,
    error: {model}sError,
  } = use{MODEL}s({
    pageSize: 5,
    filters: { recent: true },
  });

  const { canCreate, canEdit, canView, canExport } = usePermissions('{module}:{model}s');

  // ========================================
  // LOCAL STATE
  // ========================================

  const [selectedMetric, setSelectedMetric] = useState<string>('total');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const metrics = [
    {
      id: 'total',
      label: 'Total {MODEL}s',
      value: stats?.total || 0,
      change: stats?.totalChange || 0,
      icon: '{MODULE}' === 'Core' ? EventIcon : SchoolIcon,
      color: 'primary',
    },
    {
      id: 'active',
      label: 'Active {MODEL}s',
      value: stats?.active || 0,
      change: stats?.activeChange || 0,
      icon: TrendingUpIcon,
      color: 'success',
    },
    {
      id: 'users',
      label: '{MODULE}' === 'Core' ? 'Attendees' : 'Students',
      value: stats?.users || 0,
      change: stats?.usersChange || 0,
      icon: PeopleIcon,
      color: 'info',
    },
    {
      id: 'revenue',
      label: 'Revenue',
      value: formatCurrency(stats?.revenue || 0),
      change: stats?.revenueChange || 0,
      icon: MoneyIcon,
      color: 'warning',
    },
  ];

  // ========================================
  // RENDER HELPERS
  // ========================================

  const renderMetricCard = (metric: any) => (
    <Card
      key={metric.id}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
      onClick={() => setSelectedMetric(metric.id)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {metric.label}
            </Typography>
            <Typography variant="h4" component="div">
              {typeof metric.value === 'string' ? metric.value : formatNumber(metric.value)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {metric.change > 0 ? (
                <TrendingUpIcon color="success" fontSize="small" />
              ) : (
                <TrendingDownIcon color="error" fontSize="small" />
              )}
              <Typography
                variant="body2"
                color={metric.change > 0 ? 'success.main' : 'error.main'}
                sx={{ ml: 0.5 }}
              >
                {formatPercentage(Math.abs(metric.change))}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                vs last period
              </Typography>
            </Box>
          </Box>
          <Avatar
            sx={{
              bgcolor: `${metric.color}.main`,
              width: 56,
              height: 56,
            }}
          >
            <metric.icon />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const renderChart = () => {
    if (statsLoading) {
      return <Skeleton variant="rectangular" height={300} />;
    }

    if (statsError || !chartData) {
      return (
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={refreshStats}>
            Retry
          </Button>
        }>
          Failed to load chart data
        </Alert>
      );
    }

    const ChartComponent = {
      line: LineChart,
      area: AreaChart,
      bar: BarChart,
    }[chartType];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {chartType === 'line' && (
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
            />
          )}
          {chartType === 'area' && (
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
          )}
          {chartType === 'bar' && (
            <Bar dataKey={selectedMetric} fill="#3b82f6" />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  const renderRecentActivity = () => {
    if ({model}sLoading) {
      return (
        <List>
          {[...Array(5)].map((_, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Skeleton variant="circular" width={40} height={40} />
              </ListItemAvatar>
              <ListItemText
                primary={<Skeleton variant="text" width="60%" />}
                secondary={<Skeleton variant="text" width="40%" />}
              />
            </ListItem>
          ))}
        </List>
      );
    }

    if ({model}sError || !recent{MODEL}s.length) {
      return (
        <Alert severity="info">
          No recent {model}s found
        </Alert>
      );
    }

    return (
      <List>
        {recent{MODEL}s.map(({model}) => (
          <ListItem key={{model}.id} divider>
            <ListItemAvatar>
              <Avatar
                src={{model}.imageUrl}
                sx={{ bgcolor: 'primary.main' }}
              >
                {{model}.name.charAt(0).toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={{model}.name}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {'{MODULE}' === 'Core' 
                      ? `${({model} as any).attendeesCount || 0} attendees`
                      : `${({model} as any).studentsCount || 0} students`
                    }
                  </Typography>
                  <Chip
                    label={{model}.status}
                    size="small"
                    color={{model}.status === 'active' ? 'success' : 'default'}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => navigate(`/{module}/{model}s/{{model}.id}`)}
                title="View details"
              >
                <ViewIcon />
              </IconButton>
              {canEdit && (
                <IconButton
                  edge="end"
                  onClick={() => navigate(`/{module}/{model}s/{{model}.id}/edit`)}
                  title="Edit"
                >
                  <EditIcon />
                </IconButton>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  };

  const renderQuickActions = () => (
    <Grid container spacing={2}>
      {canCreate && (
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<EventIcon />}
            onClick={() => navigate(`/{module}/{model}s/create`)}
          >
            Create {MODEL}
          </Button>
        </Grid>
      )}
      
      <Grid item xs={12} sm={6}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<ViewIcon />}
          onClick={() => navigate(`/{module}/{model}s`)}
        >
          View All {MODEL}s
        </Button>
      </Grid>
      
      {canExport && (
        <Grid item xs={12} sm={6}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<DownloadIcon />}
            onClick={() => {/* Handle export */}}
          >
            Export Data
          </Button>
        </Grid>
      )}
      
      <Grid item xs={12} sm={6}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<RefreshIcon />}
          onClick={refreshStats}
          disabled={statsLoading}
        >
          Refresh Data
        </Button>
      </Grid>
    </Grid>
  );

  const renderModuleSpecificWidgets = () => {
    if ('{MODULE}' === 'Core') {
      return (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Categories
              </Typography>
              {stats?.categoryBreakdown ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.categoryBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton variant="rectangular" height={200} />
              )}
            </CardContent>
          </Card>
        </Grid>
      );
    }

    if ('{MODULE}' === 'Spark') {
      return (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Character Topics
              </Typography>
              {stats?.topicBreakdown ? (
                <Box>
                  {stats.topicBreakdown.slice(0, 5).map((topic: any) => (
                    <Box key={topic.name} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{topic.name}</Typography>
                        <Typography variant="body2">{topic.count}</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(topic.count / stats.total) * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Skeleton variant="rectangular" height={200} />
              )}
            </CardContent>
          </Card>
        </Grid>
      );
    }

    return null;
  };

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {DASHBOARD_TITLE}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.name}! Here's what's happening with your {module} {model}s.
        </Typography>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map(renderMetricCard)}
      </Grid>

      {/* Charts and Analytics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trends
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['line', 'area', 'bar'].map((type) => (
                    <Button
                      key={type}
                      size="small"
                      variant={chartType === type ? 'contained' : 'outlined'}
                      onClick={() => setChartType(type as any)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </Box>
              </Box>
              {renderChart()}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent {MODEL}s
              </Typography>
              {renderRecentActivity()}
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => navigate(`/{module}/{model}s`)}
              >
                View All
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Module-specific widgets and Quick Actions */}
      <Grid container spacing={3}>
        {renderModuleSpecificWidgets()}
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              {renderQuickActions()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

/*
USAGE INSTRUCTIONS:

1. Replace placeholders:
   - {DASHBOARD_NAME}: Dashboard component name (e.g., EventsDashboard, ProgramsDashboard)
   - {DASHBOARD_TITLE}: Display title (e.g., "Events Dashboard", "Programs Dashboard")
   - {MODEL}: Model name (e.g., Event, Program)
   - {model}: Lowercase model name (e.g., event, program)
   - {MODULE}: Module name (e.g., Core, Spark)
   - {module}: Lowercase module name (e.g., core, spark)
   - {DESCRIPTION}: Dashboard description

2. Update metrics and KPIs based on your data model

3. Customize charts and visualizations for your needs

4. Add module-specific widgets and analytics

5. Configure permissions and role-based access

6. Update navigation routes to match your app structure

EXAMPLE USAGE:
- EventsDashboard for Core module
- ProgramsDashboard for Spark module
- AdminDashboard for overall system metrics

COMMON CUSTOMIZATIONS:
- Add real-time data updates
- Add interactive filters and date ranges
- Add drill-down capabilities
- Add export and reporting features
- Add notification center
- Add performance monitoring widgets
*/
