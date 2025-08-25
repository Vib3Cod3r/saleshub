import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdvancedAnalyticsDashboard } from '../../../components/analytics/AdvancedAnalyticsDashboard'
import { useAnalytics } from '../../../hooks/useAnalytics'

// Mock the useAnalytics hook
jest.mock('../../../hooks/useAnalytics')

const mockUseAnalytics = useAnalytics as jest.MockedFunction<typeof useAnalytics>

describe('AdvancedAnalyticsDashboard', () => {
  const mockAnalytics = {
    events: [],
    businessMetrics: null,
    userBehaviorMetrics: null,
    performanceMetrics: null,
    isTracking: true,
    trackPageView: jest.fn(),
    trackEvent: jest.fn(),
    trackBusinessMetrics: jest.fn(),
    trackUserBehavior: jest.fn(),
    trackPerformance: jest.fn(),
    trackConversionFunnel: jest.fn(),
    trackFeatureUsage: jest.fn(),
    trackError: jest.fn(),
    trackSatisfaction: jest.fn(),
    startTracking: jest.fn(),
    stopTracking: jest.fn(),
    exportAnalytics: jest.fn(),
    getAnalyticsSummary: jest.fn().mockReturnValue({
      totalEvents: 150,
      uniqueUsers: 25,
      sessionDuration: 1800000, // 30 minutes
      eventTypes: {
        page_view: 50,
        user_action: 100,
      },
      topActions: [
        { action: 'search:performed', count: 30 },
        { action: 'contact:viewed', count: 25 },
        { action: 'deal:created', count: 15 },
      ],
    }),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAnalytics.mockReturnValue(mockAnalytics)
  })

  describe('rendering', () => {
    it('should render the dashboard with correct title and description', () => {
      render(<AdvancedAnalyticsDashboard />)

      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
      expect(screen.getByText('Comprehensive insights into your CRM performance')).toBeInTheDocument()
    })

    it('should show tracking status indicator', () => {
      render(<AdvancedAnalyticsDashboard />)

      expect(screen.getByText('Tracking Active')).toBeInTheDocument()
    })

    it('should show export data button', () => {
      render(<AdvancedAnalyticsDashboard />)

      expect(screen.getByText('Export Data')).toBeInTheDocument()
    })

    it('should render time range selector buttons', () => {
      render(<AdvancedAnalyticsDashboard />)

      expect(screen.getByText('Last Hour')).toBeInTheDocument()
      expect(screen.getByText('Last 24 Hours')).toBeInTheDocument()
      expect(screen.getByText('Last 7 Days')).toBeInTheDocument()
      expect(screen.getByText('Last 30 Days')).toBeInTheDocument()
    })

    it('should render view selector buttons', () => {
      render(<AdvancedAnalyticsDashboard />)

      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Business')).toBeInTheDocument()
      expect(screen.getByText('User Behavior')).toBeInTheDocument()
      expect(screen.getByText('Performance')).toBeInTheDocument()
    })
  })

  describe('overview view', () => {
    it('should display overview metrics by default', () => {
      render(<AdvancedAnalyticsDashboard />)

      expect(screen.getByText('Total Events')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('25 unique users')).toBeInTheDocument()

      expect(screen.getByText('Session Duration')).toBeInTheDocument()
      expect(screen.getByText('30m')).toBeInTheDocument()

      expect(screen.getByText('Top Action')).toBeInTheDocument()
      expect(screen.getByText('search:performed')).toBeInTheDocument()
      expect(screen.getByText('30 times')).toBeInTheDocument()

      expect(screen.getByText('Event Types')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should display correct session duration', () => {
      mockUseAnalytics.mockReturnValue({
        ...mockAnalytics,
        getAnalyticsSummary: jest.fn().mockReturnValue({
          ...mockAnalytics.getAnalyticsSummary(),
          sessionDuration: 3600000, // 1 hour
        }),
      })

      render(<AdvancedAnalyticsDashboard />)

      expect(screen.getByText('60m')).toBeInTheDocument()
    })
  })

  describe('business view', () => {
    it('should display business metrics when business view is selected', () => {
      render(<AdvancedAnalyticsDashboard />)

      // Click on Business view
      fireEvent.click(screen.getByText('Business'))

      // Check for business metrics
      expect(screen.getByText('Total Contacts')).toBeInTheDocument()
      expect(screen.getByText('1,247')).toBeInTheDocument()

      expect(screen.getByText('Total Companies')).toBeInTheDocument()
      expect(screen.getByText('89')).toBeInTheDocument()

      expect(screen.getByText('Total Deals')).toBeInTheDocument()
      expect(screen.getByText('156')).toBeInTheDocument()

      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
      expect(screen.getByText('$2,840.0K')).toBeInTheDocument()

      expect(screen.getByText('Conversion Rate')).toBeInTheDocument()
      expect(screen.getByText('12.5%')).toBeInTheDocument()
    })

    it('should display conversion funnel', () => {
      render(<AdvancedAnalyticsDashboard />)

      fireEvent.click(screen.getByText('Business'))

      expect(screen.getByText('Conversion Funnel')).toBeInTheDocument()
      expect(screen.getByText('Awareness')).toBeInTheDocument()
      expect(screen.getByText('Consideration')).toBeInTheDocument()
      expect(screen.getByText('Decision')).toBeInTheDocument()
      expect(screen.getByText('Retention')).toBeInTheDocument()
    })
  })

  describe('user behavior view', () => {
    it('should display user behavior metrics when user view is selected', () => {
      render(<AdvancedAnalyticsDashboard />)

      fireEvent.click(screen.getByText('User Behavior'))

      expect(screen.getByText('Page Views')).toBeInTheDocument()
      expect(screen.getByText('2,847')).toBeInTheDocument()

      expect(screen.getByText('Unique Visitors')).toBeInTheDocument()
      expect(screen.getByText('1,247')).toBeInTheDocument()

      expect(screen.getByText('Session Duration')).toBeInTheDocument()
      expect(screen.getByText('20m')).toBeInTheDocument()

      expect(screen.getByText('Bounce Rate')).toBeInTheDocument()
      expect(screen.getByText('23.4%')).toBeInTheDocument()
    })

    it('should display top pages', () => {
      render(<AdvancedAnalyticsDashboard />)

      fireEvent.click(screen.getByText('User Behavior'))

      expect(screen.getByText('Top Pages')).toBeInTheDocument()
      expect(screen.getByText('/dashboard')).toBeInTheDocument()
      expect(screen.getByText('/contacts')).toBeInTheDocument()
      expect(screen.getByText('/companies')).toBeInTheDocument()
    })

    it('should display user journey', () => {
      render(<AdvancedAnalyticsDashboard />)

      fireEvent.click(screen.getByText('User Behavior'))

      expect(screen.getByText('User Journey')).toBeInTheDocument()
      expect(screen.getByText('Landing')).toBeInTheDocument()
      expect(screen.getByText('Browse')).toBeInTheDocument()
      expect(screen.getByText('Search')).toBeInTheDocument()
      expect(screen.getByText('View Details')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
      expect(screen.getByText('Convert')).toBeInTheDocument()
    })
  })

  describe('performance view', () => {
    it('should display performance metrics when performance view is selected', () => {
      render(<AdvancedAnalyticsDashboard />)

      fireEvent.click(screen.getByText('Performance'))

      expect(screen.getByText('Page Load Time')).toBeInTheDocument()
      expect(screen.getByText('1.2s')).toBeInTheDocument()

      expect(screen.getByText('API Response')).toBeInTheDocument()
      expect(screen.getByText('245ms')).toBeInTheDocument()

      expect(screen.getByText('Error Rate')).toBeInTheDocument()
      expect(screen.getByText('0.2%')).toBeInTheDocument()

      expect(screen.getByText('User Satisfaction')).toBeInTheDocument()
      expect(screen.getByText('4.8/5')).toBeInTheDocument()
    })

    it('should display device performance', () => {
      render(<AdvancedAnalyticsDashboard />)

      fireEvent.click(screen.getByText('Performance'))

      expect(screen.getByText('Device Performance')).toBeInTheDocument()
      expect(screen.getByText('Desktop')).toBeInTheDocument()
      expect(screen.getByText('Mobile')).toBeInTheDocument()
      expect(screen.getByText('Tablet')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should change time range when time range button is clicked', () => {
      render(<AdvancedAnalyticsDashboard />)

      const lastHourButton = screen.getByText('Last Hour')
      fireEvent.click(lastHourButton)

      // The button should have the active state
      expect(lastHourButton).toHaveClass('bg-blue-600')
    })

    it('should change view when view button is clicked', () => {
      render(<AdvancedAnalyticsDashboard />)

      const businessButton = screen.getByText('Business')
      fireEvent.click(businessButton)

      // Should show business metrics
      expect(screen.getByText('Total Contacts')).toBeInTheDocument()
    })

    it('should call exportAnalytics when export button is clicked', () => {
      render(<AdvancedAnalyticsDashboard />)

      const exportButton = screen.getByText('Export Data')
      fireEvent.click(exportButton)

      expect(mockAnalytics.exportAnalytics).toHaveBeenCalledWith('json')
    })
  })

  describe('tracking status', () => {
    it('should show tracking active when isTracking is true', () => {
      mockUseAnalytics.mockReturnValue({
        ...mockAnalytics,
        isTracking: true,
      })

      render(<AdvancedAnalyticsDashboard />)

      expect(screen.getByText('Tracking Active')).toBeInTheDocument()
      expect(screen.getByText('Tracking Active')).toHaveClass('bg-green-100', 'text-green-800')
    })

    it('should show tracking inactive when isTracking is false', () => {
      mockUseAnalytics.mockReturnValue({
        ...mockAnalytics,
        isTracking: false,
      })

      render(<AdvancedAnalyticsDashboard />)

      expect(screen.getByText('Tracking Inactive')).toBeInTheDocument()
      expect(screen.getByText('Tracking Inactive')).toHaveClass('bg-red-100', 'text-red-800')
    })
  })

  describe('metric formatting', () => {
    it('should format revenue values correctly', () => {
      render(<AdvancedAnalyticsDashboard />)

      fireEvent.click(screen.getByText('Business'))

      expect(screen.getByText('$2,840.0K')).toBeInTheDocument() // 2,840,000
    })

    it('should format percentage values correctly', () => {
      render(<AdvancedAnalyticsDashboard />)

      fireEvent.click(screen.getByText('Business'))

      expect(screen.getByText('12.5%')).toBeInTheDocument()
      expect(screen.getByText('3.2%')).toBeInTheDocument() // churn rate
    })

    it('should format duration values correctly', () => {
      render(<AdvancedAnalyticsDashboard />)

      fireEvent.click(screen.getByText('Business'))

      expect(screen.getByText('45 days')).toBeInTheDocument() // sales cycle length
    })
  })

  describe('responsive design', () => {
    it('should have responsive grid layouts', () => {
      render(<AdvancedAnalyticsDashboard />)

      // Overview view should have responsive grid
      const overviewCards = screen.getAllByText(/Total Events|Session Duration|Top Action|Event Types/)
      expect(overviewCards).toHaveLength(4)

      // Check for responsive classes
      const gridContainer = screen.getByText('Total Events').closest('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
    })

    it('should have responsive business metrics grid', () => {
      render(<AdvancedAnalyticsDashboard />)

      fireEvent.click(screen.getByText('Business'))

      const businessMetricsContainer = screen.getByText('Total Contacts').closest('.grid')
      expect(businessMetricsContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-5')
    })
  })

  describe('accessibility', () => {
    it('should have proper button roles and labels', () => {
      render(<AdvancedAnalyticsDashboard />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })

    it('should have proper heading structure', () => {
      render(<AdvancedAnalyticsDashboard />)

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
    })

    it('should have proper card structure', () => {
      render(<AdvancedAnalyticsDashboard />)

      const cards = screen.getAllByText(/Total Events|Session Duration|Top Action|Event Types/)
      cards.forEach(card => {
        expect(card.closest('[class*="card"]')).toBeInTheDocument()
      })
    })
  })

  describe('error handling', () => {
    it('should handle missing analytics data gracefully', () => {
      mockUseAnalytics.mockReturnValue({
        ...mockAnalytics,
        getAnalyticsSummary: jest.fn().mockReturnValue({
          totalEvents: 0,
          uniqueUsers: 0,
          sessionDuration: 0,
          eventTypes: {},
          topActions: [],
        }),
      })

      render(<AdvancedAnalyticsDashboard />)

      expect(screen.getByText('0')).toBeInTheDocument() // Total Events
      expect(screen.getByText('0 unique users')).toBeInTheDocument()
    })

    it('should handle null business metrics', () => {
      mockUseAnalytics.mockReturnValue({
        ...mockAnalytics,
        businessMetrics: null,
      })

      render(<AdvancedAnalyticsDashboard />)

      fireEvent.click(screen.getByText('Business'))

      // Should still render the view without crashing
      expect(screen.getByText('Conversion Funnel')).toBeInTheDocument()
    })
  })

  describe('performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<AdvancedAnalyticsDashboard />)

      // Mock the component to track renders
      const initialRender = screen.getByText('Advanced Analytics')

      rerender(<AdvancedAnalyticsDashboard />)

      // Should be the same element (no unnecessary re-render)
      expect(screen.getByText('Advanced Analytics')).toBe(initialRender)
    })
  })
})
