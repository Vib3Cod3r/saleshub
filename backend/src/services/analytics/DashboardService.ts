import { logger } from '../../utils/logger';
import { redis } from '../../config/redis';
// import { userBehaviorService } from './UserBehaviorService';

export interface DashboardMetrics {
  realTime: {
    activeUsers: number;
    currentSessions: number;
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
  performance: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    databaseConnections: number;
    cacheHitRate: number;
  };
  userActivity: {
    totalUsers: number;
    newUsers: number;
    returningUsers: number;
    averageSessionDuration: number;
    popularPages: Array<{ page: string; views: number }>;
  };
  search: {
    totalSearches: number;
    successfulSearches: number;
    failedSearches: number;
    averageResults: number;
    popularQueries: Array<{ query: string; count: number }>;
  };
  alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  category: 'performance' | 'security' | 'user_experience' | 'system';
  resolved: boolean;
  data?: Record<string, any>;
}

export class DashboardService {
  private alerts: SystemAlert[] = [];
  private readonly ALERT_TTL = 24 * 60 * 60; // 24 hours

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const [
        realTimeMetrics,
        performanceMetrics,
        userActivityMetrics,
        searchMetrics,
        currentAlerts
      ] = await Promise.all([
        this.getRealTimeMetrics(),
        this.getPerformanceMetrics(),
        this.getUserActivityMetrics(),
        this.getSearchMetrics(),
        this.getCurrentAlerts()
      ]);

      const dashboardMetrics: DashboardMetrics = {
        realTime: realTimeMetrics,
        performance: performanceMetrics,
        userActivity: userActivityMetrics,
        search: searchMetrics,
        alerts: currentAlerts,
      };

