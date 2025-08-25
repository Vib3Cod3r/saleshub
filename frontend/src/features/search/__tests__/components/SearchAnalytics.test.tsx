import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchAnalytics } from '../../components/analytics/SearchAnalytics';
import { useSearchAnalytics, usePerformanceMetrics } from '../../hooks/useSearchQuery';

// Mock the hooks
jest.mock('../../hooks/useSearchQuery');

const mockUseSearchAnalytics = useSearchAnalytics as jest.MockedFunction<typeof useSearchAnalytics>;
const mockUsePerformanceMetrics = usePerformanceMetrics as jest.MockedFunction<typeof usePerformanceMetrics>;

describe('SearchAnalytics', () => {
  const mockAnalytics = {
    totalSearches: 1000,
    popularQueries: [
      { text: 'test contact', count: 50, successRate: 0.9 },
      { text: 'test company', count: 30, successRate: 0.85 },
      { text: 'test deal', count: 20, successRate: 0.8 },
    ],
    entityUsage: [
      { entity: 'Contact', count: 500, percentage: 0.5 },
      { entity: 'Company', count: 300, percentage: 0.3 },
      { entity: 'Deal', count: 200, percentage: 0.2 },
    ],
    searchTrends: [
      { date: '2024-01-01', searches: 100, change: 5 },
      { date: '2024-01-02', searches: 105, change: 5 },
      { date: '2024-01-03', searches: 110, change: 5 },
    ],
  };

  const mockPerformanceMetrics = {
    averageResponseTime: 150,
    cacheHitRate: 0.8,
    successRate: 0.95,
    totalQueries: 1000,
    failedQueries: 50,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchAnalytics.mockReturnValue({
      data: mockAnalytics,
      isLoading: false,
      error: null,
    });
    mockUsePerformanceMetrics.mockReturnValue({
      data: mockPerformanceMetrics,
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render analytics dashboard correctly', () => {
      render(<SearchAnalytics />);
      
      // Check for main sections
      expect(screen.getByText('Search Analytics')).toBeInTheDocument();
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText('Popular Queries')).toBeInTheDocument();
      expect(screen.getByText('Entity Usage')).toBeInTheDocument();
      expect(screen.getByText('Search Trends')).toBeInTheDocument();
    });

    it('should display total searches correctly', () => {
      render(<SearchAnalytics />);
      
      const totalSearches = screen.getByText('1,000');
      expect(totalSearches).toBeInTheDocument();
    });

    it('should display performance metrics correctly', () => {
      render(<SearchAnalytics />);
      
      expect(screen.getByText('150ms')).toBeInTheDocument(); // Average response time
      expect(screen.getByText('80%')).toBeInTheDocument(); // Cache hit rate
      expect(screen.getByText('95%')).toBeInTheDocument(); // Success rate
    });

    it('should display popular queries correctly', () => {
      render(<SearchAnalytics />);
      
      expect(screen.getByText('test contact')).toBeInTheDocument();
      expect(screen.getByText('test company')).toBeInTheDocument();
      expect(screen.getByText('test deal')).toBeInTheDocument();
      
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('should display entity usage correctly', () => {
      render(<SearchAnalytics />);
      
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Deal')).toBeInTheDocument();
      
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state for analytics', () => {
      mockUseSearchAnalytics.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<SearchAnalytics />);
      
      const loadingSpinner = screen.getByTestId('analytics-loading');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('should show loading state for performance metrics', () => {
      mockUsePerformanceMetrics.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<SearchAnalytics />);
      
      const loadingSpinner = screen.getByTestId('performance-loading');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('should show skeleton loading for metrics cards', () => {
      mockUseSearchAnalytics.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<SearchAnalytics />);
      
      const skeletonCards = screen.getAllByTestId('metric-skeleton');
      expect(skeletonCards).toHaveLength(4); // Total searches, response time, cache hit rate, success rate
    });
  });

  describe('Error Handling', () => {
    it('should display error state for analytics', () => {
      mockUseSearchAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load analytics'),
      });

      render(<SearchAnalytics />);
      
      const errorMessage = screen.getByText('Failed to load analytics');
      const retryButton = screen.getByRole('button', { name: /retry/i });
      
      expect(errorMessage).toBeInTheDocument();
      expect(retryButton).toBeInTheDocument();
    });

    it('should display error state for performance metrics', () => {
      mockUsePerformanceMetrics.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load performance metrics'),
      });

      render(<SearchAnalytics />);
      
      const errorMessage = screen.getByText('Failed to load performance metrics');
      expect(errorMessage).toBeInTheDocument();
    });

    it('should handle retry action for analytics', async () => {
      const user = userEvent.setup();
      const mockRefetch = jest.fn();
      
      mockUseSearchAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load analytics'),
        refetch: mockRefetch,
      });

      render(<SearchAnalytics />);
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);
      
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Data Visualization', () => {
    it('should render progress bars for entity usage', () => {
      render(<SearchAnalytics />);
      
      const progressBars = screen.getAllByTestId('entity-progress');
      expect(progressBars).toHaveLength(3); // Contact, Company, Deal
    });

    it('should render success rate indicators', () => {
      render(<SearchAnalytics />);
      
      const successRateIndicators = screen.getAllByTestId('success-rate');
      expect(successRateIndicators).toHaveLength(3); // One for each popular query
    });

    it('should render trend charts', () => {
      render(<SearchAnalytics />);
      
      const trendChart = screen.getByTestId('trend-chart');
      expect(trendChart).toBeInTheDocument();
    });

    it('should display trend data correctly', () => {
      render(<SearchAnalytics />);
      
      expect(screen.getByText('100')).toBeInTheDocument(); // First day searches
      expect(screen.getByText('105')).toBeInTheDocument(); // Second day searches
      expect(screen.getByText('110')).toBeInTheDocument(); // Third day searches
    });
  });

  describe('Interactive Features', () => {
    it('should handle time range selection', async () => {
      const user = userEvent.setup();
      render(<SearchAnalytics />);
      
      const timeRangeSelect = screen.getByRole('combobox', { name: /time range/i });
      await user.selectOptions(timeRangeSelect, '30d');
      
      // Should trigger analytics refetch with new time range
      expect(timeRangeSelect).toHaveValue('30d');
    });

    it('should handle metric card clicks', async () => {
      const user = userEvent.setup();
      render(<SearchAnalytics />);
      
      const totalSearchesCard = screen.getByTestId('metric-card-total-searches');
      await user.click(totalSearchesCard);
      
      // Should show detailed view or trigger action
      expect(totalSearchesCard).toBeInTheDocument();
    });

    it('should handle popular query clicks', async () => {
      const user = userEvent.setup();
      render(<SearchAnalytics />);
      
      const popularQuery = screen.getByText('test contact');
      await user.click(popularQuery);
      
      // Should trigger search or show details
      expect(popularQuery).toBeInTheDocument();
    });

    it('should handle entity usage clicks', async () => {
      const user = userEvent.setup();
      render(<SearchAnalytics />);
      
      const contactEntity = screen.getByText('Contact');
      await user.click(contactEntity);
      
      // Should filter or show entity-specific analytics
      expect(contactEntity).toBeInTheDocument();
    });
  });

  describe('Data Formatting', () => {
    it('should format large numbers correctly', () => {
      const largeAnalytics = {
        ...mockAnalytics,
        totalSearches: 1234567,
      };

      mockUseSearchAnalytics.mockReturnValue({
        data: largeAnalytics,
        isLoading: false,
        error: null,
      });

      render(<SearchAnalytics />);
      
      expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });

    it('should format percentages correctly', () => {
      render(<SearchAnalytics />);
      
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
    });

    it('should format response times correctly', () => {
      render(<SearchAnalytics />);
      
      expect(screen.getByText('150ms')).toBeInTheDocument();
    });

    it('should format dates correctly', () => {
      render(<SearchAnalytics />);
      
      expect(screen.getByText('Jan 1')).toBeInTheDocument();
      expect(screen.getByText('Jan 2')).toBeInTheDocument();
      expect(screen.getByText('Jan 3')).toBeInTheDocument();
    });
  });

  describe('Performance Indicators', () => {
    it('should show performance status indicators', () => {
      render(<SearchAnalytics />);
      
      const performanceStatus = screen.getByTestId('performance-status');
      expect(performanceStatus).toBeInTheDocument();
    });

    it('should show cache performance indicator', () => {
      render(<SearchAnalytics />);
      
      const cacheIndicator = screen.getByTestId('cache-indicator');
      expect(cacheIndicator).toBeInTheDocument();
      
      // Should show good performance for 80% cache hit rate
      expect(cacheIndicator).toHaveClass('text-green-600');
    });

    it('should show response time indicator', () => {
      render(<SearchAnalytics />);
      
      const responseTimeIndicator = screen.getByTestId('response-time-indicator');
      expect(responseTimeIndicator).toBeInTheDocument();
      
      // Should show acceptable performance for 150ms
      expect(responseTimeIndicator).toHaveClass('text-yellow-600');
    });

    it('should show success rate indicator', () => {
      render(<SearchAnalytics />);
      
      const successRateIndicator = screen.getByTestId('success-rate-indicator');
      expect(successRateIndicator).toBeInTheDocument();
      
      // Should show excellent performance for 95% success rate
      expect(successRateIndicator).toHaveClass('text-green-600');
    });
  });

  describe('Empty States', () => {
    it('should handle empty analytics data', () => {
      const emptyAnalytics = {
        totalSearches: 0,
        popularQueries: [],
        entityUsage: [],
        searchTrends: [],
      };

      mockUseSearchAnalytics.mockReturnValue({
        data: emptyAnalytics,
        isLoading: false,
        error: null,
      });

      render(<SearchAnalytics />);
      
      const emptyMessage = screen.getByText(/no analytics data available/i);
      expect(emptyMessage).toBeInTheDocument();
    });

    it('should handle empty performance metrics', () => {
      const emptyMetrics = {
        averageResponseTime: 0,
        cacheHitRate: 0,
        successRate: 0,
        totalQueries: 0,
        failedQueries: 0,
      };

      mockUsePerformanceMetrics.mockReturnValue({
        data: emptyMetrics,
        isLoading: false,
        error: null,
      });

      render(<SearchAnalytics />);
      
      const emptyMessage = screen.getByText(/no performance data available/i);
      expect(emptyMessage).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for charts', () => {
      render(<SearchAnalytics />);
      
      const trendChart = screen.getByTestId('trend-chart');
      expect(trendChart).toHaveAttribute('aria-label', 'Search trends over time');
    });

    it('should have proper ARIA labels for progress bars', () => {
      render(<SearchAnalytics />);
      
      const progressBars = screen.getAllByTestId('entity-progress');
      progressBars.forEach((bar, index) => {
        const entity = ['Contact', 'Company', 'Deal'][index];
        expect(bar).toHaveAttribute('aria-label', `${entity} usage: ${[50, 30, 20][index]}%`);
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SearchAnalytics />);
      
      // Tab through interactive elements
      await user.tab();
      
      // Should focus on first interactive element
      expect(document.activeElement).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<SearchAnalytics />);
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Search Analytics');
      
      const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(sectionHeadings).toHaveLength(4); // Performance Metrics, Popular Queries, Entity Usage, Search Trends
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<SearchAnalytics />);
      
      const analyticsContainer = screen.getByTestId('analytics-container');
      expect(analyticsContainer).toBeInTheDocument();
      
      // Should have mobile-friendly classes
      expect(analyticsContainer).toHaveClass('grid-cols-1');
    });

    it('should stack metrics cards on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<SearchAnalytics />);
      
      const metricsGrid = screen.getByTestId('metrics-grid');
      expect(metricsGrid).toHaveClass('grid-cols-1');
    });

    it('should handle touch events on mobile', async () => {
      const user = userEvent.setup();
      render(<SearchAnalytics />);
      
      const metricCard = screen.getByTestId('metric-card-total-searches');
      
      // Simulate touch event
      fireEvent.touchStart(metricCard);
      fireEvent.touchEnd(metricCard);
      
      expect(metricCard).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    it('should handle real-time data updates', async () => {
      const { rerender } = render(<SearchAnalytics />);
      
      // Initial render
      expect(screen.getByText('1,000')).toBeInTheDocument();
      
      // Update with new data
      const updatedAnalytics = {
        ...mockAnalytics,
        totalSearches: 1100,
      };

      mockUseSearchAnalytics.mockReturnValue({
        data: updatedAnalytics,
        isLoading: false,
        error: null,
      });

      rerender(<SearchAnalytics />);
      
      // Should show updated data
      expect(screen.getByText('1,100')).toBeInTheDocument();
    });

    it('should handle polling for updates', () => {
      render(<SearchAnalytics />);
      
      // Should set up polling for real-time updates
      expect(mockUseSearchAnalytics).toHaveBeenCalledWith('7d');
      expect(mockUsePerformanceMetrics).toHaveBeenCalled();
    });
  });
});
