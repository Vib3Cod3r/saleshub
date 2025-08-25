import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from './useWebSocket'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'

export function useRealtimeDashboard() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { isConnected, sendMessage } = useWebSocket()
  const [dashboardAlerts, setDashboardAlerts] = useState<any[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({})

  // Handle real-time dashboard updates
  useEffect(() => {
    if (!isConnected) return

    const handleDashboardUpdate = (data: any) => {
      const { type, payload } = data
      
      switch (type) {
        case 'stats_update':
          // Update dashboard statistics
          queryClient.setQueryData(['dashboard-stats'], (old: any) => {
            if (!old) return payload
            return { ...old, ...payload }
          })
          break

        case 'activity_update':
          // Add new activity to the feed
          queryClient.setQueryData(['recent-activity'], (old: any[] | undefined) => {
            if (!old) return [payload]
            return [payload, ...old.slice(0, 9)] // Keep only 10 activities
          })
          
          // Show activity notification
          toast.success(`New activity: ${payload.title}`, {
            duration: 3000,
          })
          break

        case 'kpi_update':
          // Update specific KPI
          queryClient.setQueryData(['dashboard-stats'], (old: any) => {
            if (!old) return old
            return {
              ...old,
              [payload.metric]: payload.value,
              [`${payload.metric}Growth`]: payload.growth,
            }
          })
          break

        case 'revenue_update':
          // Update revenue metrics
          queryClient.setQueryData(['dashboard-stats'], (old: any) => {
            if (!old) return old
            return {
              ...old,
              totalRevenue: payload.totalRevenue,
              revenueGrowth: payload.revenueGrowth,
              monthlyRevenue: payload.monthlyRevenue,
            }
          })
          break

        case 'pipeline_update':
          // Update pipeline metrics
          queryClient.setQueryData(['dashboard-stats'], (old: any) => {
            if (!old) return old
            return {
              ...old,
              totalDeals: payload.totalDeals,
              dealsGrowth: payload.dealsGrowth,
              pipelineValue: payload.pipelineValue,
            }
          })
          break

        case 'user_activity':
          // Update user activity metrics
          queryClient.setQueryData(['dashboard-stats'], (old: any) => {
            if (!old) return old
            return {
              ...old,
              activeUsers: payload.activeUsers,
              userEngagement: payload.userEngagement,
            }
          })
          break

        case 'dashboard_alert':
          // Add dashboard alert
          setDashboardAlerts(prev => [payload.alert, ...prev.slice(0, 9)]) // Keep last 10 alerts
          
          // Show alert notification
          toast(payload.alert.message, {
            icon: payload.alert.type === 'warning' ? '⚠️' : '🚨',
            duration: 5000,
          })
          break

        case 'performance_metrics':
          // Update performance metrics
          setPerformanceMetrics(payload.metrics)
          break

        case 'goal_achievement':
          // Goal achievement notification
          queryClient.setQueryData(['dashboard-stats'], (old: any) => {
            if (!old) return old
            return {
              ...old,
              goals: payload.goals,
            }
          })
          
          toast.success(`🎉 Goal achieved: ${payload.goal.name}!`, {
            duration: 5000,
          })
          break

        case 'trend_alert':
          // Trend alert notification
          toast(`${payload.trend.direction === 'up' ? '📈' : '📉'} ${payload.trend.message}`, {
            duration: 4000,
          })
          break

        default:
          console.log('Unknown dashboard update type:', type)
      }
    }

    // Listen for dashboard updates
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'dashboard_update') {
          handleDashboardUpdate(message.payload)
        }
      } catch (error) {
        console.error('Failed to handle dashboard update:', error)
      }
    }

    // Add event listener for WebSocket messages
    const socket = (window as any).__websocket__
    if (socket) {
      socket.addEventListener('message', handleMessage)
    }

    return () => {
      if (socket) {
        socket.removeEventListener('message', handleMessage)
      }
    }
  }, [isConnected, queryClient])

  // Send dashboard update notifications
  const notifyDashboardUpdate = (type: string, payload: any) => {
    if (isConnected) {
      sendMessage({
        type: 'dashboard_update',
        payload: {
          type,
          payload,
          timestamp: new Date().toISOString(),
        }
      })
    }
  }

  // Request dashboard refresh
  const refreshDashboard = () => {
    if (isConnected) {
      sendMessage({
        type: 'dashboard_update',
        payload: {
          type: 'refresh_request',
          timestamp: new Date().toISOString(),
        }
      })
    }
  }

  // Send dashboard alert
  const sendDashboardAlert = (alert: any) => {
    if (isConnected) {
      sendMessage({
        type: 'dashboard_update',
        payload: {
          type: 'dashboard_alert',
          alert,
          userId: user?.id,
          userName: user?.name,
          timestamp: new Date().toISOString(),
        }
      })
    }
  }

  // Track performance metrics
  const trackPerformanceMetrics = (metrics: any) => {
    if (isConnected) {
      sendMessage({
        type: 'dashboard_update',
        payload: {
          type: 'performance_metrics',
          metrics,
          userId: user?.id,
          userName: user?.name,
          timestamp: new Date().toISOString(),
        }
      })
    }
  }

  // Report goal achievement
  const reportGoalAchievement = (goal: any) => {
    if (isConnected) {
      sendMessage({
        type: 'dashboard_update',
        payload: {
          type: 'goal_achievement',
          goal,
          userId: user?.id,
          userName: user?.name,
          timestamp: new Date().toISOString(),
        }
      })
    }
  }

  // Report trend alert
  const reportTrendAlert = (trend: any) => {
    if (isConnected) {
      sendMessage({
        type: 'dashboard_update',
        payload: {
          type: 'trend_alert',
          trend,
          userId: user?.id,
          userName: user?.name,
          timestamp: new Date().toISOString(),
        }
      })
    }
  }

  return {
    notifyDashboardUpdate,
    refreshDashboard,
    sendDashboardAlert,
    trackPerformanceMetrics,
    reportGoalAchievement,
    reportTrendAlert,
    dashboardAlerts,
    performanceMetrics,
    isConnected,
  }
}
