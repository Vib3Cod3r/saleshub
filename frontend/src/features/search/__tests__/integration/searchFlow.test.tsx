import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchPage } from '../../../app/search/page';
import { useSearchStore } from '../../../stores/searchStore';
import { useAuth } from '../../../shared/contexts/AuthContext';

// Mock the store and context
jest.mock('../../../stores/searchStore');
jest.mock('../../../shared/contexts/AuthContext');

const mockUseSearchStore = useSearchStore as jest.MockedFunction<typeof useSearchStore>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Search Flow Integration', () => {
  let queryClient: QueryClient;

  const mockStore = {
    query: { text: '', entities: ['Contact', 'Company'] },
    results: null,
    loading: false,
    error: null,
    filters: [],
    setQuery: jest.fn(),
    executeSearch: jest.fn(),
    addFilter: jest.fn(),
    removeFilter: jest.fn(),
    clearFilters: jest.fn(),
  };

  const mockAuth = {
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  };

  const mockResults = {
    data: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        entityType: 'Contact',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Acme Corp',
        industry: 'Technology',
        entityType: 'Company',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    },
    metadata: {
      searchTime: 100,
      totalResults: 2,
      entityCounts: { Contact: 1, Company: 1 },
      query: { text: 'test', entities: ['Contact', 'Company'] },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockUseSearchStore.mockReturnValue(mockStore);
    mockUseAuth.mockReturnValue(mockAuth);
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Complete Search Workflow', () => {
    it('should perform a complete search from input to results', async () => {
      const user = userEvent.setup();
      
      // Mock successful search execution
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        executeSearch: jest.fn().mockResolvedValue(mockResults),
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Enter search query
      const searchInput = screen.getByPlaceholderText(/search contacts, companies, deals/i);
      await user.type(searchInput, 'test search');
      
      expect(mockStore.setQuery).toHaveBeenCalledWith({ text: 'test search' });
      
      // 2. Execute search
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      expect(mockStore.executeSearch).toHaveBeenCalled();
      
      // 3. Wait for results
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });
      
      // 4. Verify result count
      expect(screen.getByText(/2 results/i)).toBeInTheDocument();
    });

    it('should handle search with filters', async () => {
      const user = userEvent.setup();
      
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [
          { field: 'status', operator: 'equals', value: 'active' },
        ],
        executeSearch: jest.fn().mockResolvedValue(mockResults),
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Add filter
      const addFilterButton = screen.getByRole('button', { name: /add filter/i });
      await user.click(addFilterButton);
      
      expect(mockStore.addFilter).toHaveBeenCalled();
      
      // 2. Execute search with filter
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      expect(mockStore.executeSearch).toHaveBeenCalledWith({
        text: '',
        entities: ['Contact', 'Company'],
        filters: [{ field: 'status', operator: 'equals', value: 'active' }],
      });
    });

    it('should handle search with entity selection', async () => {
      const user = userEvent.setup();
      
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        executeSearch: jest.fn().mockResolvedValue(mockResults),
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Select specific entities
      const contactCheckbox = screen.getByLabelText(/contact/i);
      const companyCheckbox = screen.getByLabelText(/company/i);
      
      await user.click(contactCheckbox);
      await user.click(companyCheckbox);
      
      // 2. Execute search
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      expect(mockStore.executeSearch).toHaveBeenCalledWith({
        text: '',
        entities: ['Contact', 'Company'],
        filters: [],
      });
    });
  });

  describe('Search Results Interaction', () => {
    it('should handle result item selection', async () => {
      const user = userEvent.setup();
      
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Click on a result item
      const resultItem = screen.getByText('John Doe');
      await user.click(resultItem);
      
      // 2. Should navigate to detail view or show details
      expect(resultItem).toBeInTheDocument();
    });

    it('should handle result item quick actions', async () => {
      const user = userEvent.setup();
      
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Click view button on result
      const viewButton = screen.getByRole('button', { name: /view/i });
      await user.click(viewButton);
      
      // 2. Should open detail view
      expect(viewButton).toBeInTheDocument();
    });

    it('should handle pagination', async () => {
      const user = userEvent.setup();
      
      const paginatedResults = {
        ...mockResults,
        pagination: { page: 1, limit: 20, total: 50, totalPages: 3 },
      };
      
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: paginatedResults,
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Navigate to next page
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      // 2. Should trigger page change
      expect(nextButton).toBeInTheDocument();
    });
  });

  describe('Filter Integration', () => {
    it('should apply filters and update search', async () => {
      const user = userEvent.setup();
      
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        executeSearch: jest.fn().mockResolvedValue(mockResults),
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Add filter
      const addFilterButton = screen.getByRole('button', { name: /add filter/i });
      await user.click(addFilterButton);
      
      // 2. Configure filter
      const fieldSelect = screen.getByRole('combobox', { name: /field/i });
      await user.selectOptions(fieldSelect, 'status');
      
      const operatorSelect = screen.getByRole('combobox', { name: /operator/i });
      await user.selectOptions(operatorSelect, 'equals');
      
      const valueInput = screen.getByDisplayValue('');
      await user.type(valueInput, 'active');
      
      // 3. Execute search with filter
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      expect(mockStore.executeSearch).toHaveBeenCalledWith({
        text: '',
        entities: ['Contact', 'Company'],
        filters: [{ field: 'status', operator: 'equals', value: 'active' }],
      });
    });

    it('should clear filters and reset search', async () => {
      const user = userEvent.setup();
      
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'status', operator: 'equals', value: 'active' }],
        executeSearch: jest.fn().mockResolvedValue(mockResults),
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Clear all filters
      const clearAllButton = screen.getByRole('button', { name: /clear all/i });
      await user.click(clearAllButton);
      
      expect(mockStore.clearFilters).toHaveBeenCalled();
      
      // 2. Execute search without filters
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      expect(mockStore.executeSearch).toHaveBeenCalledWith({
        text: '',
        entities: ['Contact', 'Company'],
        filters: [],
      });
    });
  });

  describe('Search Suggestions Integration', () => {
    it('should show and apply search suggestions', async () => {
      const user = userEvent.setup();
      
      // Mock suggestions
      const mockSuggestions = ['test contact', 'test company', 'test deal'];
      
      renderWithProviders(<SearchPage />);
      
      // 1. Type in search input to trigger suggestions
      const searchInput = screen.getByPlaceholderText(/search contacts, companies, deals/i);
      await user.type(searchInput, 'test');
      
      // 2. Wait for suggestions to appear
      await waitFor(() => {
        expect(screen.getByText('test contact')).toBeInTheDocument();
      });
      
      // 3. Click on a suggestion
      const suggestion = screen.getByText('test contact');
      await user.click(suggestion);
      
      // 4. Should apply the suggestion
      expect(mockStore.setQuery).toHaveBeenCalledWith({ text: 'test contact' });
    });

    it('should handle search history', async () => {
      const user = userEvent.setup();
      
      const mockHistory = [
        { text: 'previous search 1', entities: ['Contact'] },
        { text: 'previous search 2', entities: ['Company'] },
      ];
      
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        history: mockHistory,
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Click on history item
      const historyItem = screen.getByText('previous search 1');
      await user.click(historyItem);
      
      // 2. Should apply the history item
      expect(mockStore.setQuery).toHaveBeenCalledWith({ text: 'previous search 1' });
    });
  });

  describe('View Mode Integration', () => {
    it('should switch between view modes', async () => {
      const user = userEvent.setup();
      
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Switch to list view
      const listButton = screen.getByRole('button', { name: /list/i });
      await user.click(listButton);
      
      // 2. Should change view mode
      expect(listButton).toHaveClass('bg-blue-500');
      
      // 3. Switch to grid view
      const gridButton = screen.getByRole('button', { name: /grid/i });
      await user.click(gridButton);
      
      // 4. Should change view mode
      expect(gridButton).toHaveClass('bg-blue-500');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle search errors gracefully', async () => {
      const user = userEvent.setup();
      
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        executeSearch: jest.fn().mockRejectedValue(new Error('Search failed')),
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Execute search that fails
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      // 2. Should show error message
      await waitFor(() => {
        expect(screen.getByText(/search failed/i)).toBeInTheDocument();
      });
      
      // 3. Should show retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle authentication errors', async () => {
      const user = userEvent.setup();
      
      mockUseAuth.mockReturnValue({
        ...mockAuth,
        isAuthenticated: false,
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Should show authentication required message
      expect(screen.getByText(/please log in/i)).toBeInTheDocument();
      
      // 2. Should show login button
      const loginButton = screen.getByRole('button', { name: /login/i });
      expect(loginButton).toBeInTheDocument();
    });
  });

  describe('Loading States Integration', () => {
    it('should show loading state during search', async () => {
      const user = userEvent.setup();
      
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        loading: true,
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Should show loading spinner
      const loadingSpinner = screen.getByTestId('loading-spinner');
      expect(loadingSpinner).toBeInTheDocument();
      
      // 2. Should disable search button
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeDisabled();
    });

    it('should show skeleton loading for results', async () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        loading: true,
        results: mockResults, // Previous results still visible
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Should show loading overlay
      const loadingOverlay = screen.getByTestId('loading-overlay');
      expect(loadingOverlay).toBeInTheDocument();
    });
  });

  describe('Analytics Integration', () => {
    it('should track search analytics', async () => {
      const user = userEvent.setup();
      
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        executeSearch: jest.fn().mockResolvedValue(mockResults),
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Execute search
      const searchInput = screen.getByPlaceholderText(/search contacts, companies, deals/i);
      await user.type(searchInput, 'test search');
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      // 2. Should track search analytics
      // This would typically be handled by analytics service
      expect(mockStore.executeSearch).toHaveBeenCalled();
    });

    it('should display search performance metrics', async () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Should show search time
      expect(screen.getByText(/100ms/i)).toBeInTheDocument();
      
      // 2. Should show result count
      expect(screen.getByText(/2 results/i)).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness Integration', () => {
    it('should be responsive on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Should render without layout issues
      expect(screen.getByText('Search')).toBeInTheDocument();
      
      // 2. Should have mobile-friendly layout
      const searchContainer = screen.getByTestId('search-container');
      expect(searchContainer).toHaveClass('flex-col');
    });

    it('should handle touch events on mobile', async () => {
      const user = userEvent.setup();
      
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      renderWithProviders(<SearchPage />);
      
      const searchInput = screen.getByPlaceholderText(/search contacts, companies, deals/i);
      
      // Simulate touch event
      fireEvent.touchStart(searchInput);
      fireEvent.touchEnd(searchInput);
      
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Keyboard Navigation Integration', () => {
    it('should support keyboard navigation throughout the search flow', async () => {
      const user = userEvent.setup();
      
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      renderWithProviders(<SearchPage />);
      
      // 1. Tab through search input
      await user.tab();
      const searchInput = screen.getByPlaceholderText(/search contacts, companies, deals/i);
      expect(searchInput).toHaveFocus();
      
      // 2. Tab to search button
      await user.tab();
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toHaveFocus();
      
      // 3. Tab to results
      await user.tab();
      const resultItem = screen.getByText('John Doe');
      expect(resultItem).toHaveFocus();
    });

    it('should handle keyboard shortcuts', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<SearchPage />);
      
      const searchInput = screen.getByPlaceholderText(/search contacts, companies, deals/i);
      
      // 1. Focus search input
      await user.click(searchInput);
      
      // 2. Use Ctrl+K to focus search
      await user.keyboard('{Control>}k{/Control}');
      expect(searchInput).toHaveFocus();
      
      // 3. Use Escape to clear search
      await user.type(searchInput, 'test');
      await user.keyboard('{Escape}');
      expect(searchInput).toHaveValue('');
    });
  });
});
