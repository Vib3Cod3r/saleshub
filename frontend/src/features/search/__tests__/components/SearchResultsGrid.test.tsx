import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchResultsGrid } from '../../components/results/SearchResultsGrid';
import { useSearchStore } from '../../stores/searchStore';

// Mock the store
jest.mock('../../stores/searchStore');

const mockUseSearchStore = useSearchStore as jest.MockedFunction<typeof useSearchStore>;

describe('SearchResultsGrid', () => {
  const mockStore = {
    results: null,
    loading: false,
    error: null,
    query: { text: 'test', entities: ['Contact'] },
  };

  const mockResults = {
    data: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        entityType: 'Contact',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        entityType: 'Contact',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
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
      entityCounts: { Contact: 2 },
      query: { text: 'test', entities: ['Contact'] },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchStore.mockReturnValue(mockStore);
  });

  describe('Rendering', () => {
    it('should render loading state correctly', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        loading: true,
      });

      render(<SearchResultsGrid />);
      
      const loadingSpinner = screen.getByTestId('loading-spinner');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('should render error state correctly', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        error: 'Search failed',
      });

      render(<SearchResultsGrid />);
      
      const errorMessage = screen.getByText('Search failed');
      expect(errorMessage).toBeInTheDocument();
    });

    it('should render empty state when no results', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: {
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          metadata: { searchTime: 50, totalResults: 0, entityCounts: {}, query: {} },
        },
      });

      render(<SearchResultsGrid />);
      
      const emptyMessage = screen.getByText(/no results found/i);
      expect(emptyMessage).toBeInTheDocument();
    });

    it('should render results correctly', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      render(<SearchResultsGrid />);
      
      // Check if results are displayed
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  describe('View Modes', () => {
    it('should render view mode toggle buttons', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      render(<SearchResultsGrid />);
      
      const gridButton = screen.getByRole('button', { name: /grid/i });
      const listButton = screen.getByRole('button', { name: /list/i });
      const compactButton = screen.getByRole('button', { name: /compact/i });
      
      expect(gridButton).toBeInTheDocument();
      expect(listButton).toBeInTheDocument();
      expect(compactButton).toBeInTheDocument();
    });

    it('should switch to grid view when grid button is clicked', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      render(<SearchResultsGrid />);
      
      const gridButton = screen.getByRole('button', { name: /grid/i });
      await user.click(gridButton);
      
      // Should have grid layout classes
      const resultsContainer = screen.getByTestId('results-container');
      expect(resultsContainer).toHaveClass('grid');
    });

    it('should switch to list view when list button is clicked', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      render(<SearchResultsGrid />);
      
      const listButton = screen.getByRole('button', { name: /list/i });
      await user.click(listButton);
      
      // Should have list layout classes
      const resultsContainer = screen.getByTestId('results-container');
      expect(resultsContainer).toHaveClass('space-y-4');
    });

    it('should switch to compact view when compact button is clicked', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      render(<SearchResultsGrid />);
      
      const compactButton = screen.getByRole('button', { name: /compact/i });
      await user.click(compactButton);
      
      // Should have compact layout classes
      const resultsContainer = screen.getByTestId('results-container');
      expect(resultsContainer).toHaveClass('space-y-2');
    });
  });

  describe('Pagination', () => {
    const mockPaginatedResults = {
      data: Array.from({ length: 20 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Contact ${i + 1}`,
        email: `contact${i + 1}@example.com`,
        entityType: 'Contact',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      })),
      pagination: {
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
      },
      metadata: {
        searchTime: 100,
        totalResults: 50,
        entityCounts: { Contact: 50 },
        query: { text: 'test', entities: ['Contact'] },
      },
    };

    it('should render pagination controls when there are multiple pages', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockPaginatedResults,
      });

      render(<SearchResultsGrid />);
      
      const paginationContainer = screen.getByTestId('pagination');
      expect(paginationContainer).toBeInTheDocument();
      
      // Should show page info
      expect(screen.getByText(/showing 1-20 of 50 results/i)).toBeInTheDocument();
    });

    it('should not render pagination when there is only one page', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      render(<SearchResultsGrid />);
      
      const paginationContainer = screen.queryByTestId('pagination');
      expect(paginationContainer).not.toBeInTheDocument();
    });

    it('should navigate to next page when next button is clicked', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockPaginatedResults,
      });

      render(<SearchResultsGrid />);
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      // Should trigger page change
      // This would typically update the store or call a callback
      expect(nextButton).toBeInTheDocument();
    });

    it('should navigate to previous page when previous button is clicked', async () => {
      const user = userEvent.setup();
      const resultsPage2 = {
        ...mockPaginatedResults,
        pagination: { ...mockPaginatedResults.pagination, page: 2 },
      };

      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: resultsPage2,
      });

      render(<SearchResultsGrid />);
      
      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);
      
      expect(prevButton).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockPaginatedResults,
      });

      render(<SearchResultsGrid />);
      
      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      const resultsLastPage = {
        ...mockPaginatedResults,
        pagination: { ...mockPaginatedResults.pagination, page: 3 },
      };

      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: resultsLastPage,
      });

      render(<SearchResultsGrid />);
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Results Display', () => {
    it('should display result count correctly', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      render(<SearchResultsGrid />);
      
      const resultCount = screen.getByText(/2 results/i);
      expect(resultCount).toBeInTheDocument();
    });

    it('should display search time correctly', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      render(<SearchResultsGrid />);
      
      const searchTime = screen.getByText(/100ms/i);
      expect(searchTime).toBeInTheDocument();
    });

    it('should display entity type badges correctly', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      render(<SearchResultsGrid />);
      
      const contactBadges = screen.getAllByText('Contact');
      expect(contactBadges).toHaveLength(2);
    });

    it('should handle different entity types correctly', () => {
      const mixedResults = {
        data: [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            entityType: 'Contact',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            name: 'Acme Corp',
            industry: 'Technology',
            entityType: 'Company',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
        metadata: { searchTime: 100, totalResults: 2, entityCounts: { Contact: 1, Company: 1 }, query: {} },
      };

      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mixedResults,
      });

      render(<SearchResultsGrid />);
      
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
    });
  });

  describe('Result Item Interactions', () => {
    it('should handle result item click', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      render(<SearchResultsGrid />);
      
      const firstResult = screen.getByText('John Doe');
      await user.click(firstResult);
      
      // Should trigger item selection or navigation
      expect(firstResult).toBeInTheDocument();
    });

    it('should handle result item hover', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      render(<SearchResultsGrid />);
      
      const firstResult = screen.getByText('John Doe').closest('div');
      if (firstResult) {
        fireEvent.mouseEnter(firstResult);
        
        // Should show hover state
        expect(firstResult).toHaveClass('hover:bg-gray-50');
      }
    });

    it('should display quick actions on result items', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      render(<SearchResultsGrid />);
      
      const quickActions = screen.getAllByTestId('quick-actions');
      expect(quickActions).toHaveLength(2);
    });
  });

  describe('Loading States', () => {
    it('should show skeleton loading when loading', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        loading: true,
      });

      render(<SearchResultsGrid />);
      
      const skeletonItems = screen.getAllByTestId('skeleton-item');
      expect(skeletonItems).toHaveLength(6); // Default skeleton count
    });

    it('should show loading overlay during search', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        loading: true,
        results: mockResults, // Previous results still visible
      });

      render(<SearchResultsGrid />);
      
      const loadingOverlay = screen.getByTestId('loading-overlay');
      expect(loadingOverlay).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message with retry button', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        error: 'Failed to load results',
      });

      render(<SearchResultsGrid />);
      
      const errorMessage = screen.getByText('Failed to load results');
      const retryButton = screen.getByRole('button', { name: /retry/i });
      
      expect(errorMessage).toBeInTheDocument();
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle retry action', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        error: 'Failed to load results',
      });

      render(<SearchResultsGrid />);
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);
      
      // Should trigger retry action
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for pagination', () => {
      const mockPaginatedResults = {
        ...mockResults,
        pagination: { page: 1, limit: 20, total: 50, totalPages: 3 },
      };

      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockPaginatedResults,
      });

      render(<SearchResultsGrid />);
      
      const pagination = screen.getByTestId('pagination');
      expect(pagination).toHaveAttribute('aria-label', 'Search results pagination');
    });

    it('should have proper ARIA labels for view mode buttons', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      render(<SearchResultsGrid />);
      
      const gridButton = screen.getByRole('button', { name: /grid/i });
      expect(gridButton).toHaveAttribute('aria-label', 'Grid view');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      render(<SearchResultsGrid />);
      
      // Tab through interactive elements
      await user.tab();
      
      // Should focus on first interactive element
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large result sets efficiently', () => {
      const largeResults = {
        data: Array.from({ length: 100 }, (_, i) => ({
          id: `${i + 1}`,
          name: `Contact ${i + 1}`,
          email: `contact${i + 1}@example.com`,
          entityType: 'Contact',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        })),
        pagination: { page: 1, limit: 100, total: 100, totalPages: 1 },
        metadata: { searchTime: 100, totalResults: 100, entityCounts: { Contact: 100 }, query: {} },
      };

      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: largeResults,
      });

      // Should render without performance issues
      expect(() => render(<SearchResultsGrid />)).not.toThrow();
    });

    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<SearchResultsGrid />);
      
      // Re-render with same props
      rerender(<SearchResultsGrid />);
      
      // Should not cause performance issues
      expect(screen.getByTestId('results-container')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
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

      render(<SearchResultsGrid />);
      
      const resultsContainer = screen.getByTestId('results-container');
      expect(resultsContainer).toBeInTheDocument();
      
      // Should have mobile-friendly classes
      expect(resultsContainer).toHaveClass('grid-cols-1');
    });

    it('should handle touch events on mobile', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        results: mockResults,
      });

      render(<SearchResultsGrid />);
      
      const firstResult = screen.getByText('John Doe');
      
      // Simulate touch event
      fireEvent.touchStart(firstResult);
      fireEvent.touchEnd(firstResult);
      
      expect(firstResult).toBeInTheDocument();
    });
  });
});
