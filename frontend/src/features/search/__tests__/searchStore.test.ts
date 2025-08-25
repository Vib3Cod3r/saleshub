import { renderHook, act } from '@testing-library/react';
import { useSearchStore } from '../stores/searchStore';
import { searchApi } from '../services/searchApi';

// Mock the search API
jest.mock('../services/searchApi');
const mockSearchApi = searchApi as jest.Mocked<typeof searchApi>;

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('SearchStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    const { result } = renderHook(() => useSearchStore());
    act(() => {
      result.current.clearResults();
      result.current.clearFilters();
      result.current.setQuery({ text: '', entities: ['Contact', 'Company', 'Deal', 'Lead', 'Task'] });
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useSearchStore());

      expect(result.current.query).toEqual({
        text: '',
        entities: ['Contact', 'Company', 'Deal', 'Lead', 'Task'],
        filters: [],
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 20
      });
      expect(result.current.results).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.filters).toEqual([]);
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.history).toEqual([]);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.authToken).toBeNull();
    });
  });

  describe('Query Management', () => {
    it('should update query correctly', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setQuery({ text: 'test search', entities: ['Contact'] });
      });

      expect(result.current.query.text).toBe('test search');
      expect(result.current.query.entities).toEqual(['Contact']);
    });

    it('should merge query updates correctly', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setQuery({ text: 'initial' });
        result.current.setQuery({ entities: ['Company'] });
      });

      expect(result.current.query.text).toBe('initial');
      expect(result.current.query.entities).toEqual(['Company']);
    });
  });

  describe('Authentication', () => {
    it('should set authentication token correctly', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setAuthToken('test-token');
      });

      expect(result.current.authToken).toBe('test-token');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear authentication token correctly', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setAuthToken('test-token');
        result.current.clearAuthToken();
      });

      expect(result.current.authToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should authenticate user correctly', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.authenticate('test-token');
      });

      expect(result.current.authToken).toBe('test-token');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should logout user correctly', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setAuthToken('test-token');
        result.current.setQuery({ text: 'test' });
        result.current.logout();
      });

      expect(result.current.authToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.results).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.history).toEqual([]);
    });
  });

  describe('Search Execution', () => {
    it('should execute search successfully when authenticated', async () => {
      const { result } = renderHook(() => useSearchStore());
      const mockResults = {
        data: [{ id: '1', name: 'Test Contact' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        metadata: { searchTime: 100, totalResults: 1 }
      };

      mockSearchApi.searchWithAuth.mockResolvedValue(mockResults);

      act(() => {
        result.current.setAuthToken('test-token');
        result.current.setQuery({ text: 'test' });
      });

      await act(async () => {
        await result.current.executeSearch();
      });

      expect(result.current.results).toEqual(mockResults);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].text).toBe('test');
    });

    it('should handle search errors when authenticated', async () => {
      const { result } = renderHook(() => useSearchStore());

      mockSearchApi.searchWithAuth.mockRejectedValue(new Error('Search failed'));

      act(() => {
        result.current.setAuthToken('test-token');
        result.current.setQuery({ text: 'test' });
      });

      await act(async () => {
        await result.current.executeSearch();
      });

      expect(result.current.results).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Search failed');
    });

    it('should require authentication for search', async () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setQuery({ text: 'test' });
      });

      await act(async () => {
        await result.current.executeSearch();
      });

      expect(result.current.error).toBe('Authentication required');
      expect(result.current.loading).toBe(false);
      expect(mockSearchApi.searchWithAuth).not.toHaveBeenCalled();
    });
  });

  describe('Filter Management', () => {
    it('should add filter correctly', () => {
      const { result } = renderHook(() => useSearchStore());
      const filter = { field: 'name', operator: 'contains' as const, value: 'test' };

      act(() => {
        result.current.addFilter(filter);
      });

      expect(result.current.filters).toHaveLength(1);
      expect(result.current.filters[0]).toEqual(filter);
    });

    it('should remove filter correctly', () => {
      const { result } = renderHook(() => useSearchStore());
      const filter = { field: 'name', operator: 'contains' as const, value: 'test' };

      act(() => {
        result.current.addFilter(filter);
        result.current.removeFilter(0);
      });

      expect(result.current.filters).toHaveLength(0);
    });

    it('should clear all filters correctly', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.addFilter({ field: 'name', operator: 'contains' as const, value: 'test1' });
        result.current.addFilter({ field: 'email', operator: 'contains' as const, value: 'test2' });
        result.current.clearFilters();
      });

      expect(result.current.filters).toHaveLength(0);
    });
  });

  describe('History Management', () => {
    it('should add search to history', () => {
      const { result } = renderHook(() => useSearchStore());
      const query = { text: 'test search', entities: ['Contact'] };

      act(() => {
        result.current.addToHistory(query);
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0]).toEqual(query);
    });

    it('should limit history to 10 items', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        // Add 12 items to history
        for (let i = 0; i < 12; i++) {
          result.current.addToHistory({ text: `search ${i}`, entities: ['Contact'] });
        }
      });

      expect(result.current.history).toHaveLength(10);
      expect(result.current.history[0].text).toBe('search 11'); // Most recent first
    });
  });

  describe('Performance Tracking', () => {
    it('should update search performance correctly', () => {
      const { result } = renderHook(() => useSearchStore());
      const performance = {
        averageResponseTime: 150,
        cacheHitRate: 0.8,
        successRate: 0.95
      };

      act(() => {
        result.current.updateSearchPerformance(performance);
      });

      expect(result.current.searchPerformance).toEqual(performance);
    });

    it('should track last search time', async () => {
      const { result } = renderHook(() => useSearchStore());
      const mockResults = {
        data: [{ id: '1', name: 'Test' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        metadata: { searchTime: 100, totalResults: 1 }
      };

      mockSearchApi.searchWithAuth.mockResolvedValue(mockResults);

      act(() => {
        result.current.setAuthToken('test-token');
        result.current.setQuery({ text: 'test' });
      });

      await act(async () => {
        await result.current.executeSearch();
      });

      expect(result.current.lastSearchTime).toBeGreaterThan(0);
    });
  });

  describe('Advanced Search Features', () => {
    it('should execute fuzzy search correctly', async () => {
      const { result } = renderHook(() => useSearchStore());
      const mockResults = {
        data: [{ id: '1', name: 'Fuzzy Match' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        metadata: { searchTime: 150, totalResults: 1 }
      };

      mockSearchApi.fuzzySearch.mockResolvedValue(mockResults);

      act(() => {
        result.current.setAuthToken('test-token');
        result.current.setQuery({ text: 'fuzzy' });
      });

      await act(async () => {
        await result.current.executeFuzzySearch();
      });

      expect(result.current.results).toEqual(mockResults);
      expect(mockSearchApi.fuzzySearch).toHaveBeenCalledWith(result.current.query);
    });

    it('should execute advanced search correctly', async () => {
      const { result } = renderHook(() => useSearchStore());
      const mockResults = {
        data: [{ id: '1', name: 'Advanced Result' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        metadata: { searchTime: 200, totalResults: 1 }
      };

      mockSearchApi.advancedSearch.mockResolvedValue(mockResults);

      act(() => {
        result.current.setAuthToken('test-token');
        result.current.setQuery({ text: 'advanced' });
      });

      await act(async () => {
        await result.current.executeAdvancedSearch({ includeAnalytics: true });
      });

      expect(result.current.results).toEqual(mockResults);
      expect(mockSearchApi.advancedSearch).toHaveBeenCalledWith(
        result.current.query,
        { includeAnalytics: true }
      );
    });
  });

  describe('Filter Template Management', () => {
    it('should save filter template correctly', async () => {
      const { result } = renderHook(() => useSearchStore());

      mockSearchApi.saveFilter.mockResolvedValue({ filterId: 'filter-123' });

      act(() => {
        result.current.setAuthToken('test-token');
        result.current.addFilter({ field: 'name', operator: 'contains' as const, value: 'test' });
      });

      await act(async () => {
        await result.current.saveFilterTemplate('Test Filter');
      });

      expect(mockSearchApi.saveFilter).toHaveBeenCalledWith({
        name: 'Test Filter',
        filters: result.current.filters,
        createdAt: expect.any(String)
      });
    });

    it('should load filter template correctly', async () => {
      const { result } = renderHook(() => useSearchStore());
      const mockFilters = [{ field: 'name', operator: 'contains' as const, value: 'test' }];

      mockSearchApi.loadFilter.mockResolvedValue(mockFilters);

      act(() => {
        result.current.setAuthToken('test-token');
      });

      await act(async () => {
        await result.current.loadFilterTemplate('filter-123');
      });

      expect(result.current.filters).toEqual(mockFilters);
      expect(mockSearchApi.loadFilter).toHaveBeenCalledWith('filter-123');
    });
  });

  describe('Cache Management', () => {
    it('should clear search cache correctly', async () => {
      const { result } = renderHook(() => useSearchStore());

      mockSearchApi.clearCache.mockResolvedValue();

      act(() => {
        result.current.setAuthToken('test-token');
        result.current.setQuery({ text: 'test' });
      });

      await act(async () => {
        await result.current.clearSearchCache();
      });

      expect(result.current.results).toBeNull();
      expect(mockSearchApi.clearCache).toHaveBeenCalled();
    });
  });

  describe('Export Functionality', () => {
    it('should export search results correctly', async () => {
      const { result } = renderHook(() => useSearchStore());

      mockSearchApi.exportDashboard.mockResolvedValue(new Blob(['data']));

      act(() => {
        result.current.setAuthToken('test-token');
      });

      await act(async () => {
        await result.current.exportSearchResults();
      });

      expect(mockSearchApi.exportDashboard).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const { result } = renderHook(() => useSearchStore());

      mockSearchApi.searchWithAuth.mockRejectedValue(new Error('Unauthorized'));

      act(() => {
        result.current.setAuthToken('invalid-token');
        result.current.setQuery({ text: 'test' });
      });

      await act(async () => {
        await result.current.executeSearch();
      });

      expect(result.current.error).toBe('Unauthorized');
      expect(result.current.loading).toBe(false);
    });

    it('should handle network errors', async () => {
      const { result } = renderHook(() => useSearchStore());

      mockSearchApi.searchWithAuth.mockRejectedValue(new Error('Network error'));

      act(() => {
        result.current.setAuthToken('test-token');
        result.current.setQuery({ text: 'test' });
      });

      await act(async () => {
        await result.current.executeSearch();
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
    });
  });
});
