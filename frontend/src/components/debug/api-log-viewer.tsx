'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RefreshCw, Download, Trash2, Search, Filter } from 'lucide-react'

interface APILogEntry {
  timestamp: string
  level: string
  message: string
  method?: string
  path?: string
  status?: number
  duration?: string
  user?: string
  tenant?: string
  ip?: string
  error?: string
}

export default function APILogViewer() {
  const [logs, setLogs] = useState<APILogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('ALL')
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      // In a real implementation, you would fetch logs from your API
      // For now, we'll simulate some log entries
      const mockLogs: APILogEntry[] = [
        {
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: 'GET /api/crm/contacts | Status: 200 | Duration: 45ms | User: user123 | Tenant: tenant1 | IP: 192.168.1.1',
          method: 'GET',
          path: '/api/crm/contacts',
          status: 200,
          duration: '45ms',
          user: 'user123',
          tenant: 'tenant1',
          ip: '192.168.1.1'
        },
        {
          timestamp: new Date(Date.now() - 5000).toISOString(),
          level: 'ERROR',
          message: 'POST /api/auth/login | Status: 401 | Duration: 12ms | User: unknown | Tenant: unknown | IP: 192.168.1.2 | Error: Invalid credentials',
          method: 'POST',
          path: '/api/auth/login',
          status: 401,
          duration: '12ms',
          user: 'unknown',
          tenant: 'unknown',
          ip: '192.168.1.2',
          error: 'Invalid credentials'
        },
        {
          timestamp: new Date(Date.now() - 10000).toISOString(),
          level: 'WARN',
          message: 'GET /api/crm/companies | Status: 200 | Duration: 5.2s | User: user456 | Tenant: tenant2 | IP: 192.168.1.3 | SLOW_REQUEST',
          method: 'GET',
          path: '/api/crm/companies',
          status: 200,
          duration: '5.2s',
          user: 'user456',
          tenant: 'tenant2',
          ip: '192.168.1.3'
        }
      ]
      setLogs(mockLogs)
    } catch (error) {
      console.error('Failed to fetch API logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.path?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel
    
    return matchesSearch && matchesLevel
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'WARN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'INFO':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    if (status >= 500) return 'bg-red-100 text-red-800'
    if (status >= 400) return 'bg-yellow-100 text-yellow-800'
    if (status >= 300) return 'bg-blue-100 text-blue-800'
    return 'bg-green-100 text-green-800'
  }

  const exportLogs = () => {
    const csvContent = [
      'Timestamp,Level,Method,Path,Status,Duration,User,Tenant,IP,Error',
      ...filteredLogs.map(log => 
        `"${log.timestamp}","${log.level}","${log.method || ''}","${log.path || ''}","${log.status || ''}","${log.duration || ''}","${log.user || ''}","${log.tenant || ''}","${log.ip || ''}","${log.error || ''}"`
      ).join('\n')
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Logs</h1>
          <p className="text-gray-600">Monitor and debug API requests and responses</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={clearLogs}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Log Filters</span>
            <div className="text-sm text-gray-500">
              {filteredLogs.length} of {logs.length} logs
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Levels</option>
                <option value="ERROR">Errors</option>
                <option value="WARN">Warnings</option>
                <option value="INFO">Info</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Log Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {loading ? 'Loading logs...' : 'No logs found'}
                </div>
              ) : (
                filteredLogs.map((log, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getLevelColor(log.level)}>
                          {log.level}
                        </Badge>
                        {log.status && (
                          <Badge className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        )}
                        {log.method && (
                          <Badge variant="outline">
                            {log.method}
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium">{log.path}</div>
                      <div className="text-sm text-gray-600">{log.message}</div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                        {log.duration && (
                          <span>Duration: {log.duration}</span>
                        )}
                        {log.user && (
                          <span>User: {log.user}</span>
                        )}
                        {log.tenant && (
                          <span>Tenant: {log.tenant}</span>
                        )}
                        {log.ip && (
                          <span>IP: {log.ip}</span>
                        )}
                      </div>
                      
                      {log.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          Error: {log.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
