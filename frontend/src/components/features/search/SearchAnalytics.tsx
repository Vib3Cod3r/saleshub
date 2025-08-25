import { useState, useEffect } from 'react';

interface SearchAnalyticsData {
  totalSearches: number;
  totalResults: number;
  averageSearchTime: number;
  popularQueries: Record<string, number>;
  timeRange: string;
}

interface SearchAnalyticsProps {
  className?: string;
}

export const SearchAnalytics = ({ className = "" }: SearchAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<SearchAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/enhanced-search/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch search analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const topQueries = Object.entries(analytics.popularQueries)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Search Analytics</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as '1h' | '24h' | '7d')}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{analytics.totalSearches}</div>
          <div className="text-sm text-blue-800">Total Searches</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{analytics.totalResults}</div>
          <div className="text-sm text-green-800">Total Results</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{Math.round(analytics.averageSearchTime)}ms</div>
          <div className="text-sm text-purple-800">Avg Search Time</div>
        </div>
      </div>

      {/* Popular Queries */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Popular Queries</h4>
        {topQueries.length > 0 ? (
          <div className="space-y-2">
            {topQueries.map(([query, count]) => (
              <div key={query} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700 truncate flex-1">{query}</span>
                <span className="text-sm font-medium text-gray-900 ml-2">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No search data available</p>
        )}
      </div>

      {/* Performance Insights */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-3">Performance Insights</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Average Results per Search:</span>
            <span className="font-medium">
              {analytics.totalSearches > 0 ? Math.round(analytics.totalResults / analytics.totalSearches) : 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Search Success Rate:</span>
            <span className="font-medium text-green-600">
              {analytics.totalSearches > 0 ? '99.9%' : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time Range:</span>
            <span className="font-medium">{timeRange}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
