'use client'

import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowPathIcon,
  TrashIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import { pageLogger } from '@/lib/page-logger'

interface PageVersionManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function PageVersionManager({ isOpen, onClose }: PageVersionManagerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'logs' | 'export'>('overview')
  const [report, setReport] = useState(pageLogger.generateRestartReport())
  const [selectedPage, setSelectedPage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setReport(pageLogger.generateRestartReport())
    }
  }, [isOpen])

  const refreshReport = () => {
    setReport(pageLogger.generateRestartReport())
  }

  const exportData = () => {
    const data = pageLogger.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `page-versions-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all page logs? This action cannot be undone.')) {
      pageLogger.clearLogs()
      refreshReport()
    }
  }

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all page versions and logs? This action cannot be undone.')) {
      pageLogger.clearAll()
      refreshReport()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Page Version Manager</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshReport}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Refresh"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'pages', label: 'Pages', icon: DocumentTextIcon },
            { id: 'logs', label: 'Logs', icon: ClockIcon },
            { id: 'export', label: 'Export', icon: DocumentArrowDownIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">Active Pages</p>
                      <p className="text-2xl font-bold text-green-900">{report.activePages.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-800">Deprecated Pages</p>
                      <p className="text-2xl font-bold text-yellow-900">{report.deprecatedPages.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ClockIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800">Recent Activity</p>
                      <p className="text-2xl font-bold text-blue-900">{report.recentActivity.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">Issues</p>
                      <p className="text-2xl font-bold text-red-900">{report.recommendations.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {report.recommendations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-yellow-800 mb-3">Restart Recommendations</h3>
                  <ul className="space-y-2">
                    {report.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-yellow-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {report.recentActivity.length === 0 ? (
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  ) : (
                    <div className="space-y-2">
                      {report.recentActivity.slice(-10).reverse().map((log, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              log.action === 'error' ? 'bg-red-100 text-red-800' :
                              log.action === 'load' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {log.action}
                            </span>
                            <span className="font-medium">{log.pageName}</span>
                            <span className="text-gray-500">v{log.version}</span>
                          </div>
                          <span className="text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Page Versions</h3>
                <button
                  onClick={clearAll}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Active Pages */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Active Pages</h4>
                  <div className="space-y-2">
                    {report.activePages.map((page) => (
                      <div
                        key={page.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300"
                        onClick={() => setSelectedPage(page.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{page.name}</h5>
                            <p className="text-sm text-gray-500">{page.path}</p>
                            <p className="text-xs text-gray-400">v{page.version}</p>
                          </div>
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        </div>
                        {page.features.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {page.features.slice(0, 3).map((feature, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                              >
                                {feature}
                              </span>
                            ))}
                            {page.features.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{page.features.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deprecated Pages */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Deprecated Pages</h4>
                  <div className="space-y-2">
                    {report.deprecatedPages.map((page) => (
                      <div
                        key={page.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-yellow-300"
                        onClick={() => setSelectedPage(page.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{page.name}</h5>
                            <p className="text-sm text-gray-500">{page.path}</p>
                            <p className="text-xs text-gray-400">v{page.version}</p>
                          </div>
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                        {page.metadata.deprecationReason && (
                          <p className="text-xs text-yellow-600 mt-1">
                            {page.metadata.deprecationReason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Page Logs</h3>
                <button
                  onClick={clearLogs}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Clear Logs</span>
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {pageLogger.getRecentLogs(100).length === 0 ? (
                  <p className="text-gray-500 text-sm">No logs available</p>
                ) : (
                  <div className="space-y-2">
                    {pageLogger.getRecentLogs(100).reverse().map((log, index) => (
                      <div key={index} className="bg-white rounded p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              log.action === 'error' ? 'bg-red-100 text-red-800' :
                              log.action === 'load' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {log.action}
                            </span>
                            <span className="font-medium">{log.pageName}</span>
                            <span className="text-gray-500">v{log.version}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Path: {log.pagePath}</p>
                          {log.performance && (
                            <p>Load: {log.performance.loadTime}ms, Render: {log.performance.renderTime}ms</p>
                          )}
                          {log.errors?.length && (
                            <p className="text-red-600">Errors: {log.errors.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Export & Backup</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-blue-800 mb-2">Export Page Data</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Export all page versions and logs as a JSON file for backup or analysis.
                </p>
                <button
                  onClick={exportData}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  <span>Export Data</span>
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-yellow-800 mb-2">Restart Report</h4>
                <p className="text-sm text-yellow-700 mb-4">
                  Generate a comprehensive report for restart planning.
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Active Pages:</strong> {report.activePages.length}</p>
                  <p><strong>Deprecated Pages:</strong> {report.deprecatedPages.length}</p>
                  <p><strong>Recent Activity:</strong> {report.recentActivity.length} entries</p>
                  <p><strong>Issues Found:</strong> {report.recommendations.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PageVersionManager