      return dashboardMetrics;
    } catch (error) {
      logger.error('Failed to get dashboard metrics', { error });
      throw error;
    }
  }

  async getRealTimeMetrics(): Promise<DashboardMetrics['realTime']> {
    try {
      const activeUsers = await this.getActiveUsersCount();
      const currentSessions = await this.getCurrentSessionsCount();
      const requestsPerMinute = await this.getRequestsPerMinute();
      const averageResponseTime = await this.getAverageResponseTime();
      const errorRate = await this.getErrorRate();

      const systemHealth = this.calculateSystemHealth({
        errorRate,
        averageResponseTime,
        activeUsers,
      });

      return {
        activeUsers,
        currentSessions,
        requestsPerMinute,
        averageResponseTime,
        errorRate,
        systemHealth,
      };
    } catch (error) {
      logger.error('Failed to get real-time metrics', { error });
      return {
        activeUsers: 0,
        currentSessions: 0,
        requestsPerMinute: 0,
        averageResponseTime: 0,
        errorRate: 0,
        systemHealth: 'critical',
      };
    }
  }

  async getPerformanceMetrics(): Promise<DashboardMetrics['performance']> {
    try {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      const cpuUsage = await this.getCpuUsage();
      const databaseConnections = await this.getDatabaseConnections();
      const cacheHitRate = await this.getCacheHitRate();

      return {
        uptime,
        memoryUsage: memoryUsage.heapUsed / 1024 / 1024, // MB
        cpuUsage,
        databaseConnections,
        cacheHitRate,
      };
    } catch (error) {
      logger.error('Failed to get performance metrics', { error });
      return {
        uptime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        databaseConnections: 0,
        cacheHitRate: 0,
      };
    }
  }

  async getUserActivityMetrics(): Promise<DashboardMetrics['userActivity']> {
    try {
      // const metrics = await userBehaviorService.getAnalyticsMetrics('24h');
      const popularPages = await this.getPopularPages();

      return {
        totalUsers: 100, // Mock data
        newUsers: 10, // Mock data
        returningUsers: 90, // Mock data
        averageSessionDuration: 300, // Mock data
        popularPages,
      };
    } catch (error) {
      logger.error('Failed to get user activity metrics', { error });
      return {
        totalUsers: 0,
        newUsers: 0,
        returningUsers: 0,
        averageSessionDuration: 0,
        popularPages: [],
      };
    }
  }

  async getSearchMetrics(): Promise<DashboardMetrics['search']> {
    try {
      // const metrics = await userBehaviorService.getAnalyticsMetrics('24h');
      // const popularQueries = await userBehaviorService.getPopularQueries(5);

      return {
        totalSearches: 50, // Mock data
        successfulSearches: 45, // Mock data
        failedSearches: 5, // Mock data
        averageResults: 12, // Mock data
        popularQueries: [], // Mock data
      };
    } catch (error) {
      logger.error('Failed to get search metrics', { error });
      return {
        totalSearches: 0,
        successfulSearches: 0,
        failedSearches: 0,
        averageResults: 0,
        popularQueries: [],
      };
    }
  }

  async createAlert(alert: Omit<SystemAlert, 'id' | 'timestamp'>): Promise<SystemAlert> {
    const fullAlert: SystemAlert = {
      ...alert,
      id: this.generateAlertId(),
      timestamp: new Date(),
    };

    try {
      // Store alert in Redis
      await redis.hset(
        `system_alert:${fullAlert.id}`,
        {
          type: fullAlert.type,
          message: fullAlert.message,
          timestamp: fullAlert.timestamp.toISOString(),
          severity: fullAlert.severity,
          category: fullAlert.category,
          resolved: fullAlert.resolved.toString(),
          data: JSON.stringify(fullAlert.data || {}),
        }
      );

      // Set TTL for alert
      await redis.expire(`system_alert:${fullAlert.id}`, this.ALERT_TTL);

      // Add to alerts array
      this.alerts.push(fullAlert);

      // Log alert
      logger.warn('System alert created', {
        alertId: fullAlert.id,
        type: fullAlert.type,
        severity: fullAlert.severity,
        message: fullAlert.message,
      });

      return fullAlert;
    } catch (error) {
      logger.error('Failed to create system alert', { error, alert: fullAlert });
      throw error;
    }
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    try {
      const alertData = await redis.hgetall(`system_alert:${alertId}`);
      if (!alertData.message) {
        return false;
      }

      // Mark alert as resolved
      await redis.hset(`system_alert:${alertId}`, 'resolved', 'true');

      // Remove from alerts array
      this.alerts = this.alerts.filter(alert => alert.id !== alertId);

      logger.info('System alert resolved', { alertId });
      return true;
    } catch (error) {
      logger.error('Failed to resolve alert', { error, alertId });
      return false;
    }
  }

  async getCurrentAlerts(): Promise<SystemAlert[]> {
    try {
      const alertKeys = await redis.keys('system_alert:*');
      const alerts: SystemAlert[] = [];

      for (const alertKey of alertKeys) {
        const alertData = await redis.hgetall(alertKey);
        if (alertData.message && alertData.resolved !== 'true') {
          alerts.push({
            id: alertKey.split(':')[1],
            type: alertData.type as any,
            message: alertData.message,
            timestamp: new Date(alertData.timestamp),
            severity: alertData.severity as any,
            category: alertData.category as any,
            resolved: alertData.resolved === 'true',
            data: JSON.parse(alertData.data || '{}'),
          });
        }
      }

      return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      logger.error('Failed to get current alerts', { error });
      return [];
    }
  }

  async monitorSystemHealth(): Promise<void> {
    try {
      const metrics = await this.getRealTimeMetrics();
      const performance = await this.getPerformanceMetrics();

      // Check for performance issues
      if (performance.memoryUsage > 500) { // 500MB
        await this.createAlert({
          type: 'warning',
          message: 'High memory usage detected',
          severity: 'medium',
          category: 'performance',
          resolved: false,
          data: { memoryUsage: performance.memoryUsage },
        });
      }

      if (performance.cpuUsage > 80) {
        await this.createAlert({
          type: 'warning',
          message: 'High CPU usage detected',
          severity: 'medium',
          category: 'performance',
          resolved: false,
          data: { cpuUsage: performance.cpuUsage },
        });
      }

      // Check for error rate issues
      if (metrics.errorRate > 10) {
        await this.createAlert({
          type: 'error',
          message: 'High error rate detected',
          severity: 'high',
          category: 'user_experience',
          resolved: false,
          data: { errorRate: metrics.errorRate },
        });
      }

      // Check for response time issues
      if (metrics.averageResponseTime > 3000) {
        await this.createAlert({
          type: 'warning',
          message: 'Slow response times detected',
          severity: 'medium',
          category: 'user_experience',
          resolved: false,
          data: { averageResponseTime: metrics.averageResponseTime },
        });
      }

      logger.info('System health monitoring completed');
    } catch (error) {
      logger.error('Failed to monitor system health', { error });
    }
  }

  private async getActiveUsersCount(): Promise<number> {
    try {
      const activeSessions = await redis.keys('user_session:*');
      const uniqueUsers = new Set<string>();

      for (const sessionKey of activeSessions) {
        const sessionData = await redis.hget(sessionKey, 'userId');
        if (sessionData) {
          uniqueUsers.add(sessionData);
        }
      }

      return uniqueUsers.size;
    } catch (error) {
      logger.error('Failed to get active users count', { error });
      return 0;
    }
  }

  private async getCurrentSessionsCount(): Promise<number> {
    try {
      const activeSessions = await redis.keys('user_session:*');
      return activeSessions.length;
    } catch (error) {
      logger.error('Failed to get current sessions count', { error });
      return 0;
    }
  }

  private async getRequestsPerMinute(): Promise<number> {
    try {
      const now = Date.now();
      const oneMinuteAgo = now - (60 * 1000);
      const eventKeys = await redis.keys('user_event:*');
      let requestCount = 0;

      for (const eventKey of eventKeys) {
        const eventData = await redis.hget(eventKey, 'timestamp');
        if (eventData) {
          const timestamp = new Date(eventData).getTime();
          if (timestamp > oneMinuteAgo) {
            requestCount++;
          }
        }
      }

      return requestCount;
    } catch (error) {
      logger.error('Failed to get requests per minute', { error });
      return 0;
    }
  }

  private async getAverageResponseTime(): Promise<number> {
    try {
      const eventKeys = await redis.keys('user_event:*');
      let totalResponseTime = 0;
      let responseTimeCount = 0;

      for (const eventKey of eventKeys) {
        const eventData = await redis.hgetall(eventKey);
        if (eventData.duration) {
          totalResponseTime += parseInt(eventData.duration);
          responseTimeCount++;
        }
      }

      return responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
    } catch (error) {
      logger.error('Failed to get average response time', { error });
      return 0;
    }
  }

  private async getErrorRate(): Promise<number> {
    try {
      const eventKeys = await redis.keys('user_event:*');
      let totalEvents = 0;
      let errorEvents = 0;

      for (const eventKey of eventKeys) {
        const eventData = await redis.hget(eventKey, 'eventType');
        if (eventData) {
          totalEvents++;
          if (eventData === 'error') {
            errorEvents++;
          }
        }
      }

      return totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;
    } catch (error) {
      logger.error('Failed to get error rate', { error });
      return 0;
    }
  }

  private async getCpuUsage(): Promise<number> {
    // Mock CPU usage calculation
    // In a real implementation, you'd use system monitoring libraries
    return Math.random() * 100;
  }

  private async getDatabaseConnections(): Promise<number> {
    // Mock database connections
    // In a real implementation, you'd query the database for active connections
    return Math.floor(Math.random() * 50) + 10;
  }

  private async getCacheHitRate(): Promise<number> {
    try {
      const cacheStats = await redis.info('stats');
      // Parse cache stats to get hit rate
      // This is a simplified implementation
      return Math.random() * 100;
    } catch (error) {
      logger.error('Failed to get cache hit rate', { error });
      return 0;
    }
  }

  private async getPopularPages(): Promise<Array<{ page: string; views: number }>> {
    try {
      const eventKeys = await redis.keys('user_event:*');
      const pageViews = new Map<string, number>();

      for (const eventKey of eventKeys) {
        const eventData = await redis.hgetall(eventKey);
        if (eventData.eventType === 'page_view' && eventData.eventData) {
          const eventDataObj = JSON.parse(eventData.eventData);
          const page = eventDataObj.page || 'unknown';
          pageViews.set(page, (pageViews.get(page) || 0) + 1);
        }
      }

      return Array.from(pageViews.entries())
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
    } catch (error) {
      logger.error('Failed to get popular pages', { error });
      return [];
    }
  }

  private calculateSystemHealth(metrics: {
    errorRate: number;
    averageResponseTime: number;
    activeUsers: number;
  }): 'healthy' | 'warning' | 'critical' {
    if (metrics.errorRate > 15 || metrics.averageResponseTime > 5000) {
      return 'critical';
    } else if (metrics.errorRate > 5 || metrics.averageResponseTime > 2000) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async cleanup(): Promise<void> {
    try {
      // Clean up resolved alerts older than 24 hours
      const alertKeys = await redis.keys('system_alert:*');
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);

      for (const alertKey of alertKeys) {
        const alertData = await redis.hget(alertKey, 'timestamp');
        if (alertData) {
          const timestamp = new Date(alertData).getTime();
          if (timestamp < oneDayAgo) {
            await redis.del(alertKey);
          }
        }
      }

      logger.info('Dashboard service cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup dashboard service', { error });
    }
  }
}

export const dashboardService = new DashboardService();
