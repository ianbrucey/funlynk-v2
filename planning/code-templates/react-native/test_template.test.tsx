import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';

// Component under test
import { {COMPONENT_NAME} } from '../{COMPONENT_NAME}';

// Mocks
import { {model}Api } from '../../../services/api/{module}/{model}Api';
import { mockNavigation, mockRoute } from '../../../__mocks__/navigation';
import { mock{MODEL}s, mock{MODEL} } from '../../../__mocks__/{module}Data';

// Store
import { {module}Slice } from '../../../store/slices/{module}Slice';
import { authSlice } from '../../../store/slices/authSlice';

// Test utilities
import { createMockStore, renderWithProviders } from '../../../utils/testUtils';

/**
 * {COMPONENT_NAME} Component Tests
 * 
 * Tests for the {COMPONENT_NAME} component including:
 * - Rendering and UI interactions
 * - Data loading and error states
 * - User interactions and navigation
 * - Redux state management
 * - API integration
 */

// ========================================
// MOCKS
// ========================================

// Mock the API service
jest.mock('../../../services/api/{module}/{model}Api', () => ({
  {model}Api: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
  },
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockCanGoBack = jest.fn().mockReturnValue(true);

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    canGoBack: mockCanGoBack,
  }),
  useRoute: () => mockRoute,
  useFocusEffect: (callback: () => void) => {
    React.useEffect(callback, []);
  },
}));

// Mock hooks
jest.mock('../../../hooks/{module}/use{MODEL}s', () => ({
  use{MODEL}s: jest.fn(),
}));

// Mock components
jest.mock('../../../components/shared/atoms/LoadingSpinner', () => ({
  LoadingSpinner: ({ testID }: { testID?: string }) => (
    <div testID={testID || 'loading-spinner'}>Loading...</div>
  ),
}));

jest.mock('../../../components/shared/molecules/ErrorMessage', () => ({
  ErrorMessage: ({ error, onRetry, testID }: any) => (
    <div testID={testID || 'error-message'}>
      <div>Error: {error}</div>
      {onRetry && <button onPress={onRetry}>Retry</button>}
    </div>
  ),
}));

// ========================================
// TEST SETUP
// ========================================

const defaultMockHookReturn = {
  {model}s: mock{MODEL}s,
  loading: false,
  error: null,
  refresh: jest.fn(),
  loadMore: jest.fn(),
  hasMore: false,
  create{MODEL}: jest.fn(),
  update{MODEL}: jest.fn(),
  delete{MODEL}: jest.fn(),
};

const mockUse{MODEL}s = require('../../../hooks/{module}/use{MODEL}s').use{MODEL}s;

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      {module}: {module}Slice.reducer,
      auth: authSlice.reducer,
    },
    preloadedState: {
      {module}: {
        {model}s: { default: mock{MODEL}s },
        loading: false,
        error: null,
        pagination: { default: { currentPage: 1, total: mock{MODEL}s.length, hasMore: false } },
        filters: { default: {} },
      },
      auth: {
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      ...initialState,
    },
  });
};

const renderComponent = (props = {}, storeState = {}) => {
  const store = createTestStore(storeState);
  
  return renderWithProviders(
    <{COMPONENT_NAME} {...props} />,
    { store }
  );
};

// ========================================
// TEST SUITES
// ========================================

