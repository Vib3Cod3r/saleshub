import { RealTimeService } from '../realtime/RealTimeService';
import { logger } from '../../utils/logger';

export interface NotificationData {
  userId: string;
  userEmail?: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  channels?: string[];
  priority?: 'low' | 'medium' | 'high';
  scheduledAt?: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export class NotificationService {
  private realTimeService: RealTimeService;
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor(realTimeService: RealTimeService) {
    this.realTimeService = realTimeService;
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Initialize default notification templates
    this.templates.set('welcome', {
      id: 'welcome',
      name: 'Welcome Notification',
      subject: 'Welcome to SalesHub CRM!',
      body: 'Welcome {{userName}}! Your account has been successfully created.',
      variables: ['userName']
    });

    this.templates.set('deal-update', {
      id: 'deal-update',
      name: 'Deal Update',
      subject: 'Deal Update: {{dealTitle}}',
      body: 'The deal "{{dealTitle}}" has been updated to {{newStage}}.',
      variables: ['dealTitle', 'newStage']
    });

    this.templates.set('task-assigned', {
      id: 'task-assigned',
      name: 'Task Assigned',
      subject: 'New Task Assigned: {{taskTitle}}',
      body: 'You have been assigned a new task: "{{taskTitle}}" with priority {{priority}}.',
      variables: ['taskTitle', 'priority']
    });

    this.templates.set('lead-converted', {
      id: 'lead-converted',
      name: 'Lead Converted',
      subject: 'Lead Converted: {{leadName}}',
      body: 'The lead "{{leadName}}" has been successfully converted to a contact.',
      variables: ['leadName']
    });
  }

  async sendNotification(notification: NotificationData) {
    try {
      const channels = notification.channels || ['realtime'];
      const processedNotification = await this.processNotification(notification);
      
      const deliveryPromises: Promise<void>[] = [];

      // Send real-time notification
      if (channels.includes('realtime')) {
        deliveryPromises.push(
          this.sendRealTimeNotification(processedNotification)
        );
      }

      // Send email notification
      if (channels.includes('email') && notification.userEmail) {
        deliveryPromises.push(
          this.sendEmailNotification(processedNotification)
        );
      }

      // Send push notification
      if (channels.includes('push')) {
        deliveryPromises.push(
          this.sendPushNotification(processedNotification)
        );
      }

      // Wait for all notifications to be sent
      await Promise.allSettled(deliveryPromises);

      logger.info(`Notification sent to user ${notification.userId} via channels: ${channels.join(', ')}`);
    } catch (error) {
      logger.error('Notification sending error:', error);
      throw error;
    }
  }

  async sendBulkNotifications(notifications: NotificationData[]) {
    const promises = notifications.map(notification => 
      this.sendNotification(notification)
    );
    
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    logger.info(`Bulk notification results: ${successful} successful, ${failed} failed`);
    
    return { successful, failed, total: notifications.length };
  }

  async sendTemplateNotification(
    templateId: string,
    userId: string,
    variables: Record<string, string>,
    channels: string[] = ['realtime']
  ) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const notification: NotificationData = {
      userId,
      type: templateId,
      title: this.replaceVariables(template.subject, variables),
      message: this.replaceVariables(template.body, variables),
      channels,
      priority: 'medium'
    };

    return await this.sendNotification(notification);
  }

  async scheduleNotification(notification: NotificationData, scheduledAt: Date) {
    // For now, we'll implement immediate scheduling
    // In a production environment, you'd use a job queue like Bull/BullMQ
    const delay = scheduledAt.getTime() - Date.now();
    
    if (delay <= 0) {
      return await this.sendNotification(notification);
    }

    setTimeout(async () => {
      try {
        await this.sendNotification(notification);
        logger.info(`Scheduled notification sent to user: ${notification.userId}`);
      } catch (error) {
        logger.error(`Scheduled notification failed for user ${notification.userId}:`, error);
      }
    }, delay);

    logger.info(`Notification scheduled for user ${notification.userId} at ${scheduledAt.toISOString()}`);
  }

  async getUserNotifications(userId: string, limit: number = 20): Promise<any[]> {
    // This would typically query a notifications table
    // For now, return cached notifications
    const notifications = await this.getCachedNotifications(userId);
    return notifications.slice(0, limit);
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    // This would typically update a notifications table
    // For now, just log the action
    logger.info(`Notification ${notificationId} marked as read by user ${userId}`);
  }

  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    read: number;
  }> {
    const notifications = await this.getCachedNotifications(userId);
    const unread = notifications.filter(n => !n.read).length;
    
    return {
      total: notifications.length,
      unread,
      read: notifications.length - unread
    };
  }

  private async processNotification(notification: NotificationData): Promise<NotificationData> {
    // Add any processing logic here (e.g., template processing, variable replacement)
    return {
      ...notification,
      title: notification.title || 'Notification',
      message: notification.message || '',
      priority: notification.priority || 'medium',
      channels: notification.channels || ['realtime']
    };
  }

  private async sendRealTimeNotification(notification: NotificationData): Promise<void> {
    await this.realTimeService.broadcastNotification(notification.userId, {
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      priority: notification.priority
    });
  }

  private async sendEmailNotification(notification: NotificationData): Promise<void> {
    // For now, just log the email notification
    // In production, you'd integrate with an email service like SendGrid, Mailgun, etc.
    logger.info(`Email notification would be sent to ${notification.userEmail}: ${notification.title}`);
  }

  private async sendPushNotification(notification: NotificationData): Promise<void> {
    // For now, just log the push notification
    // In production, you'd integrate with push notification services like Firebase, OneSignal, etc.
    logger.info(`Push notification would be sent to user ${notification.userId}: ${notification.title}`);
  }

  private replaceVariables(text: string, variables: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return variables[variable] || match;
    });
  }

  private async getCachedNotifications(userId: string): Promise<any[]> {
    // This would typically query a database
    // For now, return empty array
    return [];
  }

  public addTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  public getTemplate(templateId: string): NotificationTemplate | undefined {
    return this.templates.get(templateId);
  }

  public getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }
}
