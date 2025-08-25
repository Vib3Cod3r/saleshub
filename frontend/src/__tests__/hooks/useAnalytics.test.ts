import { renderHook, act } from '@testing-library/react'
import { useAnalytics } from '../../hooks/useAnalytics'
import { useAuth } from '../../contexts/AuthContext'
import { useWebSocket } from '../../hooks/useWebSocket'

// Mock dependencies
jest.mock('../../contexts/AuthContext')
jest.mock('../../hooks/useWebSocket')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseWebSocket = useWebSocket as jest.MockedFunction<typeof useWebSocket>

describe('useAnalytics', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
  }

  const mockWebSocket = {
    isConnected: true,
    sendMessage: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      refreshToken: jest.fn(),
    })
    mockUseWebSocket.mockReturnValue(mockWebSocket)
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAnalytics())

      // The hook automatically tracks a page view on mount, so we expect 1 event
      expect(result.current.events).toHaveLength(1)
      expect(result.current.businessMetrics).toBeNull()
      expect(result.current.userBehaviorMetrics).toBeNull()
      expect(result.current.performanceMetrics).toBeNull()
      expect(result.current.isTracking).toBe(true)
    })

    it('should start tracking automatically on mount', () => {
      const { result } = renderHook(() => useAnalytics())

      expect(result.current.isTracking).toBe(true)
    })
  })

  describe('trackPageView', () => {
    it('should track page view with correct data', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackPageView('/test-page', 'Test Page')
      })

      // Should have 2 events: initial page view + the new one
      expect(result.current.events).toHaveLength(2)
      const event = result.current.events[1] // Get the second event (the new one)
      expect(event.type).toBe('page_view')
      expect(event.category).toBe('engagement')
      expect(event.action).toBe('page_view')
      expect(event.label).toBe('Test Page')
      expect(event.pageUrl).toBe(window.location.href)
      expect(event.userId).toBe(mockUser.id)
    })

    it('should send page view to WebSocket when connected', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackPageView('/test-page')
      })

      expect(mockWebSocket.sendMessage).toHaveBeenCalledWith({
        type: 'analytics_event',
        payload: expect.objectContaining({
          type: 'page_view',
          category: 'engagement',
          action: 'page_view',
        }),
      })
    })

    it('should not send to WebSocket when disconnected', () => {
      mockUseWebSocket.mockReturnValue({
        ...mockWebSocket,
        isConnected: false,
      })

      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackPageView('/test-page')
      })

      expect(mockWebSocket.sendMessage).not.toHaveBeenCalled()
    })
  })

  describe('trackEvent', () => {
    it('should track user action with correct data', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackEvent('test', 'action', 'label', 100, { test: 'data' })
      })

      // Should have 2 events: initial page view + the new user action
      expect(result.current.events).toHaveLength(2)
      const event = result.current.events[1] // Get the second event (the user action)
      expect(event.type).toBe('user_action')
      expect(event.category).toBe('test')
      expect(event.action).toBe('action')
      expect(event.label).toBe('label')
      expect(event.value).toBe(100)
      expect(event.properties).toEqual({ test: 'data' })
    })

    it('should send event to WebSocket when connected', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackEvent('test', 'action')
      })

      expect(mockWebSocket.sendMessage).toHaveBeenCalledWith({
        type: 'analytics_event',
        payload: expect.objectContaining({
          type: 'user_action',
          category: 'test',
          action: 'action',
        }),
      })
    })
  })

  describe('trackBusinessMetrics', () => {
    it('should update business metrics', () => {
      const { result } = renderHook(() => useAnalytics())

      const metrics = {
        totalRevenue: 1000000,
        conversionRate: 15.5,
      }

      act(() => {
        result.current.trackBusinessMetrics(metrics)
      })

      expect(result.current.businessMetrics).toEqual(metrics)
    })

    it('should merge with existing business metrics', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackBusinessMetrics({ totalRevenue: 1000000 })
        result.current.trackBusinessMetrics({ conversionRate: 15.5 })
      })

      expect(result.current.businessMetrics).toEqual({
        totalRevenue: 1000000,
        conversionRate: 15.5,
      })
    })

    it('should send business metrics to WebSocket', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackBusinessMetrics({ totalRevenue: 1000000 })
      })

      expect(mockWebSocket.sendMessage).toHaveBeenCalledWith({
        type: 'business_metrics',
        payload: {
          metrics: { totalRevenue: 1000000 },
          timestamp: expect.any(String),
          userId: mockUser.id,
        },
      })
    })
  })

  describe('trackUserBehavior', () => {
    it('should update user behavior metrics', () => {
      const { result } = renderHook(() => useAnalytics())

      const metrics = {
        pageViews: 1000,
        uniqueVisitors: 500,
      }

      act(() => {
        result.current.trackUserBehavior(metrics)
      })

      expect(result.current.userBehaviorMetrics).toEqual(metrics)
    })

    it('should send user behavior to WebSocket', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackUserBehavior({ pageViews: 1000 })
      })

      expect(mockWebSocket.sendMessage).toHaveBeenCalledWith({
        type: 'user_behavior',
        payload: {
          metrics: { pageViews: 1000 },
          timestamp: expect.any(String),
          userId: mockUser.id,
        },
      })
    })
  })

  describe('trackPerformance', () => {
    it('should update performance metrics', () => {
      const { result } = renderHook(() => useAnalytics())

      const metrics = {
        pageLoadTime: 1200,
        apiResponseTime: 250,
      }

      act(() => {
        result.current.trackPerformance(metrics)
      })

      expect(result.current.performanceMetrics).toEqual(metrics)
    })

    it('should send performance metrics to WebSocket', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackPerformance({ pageLoadTime: 1200 })
      })

      expect(mockWebSocket.sendMessage).toHaveBeenCalledWith({
        type: 'performance_metrics',
        payload: {
          metrics: { pageLoadTime: 1200 },
          timestamp: expect.any(String),
          userId: mockUser.id,
        },
      })
    })
  })

  describe('trackConversionFunnel', () => {
    it('should track conversion funnel stage', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackConversionFunnel('awareness', 100)
      })

      // Should have 2 events: initial page view + the conversion funnel event
      expect(result.current.events).toHaveLength(2)
      const event = result.current.events[1] // Get the second event (the conversion funnel)
      expect(event.category).toBe('conversion')
      expect(event.action).toBe('funnel_stage')
      expect(event.label).toBe('awareness')
      expect(event.value).toBe(100)
      expect(event.properties).toEqual({
        funnelStage: 'awareness',
        conversionValue: 100,
      })
    })
  })

  describe('trackFeatureUsage', () => {
    it('should track feature usage', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackFeatureUsage('search', 5)
      })

      // Should have 2 events: initial page view + the feature usage event
      expect(result.current.events).toHaveLength(2)
      const event = result.current.events[1] // Get the second event (the feature usage)
      expect(event.category).toBe('feature')
      expect(event.action).toBe('usage')
      expect(event.label).toBe('search')
      expect(event.value).toBe(5)
      expect(event.properties).toEqual({
        feature: 'search',
        usageCount: 5,
      })
    })

    it('should use default usage count of 1', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackFeatureUsage('search')
      })

      const event = result.current.events[0]
      expect(event.value).toBe(1)
      expect(event.properties?.usageCount).toBe(1)
    })
  })

  describe('trackError', () => {
    it('should track error with context', () => {
      const { result } = renderHook(() => useAnalytics())

      const error = new Error('Test error')
      const context = 'test-context'

      act(() => {
        result.current.trackError(error, context)
      })

      // Should have 2 events: initial page view + the error event
      expect(result.current.events).toHaveLength(2)
      const event = result.current.events[1] // Get the second event (the error)
      expect(event.category).toBe('error')
      expect(event.action).toBe('occurred')
      expect(event.label).toBe('Test error')
      expect(event.value).toBe(1)
      expect(event.properties).toEqual({
        errorName: 'Error',
        errorMessage: 'Test error',
        errorStack: error.stack,
        context: 'test-context',
      })
    })
  })

  describe('trackSatisfaction', () => {
    it('should track user satisfaction', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackSatisfaction(4.5, 'Great experience!')
      })

      // Should have 2 events: initial page view + the satisfaction event
      expect(result.current.events).toHaveLength(2)
      const event = result.current.events[1] // Get the second event (the satisfaction)
      expect(event.category).toBe('satisfaction')
      expect(event.action).toBe('rated')
      expect(event.label).toBe('user_satisfaction')
      expect(event.value).toBe(4.5)
      expect(event.properties).toEqual({
        satisfactionScore: 4.5,
        feedback: 'Great experience!',
      })
    })
  })

  describe('getAnalyticsSummary', () => {
    it('should return correct analytics summary', () => {
      const { result } = renderHook(() => useAnalytics())

      // Add some events
      act(() => {
        result.current.trackEvent('test', 'action1')
        result.current.trackEvent('test', 'action2')
        result.current.trackEvent('other', 'action3')
      })

      const summary = result.current.getAnalyticsSummary()

      // Should have 4 events: initial page view + 3 user actions
      expect(summary.totalEvents).toBe(4)
      expect(summary.uniqueUsers).toBe(1)
      expect(summary.eventTypes).toEqual({
        page_view: 1,
        user_action: 3,
      })
      expect(summary.topActions).toEqual([
        { action: 'test:action1', count: 1 },
        { action: 'test:action2', count: 1 },
        { action: 'other:action3', count: 1 },
      ])
    })

    it('should calculate session duration correctly', () => {
      const { result } = renderHook(() => useAnalytics())

      // Wait a bit to simulate time passing
      act(() => {
        jest.advanceTimersByTime(60000) // 1 minute
      })

      const summary = result.current.getAnalyticsSummary()
      expect(summary.sessionDuration).toBeGreaterThan(0)
    })
  })

  describe('exportAnalytics', () => {
    beforeEach(() => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      global.URL.createObjectURL = jest.fn(() => 'mock-url')
      global.URL.revokeObjectURL = jest.fn()
      
      // Mock document.createElement and click
      const mockAnchor = {
        href: '',
        download: '',
        click: jest.fn(),
        appendChild: jest.fn(),
        removeChild: jest.fn(),
      }
      jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
    })

    it('should export analytics data as JSON', () => {
      const { result } = renderHook(() => useAnalytics())

      // Add some data
      act(() => {
        result.current.trackEvent('test', 'action')
        result.current.trackBusinessMetrics({ totalRevenue: 1000000 })
      })

      act(() => {
        result.current.exportAnalytics('json')
      })

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.any(Blob)
      )
      expect(document.createElement).toHaveBeenCalledWith('a')
    })

    it('should export analytics data as CSV', () => {
      const { result } = renderHook(() => useAnalytics())

      // Add some events
      act(() => {
        result.current.trackEvent('test', 'action')
      })

      act(() => {
        result.current.exportAnalytics('csv')
      })

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.any(Blob)
      )
    })
  })

  describe('startTracking and stopTracking', () => {
    it('should start and stop tracking', () => {
      const { result } = renderHook(() => useAnalytics())

      expect(result.current.isTracking).toBe(true)

      act(() => {
        result.current.stopTracking()
      })

      expect(result.current.isTracking).toBe(false)

      act(() => {
        result.current.startTracking()
      })

      expect(result.current.isTracking).toBe(true)
    })
  })

  describe('event storage limits', () => {
    it('should limit events to last 1000', () => {
      const { result } = renderHook(() => useAnalytics())

      // Add more than 1000 events
      act(() => {
        for (let i = 0; i < 1005; i++) {
          result.current.trackEvent('test', `action${i}`)
        }
      })

      expect(result.current.events).toHaveLength(1000)
      // Should keep the most recent events
      expect(result.current.events[0].properties?.action).toBe('action1004')
    })
  })

  describe('anonymous user handling', () => {
    it('should handle anonymous users correctly', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        refreshToken: jest.fn(),
      })

      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackEvent('test', 'action')
      })

      const event = result.current.events[0]
      expect(event.userId).toBe('anonymous')
    })
  })
})
