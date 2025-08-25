import nodemailer from 'nodemailer';
import { logger } from '../../utils/logger';

export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  html?: string;
  from?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    });
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(notification: any): Promise<void> {
    try {
      if (!notification.userEmail) {
        logger.warn('No email address provided for notification');
        return;
      }

      const emailNotification: EmailNotification = {
        to: notification.userEmail,
        subject: notification.title || 'New Notification',
        body: notification.message || '',
        html: this.generateEmailHTML(notification),
        from: process.env.SMTP_FROM || 'noreply@saleshub.com'
      };

      await this.sendEmail(emailNotification);

      logger.info(`Email notification sent to ${notification.userEmail}: ${notification.title}`);
    } catch (error) {
      logger.error('Email notification error:', error);
      throw error;
    }
  }

  /**
   * Send generic email
   */
  async sendEmail(emailNotification: EmailNotification): Promise<void> {
    try {
      const mailOptions = {
        from: emailNotification.from || process.env.SMTP_FROM || 'noreply@saleshub.com',
        to: emailNotification.to,
        subject: emailNotification.subject,
        text: emailNotification.body,
        html: emailNotification.html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.debug('Email sent successfully:', info.messageId);
    } catch (error) {
      logger.error('Email sending error:', error);
      throw error;
    }
  }

  /**
   * Generate HTML email template
   */
  private generateEmailHTML(notification: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${notification.title || 'Notification'}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SalesHub CRM</h1>
            </div>
            <div class="content">
              <h2>${notification.title || 'New Notification'}</h2>
              <p>${notification.message || ''}</p>
              ${notification.actionUrl ? `<p><a href="${notification.actionUrl}" class="button">View Details</a></p>` : ''}
            </div>
            <div class="footer">
              <p>This is an automated notification from SalesHub CRM.</p>
              <p>If you have any questions, please contact support.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(emailNotifications: EmailNotification[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = emailNotifications.map(async (emailNotification) => {
      try {
        await this.sendEmail(emailNotification);
        success++;
      } catch (error) {
        logger.error('Bulk email failed:', error);
        failed++;
      }
    });

    await Promise.allSettled(promises);

    logger.info(`Bulk emails completed: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Verify email configuration
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}
