export interface SearchQuery {
  text?: string;
  entities?: string[];
  filters?: FilterCriteria[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metadata?: {
    searchTime: number;
    totalResults: number;
    entityCounts: Record<string, number>;
    query: SearchQuery;
  };
}

export interface FilterCriteria {
  field: string;
  operator: FilterOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export type FilterOperator = 
  | 'equals' | 'contains' | 'startsWith' | 'endsWith'
  | 'in' | 'notIn' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'between' | 'isNull' | 'isNotNull';

export interface SearchAnalytics {
  totalSearches: number;
  averageResponseTime: number;
  cacheHitRate: number;
  popularQueries: PopularQuery[];
  searchTrends: SearchTrend[];
  entityUsage: EntityUsage[];
  performanceMetrics: PerformanceMetrics;
}

export interface PopularQuery {
  query: string;
  count: number;
  averageResponseTime: number;
  successRate: number;
}

export interface SearchTrend {
  date: string;
  searches: number;
  averageResponseTime: number;
  cacheHits: number;
  totalResponseTime?: number;
}

export interface EntityUsage {
  entity: string;
  searches: number;
  percentage: number;
}

export interface PerformanceMetrics {
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  throughput: number;
  responseTimes?: number[];
  totalQueries?: number;
  failedQueries?: number;
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  skipCache?: boolean;
  includeMetadata?: boolean;
}
