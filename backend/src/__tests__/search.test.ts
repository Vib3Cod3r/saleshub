import request from 'supertest';
import { app } from '../index';
import { searchService } from '../services/search';
import { searchCacheService } from '../services/search';
import { searchPerformanceService } from '../services/search';
import { fuzzySearchService } from '../services/search';
import { advancedFilterService } from '../services/search';
import { searchDashboardService } from '../services/search';
import { generateToken } from '../utils/auth';

// Mock Redis
jest.mock('../config/redis', () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    hget: jest.fn(),
    hset: jest.fn(),
    hgetall: jest.fn(),
    zadd: jest.fn(),
    zrange: jest.fn(),
    zscore: jest.fn(),
    expire: jest.fn(),
  },
}));

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    contact: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    company: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    deal: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    lead: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  })),
}));

describe('Search API Endpoints', () => {
  let authToken: string;

  beforeAll(() => {
    // Generate test token
    authToken = generateToken({ userId: 'test-user', email: 'test@example.com' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/search', () => {
    it('should perform basic search successfully', async () => {
      const searchQuery = {
        text: 'test search',
        entities: ['Contact', 'Company'],
        filters: [],
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
        page: 1,
        limit: 20,
      };

      const mockResults = {
        data: [
          {
            id: '1',
            name: 'Test Contact',
            email: 'test@example.com',
            entityType: 'Contact',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
        metadata: {
          searchTime: 100,
          totalResults: 1,
          entityCounts: { Contact: 1 },
          query: searchQuery,
        },
      };

      // Mock the search service
      jest.spyOn(searchService, 'search').mockResolvedValue(mockResults);

      const response = await request(app)
        .post('/api/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send(searchQuery)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockResults,
        message: 'Search completed successfully',
        timestamp: expect.any(String),
      });

      expect(searchService.search).toHaveBeenCalledWith(searchQuery);
    });

    it('should handle search with filters', async () => {
      const searchQuery = {
        text: 'test',
        entities: ['Contact'],
        filters: [
          { field: 'email', operator: 'contains', value: 'test@example.com' },
        ],
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
        page: 1,
        limit: 20,
      };

      const mockResults = {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        metadata: { searchTime: 50, totalResults: 0, entityCounts: {}, query: searchQuery },
      };

      jest.spyOn(searchService, 'search').mockResolvedValue(mockResults);

      const response = await request(app)
        .post('/api/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send(searchQuery)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(searchService.search).toHaveBeenCalledWith(searchQuery);
    });

    it('should require authentication', async () => {
      const searchQuery = { text: 'test', entities: ['Contact'] };

      const response = await request(app)
        .post('/api/search')
        .send(searchQuery)
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Access token is required',
        timestamp: expect.any(String),
      });
    });

    it('should handle invalid search query', async () => {
      const invalidQuery = { text: '', entities: [] };

      const response = await request(app)
        .post('/api/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidQuery)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid search query');
    });
  });

  describe('POST /api/search/fuzzy', () => {
    it('should perform fuzzy search successfully', async () => {
      const searchQuery = {
        text: 'test',
        entities: ['Contact'],
        filters: [],
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
        page: 1,
        limit: 20,
      };

      const mockResults = {
        data: [
          {
            id: '1',
            name: 'Test Contact',
            email: 'test@example.com',
            entityType: 'Contact',
            fuzzyScore: 0.85,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        metadata: { searchTime: 150, totalResults: 1, entityCounts: { Contact: 1 }, query: searchQuery },
      };

      jest.spyOn(fuzzySearchService, 'fuzzySearch').mockResolvedValue(mockResults);

      const response = await request(app)
        .post('/api/search/fuzzy')
        .set('Authorization', `Bearer ${authToken}`)
        .send(searchQuery)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(fuzzySearchService.fuzzySearch).toHaveBeenCalledWith(searchQuery);
    });
  });

  describe('POST /api/search/suggestions', () => {
    it('should return search suggestions', async () => {
      const mockSuggestions = ['test contact', 'test company', 'test deal'];

      jest.spyOn(searchService, 'getSuggestions').mockResolvedValue(mockSuggestions);

      const response = await request(app)
        .post('/api/search/suggestions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'test' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockSuggestions,
        message: 'Suggestions retrieved successfully',
        timestamp: expect.any(String),
      });

      expect(searchService.getSuggestions).toHaveBeenCalledWith('test');
    });
  });

  describe('POST /api/search/fuzzy-suggestions', () => {
    it('should return fuzzy suggestions', async () => {
      const mockSuggestions = ['fuzzy test', 'fuzzy contact'];

      jest.spyOn(fuzzySearchService, 'getFuzzySuggestions').mockResolvedValue(mockSuggestions);

      const response = await request(app)
        .post('/api/search/fuzzy-suggestions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'fuzzy' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(fuzzySearchService.getFuzzySuggestions).toHaveBeenCalledWith('fuzzy');
    });
  });

  describe('GET /api/search/analytics', () => {
    it('should return search analytics', async () => {
      const mockAnalytics = {
        totalSearches: 100,
        popularQueries: [
          { text: 'test', count: 10, successRate: 0.9 },
        ],
        entityUsage: [
          { entity: 'Contact', count: 50, percentage: 0.5 },
        ],
        searchTrends: [
          { date: '2024-01-01', searches: 10, change: 5 },
        ],
      };

      jest.spyOn(searchService, 'getAnalytics').mockResolvedValue(mockAnalytics);

      const response = await request(app)
        .get('/api/search/analytics?timeRange=7d')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(searchService.getAnalytics).toHaveBeenCalledWith('7d');
    });
  });

  describe('GET /api/search/performance', () => {
    it('should return performance metrics', async () => {
      const mockMetrics = {
        averageResponseTime: 150,
        cacheHitRate: 0.8,
        successRate: 0.95,
        totalQueries: 1000,
        failedQueries: 50,
      };

      jest.spyOn(searchPerformanceService, 'getPerformanceMetrics').mockResolvedValue(mockMetrics);

      const response = await request(app)
        .get('/api/search/performance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(searchPerformanceService.getPerformanceMetrics).toHaveBeenCalled();
    });
  });

  describe('GET /api/search/cache-stats', () => {
    it('should return cache statistics', async () => {
      const mockStats = {
        hits: 100,
        misses: 20,
        hitRate: 0.83,
        size: 50,
      };

      jest.spyOn(searchCacheService, 'getStats').mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/search/cache-stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(searchCacheService.getStats).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/search/cache', () => {
    it('should clear search cache', async () => {
      jest.spyOn(searchCacheService, 'clear').mockResolvedValue();

      const response = await request(app)
        .delete('/api/search/cache')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(searchCacheService.clear).toHaveBeenCalled();
    });
  });

  describe('POST /api/search/filters', () => {
    it('should save filter template', async () => {
      const filterData = {
        name: 'Test Filter',
        filters: [
          { field: 'email', operator: 'contains', value: 'test@example.com' },
        ],
        createdAt: new Date().toISOString(),
      };

      const mockResponse = { filterId: 'filter-123' };

      jest.spyOn(advancedFilterService, 'saveFilter').mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/search/filters')
        .set('Authorization', `Bearer ${authToken}`)
        .send(filterData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(advancedFilterService.saveFilter).toHaveBeenCalledWith(filterData);
    });
  });

  describe('GET /api/search/filters', () => {
    it('should return saved filters', async () => {
      const mockFilters = [
        { id: '1', name: 'Filter 1', filters: [] },
        { id: '2', name: 'Filter 2', filters: [] },
      ];

      jest.spyOn(advancedFilterService, 'getSavedFilters').mockResolvedValue(mockFilters);

      const response = await request(app)
        .get('/api/search/filters')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(advancedFilterService.getSavedFilters).toHaveBeenCalled();
    });
  });

  describe('GET /api/search/filters/:filterId', () => {
    it('should load specific filter', async () => {
      const mockFilter = [
        { field: 'name', operator: 'contains', value: 'test' },
      ];

      jest.spyOn(advancedFilterService, 'loadFilter').mockResolvedValue(mockFilter);

      const response = await request(app)
        .get('/api/search/filters/filter-123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(advancedFilterService.loadFilter).toHaveBeenCalledWith('filter-123');
    });
  });

  describe('DELETE /api/search/filters/:filterId', () => {
    it('should delete filter template', async () => {
      jest.spyOn(advancedFilterService, 'deleteFilter').mockResolvedValue();

      const response = await request(app)
        .delete('/api/search/filters/filter-123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(advancedFilterService.deleteFilter).toHaveBeenCalledWith('filter-123');
    });
  });

  describe('GET /api/search/dashboard', () => {
    it('should return dashboard metrics', async () => {
      const mockDashboard = {
        totalSearches: 1000,
        averageResponseTime: 150,
        cacheHitRate: 0.8,
        successRate: 0.95,
        popularQueries: [],
        entityUsage: [],
        searchTrends: [],
      };

      jest.spyOn(searchDashboardService, 'getDashboardMetrics').mockResolvedValue(mockDashboard);

      const response = await request(app)
        .get('/api/search/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(searchDashboardService.getDashboardMetrics).toHaveBeenCalled();
    });
  });

  describe('GET /api/search/monitoring', () => {
    it('should return real-time monitoring data', async () => {
      const mockMonitoring = {
        activeSearches: 5,
        averageResponseTime: 120,
        errorRate: 0.02,
        cacheHitRate: 0.85,
      };

      jest.spyOn(searchDashboardService, 'getRealTimeMonitoring').mockResolvedValue(mockMonitoring);

      const response = await request(app)
        .get('/api/search/monitoring')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(searchDashboardService.getRealTimeMonitoring).toHaveBeenCalled();
    });
  });

  describe('GET /api/search/health', () => {
    it('should return health status', async () => {
      const mockHealth = {
        status: 'healthy',
        services: {
          search: 'healthy',
          cache: 'healthy',
          database: 'healthy',
        },
        timestamp: new Date().toISOString(),
      };

      jest.spyOn(searchDashboardService, 'getHealthStatus').mockResolvedValue(mockHealth);

      const response = await request(app)
        .get('/api/search/health')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(searchDashboardService.getHealthStatus).toHaveBeenCalled();
    });
  });

  describe('GET /api/search/trends', () => {
    it('should return search trends', async () => {
      const mockTrends = [
        { date: '2024-01-01', searches: 100, change: 5 },
        { date: '2024-01-02', searches: 105, change: 5 },
      ];

      jest.spyOn(searchDashboardService, 'getSearchTrendsAnalysis').mockResolvedValue(mockTrends);

      const response = await request(app)
        .get('/api/search/trends')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(searchDashboardService.getSearchTrendsAnalysis).toHaveBeenCalled();
    });
  });

  describe('GET /api/search/recommendations', () => {
    it('should return performance recommendations', async () => {
      const mockRecommendations = [
        { type: 'cache', message: 'Increase cache size', impact: 'high' },
        { type: 'index', message: 'Add database index', impact: 'medium' },
      ];

      jest.spyOn(searchDashboardService, 'getPerformanceRecommendations').mockResolvedValue(mockRecommendations);

      const response = await request(app)
        .get('/api/search/recommendations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(searchDashboardService.getPerformanceRecommendations).toHaveBeenCalled();
    });
  });

  describe('GET /api/search/export', () => {
    it('should export dashboard data', async () => {
      const mockCsvData = 'date,searches,change\n2024-01-01,100,5\n2024-01-02,105,5';

      jest.spyOn(searchDashboardService, 'exportDashboardData').mockResolvedValue(mockCsvData);

      const response = await request(app)
        .get('/api/search/export')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toBe('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(searchDashboardService.exportDashboardData).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      jest.spyOn(searchService, 'search').mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'test', entities: ['Contact'] })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Internal server error');
    });

    it('should handle invalid token', async () => {
      const response = await request(app)
        .post('/api/search')
        .set('Authorization', 'Bearer invalid-token')
        .send({ text: 'test', entities: ['Contact'] })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    it('should handle malformed requests', async () => {
      const response = await request(app)
        .post('/api/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid request body');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Make multiple requests quickly
      const requests = Array(11).fill(null).map(() =>
        request(app)
          .post('/api/search')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ text: 'test', entities: ['Contact'] })
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponse = responses.find(res => res.status === 429);

      expect(rateLimitedResponse).toBeDefined();
      expect(rateLimitedResponse?.body.message).toContain('Too many requests');
    });
  });
});
