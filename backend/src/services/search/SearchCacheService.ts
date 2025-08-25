import { redis } from '@/config/redis';
import { SearchQuery, SearchResult, SearchOptions } from '@/types/search';

export interface CacheConfig {
  ttl: number;
  maxSize: number;
  compression: boolean;
}

export class SearchCacheService {
  private readonly prefix = 'search:';
  private readonly config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 300, // 5 minutes default
      maxSize: 1000,
      compression: true,
      ...config
    };
  }

  /**
   * Generate cache key for search query
   */
  private generateCacheKey(query: SearchQuery, options: SearchOptions): string {
    const queryHash = this.hashQuery(query, options);
    return `${this.prefix}${queryHash}`;
  }

  /**
   * Hash search query for consistent cache keys
   */
  private hashQuery(query: SearchQuery, options: SearchOptions): string {
    const queryString = JSON.stringify({
      text: query.text,
      entities: query.entities?.sort(),
      filters: query.filters?.sort((a, b) => a.field.localeCompare(b.field)),
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: options.page,
      limit: options.limit,
      skipCache: options.skipCache
    });
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < queryString.length; i++) {
      const char = queryString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached search result
   */
  async get(query: SearchQuery, options: SearchOptions): Promise<SearchResult | null> {
    try {
      if (options.skipCache) {
        return null;
      }

      const key = this.generateCacheKey(query, options);
      const cached = await redis.get(key);
      
      if (cached) {
        await this.recordCacheHit(key);
        return JSON.parse(cached);
      }

      await this.recordCacheMiss(key);
      return null;
    } catch (error) {
      console.error('Search cache get error:', error);
      return null;
    }
  }

  /**
   * Set search result in cache
   */
  async set(query: SearchQuery, options: SearchOptions, result: SearchResult): Promise<void> {
    try {
      if (options.skipCache) {
        return;
      }

      const key = this.generateCacheKey(query, options);
      const serialized = JSON.stringify(result);
      
      await redis.setex(key, this.config.ttl, serialized);
      await this.recordCacheSet(key, serialized.length);
    } catch (error) {
      console.error('Search cache set error:', error);
    }
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(`${this.prefix}${pattern}`);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`Invalidated ${keys.length} search cache keys`);
      }
    } catch (error) {
      console.error('Search cache invalidation error:', error);
    }
  }

  /**
   * Clear all search cache
   */
  async clear(): Promise<void> {
    try {
      const keys = await redis.keys(`${this.prefix}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`Cleared ${keys.length} search cache keys`);
      }
    } catch (error) {
      console.error('Search cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    hits: number;
    misses: number;
    sets: number;
    size: number;
    hitRate: number;
  }> {
    try {
      const [hits, misses, sets, size] = await Promise.all([
        redis.get('search:stats:hits') || '0',
        redis.get('search:stats:misses') || '0',
        redis.get('search:stats:sets') || '0',
        redis.dbsize()
      ]);

      const hitCount = parseInt(hits || '0');
      const missCount = parseInt(misses || '0');
      const setCount = parseInt(sets || '0');
      const totalRequests = hitCount + missCount;
      const hitRate = totalRequests > 0 ? (hitCount / totalRequests) * 100 : 0;

      return {
        hits: hitCount,
        misses: missCount,
        sets: setCount,
        size,
        hitRate: Math.round(hitRate * 100) / 100
      };
    } catch (error) {
      console.error('Search cache stats error:', error);
      return { hits: 0, misses: 0, sets: 0, size: 0, hitRate: 0 };
    }
  }

  /**
   * Record cache hit
   */
  private async recordCacheHit(key: string): Promise<void> {
    try {
      await redis.incr('search:stats:hits');
    } catch (error) {
      console.error('Cache hit recording error:', error);
    }
  }

  /**
   * Record cache miss
   */
  private async recordCacheMiss(key: string): Promise<void> {
    try {
      await redis.incr('search:stats:misses');
    } catch (error) {
      console.error('Cache miss recording error:', error);
    }
  }

  /**
   * Record cache set
   */
  private async recordCacheSet(key: string, size: number): Promise<void> {
    try {
      await redis.incr('search:stats:sets');
    } catch (error) {
      console.error('Cache set recording error:', error);
    }
  }

  /**
   * Warm cache with popular searches
   */
  async warmCache(popularQueries: Array<{ query: SearchQuery; options: SearchOptions }>): Promise<void> {
    try {
      console.log(`Warming cache with ${popularQueries.length} popular queries`);
      
      for (const { query, options } of popularQueries) {
        // This would typically trigger a search and cache the result
        // For now, we'll just log the warming attempt
        console.log(`Warming cache for query: ${JSON.stringify(query)}`);
      }
    } catch (error) {
      console.error('Cache warming error:', error);
    }
  }
}

export const searchCacheService = new SearchCacheService();
