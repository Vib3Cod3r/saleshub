'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  RefreshCw, 
  Download, 
  Trash2, 
  Search, 
  Play,
  Pause
} from 'lucide-react'
import { getStatusIcon, getStatusColors } from '@/lib/utils/status-utils'
import { exportJSON } from '@/lib/utils/export-utils'

export interface LogEntry {
  timestamp: string
  level: string
  message: string
  [key: string]: string | number | boolean | undefined
}

export interface LogViewerProps {
  title: string
  description?: string
  fetchLogs: () => Promise<LogEntry[]>
  clearLogs?: () => Promise<void>
  exportLogs?: (logs: LogEntry[]) => void
  searchFields?: string[]
  filterOptions?: { value: string; label: string }[]
  autoRefreshInterval?: number
  showMetrics?: boolean
  metrics?: {
    total: number
    errors: number
    warnings: number
    info: number
  }
}

export function LogViewerBase({
  title,
  description,
  fetchLogs,
  clearLogs,
  exportLogs,
  searchFields = ['message'],
  filterOptions = [
    { value: 'ALL', label: 'All' },
    { value: 'ERROR', label: 'Error' },
    { value: 'WARN', label: 'Warning' },
    { value: 'INFO', label: 'Info' }
  ],
  autoRefreshInterval = 5000,
  showMetrics = false,
  metrics
}: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('ALL')
  const [autoRefresh, setAutoRefresh] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const fetchedLogs = await fetchLogs()
      setLogs(fetchedLogs)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchLogs])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadLogs, autoRefreshInterval)
      return () => clearInterval(interval)
    }
    return undefined
  }, [autoRefresh, autoRefreshInterval, loadLogs])

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchFields.some(field => 
      String(log[field] || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel
    
    return matchesSearch && matchesLevel
  })

  const handleClearLogs = async () => {
    if (clearLogs) {
      try {
        await clearLogs()
        setLogs([])
      } catch (error) {
        console.error('Failed to clear logs:', error)
      }
    }
  }

  const handleExportLogs = () => {
    if (exportLogs) {
      exportLogs(filteredLogs)
    } else {
      exportJSON(filteredLogs, `${title.toLowerCase()}-logs`)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              {autoRefresh && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
            </CardTitle>
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
          
          {showMetrics && metrics && (
            <div className="flex gap-4">
              <Badge variant="outline">Total: {metrics.total}</Badge>
              <Badge variant="destructive">Errors: {metrics.errors}</Badge>
              <Badge variant="secondary">Warnings: {metrics.warnings}</Badge>
              <Badge variant="default">Info: {metrics.info}</Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Controls */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          {exportLogs && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportLogs}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}

          {clearLogs && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearLogs}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Logs */}
        <ScrollArea className="h-96" ref={scrollRef}>
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div
                key={`log-${log.timestamp}-${log.level}-${log.message.substring(0, 30).replace(/\s+/g, '-')}`}
                className="p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {(() => {
                      const IconComponent = getStatusIcon(log.level)
                      const { color } = getStatusColors(log.level)
                      return <IconComponent className={`h-4 w-4 ${color}`} />
                    })()}
                    <span className="text-sm font-mono text-gray-600">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {log.level}
                    </Badge>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-800 font-mono">
                  {log.message}
                </p>
                {log.error && (
                  <p className="mt-1 text-sm text-red-600 font-mono">
                    Error: {log.error}
                  </p>
                )}
              </div>
            ))}
            
            {filteredLogs.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No logs found
              </div>
            )}
            
            {loading && (
              <div className="text-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                <p className="mt-2 text-gray-500">Loading logs...</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
