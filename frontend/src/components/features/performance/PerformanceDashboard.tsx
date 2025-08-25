import { useState, useEffect } from 'react';

interface SystemMetrics {
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    free: number;
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    free: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
  };
  redis: {
    connected: boolean;
    memory: number;
    keys: number;
    operations: number;
  };
  application: {
    uptime: number;
    requests: number;
    errors: number;
    responseTime: number;
  };
}

interface APIMetrics {
  endpoint: string;
  method: string;
  requests: number;
  errors: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  timestamp: number;
}

interface QueueStats {
  queueName: string;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  avgProcessingTime: number;
  throughput: number;
}

interface PerformanceSummary {
  system: SystemMetrics;
  api: APIMetrics[];
  summary: {
    totalRequests: number;
    errorRate: number;
    avgResponseTime: number;
    uptime: number;
  };
}

export const PerformanceDashboard = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [apiMetrics, setApiMetrics] = useState<APIMetrics[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, queueStatsRes] = await Promise.all([
        fetch(`/api/performance/summary`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch(`/api/performance/queues`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (summaryRes.ok && queueStatsRes.ok) {
        const summaryData = await summaryRes.json();
        const queueData = await queueStatsRes.json();

        setSummary(summaryData.data.summary);
        setSystemMetrics(summaryData.data.summary.system);
        setApiMetrics(summaryData.data.summary.api);
        setQueueStats(queueData.data.queues || []);
      } else {
        throw new Error('Failed to fetch performance data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }): string => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading performance data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-800 font-medium">Error loading performance data</div>
        <div className="text-red-600 text-sm mt-1">{error}</div>
        <button
          onClick={fetchPerformanceData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '1h' | '24h' | '7d')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <button
            onClick={fetchPerformanceData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* System Overview */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CPU Usage */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">CPU Usage</h3>
              <div className={`text-2xl font-bold ${getStatusColor(systemMetrics.cpu.usage, { warning: 70, critical: 90 })}`}>
                {systemMetrics.cpu.usage.toFixed(1)}%
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemMetrics.cpu.usage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Memory Usage</h3>
              <div className={`text-2xl font-bold ${getStatusColor(systemMetrics.memory.usage, { warning: 80, critical: 95 })}`}>
                {systemMetrics.memory.usage.toFixed(1)}%
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {formatBytes(systemMetrics.memory.used)} / {formatBytes(systemMetrics.memory.total)}
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemMetrics.memory.usage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Disk Usage */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Disk Usage</h3>
              <div className={`text-2xl font-bold ${getStatusColor(systemMetrics.disk.usage, { warning: 85, critical: 95 })}`}>
                {systemMetrics.disk.usage.toFixed(1)}%
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {formatBytes(systemMetrics.disk.used)} / {formatBytes(systemMetrics.disk.total)}
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemMetrics.disk.usage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Application Status */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Application</h3>
              <div className="text-2xl font-bold text-green-600">
                {summary?.summary.errorRate && summary.summary.errorRate < 5 ? 'Healthy' : 'Warning'}
              </div>
            </div>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div>Uptime: {summary?.summary.uptime ? formatUptime(summary.summary.uptime) : 'N/A'}</div>
              <div>Requests: {summary?.summary.totalRequests.toLocaleString() || 0}</div>
              <div>Error Rate: {summary?.summary.errorRate?.toFixed(2) || 0}%</div>
            </div>
          </div>
        </div>
      )}

      {/* API Performance */}
      {apiMetrics.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Errors</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Response</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P95</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiMetrics.map((metric, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {metric.endpoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        metric.method === 'GET' ? 'bg-green-100 text-green-800' :
                        metric.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        metric.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {metric.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric.requests.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={metric.errors > 0 ? 'text-red-600' : 'text-green-600'}>
                        {metric.errors}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric.avgResponseTime.toFixed(2)}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric.p95ResponseTime.toFixed(2)}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Queue Statistics */}
      {queueStats.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Queues</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {queueStats.map((queue, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{queue.queueName}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="font-medium">{queue.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing:</span>
                    <span className="font-medium">{queue.processing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="font-medium text-green-600">{queue.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed:</span>
                    <span className="font-medium text-red-600">{queue.failed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Throughput:</span>
                    <span className="font-medium">{queue.throughput}/min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Redis Status */}
      {systemMetrics?.redis && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Redis Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${systemMetrics.redis.connected ? 'text-green-600' : 'text-red-600'}`}>
                {systemMetrics.redis.connected ? 'Connected' : 'Disconnected'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatBytes(systemMetrics.redis.memory)}
              </div>
              <div className="text-sm text-gray-600">Memory Usage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {systemMetrics.redis.keys.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Keys</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {systemMetrics.redis.operations.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Operations</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
