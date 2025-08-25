import { SearchService } from './SearchService';
import { cacheService } from '../cache';
import { logger } from '../../utils/logger';
import { WebSocketServer } from '../../config/websocket';

export interface SearchSession {
  id: string;
  participants: string[];
  query: string;
  filters: any;
  results: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchAnalytics {
  query: string;
  userId: string;
  sessionId?: string;
  entityType?: string;
  filters?: any;
  resultCount: number;
  searchTime: number;
  timestamp: Date;
}

export interface LiveSearchRequest {
  query: string;
  entityType?: string;
  filters?: any;
  sessionId?: string;
  userId: string;
}

export class RealTimeSearchService {
  private searchService: SearchService;
  private wsServer: WebSocketServer;
  private activeSessions: Map<string, SearchSession> = new Map();
  private searchDebounceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(searchService: SearchService, wsServer: WebSocketServer) {
    this.searchService = searchService;
    this.wsServer = wsServer;
  }

  /**
   * Perform live search with debouncing
   */
  async performLiveSearch(request: LiveSearchRequest): Promise<any[]> {
    const { query, entityType, filters, sessionId, userId } = request;
    
    // Clear existing debounce timer for this session
    if (sessionId && this.searchDebounceTimers.has(sessionId)) {
      clearTimeout(this.searchDebounceTimers.get(sessionId)!);
    }

    // Set up debounced search
    return new Promise((resolve) => {
      const timer = setTimeout(async () => {
        try {
          const startTime = Date.now();
          
          // Perform the actual search
          const results = await this.searchService.searchEntities({
            query,
            entityType,
            filters,
            limit: 20,
            offset: 0
          });

          const searchTime = Date.now() - startTime;

          // Track search analytics
          await this.trackSearchAnalytics({
            query,
            userId,
            sessionId,
            entityType,
            filters,
            resultCount: results.length,
            searchTime,
            timestamp: new Date()
          });

          // Broadcast results to session participants
          if (sessionId) {
            await this.broadcastSearchResults(sessionId, results, query);
          }

          // Update session with new results
          if (sessionId) {
            await this.updateSearchSession(sessionId, query, results);
          }

          resolve(results);
        } catch (error) {
          logger.error('Live search error:', error);
          resolve([]);
        }
      }, 300); // 300ms debounce

      if (sessionId) {
        this.searchDebounceTimers.set(sessionId, timer);
      }
    });
  }

