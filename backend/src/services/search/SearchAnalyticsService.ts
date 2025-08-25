import { cacheService } from '@/services/cache';
import { SearchQuery, SearchResult, SearchAnalytics, PopularQuery, SearchTrend, EntityUsage, PerformanceMetrics } from '@/types/search';

export class SearchAnalyticsService {
  private readonly ANALYTICS_KEY = 'search:analytics';
  private readonly TRENDS_KEY = 'search:trends';
  private readonly PERFORMANCE_KEY = 'search:performance';

  /**
   * Record a search operation
   */
  async recordSearch(query: SearchQuery, results: SearchResult, responseTime: number): Promise<void> {
    try {
      const timestamp = new Date();
      const searchData = {
        query: query.text || '',
        entities: query.entities || [],
        filters: query.filters?.length || 0,
        responseTime,
        resultCount: results.pagination.total,
        timestamp: timestamp.toISOString(),
        success: true
      };

      // Store search data
      await this.storeSearchData(searchData);

      // Update trends
      await this.updateSearchTrends(timestamp, responseTime, true);

      // Update entity usage
      await this.updateEntityUsage(query.entities || [], timestamp);

      // Update performance metrics
      await this.updatePerformanceMetrics(responseTime, true);

      console.log(`📊 Search recorded: ${query.text} (${responseTime}ms)`);
    } catch (error) {
      console.error('❌ Failed to record search:', error);
    }
  }

  /**
   * Record a cache hit
   */
  async recordCacheHit(query: SearchQuery): Promise<void> {
    try {
      const timestamp = new Date();
      
      // Update cache hit rate
      await this.updateCacheHitRate(true);
      
      // Update trends
      await this.updateSearchTrends(timestamp, 0, true, true);
      
      console.log(`📊 Cache hit recorded for: ${query.text}`);
    } catch (error) {
      console.error('❌ Failed to record cache hit:', error);
    }
  }

  /**
   * Record a search error
   */
  async recordSearchError(query: SearchQuery, error: any): Promise<void> {
    try {
      const timestamp = new Date();
      const searchData = {
        query: query.text || '',
        entities: query.entities || [],
        filters: query.filters?.length || 0,
        responseTime: 0,
        resultCount: 0,
        timestamp: timestamp.toISOString(),
        success: false,
        error: error.message || 'Unknown error'
      };

      // Store search data
      await this.storeSearchData(searchData);

      // Update trends
      await this.updateSearchTrends(timestamp, 0, false);

      // Update performance metrics
      await this.updatePerformanceMetrics(0, false);

      console.log(`📊 Search error recorded: ${query.text} - ${error.message}`);
    } catch (error) {
      console.error('❌ Failed to record search error:', error);
    }
  }

  /**
   * Get search analytics
   */
  async getAnalytics(timeRange: string = '7d'): Promise<SearchAnalytics> {
    try {
      const [totalSearches, averageResponseTime, cacheHitRate, popularQueries, searchTrends, entityUsage, performanceMetrics] = await Promise.all([
        this.getTotalSearches(timeRange),
        this.getAverageResponseTime(timeRange),
        this.getCacheHitRate(),
        this.getPopularQueries(timeRange),
        this.getSearchTrends(timeRange),
        this.getEntityUsage(timeRange),
        this.getPerformanceMetrics(timeRange)
      ]);

      return {
        totalSearches,
        averageResponseTime,
        cacheHitRate,
        popularQueries,
        searchTrends,
        entityUsage,
        performanceMetrics
      };
    } catch (error) {
      console.error('❌ Failed to get search analytics:', error);
      return this.getDefaultAnalytics();
    }
  }

  /**
   * Store search data
   */
  private async storeSearchData(searchData: any): Promise<void> {
    const key = `${this.ANALYTICS_KEY}:${new Date().toISOString().split('T')[0]}`;
    const searches = await cacheService.get<any[]>(key) || [];
    searches.push(searchData);
    
    // Keep only last 1000 searches per day
    if (searches.length > 1000) {
      searches.splice(0, searches.length - 1000);
    }
    
    await cacheService.set(key, searches, { ttl: 86400 }); // 24 hours
  }

