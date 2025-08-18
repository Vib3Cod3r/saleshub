'use client'

import { useState, useCallback } from 'react'
import { useVersionRegistry } from '@/hooks/use-version-registry'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Download, 
  Upload, 
  RefreshCw,
  Database,
  Globe,
  FileText,
  Settings,
  History,
  AlertCircle,
  Clock,
  Hash,
  Tag,
  Link,
  Shield,
  Activity
} from 'lucide-react'

export function VersionRegistryManager() {
  const {
    activePages,
    activeDatabases,
    activeAPIs,
    deprecatedComponents,
    recentSnapshots,
    registryStats,
    startupValidation,
    isValidating,
    createSnapshot,
    validateStartup,
    exportRegistry,
    importRegistry,
    clearRegistry,
    error,
    clearError
  } = useVersionRegistry({ autoValidate: true, validateOnMount: true })

  const [activeTab, setActiveTab] = useState('overview')
  const [snapshotNotes, setSnapshotNotes] = useState('')
  const [importData, setImportData] = useState('')

  const handleCreateSnapshot = useCallback(() => {
    try {
      createSnapshot('development', snapshotNotes)
      setSnapshotNotes('')
    } catch (err) {
      console.error('Failed to create snapshot:', err)
    }
  }, [createSnapshot, snapshotNotes])

  const handleExport = useCallback(() => {
    try {
      const data = exportRegistry()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `version-registry-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export registry:', err)
    }
  }, [exportRegistry])

  const handleImport = useCallback(() => {
    try {
      importRegistry(importData)
      setImportData('')
    } catch (err) {
      console.error('Failed to import registry:', err)
    }
  }, [importRegistry, importData])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'deprecated':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'migrating':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'deprecated':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'migrating':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Version Registry Manager</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive version tracking and state management for multi-page applications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={validateStartup}
            disabled={isValidating}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
            Validate
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 font-medium">Error: {error}</span>
              <Button onClick={clearError} variant="ghost" size="sm">
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Status */}
      {startupValidation && (
        <Card className={startupValidation.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {startupValidation.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Startup Validation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {startupValidation.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2">Errors:</h4>
                <ul className="list-disc list-inside space-y-1 text-red-600">
                  {startupValidation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {startupValidation.warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Warnings:</h4>
                <ul className="list-disc list-inside space-y-1 text-yellow-600">
                  {startupValidation.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            {startupValidation.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1 text-blue-600">
                  {startupValidation.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pages</p>
                <p className="text-2xl font-bold">{registryStats.totalPages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Databases</p>
                <p className="text-2xl font-bold">{registryStats.totalDatabases}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total APIs</p>
                <p className="text-2xl font-bold">{registryStats.totalAPIs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Snapshots</p>
                <p className="text-2xl font-bold">{registryStats.totalSnapshots}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="databases">Databases</TabsTrigger>
          <TabsTrigger value="apis">APIs</TabsTrigger>
          <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Components */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Active Components</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Pages ({activePages.length})</h4>
                  <ScrollArea className="h-32">
                    {activePages.map(page => (
                      <div key={page.id} className="flex items-center justify-between py-1">
                        <span className="text-sm">{page.name}</span>
                        <Badge variant="secondary">{page.version}</Badge>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Databases ({activeDatabases.length})</h4>
                  <ScrollArea className="h-32">
                    {activeDatabases.map(db => (
                      <div key={db.id} className="flex items-center justify-between py-1">
                        <span className="text-sm">{db.name}</span>
                        <Badge variant="secondary">{db.version}</Badge>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">APIs ({activeAPIs.length})</h4>
                  <ScrollArea className="h-32">
                    {activeAPIs.map(api => (
                      <div key={api.id} className="flex items-center justify-between py-1">
                        <span className="text-sm">{api.name}</span>
                        <Badge variant="secondary">{api.version}</Badge>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Deprecated Components */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span>Deprecated Components</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {deprecatedComponents.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No deprecated components</p>
                  ) : (
                    <div className="space-y-2">
                      {deprecatedComponents.map(component => (
                        <div key={component.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{component.name}</p>
                            <p className="text-xs text-gray-600">{component.id}</p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(component.status)}>
                            {component.version}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Versions</CardTitle>
              <CardDescription>Manage page versions and their dependencies</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {activePages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pages registered</p>
                ) : (
                  <div className="space-y-4">
                    {activePages.map(page => (
                      <div key={page.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(page.status)}
                            <h3 className="font-medium">{page.name}</h3>
                            <Badge variant="outline">{page.version}</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Tag className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{page.id}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{page.path}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Modified: {new Date(page.lastModified).toLocaleDateString()}</span>
                          <span>Checksum: {page.checksum.substring(0, 8)}...</span>
                        </div>
                        {page.dependencies.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-600 mb-1">Dependencies:</p>
                            <div className="flex flex-wrap gap-1">
                              {page.dependencies.map(dep => (
                                <Badge key={dep.id} variant="secondary" className="text-xs">
                                  {dep.id}@{dep.version}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Databases Tab */}
        <TabsContent value="databases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Versions</CardTitle>
              <CardDescription>Manage database versions and migration states</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {activeDatabases.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No databases registered</p>
                ) : (
                  <div className="space-y-4">
                    {activeDatabases.map(db => (
                      <div key={db.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(db.status)}
                            <h3 className="font-medium">{db.name}</h3>
                            <Badge variant="outline">{db.version}</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Hash className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{db.schemaHash.substring(0, 8)}...</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                          <span>Migration: {db.migrationVersion}</span>
                          <span>Modified: {new Date(db.lastModified).toLocaleDateString()}</span>
                        </div>
                        {db.migrationHistory.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-600 mb-1">Recent Migrations:</p>
                            <div className="space-y-1">
                              {db.migrationHistory.slice(-3).map(migration => (
                                <div key={migration.id} className="flex items-center justify-between text-xs">
                                  <span>{migration.description}</span>
                                  <Badge 
                                    variant="outline" 
                                    className={migration.status === 'applied' ? 'text-green-600' : 'text-yellow-600'}
                                  >
                                    {migration.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* APIs Tab */}
        <TabsContent value="apis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Versions</CardTitle>
              <CardDescription>Manage API endpoint versions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {activeAPIs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No APIs registered</p>
                ) : (
                  <div className="space-y-4">
                    {activeAPIs.map(api => (
                      <div key={api.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(api.status)}
                            <h3 className="font-medium">{api.name}</h3>
                            <Badge variant="outline">{api.version}</Badge>
                          </div>
                          <Badge variant="secondary">{api.method}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{api.path}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Modified: {new Date(api.lastModified).toLocaleDateString()}</span>
                          <span>Checksum: {api.checksum.substring(0, 8)}...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Snapshots Tab */}
        <TabsContent value="snapshots" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Snapshot */}
            <Card>
              <CardHeader>
                <CardTitle>Create Snapshot</CardTitle>
                <CardDescription>Create a new version snapshot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <textarea
                    value={snapshotNotes}
                    onChange={(e) => setSnapshotNotes(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                    rows={3}
                    placeholder="Add notes about this snapshot..."
                  />
                </div>
                <Button onClick={handleCreateSnapshot} className="w-full">
                  Create Snapshot
                </Button>
              </CardContent>
            </Card>

            {/* Recent Snapshots */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Snapshots</CardTitle>
                <CardDescription>View recent version snapshots</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {recentSnapshots.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No snapshots created</p>
                  ) : (
                    <div className="space-y-2">
                      {recentSnapshots.map(snapshot => (
                        <div key={snapshot.id} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {new Date(snapshot.timestamp).toLocaleString()}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={snapshot.status === 'valid' ? 'text-green-600' : 'text-red-600'}
                            >
                              {snapshot.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">Environment: {snapshot.environment}</p>
                          {snapshot.notes && (
                            <p className="text-xs text-gray-500">{snapshot.notes}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                            <span>{snapshot.pages.length} pages</span>
                            <span>{snapshot.databases.length} databases</span>
                            <span>{snapshot.apis.length} APIs</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Import/Export */}
            <Card>
              <CardHeader>
                <CardTitle>Import/Export</CardTitle>
                <CardDescription>Backup and restore version registry data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Import Registry Data</label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                    rows={4}
                    placeholder="Paste JSON data here..."
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleImport} className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <Button onClick={handleExport} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Registry Management */}
            <Card>
              <CardHeader>
                <CardTitle>Registry Management</CardTitle>
                <CardDescription>Manage registry settings and data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Clear all version registry data. This action cannot be undone.
                  </p>
                  <Button 
                    onClick={clearRegistry} 
                    variant="destructive" 
                    className="w-full"
                  >
                    Clear All Data
                  </Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Registry Statistics
                  </p>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Active Components:</span>
                      <span className="font-medium">{registryStats.activeComponents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deprecated Components:</span>
                      <span className="font-medium">{registryStats.deprecatedComponents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Components:</span>
                      <span className="font-medium">{registryStats.errorComponents}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