  /**
   * Create collaborative search session
   */
  async createSearchSession(participants: string[], initialQuery?: string): Promise<SearchSession> {
    const sessionId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: SearchSession = {
      id: sessionId,
      participants,
      query: initialQuery || '',
      filters: {},
      results: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store session in cache
    await cacheService.set(`search_session:${sessionId}`, session, { 
      ttl: 3600, // 1 hour
      tags: ['search_sessions', `session:${sessionId}`]
    });

    this.activeSessions.set(sessionId, session);

    // Notify participants about new session
    await this.notifySessionParticipants(sessionId, 'session_created', { session });

    logger.info(`Search session created: ${sessionId} with ${participants.length} participants`);
    return session;
  }

  /**
   * Join existing search session
   */
  async joinSearchSession(sessionId: string, userId: string): Promise<SearchSession | null> {
    const session = await this.getSearchSession(sessionId);
    
    if (!session) {
      return null;
    }

    if (!session.participants.includes(userId)) {
      session.participants.push(userId);
      session.updatedAt = new Date();
      
      // Update session in cache
      await cacheService.set(`search_session:${sessionId}`, session, { 
        ttl: 3600,
        tags: ['search_sessions', `session:${sessionId}`]
      });

      // Notify other participants
      await this.notifySessionParticipants(sessionId, 'participant_joined', { 
        userId, 
        participants: session.participants 
      });
    }

    return session;
  }

  /**
   * Update search session with new query and results
   */
  async updateSearchSession(sessionId: string, query: string, results: any[]): Promise<void> {
    const session = await this.getSearchSession(sessionId);
    
    if (!session) {
      return;
    }

    session.query = query;
    session.results = results;
    session.updatedAt = new Date();

    // Update session in cache
    await cacheService.set(`search_session:${sessionId}`, session, { 
      ttl: 3600,
      tags: ['search_sessions', `session:${sessionId}`]
    });

    // Notify participants about session update
    await this.notifySessionParticipants(sessionId, 'session_updated', { 
      query, 
      resultCount: results.length 
    });
  }

  /**
   * Get search session by ID
   */
  async getSearchSession(sessionId: string): Promise<SearchSession | null> {
    // Try cache first
    const cached = await cacheService.get<SearchSession>(`search_session:${sessionId}`);
    if (cached) {
      return cached;
    }

    // Fall back to memory
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Get user's active search sessions
   */
  async getUserSearchSessions(userId: string): Promise<SearchSession[]> {
    const sessions: SearchSession[] = [];
    
    // Get all active sessions from cache
    // Note: Redis keys pattern matching would be implemented here
    // For now, we'll use the in-memory sessions
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.participants.includes(userId)) {
        sessions.push(session);
      }
    }
    
    return sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Track search analytics
   */
  async trackSearchAnalytics(analytics: SearchAnalytics): Promise<void> {
    try {
      // Store analytics in cache for real-time processing
      const analyticsKey = `search_analytics:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await cacheService.set(analyticsKey, analytics, { 
        ttl: 86400, // 24 hours
        tags: ['search_analytics', `user:${analytics.userId}`]
      });

      // Aggregate analytics for dashboard
      await this.aggregateSearchAnalytics(analytics);

      logger.debug('Search analytics tracked:', {
        query: analytics.query,
        userId: analytics.userId,
        resultCount: analytics.resultCount,
        searchTime: analytics.searchTime
      });
    } catch (error) {
      logger.error('Failed to track search analytics:', error);
    }
  }

  /**
   * Aggregate search analytics for dashboard
   */
  private async aggregateSearchAnalytics(analytics: SearchAnalytics): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `search_daily_stats:${today}`;
    
    // Get existing daily stats
    const dailyStats = await cacheService.get<any>(dailyKey) || {
      totalSearches: 0,
      totalResults: 0,
      averageSearchTime: 0,
      popularQueries: {},
      userSearches: {}
    };

    // Update stats
    dailyStats.totalSearches++;
    dailyStats.totalResults += analytics.resultCount;
    dailyStats.averageSearchTime = (dailyStats.averageSearchTime + analytics.searchTime) / 2;

    // Track popular queries
    if (!dailyStats.popularQueries[analytics.query]) {
      dailyStats.popularQueries[analytics.query] = 0;
    }
    dailyStats.popularQueries[analytics.query]++;

    // Track user searches
    if (!dailyStats.userSearches[analytics.userId]) {
      dailyStats.userSearches[analytics.userId] = 0;
    }
    dailyStats.userSearches[analytics.userId]++;

    // Store updated stats
    await cacheService.set(dailyKey, dailyStats, { 
      ttl: 604800, // 7 days
      tags: ['search_stats', 'daily']
    });
  }

  /**
   * Broadcast search results to session participants
   */
  private async broadcastSearchResults(sessionId: string, results: any[], query: string): Promise<void> {
    const session = await this.getSearchSession(sessionId);
    if (!session) return;

    const eventData = {
      sessionId,
      query,
      results,
      resultCount: results.length,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all session participants
    for (const participantId of session.participants) {
      this.wsServer.emitToUser(participantId, 'search_results', eventData);
    }

    logger.debug(`Search results broadcasted to ${session.participants.length} participants`);
  }

  /**
   * Notify session participants about session events
   */
  private async notifySessionParticipants(sessionId: string, event: string, data: any): Promise<void> {
    const session = await this.getSearchSession(sessionId);
    if (!session) return;

    const eventData = {
      sessionId,
      event,
      data,
      timestamp: new Date().toISOString()
    };

    // Notify all session participants
    for (const participantId of session.participants) {
      this.wsServer.emitToUser(participantId, 'search_session_event', eventData);
    }
  }

  /**
   * Get search analytics for dashboard
   */
  async getSearchAnalytics(timeRange: '1h' | '24h' | '7d' = '24h'): Promise<any> {
    const now = new Date();
    let startTime: Date;

    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get daily stats for the time range
    const dailyStats = [];
    const currentDate = new Date(startTime);
    
    while (currentDate <= now) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const stats = await cacheService.get<any>(`search_daily_stats:${dateKey}`);
      if (stats) {
        dailyStats.push({ date: dateKey, ...stats });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate stats
    const aggregated = dailyStats.reduce((acc, stats) => {
      acc.totalSearches += stats.totalSearches;
      acc.totalResults += stats.totalResults;
      acc.averageSearchTime = (acc.averageSearchTime + stats.averageSearchTime) / 2;
      
      // Merge popular queries
      Object.entries(stats.popularQueries).forEach(([query, count]) => {
        acc.popularQueries[query] = (acc.popularQueries[query] || 0) + (count as number);
      });

      return acc;
    }, {
      totalSearches: 0,
      totalResults: 0,
      averageSearchTime: 0,
      popularQueries: {},
      timeRange
    });

    // Sort popular queries
    aggregated.popularQueries = Object.entries(aggregated.popularQueries)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .reduce((acc, [query, count]) => {
        acc[query] = count;
        return acc;
      }, {} as any);

    return aggregated;
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const expiredSessions: string[] = [];

    // Check all active sessions
    for (const [sessionId, session] of this.activeSessions.entries()) {
      const sessionAge = now.getTime() - session.updatedAt.getTime();
      if (sessionAge > 3600000) { // 1 hour
        expiredSessions.push(sessionId);
      }
    }

    // Remove expired sessions
    for (const sessionId of expiredSessions) {
      this.activeSessions.delete(sessionId);
      await cacheService.delete(`search_session:${sessionId}`);
      logger.info(`Expired search session cleaned up: ${sessionId}`);
    }
  }
}
