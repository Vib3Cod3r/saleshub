import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '@/utils/database';

export interface QueryOptions {
  include?: any;
  select?: any;
  where?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
}

export interface QueryBuilder<T> {
  where(condition: any): QueryBuilder<T>;
  include(relation: any): QueryBuilder<T>;
  select(fields: any): QueryBuilder<T>;
  orderBy(field: string, direction?: 'asc' | 'desc'): QueryBuilder<T>;
  paginate(page: number, limit: number): QueryBuilder<T>;
  build(): any;
  execute(): Promise<T>;
}

export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Create a query builder for a specific model
   */
  query<T>(modelName: string): QueryBuilder<T> {
    let query: any = {};
    let model: any = (this.prisma as any)[modelName];

    const builder: QueryBuilder<T> = {
      where(condition: any) {
        query.where = { ...query.where, ...condition };
        return builder;
      },

      include(relation: any) {
        query.include = { ...query.include, ...relation };
        return builder;
      },

      select(fields: any) {
        query.select = { ...query.select, ...fields };
        return builder;
      },

      orderBy(field: string, direction: 'asc' | 'desc' = 'desc') {
        query.orderBy = { [field]: direction };
        return builder;
      },

      paginate(page: number, limit: number) {
        query.skip = (page - 1) * limit;
        query.take = limit;
        return builder;
      },

      build() {
        return query;
      },

      async execute(): Promise<T> {
        return await model.findMany(query);
      },
    };

    return builder;
  }

  /**
   * Execute a transaction with automatic rollback on error
   */
  async transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(fn);
  }

  /**
   * Execute multiple operations in a transaction
   */
  async batchTransaction(operations: Array<(tx: any) => Promise<any>>): Promise<any[]> {
    // Execute operations sequentially in a transaction
    return await this.transaction(async (tx) => {
      const results = [];
      for (const operation of operations) {
        results.push(await operation(tx));
      }
      return results;
    });
  }

  /**
   * Create a record with transaction
   */
  async createWithTransaction<T>(
    modelName: string,
    data: any,
    include?: any
  ): Promise<T> {
    return await this.transaction(async (tx) => {
      return await (tx as any)[modelName].create({
        data,
        include,
      });
    });
  }

  /**
   * Update a record with transaction
   */
  async updateWithTransaction<T>(
    modelName: string,
    id: string,
    data: any,
    include?: any
  ): Promise<T> {
    return await this.transaction(async (tx) => {
      return await (tx as any)[modelName].update({
        where: { id },
        data,
        include,
      });
    });
  }

  /**
   * Delete a record with transaction
   */
  async deleteWithTransaction<T>(modelName: string, id: string): Promise<T> {
    return await this.transaction(async (tx) => {
      return await (tx as any)[modelName].delete({
        where: { id },
      });
    });
  }

  /**
   * Find records with complex filtering
   */
  async findWithFilters<T>(
    modelName: string,
    filters: any,
    options: QueryOptions = {}
  ): Promise<T[]> {
    const { include, select, where, orderBy, skip, take } = options;

    const query: any = {};

    if (where) query.where = where;
    if (include) query.include = include;
    if (select) query.select = select;
    if (orderBy) query.orderBy = orderBy;
    if (skip !== undefined) query.skip = skip;
    if (take !== undefined) query.take = take;

    // Apply filters
    if (filters) {
      query.where = { ...query.where, ...filters };
    }

    return await (this.prisma as any)[modelName].findMany(query);
  }

  /**
   * Count records with filters
   */
  async countWithFilters(modelName: string, filters: any = {}): Promise<number> {
    return await (this.prisma as any)[modelName].count({
      where: filters,
    });
  }

  /**
   * Check if record exists with filters
   */
  async existsWithFilters(modelName: string, filters: any): Promise<boolean> {
    const count = await (this.prisma as any)[modelName].count({
      where: filters,
    });
    return count > 0;
  }

  /**
   * Find first record with filters
   */
  async findFirstWithFilters<T>(
    modelName: string,
    filters: any,
    options: QueryOptions = {}
  ): Promise<T | null> {
    const { include, select, orderBy } = options;

    const query: any = { where: filters };

    if (include) query.include = include;
    if (select) query.select = select;
    if (orderBy) query.orderBy = orderBy;

    return await (this.prisma as any)[modelName].findFirst(query);
  }

  /**
   * Upsert a record (create or update)
   */
  async upsert<T>(
    modelName: string,
    where: any,
    createData: any,
    updateData: any,
    include?: any
  ): Promise<T> {
    return await (this.prisma as any)[modelName].upsert({
      where,
      create: createData,
      update: updateData,
      include,
    });
  }

  /**
   * Connect to database and test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<any> {
    try {
      const stats = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_rows,
          n_dead_tup as dead_rows
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC
      `;
      return stats;
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return null;
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
