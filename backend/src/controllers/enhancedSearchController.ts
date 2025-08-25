import { Request, Response } from 'express';
import { z } from 'zod';
import { RealTimeSearchService, SearchSession } from '../services/search/RealTimeSearchService';
import { SearchService } from '../services/search/SearchService';
import { WebSocketServer } from '../config/websocket';
import { logger } from '../utils/logger';

// Validation schemas
const liveSearchSchema = z.object({
  query: z.string().min(1),
  entityType: z.enum(['contacts', 'companies', 'deals', 'leads']).optional(),
  filters: z.record(z.any()).optional(),
  sessionId: z.string().optional()
});

const createSessionSchema = z.object({
  participants: z.array(z.string()).min(1),
  initialQuery: z.string().optional()
});

const joinSessionSchema = z.object({
  sessionId: z.string().min(1)
});

export class EnhancedSearchController {
  private realTimeSearchService: RealTimeSearchService;
  private searchService: SearchService;

  constructor(searchService: SearchService, wsServer: WebSocketServer) {
    this.searchService = searchService;
    this.realTimeSearchService = new RealTimeSearchService(searchService, wsServer);
  }

  /**
   * Perform live search with real-time updates
   */
  async performLiveSearch(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const validatedData = liveSearchSchema.parse(req.body);
      const { query, entityType, filters, sessionId } = validatedData;

      const startTime = Date.now();

      // Perform live search
      const results = await this.realTimeSearchService.performLiveSearch({
        query,
        entityType,
        filters,
        sessionId,
        userId
      });

      const duration = Date.now() - startTime;

      return res.json({
        success: true,
        data: {
          results,
          query,
          entityType,
          filters,
          sessionId,
          performance: {
            duration: `${duration}ms`
          }
        },
        message: `Found ${results.length} results for "${query}"`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Live search validation error:', error.errors);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
          timestamp: new Date().toISOString()
        });
      }

      logger.error('Live search error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to perform live search',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create collaborative search session
   */
  async createSearchSession(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const validatedData = createSessionSchema.parse(req.body);
      const { participants, initialQuery } = validatedData;

      // Ensure the current user is included in participants
      if (!participants.includes(userId)) {
        participants.push(userId);
      }

      // Create search session
      const session = await this.realTimeSearchService.createSearchSession(participants, initialQuery);

      return res.json({
        success: true,
        data: {
          session,
          participants: session.participants
        },
        message: 'Search session created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Create session validation error:', error.errors);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
          timestamp: new Date().toISOString()
        });
      }

      logger.error('Create search session error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create search session',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Join existing search session
   */
  async joinSearchSession(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const validatedData = joinSessionSchema.parse(req.body);
      const { sessionId } = validatedData;

      // Join search session
      const session = await this.realTimeSearchService.joinSearchSession(sessionId, userId);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Search session not found',
          timestamp: new Date().toISOString()
        });
      }

      return res.json({
        success: true,
        data: {
          session,
          participants: session.participants
        },
        message: 'Joined search session successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Join session validation error:', error.errors);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
          timestamp: new Date().toISOString()
        });
      }

      logger.error('Join search session error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to join search session',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get user's active search sessions
   */
  async getUserSearchSessions(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      // Get user's search sessions
      const sessions = await this.realTimeSearchService.getUserSearchSessions(userId);

      return res.json({
        success: true,
        data: {
          sessions,
          count: sessions.length
        },
        message: `Found ${sessions.length} active search sessions`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get user search sessions error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get search sessions',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get search session by ID
   */
  async getSearchSession(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const { sessionId } = req.params;

      // Get search session
      const session = await this.realTimeSearchService.getSearchSession(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Search session not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user is a participant
      if (!session.participants.includes(userId)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Access denied to this search session',
          timestamp: new Date().toISOString()
        });
      }

      return res.json({
        success: true,
        data: {
          session,
          participants: session.participants
        },
        message: 'Search session retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get search session error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get search session',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const timeRange = (req.query.timeRange as '1h' | '24h' | '7d') || '24h';

      // Validate timeRange
      if (!['1h', '24h', '7d'].includes(timeRange)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid time range',
          message: 'Time range must be one of: 1h, 24h, 7d',
          timestamp: new Date().toISOString()
        });
      }

      const startTime = Date.now();

      // Get search analytics
      const analytics = await this.realTimeSearchService.getSearchAnalytics(timeRange);

      const duration = Date.now() - startTime;

      return res.json({
        success: true,
        data: {
          analytics,
          timeRange,
          performance: {
            duration: `${duration}ms`
          }
        },
        message: 'Search analytics retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get search analytics error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get search analytics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Clean up expired search sessions
   */
  async cleanupExpiredSessions(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      // Clean up expired sessions
      await this.realTimeSearchService.cleanupExpiredSessions();

      return res.json({
        success: true,
        data: {
          message: 'Expired sessions cleaned up successfully'
        },
        message: 'Cleanup completed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Cleanup expired sessions error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to cleanup expired sessions',
        timestamp: new Date().toISOString()
      });
    }
  }
}
