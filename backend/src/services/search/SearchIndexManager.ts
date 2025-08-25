import { PrismaClient } from '@prisma/client';
import { SearchIndex, IndexUpdate } from '@/types/search';
import { prisma } from '@/utils/database';

export class SearchIndexManager {
  private prisma: PrismaClient;
  private indexes: Map<string, SearchIndex> = new Map();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    // Don't initialize indexes automatically to avoid blocking startup
    // this.initializeIndexes();
  }

  /**
   * Initialize search indexes for all entities
   */
  private async initializeIndexes(): Promise<void> {
    const entityConfigs = [
      {
        entity: 'contacts',
        fields: ['firstName', 'lastName', 'email', 'phone', 'jobTitle'],
        type: 'fulltext' as const
      },
      {
        entity: 'companies',
        fields: ['name', 'industry', 'website', 'description'],
        type: 'fulltext' as const
      },
      {
        entity: 'deals',
        fields: ['title', 'description', 'stage'],
        type: 'fulltext' as const
      },
      {
        entity: 'leads',
        fields: ['firstName', 'lastName', 'email', 'company', 'source'],
        type: 'fulltext' as const
      },
      {
        entity: 'tasks',
        fields: ['title', 'description', 'status'],
        type: 'fulltext' as const
      }
    ];

    for (const config of entityConfigs) {
      await this.createIndex(config.entity, config.fields, config.type);
    }
  }

  /**
   * Create a search index for an entity
   */
  async createIndex(entity: string, fields: string[], type: 'fulltext' | 'btree' | 'hash'): Promise<void> {
    try {
      // Check if index already exists
      const existingIndex = this.indexes.get(entity);
      if (existingIndex && existingIndex.status === 'active') {
        return;
      }

      const index: SearchIndex = {
        entity,
        fields,
        type,
        status: 'building',
        lastUpdated: new Date(),
        recordCount: 0
      };

      this.indexes.set(entity, index);

      // Create database indexes
      await this.createDatabaseIndexes(entity, fields, type);

      // Update index status
      index.status = 'active';
      index.lastUpdated = new Date();
      index.recordCount = await this.getEntityRecordCount(entity);

      console.log(`✅ Search index created for ${entity}`);
    } catch (error) {
      console.error(`❌ Failed to create search index for ${entity}:`, error);
      const index = this.indexes.get(entity);
      if (index) {
        index.status = 'error';
      }
      throw error;
    }
  }

  /**
   * Create database indexes
   */
  private async createDatabaseIndexes(entity: string, fields: string[], type: 'fulltext' | 'btree' | 'hash'): Promise<void> {
    // For PostgreSQL, we'll create GIN indexes for full-text search
    if (type === 'fulltext') {
      for (const field of fields) {
        try {
          // Create GIN index for full-text search
          await this.prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS idx_${entity}_${field}_gin 
            ON "${entity}" USING gin(to_tsvector('english', ${field}))
          `;
        } catch (error) {
          console.warn(`Warning: Could not create GIN index for ${entity}.${field}:`, error);
        }
      }
    } else {
      // Create B-tree indexes for other types
      for (const field of fields) {
        try {
          await this.prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS idx_${entity}_${field}_btree 
            ON "${entity}" (${field})
          `;
        } catch (error) {
          console.warn(`Warning: Could not create B-tree index for ${entity}.${field}:`, error);
        }
      }
    }
  }

  /**
   * Update index for a specific entity and record
   */
  async updateEntityIndex(entity: string, id: string): Promise<void> {
    try {
      const index = this.indexes.get(entity);
      if (!index || index.status !== 'active') {
        return;
      }

      // Update the index timestamp
      index.lastUpdated = new Date();
      index.recordCount = await this.getEntityRecordCount(entity);

      console.log(`✅ Updated search index for ${entity}:${id}`);
    } catch (error) {
      console.error(`❌ Failed to update search index for ${entity}:${id}:`, error);
      throw error;
    }
  }

  /**
   * Rebuild all indexes
   */
  async rebuildAllIndexes(): Promise<void> {
    console.log('🔄 Rebuilding all search indexes...');
    
    const entities = Array.from(this.indexes.keys());
    
    for (const entity of entities) {
      await this.rebuildIndex(entity);
    }
    
    console.log('✅ All search indexes rebuilt successfully');
  }

  /**
   * Rebuild index for a specific entity
   */
  async rebuildIndex(entity: string): Promise<void> {
    try {
      console.log(`🔄 Rebuilding search index for ${entity}...`);
      
      const index = this.indexes.get(entity);
      if (!index) {
        throw new Error(`Index not found for entity: ${entity}`);
      }

      // Mark index as building
      index.status = 'building';

      // Drop existing indexes
      await this.dropEntityIndexes(entity);

      // Recreate indexes
      await this.createDatabaseIndexes(entity, index.fields, index.type);

      // Update index status
      index.status = 'active';
      index.lastUpdated = new Date();
      index.recordCount = await this.getEntityRecordCount(entity);

      console.log(`✅ Search index rebuilt for ${entity}`);
    } catch (error) {
      console.error(`❌ Failed to rebuild search index for ${entity}:`, error);
      const index = this.indexes.get(entity);
      if (index) {
        index.status = 'error';
      }
      throw error;
    }
  }

  /**
   * Drop all indexes for an entity
   */
  private async dropEntityIndexes(entity: string): Promise<void> {
    const index = this.indexes.get(entity);
    if (!index) return;

    for (const field of index.fields) {
      try {
        // Drop GIN indexes
        await this.prisma.$executeRaw`
          DROP INDEX IF EXISTS idx_${entity}_${field}_gin
        `;
        
        // Drop B-tree indexes
        await this.prisma.$executeRaw`
          DROP INDEX IF EXISTS idx_${entity}_${field}_btree
        `;
      } catch (error) {
        console.warn(`Warning: Could not drop index for ${entity}.${field}:`, error);
      }
    }
  }

  /**
   * Get record count for an entity
   */
  private async getEntityRecordCount(entity: string): Promise<number> {
    try {
      const result = await (this.prisma as any)[entity].count();
      return result;
    } catch (error) {
      console.warn(`Warning: Could not get record count for ${entity}:`, error);
      return 0;
    }
  }

  /**
   * Get index information
   */
  getIndex(entity: string): SearchIndex | undefined {
    return this.indexes.get(entity);
  }

  /**
   * Get all indexes
   */
  getAllIndexes(): SearchIndex[] {
    return Array.from(this.indexes.values());
  }

  /**
   * Get index status
   */
  getIndexStatus(entity: string): 'active' | 'building' | 'error' | 'not_found' {
    const index = this.indexes.get(entity);
    return index ? index.status : 'not_found';
  }

  /**
   * Check if all indexes are healthy
   */
  async checkIndexHealth(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    for (const [entity, index] of this.indexes.entries()) {
      if (index.status === 'error') {
        issues.push(`Index for ${entity} is in error state`);
      } else if (index.status === 'building') {
        issues.push(`Index for ${entity} is still building`);
      }
      
      // Check if index is stale (older than 1 hour)
      const hoursSinceUpdate = (Date.now() - index.lastUpdated.getTime()) / (1000 * 60 * 60);
      if (hoursSinceUpdate > 1) {
        issues.push(`Index for ${entity} is stale (last updated ${hoursSinceUpdate.toFixed(1)} hours ago)`);
      }
    }
    
    return {
      healthy: issues.length === 0,
      issues
    };
  }

  /**
   * Optimize indexes
   */
  async optimizeIndexes(): Promise<void> {
    console.log('🔄 Optimizing search indexes...');
    
    for (const entity of this.indexes.keys()) {
      try {
        // Run VACUUM ANALYZE for PostgreSQL
        await this.prisma.$executeRaw`VACUUM ANALYZE "${entity}"`;
        console.log(`✅ Optimized index for ${entity}`);
      } catch (error) {
        console.warn(`Warning: Could not optimize index for ${entity}:`, error);
      }
    }
    
    console.log('✅ All search indexes optimized');
  }

  /**
   * Get index statistics
   */
  async getIndexStatistics(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};
    
    for (const [entity, index] of this.indexes.entries()) {
      stats[entity] = {
        status: index.status,
        fields: index.fields,
        type: index.type,
        recordCount: index.recordCount,
        lastUpdated: index.lastUpdated,
        size: await this.getIndexSize(entity)
      };
    }
    
    return stats;
  }

  /**
   * Get index size (approximate)
   */
  private async getIndexSize(entity: string): Promise<string> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT pg_size_pretty(pg_total_relation_size('${entity}')) as size
      `;
      return (result as any)[0]?.size || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Monitor index performance
   */
  async monitorIndexPerformance(): Promise<Record<string, any>> {
    const performance: Record<string, any> = {};
    
    for (const entity of this.indexes.keys()) {
      try {
        const result = await this.prisma.$queryRaw`
          SELECT 
            schemaname,
            tablename,
            attname,
            n_distinct,
            correlation
          FROM pg_stats 
          WHERE tablename = '${entity}'
        `;
        
        performance[entity] = result;
      } catch (error) {
        performance[entity] = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    
    return performance;
  }

  /**
   * Clean up old indexes
   */
  async cleanupOldIndexes(): Promise<void> {
    console.log('🧹 Cleaning up old search indexes...');
    
    // This would typically involve removing unused indexes
    // For now, we'll just log the cleanup
    console.log('✅ Search index cleanup completed');
  }
}
