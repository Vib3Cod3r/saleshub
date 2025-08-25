import { SearchQuery, SearchOptions, SearchResult, PerformanceMetrics } from '@/types/search';
import { redis } from '@/config/redis';

export interface QueryPerformance {
  queryHash: string;
  responseTime: number;
  resultCount: number;
  cacheHit: boolean;
  timestamp: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface PerformanceThresholds {
  slowQueryThreshold: number; // ms
  maxResultThreshold: number;
  cacheHitRateThreshold: number; // percentage
}

export class SearchPerformanceService {
  private readonly performancePrefix = 'search:perf:';
  private readonly thresholds: PerformanceThresholds;

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = {
      slowQueryThreshold: 1000, // 1 second
      maxResultThreshold: 1000,
      cacheHitRateThreshold: 80, // 80%
      ...thresholds
    };
  }

  /**
   * Record search performance metrics
   */
  async recordSearchPerformance(
    query: SearchQuery,
    options: SearchOptions,
    result: SearchResult,
    responseTime: number,
    cacheHit: boolean
  ): Promise<void> {
    try {
      const queryHash = this.hashQuery(query, options);
      const complexity = this.calculateQueryComplexity(query);
      
      const performance: QueryPerformance = {
        queryHash,
        responseTime,
        resultCount: result.pagination.total,
        cacheHit,
        timestamp: Date.now(),
        complexity
      };

      // Store performance data
      await this.storePerformanceData(performance);
      
      // Check for performance issues
      await this.checkPerformanceIssues(performance);
      
      // Update aggregated metrics
      await this.updateAggregatedMetrics(performance);
    } catch (error) {
      console.error('Performance recording error:', error);
    }
  }

  /**
   * Get performance metrics for a time period
   */
  async getPerformanceMetrics(
    startTime: number,
    endTime: number = Date.now()
  ): Promise<PerformanceMetrics> {
    try {
      const performanceData = await this.getPerformanceData(startTime, endTime);
      
      if (performanceData.length === 0) {
        return this.getEmptyMetrics();
      }

      const responseTimes = performanceData.map(p => p.responseTime);
      const sortedResponseTimes = responseTimes.sort((a, b) => a - b);
      
      const totalQueries = performanceData.length;
      const failedQueries = performanceData.filter(p => p.responseTime > this.thresholds.slowQueryThreshold).length;
      const cacheHits = performanceData.filter(p => p.cacheHit).length;
      const cacheHitRate = (cacheHits / totalQueries) * 100;

      return {
        p50ResponseTime: this.getPercentile(sortedResponseTimes, 50),
        p95ResponseTime: this.getPercentile(sortedResponseTimes, 95),
        p99ResponseTime: this.getPercentile(sortedResponseTimes, 99),
        errorRate: (failedQueries / totalQueries) * 100,
        throughput: totalQueries / ((endTime - startTime) / 1000), // queries per second
        responseTimes,
        totalQueries,
        failedQueries
      };
    } catch (error) {
      console.error('Performance metrics error:', error);
      return this.getEmptyMetrics();
    }
  }

  /**
   * Get slow queries
   */
  async getSlowQueries(limit: number = 10): Promise<QueryPerformance[]> {
    try {
      const slowQueries = await redis.zrevrangebyscore(
        `${this.performancePrefix}response-times`,
        '+inf',
        this.thresholds.slowQueryThreshold,
        'LIMIT',
        0,
        limit
      );

      const results = await Promise.all(slowQueries.map(hash => this.getQueryPerformance(hash)));
      return results.filter((result): result is QueryPerformance => result !== null);
    } catch (error) {
      console.error('Slow queries error:', error);
      return [];
    }
  }

