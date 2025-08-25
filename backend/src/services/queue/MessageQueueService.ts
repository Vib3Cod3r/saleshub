import { cacheService } from '../cache';
import { logger } from '../../utils/logger';

export interface QueueMessage {
  id: string;
  type: string;
  data: any;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: number;
  retries: number;
  maxRetries: number;
  delay?: number; // seconds
  scheduledFor?: number; // timestamp
}

export interface QueueConfig {
  name: string;
  maxRetries: number;
  retryDelay: number; // seconds
  batchSize: number;
  processingTimeout: number; // seconds
}

export interface QueueStats {
  queueName: string;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  avgProcessingTime: number;
  throughput: number; // messages per minute
}

export class MessageQueueService {
  private queues: Map<string, QueueConfig> = new Map();
  private processors: Map<string, (message: QueueMessage) => Promise<void>> = new Map();
  private isProcessing: Map<string, boolean> = new Map();
  private stats: Map<string, QueueStats> = new Map();

  constructor() {
    this.initializeDefaultQueues();
  }

  /**
   * Initialize default queues
   */
  private initializeDefaultQueues() {
    // Notification queue
    this.createQueue('notifications', {
      name: 'notifications',
      maxRetries: 3,
      retryDelay: 60,
      batchSize: 10,
      processingTimeout: 30
    });

    // Document operations queue
    this.createQueue('document-operations', {
      name: 'document-operations',
      maxRetries: 2,
      retryDelay: 30,
      batchSize: 5,
      processingTimeout: 15
    });

    // Search operations queue
    this.createQueue('search-operations', {
      name: 'search-operations',
      maxRetries: 2,
      retryDelay: 30,
      batchSize: 20,
      processingTimeout: 10
    });

    // Analytics queue
    this.createQueue('analytics', {
      name: 'analytics',
      maxRetries: 1,
      retryDelay: 120,
      batchSize: 50,
      processingTimeout: 60
    });
  }

  /**
   * Create a new queue
   */
  createQueue(queueName: string, config: QueueConfig): void {
    this.queues.set(queueName, config);
    this.isProcessing.set(queueName, false);
    this.stats.set(queueName, {
      queueName,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      avgProcessingTime: 0,
      throughput: 0
    });

    logger.info(`Queue created: ${queueName}`);
  }

  /**
   * Register a message processor for a queue
   */
  registerProcessor(queueName: string, processor: (message: QueueMessage) => Promise<void>): void {
    this.processors.set(queueName, processor);
    logger.info(`Processor registered for queue: ${queueName}`);
  }

