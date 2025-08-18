'use client'

import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon, 
  DatabaseIcon,
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { versionTracker } from '@/lib/version-tracker'

interface VersionManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function VersionManager({ isOpen, onClose }: VersionManagerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'databases' | 'snapshots' | 'export'>('overview')
  const [report, setReport] = useState(versionTracker.generateRestartReport())
  const [snapshotNotes, setSnapshotNotes] = useState('')

  useEffect(() => {
    if (isOpen) {
      setReport(versionTracker.generateRestartReport())
    }
  }, [isOpen])

  const refreshReport = () => {
    setReport(versionTracker.generateRestartReport())
  }

  const createSnapshot = () => {
    versionTracker.createSnapshot('development', snapshotNotes)
    setSnapshotNotes('')
    refreshReport()
  }

  const exportData = () => {
    const data = versionTracker.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `version-tracker-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Version Manager</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshReport}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Refresh"
            >
              <ClockIcon className="h-5 w-5" />
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
            { id: 'overview', label: 'Overview', icon: DocumentTextIcon },
            { id: 'pages', label: 'Pages', icon: DocumentTextIcon },
            { id: 'databases', label: 'Databases', icon: DatabaseIcon },
            { id: 'snapshots', label: 'Snapshots', icon: ClockIcon },
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
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DatabaseIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800">Active Databases</p>
                      <p className="text-2xl font-bold text-blue-900">{report.activeDatabases.length}</p>
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

              {/* Last Snapshot */}
              {report.lastSnapshot && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Last Snapshot</h3>
                  <div className="text-sm text-gray-600">
                    <p><strong>Timestamp:</strong> {new Date(report.lastSnapshot.timestamp).toLocaleString()}</p>
                    <p><strong>Environment:</strong> {report.lastSnapshot.environment}</p>
                    {report.lastSnapshot.notes && (
                      <p><strong>Notes:</strong> {report.lastSnapshot.notes}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Page Versions</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Active Pages */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Active Pages</h4>
                  <div className="space-y-2">
                    {report.activePages.map((page) => (
                      <div
                        key={page.id}
                        className="bg-white border border-gray-200 rounded-lg p-4"
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
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{page.name}</h5>
                            <p className="text-sm text-gray-500">{page.path}</p>
                            <p className="text-xs text-gray-400">v{page.version}</p>
                          </div>
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'databases' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Database Versions</h3>
              
              <div className="space-y-2">
                {report.activeDatabases.map((db) => (
                  <div
                    key={db.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">{db.name}</h5>
                        <p className="text-sm text-gray-500">v{db.version}</p>
                        {db.migrationVersion && (
                          <p className="text-xs text-gray-400">Migration: {db.migrationVersion}</p>
                        )}
                        {db.schemaHash && (
                          <p className="text-xs text-gray-400">Schema: {db.schemaHash.substring(0, 8)}...</p>
                        )}
                      </div>
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'snapshots' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Version Snapshots</h3>
                <button
                  onClick={createSnapshot}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Snapshot</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Create New Snapshot</h4>
                  <textarea
                    value={snapshotNotes}
                    onChange={(e) => setSnapshotNotes(e.target.value)}
                    placeholder="Add notes about this snapshot (optional)"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  {versionTracker.getRecentSnapshots(10).reverse().map((snapshot, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">
                            Snapshot {versionTracker.getRecentSnapshots(10).length - index}
                          </h5>
                          <p className="text-sm text-gray-500">
                            {new Date(snapshot.timestamp).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            Environment: {snapshot.environment}
                          </p>
                          {snapshot.notes && (
                            <p className="text-sm text-gray-600 mt-1">{snapshot.notes}</p>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{snapshot.pages.length} pages</p>
                          <p>{snapshot.database.length} databases</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Export & Backup</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-blue-800 mb-2">Export Version Data</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Export all page and database versions as a JSON file for backup or analysis.
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
                  <p><strong>Active Databases:</strong> {report.activeDatabases.length}</p>
                  <p><strong>Deprecated Pages:</strong> {report.deprecatedPages.length}</p>
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

export default VersionManager
