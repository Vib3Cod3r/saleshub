import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWebSocket } from './useWebSocket'

interface AnalyticsEvent {
  id: string
  type: string
  category: string
  action: string
  label?: string
  value?: number
  properties?: Record<string, any>
  timestamp: string
  userId: string
  sessionId: string
  pageUrl: string
  userAgent: string
}

interface BusinessMetrics {
  totalContacts: number
  totalCompanies: number
  totalDeals: number
  totalRevenue: number
  conversionRate: number
  averageDealSize: number
  salesCycleLength: number
  customerLifetimeValue: number
  churnRate: number
  growthRate: number
}

interface UserBehaviorMetrics {
  pageViews: number
  uniqueVisitors: number
  sessionDuration: number
  bounceRate: number
  conversionFunnel: {
    awareness: number
    consideration: number
    decision: number
    retention: number
  }
  topPages: Array<{
    page: string
    views: number
    timeOnPage: number
  }>
  userJourney: Array<{
    step: string
    users: number
    dropoff: number
  }>
}

interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  errorRate: number
  userSatisfaction: number
  featureUsage: Record<string, number>
  devicePerformance: {
    desktop: number
    mobile: number
    tablet: number
  }
}

export function useAnalytics() {
  const { user } = useAuth()
  const { isConnected, sendMessage } = useWebSocket()
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null)
  const [userBehaviorMetrics, setUserBehaviorMetrics] = useState<UserBehaviorMetrics | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  
  const sessionIdRef = useRef(`session-${Date.now()}`)
  const sessionStartTimeRef = useRef(Date.now())
  const pageViewStartTimeRef = useRef(Date.now())

  // Generate unique event ID
  const generateEventId = () => `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Track page view
  const trackPageView = useCallback((page: string, title?: string) => {
    const event: AnalyticsEvent = {
      id: generateEventId(),
      type: 'page_view',
      category: 'engagement',
      action: 'page_view',
      label: title || page,
      properties: {
        page,
        title,
        referrer: document.referrer,
        timeOnPreviousPage: Date.now() - pageViewStartTimeRef.current,
      },
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      sessionId: sessionIdRef.current,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    }

    setEvents(prev => [event, ...prev.slice(0, 999)]) // Keep last 1000 events
    pageViewStartTimeRef.current = Date.now()

    // Send to WebSocket if connected
    if (isConnected) {
      sendMessage({
        type: 'analytics_event',
        payload: event,
      })
    }
  }, [user, isConnected, sendMessage])

  // Track user action
  const trackEvent = useCallback((
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ) => {
    const event: AnalyticsEvent = {
      id: generateEventId(),
      type: 'user_action',
      category,
      action,
      label,
      value,
      properties,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      sessionId: sessionIdRef.current,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    }

    setEvents(prev => [event, ...prev.slice(0, 999)])

    // Send to WebSocket if connected
    if (isConnected) {
      sendMessage({
        type: 'analytics_event',
        payload: event,
      })
    }
  }, [user, isConnected, sendMessage])

  // Track business metrics
  const trackBusinessMetrics = useCallback((metrics: Partial<BusinessMetrics>) => {
    setBusinessMetrics(prev => ({ ...prev, ...metrics } as BusinessMetrics))

    // Send to WebSocket if connected
    if (isConnected) {
      sendMessage({
        type: 'business_metrics',
        payload: {
          metrics,
          timestamp: new Date().toISOString(),
          userId: user?.id,
        },
      })
    }
  }, [user, isConnected, sendMessage])

  // Track user behavior
  const trackUserBehavior = useCallback((metrics: Partial<UserBehaviorMetrics>) => {
    setUserBehaviorMetrics(prev => ({ ...prev, ...metrics } as UserBehaviorMetrics))

    // Send to WebSocket if connected
    if (isConnected) {
      sendMessage({
        type: 'user_behavior',
        payload: {
          metrics,
          timestamp: new Date().toISOString(),
          userId: user?.id,
        },
      })
    }
  }, [user, isConnected, sendMessage])

  // Track performance metrics
  const trackPerformance = useCallback((metrics: Partial<PerformanceMetrics>) => {
    setPerformanceMetrics(prev => ({ ...prev, ...metrics } as PerformanceMetrics))

    // Send to WebSocket if connected
    if (isConnected) {
      sendMessage({
        type: 'performance_metrics',
        payload: {
          metrics,
          timestamp: new Date().toISOString(),
          userId: user?.id,
        },
      })
    }
  }, [user, isConnected, sendMessage])

  // Track conversion funnel
  const trackConversionFunnel = useCallback((stage: string, value: number) => {
    trackEvent('conversion', 'funnel_stage', stage, value, {
      funnelStage: stage,
      conversionValue: value,
    })
  }, [trackEvent])

  // Track feature usage
  const trackFeatureUsage = useCallback((feature: string, usage: number = 1) => {
    trackEvent('feature', 'usage', feature, usage, {
      feature,
      usageCount: usage,
    })
  }, [trackEvent])

  // Track error
  const trackError = useCallback((error: Error, context?: string) => {
    trackEvent('error', 'occurred', error.message, 1, {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      context,
    })
  }, [trackEvent])

  // Track user satisfaction
  const trackSatisfaction = useCallback((score: number, feedback?: string) => {
    trackEvent('satisfaction', 'rated', 'user_satisfaction', score, {
      satisfactionScore: score,
      feedback,
    })
  }, [trackEvent])

  // Get analytics summary
  const getAnalyticsSummary = useCallback(() => {
    const totalEvents = events.length
    const uniqueUsers = new Set(events.map(e => e.userId)).size
    const sessionDuration = Date.now() - sessionStartTimeRef.current

    const eventTypes = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topActions = events.reduce((acc, event) => {
      const key = `${event.category}:${event.action}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalEvents,
      uniqueUsers,
      sessionDuration,
      eventTypes,
      topActions: Object.entries(topActions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([action, count]) => ({ action, count })),
    }
  }, [events])

  // Export analytics data
  const exportAnalytics = useCallback((format: 'json' | 'csv' = 'json') => {
    const data = {
      events,
      businessMetrics,
      userBehaviorMetrics,
      performanceMetrics,
      summary: getAnalyticsSummary(),
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      // Convert events to CSV
      const csvContent = [
        ['ID', 'Type', 'Category', 'Action', 'Label', 'Value', 'Timestamp', 'UserId', 'SessionId'],
        ...events.map(event => [
          event.id,
          event.type,
          event.category,
          event.action,
          event.label || '',
          event.value || '',
          event.timestamp,
          event.userId,
          event.sessionId,
        ])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [events, businessMetrics, userBehaviorMetrics, performanceMetrics, getAnalyticsSummary])

  // Start tracking
  const startTracking = useCallback(() => {
    setIsTracking(true)
    sessionIdRef.current = `session-${Date.now()}`
    sessionStartTimeRef.current = Date.now()
    pageViewStartTimeRef.current = Date.now()

    // Track initial page view
    trackPageView(window.location.pathname, document.title)

    // Set up page view tracking
    const handleRouteChange = () => {
      trackPageView(window.location.pathname, document.title)
    }

    // Listen for route changes (Next.js)
    window.addEventListener('popstate', handleRouteChange)

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      setIsTracking(false)
    }
  }, [trackPageView])

  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false)
  }, [])

  // Auto-start tracking on mount
  useEffect(() => {
    const cleanup = startTracking()
    return cleanup
  }, [startTracking])

  return {
    // State
    events,
    businessMetrics,
    userBehaviorMetrics,
    performanceMetrics,
    isTracking,
    
    // Actions
    trackPageView,
    trackEvent,
    trackBusinessMetrics,
    trackUserBehavior,
    trackPerformance,
    trackConversionFunnel,
    trackFeatureUsage,
    trackError,
    trackSatisfaction,
    startTracking,
    stopTracking,
    exportAnalytics,
    getAnalyticsSummary,
  }
}