  /**
   * Enqueue a message
   */
  async enqueue(queueName: string, message: Omit<QueueMessage, 'id' | 'timestamp' | 'retries'>): Promise<string> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    const queueMessage: QueueMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: queue.maxRetries
    };

    // Calculate scheduled time if delay is specified
    if (message.delay) {
      queueMessage.scheduledFor = Date.now() + (message.delay * 1000);
    }

    // Store message in Redis
    const key = `queue:${queueName}:pending:${queueMessage.id}`;
    await cacheService.set(key, queueMessage, {
      ttl: 86400, // 24 hours
      tags: ['message_queue', `queue:${queueName}`]
    });

    // Add to priority queue
    await this.addToPriorityQueue(queueName, queueMessage);

    // Update stats
    await this.updateStats(queueName, 'pending', 1);

    logger.debug(`Message enqueued: ${queueMessage.id} in ${queueName}`);
    return queueMessage.id;
  }

  /**
   * Add message to priority queue
   */
  private async addToPriorityQueue(queueName: string, message: QueueMessage): Promise<void> {
    const priorityScore = this.calculatePriorityScore(message.priority, message.scheduledFor || message.timestamp);
    const key = `queue:${queueName}:priority`;
    
    // Use Redis sorted set for priority queue
    await cacheService.zadd(key, priorityScore, message.id);
  }

  /**
   * Calculate priority score
   */
  private calculatePriorityScore(priority: string, timestamp: number): number {
    const baseScore = Date.now() - timestamp; // Older messages have higher scores
    
    switch (priority) {
      case 'urgent':
        return baseScore + 1000000;
      case 'high':
        return baseScore + 100000;
      case 'normal':
        return baseScore + 10000;
      case 'low':
        return baseScore + 1000;
      default:
        return baseScore + 10000;
    }
  }

  /**
   * Start processing a queue
   */
  async startProcessing(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    const processor = this.processors.get(queueName);
    
    if (!queue || !processor) {
      throw new Error(`Queue or processor not found: ${queueName}`);
    }

    if (this.isProcessing.get(queueName)) {
      logger.warn(`Queue ${queueName} is already processing`);
      return;
    }

    this.isProcessing.set(queueName, true);
    logger.info(`Started processing queue: ${queueName}`);

    // Start processing loop
    this.processQueue(queueName, queue, processor);
  }

  /**
   * Stop processing a queue
   */
  async stopProcessing(queueName: string): Promise<void> {
    this.isProcessing.set(queueName, false);
    logger.info(`Stopped processing queue: ${queueName}`);
  }

  /**
   * Process queue messages
   */
  private async processQueue(
    queueName: string,
    config: QueueConfig,
    processor: (message: QueueMessage) => Promise<void>
  ): Promise<void> {
    while (this.isProcessing.get(queueName)) {
      try {
        // Get next batch of messages
        const messages = await this.getNextMessages(queueName, config.batchSize);
        
        if (messages.length === 0) {
          // No messages, wait before next check
          await this.sleep(1000);
          continue;
        }

        // Process messages in parallel
        const processingPromises = messages.map(message => 
          this.processMessage(queueName, message, processor, config)
        );

        await Promise.allSettled(processingPromises);

        // Update stats
        await this.updateStats(queueName, 'processing', messages.length);

      } catch (error) {
        logger.error(`Error processing queue ${queueName}:`, error);
        await this.sleep(5000); // Wait before retry
      }
    }
  }

  /**
   * Get next messages from queue
   */
  private async getNextMessages(queueName: string, batchSize: number): Promise<QueueMessage[]> {
    const priorityKey = `queue:${queueName}:priority`;
    const messages: QueueMessage[] = [];

    try {
      // Get message IDs from priority queue
      const messageIds = await cacheService.zrange(priorityKey, 0, batchSize - 1);
      
      if (messageIds.length === 0) {
        return messages;
      }

      // Get message data
      for (const messageId of messageIds) {
        const messageKey = `queue:${queueName}:pending:${messageId}`;
        const message = await cacheService.get<QueueMessage>(messageKey);
        
        if (message) {
          // Check if message is ready to be processed
          if (!message.scheduledFor || message.scheduledFor <= Date.now()) {
            messages.push(message);
          }
        }
      }

      // Remove processed message IDs from priority queue
      if (messages.length > 0) {
        await cacheService.zrem(priorityKey, ...messages.map(m => m.id));
      }

    } catch (error) {
      logger.error(`Error getting messages from queue ${queueName}:`, error);
    }

    return messages;
  }

  /**
   * Process a single message
   */
  private async processMessage(
    queueName: string,
    message: QueueMessage,
    processor: (message: QueueMessage) => Promise<void>,
    config: QueueConfig
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Process message
      await processor(message);
      
      // Mark as completed
      await this.markMessageCompleted(queueName, message.id);
      
      // Update processing time stats
      const processingTime = Date.now() - startTime;
      await this.updateProcessingTimeStats(queueName, processingTime);
      
      logger.debug(`Message processed successfully: ${message.id} in ${queueName}`);

    } catch (error) {
      logger.error(`Error processing message ${message.id}:`, error);
      
      // Handle retry logic
      await this.handleMessageRetry(queueName, message, config);
    }
  }

  /**
   * Handle message retry logic
   */
  private async handleMessageRetry(queueName: string, message: QueueMessage, config: QueueConfig): Promise<void> {
    message.retries++;
    
    if (message.retries >= config.maxRetries) {
      // Max retries reached, mark as failed
      await this.markMessageFailed(queueName, message.id);
      logger.error(`Message ${message.id} failed after ${message.retries} retries`);
    } else {
      // Schedule retry
      const retryDelay = config.retryDelay * Math.pow(2, message.retries - 1); // Exponential backoff
      message.scheduledFor = Date.now() + (retryDelay * 1000);
      
      // Update message in Redis
      const messageKey = `queue:${queueName}:pending:${message.id}`;
      await cacheService.set(messageKey, message, {
        ttl: 86400,
        tags: ['message_queue', `queue:${queueName}`]
      });
      
      // Re-add to priority queue
      await this.addToPriorityQueue(queueName, message);
      
      logger.warn(`Message ${message.id} scheduled for retry ${message.retries}/${config.maxRetries} in ${retryDelay}s`);
    }
  }

  /**
   * Mark message as completed
   */
  private async markMessageCompleted(queueName: string, messageId: string): Promise<void> {
    const messageKey = `queue:${queueName}:pending:${messageId}`;
    const completedKey = `queue:${queueName}:completed:${messageId}`;
    
    // Move message to completed
    const message = await cacheService.get<QueueMessage>(messageKey);
    if (message) {
      await cacheService.set(completedKey, { ...message, completedAt: Date.now() }, {
        ttl: 604800, // 7 days
        tags: ['message_queue', `queue:${queueName}`, 'completed']
      });
      await cacheService.delete(messageKey);
    }
    
    await this.updateStats(queueName, 'completed', 1);
  }

  /**
   * Mark message as failed
   */
  private async markMessageFailed(queueName: string, messageId: string): Promise<void> {
    const messageKey = `queue:${queueName}:pending:${messageId}`;
    const failedKey = `queue:${queueName}:failed:${messageId}`;
    
    // Move message to failed
    const message = await cacheService.get<QueueMessage>(messageKey);
    if (message) {
      await cacheService.set(failedKey, { ...message, failedAt: Date.now() }, {
        ttl: 604800, // 7 days
        tags: ['message_queue', `queue:${queueName}`, 'failed']
      });
      await cacheService.delete(messageKey);
    }
    
    await this.updateStats(queueName, 'failed', 1);
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: string): Promise<QueueStats | null> {
    return this.stats.get(queueName) || null;
  }

  /**
   * Get all queue statistics
   */
  async getAllQueueStats(): Promise<QueueStats[]> {
    return Array.from(this.stats.values());
  }

  /**
   * Update queue statistics
   */
  private async updateStats(queueName: string, type: keyof QueueStats, value: number): Promise<void> {
    const stats = this.stats.get(queueName);
    if (stats) {
      switch (type) {
        case 'pending':
          stats.pending += value;
          break;
        case 'processing':
          stats.processing += value;
          break;
        case 'completed':
          stats.completed += value;
          stats.processing = Math.max(0, stats.processing - value);
          break;
        case 'failed':
          stats.failed += value;
          stats.processing = Math.max(0, stats.processing - value);
          break;
      }
      
      // Calculate throughput (messages per minute)
      const now = Date.now();
      const timeWindow = 60000; // 1 minute
      stats.throughput = Math.round((stats.completed + stats.failed) / (timeWindow / 1000));
    }
  }

  /**
   * Update processing time statistics
   */
  private async updateProcessingTimeStats(queueName: string, processingTime: number): Promise<void> {
    const stats = this.stats.get(queueName);
    if (stats) {
      // Simple moving average
      const alpha = 0.1; // Smoothing factor
      stats.avgProcessingTime = stats.avgProcessingTime * (1 - alpha) + processingTime * alpha;
    }
  }

  /**
   * Clear completed messages
   */
  async clearCompletedMessages(queueName: string, olderThanDays: number = 7): Promise<number> {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    const pattern = `queue:${queueName}:completed:*`;
    
    // In a real implementation, you'd use Redis SCAN to find and delete old messages
    // For now, we'll return 0 as a placeholder
    logger.info(`Cleared completed messages older than ${olderThanDays} days for queue: ${queueName}`);
    return 0;
  }

  /**
   * Get queue size
   */
  async getQueueSize(queueName: string): Promise<number> {
    const priorityKey = `queue:${queueName}:priority`;
    return await cacheService.zcard(priorityKey);
  }

  /**
   * Utility function for sleeping
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
