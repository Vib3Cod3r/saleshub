import { SearchQuery, FilterCriteria, BuiltSearchQuery, FilterOperator } from '@/types/search';

export class SearchQueryBuilder {
  private query: Partial<BuiltSearchQuery> = {
    entities: ['contacts', 'companies', 'deals', 'leads', 'tasks'],
    filters: [],
    page: 1,
    limit: 20
  };

  /**
   * Set full-text search query
   */
  fullText(text: string): SearchQueryBuilder {
    if (text && text.trim()) {
      this.query.text = text.trim();
    }
    return this;
  }

  /**
   * Set entities to search in
   */
  entities(entities: string[]): SearchQueryBuilder {
    this.query.entities = entities;
    return this;
  }

  /**
   * Add a single filter
   */
  filter(criteria: FilterCriteria): SearchQueryBuilder {
    this.query.filters = this.query.filters || [];
    this.query.filters.push(criteria);
    return this;
  }

  /**
   * Add multiple filters
   */
  filters(criteria: FilterCriteria[]): SearchQueryBuilder {
    this.query.filters = this.query.filters || [];
    this.query.filters.push(...criteria);
    return this;
  }

  /**
   * Add equals filter
   */
  equals(field: string, value: any, entity?: string): SearchQueryBuilder {
    return this.filter({
      entity,
      field,
      operator: 'equals',
      value
    });
  }

  /**
   * Add contains filter
   */
  contains(field: string, value: string, entity?: string): SearchQueryBuilder {
    return this.filter({
      entity,
      field,
      operator: 'contains',
      value
    });
  }

  /**
   * Add startsWith filter
   */
  startsWith(field: string, value: string, entity?: string): SearchQueryBuilder {
    return this.filter({
      entity,
      field,
      operator: 'startsWith',
      value
    });
  }

  /**
   * Add endsWith filter
   */
  endsWith(field: string, value: string, entity?: string): SearchQueryBuilder {
    return this.filter({
      entity,
      field,
      operator: 'endsWith',
      value
    });
  }

  /**
   * Add in filter
   */
  in(field: string, values: any[], entity?: string): SearchQueryBuilder {
    return this.filter({
      entity,
      field,
      operator: 'in',
      value: values
    });
  }

  /**
   * Add notIn filter
   */
  notIn(field: string, values: any[], entity?: string): SearchQueryBuilder {
    return this.filter({
      entity,
      field,
      operator: 'notIn',
      value: values
    });
  }

  /**
   * Add greater than filter
   */
  gt(field: string, value: number | Date, entity?: string): SearchQueryBuilder {
    return this.filter({
      entity,
      field,
      operator: 'gt',
      value
    });
  }

  /**
   * Add greater than or equal filter
   */
  gte(field: string, value: number | Date, entity?: string): SearchQueryBuilder {
    return this.filter({
      entity,
      field,
      operator: 'gte',
      value
    });
  }

  /**
   * Add less than filter
   */
  lt(field: string, value: number | Date, entity?: string): SearchQueryBuilder {
    return this.filter({
      entity,
      field,
      operator: 'lt',
      value
    });
  }

  /**
   * Add less than or equal filter
   */
  lte(field: string, value: number | Date, entity?: string): SearchQueryBuilder {
    return this.filter({
      entity,
      field,
      operator: 'lte',
      value
    });
  }

  /**
   * Add between filter
   */
  between(field: string, min: number | Date, max: number | Date, entity?: string): SearchQueryBuilder {
    return this.filter({
      entity,
      field,
      operator: 'between',
      value: [min, max]
    });
  }

  /**
   * Add isNull filter
   */
  isNull(field: string, entity?: string): SearchQueryBuilder {
    return this.filter({
      entity,
      field,
      operator: 'isNull',
      value: null
    });
  }

  /**
   * Add isNotNull filter
   */
  isNotNull(field: string, entity?: string): SearchQueryBuilder {
    return this.filter({
      entity,
      field,
      operator: 'isNotNull',
      value: null
    });
  }

  /**
   * Set pagination
   */
  paginate(page: number, limit: number): SearchQueryBuilder {
    this.query.page = Math.max(1, page);
    this.query.limit = Math.min(100, Math.max(1, limit)); // Limit to 100 max
    return this;
  }

  /**
   * Set sorting
   */
  sortBy(field: string, order: 'asc' | 'desc' = 'desc'): SearchQueryBuilder {
    this.query.sortBy = field;
    this.query.sortOrder = order;
    return this;
  }

  /**
   * Add date range filter
   */
  dateRange(field: string, startDate: Date, endDate: Date, entity?: string): SearchQueryBuilder {
    return this.between(field, startDate, endDate, entity);
  }

  /**
   * Add status filter
   */
  status(status: string, entity?: string): SearchQueryBuilder {
    return this.equals('status', status, entity);
  }

  /**
   * Add stage filter (for deals)
   */
  stage(stage: string): SearchQueryBuilder {
    return this.equals('stage', stage, 'deals');
  }

  /**
   * Add source filter (for leads)
   */
  source(source: string): SearchQueryBuilder {
    return this.equals('source', source, 'leads');
  }

  /**
   * Add priority filter (for tasks)
   */
  priority(priority: string): SearchQueryBuilder {
    return this.equals('priority', priority, 'tasks');
  }

  /**
   * Add assigned user filter
   */
  assignedTo(userId: string, entity?: string): SearchQueryBuilder {
    return this.equals('assignedToId', userId, entity);
  }

