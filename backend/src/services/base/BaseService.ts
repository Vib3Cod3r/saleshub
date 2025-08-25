import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '@/utils/database';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterOptions {
  search?: string;
  [key: string]: any;
}

export abstract class BaseService<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * Create a new record
   */
  async create(data: CreateInput, include?: any): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].create({
        data,
        include,
      });
      return result;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Find a record by ID
   */
  async findById(id: string, include?: any): Promise<T | null> {
    try {
      const result = await (this.prisma as any)[this.modelName].findUnique({
        where: { id },
        include,
      });
      return result;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Find a record by ID or throw error
   */
  async findByIdOrThrow(id: string, include?: any): Promise<T> {
    const result = await this.findById(id, include);
    if (!result) {
      throw new Error(`${this.modelName} not found`);
    }
    return result;
  }

  /**
   * Find all records with pagination and filters
   */
  async findAll(
    options: PaginationOptions = {},
    filters: FilterOptions = {},
    include?: any
  ): Promise<PaginationResult<T>> {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;

      // Build where clause
      const where = this.buildWhereClause(filters);

      // Get total count
      const total = await (this.prisma as any)[this.modelName].count({ where });

      // Get records with pagination
      const data = await (this.prisma as any)[this.modelName].findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: UpdateInput, include?: any): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].update({
        where: { id },
        data,
        include,
      });
      return result;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].delete({
        where: { id },
      });
      return result;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Soft delete a record (if supported)
   */
  async softDelete(id: string): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].update({
        where: { id },
        data: { isActive: false },
      });
      return result;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Count records with filters
   */
  async count(filters: FilterOptions = {}): Promise<number> {
    try {
      const where = this.buildWhereClause(filters);
      return await (this.prisma as any)[this.modelName].count({ where });
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Check if record exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const count = await (this.prisma as any)[this.modelName].count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Build where clause from filters
   */
  protected buildWhereClause(filters: FilterOptions): any {
    const where: any = {};

    // Handle search filter
    if (filters.search) {
      where.OR = this.buildSearchClause(filters.search);
    }

    // Handle other filters
    Object.keys(filters).forEach((key) => {
      if (key !== 'search' && filters[key] !== undefined) {
        where[key] = filters[key];
      }
    });

    return where;
  }

  /**
   * Build search clause (to be overridden by subclasses)
   */
  protected buildSearchClause(search: string): any[] {
    return [];
  }

  /**
   * Handle database errors
   */
  protected handleDatabaseError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new Error('Duplicate entry found');
        case 'P2025':
          throw new Error('Record not found');
        case 'P2003':
          throw new Error('Foreign key constraint failed');
        default:
          throw new Error('Database operation failed');
      }
    }
    throw error;
  }

  /**
   * Execute database transaction
   */
  protected async transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(fn);
  }
}
