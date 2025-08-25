import { NotificationService } from './NotificationService';
import { EmailService } from './EmailService';
import { cacheService } from '../cache';
import { logger } from '../../utils/logger';
import { WebSocketServer } from '../../config/websocket';

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface NotificationPreferences {
  userId: string;
  realtime: boolean;
  email: boolean;
  push: boolean;
  categories: {
    system: boolean;
    deals: boolean;
    contacts: boolean;
    tasks: boolean;
    collaboration: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
    timezone: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface SmartNotificationRule {
  id: string;
  userId: string;
  name: string;
  conditions: {
    type: 'all' | 'any';
    rules: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
      value: any;
    }>;
  };
  actions: {
    channels: string[];
    priority: 'low' | 'normal' | 'high' | 'urgent';
    delay?: number; // seconds
  };
  enabled: boolean;
  createdAt: Date;
}

export class EnhancedNotificationService {
  private notificationService: NotificationService;
  private emailService: EmailService;
  private wsServer: WebSocketServer;
  private userPreferences: Map<string, NotificationPreferences> = new Map();
  private smartRules: Map<string, SmartNotificationRule[]> = new Map();

  constructor(notificationService: NotificationService, emailService: EmailService, wsServer: WebSocketServer) {
    this.notificationService = notificationService;
    this.emailService = emailService;
    this.wsServer = wsServer;
  }

  /**
   * Send enhanced notification with smart filtering
   */
  async sendEnhancedNotification(notification: any): Promise<void> {
    try {
      const userId = notification.userId;
      const preferences = await this.getUserPreferences(userId);
      
      if (!preferences) {
        // Use default preferences
        await this.sendDefaultNotification(notification);
        return;
      }

      // Check quiet hours
      if (this.isInQuietHours(preferences)) {
        logger.info(`Notification suppressed for user ${userId} during quiet hours`);
        return;
      }

      // Apply smart filtering
      const shouldSend = await this.evaluateSmartRules(userId, notification);
      if (!shouldSend) {
        logger.info(`Notification filtered by smart rules for user ${userId}`);
        return;
      }

      // Determine channels based on preferences and notification type
      const channels = this.determineChannels(preferences, notification);

      // Send notifications through selected channels
      await this.sendMultiChannelNotification(notification, channels, preferences);

      // Track notification analytics
      await this.trackNotificationAnalytics(userId, notification, channels);

      logger.info(`Enhanced notification sent to user ${userId} via channels: ${channels.join(', ')}`);
    } catch (error) {
      logger.error('Enhanced notification error:', error);
      throw error;
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(userId: string, pushData: PushNotificationData): Promise<void> {
    try {
      // Get user's push subscription
      const subscription = await this.getPushSubscription(userId);
      
      if (!subscription) {
        logger.warn(`No push subscription found for user ${userId}`);
        return;
      }

      // In a real implementation, you'd use a push service like Firebase Cloud Messaging
      // For now, we'll simulate push notification
      const pushNotification = {
        ...pushData,
        userId,
        timestamp: new Date().toISOString(),
        subscription
      };

      // Store push notification for delivery
      await cacheService.set(`push_notification:${Date.now()}_${userId}`, pushNotification, {
        ttl: 86400, // 24 hours
        tags: ['push_notifications', `user:${userId}`]
      });

      // Emit push notification event via WebSocket
      this.wsServer.emitToUser(userId, 'push_notification', pushNotification);

      logger.info(`Push notification queued for user ${userId}: ${pushData.title}`);
    } catch (error) {
      logger.error('Push notification error:', error);
      throw error;
    }
  }

  /**
   * Set user notification preferences
   */
  async setUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const existingPreferences = await this.getUserPreferences(userId);
      
      const updatedPreferences: NotificationPreferences = {
        userId,
        realtime: true,
        email: true,
        push: false,
        categories: {
          system: true,
          deals: true,
          contacts: true,
          tasks: true,
          collaboration: true
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: 'UTC'
        },
        frequency: 'immediate',
        ...existingPreferences,
        ...preferences
      };

      // Store preferences in cache
      await cacheService.set(`notification_preferences:${userId}`, updatedPreferences, {
        ttl: 0, // No expiration
        tags: ['notification_preferences', `user:${userId}`]
      });

      this.userPreferences.set(userId, updatedPreferences);

      logger.info(`Notification preferences updated for user ${userId}`);
    } catch (error) {
      logger.error('Set user preferences error:', error);
      throw error;
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      // Check memory cache first
      if (this.userPreferences.has(userId)) {
        return this.userPreferences.get(userId)!;
      }

      // Get from Redis cache
      const preferences = await cacheService.get<NotificationPreferences>(`notification_preferences:${userId}`);
      
      if (preferences) {
        this.userPreferences.set(userId, preferences);
      }

      return preferences;
    } catch (error) {
      logger.error('Get user preferences error:', error);
      return null;
    }
  }

  /**
   * Create smart notification rule
   */
  async createSmartRule(userId: string, rule: Omit<SmartNotificationRule, 'id' | 'userId' | 'createdAt'>): Promise<SmartNotificationRule> {
    try {
      const smartRule: SmartNotificationRule = {
        ...rule,
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        createdAt: new Date()
      };

      // Store rule in cache
      await cacheService.set(`smart_rule:${smartRule.id}`, smartRule, {
        ttl: 0, // No expiration
        tags: ['smart_rules', `user:${userId}`]
      });

      // Add to memory cache
      if (!this.smartRules.has(userId)) {
        this.smartRules.set(userId, []);
      }
      this.smartRules.get(userId)!.push(smartRule);

      logger.info(`Smart notification rule created for user ${userId}: ${rule.name}`);
      return smartRule;
    } catch (error) {
      logger.error('Create smart rule error:', error);
      throw error;
    }
  }

  /**
   * Get user's smart notification rules
   */
  async getUserSmartRules(userId: string): Promise<SmartNotificationRule[]> {
    try {
      // Check memory cache first
      if (this.smartRules.has(userId)) {
        return this.smartRules.get(userId)!;
      }

      // In a real implementation, you'd query all rules for the user
      // For now, return empty array
      return [];
    } catch (error) {
      logger.error('Get user smart rules error:', error);
      return [];
    }
  }

  /**
   * Send bulk notifications with smart filtering
   */
  async sendBulkNotifications(notifications: any[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = notifications.map(async (notification) => {
      try {
        await this.sendEnhancedNotification(notification);
        success++;
      } catch (error) {
        logger.error('Bulk notification failed:', error);
        failed++;
      }
    });

    await Promise.allSettled(promises);

    logger.info(`Bulk notifications completed: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Get notification analytics for user
   */
  async getNotificationAnalytics(userId: string, timeRange: '1h' | '24h' | '7d' = '24h'): Promise<any> {
    try {
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

      // In a real implementation, you'd query notification analytics from database/cache
      // For now, return mock analytics
      const analytics = {
        totalSent: Math.floor(Math.random() * 100) + 10,
        totalDelivered: Math.floor(Math.random() * 90) + 8,
        totalRead: Math.floor(Math.random() * 70) + 5,
        channels: {
          realtime: Math.floor(Math.random() * 50) + 5,
          email: Math.floor(Math.random() * 30) + 3,
          push: Math.floor(Math.random() * 20) + 2
        },
        categories: {
          system: Math.floor(Math.random() * 20) + 2,
          deals: Math.floor(Math.random() * 30) + 3,
          contacts: Math.floor(Math.random() * 25) + 2,
          tasks: Math.floor(Math.random() * 15) + 1,
          collaboration: Math.floor(Math.random() * 10) + 1
        },
        timeRange
      };

      return analytics;
    } catch (error) {
      logger.error('Get notification analytics error:', error);
      return null;
    }
  }

  /**
   * Check if current time is in quiet hours
   */
  private isInQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: preferences.quietHours.timezone 
    });

    const start = preferences.quietHours.start;
    const end = preferences.quietHours.end;

    // Simple time comparison (in production, you'd use proper timezone handling)
    return currentTime >= start || currentTime <= end;
  }

  /**
   * Evaluate smart notification rules
   */
  private async evaluateSmartRules(userId: string, notification: any): Promise<boolean> {
    try {
      const rules = await this.getUserSmartRules(userId);
      
      for (const rule of rules) {
        if (!rule.enabled) continue;

        const matches = this.evaluateRuleConditions(rule.conditions, notification);
        
        if (matches) {
          // Apply rule actions (delay, priority, etc.)
          if (rule.actions.delay) {
            await this.delayNotification(notification, rule.actions.delay);
          }
          
          return true; // Rule matched, send notification
        }
      }

      return true; // No rules matched, send by default
    } catch (error) {
      logger.error('Evaluate smart rules error:', error);
      return true; // Default to sending on error
    }
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateRuleConditions(conditions: SmartNotificationRule['conditions'], notification: any): boolean {
    const results = conditions.rules.map(rule => {
      const value = this.getNestedValue(notification, rule.field);
      
      switch (rule.operator) {
        case 'equals':
          return value === rule.value;
        case 'contains':
          return String(value).includes(String(rule.value));
        case 'greater_than':
          return Number(value) > Number(rule.value);
        case 'less_than':
          return Number(value) < Number(rule.value);
        case 'in':
          return Array.isArray(rule.value) && rule.value.includes(value);
        default:
          return false;
      }
    });

    return conditions.type === 'all' ? results.every(Boolean) : results.some(Boolean);
  }

  /**
   * Get nested object value
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Determine notification channels based on preferences
   */
  private determineChannels(preferences: NotificationPreferences, notification: any): string[] {
    const channels: string[] = [];

    // Check category preferences
    const category = notification.category || 'system';
    if (!preferences.categories[category as keyof typeof preferences.categories]) {
      return channels; // Category disabled
    }

    // Add channels based on preferences
    if (preferences.realtime) channels.push('realtime');
    if (preferences.email) channels.push('email');
    if (preferences.push) channels.push('push');

    return channels;
  }

  /**
   * Send notification through multiple channels
   */
  private async sendMultiChannelNotification(
    notification: any, 
    channels: string[], 
    preferences: NotificationPreferences
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const channel of channels) {
      switch (channel) {
        case 'realtime':
          promises.push(this.notificationService.sendNotification({
            ...notification,
            channels: ['realtime']
          }));
          break;
        case 'email':
          promises.push(this.emailService.sendNotificationEmail(notification));
          break;
        case 'push':
          promises.push(this.sendPushNotification(notification.userId, {
            title: notification.title,
            body: notification.message,
            data: notification.data
          }));
          break;
      }
    }

    await Promise.allSettled(promises);
  }

  /**
   * Send default notification (fallback)
   */
  private async sendDefaultNotification(notification: any): Promise<void> {
    await this.notificationService.sendNotification({
      ...notification,
      channels: ['realtime']
    });
  }

  /**
   * Get push subscription for user
   */
  private async getPushSubscription(userId: string): Promise<any> {
    // In a real implementation, you'd get this from database
    return await cacheService.get<any>(`push_subscription:${userId}`);
  }

  /**
   * Delay notification delivery
   */
  private async delayNotification(notification: any, delaySeconds: number): Promise<void> {
    const delayedNotification = {
      ...notification,
      scheduledFor: new Date(Date.now() + delaySeconds * 1000)
    };

    await cacheService.set(`delayed_notification:${Date.now()}_${notification.userId}`, delayedNotification, {
      ttl: delaySeconds + 3600, // Delay + 1 hour buffer
      tags: ['delayed_notifications', `user:${notification.userId}`]
    });
  }

  /**
   * Track notification analytics
   */
  private async trackNotificationAnalytics(userId: string, notification: any, channels: string[]): Promise<void> {
    try {
      const analytics = {
        userId,
        notificationId: notification.id || `notif_${Date.now()}`,
        type: notification.type || 'system',
        category: notification.category || 'system',
        channels,
        timestamp: new Date().toISOString()
      };

      await cacheService.set(`notification_analytics:${Date.now()}_${userId}`, analytics, {
        ttl: 86400 * 30, // 30 days
        tags: ['notification_analytics', `user:${userId}`]
      });
    } catch (error) {
      logger.error('Track notification analytics error:', error);
    }
  }
}
