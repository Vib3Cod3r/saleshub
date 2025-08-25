import { searchApi } from '../services/searchApi';

// Mock fetch globally
global.fetch = jest.fn();

describe('SearchApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    searchApi.setToken('test-token');
  });

  afterEach(() => {
    searchApi.setToken('');
  });

  describe('Authentication', () => {
    it('should set and use authentication token', () => {
      const token = 'test-jwt-token';
      searchApi.setToken(token);
      
      // The token should be used in subsequent requests
      expect(searchApi['token']).toBe(token);
    });

    it('should clear authentication token', () => {
      searchApi.setToken('test-token');
      searchApi.setToken('');
      
      expect(searchApi['token']).toBe('');
    });
  });

  describe('Basic Search', () => {
    it('should perform basic search successfully', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Test Contact' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        metadata: { searchTime: 100, totalResults: 1 }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const query = { text: 'test', entities: ['Contact'] };
      const result = await searchApi.search(query);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8089/api/search',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(query)
        })
      );
    });

    it('should handle search errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid search query' })
      });

      const query = { text: '', entities: [] };
      
      await expect(searchApi.search(query)).rejects.toThrow('Invalid search query');
    });
  });

  describe('Fuzzy Search', () => {
    it('should perform fuzzy search successfully', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Fuzzy Match' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        metadata: { searchTime: 150, totalResults: 1 }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const query = { text: 'fuzzy', entities: ['Contact'] };
      const result = await searchApi.fuzzySearch(query);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8089/api/search/fuzzy',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(query)
        })
      );
    });
  });

  describe('Search Suggestions', () => {
    it('should get search suggestions successfully', async () => {
      const mockSuggestions = ['suggestion1', 'suggestion2', 'suggestion3'];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions
      });

      const result = await searchApi.getSuggestions('test');

      expect(result).toEqual(mockSuggestions);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8089/api/search/suggestions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ text: 'test' })
        })
      );
    });

    it('should get fuzzy suggestions successfully', async () => {
      const mockSuggestions = ['fuzzy1', 'fuzzy2'];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions
      });

      const result = await searchApi.getFuzzySuggestions('fuzzy');

      expect(result).toEqual(mockSuggestions);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8089/api/search/fuzzy-suggestions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ text: 'fuzzy' })
        })
      );
    });
  });

  describe('Analytics', () => {
    it('should get search analytics successfully', async () => {
      const mockAnalytics = {
        totalSearches: 100,
        popularQueries: [{ text: 'test', count: 10, successRate: 0.9 }],
        entityUsage: [{ entity: 'Contact', count: 50, percentage: 0.5 }],
        searchTrends: [{ date: '2024-01-01', searches: 10, change: 5 }]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics
      });

      const result = await searchApi.getAnalytics('7d');

      expect(result).toEqual(mockAnalytics);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8089/api/search/analytics?timeRange=7d',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should get performance metrics successfully', async () => {
      const mockMetrics = {
        averageResponseTime: 150,
        cacheHitRate: 0.8,
        successRate: 0.95,
        totalQueries: 1000,
        failedQueries: 50
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetrics
      });

      const result = await searchApi.getPerformanceMetrics();

      expect(result).toEqual(mockMetrics);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8089/api/search/performance',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('Filter Management', () => {
    it('should save filter successfully', async () => {
      const mockResponse = { filterId: 'filter-123' };
      const filterData = { name: 'Test Filter', filters: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await searchApi.saveFilter(filterData);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8089/api/search/filters',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(filterData)
        })
      );
    });

    it('should get saved filters successfully', async () => {
      const mockFilters = [
        { id: '1', name: 'Filter 1', filters: [] },
        { id: '2', name: 'Filter 2', filters: [] }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFilters
      });

      const result = await searchApi.getSavedFilters();

      expect(result).toEqual(mockFilters);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8089/api/search/filters',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should load filter successfully', async () => {
      const mockFilter = [{ field: 'name', operator: 'contains', value: 'test' }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFilter
      });

      const result = await searchApi.loadFilter('filter-123');

      expect(result).toEqual(mockFilter);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8089/api/search/filters/filter-123',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should delete filter successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      await searchApi.deleteFilter('filter-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8089/api/search/filters/filter-123',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('Cache Management', () => {
    it('should get cache stats successfully', async () => {
      const mockStats = {
        hits: 100,
        misses: 20,
        hitRate: 0.83,
        size: 50
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      });

      const result = await searchApi.getCacheStats();

      expect(result).toEqual(mockStats);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8089/api/search/cache-stats',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should clear cache successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      await searchApi.clearCache();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8089/api/search/cache',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('Advanced Search', () => {
    it('should perform advanced search with options', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Advanced Result' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        metadata: { searchTime: 200, totalResults: 1 },
        analytics: { totalSearches: 100 },
        suggestions: ['suggestion1', 'suggestion2']
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const query = { text: 'advanced', entities: ['Contact'] };
      const options = { includeAnalytics: true, includeSuggestions: true, cacheResults: true };
      
      const result = await searchApi.advancedSearch(query, options);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8089/api/search/advanced',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ query, options })
        })
      );
    });
  });

  describe('Export Functionality', () => {
    it('should export dashboard data successfully', async () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob
      });

      const result = await searchApi.exportDashboard();

      expect(result).toEqual(mockBlob);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8089/api/search/export',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('should handle export errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(searchApi.exportDashboard()).rejects.toThrow('Export failed: 500');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(searchApi.search({ text: 'test' })).rejects.toThrow('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      await expect(searchApi.search({ text: 'test' })).rejects.toThrow('Invalid JSON');
    });

    it('should handle unauthorized errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' })
      });

      await expect(searchApi.search({ text: 'test' })).rejects.toThrow('Unauthorized');
    });
  });
});
