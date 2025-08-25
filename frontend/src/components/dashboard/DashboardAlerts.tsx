'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, TrendingUp, TrendingDown, Target, Users, DollarSign, Clock } from 'lucide-react'
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard'

interface DashboardAlert {
  id: string
  type: 'warning' | 'error' | 'success' | 'info'
  title: string
  message: string
  timestamp: string
  priority: 'low' | 'medium' | 'high'
  category: 'performance' | 'goal' | 'trend' | 'system'
}

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  change: number
  target?: number
}

export function DashboardAlerts() {
  const { dashboardAlerts, performanceMetrics, isConnected } = useRealtimeDashboard()
  const [isExpanded, setIsExpanded] = useState(false)
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  // Simulate real-time alerts for development
  const [alerts, setAlerts] = useState<DashboardAlert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Response Time',
      message: 'API response time has increased by 25% in the last 5 minutes',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      priority: 'high',
      category: 'performance'
    },
    {
      id: '2',
      type: 'success',
      title: 'Goal Achieved',
      message: 'Monthly sales target has been reached!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      priority: 'medium',
      category: 'goal'
    },
    {
      id: '3',
      type: 'info',
      title: 'Trend Alert',
      message: 'Contact creation rate is trending upward',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      priority: 'low',
      category: 'trend'
    }
  ])

  // Simulate performance metrics
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'Response Time',
      value: 245,
      unit: 'ms',
      trend: 'up',
      change: 12,
      target: 200
    },
    {
      name: 'Active Users',
      value: 156,
      unit: 'users',
      trend: 'up',
      change: 8
    },
    {
      name: 'Revenue',
      value: 125000,
      unit: '$',
      trend: 'up',
      change: 15,
      target: 100000
    },
    {
      name: 'Conversion Rate',
      value: 3.2,
      unit: '%',
      trend: 'down',
      change: -0.5,
      target: 4.0
    }
  ])

  const getAlertIcon = (type: DashboardAlert['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'success':
        return <Target className="w-4 h-4 text-green-600" />
      case 'info':
        return <TrendingUp className="w-4 h-4 text-blue-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const getAlertColor = (type: DashboardAlert['type']) => {
    switch (type) {
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'error':
        return 'border-l-red-500 bg-red-50'
      case 'success':
        return 'border-l-green-500 bg-green-50'
      case 'info':
        return 'border-l-blue-500 bg-blue-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: DashboardAlert['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'response time':
        return <Clock className="w-4 h-4" />
      case 'active users':
        return <Users className="w-4 h-4" />
      case 'revenue':
        return <DollarSign className="w-4 h-4" />
      case 'conversion rate':
        return <Target className="w-4 h-4" />
      default:
        return <TrendingUp className="w-4 h-4" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const alertTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.priority === filter
  )

  const displayedAlerts = isExpanded ? filteredAlerts : filteredAlerts.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Performance Metrics</span>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <div
                key={metric.name}
                className="p-4 border border-gray-200 rounded-lg bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getMetricIcon(metric.name)}
                    <span className="text-sm font-medium text-gray-600">
                      {metric.name}
                    </span>
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <div className="w-3 h-3 border-t-2 border-gray-400" />
                    )}
                    <span className="text-xs">
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.unit === '$' ? `${metric.unit}${metric.value.toLocaleString()}` : 
                     metric.unit === '%' ? `${metric.value}${metric.unit}` :
                     `${metric.value}${metric.unit}`}
                  </div>
                  {metric.target && (
                    <div className="text-xs text-gray-500 mt-1">
                      Target: {metric.unit === '$' ? `${metric.unit}${metric.target.toLocaleString()}` : 
                              metric.unit === '%' ? `${metric.target}${metric.unit}` :
                              `${metric.target}${metric.unit}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dashboard Alerts</span>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
                  <Button
                    key={priority}
                    variant={filter === priority ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(priority)}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Button>
                ))}
              </div>
              {alerts.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'Show Less' : 'Show More'}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {displayedAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No alerts</p>
              </div>
            ) : (
              displayedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start space-x-3 p-3 border-l-4 ${getAlertColor(alert.type)} rounded-r-lg`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {alert.title}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                            {alert.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTimeAgo(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
