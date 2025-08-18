'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Database, 
  Activity, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Download,
  Settings
} from 'lucide-react';

interface DatabaseMetrics {
  totalQueries: number;
  slowQueries: number;
  failedQueries: number;
  totalDuration: string;
  averageDuration: string;
  lastQueryTime: string;
}

interface DatabaseHealth {
  status: string;
  connected: boolean;
  responseTime: string;
  error?: string;
}

interface DatabaseStats {
  connectionPool: {
    maxOpenConnections: number;
    openConnections: number;
    inUse: number;
    idle: number;
    waitCount: number;
    waitDuration: string;
  };
  metrics: {
    totalQueries: number;
    slowQueries: number;
    failedQueries: number;
    totalDuration: string;
    lastQueryTime: string;
  };
  uptime: string;
  timestamp: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  operation?: string;
  table?: string;
  duration?: string;
  tenantId?: string;
  error?: string;
}

export default function DatabaseLogViewer() {
  const [metrics, setMetrics] = useState<DatabaseMetrics | null>(null);
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [autoScroll] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch database metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/database/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  // Fetch database health
  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/database/health');
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      }
    } catch (error) {
      console.error('Failed to fetch health:', error);
    }
  };

  // Fetch database stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/database/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Fetch logs
  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/database/logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchMetrics(),
      fetchHealth(),
      fetchStats(),
      fetchLogs()
    ]);
    setIsLoading(false);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      refreshData();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isLive, refreshData]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-green-500';
      case 'unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.level.toLowerCase().includes(filter.toLowerCase());
  });

  const clearLogs = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const logText = filteredLogs.map(log => 
      `${log.timestamp} [${log.level}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database-logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Database Log Viewer</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="flex items-center space-x-2"
          >
            {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isLive ? 'Pause' : 'Live'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Health and Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Database Health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Database Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {health ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge className={getStatusColor(health.status)}>
                    {health.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-mono">{health.responseTime}</span>
                </div>
                {health.error && (
                  <div className="text-sm text-red-500 mt-2">
                    Error: {health.error}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Loading...</div>
            )}
          </CardContent>
        </Card>

        {/* Query Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Query Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Queries</span>
                  <span className="text-sm font-mono">{metrics.totalQueries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Slow Queries</span>
                  <span className="text-sm font-mono text-yellow-600">{metrics.slowQueries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Failed Queries</span>
                  <span className="text-sm font-mono text-red-600">{metrics.failedQueries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Duration</span>
                  <span className="text-sm font-mono">{metrics.averageDuration}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Loading...</div>
            )}
          </CardContent>
        </Card>

        {/* Connection Pool */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Connection Pool</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Use</span>
                  <span className="text-sm font-mono">{stats.connectionPool.inUse}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Idle</span>
                  <span className="text-sm font-mono">{stats.connectionPool.idle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Max Open</span>
                  <span className="text-sm font-mono">{stats.connectionPool.maxOpenConnections}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Wait Count</span>
                  <span className="text-sm font-mono">{stats.connectionPool.waitCount}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Loading...</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logs Viewer */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Database Logs</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Levels</option>
                <option value="error">Errors</option>
                <option value="warn">Warnings</option>
                <option value="info">Info</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={clearLogs}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadLogs}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96" ref={scrollRef}>
            <div className="space-y-1">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <div key={`log-${log.timestamp}-${log.level}-${log.message?.slice(0, 20)}-${index.toString()}`} className="text-sm font-mono p-2 rounded hover:bg-gray-50">
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-500 min-w-[150px]">{log.timestamp}</span>
                      <span className={`font-semibold min-w-[60px] ${getLogLevelColor(log.level)}`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                    {(log.operation || log.table || log.duration || log.tenantId) && (
                      <div className="ml-[210px] mt-1 text-xs text-gray-600">
                        {log.operation && <span className="mr-2">Op: {log.operation}</span>}
                        {log.table && <span className="mr-2">Table: {log.table}</span>}
                        {log.duration && <span className="mr-2">Duration: {log.duration}</span>}
                        {log.tenantId && <span className="mr-2">Tenant: {log.tenantId}</span>}
                      </div>
                    )}
                    {log.error && (
                      <div className="ml-[210px] mt-1 text-xs text-red-500">
                        Error: {log.error}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No logs available
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
