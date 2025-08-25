'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAnalytics } from '@/hooks/useAnalytics'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  DollarSign, 
  Target,
  BarChart3,
  Activity,
  Download,
  Eye,
  MousePointer,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

export function AdvancedAnalyticsDashboard() {
  const {
    events,
    businessMetrics,
    userBehaviorMetrics,
    performanceMetrics,
    isTracking,
    getAnalyticsSummary,
    exportAnalytics,
  } = useAnalytics()

  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [selectedView, setSelectedView] = useState<'overview' | 'business' | 'user' | 'performance'>('overview')

  const analyticsSummary = getAnalyticsSummary()

  // Simulate business metrics for development
  const [simulatedBusinessMetrics] = useState({
    totalContacts: 1247,
    totalCompanies: 89,
    totalDeals: 156,
    totalRevenue: 2840000,
    conversionRate: 12.5,
    averageDealSize: 18205,
    salesCycleLength: 45,
    customerLifetimeValue: 45000,
    churnRate: 3.2,
    growthRate: 18.7,
  })

  // Simulate user behavior metrics
  const [simulatedUserBehavior] = useState({
    pageViews: 2847,
    uniqueVisitors: 1247,
    sessionDuration: 1240,
    bounceRate: 23.4,
    conversionFunnel: {
      awareness: 100,
      consideration: 67,
      decision: 23,
      retention: 18,
    },
    topPages: [
      { page: '/dashboard', views: 847, timeOnPage: 180 },
      { page: '/contacts', views: 623, timeOnPage: 240 },
      { page: '/companies', views: 445, timeOnPage: 195 },
      { page: '/deals', views: 389, timeOnPage: 320 },
      { page: '/reports', views: 234, timeOnPage: 420 },
    ],
    userJourney: [
      { step: 'Landing', users: 100, dropoff: 0 },
      { step: 'Browse', users: 85, dropoff: 15 },
      { step: 'Search', users: 67, dropoff: 18 },
      { step: 'View Details', users: 45, dropoff: 22 },
      { step: 'Contact', users: 23, dropoff: 22 },
      { step: 'Convert', users: 18, dropoff: 5 },
    ],
  })

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'totalContacts':
        return <Users className="w-4 h-4" />
      case 'totalCompanies':
        return <Building2 className="w-4 h-4" />
      case 'totalDeals':
        return <Target className="w-4 h-4" />
      case 'totalRevenue':
        return <DollarSign className="w-4 h-4" />
      case 'conversionRate':
        return <TrendingUp className="w-4 h-4" />
      case 'averageDealSize':
        return <DollarSign className="w-4 h-4" />
      case 'salesCycleLength':
        return <Clock className="w-4 h-4" />
      case 'customerLifetimeValue':
        return <DollarSign className="w-4 h-4" />
      case 'churnRate':
        return <TrendingDown className="w-4 h-4" />
      case 'growthRate':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <BarChart3 className="w-4 h-4" />
    }
  }

  const getMetricColor = (metric: string, value: number) => {
    const isPositive = ['totalContacts', 'totalCompanies', 'totalDeals', 'totalRevenue', 'conversionRate', 'averageDealSize', 'customerLifetimeValue', 'growthRate'].includes(metric)
    const isNegative = ['churnRate', 'salesCycleLength'].includes(metric)
    
    if (isPositive && value > 0) return 'text-green-600'
    if (isNegative && value < 0) return 'text-green-600'
    if (isPositive && value < 0) return 'text-red-600'
    if (isNegative && value > 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatMetricValue = (metric: string, value: number) => {
    switch (metric) {
      case 'totalRevenue':
      case 'averageDealSize':
      case 'customerLifetimeValue':
        return `$${(value / 1000).toFixed(1)}K`
      case 'conversionRate':
      case 'churnRate':
      case 'growthRate':
        return `${value.toFixed(1)}%`
      case 'salesCycleLength':
        return `${value} days`
      default:
        return value.toLocaleString()
    }
  }

  const getFunnelColor = (stage: string) => {
    switch (stage) {
      case 'awareness':
        return 'bg-blue-500'
      case 'consideration':
        return 'bg-yellow-500'
      case 'decision':
        return 'bg-orange-500'
      case 'retention':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
  ]

  const views = [
    { value: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'business', label: 'Business', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'user', label: 'User Behavior', icon: <Users className="w-4 h-4" /> },
    { value: 'performance', label: 'Performance', icon: <Activity className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your CRM performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isTracking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
          </span>
          <Button
            variant="outline"
            onClick={() => exportAnalytics('json')}
            leftIcon={<Download />}
          >
            Export Data
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {timeRanges.map((range) => (
                <Button
                  key={range.value}
                  variant={selectedTimeRange === range.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeRange(range.value as any)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
            <div className="flex space-x-1">
              {views.map((view) => (
                <Button
                  key={view.value}
                  variant={selectedView === view.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedView(view.value as any)}
                  leftIcon={view.icon}
                >
                  {view.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Dashboard */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Total Events</span>
                <Activity className="w-4 h-4 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {analyticsSummary.totalEvents}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {analyticsSummary.uniqueUsers} unique users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Session Duration</span>
                <Clock className="w-4 h-4 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {Math.round(analyticsSummary.sessionDuration / 1000 / 60)}m
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Average session length
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Top Action</span>
                <MousePointer className="w-4 h-4 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-gray-900">
                {analyticsSummary.topActions[0]?.action || 'No data'}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {analyticsSummary.topActions[0]?.count || 0} times
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Event Types</span>
                <BarChart3 className="w-4 h-4 text-orange-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {Object.keys(analyticsSummary.eventTypes).length}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Different event categories
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Business Metrics Dashboard */}
      {selectedView === 'business' && (
        <div className="space-y-6">
          {/* Key Business Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(simulatedBusinessMetrics).map(([metric, value]) => (
              <Card key={metric}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getMetricIcon(metric)}
                      <span className="text-sm font-medium text-gray-600">
                        {metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold mt-2 ${getMetricColor(metric, value)}`}>
                    {formatMetricValue(metric, value)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(simulatedUserBehavior.conversionFunnel).map(([stage, value]) => (
                  <div key={stage} className="flex items-center space-x-4">
                    <div className="w-24 text-sm font-medium text-gray-600">
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className={`h-4 rounded-full ${getFunnelColor(stage)}`} style={{ width: `${value}%` }}></div>
                        <span className="text-sm font-medium">{value}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Behavior Dashboard */}
      {selectedView === 'user' && (
        <div className="space-y-6">
          {/* User Behavior Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Page Views</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {simulatedUserBehavior.pageViews.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Unique Visitors</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {simulatedUserBehavior.uniqueVisitors.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Session Duration</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {Math.round(simulatedUserBehavior.sessionDuration / 60)}m
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">Bounce Rate</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {simulatedUserBehavior.bounceRate}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {simulatedUserBehavior.topPages.map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{page.page}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{page.views} views</span>
                      <span className="text-sm text-gray-600">{page.timeOnPage}s avg</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Journey */}
          <Card>
            <CardHeader>
              <CardTitle>User Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {simulatedUserBehavior.userJourney.map((step, index) => (
                  <div key={step.step} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{step.step}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{step.users} users</span>
                      <span className="text-sm text-red-600">{step.dropoff} dropoff</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Dashboard */}
      {selectedView === 'performance' && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Page Load Time</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  1.2s
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">API Response</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  245ms
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">Error Rate</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  0.2%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">User Satisfaction</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  4.8/5
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Device Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Device Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Desktop</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">95%</div>
                  <div className="text-sm text-gray-600">Mobile</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">97%</div>
                  <div className="text-sm text-gray-600">Tablet</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
