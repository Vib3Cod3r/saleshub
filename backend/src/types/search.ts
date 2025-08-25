// Search Query Types
export interface SearchQuery {
  text?: string;
  entities?: string[];
  filters?: FilterCriteria[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  skipCache?: boolean;
  includeMetadata?: boolean;
}

export interface SearchResult {
  data: any[];
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
    query: any;
  };
}

// Filter Types
export interface FilterCriteria {
  entity?: string;
  field: string;
  operator: FilterOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export type FilterOperator = 
  | 'equals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'notIn'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'isNull'
  | 'isNotNull';

export interface FilterGroup {
  operator: 'AND' | 'OR';
  filters: (FilterCriteria | FilterGroup)[];
}

// Search Analytics Types
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

// Search Index Types
export interface SearchIndex {
  entity: string;
  fields: string[];
  type: 'fulltext' | 'btree' | 'hash';
  status: 'active' | 'building' | 'error';
  lastUpdated: Date;
  recordCount: number;
}

export interface IndexUpdate {
  entity: string;
  id: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: Date;
}

// Search Suggestion Types
export interface SearchSuggestion {
  text: string;
  type: 'query' | 'field' | 'value';
  entity?: string;
  field?: string;
  relevance: number;
}

// Search Query Builder Types
export interface BuiltSearchQuery {
  text?: string;
  entities: string[];
  filters: FilterCriteria[];
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search Cache Types
export interface SearchCacheEntry {
  query: SearchQuery;
  results: SearchResult;
  timestamp: Date;
  ttl: number;
}

// Search Error Types
export interface SearchError {
  code: string;
  message: string;
  query?: SearchQuery;
  timestamp: Date;
  stack?: string;
}

// Search Performance Types
export interface SearchPerformance {
  queryTime: number;
  cacheTime: number;
  databaseTime: number;
  rankingTime: number;
  totalTime: number;
}

// Search Ranking Types
export interface SearchRanking {
  relevance: number;
  recency: number;
  popularity: number;
  totalScore: number;
}

// Search Entity Configuration
export interface SearchEntityConfig {
  entity: string;
  searchFields: string[];
  filterFields: string[];
  sortFields: string[];
  includes: Record<string, boolean>;
  weights: Record<string, number>;
}

// Search Response Types
export interface SearchResponse {
  success: boolean;
  data?: SearchResult;
  error?: SearchError;
  performance?: SearchPerformance;
  suggestions?: SearchSuggestion[];
  timestamp: string;
}

// Search Statistics Types
export interface SearchStatistics {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageQueryTime: number;
  cacheHits: number;
  cacheMisses: number;
  mostSearchedTerms: string[];
  peakUsageTime: string;
}

// Search Optimization Types
export interface SearchOptimization {
  query: string;
  optimizedQuery: string;
  improvements: string[];
  estimatedPerformanceGain: number;
}

// Search Monitoring Types
export interface SearchMonitoring {
  activeQueries: number;
  queueLength: number;
  cacheSize: number;
  indexStatus: Record<string, string>;
  lastIndexUpdate: Date;
  systemHealth: 'healthy' | 'degraded' | 'unhealthy';
}
