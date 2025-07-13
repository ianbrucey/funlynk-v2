import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

// UI Components
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  Skeleton,
} from '@mui/material';

// Icons
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Shared Components
import { DataTable } from '../../../components/shared/DataTable';
import { SearchBar } from '../../../components/shared/SearchBar';
import { FilterPanel } from '../../../components/shared/FilterPanel';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../../components/shared/ErrorAlert';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';

// Module-specific Components
import { {MODEL}Form } from '../../../components/{module}/{MODEL}Form';
import { {MODEL}DetailModal } from '../../../components/{module}/{MODEL}DetailModal';
import { {MODEL}BulkActions } from '../../../components/{module}/{MODEL}BulkActions';

// Hooks
import { use{MODEL}s } from '../../../hooks/{module}/use{MODEL}s';
import { usePermissions } from '../../../hooks/shared/usePermissions';
import { useBulkSelection } from '../../../hooks/shared/useBulkSelection';

// Services
import { {model}Api } from '../../../services/api/{module}/{model}Api';
import { exportService } from '../../../services/shared/exportService';

// Types
import type { {MODEL}, {MODEL}Filters } from '../../../types/{module}';
import type { TableColumn, SortConfig } from '../../../types/shared';

// Utils
import { formatDate, formatCurrency } from '../../../utils/formatters';
import { downloadFile } from '../../../utils/fileUtils';

/**
 * {PAGE_NAME} Admin Page
 * 
 * {DESCRIPTION}
 * 
 * Features:
 * - Data table with sorting, filtering, and pagination
 * - CRUD operations with form modals
 * - Bulk actions and export functionality
 * - Search and advanced filtering
 * - Responsive design for admin interface
 */

// ========================================
// TYPES
// ========================================

interface {PAGE_NAME}Props {
  // Add any props if needed
}

// ========================================
// COMPONENT
// ========================================

