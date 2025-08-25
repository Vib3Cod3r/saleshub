import { SearchAnalytics, PerformanceMetrics, PopularQuery, SearchTrend } from '@/types/search';
import { SearchAnalyticsService } from './SearchAnalyticsService';
import { searchPerformanceService } from './SearchPerformanceService';
import { searchCacheService } from './SearchCacheService';
import { fuzzySearchService } from './FuzzySearchService';
import { advancedFilterService } from './AdvancedFilterService';

export interface DashboardMetrics {
  overview: {
    totalSearches: number;
    averageResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
    activeUsers: number;
  };
  performance: {
    p50ResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughput: number;
    slowQueries: number;
  };
  search: {
    popularQueries: PopularQuery[];
    searchTrends: SearchTrend[];
    entityUsage: Array<{ entity: string; searches: number; percentage: number }>;
    fuzzySearchUsage: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    size: string;
    evictions: number;
  };
  filters: {
    totalFilters: number;
    publicFilters: number;
    averageUsage: number;
    mostUsedFilter?: string;
  };
  system: {
    uptime: number;
    lastOptimization: Date;
    indexHealth: string;
    suggestions: string[];
  };
}

export interface DashboardConfig {
  refreshInterval: number;
  retentionDays: number;
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    cacheHitRate: number;
  };
}

export class SearchDashboardService {
  private readonly config: DashboardConfig;
  private lastRefresh: number = 0;
  private cachedMetrics: DashboardMetrics | null = null;

  constructor(config: Partial<DashboardConfig> = {}) {
    this.config = {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      retentionDays: 30,
      alertThresholds: {
        responseTime: 1000, // 1 second
        errorRate: 5, // 5%
        cacheHitRate: 80 // 80%
      },
      ...config
    };
  }

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(forceRefresh: boolean = false): Promise<DashboardMetrics> {
    const now = Date.now();
    
    // Return cached metrics if within refresh interval
    if (!forceRefresh && this.cachedMetrics && (now - this.lastRefresh) < this.config.refreshInterval) {
      return this.cachedMetrics;
    }

    const metrics = await this.buildDashboardMetrics();
    
    this.cachedMetrics = metrics;
    this.lastRefresh = now;
    
    return metrics;
  }

  /**
   * Build comprehensive dashboard metrics
   */
  private async buildDashboardMetrics(): Promise<DashboardMetrics> {
    const [
      analytics,
      performanceMetrics,
      cacheStats,
      fuzzyStats,
      filterStats
    ] = await Promise.all([
      new SearchAnalyticsService().getAnalytics('7d'),
      searchPerformanceService.getPerformanceMetrics(Date.now() - 24 * 60 * 60 * 1000),
      searchCacheService.getStats(),
      fuzzySearchService.getStats(),
      advancedFilterService.getStats()
    ]);

    const monitoring = await searchPerformanceService.monitorPerformance();
    const suggestions = await searchPerformanceService.getOptimizationSuggestions();

    return {
      overview: {
        totalSearches: analytics.totalSearches,
        averageResponseTime: analytics.averageResponseTime,
        cacheHitRate: analytics.cacheHitRate,
        errorRate: performanceMetrics.errorRate,
        activeUsers: monitoring.activeQueries
      },
      performance: {
        p50ResponseTime: performanceMetrics.p50ResponseTime,
        p95ResponseTime: performanceMetrics.p95ResponseTime,
        p99ResponseTime: performanceMetrics.p99ResponseTime,
        throughput: performanceMetrics.throughput,
        slowQueries: performanceMetrics.failedQueries || 0
      },
      search: {
        popularQueries: analytics.popularQueries,
        searchTrends: analytics.searchTrends,
        entityUsage: analytics.entityUsage,
        fuzzySearchUsage: fuzzyStats.phoneticCacheSize
      },
      cache: {
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        hitRate: cacheStats.hitRate,
        size: `${cacheStats.size} keys`,
        evictions: 0 // Would need Redis info for this
      },
      filters: {
        totalFilters: filterStats.totalFilters,
        publicFilters: filterStats.publicFilters,
        averageUsage: filterStats.averageUsage,
        mostUsedFilter: filterStats.mostUsedFilter
      },
      system: {
        uptime: process.uptime() * 1000, // Convert to milliseconds
        lastOptimization: new Date(),
        indexHealth: 'healthy',
        suggestions
      }
    };
  }

  /**
   * Get real-time search monitoring
   */
  async getRealTimeMonitoring(): Promise<{
    currentLoad: number;
    averageResponseTime: number;
    cacheHitRate: number;
    activeQueries: number;
    recentErrors: number;
  }> {
    const monitoring = await searchPerformanceService.monitorPerformance();
    const cacheStats = await searchCacheService.getStats();
    
    return {
      currentLoad: monitoring.currentLoad,
      averageResponseTime: monitoring.averageResponseTime,
      cacheHitRate: monitoring.cacheHitRate,
      activeQueries: monitoring.activeQueries,
      recentErrors: 0 // Would need error tracking service
    };
  }

