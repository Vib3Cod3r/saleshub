'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'
import { 
  Activity, 
  Clock, 
  HardDrive, 
  Wifi, 
  Monitor, 
  MousePointer, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle
} from 'lucide-react'

export function PerformanceDashboard() {
  const [showDetails, setShowDetails] = useState(false)
  
  const thresholds = {
    pageLoadTime: 2000, // 2 seconds
    renderTime: 50, // 50ms
    memoryUsage: 100 * 1024 * 1024, // 100MB
    networkLatency: 500, // 500ms
    frameRate: 60, // 60 FPS
    interactionDelay: 50, // 50ms
  }

  const {
    metrics,
    alerts,
    isMonitoring,
    clearAlerts,
    getPerformanceScore,
  } = usePerformanceMonitor(thresholds)

  const performanceScore = getPerformanceScore()

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'pageLoadTime':
        return <Clock className="w-4 h-4" />
      case 'renderTime':
        return <Activity className="w-4 h-4" />
      case 'memoryUsage':
        return <HardDrive className="w-4 h-4" />
      case 'networkLatency':
        return <Wifi className="w-4 h-4" />
      case 'frameRate':
        return <Monitor className="w-4 h-4" />
      case 'interactionDelay':
        return <MousePointer className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getMetricColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMetricStatus = (score: number) => {
    if (score >= 90) return { icon: <CheckCircle className="w-4 h-4 text-green-600" />, text: 'Excellent' }
    if (score >= 70) return { icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />, text: 'Good' }
    return { icon: <XCircle className="w-4 h-4 text-red-600" />, text: 'Poor' }
  }

  const formatMetricValue = (metric: string, value: number) => {
    switch (metric) {
      case 'pageLoadTime':
        return `${(value / 1000).toFixed(2)}s`
      case 'renderTime':
        return `${value.toFixed(1)}ms`
      case 'memoryUsage':
        return `${(value / 1024 / 1024).toFixed(1)}MB`
      case 'networkLatency':
        return `${value.toFixed(0)}ms`
      case 'frameRate':
        return `${value.toFixed(0)} FPS`
      case 'interactionDelay':
        return `${value.toFixed(1)}ms`
      default:
        return value.toString()
    }
  }

  const getMetricTrend = (metric: string, value: number) => {
    // Simulate trend data - in real app, this would come from historical data
    const trends = {
      pageLoadTime: value < 1500 ? 'down' : 'up',
      renderTime: value < 30 ? 'down' : 'up',
      memoryUsage: value < 50 * 1024 * 1024 ? 'down' : 'up',
      networkLatency: value < 300 ? 'down' : 'up',
      frameRate: value > 55 ? 'up' : 'down',
      interactionDelay: value < 30 ? 'down' : 'up',
    }
    return trends[metric as keyof typeof trends] || 'stable'
  }

  return (
    <div className="space-y-6">
      {/* Performance Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Performance Overview</span>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                performanceScore >= 90 ? 'bg-green-100 text-green-800' :
                performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {isMonitoring ? 'Live' : 'Offline'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getMetricColor(performanceScore)}`}>
                {performanceScore}
              </div>
              <div className="text-sm text-gray-500 mt-1">Overall Score</div>
              <div className="flex items-center justify-center mt-2">
                {getMetricStatus(performanceScore).icon}
                <span className="ml-1 text-sm text-gray-600">
                  {getMetricStatus(performanceScore).text}
                </span>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${alerts.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {alerts.length}
              </div>
              <div className="text-sm text-gray-500 mt-1">Active Alerts</div>
              {alerts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAlerts}
                  className="mt-2"
                >
                  Clear Alerts
                </Button>
              )}
            </div>

            {/* Monitoring Status */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${isMonitoring ? 'text-green-600' : 'text-red-600'}`}>
                {isMonitoring ? 'ON' : 'OFF'}
              </div>
              <div className="text-sm text-gray-500 mt-1">Monitoring</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(metrics).map(([metric, value]) => {
                if (typeof value !== 'number') return null
                const score = value < (thresholds as any)[metric] ? 90 : 60
                const status = getMetricStatus(score)
                const trend = getMetricTrend(metric, value)
                
                return (
                  <div
                    key={metric}
                    className="p-4 border border-gray-200 rounded-lg bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getMetricIcon(metric)}
                        <span className="text-sm font-medium text-gray-600">
                          {metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {trend === 'up' ? (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        ) : trend === 'down' ? (
                          <TrendingDown className="w-3 h-3 text-red-600" />
                        ) : (
                          <div className="w-3 h-3 border-t-2 border-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className={`text-2xl font-bold ${getMetricColor(score)}`}>
                        {formatMetricValue(metric, value)}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          Score: {score.toFixed(0)}
                        </span>
                        {status.icon}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Performance Alerts</span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAlerts}
              >
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.timestamp.getTime()}
                  className={`flex items-start space-x-3 p-3 border-l-4 rounded-r-lg ${
                    alert.type === 'error' ? 'border-l-red-500 bg-red-50' :
                    alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                    'border-l-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {alert.type === 'error' ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : alert.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <Activity className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {alert.metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        alert.type === 'error' ? 'bg-red-100 text-red-800' :
                        alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