  /**
   * Get query optimization suggestions
   */
  async getOptimizationSuggestions(): Promise<string[]> {
    try {
      const suggestions: string[] = [];
      const metrics = await this.getPerformanceMetrics(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours

      if (metrics.p95ResponseTime > this.thresholds.slowQueryThreshold) {
        suggestions.push('Consider adding database indexes for frequently searched fields');
      }

      // Calculate cache hit rate from the data
      const cacheHitRate = (metrics.totalQueries || 0) > 0 ? (((metrics.totalQueries || 0) - (metrics.failedQueries || 0)) / (metrics.totalQueries || 0)) * 100 : 0;
      if (cacheHitRate < this.thresholds.cacheHitRateThreshold) {
        suggestions.push('Cache hit rate is low. Consider increasing cache TTL or warming cache');
      }

      if (metrics.errorRate > 5) {
        suggestions.push('High error rate detected. Review search query patterns');
      }

      return suggestions;
    } catch (error) {
      console.error('Optimization suggestions error:', error);
      return [];
    }
  }

  /**
   * Monitor search performance in real-time
   */
  async monitorPerformance(): Promise<{
    currentLoad: number;
    averageResponseTime: number;
    cacheHitRate: number;
    activeQueries: number;
  }> {
    try {
      const [currentLoad, avgResponseTime, cacheHitRate, activeQueries] = await Promise.all([
        this.getCurrentLoad(),
        this.getAverageResponseTime(),
        this.getCurrentCacheHitRate(),
        this.getActiveQueries()
      ]);

      return {
        currentLoad,
        averageResponseTime: avgResponseTime,
        cacheHitRate,
        activeQueries
      };
    } catch (error) {
      console.error('Performance monitoring error:', error);
      return {
        currentLoad: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        activeQueries: 0
      };
    }
  }

  /**
   * Hash query for consistent identification
   */
  private hashQuery(query: SearchQuery, options: SearchOptions): string {
    const queryString = JSON.stringify({
      text: query.text,
      entities: query.entities?.sort(),
      filters: query.filters?.sort((a, b) => a.field.localeCompare(b.field)),
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: options.page,
      limit: options.limit
    });
    
    let hash = 0;
    for (let i = 0; i < queryString.length; i++) {
      const char = queryString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Calculate query complexity
   */
  private calculateQueryComplexity(query: SearchQuery): 'low' | 'medium' | 'high' {
    let complexity = 0;
    
    if (query.text && query.text.length > 10) complexity += 2;
    if (query.filters && query.filters.length > 5) complexity += 3;
    if (query.entities && query.entities.length > 3) complexity += 1;
    
    if (complexity <= 2) return 'low';
    if (complexity <= 5) return 'medium';
    return 'high';
  }

  /**
   * Store performance data
   */
  private async storePerformanceData(performance: QueryPerformance): Promise<void> {
    const key = `${this.performancePrefix}${performance.queryHash}`;
    const data = JSON.stringify(performance);
    
    await Promise.all([
      redis.setex(key, 86400, data), // Store for 24 hours
      redis.zadd(`${this.performancePrefix}response-times`, performance.responseTime, performance.queryHash),
      redis.zadd(`${this.performancePrefix}timestamps`, performance.timestamp, performance.queryHash)
    ]);
  }

  /**
   * Check for performance issues
   */
  private async checkPerformanceIssues(performance: QueryPerformance): Promise<void> {
    if (performance.responseTime > this.thresholds.slowQueryThreshold) {
      console.warn(`Slow query detected: ${performance.responseTime}ms for query ${performance.queryHash}`);
    }

    if (performance.resultCount > this.thresholds.maxResultThreshold) {
      console.warn(`Large result set: ${performance.resultCount} results for query ${performance.queryHash}`);
    }
  }

  /**
   * Update aggregated metrics
   */
  private async updateAggregatedMetrics(performance: QueryPerformance): Promise<void> {
    const now = Date.now();
    const hourKey = `${this.performancePrefix}hourly:${Math.floor(now / (60 * 60 * 1000))}`;
    
    await Promise.all([
      redis.hincrby(hourKey, 'totalQueries', 1),
      redis.hincrby(hourKey, 'totalResponseTime', performance.responseTime),
      redis.hincrby(hourKey, 'cacheHits', performance.cacheHit ? 1 : 0),
      redis.hincrby(hourKey, 'slowQueries', performance.responseTime > this.thresholds.slowQueryThreshold ? 1 : 0),
      redis.expire(hourKey, 86400) // Expire after 24 hours
    ]);
  }

  /**
   * Get performance data for time range
   */
  private async getPerformanceData(startTime: number, endTime: number): Promise<QueryPerformance[]> {
    const queryHashes = await redis.zrangebyscore(
      `${this.performancePrefix}timestamps`,
      startTime,
      endTime
    );

    const performanceData: QueryPerformance[] = [];
    
    for (const hash of queryHashes) {
      const data = await this.getQueryPerformance(hash);
      if (data) {
        performanceData.push(data);
      }
    }

    return performanceData;
  }

  /**
   * Get query performance by hash
   */
  private async getQueryPerformance(hash: string): Promise<QueryPerformance | null> {
    try {
      const data = await redis.get(`${this.performancePrefix}${hash}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Calculate percentile
   */
  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[index] || 0;
  }

  /**
   * Get current load
   */
  private async getCurrentLoad(): Promise<number> {
    try {
      const activeQueries = await redis.get(`${this.performancePrefix}active`);
      return parseInt(activeQueries || '0');
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get average response time
   */
  private async getAverageResponseTime(): Promise<number> {
    try {
      const now = Date.now();
      const hourKey = `${this.performancePrefix}hourly:${Math.floor(now / (60 * 60 * 1000))}`;
      
      const [totalQueries, totalResponseTime] = await Promise.all([
        redis.hget(hourKey, 'totalQueries') || '0',
        redis.hget(hourKey, 'totalResponseTime') || '0'
      ]);

      const queries = parseInt(totalQueries || '0');
      const responseTime = parseInt(totalResponseTime || '0');
      
      return queries > 0 ? responseTime / queries : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get current cache hit rate
   */
  private async getCurrentCacheHitRate(): Promise<number> {
    try {
      const now = Date.now();
      const hourKey = `${this.performancePrefix}hourly:${Math.floor(now / (60 * 60 * 1000))}`;
      
      const [totalQueries, cacheHits] = await Promise.all([
        redis.hget(hourKey, 'totalQueries') || '0',
        redis.hget(hourKey, 'cacheHits') || '0'
      ]);

      const queries = parseInt(totalQueries || '0');
      const hits = parseInt(cacheHits || '0');
      
      return queries > 0 ? (hits / queries) * 100 : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get active queries count
   */
  private async getActiveQueries(): Promise<number> {
    try {
      const active = await redis.get(`${this.performancePrefix}active`);
      return parseInt(active || '0');
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get empty metrics
   */
  private getEmptyMetrics(): PerformanceMetrics {
    return {
      p50ResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorRate: 0,
      throughput: 0,
      responseTimes: [],
      totalQueries: 0,
      failedQueries: 0
    };
  }
}

export const searchPerformanceService = new SearchPerformanceService();
