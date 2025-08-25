import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchApi } from '../services/searchApi';
import { SearchQuery, SearchResult } from '../../../shared/types/search';

// Basic Search Query
export const useSearchQuery = (query: SearchQuery) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi.search(query),
    enabled: !!query.text || (query.filters && query.filters.length > 0),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Search Suggestions
export const useSearchSuggestions = (text: string) => {
  return useQuery({
    queryKey: ['search-suggestions', text],
    queryFn: () => searchApi.getSuggestions(text),
    enabled: text.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
};

// Fuzzy Search Suggestions
export const useFuzzySuggestions = (text: string) => {
  return useQuery({
    queryKey: ['fuzzy-suggestions', text],
    queryFn: () => searchApi.getFuzzySuggestions(text),
    enabled: text.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
};

// Fuzzy Search Mutation
export const useFuzzySearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (query: SearchQuery) => searchApi.fuzzySearch(query),
    onSuccess: (data) => {
      // Update the cache with fuzzy search results
      if (data.metadata?.query) {
        queryClient.setQueryData(['search', data.metadata.query], data);
      }
    },
    onError: (error) => {
      console.error('Fuzzy search failed:', error);
    },
  });
};

// Search Analytics
export const useSearchAnalytics = (timeRange: string = '7d') => {
  return useQuery({
    queryKey: ['search-analytics', timeRange],
    queryFn: () => searchApi.getAnalytics(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
};

// Performance Metrics
export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: ['performance-metrics'],
    queryFn: () => searchApi.getPerformanceMetrics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Dashboard Metrics
export const useDashboardMetrics = (forceRefresh: boolean = false) => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => searchApi.getDashboardMetrics(),
    staleTime: forceRefresh ? 0 : 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
};

// Real-time Monitoring
export const useRealTimeMonitoring = () => {
  return useQuery({
    queryKey: ['real-time-monitoring'],
    queryFn: () => searchApi.getRealTimeMonitoring(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 1,
  });
};

// Health Status
export const useHealthStatus = () => {
  return useQuery({
    queryKey: ['health-status'],
    queryFn: () => searchApi.getHealthStatus(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};

// Search Trends
export const useSearchTrends = () => {
  return useQuery({
    queryKey: ['search-trends'],
    queryFn: () => searchApi.getSearchTrends(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};

// Performance Recommendations
export const useRecommendations = () => {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: () => searchApi.getRecommendations(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
};

// Cache Stats
export const useCacheStats = () => {
  return useQuery({
    queryKey: ['cache-stats'],
    queryFn: () => searchApi.getCacheStats(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 1,
  });
};

// Clear Cache Mutation
export const useClearCache = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => searchApi.clearCache(),
    onSuccess: () => {
      // Invalidate all search-related queries
      queryClient.invalidateQueries({ queryKey: ['search'] });
      queryClient.invalidateQueries({ queryKey: ['cache-stats'] });
      queryClient.invalidateQueries({ queryKey: ['performance-metrics'] });
    },
    onError: (error) => {
      console.error('Failed to clear cache:', error);
    },
  });
};

// Save Filter Mutation
export const useSaveFilter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filter: any) => searchApi.saveFilter(filter),
    onSuccess: () => {
      // Invalidate saved filters query
      queryClient.invalidateQueries({ queryKey: ['saved-filters'] });
    },
    onError: (error) => {
      console.error('Failed to save filter:', error);
    },
  });
};

// Get Saved Filters
export const useSavedFilters = () => {
  return useQuery({
    queryKey: ['saved-filters'],
    queryFn: () => searchApi.getSavedFilters(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
};

// Load Filter
export const useLoadFilter = (filterId: string) => {
  return useQuery({
    queryKey: ['load-filter', filterId],
    queryFn: () => searchApi.loadFilter(filterId),
    enabled: !!filterId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};

// Delete Filter Mutation
export const useDeleteFilter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filterId: string) => searchApi.deleteFilter(filterId),
    onSuccess: () => {
      // Invalidate saved filters query
      queryClient.invalidateQueries({ queryKey: ['saved-filters'] });
    },
    onError: (error) => {
      console.error('Failed to delete filter:', error);
    },
  });
};

// Batch Search Mutation
export const useBatchSearch = () => {
  return useMutation({
    mutationFn: (queries: SearchQuery[]) => searchApi.batchSearch(queries),
    onError: (error) => {
      console.error('Batch search failed:', error);
    },
  });
};

// Advanced Search
export const useAdvancedSearch = (query: SearchQuery, options: {
  includeAnalytics?: boolean;
  includeSuggestions?: boolean;
  cacheResults?: boolean;
} = {}) => {
  return useQuery({
    queryKey: ['advanced-search', query, options],
    queryFn: () => searchApi.advancedSearch(query, options),
    enabled: !!query.text || (query.filters && query.filters.length > 0),
    staleTime: options.cacheResults ? 5 * 60 * 1000 : 0, // 5 minutes if caching enabled
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Export Dashboard Mutation
export const useExportDashboard = () => {
  return useMutation({
    mutationFn: () => searchApi.exportDashboard(),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `search-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error) => {
      console.error('Export failed:', error);
    },
  });
};
