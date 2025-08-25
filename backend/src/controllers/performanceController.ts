import { Request, Response } from 'express';
import { PerformanceMonitoringService } from '../services/monitoring/PerformanceMonitoringService';
import { MessageQueueService } from '../services/queue/MessageQueueService';
import { logger } from '../utils/logger';

export class PerformanceController {
  private performanceMonitoringService: PerformanceMonitoringService;
  private messageQueueService: MessageQueueService;

  constructor() {
    this.performanceMonitoringService = new PerformanceMonitoringService();
    this.messageQueueService = new MessageQueueService();
  }

  /**
   * Get system performance metrics
   */
  async getSystemMetrics(req: Request, res: Response) {
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

      const systemMetrics = await this.performanceMonitoringService.getSystemMetrics();

      return res.json({
        success: true,
        data: {
          system: systemMetrics,
          timestamp: new Date().toISOString()
        },
        message: 'System metrics retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get system metrics error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get system metrics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get API performance metrics
   */
  async getAPIMetrics(req: Request, res: Response) {
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

      const apiMetrics = this.performanceMonitoringService.getAPIMetrics();

      return res.json({
        success: true,
        data: {
          api: apiMetrics,
          timestamp: new Date().toISOString()
        },
        message: 'API metrics retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get API metrics error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get API metrics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get performance summary
   */
  async getPerformanceSummary(req: Request, res: Response) {
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

      const summary = await this.performanceMonitoringService.getPerformanceSummary();

      return res.json({
        success: true,
        data: {
          summary,
          timestamp: new Date().toISOString()
        },
        message: 'Performance summary retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get performance summary error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get performance summary',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get specific metrics by name
   */
  async getMetrics(req: Request, res: Response) {
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

      const { metricName } = req.params;
      const timeRange = (req.query.timeRange as '1h' | '24h' | '7d') || '24h';

      const metrics = this.performanceMonitoringService.getMetrics(metricName, timeRange);

      return res.json({
        success: true,
        data: {
          metricName,
          timeRange,
          metrics,
          count: metrics.length,
          timestamp: new Date().toISOString()
        },
        message: `Metrics for ${metricName} retrieved successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get metrics error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get metrics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get aggregated metrics
   */
  async getAggregatedMetrics(req: Request, res: Response) {
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

      const { metricName } = req.params;
      const timeRange = (req.query.timeRange as '1h' | '24h' | '7d') || '24h';

      const aggregated = this.performanceMonitoringService.getAggregatedMetrics(metricName, timeRange);

      return res.json({
        success: true,
        data: {
          metricName,
          timeRange,
          aggregated,
          timestamp: new Date().toISOString()
        },
        message: `Aggregated metrics for ${metricName} retrieved successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get aggregated metrics error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get aggregated metrics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(req: Request, res: Response) {
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

      const { queueName } = req.params;

      if (queueName) {
        // Get specific queue stats
        const stats = await this.messageQueueService.getQueueStats(queueName);
        
        if (!stats) {
          return res.status(404).json({
            success: false,
            error: 'Not found',
            message: `Queue ${queueName} not found`,
            timestamp: new Date().toISOString()
          });
        }

        return res.json({
          success: true,
          data: {
            queueName,
            stats,
            timestamp: new Date().toISOString()
          },
          message: `Queue statistics for ${queueName} retrieved successfully`,
          timestamp: new Date().toISOString()
        });
      } else {
        // Get all queue stats
        const allStats = await this.messageQueueService.getAllQueueStats();

        return res.json({
          success: true,
          data: {
            queues: allStats,
            count: allStats.length,
            timestamp: new Date().toISOString()
          },
          message: 'All queue statistics retrieved successfully',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Get queue stats error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get queue statistics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get queue size
   */
  async getQueueSize(req: Request, res: Response) {
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

      const { queueName } = req.params;
      const size = await this.messageQueueService.getQueueSize(queueName);

      return res.json({
        success: true,
        data: {
          queueName,
          size,
          timestamp: new Date().toISOString()
        },
        message: `Queue size for ${queueName} retrieved successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get queue size error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get queue size',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Clear completed messages
   */
  async clearCompletedMessages(req: Request, res: Response) {
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

      const { queueName } = req.params;
      const olderThanDays = parseInt(req.query.olderThanDays as string) || 7;

      const clearedCount = await this.messageQueueService.clearCompletedMessages(queueName, olderThanDays);

      return res.json({
        success: true,
        data: {
          queueName,
          clearedCount,
          olderThanDays,
          timestamp: new Date().toISOString()
        },
        message: `Cleared ${clearedCount} completed messages from ${queueName}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Clear completed messages error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to clear completed messages',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Export metrics for external monitoring
   */
  async exportMetrics(req: Request, res: Response) {
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

      const metrics = this.performanceMonitoringService.exportMetrics();

      return res.json({
        success: true,
        data: {
          metrics,
          timestamp: new Date().toISOString()
        },
        message: 'Metrics exported successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Export metrics error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to export metrics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Health check with performance data
   */
  async healthCheck(req: Request, res: Response) {
    try {
      const systemMetrics = await this.performanceMonitoringService.getSystemMetrics();
      const summary = await this.performanceMonitoringService.getPerformanceSummary();

      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: systemMetrics.application.uptime,
        performance: {
          cpu: systemMetrics.cpu.usage,
          memory: systemMetrics.memory.usage,
          disk: systemMetrics.disk.usage,
          redis: systemMetrics.redis.connected ? 'connected' : 'disconnected'
        },
        application: {
          requests: summary.summary.totalRequests,
          errorRate: summary.summary.errorRate,
          avgResponseTime: summary.summary.avgResponseTime
        }
      };

      return res.json(healthStatus);
    } catch (error) {
      logger.error('Health check error:', error);
      return res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Failed to perform health check'
      });
    }
  }
}
