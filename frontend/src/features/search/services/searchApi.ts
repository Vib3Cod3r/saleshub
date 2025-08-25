import { SearchQuery, SearchResult, SearchAnalytics, PerformanceMetrics, FilterCriteria } from '../../../shared/types/search';

class SearchApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089/api';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as any).Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Basic Search
  async search(query: SearchQuery): Promise<SearchResult> {
    return this.request<SearchResult>('/search', {
      method: 'POST',
      body: JSON.stringify(query),
    });
  }

  // Fuzzy Search
  async fuzzySearch(query: SearchQuery): Promise<SearchResult> {
    return this.request<SearchResult>('/search/fuzzy', {
      method: 'POST',
      body: JSON.stringify(query),
    });
  }

  // Search Suggestions
  async getSuggestions(text: string): Promise<string[]> {
    return this.request<string[]>('/search/suggestions', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Fuzzy Search Suggestions
  async getFuzzySuggestions(text: string): Promise<string[]> {
    return this.request<string[]>('/search/fuzzy-suggestions', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Analytics
  async getAnalytics(timeRange: string = '7d'): Promise<SearchAnalytics> {
    return this.request<SearchAnalytics>(`/search/analytics?timeRange=${timeRange}`);
  }

  // Performance Metrics
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return this.request<PerformanceMetrics>('/search/performance');
  }

  // Dashboard Metrics
  async getDashboardMetrics(): Promise<any> {
    return this.request<any>('/search/dashboard');
  }

  // Real-time Monitoring
  async getRealTimeMonitoring(): Promise<any> {
    return this.request<any>('/search/monitoring');
  }

  // Health Status
  async getHealthStatus(): Promise<any> {
    return this.request<any>('/search/health');
  }

  // Search Trends
  async getSearchTrends(): Promise<any> {
    return this.request<any>('/search/trends');
  }

  // Performance Recommendations
  async getRecommendations(): Promise<any> {
    return this.request<any>('/search/recommendations');
  }

  // Export Dashboard Data
  async exportDashboard(): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/search/export`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    
    return response.blob();
  }

  // Cache Management
  async getCacheStats(): Promise<any> {
    return this.request<any>('/search/cache-stats');
  }

  async clearCache(): Promise<void> {
    return this.request<void>('/search/cache', {
      method: 'DELETE',
    });
  }

  // Filter Management
  async saveFilter(filter: any): Promise<{ filterId: string }> {
    return this.request<{ filterId: string }>('/search/filters', {
      method: 'POST',
      body: JSON.stringify(filter),
    });
  }

  async getSavedFilters(): Promise<any[]> {
    return this.request<any[]>('/search/filters');
  }

  async loadFilter(filterId: string): Promise<FilterCriteria[]> {
    return this.request<FilterCriteria[]>(`/search/filters/${filterId}`);
  }

  async deleteFilter(filterId: string): Promise<void> {
    return this.request<void>(`/search/filters/${filterId}`, {
      method: 'DELETE',
    });
  }

  // Search with Authentication
  async searchWithAuth(query: SearchQuery, token: string): Promise<SearchResult> {
    this.setToken(token);
    return this.search(query);
  }

  // Batch Search (for multiple queries)
  async batchSearch(queries: SearchQuery[]): Promise<SearchResult[]> {
    return this.request<SearchResult[]>('/search/batch', {
      method: 'POST',
      body: JSON.stringify({ queries }),
    });
  }

  // Search with Advanced Options
  async advancedSearch(query: SearchQuery, options: {
    includeAnalytics?: boolean;
    includeSuggestions?: boolean;
    cacheResults?: boolean;
  } = {}): Promise<SearchResult & {
    analytics?: SearchAnalytics;
    suggestions?: string[];
  }> {
    return this.request<SearchResult & {
      analytics?: SearchAnalytics;
      suggestions?: string[];
    }>('/search/advanced', {
      method: 'POST',
      body: JSON.stringify({ query, options }),
    });
  }
}

export const searchApi = new SearchApiService();
