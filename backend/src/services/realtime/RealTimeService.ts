import { WebSocketServer } from '../../config/websocket';
import { cacheService } from '../cache/CacheService';
import { logger } from '../../utils/logger';

export interface RealTimeEvent {
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
}

export class RealTimeService {
  private wsServer: WebSocketServer;

  constructor(wsServer: WebSocketServer) {
    this.wsServer = wsServer;
  }

  async broadcastDashboardUpdate(userId: string, data: any) {
    try {
      const event: RealTimeEvent = {
        type: 'dashboard-update',
        data,
        timestamp: new Date().toISOString(),
        userId
      };

      this.wsServer.emitToUser(userId, 'dashboard-update', event);
      
      // Cache the latest dashboard data
      await cacheService.set(`dashboard:${userId}`, data, {
        ttl: 300,
        tags: ['dashboard', `user:${userId}`]
      });
      
      logger.info(`Dashboard update sent to user: ${userId}`);
    } catch (error) {
      logger.error('Dashboard update broadcast error:', error);
    }
  }

  async broadcastActivityStream(userId: string, activity: any) {
    try {
      const event: RealTimeEvent = {
        type: 'activity-stream',
        data: activity,
        timestamp: new Date().toISOString(),
        userId
      };

      this.wsServer.emitToUser(userId, 'activity-stream', event);
      
      // Store activity in cache for history
      const activities = await cacheService.get<any[]>(`activities:${userId}`) || [];
      activities.unshift(activity);
      activities.splice(50); // Keep only last 50 activities
      
      await cacheService.set(`activities:${userId}`, activities, {
        ttl: 3600, // 1 hour
        tags: ['activities', `user:${userId}`]
      });
      
      logger.info(`Activity stream sent to user: ${userId}`);
    } catch (error) {
      logger.error('Activity stream broadcast error:', error);
    }
  }

  async broadcastSearchResults(userId: string, results: any) {
    try {
      const event: RealTimeEvent = {
        type: 'search-results',
        data: results,
        timestamp: new Date().toISOString(),
        userId
      };

      this.wsServer.emitToUser(userId, 'search-results', event);
      
      logger.info(`Search results sent to user: ${userId}`);
    } catch (error) {
      logger.error('Search results broadcast error:', error);
    }
  }

  async broadcastNotification(userId: string, notification: any) {
    try {
      const event: RealTimeEvent = {
        type: 'notification',
        data: {
          id: this.generateNotificationId(),
          ...notification,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        userId
      };

      this.wsServer.emitToUser(userId, 'notification', event);
      
      // Store notification in cache
      const notifications = await cacheService.get<any[]>(`notifications:${userId}`) || [];
      notifications.unshift(event.data);
      notifications.splice(20); // Keep only last 20 notifications
      
      await cacheService.set(`notifications:${userId}`, notifications, {
        ttl: 86400, // 24 hours
        tags: ['notifications', `user:${userId}`]
      });
      
      logger.info(`Notification sent to user: ${userId}`);
    } catch (error) {
      logger.error('Notification broadcast error:', error);
    }
  }

  async broadcastToRoom(room: string, event: string, data: any) {
    try {
      const realTimeEvent: RealTimeEvent = {
        type: event,
        data,
        timestamp: new Date().toISOString()
      };

      this.wsServer.emitToRoom(room, event, realTimeEvent);
      
      logger.info(`Event ${event} broadcasted to room: ${room}`);
    } catch (error) {
      logger.error(`Room broadcast error for ${room}:`, error);
    }
  }

  async broadcastPresenceUpdate(userId: string, status: 'online' | 'offline' | 'away') {
    try {
      const event: RealTimeEvent = {
        type: 'presence-update',
        data: { userId, status },
        timestamp: new Date().toISOString(),
        userId
      };

      // Broadcast to all connected users
      this.wsServer.broadcast('presence-update', event);
      
      // Update presence in cache
      await cacheService.set(`presence:${userId}`, { status, timestamp: new Date().toISOString() }, {
        ttl: 300,
        tags: ['presence', `user:${userId}`]
      });
      
      logger.info(`Presence update sent for user: ${userId} (${status})`);
    } catch (error) {
      logger.error('Presence update broadcast error:', error);
    }
  }

  async broadcastCollaborationUpdate(room: string, update: any) {
    try {
      const event: RealTimeEvent = {
        type: 'collaboration-update',
        data: update,
        timestamp: new Date().toISOString()
      };

      this.wsServer.emitToRoom(room, 'collaboration-update', event);
      
      logger.info(`Collaboration update sent to room: ${room}`);
    } catch (error) {
      logger.error('Collaboration update broadcast error:', error);
    }
  }

  async getConnectedClients(): Promise<number> {
    return this.wsServer.getConnectedClients();
  }

  async getRooms(): Promise<string[]> {
    return this.wsServer.getRooms();
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
