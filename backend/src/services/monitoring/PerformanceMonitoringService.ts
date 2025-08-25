import { cacheService } from '../cache';
import { logger } from '../../utils/logger';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags: Record<string, string>;
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    free: number;
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    free: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
  };
  redis: {
    connected: boolean;
    memory: number;
    keys: number;
    operations: number;
  };
  application: {
    uptime: number;
    requests: number;
    errors: number;
    responseTime: number;
  };
}

export interface APIMetrics {
  endpoint: string;
  method: string;
  requests: number;
  errors: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  timestamp: number;
}

export interface DatabaseMetrics {
  connections: number;
  activeConnections: number;
  idleConnections: number;
  queries: number;
  slowQueries: number;
  avgQueryTime: number;
  timestamp: number;
}

export class PerformanceMonitoringService {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private apiMetrics: Map<string, APIMetrics> = new Map();
  private startTime: number = Date.now();
  private requestCount: number = 0;
  private errorCount: number = 0;
  private responseTimes: number[] = [];

  constructor() {
    this.initializeMonitoring();
  }

  /**
   * Initialize monitoring
   */
  private initializeMonitoring(): void {
    // Start periodic metric collection
    setInterval(() => {
      this.collectSystemMetrics();
    }, 60000); // Every minute

    // Start periodic cleanup
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 300000); // Every 5 minutes

