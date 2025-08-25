import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdvancedSearchBar } from '../../components/advanced/AdvancedSearchBar';
import { useSearchStore } from '../../stores/searchStore';
import { useSearchSuggestions } from '../../hooks/useSearchQuery';

// Mock the store and hooks
jest.mock('../../stores/searchStore');
jest.mock('../../hooks/useSearchQuery');

const mockUseSearchStore = useSearchStore as jest.MockedFunction<typeof useSearchStore>;
const mockUseSearchSuggestions = useSearchSuggestions as jest.MockedFunction<typeof useSearchSuggestions>;

describe('AdvancedSearchBar', () => {
  const mockStore = {
    query: { text: '', entities: ['Contact', 'Company'] },
    suggestions: [],
    history: [],
    setQuery: jest.fn(),
    executeSearch: jest.fn(),
    setSuggestions: jest.fn(),
    addToHistory: jest.fn(),
  };

  const mockSuggestions = ['test contact', 'test company', 'test deal'];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchStore.mockReturnValue(mockStore);
    mockUseSearchSuggestions.mockReturnValue({
      data: mockSuggestions,
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render search input correctly', () => {
      render(<AdvancedSearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search contacts, companies, deals...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('');
    });

    it('should render search button', () => {
      render(<AdvancedSearchBar />);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeInTheDocument();
    });

    it('should render clear button when there is text', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        query: { text: 'test', entities: ['Contact'] },
      });

      render(<AdvancedSearchBar />);
      
      const clearButton = screen.getByRole('button', { name: /clear/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should not render clear button when input is empty', () => {
      render(<AdvancedSearchBar />);
      
      const clearButton = screen.queryByRole('button', { name: /clear/i });
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('should update query text on input change', async () => {
      const user = userEvent.setup();
      render(<AdvancedSearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search contacts, companies, deals...');
      await user.type(searchInput, 'test search');
      
      expect(mockStore.setQuery).toHaveBeenCalledWith({ text: 'test search' });
    });

    it('should clear input when clear button is clicked', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        query: { text: 'test', entities: ['Contact'] },
      });

      render(<AdvancedSearchBar />);
      
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);
      
      expect(mockStore.setQuery).toHaveBeenCalledWith({ text: '' });
    });

    it('should handle empty input correctly', async () => {
      const user = userEvent.setup();
      render(<AdvancedSearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search contacts, companies, deals...');
      await user.type(searchInput, 'test');
      await user.clear(searchInput);
      
      expect(mockStore.setQuery).toHaveBeenCalledWith({ text: '' });
    });
  });

  describe('Search Execution', () => {
    it('should execute search when search button is clicked', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        query: { text: 'test', entities: ['Contact'] },
      });

      render(<AdvancedSearchBar />);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      expect(mockStore.executeSearch).toHaveBeenCalled();
    });

    it('should execute search when Enter key is pressed', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        query: { text: 'test', entities: ['Contact'] },
      });

      render(<AdvancedSearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search contacts, companies, deals...');
      await user.type(searchInput, '{enter}');
      
      expect(mockStore.executeSearch).toHaveBeenCalled();
    });

    it('should not execute search when input is empty', async () => {
      const user = userEvent.setup();
      render(<AdvancedSearchBar />);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      expect(mockStore.executeSearch).not.toHaveBeenCalled();
    });
  });

  describe('Suggestions Display', () => {
    it('should display suggestions when available', () => {
      mockUseSearchSuggestions.mockReturnValue({
        data: mockSuggestions,
        isLoading: false,
        error: null,
      });

      render(<AdvancedSearchBar />);
      
      mockSuggestions.forEach(suggestion => {
        expect(screen.getByText(suggestion)).toBeInTheDocument();
      });
    });

    it('should not display suggestions when loading', () => {
      mockUseSearchSuggestions.mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      });

      render(<AdvancedSearchBar />);
      
      const suggestionsList = screen.queryByRole('list');
      expect(suggestionsList).not.toBeInTheDocument();
    });

    it('should not display suggestions when there is an error', () => {
      mockUseSearchSuggestions.mockReturnValue({
        data: [],
        isLoading: false,
        error: new Error('Failed to load suggestions'),
      });

      render(<AdvancedSearchBar />);
      
      const suggestionsList = screen.queryByRole('list');
      expect(suggestionsList).not.toBeInTheDocument();
    });

    it('should apply suggestion when clicked', async () => {
      const user = userEvent.setup();
      mockUseSearchSuggestions.mockReturnValue({
        data: mockSuggestions,
        isLoading: false,
        error: null,
      });

      render(<AdvancedSearchBar />);
      
      const firstSuggestion = screen.getByText(mockSuggestions[0]);
      await user.click(firstSuggestion);
      
      expect(mockStore.setQuery).toHaveBeenCalledWith({ text: mockSuggestions[0] });
      expect(mockStore.executeSearch).toHaveBeenCalled();
    });
  });

  describe('Search History', () => {
    it('should display search history when available', () => {
      const mockHistory = [
        { text: 'previous search 1', entities: ['Contact'] },
        { text: 'previous search 2', entities: ['Company'] },
      ];

      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        history: mockHistory,
      });

      render(<AdvancedSearchBar />);
      
      mockHistory.forEach(item => {
        expect(screen.getByText(item.text)).toBeInTheDocument();
      });
    });

    it('should apply history item when clicked', async () => {
      const user = userEvent.setup();
      const mockHistory = [
        { text: 'previous search', entities: ['Contact'] },
      ];

      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        history: mockHistory,
      });

      render(<AdvancedSearchBar />);
      
      const historyItem = screen.getByText('previous search');
      await user.click(historyItem);
      
      expect(mockStore.setQuery).toHaveBeenCalledWith({ text: 'previous search' });
      expect(mockStore.executeSearch).toHaveBeenCalled();
    });

    it('should not display history when empty', () => {
      render(<AdvancedSearchBar />);
      
      const historyList = screen.queryByRole('list');
      expect(historyList).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle arrow key navigation in suggestions', async () => {
      const user = userEvent.setup();
      mockUseSearchSuggestions.mockReturnValue({
        data: mockSuggestions,
        isLoading: false,
        error: null,
      });

      render(<AdvancedSearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search contacts, companies, deals...');
      await user.type(searchInput, 'test');
      
      // Navigate down
      await user.keyboard('{ArrowDown}');
      const firstSuggestion = screen.getByText(mockSuggestions[0]);
      expect(firstSuggestion).toHaveClass('bg-blue-50');
      
      // Navigate up
      await user.keyboard('{ArrowUp}');
      expect(firstSuggestion).not.toHaveClass('bg-blue-50');
    });

    it('should handle Escape key to close suggestions', async () => {
      const user = userEvent.setup();
      mockUseSearchSuggestions.mockReturnValue({
        data: mockSuggestions,
        isLoading: false,
        error: null,
      });

      render(<AdvancedSearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search contacts, companies, deals...');
      await user.type(searchInput, 'test');
      
      // Press Escape
      await user.keyboard('{Escape}');
      
      // Suggestions should be hidden or focus should be lost
      expect(searchInput).not.toHaveFocus();
    });

    it('should handle Tab key navigation', async () => {
      const user = userEvent.setup();
      render(<AdvancedSearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search contacts, companies, deals...');
      await user.tab();
      
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Debouncing', () => {
    it('should debounce search suggestions', async () => {
      const user = userEvent.setup();
      jest.useFakeTimers();

      render(<AdvancedSearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search contacts, companies, deals...');
      await user.type(searchInput, 'test');
      
      // Fast typing should not trigger immediate search
      expect(mockStore.executeSearch).not.toHaveBeenCalled();
      
      // Advance timers to trigger debounced search
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(mockStore.setQuery).toHaveBeenCalledWith({ text: 'test' });
      });

      jest.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<AdvancedSearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search contacts, companies, deals...');
      expect(searchInput).toHaveAttribute('aria-label', 'Search');
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toHaveAttribute('aria-label', 'Search');
    });

    it('should have proper role attributes', () => {
      render(<AdvancedSearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search contacts, companies, deals...');
      expect(searchInput).toHaveAttribute('role', 'searchbox');
    });

    it('should support screen readers', () => {
      render(<AdvancedSearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search contacts, companies, deals...');
      expect(searchInput).toHaveAttribute('aria-describedby');
    });
  });

  describe('Error Handling', () => {
    it('should handle suggestion loading errors gracefully', () => {
      mockUseSearchSuggestions.mockReturnValue({
        data: [],
        isLoading: false,
        error: new Error('Failed to load suggestions'),
      });

      render(<AdvancedSearchBar />);
      
      // Should still render the search input
      const searchInput = screen.getByPlaceholderText('Search contacts, companies, deals...');
      expect(searchInput).toBeInTheDocument();
      
      // Should not display suggestions
      const suggestionsList = screen.queryByRole('list');
      expect(suggestionsList).not.toBeInTheDocument();
    });

    it('should handle store errors gracefully', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        setQuery: jest.fn().mockImplementation(() => {
          throw new Error('Store error');
        }),
      });

      // Should not crash the component
      expect(() => render(<AdvancedSearchBar />)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<AdvancedSearchBar />);
      
      // Mock store to track calls
      const mockSetQuery = jest.fn();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        setQuery: mockSetQuery,
      });
      
      // Re-render with same props
      rerender(<AdvancedSearchBar />);
      
      // Should not trigger unnecessary updates
      expect(mockSetQuery).not.toHaveBeenCalled();
    });

    it('should handle large suggestion lists efficiently', () => {
      const largeSuggestions = Array.from({ length: 100 }, (_, i) => `suggestion ${i}`);
      
      mockUseSearchSuggestions.mockReturnValue({
        data: largeSuggestions,
        isLoading: false,
        error: null,
      });

      // Should render without performance issues
      expect(() => render(<AdvancedSearchBar />)).not.toThrow();
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

      render(<AdvancedSearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search contacts, companies, deals...');
      expect(searchInput).toBeInTheDocument();
      
      // Should still be functional on mobile
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('should handle touch events', async () => {
      const user = userEvent.setup();
      render(<AdvancedSearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search contacts, companies, deals...');
      
      // Simulate touch event
      fireEvent.touchStart(searchInput);
      fireEvent.touchEnd(searchInput);
      
      expect(searchInput).toHaveFocus();
    });
  });
});