describe('{COMPONENT_NAME}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUse{MODEL}s.mockReturnValue(defaultMockHookReturn);
  });

  // ========================================
  // RENDERING TESTS
  // ========================================

  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      renderComponent();
      
      expect(screen.getByText('{SCREEN_TITLE}')).toBeTruthy();
    });

    it('renders loading state', () => {
      mockUse{MODEL}s.mockReturnValue({
        ...defaultMockHookReturn,
        loading: true,
        {model}s: [],
      });

      renderComponent();
      
      expect(screen.getByTestId('loading-spinner')).toBeTruthy();
      expect(screen.getByText('Loading {model}s...')).toBeTruthy();
    });

    it('renders error state', () => {
      const errorMessage = 'Failed to load {model}s';
      mockUse{MODEL}s.mockReturnValue({
        ...defaultMockHookReturn,
        error: errorMessage,
        {model}s: [],
      });

      renderComponent();
      
      expect(screen.getByTestId('error-message')).toBeTruthy();
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeTruthy();
    });

    it('renders empty state when no {model}s', () => {
      mockUse{MODEL}s.mockReturnValue({
        ...defaultMockHookReturn,
        {model}s: [],
      });

      renderComponent();
      
      expect(screen.getByText('No {model}s found')).toBeTruthy();
      expect(screen.getByText('Get started by creating your first {model}')).toBeTruthy();
    });

    it('renders {model} list when data is available', () => {
      renderComponent();
      
      mock{MODEL}s.forEach(({model}) => {
        expect(screen.getByText({model}.name)).toBeTruthy();
      });
    });
  });

  // ========================================
  // INTERACTION TESTS
  // ========================================

  describe('User Interactions', () => {
    it('handles search input', async () => {
      const mockSearch = jest.fn();
      mockUse{MODEL}s.mockReturnValue({
        ...defaultMockHookReturn,
        search: mockSearch,
      });

      renderComponent();
      
      const searchInput = screen.getByPlaceholderText('Search {model}s...');
      fireEvent.changeText(searchInput, 'test query');
      
      // Wait for debounced search
      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith('test query');
      }, { timeout: 1000 });
    });

    it('handles filter selection', () => {
      const mockSetFilters = jest.fn();
      mockUse{MODEL}s.mockReturnValue({
        ...defaultMockHookReturn,
        setFilters: mockSetFilters,
      });

      renderComponent();
      
      const activeFilter = screen.getByText('Active');
      fireEvent.press(activeFilter);
      
      expect(mockSetFilters).toHaveBeenCalledWith('active');
    });

    it('handles refresh', async () => {
      const mockRefresh = jest.fn().mockResolvedValue(undefined);
      mockUse{MODEL}s.mockReturnValue({
        ...defaultMockHookReturn,
        refresh: mockRefresh,
      });

      renderComponent();
      
      // Simulate pull-to-refresh
      const scrollView = screen.getByTestId('scroll-view');
      fireEvent(scrollView, 'refresh');
      
      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('handles {model} item press', () => {
      renderComponent();
      
      const first{MODEL} = mock{MODEL}s[0];
      const {model}Item = screen.getByText(first{MODEL}.name);
      fireEvent.press({model}Item);
      
      expect(mockNavigate).toHaveBeenCalledWith('{MODEL}Detail', {
        {model}Id: first{MODEL}.id,
      });
    });

    it('handles create {model} button press', () => {
      renderComponent();
      
      const createButton = screen.getByTestId('create-{model}-button');
      fireEvent.press(createButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('Create{MODEL}');
    });
  });

  // ========================================
  // CRUD OPERATION TESTS
  // ========================================

  describe('CRUD Operations', () => {
    it('handles {model} creation', async () => {
      const mockCreate = jest.fn().mockResolvedValue(mock{MODEL});
      mockUse{MODEL}s.mockReturnValue({
        ...defaultMockHookReturn,
        create{MODEL}: mockCreate,
      });

      renderComponent();
      
      // Simulate form submission (this would depend on your actual UI)
      const createData = { name: 'New {MODEL}', description: 'Test description' };
      
      await mockCreate(createData);
      
      expect(mockCreate).toHaveBeenCalledWith(createData);
    });

    it('handles {model} update', async () => {
      const mockUpdate = jest.fn().mockResolvedValue(mock{MODEL});
      mockUse{MODEL}s.mockReturnValue({
        ...defaultMockHookReturn,
        update{MODEL}: mockUpdate,
      });

      renderComponent();
      
      const updateData = { name: 'Updated {MODEL}' };
      
      await mockUpdate(mock{MODEL}.id, updateData);
      
      expect(mockUpdate).toHaveBeenCalledWith(mock{MODEL}.id, updateData);
    });

    it('handles {model} deletion with confirmation', async () => {
      const mockDelete = jest.fn().mockResolvedValue(undefined);
      mockUse{MODEL}s.mockReturnValue({
        ...defaultMockHookReturn,
        delete{MODEL}: mockDelete,
      });

      // Mock Alert.alert
      const mockAlert = jest.spyOn(require('react-native'), 'Alert');
      mockAlert.alert = jest.fn((title, message, buttons) => {
        // Simulate user confirming deletion
        const deleteButton = buttons?.find((btn: any) => btn.text === 'Delete');
        if (deleteButton?.onPress) {
          deleteButton.onPress();
        }
      });

      renderComponent();
      
      // Simulate delete action
      const deleteButton = screen.getByTestId(`delete-{model}-${mock{MODEL}.id}`);
      fireEvent.press(deleteButton);
      
      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith(mock{MODEL}.id);
      });
    });
  });

  // ========================================
  // ERROR HANDLING TESTS
  // ========================================

  describe('Error Handling', () => {
    it('displays error message when API call fails', async () => {
      const errorMessage = 'Network error';
      mockUse{MODEL}s.mockReturnValue({
        ...defaultMockHookReturn,
        error: errorMessage,
      });

      renderComponent();
      
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeTruthy();
    });

    it('handles retry after error', async () => {
      const mockRetry = jest.fn();
      mockUse{MODEL}s.mockReturnValue({
        ...defaultMockHookReturn,
        error: 'Network error',
        retry: mockRetry,
      });

      renderComponent();
      
      const retryButton = screen.getByText('Retry');
      fireEvent.press(retryButton);
      
      expect(mockRetry).toHaveBeenCalled();
    });
  });

  // ========================================
  // NAVIGATION TESTS
  // ========================================

  describe('Navigation', () => {
    it('navigates back when back button is pressed', () => {
      renderComponent();
      
      const backButton = screen.getByTestId('back-button');
      fireEvent.press(backButton);
      
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('handles deep linking with route parameters', () => {
      const routeParams = { {model}Id: 'test-id', mode: 'select' };
      mockRoute.params = routeParams;

      renderComponent();
      
      // Verify component handles route parameters correctly
      expect(screen.getByTestId('{component-name}')).toBeTruthy();
    });
  });

  // ========================================
  // ACCESSIBILITY TESTS
  // ========================================

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      renderComponent();
      
      const createButton = screen.getByTestId('create-{model}-button');
      expect(createButton.props.accessibilityLabel).toBe('Create new {model}');
      expect(createButton.props.accessibilityRole).toBe('button');
    });

    it('supports screen reader navigation', () => {
      renderComponent();
      
      const {model}Items = screen.getAllByTestId(/{model}-item-/);
      {model}Items.forEach((item) => {
        expect(item.props.accessible).toBe(true);
        expect(item.props.accessibilityRole).toBe('button');
      });
    });
  });

  // ========================================
  // PERFORMANCE TESTS
  // ========================================

  describe('Performance', () => {
    it('handles large datasets efficiently', () => {
      const large{MODEL}List = Array.from({ length: 1000 }, (_, index) => ({
        ...mock{MODEL},
        id: `{model}-${index}`,
        name: `{MODEL} ${index}`,
      }));

      mockUse{MODEL}s.mockReturnValue({
        ...defaultMockHookReturn,
        {model}s: large{MODEL}List,
      });

      const startTime = performance.now();
      renderComponent();
      const endTime = performance.now();
      
      // Ensure rendering takes less than 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('implements proper memoization', () => {
      const { rerender } = renderComponent();
      
      // Re-render with same props
      rerender(<{COMPONENT_NAME} />);
      
      // Verify that expensive operations are not repeated
      expect(mockUse{MODEL}s).toHaveBeenCalledTimes(2); // Once per render
    });
  });
});

/*
USAGE INSTRUCTIONS:

1. Replace placeholders:
   - {COMPONENT_NAME}: Component name (e.g., EventListScreen, ProgramCard)
   - {SCREEN_TITLE}: Screen title (e.g., "Events", "Programs")
   - {MODEL}: Model name (e.g., Event, Program)
   - {model}: Lowercase model name (e.g., event, program)
   - {module}: Module name (e.g., core, spark)

2. Update mock data imports to match your data structure

3. Customize test cases based on your component's specific functionality

4. Add integration tests for complex user flows

5. Update accessibility tests based on your requirements

6. Add performance benchmarks for critical components

EXAMPLE USAGE:
- EventListScreen.test.tsx for Core module
- ProgramCard.test.tsx for Spark module
- Button.test.tsx for shared components

COMMON CUSTOMIZATIONS:
- Add snapshot testing
- Add visual regression testing
- Add integration tests with real API
- Add performance profiling
- Add accessibility auditing
- Add cross-platform testing
*/
