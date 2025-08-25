import { SearchQuery, FilterCriteria } from '../../../shared/types/search';

export interface SearchState {
  query: SearchQuery;
  results: any | null;
  loading: boolean;
  error: string | null;
  filters: FilterCriteria[];
  suggestions: string[];
  history: SearchQuery[];
  
  // Authentication state
  isAuthenticated: boolean;
  authToken: string | null;
  
  // Performance tracking
  lastSearchTime: number | null;
  searchPerformance: {
    averageResponseTime: number;
    cacheHitRate: number;
    successRate: number;
  };
}

export interface SearchActions {
  setQuery: (query: Partial<SearchQuery>) => void;
  executeSearch: () => Promise<void>;
  executeFuzzySearch: () => Promise<void>;
  executeAdvancedSearch: (options?: any) => Promise<void>;
  clearResults: () => void;
  addFilter: (filter: FilterCriteria) => void;
  removeFilter: (index: number) => void;
  clearFilters: () => void;
  setSuggestions: (suggestions: string[]) => void;
  addToHistory: (query: SearchQuery) => void;
  
  // Authentication actions
  setAuthToken: (token: string) => void;
  clearAuthToken: () => void;
  authenticate: (token: string) => void;
  logout: () => void;
  
  // Performance tracking
  updateSearchPerformance: (performance: any) => void;
  
  // Filter management
  saveFilterTemplate: (filterName: string) => Promise<void>;
  loadFilterTemplate: (filterId: string) => Promise<void>;
  
  // Cache management
  clearSearchCache: () => Promise<void>;
  
  // Export functionality
  exportSearchResults: () => Promise<void>;
}

// Additional types for enhanced functionality
export interface SearchPerformance {
  averageResponseTime: number;
  cacheHitRate: number;
  successRate: number;
  totalQueries: number;
  failedQueries: number;
  slowQueries: number;
}

export interface SearchAnalytics {
  totalSearches: number;
  popularQueries: Array<{
    text: string;
    count: number;
    successRate: number;
  }>;
  entityUsage: Array<{
    entity: string;
    count: number;
    percentage: number;
  }>;
  searchTrends: Array<{
    date: string;
    searches: number;
    change: number;
  }>;
}

export interface FilterTemplate {
  id: string;
  name: string;
  filters: FilterCriteria[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  createdBy: string;
}

export interface SearchSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  queries: SearchQuery[];
  resultsCount: number;
  performance: SearchPerformance;
}

export interface SearchError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface SearchMetadata {
  searchTime: number;
  totalResults: number;
  entityCounts: Record<string, number>;
  query: SearchQuery;
  cacheHitRate?: number;
  suggestions?: string[];
  analytics?: SearchAnalytics;
}