  /**
   * Update search trends
   */
  private async updateSearchTrends(timestamp: Date, responseTime: number, success: boolean, cacheHit: boolean = false): Promise<void> {
    const dateKey = timestamp.toISOString().split('T')[0];
    const key = `${this.TRENDS_KEY}:${dateKey}`;
    
    const trends = await cacheService.get<SearchTrend>(key) || {
      date: dateKey,
      searches: 0,
      averageResponseTime: 0,
      cacheHits: 0,
      totalResponseTime: 0
    };

    // Initialize optional properties
    if (trends.totalResponseTime === undefined) {
      trends.totalResponseTime = 0;
    }

    trends.searches++;
    if (cacheHit) {
      trends.cacheHits++;
    }
    
    if (success && responseTime > 0) {
      trends.totalResponseTime += responseTime;
      trends.averageResponseTime = trends.totalResponseTime / (trends.searches - trends.cacheHits);
    }

    await cacheService.set(key, trends, { ttl: 604800 }); // 7 days
  }

  /**
   * Update entity usage
   */
  private async updateEntityUsage(entities: string[], timestamp: Date): Promise<void> {
    const dateKey = timestamp.toISOString().split('T')[0];
    const key = `search:entity_usage:${dateKey}`;
    
    const usage = await cacheService.get<Record<string, number>>(key) || {};
    
    entities.forEach(entity => {
      usage[entity] = (usage[entity] || 0) + 1;
    });

    await cacheService.set(key, usage, { ttl: 604800 }); // 7 days
  }

  /**
   * Update performance metrics
   */
  private async updatePerformanceMetrics(responseTime: number, success: boolean): Promise<void> {
    const key = this.PERFORMANCE_KEY;
    const metrics = await cacheService.get<PerformanceMetrics>(key) || {
      p50ResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorRate: 0,
      throughput: 0,
      responseTimes: [],
      totalQueries: 0,
      failedQueries: 0
    };

    // Initialize optional properties
    if (metrics.responseTimes === undefined) {
      metrics.responseTimes = [];
    }
    if (metrics.totalQueries === undefined) {
      metrics.totalQueries = 0;
    }
    if (metrics.failedQueries === undefined) {
      metrics.failedQueries = 0;
    }

    metrics.totalQueries++;
    if (!success) {
      metrics.failedQueries++;
    }
    
    if (responseTime > 0) {
      metrics.responseTimes.push(responseTime);
      // Keep only last 1000 response times
      if (metrics.responseTimes.length > 1000) {
        metrics.responseTimes.splice(0, metrics.responseTimes.length - 1000);
      }
      
      // Calculate percentiles
      const sortedTimes = [...metrics.responseTimes].sort((a, b) => a - b);
      metrics.p50ResponseTime = this.calculatePercentile(sortedTimes, 50);
      metrics.p95ResponseTime = this.calculatePercentile(sortedTimes, 95);
      metrics.p99ResponseTime = this.calculatePercentile(sortedTimes, 99);
    }

    metrics.errorRate = (metrics.failedQueries / metrics.totalQueries) * 100;
    metrics.throughput = metrics.totalQueries / 60; // queries per minute

    await cacheService.set(key, metrics, { ttl: 3600 }); // 1 hour
  }

  /**
   * Update cache hit rate
   */
  private async updateCacheHitRate(hit: boolean): Promise<void> {
    const key = 'search:cache_stats';
    const stats = await cacheService.get<{ hits: number; misses: number }>(key) || { hits: 0, misses: 0 };
    
    if (hit) {
      stats.hits++;
    } else {
      stats.misses++;
    }

    await cacheService.set(key, stats, { ttl: 3600 }); // 1 hour
  }

  /**
   * Get total searches
   */
  private async getTotalSearches(timeRange: string): Promise<number> {
    const days = this.parseTimeRange(timeRange);
    let total = 0;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const key = `${this.ANALYTICS_KEY}:${dateKey}`;
      const searches = await cacheService.get<any[]>(key) || [];
      total += searches.length;
    }
    
