import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache/CacheService';
import { logger } from '../utils/logger';

export interface CacheMiddlewareOptions {
  ttl?: number;
  prefix?: string;
  tags?: string[];
  keyGenerator?: (req: Request) => string;
  shouldCache?: (req: Request, res: Response) => boolean;
}

export const cacheMiddleware = (options: CacheMiddlewareOptions = {}) => {
  const {
    ttl = 300, // 5 minutes default
    prefix = 'api',
    tags = [],
    keyGenerator,
    shouldCache = () => true
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check if we should cache this request
    if (!shouldCache(req, res)) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator ? keyGenerator(req) : generateCacheKey(req, prefix);

    try {
      // Try to get from cache
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug(`Cache HIT: ${cacheKey}`);
        return res.json(cached);
      }

      logger.debug(`Cache MISS: ${cacheKey}`);

      // Store original send method
      const originalJson = res.json;
      const originalSend = res.send;

      // Override json method to cache responses
      res.json = function(data: any) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, data, {
            ttl,
            tags: [...tags, req.path.split('/')[1] || 'api'] // Add entity type as tag
          }).catch(error => {
            logger.error('Cache set error in middleware:', error);
          });
        }
        return originalJson.call(this, data);
      };

      // Override send method to cache responses
      res.send = function(data: any) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
            cacheService.set(cacheKey, jsonData, {
              ttl,
              tags: [...tags, req.path.split('/')[1] || 'api']
            }).catch(error => {
              logger.error('Cache set error in middleware:', error);
            });
          } catch (error) {
            // If data is not JSON, don't cache it
            logger.debug('Non-JSON response, skipping cache');
          }
        }
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Generate cache key from request
function generateCacheKey(req: Request, prefix: string): string {
  const path = req.originalUrl || req.url;
  const query = Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : '';
  const user = (req as any).user?.id || 'anonymous';
  
  return `${prefix}:${req.method}:${path}:${query}:${user}`;
}

// Specific cache middlewares for different entity types
export const contactCacheMiddleware = cacheMiddleware({
  ttl: 300, // 5 minutes
  prefix: 'contacts',
  tags: ['contacts'],
  shouldCache: (req, res) => {
    // Don't cache if user is not authenticated
    return !!(req as any).user?.id;
  }
});

export const companyCacheMiddleware = cacheMiddleware({
  ttl: 300,
  prefix: 'companies',
  tags: ['companies'],
  shouldCache: (req, res) => {
    return !!(req as any).user?.id;
  }
});

export const dealCacheMiddleware = cacheMiddleware({
  ttl: 180, // 3 minutes for deals (more dynamic)
  prefix: 'deals',
  tags: ['deals'],
  shouldCache: (req, res) => {
    return !!(req as any).user?.id;
  }
});

export const leadCacheMiddleware = cacheMiddleware({
  ttl: 180,
  prefix: 'leads',
  tags: ['leads'],
  shouldCache: (req, res) => {
    return !!(req as any).user?.id;
  }
});

export const analyticsCacheMiddleware = cacheMiddleware({
  ttl: 600, // 10 minutes for analytics
  prefix: 'analytics',
  tags: ['analytics'],
  shouldCache: (req, res) => {
    return !!(req as any).user?.id;
  }
});

// Cache invalidation middleware
export const cacheInvalidationMiddleware = (patterns: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original send method
    const originalJson = res.json;
    const originalSend = res.send;

    // Override methods to invalidate cache after successful operations
    res.json = function(data: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidateCache(patterns).catch(error => {
          logger.error('Cache invalidation error:', error);
        });
      }
      return originalJson.call(this, data);
    };

    res.send = function(data: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidateCache(patterns).catch(error => {
          logger.error('Cache invalidation error:', error);
        });
      }
      return originalSend.call(this, data);
    };

    next();
  };
};

async function invalidateCache(patterns: string[]): Promise<void> {
  for (const pattern of patterns) {
    await cacheService.invalidate(pattern);
  }
}

// Export common invalidation patterns
export const CACHE_PATTERNS = {
  CONTACTS: 'contacts:*',
  COMPANIES: 'companies:*',
  DEALS: 'deals:*',
  LEADS: 'leads:*',
  ANALYTICS: 'analytics:*',
  ALL_API: 'api:*'
};
