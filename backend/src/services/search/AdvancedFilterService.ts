import { FilterCriteria, FilterOperator, FilterGroup } from '@/types/search';

export interface DateRange {
  start: Date;
  end: Date;
  relative?: boolean;
}

export interface NumericRange {
  min: number;
  max: number;
  includeMin?: boolean;
  includeMax?: boolean;
}

export interface MultiSelectFilter {
  field: string;
  values: string[];
  operator: 'in' | 'notIn';
}

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: FilterCriteria[];
  isPublic?: boolean;
  createdBy: string;
  createdAt: Date;
  usageCount: number;
}

export class AdvancedFilterService {
  private readonly savedFilters: Map<string, SavedFilter> = new Map();

  /**
   * Apply advanced filters to search query
   */
  applyAdvancedFilters(
    baseFilters: FilterCriteria[],
    dateRanges: Record<string, DateRange> = {},
    numericRanges: Record<string, NumericRange> = {},
    multiSelectFilters: MultiSelectFilter[] = []
  ): FilterCriteria[] {
    const advancedFilters: FilterCriteria[] = [...baseFilters];

    // Add date range filters
    Object.entries(dateRanges).forEach(([field, range]) => {
      advancedFilters.push({
        field,
        operator: 'between',
        value: [range.start, range.end]
      });
    });

    // Add numeric range filters
    Object.entries(numericRanges).forEach(([field, range]) => {
      if (range.includeMin !== false) {
        advancedFilters.push({
          field,
          operator: 'gte',
          value: range.min
        });
      }
      if (range.includeMax !== false) {
        advancedFilters.push({
          field,
          operator: 'lte',
          value: range.max
        });
      }
    });

    // Add multi-select filters
    multiSelectFilters.forEach(filter => {
      advancedFilters.push({
        field: filter.field,
        operator: filter.operator,
        value: filter.values
      });
    });

    return advancedFilters;
  }

  /**
   * Create relative date filter
   */
  createRelativeDateFilter(field: string, relativeDate: string): FilterCriteria {
    const { start, end } = this.parseRelativeDate(relativeDate);
    
    return {
      field,
      operator: 'between',
      value: [start, end]
    };
  }

