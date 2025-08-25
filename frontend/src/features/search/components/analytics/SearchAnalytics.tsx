import React from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  MagnifyingGlassIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useSearchAnalytics, usePerformanceMetrics } from '../../hooks/useSearchQuery';
import { cn } from '../../../../shared/utils/cn';

interface SearchAnalyticsProps {
  className?: string;
  timeRange?: string;
  showDetails?: boolean;
}

export const SearchAnalytics: React.FC<SearchAnalyticsProps> = ({
  className,
  timeRange = '7d',
  showDetails = true
}) => {
  const { data: analytics, isLoading: analyticsLoading } = useSearchAnalytics(timeRange);
  const { data: performance, isLoading: performanceLoading } = usePerformanceMetrics();

  const isLoading = analyticsLoading || performanceLoading;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${(num * 100).toFixed(1)}%`;
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    }
    if (trend < 0) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className={cn("bg-white rounded-lg shadow p-6", className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics && !performance) {
    return (
      <div className={cn("bg-white rounded-lg shadow p-6", className)}>
        <div className="text-center text-gray-500">
          <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2" />
          <p>No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-lg shadow", className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Search Analytics</h3>
          </div>
          <div className="text-sm text-gray-500">
            Last {timeRange}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Searches */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <MagnifyingGlassIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Searches</p>
                <p className="text-2xl font-bold text-blue-900">
                  {analytics ? formatNumber(analytics.totalSearches) : 'N/A'}
                </p>
                {analytics?.searchTrends?.[0] && (
                  <div className="flex items-center mt-1">
                    {getTrendIcon((analytics.searchTrends[0] as any).change)}
                    <span className={cn("text-xs ml-1", getTrendColor((analytics.searchTrends[0] as any).change))}>
                      {(analytics.searchTrends[0] as any).change > 0 ? '+' : ''}{(analytics.searchTrends[0] as any).change}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Average Response Time */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Avg Response</p>
                <p className="text-2xl font-bold text-green-900">
                  {performance ? formatDuration(performance.p50ResponseTime) : 'N/A'}
                </p>
                {performance?.p95ResponseTime && (
                  <div className="flex items-center mt-1">
                    {getTrendIcon(performance.p95ResponseTime)}
                    <span className={cn("text-xs ml-1", getTrendColor(performance.p95ResponseTime))}>
                      {performance.p95ResponseTime > 0 ? '+' : ''}{performance.p95ResponseTime}ms
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cache Hit Rate */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-purple-900">
                  {performance ? formatPercentage(performance.throughput / 100) : 'N/A'}
                </p>
                {performance?.throughput && (
                  <div className="flex items-center mt-1">
                    {getTrendIcon(performance.throughput)}
                    <span className={cn("text-xs ml-1", getTrendColor(performance.throughput))}>
                      {performance.throughput > 0 ? '+' : ''}{performance.throughput} req/s
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Success Rate</p>
                <p className="text-2xl font-bold text-orange-900">
                  {performance ? formatPercentage(1 - (performance.errorRate || 0)) : 'N/A'}
                </p>
                {performance?.errorRate && (
                  <div className="flex items-center mt-1">
                    {getTrendIcon(performance.errorRate)}
                    <span className={cn("text-xs ml-1", getTrendColor(performance.errorRate))}>
                      {performance.errorRate > 0 ? '+' : ''}{(performance.errorRate * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        {showDetails && analytics && (
          <div className="space-y-6">
            {/* Popular Queries */}
            {analytics.popularQueries && analytics.popularQueries.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Popular Queries</h4>
                <div className="space-y-2">
                  {analytics.popularQueries.slice(0, 5).map((query, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">
                          #{index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{query.query}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{query.count} searches</span>
                        <span>{formatPercentage(query.successRate)} success</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Entity Usage */}
            {analytics.entityUsage && analytics.entityUsage.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Entity Usage</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {analytics.entityUsage.map((entity, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900">{entity.entity}</div>
                      <div className="text-lg font-bold text-blue-600">{entity.searches}</div>
                      <div className="text-xs text-gray-500">{formatPercentage(entity.percentage)} of searches</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Trends */}
            {analytics.searchTrends && analytics.searchTrends.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Search Trends</h4>
                <div className="space-y-2">
                  {analytics.searchTrends.slice(0, 7).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-2">
                      <span className="text-sm text-gray-700">{trend.date}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{trend.searches}</span>
                        <div className="flex items-center">
                          {getTrendIcon(trend.averageResponseTime)}
                          <span className={cn("text-xs ml-1", getTrendColor(trend.averageResponseTime))}>
                            {trend.averageResponseTime}ms
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
