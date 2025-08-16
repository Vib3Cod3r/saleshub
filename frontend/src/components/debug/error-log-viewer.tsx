'use client'

import { useState, useEffect } from 'react'
import { errorLogger } from '@/lib/error-logger'

interface ErrorLog {
  timestamp: string
  type: 'console' | 'network' | 'auth' | 'react' | 'nextjs'
  message: string
  stack?: string
  details?: any
  url?: string
  userAgent?: string
}

export function ErrorLogViewer() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const updateLogs = () => {
      setLogs(errorLogger.getLogs())
    }

    // Update logs every second
    const interval = setInterval(updateLogs, 1000)
    updateLogs() // Initial load

    return () => clearInterval(interval)
  }, [])

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.type === filter
  )

  const clearLogs = () => {
    errorLogger.clearLogs()
    setLogs([])
  }

  const exportLogs = () => {
    const dataStr = errorLogger.exportLogs()
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
        title="Error Logs"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        {logs.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {logs.length}
          </span>
        )}
      </button>

      {/* Log Viewer Panel */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 w-96 h-96 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Error Logs ({logs.length})</h3>
            <div className="flex space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="console">Console</option>
                <option value="network">Network</option>
                <option value="auth">Auth</option>
                <option value="react">React</option>
                <option value="nextjs">Next.js</option>
              </select>
              <button
                onClick={exportLogs}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              >
                Export
              </button>
              <button
                onClick={clearLogs}
                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="h-full overflow-y-auto p-4 space-y-3">
            {filteredLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No logs to display</p>
            ) : (
              filteredLogs.map((log, index) => (
                <div key={index} className="border border-gray-200 rounded p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      log.type === 'auth' ? 'bg-blue-100 text-blue-800' :
                      log.type === 'network' ? 'bg-yellow-100 text-yellow-800' :
                      log.type === 'console' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{log.message}</p>
                  {log.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                        Details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                  {log.stack && (
                    <details className="text-xs mt-2">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {log.stack}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
