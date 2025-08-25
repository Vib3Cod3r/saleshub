import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../../contexts/AuthContext'
import DashboardPage from '../../../app/dashboard/page'
import { useDashboardStats, useRecentActivity } from '../../../hooks/api/useApi'
import { useRealtimeDashboard } from '../../../hooks/useRealtimeDashboard'

const mockDashboardStats = {
  totalContacts: 1250,
  totalCompanies: 89,
  totalDeals: 234,
  totalRevenue: 1250000,
  recentGrowth: 12.5,
  conversionRate: 23.4,
}

const mockRecentActivity = [
  {
    id: '1',
    type: 'contact_created',
    description: 'New contact John Doe added',
    timestamp: new Date('2024-12-19T10:00:00Z'),
    user: { id: '1', name: 'Admin User' },
  },
  {
    id: '2',
    type: 'deal_closed',
    description: 'Deal "Enterprise Contract" closed',
    timestamp: new Date('2024-12-19T09:30:00Z'),
    user: { id: '2', name: 'Sales Manager' },
  },
  {
    id: '3',
    type: 'company_updated',
    description: 'Company "Tech Corp" information updated',
    timestamp: new Date('2024-12-19T09:00:00Z'),
    user: { id: '1', name: 'Admin User' },
  },
]

describe('Dashboard Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  afterEach(() => {
    queryClient.clear()
    jest.clearAllMocks()
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{component}</AuthProvider>
      </QueryClientProvider>
    )
  }

  describe('Dashboard Data Loading', () => {
    it('should load and display dashboard data successfully', async () => {
      ;(useDashboardStats as jest.Mock).mockReturnValue({
        data: mockDashboardStats,
        isLoading: false,
        error: null,
      })
      ;(useRecentActivity as jest.Mock).mockReturnValue({
        data: mockRecentActivity,
        isLoading: false,
        error: null,
      })
      ;(useRealtimeDashboard as jest.Mock).mockReturnValue({
        stats: mockDashboardStats,
        recentActivity: mockRecentActivity,
        isConnected: true,
      })

      renderWithProviders(<DashboardPage />)

      // Should display dashboard stats
      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument() // Total contacts
        expect(screen.getByText('89')).toBeInTheDocument() // Total companies
        expect(screen.getByText('234')).toBeInTheDocument() // Total deals
        expect(screen.getByText('$1,250,000')).toBeInTheDocument() // Total revenue
      })

      // Should display recent activity
      expect(screen.getByText('New contact John Doe added')).toBeInTheDocument()
      expect(screen.getByText('Deal "Enterprise Contract" closed')).toBeInTheDocument()
      expect(screen.getByText('Company "Tech Corp" information updated')).toBeInTheDocument()
    })

    it('should show loading state while data is being fetched', async () => {
      ;(useDashboardStats as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      })
      ;(useRecentActivity as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      })

      renderWithProviders(<DashboardPage />)

      // Should show loading indicators
      expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(4) // Stats cards
      expect(screen.getByTestId('activity-loading')).toBeInTheDocument()
    })

    it('should handle data loading errors gracefully', async () => {
      ;(useDashboardStats as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load dashboard data'),
      })
      ;(useRecentActivity as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load recent activity'),
      })

      renderWithProviders(<DashboardPage />)

      // Should show error messages
      await waitFor(() => {
        expect(screen.getByText(/failed to load dashboard data/i)).toBeInTheDocument()
        expect(screen.getByText(/failed to load recent activity/i)).toBeInTheDocument()
      })

      // Should show retry buttons
      const retryButtons = screen.getAllByRole('button', { name: /retry/i })
      expect(retryButtons).toHaveLength(2)
    })
  })

  describe('Real-time Updates', () => {
    it('should display real-time connection status', async () => {
      ;(useDashboardStats as jest.Mock).mockReturnValue({
        data: mockDashboardStats,
        isLoading: false,
        error: null,
      })
      ;(useRecentActivity as jest.Mock).mockReturnValue({
        data: mockRecentActivity,
        isLoading: false,
        error: null,
      })
      ;(useRealtimeDashboard as jest.Mock).mockReturnValue({
        stats: mockDashboardStats,
        recentActivity: mockRecentActivity,
        isConnected: true,
      })

      renderWithProviders(<DashboardPage />)

      // Should show connected status
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent(/connected/i)
      })
    })

    it('should handle real-time connection loss', async () => {
      ;(useDashboardStats as jest.Mock).mockReturnValue({
        data: mockDashboardStats,
        isLoading: false,
        error: null,
      })
      ;(useRecentActivity as jest.Mock).mockReturnValue({
        data: mockRecentActivity,
        isLoading: false,
        error: null,
      })
      ;(useRealtimeDashboard as jest.Mock).mockReturnValue({
        stats: mockDashboardStats,
        recentActivity: mockRecentActivity,
        isConnected: false,
      })

      renderWithProviders(<DashboardPage />)

      // Should show disconnected status
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent(/disconnected/i)
      })
    })

    it('should update dashboard data in real-time', async () => {
      const initialStats = { ...mockDashboardStats, totalContacts: 1250 }
      const updatedStats = { ...mockDashboardStats, totalContacts: 1251 }

      ;(useDashboardStats as jest.Mock).mockReturnValue({
        data: initialStats,
        isLoading: false,
        error: null,
      })
      ;(useRecentActivity as jest.Mock).mockReturnValue({
        data: mockRecentActivity,
        isLoading: false,
        error: null,
      })

      const { rerender } = renderWithProviders(<DashboardPage />)

      // Initial state
      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument()
      })

      // Update real-time data
      ;(useRealtimeDashboard as jest.Mock).mockReturnValue({
        stats: updatedStats,
        recentActivity: mockRecentActivity,
        isConnected: true,
      })

      rerender(
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <DashboardPage />
          </AuthProvider>
        </QueryClientProvider>
      )

      // Should show updated data
      await waitFor(() => {
        expect(screen.getByText('1,251')).toBeInTheDocument()
      })
    })
  })

  describe('Dashboard Interactions', () => {
    it('should handle chart interactions', async () => {
      ;(useDashboardStats as jest.Mock).mockReturnValue({
        data: mockDashboardStats,
        isLoading: false,
        error: null,
      })
      ;(useRecentActivity as jest.Mock).mockReturnValue({
        data: mockRecentActivity,
        isLoading: false,
        error: null,
      })
      ;(useRealtimeDashboard as jest.Mock).mockReturnValue({
        stats: mockDashboardStats,
        recentActivity: mockRecentActivity,
        isConnected: true,
      })

      renderWithProviders(<DashboardPage />)

      // Find and interact with charts
      const revenueChart = screen.getByTestId('revenue-chart')
      fireEvent.click(revenueChart)

      // Should show chart details or tooltip
      await waitFor(() => {
        expect(screen.getByText(/revenue details/i)).toBeInTheDocument()
      })
    })

    it('should handle data export functionality', async () => {
      ;(useDashboardStats as jest.Mock).mockReturnValue({
        data: mockDashboardStats,
        isLoading: false,
        error: null,
      })
      ;(useRecentActivity as jest.Mock).mockReturnValue({
        data: mockRecentActivity,
        isLoading: false,
        error: null,
      })
      ;(useRealtimeDashboard as jest.Mock).mockReturnValue({
        stats: mockDashboardStats,
        recentActivity: mockRecentActivity,
        isConnected: true,
      })

      renderWithProviders(<DashboardPage />)

      // Open export modal
      const exportButton = screen.getByRole('button', { name: /export dashboard/i })
      fireEvent.click(exportButton)

      await waitFor(() => {
        expect(screen.getByText(/export dashboard data/i)).toBeInTheDocument()
      })

      // Select export format
      const pdfOption = screen.getByLabelText(/pdf/i)
      fireEvent.click(pdfOption)

      // Export data
      const exportDataButton = screen.getByRole('button', { name: /export/i })
      fireEvent.click(exportDataButton)

      // Should trigger download
      await waitFor(() => {
        expect(screen.getByText(/export completed/i)).toBeInTheDocument()
      })
    })

    it('should handle time range selection', async () => {
      ;(useDashboardStats as jest.Mock).mockReturnValue({
        data: mockDashboardStats,
        isLoading: false,
        error: null,
      })
      ;(useRecentActivity as jest.Mock).mockReturnValue({
        data: mockRecentActivity,
        isLoading: false,
        error: null,
      })
      ;(useRealtimeDashboard as jest.Mock).mockReturnValue({
        stats: mockDashboardStats,
        recentActivity: mockRecentActivity,
        isConnected: true,
      })

      renderWithProviders(<DashboardPage />)

      // Open time range selector
      const timeRangeButton = screen.getByRole('button', { name: /last 30 days/i })
      fireEvent.click(timeRangeButton)

      // Select different time range
      const weekOption = screen.getByRole('button', { name: /last 7 days/i })
      fireEvent.click(weekOption)

      // Should update dashboard data
      await waitFor(() => {
        expect(timeRangeButton).toHaveTextContent(/last 7 days/i)
      })
    })
  })

  describe('Dashboard Alerts', () => {
    it('should display important alerts', async () => {
      const mockAlerts = [
        {
          id: '1',
          type: 'warning',
          title: 'Low Contact Growth',
          message: 'Contact growth rate is below target',
          timestamp: new Date('2024-12-19T10:00:00Z'),
        },
        {
          id: '2',
          type: 'info',
          title: 'System Maintenance',
          message: 'Scheduled maintenance in 2 hours',
          timestamp: new Date('2024-12-19T09:00:00Z'),
        },
      ]

      ;(useDashboardStats as jest.Mock).mockReturnValue({
        data: mockDashboardStats,
        isLoading: false,
        error: null,
      })
      ;(useRecentActivity as jest.Mock).mockReturnValue({
        data: mockRecentActivity,
        isLoading: false,
        error: null,
      })
      ;(useRealtimeDashboard as jest.Mock).mockReturnValue({
        stats: mockDashboardStats,
        recentActivity: mockRecentActivity,
        isConnected: true,
        alerts: mockAlerts,
      })

      renderWithProviders(<DashboardPage />)

      // Should display alerts
      await waitFor(() => {
        expect(screen.getByText('Low Contact Growth')).toBeInTheDocument()
        expect(screen.getByText('System Maintenance')).toBeInTheDocument()
      })

      // Should show alert types with appropriate styling
      const warningAlert = screen.getByTestId('alert-warning')
      const infoAlert = screen.getByTestId('alert-info')
      expect(warningAlert).toBeInTheDocument()
      expect(infoAlert).toBeInTheDocument()
    })

    it('should allow dismissing alerts', async () => {
      const mockAlerts = [
        {
          id: '1',
          type: 'warning',
          title: 'Test Alert',
          message: 'This is a test alert',
          timestamp: new Date('2024-12-19T10:00:00Z'),
        },
      ]

      ;(useDashboardStats as jest.Mock).mockReturnValue({
        data: mockDashboardStats,
        isLoading: false,
        error: null,
      })
      ;(useRecentActivity as jest.Mock).mockReturnValue({
        data: mockRecentActivity,
        isLoading: false,
        error: null,
      })
      ;(useRealtimeDashboard as jest.Mock).mockReturnValue({
        stats: mockDashboardStats,
        recentActivity: mockRecentActivity,
        isConnected: true,
        alerts: mockAlerts,
      })

      renderWithProviders(<DashboardPage />)

      // Should show alert
      await waitFor(() => {
        expect(screen.getByText('Test Alert')).toBeInTheDocument()
      })

      // Dismiss alert
      const dismissButton = screen.getByRole('button', { name: /dismiss/i })
      fireEvent.click(dismissButton)

      // Should remove alert
      await waitFor(() => {
        expect(screen.queryByText('Test Alert')).not.toBeInTheDocument()
      })
    })
  })

  describe('Performance and Responsiveness', () => {
    it('should load dashboard within performance threshold', async () => {
      const startTime = performance.now()

      ;(useDashboardStats as jest.Mock).mockReturnValue({
        data: mockDashboardStats,
        isLoading: false,
        error: null,
      })
      ;(useRecentActivity as jest.Mock).mockReturnValue({
        data: mockRecentActivity,
        isLoading: false,
        error: null,
      })
      ;(useRealtimeDashboard as jest.Mock).mockReturnValue({
        stats: mockDashboardStats,
        recentActivity: mockRecentActivity,
        isConnected: true,
      })

      renderWithProviders(<DashboardPage />)

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const loadTime = endTime - startTime

      // Should load within 2 seconds
      expect(loadTime).toBeLessThan(2000)
    })

    it('should handle large datasets efficiently', async () => {
      const largeActivityList = Array.from({ length: 100 }, (_, i) => ({
        id: `activity-${i}`,
        type: 'contact_created',
        description: `Activity ${i}`,
        timestamp: new Date(`2024-12-19T${10 - Math.floor(i / 10)}:${i % 60}:00Z`),
        user: { id: '1', name: 'Admin User' },
      }))

      ;(useDashboardStats as jest.Mock).mockReturnValue({
        data: mockDashboardStats,
        isLoading: false,
        error: null,
      })
      ;(useRecentActivity as jest.Mock).mockReturnValue({
        data: largeActivityList,
        isLoading: false,
        error: null,
      })
      ;(useRealtimeDashboard as jest.Mock).mockReturnValue({
        stats: mockDashboardStats,
        recentActivity: largeActivityList,
        isConnected: true,
      })

      renderWithProviders(<DashboardPage />)

      // Should display paginated or virtualized list
      await waitFor(() => {
        expect(screen.getByText('Activity 0')).toBeInTheDocument()
        expect(screen.getByText('Activity 9')).toBeInTheDocument()
      })

      // Should not render all 100 items at once
      expect(screen.queryByText('Activity 99')).not.toBeInTheDocument()
    })
  })
})
