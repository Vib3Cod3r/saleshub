import { Request, Response } from 'express';
import { RealTimeService } from '../services/realtime/RealTimeService';
import { NotificationService } from '../services/notifications/NotificationService';
import { logger } from '../utils/logger';
import { z } from 'zod';

// Validation schemas
const notificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: z.string().min(1, 'Notification type is required'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  data: z.any().optional(),
  channels: z.array(z.enum(['realtime', 'email', 'push'])).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional()
});

const templateNotificationSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  variables: z.record(z.string()).optional(),
  channels: z.array(z.enum(['realtime', 'email', 'push'])).optional()
});

export class RealtimeController {
  private realTimeService: RealTimeService;
  private notificationService: NotificationService;

  constructor(realTimeService: RealTimeService, notificationService: NotificationService) {
    this.realTimeService = realTimeService;
    this.notificationService = notificationService;
  }

  async getConnectionStatus(req: Request, res: Response) {
    try {
      const connectedClients = await this.realTimeService.getConnectedClients();
      const rooms = await this.realTimeService.getRooms();

      res.json({
        success: true,
        data: {
          connectedClients,
          rooms,
          status: 'healthy',
          timestamp: new Date().toISOString()
        },
        message: 'Real-time connection status retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get connection status error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get connection status',
        timestamp: new Date().toISOString()
      });
    }
  }

  async sendNotification(req: Request, res: Response) {
    try {
      const validatedData = notificationSchema.parse(req.body);
      
      await this.notificationService.sendNotification(validatedData);

      return res.json({
        success: true,
        data: {
          notificationId: `notif_${Date.now()}`,
          sentAt: new Date().toISOString()
        },
        message: 'Notification sent successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Notification validation error:', error.errors);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
          timestamp: new Date().toISOString()
        });
      }

      logger.error('Send notification error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to send notification',
        timestamp: new Date().toISOString()
      });
    }
  }

  async sendTemplateNotification(req: Request, res: Response) {
    try {
      const validatedData = templateNotificationSchema.parse(req.body);
      
      await this.notificationService.sendTemplateNotification(
        validatedData.templateId,
        validatedData.userId,
        validatedData.variables || {},
        validatedData.channels || ['realtime']
      );

      return res.json({
        success: true,
        data: {
          templateId: validatedData.templateId,
          sentAt: new Date().toISOString()
        },
        message: 'Template notification sent successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Template notification validation error:', error.errors);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
          timestamp: new Date().toISOString()
        });
      }

      logger.error('Send template notification error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to send template notification',
        timestamp: new Date().toISOString()
      });
    }
  }

  async sendBulkNotifications(req: Request, res: Response) {
    try {
      const { notifications } = req.body;
      
      if (!Array.isArray(notifications)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'Notifications must be an array',
          timestamp: new Date().toISOString()
        });
      }

      // Validate each notification
      for (const notification of notifications) {
        notificationSchema.parse(notification);
      }

      const results = await this.notificationService.sendBulkNotifications(notifications);

      return res.json({
        success: true,
        data: results,
        message: `Bulk notifications sent: ${results.successful} successful, ${results.failed} failed`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Bulk notification validation error:', error.errors);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
          timestamp: new Date().toISOString()
        });
      }

      logger.error('Send bulk notifications error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to send bulk notifications',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getUserNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;

      const notifications = await this.notificationService.getUserNotifications(userId, limit);

      res.json({
        success: true,
        data: {
          notifications,
          count: notifications.length,
          userId
        },
        message: 'User notifications retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get user notifications error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get user notifications',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getNotificationStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const stats = await this.notificationService.getNotificationStats(userId);

      res.json({
        success: true,
        data: {
          stats,
          userId
        },
        message: 'Notification stats retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get notification stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get notification stats',
        timestamp: new Date().toISOString()
      });
    }
  }

  async markNotificationAsRead(req: Request, res: Response) {
    try {
      const { userId, notificationId } = req.params;

      await this.notificationService.markNotificationAsRead(userId, notificationId);

      res.json({
        success: true,
        data: {
          notificationId,
          userId,
          markedAsRead: true
        },
        message: 'Notification marked as read successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Mark notification as read error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to mark notification as read',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getNotificationTemplates(req: Request, res: Response) {
    try {
      const templates = this.notificationService.getTemplates();

      res.json({
        success: true,
        data: {
          templates,
          count: templates.length
        },
        message: 'Notification templates retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get notification templates error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get notification templates',
        timestamp: new Date().toISOString()
      });
    }
  }

  async broadcastToRoom(req: Request, res: Response) {
    try {
      const { room, event, data } = req.body;

      if (!room || !event) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'Room and event are required',
          timestamp: new Date().toISOString()
        });
      }

      await this.realTimeService.broadcastToRoom(room, event, data);

      return res.json({
        success: true,
        data: {
          room,
          event,
          broadcastAt: new Date().toISOString()
        },
        message: `Event ${event} broadcasted to room ${room} successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Broadcast to room error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to broadcast to room',
        timestamp: new Date().toISOString()
      });
    }
  }
}