    logger.info('Performance monitoring service initialized');
  }

  /**
   * Record API request metrics
   */
  recordAPIRequest(endpoint: string, method: string, responseTime: number, success: boolean): void {
    const key = `${method}:${endpoint}`;
    const now = Date.now();

    // Update request count
    this.requestCount++;

    // Update error count
    if (!success) {
      this.errorCount++;
    }

    // Store response time
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift(); // Keep only last 1000 requests
    }

    // Update API metrics
    const existing = this.apiMetrics.get(key) || {
      endpoint,
      method,
      requests: 0,
      errors: 0,
      avgResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      timestamp: now
    };

    existing.requests++;
    if (!success) existing.errors++;

    // Update response time statistics
    existing.avgResponseTime = (existing.avgResponseTime * (existing.requests - 1) + responseTime) / existing.requests;
    existing.minResponseTime = Math.min(existing.minResponseTime, responseTime);
    existing.maxResponseTime = Math.max(existing.maxResponseTime, responseTime);
    existing.timestamp = now;

    this.apiMetrics.set(key, existing);

    // Store metric in Redis for persistence
    this.storeMetric('api_response_time', responseTime, 'ms', {
      endpoint,
      method,
      success: success.toString()
    });
  }

  /**
   * Record database query metrics
   */
  recordDatabaseQuery(query: string, duration: number, success: boolean): void {
    this.storeMetric('database_query_time', duration, 'ms', {
      query: query.substring(0, 50), // Truncate long queries
      success: success.toString()
    });

    if (duration > 1000) { // Log slow queries (>1s)
      logger.warn(`Slow database query detected: ${duration}ms - ${query.substring(0, 100)}`);
    }
  }

  /**
   * Record cache operation metrics
   */
  recordCacheOperation(operation: string, duration: number, success: boolean): void {
    this.storeMetric('cache_operation_time', duration, 'ms', {
      operation,
      success: success.toString()
    });
  }

  /**
   * Record WebSocket event metrics
   */
  recordWebSocketEvent(event: string, duration: number, success: boolean): void {
    this.storeMetric('websocket_event_time', duration, 'ms', {
      event,
      success: success.toString()
    });
  }

  /**
   * Store a metric
   */
  private storeMetric(name: string, value: number, unit: string, tags: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags
    };

    // Store in memory for quick access
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(metric);

    // Keep only last 1000 metrics per type
    const metrics = this.metrics.get(name)!;
    if (metrics.length > 1000) {
      metrics.shift();
    }

    // Store in Redis for persistence
    const key = `metric:${name}:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    cacheService.set(key, metric, {
      ttl: 86400 * 7, // 7 days
      tags: ['performance_metrics', `metric:${name}`]
    }).catch(error => {
      logger.error('Failed to store metric in Redis:', error);
    });
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<void> {
    try {
      const systemMetrics = await this.getSystemMetrics();
      
      // Store system metrics
      this.storeMetric('cpu_usage', systemMetrics.cpu.usage, 'percent', {});
      this.storeMetric('memory_usage', systemMetrics.memory.usage, 'percent', {});
      this.storeMetric('disk_usage', systemMetrics.disk.usage, 'percent', {});
      this.storeMetric('network_connections', systemMetrics.network.connections, 'count', {});
      this.storeMetric('redis_memory', systemMetrics.redis.memory, 'bytes', {});
      this.storeMetric('application_uptime', systemMetrics.application.uptime, 'seconds', {});
      this.storeMetric('application_requests', systemMetrics.application.requests, 'count', {});
      this.storeMetric('application_errors', systemMetrics.application.errors, 'count', {});

      logger.debug('System metrics collected successfully');
    } catch (error) {
      logger.error('Failed to collect system metrics:', error);
    }
  }

  /**
   * Get current system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const uptime = (Date.now() - this.startTime) / 1000;

    // Calculate response time percentiles
    const sortedResponseTimes = [...this.responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedResponseTimes.length * 0.95);
    const p99Index = Math.floor(sortedResponseTimes.length * 0.99);

    return {
      cpu: {
        usage: await this.getCPUUsage(),
        load: await this.getCPULoad()
      },
      memory: await this.getMemoryUsage(),
      disk: await this.getDiskUsage(),
      network: await this.getNetworkStats(),
      redis: await this.getRedisStats(),
      application: {
        uptime,
        requests: this.requestCount,
        errors: this.errorCount,
        responseTime: this.responseTimes.length > 0 
          ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
          : 0
      }
    };
  }

  /**
   * Get CPU usage (simplified implementation)
   */
  private async getCPUUsage(): Promise<number> {
    // In a real implementation, you'd use system calls or libraries like 'os-utils'
    // For now, return a simulated value
    return Math.random() * 30 + 10; // 10-40% usage
  }

  /**
   * Get CPU load (simplified implementation)
   */
  private async getCPULoad(): Promise<number[]> {
    // In a real implementation, you'd get actual load averages
    return [Math.random() * 2 + 0.5, Math.random() * 2 + 0.5, Math.random() * 2 + 0.5];
  }

  /**
   * Get memory usage (simplified implementation)
   */
  private async getMemoryUsage(): Promise<SystemMetrics['memory']> {
    // In a real implementation, you'd use process.memoryUsage() or system calls
    const total = 16 * 1024 * 1024 * 1024; // 16GB
    const used = total * (0.3 + Math.random() * 0.4); // 30-70% usage
    const free = total - used;
    
    return {
      used: Math.floor(used),
      total,
      free: Math.floor(free),
      usage: Math.floor((used / total) * 100)
    };
  }

  /**
   * Get disk usage (simplified implementation)
   */
  private async getDiskUsage(): Promise<SystemMetrics['disk']> {
    // In a real implementation, you'd use system calls or libraries
    const total = 500 * 1024 * 1024 * 1024; // 500GB
    const used = total * (0.4 + Math.random() * 0.3); // 40-70% usage
    const free = total - used;
    
    return {
      used: Math.floor(used),
      total,
      free: Math.floor(free),
      usage: Math.floor((used / total) * 100)
    };
  }

  /**
   * Get network stats (simplified implementation)
   */
  private async getNetworkStats(): Promise<SystemMetrics['network']> {
    // In a real implementation, you'd use system calls or network monitoring
    return {
      bytesIn: Math.floor(Math.random() * 1000000),
      bytesOut: Math.floor(Math.random() * 500000),
      connections: Math.floor(Math.random() * 100) + 10
    };
  }

  /**
   * Get Redis stats
   */
  private async getRedisStats(): Promise<SystemMetrics['redis']> {
    try {
      // Test Redis connection by setting and getting a test key
      const testKey = `redis_test_${Date.now()}`;
      await cacheService.set(testKey, 'test', { ttl: 60 });
      await cacheService.get(testKey);
      await cacheService.delete(testKey);
      
      return {
        connected: true,
        memory: Math.floor(Math.random() * 100000000), // Simulated memory usage
        keys: Math.floor(Math.random() * 10000), // Simulated key count
        operations: Math.floor(Math.random() * 10000) // Simulated operations
      };
    } catch (error) {
      logger.error('Failed to get Redis stats:', error);
      return {
        connected: false,
        memory: 0,
        keys: 0,
        operations: 0
      };
    }
  }

  /**
   * Get API metrics
   */
  getAPIMetrics(): APIMetrics[] {
    return Array.from(this.apiMetrics.values());
  }

  /**
   * Get metrics by name
   */
  getMetrics(name: string, timeRange: '1h' | '24h' | '7d' = '24h'): PerformanceMetric[] {
    const metrics = this.metrics.get(name) || [];
    const now = Date.now();
    let cutoffTime: number;

    switch (timeRange) {
      case '1h':
        cutoffTime = now - 60 * 60 * 1000;
        break;
      case '24h':
        cutoffTime = now - 24 * 60 * 60 * 1000;
        break;
      case '7d':
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      default:
        cutoffTime = now - 24 * 60 * 60 * 1000;
    }

    return metrics.filter(metric => metric.timestamp >= cutoffTime);
  }

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(name: string, timeRange: '1h' | '24h' | '7d' = '24h'): {
    avg: number;
    min: number;
    max: number;
    count: number;
    p95: number;
    p99: number;
  } {
    const metrics = this.getMetrics(name, timeRange);
    
    if (metrics.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0, p95: 0, p99: 0 };
    }

    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = values[0];
    const max = values[values.length - 1];
    const p95Index = Math.floor(values.length * 0.95);
    const p99Index = Math.floor(values.length * 0.99);

    return {
      avg,
      min,
      max,
      count: values.length,
      p95: values[p95Index] || 0,
      p99: values[p99Index] || 0
    };
  }

  /**
   * Get performance summary
   */
  async getPerformanceSummary(): Promise<{
    system: SystemMetrics;
    api: APIMetrics[];
    summary: {
      totalRequests: number;
      errorRate: number;
      avgResponseTime: number;
      uptime: number;
    };
  }> {
    const system = await this.getSystemMetrics();
    const api = this.getAPIMetrics();
    
    const totalRequests = api.reduce((sum, metric) => sum + metric.requests, 0);
    const totalErrors = api.reduce((sum, metric) => sum + metric.errors, 0);
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    const avgResponseTime = api.length > 0 
      ? api.reduce((sum, metric) => sum + metric.avgResponseTime, 0) / api.length 
      : 0;

    return {
      system,
      api,
      summary: {
        totalRequests,
        errorRate,
        avgResponseTime,
        uptime: system.application.uptime
      }
    };
  }

  /**
   * Clean up old metrics
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago

    for (const [name, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter(metric => metric.timestamp >= cutoffTime);
      this.metrics.set(name, filtered);
    }

    logger.debug('Old metrics cleaned up');
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(): Record<string, any> {
    return {
      timestamp: Date.now(),
      system: this.getSystemMetrics(),
      api: this.getAPIMetrics(),
      custom: Object.fromEntries(this.metrics.entries())
    };
  }
}
