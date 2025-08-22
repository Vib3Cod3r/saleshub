'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  errorLogger, 
  getStartupHealthChecks, 
  getBuildInfo, 
  getErrorPreventionRules,
  getHandlerAnalytics,
  clearLogs,
  exportLogs 
} from '@/lib/error-logger'
import type { ErrorLog, StartupHealthCheck, ErrorPreventionRule, HandlerAnalytics } from '@/lib/error-logger'

export default function ErrorLogViewer() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [healthChecks, setHealthChecks] = useState<StartupHealthCheck[]>([])
  const [buildInfo, setBuildInfo] = useState<{ buildId: string; sessionId: string } | null>(null)
  const [preventionRules, setPreventionRules] = useState<ErrorPreventionRule[]>([])
  const [handlerAnalytics, setHandlerAnalytics] = useState<HandlerAnalytics | null>(null)
  const [activeTab, setActiveTab] = useState('logs')

  useEffect(() => {
    const updateData = () => {
      setLogs(errorLogger.getLogs())
      setHealthChecks(getStartupHealthChecks())
      setBuildInfo(getBuildInfo())
      setPreventionRules(getErrorPreventionRules())
      setHandlerAnalytics(getHandlerAnalytics())
    }

    updateData()
    const interval = setInterval(updateData, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'internal_server': return 'bg-red-100 text-red-800'
      case 'startup': return 'bg-purple-100 text-purple-800'
      case 'health_check': return 'bg-green-100 text-green-800'
      case 'network': return 'bg-blue-100 text-blue-800'
      case 'auth': return 'bg-orange-100 text-orange-800'
      case 'react': return 'bg-cyan-100 text-cyan-800'
      case 'nextjs': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'degraded': return 'bg-yellow-100 text-yellow-800'
      case 'unhealthy': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleClearLogs = () => {
    clearLogs()
    setLogs([])
  }

  const handleExportLogs = () => {
    const data = exportLogs()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getErrorPatterns = () => {
    const patterns: Record<string, number> = {}
    logs.forEach(log => {
      const key = log.message
      patterns[key] = (patterns[key] || 0) + 1
    })
    return Object.entries(patterns)
      .filter(([, count]) => count > 1)
      .sort(([, a], [, b]) => b - a)
  }

  const getRecentErrors = (count = 10) => {
    return logs.slice(-count).reverse()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Error Log Viewer</h2>
        <div className="space-x-2">
          <Button onClick={handleClearLogs} variant="outline" size="sm">
            Clear Logs
          </Button>
          <Button onClick={handleExportLogs} variant="outline" size="sm">
            Export Logs
          </Button>
        </div>
      </div>

      {buildInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Build Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Build ID:</span> {buildInfo.buildId}
              </div>
              <div>
                <span className="font-semibold">Session ID:</span> {buildInfo.sessionId}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="logs">Error Logs</TabsTrigger>
          <TabsTrigger value="patterns">Error Patterns</TabsTrigger>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="prevention">Prevention Rules</TabsTrigger>
          <TabsTrigger value="handlers">Handler Health</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Error Logs ({logs.length} total)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {getRecentErrors(50).map((log, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <Badge className={getTypeColor(log.type)}>
                            {log.type}
                          </Badge>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                          {log.recurring && (
                            <Badge className="bg-orange-100 text-orange-800">
                              Recurring ({log.occurrenceCount})
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <div className="font-medium">{log.message}</div>
                      {log.details && (
                        <div className="text-sm text-gray-600">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                        </div>
                      )}
                      {log.stack && (
                        <details className="text-sm text-gray-500">
                          <summary>Stack Trace</summary>
                          <pre className="whitespace-pre-wrap mt-2">{log.stack}</pre>
                        </details>
                      )}
                      <div className="text-xs text-gray-400">
                        URL: {log.url} | Build: {log.buildId} | Session: {log.sessionId}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Error Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {getErrorPatterns().map(([message, count], index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium">{message}</div>
                          <div className="text-sm text-gray-500">
                            Occurred {count} times
                          </div>
                        </div>
                        <Badge className="bg-red-100 text-red-800">
                          {count} occurrences
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Startup Health Checks ({healthChecks.length} total)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {healthChecks.slice().reverse().map((check, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Badge className={getHealthStatusColor(check.overallStatus)}>
                            {check.overallStatus}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Build: {check.buildId}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(check.timestamp)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Database:</span>
                          <Badge className={check.checks.database ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {check.checks.database ? 'Healthy' : 'Failed'}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-semibold">API:</span>
                          <Badge className={check.checks.api ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {check.checks.api ? 'Healthy' : 'Failed'}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-semibold">Auth:</span>
                          <Badge className={check.checks.auth ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {check.checks.auth ? 'Healthy' : 'Failed'}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-semibold">Frontend:</span>
                          <Badge className={check.checks.frontend ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {check.checks.frontend ? 'Healthy' : 'Failed'}
                          </Badge>
                        </div>
                      </div>

                      {check.errors.length > 0 && (
                        <div>
                          <div className="font-semibold text-red-600">Errors:</div>
                          <ul className="text-sm text-red-600 list-disc list-inside">
                            {check.errors.map((error, errorIndex) => (
                              <li key={errorIndex}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {check.warnings.length > 0 && (
                        <div>
                          <div className="font-semibold text-yellow-600">Warnings:</div>
                          <ul className="text-sm text-yellow-600 list-disc list-inside">
                            {check.warnings.map((warning, warningIndex) => (
                              <li key={warningIndex}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prevention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Error Prevention Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preventionRules.map((rule, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{rule.description}</div>
                        <div className="text-sm text-gray-500">Pattern: {rule.pattern}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(rule.severity)}>
                          {rule.severity}
                        </Badge>
                        <Badge className={rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Action: {rule.action} | Max: {rule.maxOccurrences} | Window: {rule.timeWindow}min
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="handlers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Handler Health Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {handlerAnalytics ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{handlerAnalytics.totalHandlers}</div>
                      <div className="text-sm text-gray-500">Total Handlers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{handlerAnalytics.totalCalls}</div>
                      <div className="text-sm text-gray-500">Total Calls</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{handlerAnalytics.successRate.toFixed(1)}%</div>
                      <div className="text-sm text-gray-500">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{handlerAnalytics.avgResponseTime.toFixed(0)}ms</div>
                      <div className="text-sm text-gray-500">Avg Response</div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Unhealthy Handlers ({handlerAnalytics.unhealthyHandlers.length})</h4>
                    {handlerAnalytics.unhealthyHandlers.length > 0 ? (
                      <div className="space-y-2">
                        {handlerAnalytics.unhealthyHandlers.map((handler, index) => (
                          <Badge key={index} className="bg-red-100 text-red-800 mr-2">
                            {handler}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No unhealthy handlers</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Degraded Handlers ({handlerAnalytics.degradedHandlers.length})</h4>
                    {handlerAnalytics.degradedHandlers.length > 0 ? (
                      <div className="space-y-2">
                        {handlerAnalytics.degradedHandlers.map((handler, index) => (
                          <Badge key={index} className="bg-yellow-100 text-yellow-800 mr-2">
                            {handler}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No degraded handlers</p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Handler Details</h4>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {Object.entries(handlerAnalytics.handlerBreakdown).map(([name, handler]) => (
                          <div key={name} className="border rounded p-3 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{name}</span>
                              <Badge className={getHealthStatusColor(handler.healthStatus)}>
                                {handler.healthStatus}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              Calls: {handler.totalCalls} | Success: {handler.totalCalls - handler.errorCount} | 
                              Avg Time: {handler.avgResponseTime.toFixed(0)}ms | 
                              Last: {formatTimestamp(handler.lastCalled)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No handler analytics available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