  /**
   * Parse relative date expressions
   */
  private parseRelativeDate(relativeDate: string): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (relativeDate.toLowerCase()) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'this_week':
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);
        break;
      case 'last_week':
        const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        const dayOfLastWeek = lastWeekStart.getDay();
        const daysToLastMonday = dayOfLastWeek === 0 ? 6 : dayOfLastWeek - 1;
        start = new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate() - daysToLastMonday);
        end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
        break;
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this_quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'last_quarter':
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
        const lastQuarterYear = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const lastQuarterMonth = lastQuarter < 0 ? 9 : lastQuarter * 3;
        start = new Date(lastQuarterYear, lastQuarterMonth, 1);
        end = new Date(lastQuarterYear, lastQuarterMonth + 3, 0);
        break;
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'last_year':
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case 'last_7_days':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'last_30_days':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        break;
      case 'last_90_days':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
        break;
      default:
        throw new Error(`Unknown relative date: ${relativeDate}`);
    }

    return { start, end };
  }

  /**
   * Create numeric range filter
   */
  createNumericRangeFilter(
    field: string,
    min: number,
    max: number,
    includeMin: boolean = true,
    includeMax: boolean = true
  ): FilterCriteria[] {
    const filters: FilterCriteria[] = [];

    if (includeMin) {
      filters.push({
        field,
        operator: 'gte',
        value: min
      });
    }

    if (includeMax) {
      filters.push({
        field,
        operator: 'lte',
        value: max
      });
    }

    return filters;
  }

  /**
   * Create multi-select filter
   */
  createMultiSelectFilter(field: string, values: string[], exclude: boolean = false): FilterCriteria {
    return {
      field,
      operator: exclude ? 'notIn' : 'in',
      value: values
    };
  }

  /**
   * Save filter template
   */
  saveFilter(
    name: string,
    filters: FilterCriteria[],
    description?: string,
    isPublic: boolean = false,
    userId: string = 'system'
  ): string {
    const id = this.generateFilterId();
    const savedFilter: SavedFilter = {
      id,
      name,
      description,
      filters,
      isPublic,
      createdBy: userId,
      createdAt: new Date(),
      usageCount: 0
    };

    this.savedFilters.set(id, savedFilter);
    return id;
  }

  /**
   * Load saved filter
   */
  loadFilter(filterId: string): FilterCriteria[] | null {
    const savedFilter = this.savedFilters.get(filterId);
    if (savedFilter) {
      savedFilter.usageCount++;
      return savedFilter.filters;
    }
    return null;
  }

  /**
   * Get all saved filters
   */
  getSavedFilters(userId?: string): SavedFilter[] {
    const filters = Array.from(this.savedFilters.values());
    
    if (userId) {
      return filters.filter(filter => 
        filter.createdBy === userId || filter.isPublic
      );
    }
    
    return filters;
  }

  /**
   * Delete saved filter
   */
  deleteFilter(filterId: string, userId: string): boolean {
    const filter = this.savedFilters.get(filterId);
    if (filter && (filter.createdBy === userId || filter.isPublic)) {
      this.savedFilters.delete(filterId);
      return true;
    }
    return false;
  }

  /**
   * Update saved filter
   */
  updateFilter(
    filterId: string,
    updates: Partial<Pick<SavedFilter, 'name' | 'description' | 'filters' | 'isPublic'>>,
    userId: string
  ): boolean {
    const filter = this.savedFilters.get(filterId);
    if (filter && filter.createdBy === userId) {
      Object.assign(filter, updates);
      return true;
    }
    return false;
  }

  /**
   * Get popular filters
   */
  getPopularFilters(limit: number = 10): SavedFilter[] {
    return Array.from(this.savedFilters.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * Validate filter criteria
   */
  validateFilter(filter: FilterCriteria): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!filter.field) {
      errors.push('Field is required');
    }

    if (!filter.operator) {
      errors.push('Operator is required');
    }

    if (filter.value === undefined || filter.value === null) {
      errors.push('Value is required');
    }

    // Validate operator-specific requirements
    switch (filter.operator) {
      case 'between':
        if (!Array.isArray(filter.value) || filter.value.length !== 2) {
          errors.push('Between operator requires an array with exactly 2 values');
        }
        break;
      case 'in':
      case 'notIn':
        if (!Array.isArray(filter.value)) {
          errors.push(`${filter.operator} operator requires an array of values`);
        }
        break;
      case 'isNull':
      case 'isNotNull':
        if (filter.value !== null) {
          errors.push(`${filter.operator} operator should have null value`);
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Optimize filter order for better performance
   */
  optimizeFilterOrder(filters: FilterCriteria[]): FilterCriteria[] {
    // Sort filters by selectivity (most selective first)
    return filters.sort((a, b) => {
      const selectivityA = this.getFilterSelectivity(a);
      const selectivityB = this.getFilterSelectivity(b);
      return selectivityB - selectivityA;
    });
  }

  /**
   * Calculate filter selectivity (lower is more selective)
   */
  private getFilterSelectivity(filter: FilterCriteria): number {
    switch (filter.operator) {
      case 'equals':
        return 0.1; // Very selective
      case 'in':
        return 0.2; // Selective
      case 'between':
        return 0.3; // Moderately selective
      case 'contains':
        return 0.7; // Less selective
      case 'startsWith':
        return 0.5; // Moderately selective
      case 'endsWith':
        return 0.5; // Moderately selective
      case 'gt':
      case 'gte':
      case 'lt':
      case 'lte':
        return 0.4; // Moderately selective
      case 'isNull':
      case 'isNotNull':
        return 0.6; // Less selective
      default:
        return 0.5;
    }
  }

  /**
   * Generate unique filter ID
   */
  private generateFilterId(): string {
    return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get filter statistics
   */
  getStats(): {
    totalFilters: number;
    publicFilters: number;
    averageUsage: number;
    mostUsedFilter?: string;
  } {
    const filters = Array.from(this.savedFilters.values());
    const totalFilters = filters.length;
    const publicFilters = filters.filter(f => f.isPublic).length;
    const averageUsage = totalFilters > 0 
      ? filters.reduce((sum, f) => sum + f.usageCount, 0) / totalFilters 
      : 0;
    const mostUsedFilter = filters.length > 0 
      ? filters.reduce((max, f) => f.usageCount > max.usageCount ? f : max).name 
      : undefined;

    return {
      totalFilters,
      publicFilters,
      averageUsage,
      mostUsedFilter
    };
  }
}

export const advancedFilterService = new AdvancedFilterService();