export const {PAGE_NAME}: React.FC<{PAGE_NAME}Props> = () => {
  // ========================================
  // HOOKS
  // ========================================

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { id } = useParams<{ id?: string }>();
  
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  
  const {
    {model}s,
    loading,
    error,
    total,
    currentPage,
    hasMore,
    refresh,
    loadMore,
    create{MODEL},
    update{MODEL},
    delete{MODEL},
  } = use{MODEL}s({
    pageSize: 25,
    autoRefresh: true,
  });

  const { canCreate, canEdit, canDelete, canExport } = usePermissions('{module}:{model}s');
  
  const {
    selectedItems,
    isSelected,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    selectedCount,
  } = useBulkSelection<{MODEL}>();

  // ========================================
  // LOCAL STATE
  // ========================================

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState<{MODEL}Filters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'createdAt',
    direction: 'desc',
  });
  
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingItem, setEditingItem] = useState<{MODEL} | null>(null);
  const [deletingItem, setDeletingItem] = useState<{MODEL} | null>(null);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = useState<{MODEL} | null>(null);

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    // Update URL params when search/filters change
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (Object.keys(filters).length > 0) {
      params.set('filters', JSON.stringify(filters));
    }
    setSearchParams(params);
  }, [searchQuery, filters, setSearchParams]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((newFilters: {MODEL}Filters) => {
    setFilters(newFilters);
  }, []);

  const handleSort = useCallback((field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = ({model}: {MODEL}) => {
    setEditingItem({model});
    setShowForm(true);
  };

  const handleView = ({model}: {MODEL}) => {
    setEditingItem({model});
    setShowDetail(true);
  };

  const handleDelete = ({model}: {MODEL}) => {
    setDeletingItem({model});
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: {MODEL}) => {
    setAnchorEl(event.currentTarget);
    setMenuItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingItem) {
        await update{MODEL}(editingItem.id, data);
        toast.success('{MODEL} updated successfully');
      } else {
        await create{MODEL}(data);
        toast.success('{MODEL} created successfully');
      }
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      toast.error(`Failed to ${editingItem ? 'update' : 'create'} {model}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    
    try {
      await delete{MODEL}(deletingItem.id);
      toast.success('{MODEL} deleted successfully');
      setDeletingItem(null);
    } catch (error) {
      toast.error('Failed to delete {model}');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedItems.map(item => delete{MODEL}(item.id)));
      toast.success(`${selectedCount} {model}s deleted successfully`);
      clearSelection();
    } catch (error) {
      toast.error('Failed to delete selected {model}s');
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf' = 'csv') => {
    try {
      const data = await exportService.export{MODEL}s({
        format,
        filters: { ...filters, search: searchQuery },
        sort: sortConfig,
      });
      
      downloadFile(data, `{model}s-${new Date().toISOString().split('T')[0]}.${format}`);
      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  // ========================================
  // TABLE CONFIGURATION
  // ========================================

  const columns: TableColumn<{MODEL}>[] = [
    {
      id: 'name',
      label: 'Name',
      sortable: true,
      render: (item) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {item.name}
          </Typography>
          {item.description && (
            <Typography variant="caption" color="text.secondary">
              {item.description.substring(0, 50)}...
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (item) => (
        <Chip
          label={item.status}
          color={item.status === 'active' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    // Module-specific columns
    ...('{MODULE}' === 'Core' ? [
      {
        id: 'startDate',
        label: 'Start Date',
        sortable: true,
        render: (item: any) => formatDate(item.startDate),
      },
      {
        id: 'attendees',
        label: 'Attendees',
        render: (item: any) => `${item.currentAttendees || 0}/${item.maxCapacity || '∞'}`,
      },
      {
        id: 'price',
        label: 'Price',
        render: (item: any) => item.price ? formatCurrency(item.price) : 'Free',
      },
    ] : []),
    ...('{MODULE}' === 'Spark' ? [
      {
        id: 'duration',
        label: 'Duration',
        render: (item: any) => `${item.durationMinutes} min`,
      },
      {
        id: 'gradeLevel',
        label: 'Grade Level',
        render: (item: any) => item.gradeLevels?.join(', ') || 'All',
      },
      {
        id: 'cost',
        label: 'Cost',
        render: (item: any) => formatCurrency(item.cost),
      },
    ] : []),
    {
      id: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (item) => formatDate(item.createdAt),
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 120,
      render: (item) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleView(item)}
            title="View details"
          >
            <SearchIcon fontSize="small" />
          </IconButton>
          {canEdit && (
            <IconButton
              size="small"
              onClick={() => handleEdit(item)}
              title="Edit"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, item)}
            title="More actions"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // ========================================
  // RENDER HELPERS
  // ========================================

  const renderHeader = () => (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link color="inherit" href="/admin" onClick={() => navigate('/admin')}>
          Admin
        </Link>
        <Typography color="text.primary">{PAGE_TITLE}</Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          {PAGE_TITLE}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={refresh}
            disabled={loading}
          >
            Refresh
          </Button>
          
          {canExport && (
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => handleExport()}
              disabled={loading}
            >
              Export
            </Button>
          )}
          
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Create {MODEL}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );

  const renderFilters = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search {model}s..."
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Button
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              variant={Object.keys(filters).length > 0 ? 'contained' : 'outlined'}
            >
              Filters {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
            </Button>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {total} total {model}s
            </Typography>
          </Grid>
        </Grid>
        
        {showFilters && (
          <Box sx={{ mt: 2 }}>
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              options={{
                status: ['active', 'inactive', 'draft'],
                // Add module-specific filter options
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderBulkActions = () => {
    if (selectedCount === 0) return null;
    
    return (
      <Card sx={{ mb: 2, bgcolor: 'primary.50' }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">
              {selectedCount} {model}s selected
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" onClick={clearSelection}>
                Clear Selection
              </Button>
              
              {canDelete && (
                <Button
                  size="small"
                  color="error"
                  onClick={handleBulkDelete}
                  startIcon={<DeleteIcon />}
                >
                  Delete Selected
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (loading && {model}s.length === 0) {
      return (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <LoadingSpinner size="large" />
            </Box>
          </CardContent>
        </Card>
      );
    }

    if (error && {model}s.length === 0) {
      return (
        <ErrorAlert
          error={error}
          onRetry={refresh}
          title="Failed to load {model}s"
        />
      );
    }

    return (
      <Card>
        <DataTable
          data={{model}s}
          columns={columns}
          loading={loading}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectable
          selectedItems={selectedItems}
          onSelectionChange={toggleSelection}
          onSelectAll={toggleSelectAll}
          pagination={{
            page: currentPage,
            total,
            pageSize: 25,
            hasMore,
            onLoadMore: loadMore,
          }}
        />
      </Card>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {renderHeader()}
      {renderFilters()}
      {renderBulkActions()}
      {renderContent()}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleView(menuItem!); handleMenuClose(); }}>
          View Details
        </MenuItem>
        {canEdit && (
          <MenuItem onClick={() => { handleEdit(menuItem!); handleMenuClose(); }}>
            Edit
          </MenuItem>
        )}
        <MenuItem onClick={() => { /* Handle duplicate */ handleMenuClose(); }}>
          Duplicate
        </MenuItem>
        {canDelete && (
          <MenuItem 
            onClick={() => { handleDelete(menuItem!); handleMenuClose(); }}
            sx={{ color: 'error.main' }}
          >
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Form Modal */}
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingItem ? 'Edit {MODEL}' : 'Create {MODEL}'}
        </DialogTitle>
        <DialogContent>
          <{MODEL}Form
            initialData={editingItem}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <{MODEL}DetailModal
        open={showDetail}
        {model}={editingItem}
        onClose={() => setShowDetail(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingItem)}
        title="Delete {MODEL}"
        message={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingItem(null)}
      />
    </Container>
  );
};

/*
USAGE INSTRUCTIONS:

1. Replace placeholders:
   - {PAGE_NAME}: Page component name (e.g., EventsAdminPage, ProgramsAdminPage)
   - {PAGE_TITLE}: Display title (e.g., "Events Management", "Programs Management")
   - {MODEL}: Model name (e.g., Event, Program)
   - {model}: Lowercase model name (e.g., event, program)
   - {MODULE}: Module name (e.g., Core, Spark)
   - {module}: Lowercase module name (e.g., core, spark)
   - {DESCRIPTION}: Page description

2. Customize table columns based on your data model

3. Update filter options and search functionality

4. Add module-specific actions and features

5. Configure permissions and role-based access

6. Update export functionality based on requirements

EXAMPLE USAGE:
- EventsAdminPage for Core module
- ProgramsAdminPage for Spark module
- UsersAdminPage for user management

COMMON CUSTOMIZATIONS:
- Add advanced filtering options
- Add bulk import functionality
- Add real-time updates
- Add audit trail viewing
- Add custom actions and workflows
- Add data visualization components
*/
