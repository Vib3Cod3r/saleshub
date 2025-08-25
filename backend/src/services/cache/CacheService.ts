import Redis from 'ioredis';
import { logger } from '../../utils/logger';

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
  tags?: string[];
}

export class CacheService {
  private redis: Redis;
  private readonly DEFAULT_TTL = 300; // 5 minutes

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    this.redis.on('ready', () => {
      logger.info('Redis is ready');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const start = Date.now();
      const value = await this.redis.get(key);
      const duration = Date.now() - start;
      
      logger.debug(`Cache GET: ${key} | Duration: ${duration}ms | Hit: ${value !== null}`);
      
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || this.DEFAULT_TTL;
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const serialized = JSON.stringify(value);
      
      const start = Date.now();
      await this.redis.setex(fullKey, ttl, serialized);
      const duration = Date.now() - start;
      
      logger.debug(`Cache SET: ${fullKey} | TTL: ${ttl}s | Duration: ${duration}ms`);
      
      if (options.tags) {
        await this.addToTags(fullKey, options.tags);
      }
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const start = Date.now();
      await this.redis.del(key);
      const duration = Date.now() - start;
      
      logger.debug(`Cache DELETE: ${key} | Duration: ${duration}ms`);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const start = Date.now();
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug(`Cache INVALIDATE: ${pattern} | Keys: ${keys.length} | Duration: ${Date.now() - start}ms`);
      }
    } catch (error) {
      logger.error('Cache invalidate error:', error);
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      const start = Date.now();
      const keys = await this.redis.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        await this.redis.del(`tag:${tag}`);
        logger.debug(`Cache INVALIDATE BY TAG: ${tag} | Keys: ${keys.length} | Duration: ${Date.now() - start}ms`);
      }
    } catch (error) {
      logger.error('Cache tag invalidation error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  async increment(key: string, value: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, value);
    } catch (error) {
      logger.error('Cache increment error:', error);
      return 0;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redis.expire(key, ttl);
    } catch (error) {
      logger.error('Cache expire error:', error);
    }
  }

  async getStats(): Promise<{
    connected: boolean;
    memory: any;
    info: any;
    keys: number;
  }> {
    try {
      const info = await this.redis.info();
      const memory = await this.redis.info('memory');
      const keys = await this.redis.dbsize();
      
      return {
        connected: this.redis.status === 'ready',
        memory: this.parseRedisInfo(memory),
        info: this.parseRedisInfo(info),
        keys,
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return {
        connected: false,
        memory: {},
        info: {},
        keys: 0,
      };
    }
  }

  private async addToTags(key: string, tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        await this.redis.sadd(`tag:${tag}`, key);
      }
    } catch (error) {
      logger.error('Cache add to tags error:', error);
    }
  }

  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const result: any = {};
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }
    
    return result;
  }

  // Cache warming for frequently accessed data
  async warmCache(): Promise<void> {
    try {
      logger.info('Starting cache warming...');
      
      await this.warmAnalyticsCache();
      await this.warmUserPermissionsCache();
      await this.warmConfigCache();
      
      logger.info('Cache warming completed');
    } catch (error) {
      logger.error('Cache warming error:', error);
    }
  }

  private async warmAnalyticsCache(): Promise<void> {
    // Warm analytics data that's frequently accessed
    logger.debug('Warming analytics cache...');
  }

  private async warmUserPermissionsCache(): Promise<void> {
    // Warm user permissions data
    logger.debug('Warming user permissions cache...');
  }

  private async warmConfigCache(): Promise<void> {
    // Warm configuration data
    logger.debug('Warming config cache...');
  }

  /**
   * Add to sorted set
   */
  async zadd(key: string, score: number, member: string): Promise<number> {
    return await this.redis.zadd(key, score, member);
  }

  /**
   * Get range from sorted set
   */
  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.redis.zrange(key, start, stop);
  }

  /**
   * Remove from sorted set
   */
  async zrem(key: string, ...members: string[]): Promise<number> {
    return await this.redis.zrem(key, ...members);
  }

  /**
   * Get sorted set cardinality
   */
  async zcard(key: string): Promise<number> {
    return await this.redis.zcard(key);
  }

  async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
      logger.info('Redis disconnected');
    } catch (error) {
      logger.error('Redis disconnect error:', error);
    }
  }
}

// Singleton instance
export const cacheService = new CacheService();