  /**
   * Add company filter
   */
  company(companyId: string, entity?: string): SearchQueryBuilder {
    return this.equals('companyId', companyId, entity);
  }

  /**
   * Add contact filter
   */
  contact(contactId: string, entity?: string): SearchQueryBuilder {
    return this.equals('contactId', contactId, entity);
  }

  /**
   * Add industry filter (for companies)
   */
  industry(industry: string): SearchQueryBuilder {
    return this.equals('industry', industry, 'companies');
  }

  /**
   * Add size filter (for companies)
   */
  size(size: string): SearchQueryBuilder {
    return this.equals('size', size, 'companies');
  }

  /**
   * Add revenue range filter (for companies)
   */
  revenueRange(min: number, max: number): SearchQueryBuilder {
    return this.between('revenue', min, max, 'companies');
  }

  /**
   * Add value range filter (for deals)
   */
  valueRange(min: number, max: number): SearchQueryBuilder {
    return this.between('value', min, max, 'deals');
  }

  /**
   * Add due date filter (for tasks)
   */
  dueDate(date: Date, operator: 'gt' | 'gte' | 'lt' | 'lte' = 'gte'): SearchQueryBuilder {
    return this.filter({
      entity: 'tasks',
      field: 'dueDate',
      operator,
      value: date
    });
  }

  /**
   * Add created date filter
   */
  createdAfter(date: Date, entity?: string): SearchQueryBuilder {
    return this.gte('createdAt', date, entity);
  }

  /**
   * Add created date filter
   */
  createdBefore(date: Date, entity?: string): SearchQueryBuilder {
    return this.lte('createdAt', date, entity);
  }

  /**
   * Add updated date filter
   */
  updatedAfter(date: Date, entity?: string): SearchQueryBuilder {
    return this.gte('updatedAt', date, entity);
  }

  /**
   * Add updated date filter
   */
  updatedBefore(date: Date, entity?: string): SearchQueryBuilder {
    return this.lte('updatedAt', date, entity);
  }

  /**
   * Add email filter
   */
  email(email: string, entity?: string): SearchQueryBuilder {
    return this.contains('email', email, entity);
  }

  /**
   * Add phone filter
   */
  phone(phone: string, entity?: string): SearchQueryBuilder {
    return this.contains('phone', phone, entity);
  }

  /**
   * Add name filter (searches firstName and lastName)
   */
  name(name: string, entity?: string): SearchQueryBuilder {
    const nameFilter = {
      entity,
      field: 'firstName',
      operator: 'contains' as FilterOperator,
      value: name,
      logicalOperator: 'OR' as const
    };

    const lastNameFilter = {
      entity,
      field: 'lastName',
      operator: 'contains' as FilterOperator,
      value: name,
      logicalOperator: 'OR' as const
    };

    this.query.filters = this.query.filters || [];
    this.query.filters.push(nameFilter, lastNameFilter);
    return this;
  }

  /**
   * Add active filter
   */
  active(entity?: string): SearchQueryBuilder {
    return this.equals('isActive', true, entity);
  }

  /**
   * Add inactive filter
   */
  inactive(entity?: string): SearchQueryBuilder {
    return this.equals('isActive', false, entity);
  }

  /**
   * Clear all filters
   */
  clearFilters(): SearchQueryBuilder {
    this.query.filters = [];
    return this;
  }

  /**
   * Clear specific filter by field
   */
  clearFilter(field: string, entity?: string): SearchQueryBuilder {
    this.query.filters = this.query.filters?.filter(filter => 
      !(filter.field === field && (!entity || filter.entity === entity))
    ) || [];
    return this;
  }

  /**
   * Get current query state
   */
  getQuery(): Partial<BuiltSearchQuery> {
    return { ...this.query };
  }

  /**
   * Build the final search query
   */
  build(): BuiltSearchQuery {
    return {
      text: this.query.text,
      entities: this.query.entities || ['contacts', 'companies', 'deals', 'leads', 'tasks'],
      filters: this.query.filters || [],
      page: this.query.page || 1,
      limit: this.query.limit || 20,
      sortBy: this.query.sortBy,
      sortOrder: this.query.sortOrder || 'desc'
    };
  }

  /**
   * Optimize the search query for better performance
   */
  optimizeQuery(query: string): string {
    // Remove common stop words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = query.toLowerCase().split(' ');
    const optimizedWords = words.filter(word => 
      word.length > 2 && !stopWords.includes(word)
    );
    
    return optimizedWords.join(' ');
  }

  /**
   * Validate the current query
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.query.page && this.query.page < 1) {
      errors.push('Page must be greater than 0');
    }

    if (this.query.limit && (this.query.limit < 1 || this.query.limit > 100)) {
      errors.push('Limit must be between 1 and 100');
    }

    if (this.query.entities && this.query.entities.length === 0) {
      errors.push('At least one entity must be specified');
    }

    if (this.query.sortOrder && !['asc', 'desc'].includes(this.query.sortOrder)) {
      errors.push('Sort order must be either "asc" or "desc"');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Reset the query builder
   */
  reset(): SearchQueryBuilder {
    this.query = {
      entities: ['contacts', 'companies', 'deals', 'leads', 'tasks'],
      filters: [],
      page: 1,
      limit: 20
    };
    return this;
  }

  /**
   * Clone the current query builder
   */
  clone(): SearchQueryBuilder {
    const cloned = new SearchQueryBuilder();
    cloned.query = { ...this.query };
    return cloned;
  }
}
