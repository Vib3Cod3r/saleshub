import { Request, Response } from 'express';
import { searchService } from '../services/search/SearchService';
import { logger } from '../utils/logger';
import { z } from 'zod';

// Validation schemas
const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  entityType: z.enum(['contacts', 'companies', 'deals', 'leads']).optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0)
});

const suggestionsQuerySchema = z.object({
  q: z.string().min(1, 'Query is required'),
  entityType: z.enum(['contacts', 'companies', 'deals', 'leads']).optional()
});

export class SearchController {
  async search(req: Request, res: Response) {
    try {
      const startTime = Date.now();
      
      // Validate request
      const validatedData = searchQuerySchema.parse(req.query);
      
      const { q: query, entityType, status, dateFrom, dateTo, limit, offset } = validatedData;
      
      // Build filters
      const filters: any = {};
      if (status) filters.status = status;
      if (dateFrom || dateTo) {
        filters.dateFrom = dateFrom;
        filters.dateTo = dateTo;
      }

      // Perform search
      const results = await searchService.searchEntities({
        query,
        entityType,
        filters,
        limit,
        offset
      });

      const duration = Date.now() - startTime;
      
      logger.info(`Search completed: "${query}" | Results: ${results.length} | Duration: ${duration}ms`);

      return res.json({
        success: true,
        data: {
          results,
          query,
          entityType,
          filters,
          pagination: {
            limit,
            offset,
            total: results.length
          },
          performance: {
            duration: `${duration}ms`
          }
        },
        message: `Found ${results.length} results for "${query}"`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Search validation error:', error.errors);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
          timestamp: new Date().toISOString()
        });
      }

      logger.error('Search controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to perform search',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getSuggestions(req: Request, res: Response) {
    try {
      const startTime = Date.now();
      
      // Validate request
      const validatedData = suggestionsQuerySchema.parse(req.query);
      const { q: query, entityType } = validatedData;

      // Get suggestions
      const suggestions = await searchService.getSearchSuggestions(query, entityType);

      const duration = Date.now() - startTime;
      
      logger.debug(`Search suggestions: "${query}" | Suggestions: ${suggestions.length} | Duration: ${duration}ms`);

      return res.json({
        success: true,
        data: {
          suggestions,
          query,
          entityType
        },
        message: `Found ${suggestions.length} suggestions`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Suggestions validation error:', error.errors);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
          timestamp: new Date().toISOString()
        });
      }

      logger.error('Suggestions controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get suggestions',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getAnalytics(req: Request, res: Response) {
    try {
      const startTime = Date.now();
      
      const timeRange = req.query.timeRange as '1h' | '24h' | '7d' | '30d' || '24h';
      
      // Validate timeRange
      if (!['1h', '24h', '7d', '30d'].includes(timeRange)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid time range',
          message: 'Time range must be one of: 1h, 24h, 7d, 30d',
          timestamp: new Date().toISOString()
        });
      }

      // Get analytics
      const analytics = await searchService.getSearchAnalytics(timeRange);

      const duration = Date.now() - startTime;
      
      logger.info(`Search analytics retrieved | TimeRange: ${timeRange} | Duration: ${duration}ms`);

      return res.json({
        success: true,
        data: {
          analytics,
          timeRange
        },
        message: 'Search analytics retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Search analytics controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get search analytics',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getHealth(req: Request, res: Response) {
    try {
      const startTime = Date.now();
      
      // Test search functionality
      const testResults = await searchService.searchEntities({
        query: 'test',
        limit: 1
      });

      const duration = Date.now() - startTime;
      
      return res.json({
        success: true,
        data: {
          status: 'healthy',
          searchTest: {
            success: true,
            duration: `${duration}ms`
          },
          timestamp: new Date().toISOString()
        },
        message: 'Search service is healthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Search health check error:', error);
      return res.status(503).json({
        success: false,
        data: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        message: 'Search service is unhealthy',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const searchController = new SearchController();
