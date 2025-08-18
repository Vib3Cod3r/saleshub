'use client'

import { useState } from 'react'
import { 
  logConsole, 
  logNetwork, 
  logAuth, 
  logReact, 
  logNextJS,
  trackHandlerUsage,
  getHandlerUsage,
  getHandlerAnalytics,
  clearHandlerUsage,
  exportHandlerUsage
} from '@/lib/error-logger'

export default function ErrorLoggerDemo() {
  const [handlerAnalytics, setHandlerAnalytics] = useState<any>(null)
  const [handlerUsage, setHandlerUsage] = useState<any>(null)

  const testErrorLogging = () => {
    // Test different error types with handler tracking
    const startTime = performance.now()
    
    logConsole('Test console error', { test: true })
    logNetwork('Test network error', { status: 500 })
    logAuth('Test auth error', { code: 'UNAUTHORIZED' })
    logReact('Test React error', { component: 'Demo' })
    logNextJS('Test Next.js error', { page: '/demo' })
    
    const responseTime = performance.now() - startTime
    trackHandlerUsage('test-error-logging', true, responseTime)
  }

  const testHandlerTracking = () => {
    // Simulate different handlers with varying performance
    const handlers = [
      'api-user-fetch',
      'api-posts-fetch', 
      'auth-login',
      'file-upload',
      'data-processing'
    ]

    handlers.forEach((handler) => {
      const responseTime = Math.random() * 100 + 10 // 10-110ms
      const success = Math.random() > 0.1 // 90% success rate
      const errorCount = success ? 0 : 1
      
      trackHandlerUsage(handler, success, responseTime, errorCount)
    })
  }

  const viewAnalytics = () => {
    const analytics = getHandlerAnalytics()
    setHandlerAnalytics(analytics)
  }

  const viewHandlerUsage = () => {
    const usage = getHandlerUsage()
    setHandlerUsage(usage)
  }

  const clearData = () => {
    clearHandlerUsage()
    setHandlerAnalytics(null)
    setHandlerUsage(null)
  }

  const exportData = () => {
    const data = exportHandlerUsage()
    console.log('Exported handler usage data:', data)
    
    // Create downloadable file
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'handler-usage-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Error Logger with Handler Tracking Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Functions</h2>
          
          <button
            onClick={testErrorLogging}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Error Logging
          </button>
          
          <button
            onClick={testHandlerTracking}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Handler Tracking
          </button>
          
          <button
            onClick={viewAnalytics}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            View Analytics
          </button>
          
          <button
            onClick={viewHandlerUsage}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            View Handler Usage
          </button>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Data Management</h2>
          
          <button
            onClick={clearData}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All Data
          </button>
          
          <button
            onClick={exportData}
            className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Export Handler Data
          </button>
        </div>
      </div>

      {handlerAnalytics && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Handler Analytics</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(handlerAnalytics, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {handlerUsage && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Handler Usage Details</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(handlerUsage, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">How to Use Handler Tracking</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Use <code>trackHandlerUsage(handlerName, success, responseTime, errorCount)</code> to track handler performance</li>
          <li>• Call <code>getHandlerAnalytics()</code> to get comprehensive analytics</li>
          <li>• Use <code>getHandlerUsage(handlerName)</code> to get specific handler stats</li>
          <li>• Export/import data with <code>exportHandlerUsage()</code> and <code>importHandlerUsage(data)</code></li>
        </ul>
      </div>
    </div>
  )
}