  /**
   * Get search health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  }> {
    const metrics = await this.getDashboardMetrics();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check response time
    if (metrics.performance.p95ResponseTime > this.config.alertThresholds.responseTime) {
      issues.push(`High response time: ${metrics.performance.p95ResponseTime}ms`);
      recommendations.push('Consider adding database indexes or optimizing queries');
    }

    // Check error rate
    if (metrics.overview.errorRate > this.config.alertThresholds.errorRate) {
      issues.push(`High error rate: ${metrics.overview.errorRate}%`);
      recommendations.push('Review error logs and fix underlying issues');
    }

    // Check cache hit rate
    if (metrics.overview.cacheHitRate < this.config.alertThresholds.cacheHitRate) {
      issues.push(`Low cache hit rate: ${metrics.overview.cacheHitRate}%`);
      recommendations.push('Consider increasing cache TTL or warming cache');
    }

    // Determine overall status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 2) {
      status = 'critical';
    } else if (issues.length > 0) {
      status = 'warning';
    }

    return {
      status,
      issues,
      recommendations
    };
  }

  /**
   * Get search trends analysis
   */
  async getSearchTrendsAnalysis(days: number = 7): Promise<{
    trends: SearchTrend[];
    insights: string[];
    predictions: Array<{ metric: string; value: number; confidence: number }>;
  }> {
    const analytics = await new SearchAnalyticsService().getAnalytics(`${days}d`);
    const insights: string[] = [];
    const predictions: Array<{ metric: string; value: number; confidence: number }> = [];

    // Analyze trends
    if (analytics.searchTrends.length > 1) {
      const recentTrends = analytics.searchTrends.slice(-3);
      const avgSearches = recentTrends.reduce((sum: number, trend: SearchTrend) => sum + trend.searches, 0) / recentTrends.length;
      
      if (avgSearches > 100) {
        insights.push('High search activity detected');
      } else if (avgSearches < 10) {
        insights.push('Low search activity - consider promoting search features');
      }

      // Simple prediction (linear trend)
      if (recentTrends.length >= 2) {
        const growth = (recentTrends[recentTrends.length - 1].searches - recentTrends[0].searches) / recentTrends.length;
        const predictedSearches = recentTrends[recentTrends.length - 1].searches + growth;
        
        predictions.push({
          metric: 'Daily Searches',
          value: Math.max(0, predictedSearches),
          confidence: 0.7
        });
      }
    }

    return {
      trends: analytics.searchTrends,
      insights,
      predictions
    };
  }

  /**
   * Get performance recommendations
   */
  async getPerformanceRecommendations(): Promise<Array<{
    category: 'cache' | 'index' | 'query' | 'system';
    priority: 'low' | 'medium' | 'high';
    recommendation: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }>> {
    const metrics = await this.getDashboardMetrics();
    const recommendations: Array<{
      category: 'cache' | 'index' | 'query' | 'system';
      priority: 'low' | 'medium' | 'high';
      recommendation: string;
      impact: string;
      effort: 'low' | 'medium' | 'high';
    }> = [];

    // Cache recommendations
    if (metrics.cache.hitRate < 80) {
      recommendations.push({
        category: 'cache',
        priority: 'high',
        recommendation: 'Increase cache TTL for frequently accessed data',
        impact: 'High - Can reduce response times by 50-80%',
        effort: 'low'
      });
    }

    // Query recommendations
    if (metrics.performance.p95ResponseTime > 1000) {
      recommendations.push({
        category: 'query',
        priority: 'high',
        recommendation: 'Optimize slow queries and add database indexes',
        impact: 'High - Can reduce response times significantly',
        effort: 'medium'
      });
    }

    // Index recommendations
    if (metrics.performance.slowQueries > 10) {
      recommendations.push({
        category: 'index',
        priority: 'medium',
        recommendation: 'Add composite indexes for frequently filtered fields',
        impact: 'Medium - Can improve query performance by 30-50%',
        effort: 'medium'
      });
    }

    // System recommendations
    if (metrics.overview.errorRate > 2) {
      recommendations.push({
        category: 'system',
        priority: 'high',
        recommendation: 'Review error logs and implement better error handling',
        impact: 'High - Can improve system reliability',
        effort: 'medium'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Export dashboard data
   */
  async exportDashboardData(format: 'json' | 'csv' = 'json'): Promise<string> {
    const metrics = await this.getDashboardMetrics(true);
    
    if (format === 'csv') {
      return this.convertToCSV(metrics);
    }
    
    return JSON.stringify(metrics, null, 2);
  }

  /**
   * Convert metrics to CSV format
   */
  private convertToCSV(metrics: DashboardMetrics): string {
    const lines: string[] = [];
    
    // Overview
    lines.push('Category,Metric,Value');
    lines.push(`Overview,Total Searches,${metrics.overview.totalSearches}`);
    lines.push(`Overview,Average Response Time,${metrics.overview.averageResponseTime}`);
    lines.push(`Overview,Cache Hit Rate,${metrics.overview.cacheHitRate}%`);
    lines.push(`Overview,Error Rate,${metrics.overview.errorRate}%`);
    
    // Performance
    lines.push(`Performance,P50 Response Time,${metrics.performance.p50ResponseTime}`);
    lines.push(`Performance,P95 Response Time,${metrics.performance.p95ResponseTime}`);
    lines.push(`Performance,Throughput,${metrics.performance.throughput}`);
    
    // Cache
    lines.push(`Cache,Hits,${metrics.cache.hits}`);
    lines.push(`Cache,Misses,${metrics.cache.misses}`);
    lines.push(`Cache,Hit Rate,${metrics.cache.hitRate}%`);
    
    return lines.join('\n');
  }

  /**
   * Get dashboard configuration
   */
  getConfig(): DashboardConfig {
    return { ...this.config };
  }

  /**
   * Update dashboard configuration
   */
  updateConfig(updates: Partial<DashboardConfig>): void {
    Object.assign(this.config, updates);
  }
}

export const searchDashboardService = new SearchDashboardService();