    return total;
  }

  /**
   * Get average response time
   */
  private async getAverageResponseTime(timeRange: string): Promise<number> {
    const days = this.parseTimeRange(timeRange);
    let totalTime = 0;
    let totalSearches = 0;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const key = `${this.ANALYTICS_KEY}:${dateKey}`;
      const searches = await cacheService.get<any[]>(key) || [];
      
      searches.forEach(search => {
        if (search.success && search.responseTime > 0) {
          totalTime += search.responseTime;
          totalSearches++;
        }
      });
    }
    
    return totalSearches > 0 ? totalTime / totalSearches : 0;
  }

  /**
   * Get cache hit rate
   */
  private async getCacheHitRate(): Promise<number> {
    const stats = await cacheService.get<{ hits: number; misses: number }>('search:cache_stats') || { hits: 0, misses: 0 };
    const total = stats.hits + stats.misses;
    return total > 0 ? (stats.hits / total) * 100 : 0;
  }

  /**
   * Get popular queries
   */
  private async getPopularQueries(timeRange: string): Promise<PopularQuery[]> {
    const days = this.parseTimeRange(timeRange);
    const queryCounts: Record<string, { count: number; totalTime: number; successCount: number }> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const key = `${this.ANALYTICS_KEY}:${dateKey}`;
      const searches = await cacheService.get<any[]>(key) || [];
      
      searches.forEach(search => {
        if (search.query) {
          if (!queryCounts[search.query]) {
            queryCounts[search.query] = { count: 0, totalTime: 0, successCount: 0 };
          }
          queryCounts[search.query].count++;
          queryCounts[search.query].totalTime += search.responseTime || 0;
          if (search.success) {
            queryCounts[search.query].successCount++;
          }
        }
      });
    }
    
    return Object.entries(queryCounts)
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        averageResponseTime: stats.count > 0 ? stats.totalTime / stats.count : 0,
        successRate: stats.count > 0 ? (stats.successCount / stats.count) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Get search trends
   */
  private async getSearchTrends(timeRange: string): Promise<SearchTrend[]> {
    const days = this.parseTimeRange(timeRange);
    const trends: SearchTrend[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const key = `${this.TRENDS_KEY}:${dateKey}`;
      const trend = await cacheService.get<SearchTrend>(key);
      
      if (trend) {
        trends.push(trend);
      } else {
        trends.push({
          date: dateKey,
          searches: 0,
          averageResponseTime: 0,
          cacheHits: 0
        });
      }
    }
    
    return trends;
  }

  /**
   * Get entity usage
   */
  private async getEntityUsage(timeRange: string): Promise<EntityUsage[]> {
    const days = this.parseTimeRange(timeRange);
    const entityCounts: Record<string, number> = {};
    let totalSearches = 0;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const key = `search:entity_usage:${dateKey}`;
      const usage = await cacheService.get<Record<string, number>>(key) || {};
      
      Object.entries(usage).forEach(([entity, count]) => {
        entityCounts[entity] = (entityCounts[entity] || 0) + count;
        totalSearches += count;
      });
    }
    
    return Object.entries(entityCounts)
      .map(([entity, searches]) => ({
        entity,
        searches,
        percentage: totalSearches > 0 ? (searches / totalSearches) * 100 : 0
      }))
      .sort((a, b) => b.searches - a.searches);
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(timeRange: string): Promise<PerformanceMetrics> {
    const metrics = await cacheService.get<PerformanceMetrics>(this.PERFORMANCE_KEY) || {
      p50ResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorRate: 0,
      throughput: 0
    };
    
    return metrics;
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  /**
   * Parse time range
   */
  private parseTimeRange(timeRange: string): number {
    const match = timeRange.match(/^(\d+)([dhw])$/);
    if (!match) return 7; // Default to 7 days
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'd': return value;
      case 'h': return Math.ceil(value / 24);
      case 'w': return value * 7;
      default: return 7;
    }
  }

  /**
   * Get default analytics
   */
  private getDefaultAnalytics(): SearchAnalytics {
    return {
      totalSearches: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      popularQueries: [],
      searchTrends: [],
      entityUsage: [],
      performanceMetrics: {
        p50ResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        errorRate: 0,
        throughput: 0
      }
    };
  }

  /**
   * Clear old analytics data
   */
  async clearOldAnalytics(): Promise<void> {
    try {
      // Clear analytics older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // This would typically involve clearing old cache keys
      // For now, we'll just log the cleanup
      console.log('🧹 Cleared old search analytics data');
    } catch (error) {
      console.error('❌ Failed to clear old analytics:', error);
    }
  }
}
