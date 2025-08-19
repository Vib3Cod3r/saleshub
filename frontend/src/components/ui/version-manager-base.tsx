'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Download, 
  Upload, 
  RefreshCw,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { getStatusIcon, getStatusColors } from '@/lib/utils/status-utils'
import { exportJSON } from '@/lib/utils/export-utils'

export interface VersionItem {
  id: string
  name: string
  version: string
  status: string
  lastModified: string
  description?: string
  metadata?: Record<string, string | number | boolean | undefined>
}

export interface VersionManagerProps {
  title: string
  description?: string
  items: VersionItem[]
  onRefresh: () => void
  onCreateSnapshot?: (notes: string) => void
  onExport?: () => void
  onImport?: (data: string) => void

  isLoading?: boolean
  error?: string | null
  tabs?: {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    content: React.ReactNode
  }[]
  showMetrics?: boolean
  metrics?: {
    total: number
    active: number
    deprecated: number
    errors: number
  }
}

export function VersionManagerBase({
  title,
  description,
  items,
  onRefresh,
  onCreateSnapshot,
  onExport,
  onImport,

  isLoading = false,
  error = null,
  tabs = [],
  showMetrics = false,
  metrics
}: VersionManagerProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [snapshotNotes, setSnapshotNotes] = useState('')
  const [importData, setImportData] = useState('')

  const handleCreateSnapshot = useCallback(() => {
    if (onCreateSnapshot) {
      onCreateSnapshot(snapshotNotes)
      setSnapshotNotes('')
    }
  }, [onCreateSnapshot, snapshotNotes])

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport()
    } else {
      exportJSON(items, `${title.toLowerCase()}-export`)
    }
  }, [onExport, items, title])

  const handleImport = useCallback(() => {
    if (onImport) {
      onImport(importData)
      setImportData('')
    }
  }, [onImport, importData])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusCounts = () => {
    const counts = { active: 0, deprecated: 0, errors: 0, total: items.length }
    items.forEach(item => {
      switch (item.status.toLowerCase()) {
        case 'active':
          counts.active++
          break
        case 'deprecated':
          counts.deprecated++
          break
        case 'error':
          counts.errors++
          break
      }
    })
    return counts
  }

  const statusCounts = metrics || getStatusCounts()

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {onCreateSnapshot && (
            <Button onClick={handleCreateSnapshot}>
              <Plus className="h-4 w-4 mr-2" />
              Create Snapshot
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      {showMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
                </div>
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{statusCounts.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Deprecated</p>
                  <p className="text-2xl font-bold text-yellow-600">{statusCounts.deprecated}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-red-600">{statusCounts.errors}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger 
            value="overview" 
            onClick={() => setActiveTab('overview')}
            active={activeTab === 'overview'}
          >
            Overview
          </TabsTrigger>
          {tabs.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              onClick={() => setActiveTab(tab.id)}
              active={activeTab === tab.id}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {activeTab === 'overview' && (
        <TabsContent value="overview" className="space-y-4" active={true}>
          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle>All Items</CardTitle>
              <CardDescription>
                {items.length} items total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {(() => {
                          const IconComponent = getStatusIcon(item.status)
                          const { color } = getStatusColors(item.status)
                          return <IconComponent className={`h-4 w-4 ${color}`} />
                        })()}
                        <div>
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">
                            Version {item.version} • {formatDate(item.lastModified)}
                          </p>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                  ))}
                  
                  {items.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No items found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            {onCreateSnapshot && (
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Create Snapshot</CardTitle>
                  <CardDescription>
                    Create a new snapshot with notes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    value={snapshotNotes}
                    onChange={(e) => setSnapshotNotes(e.target.value)}
                    placeholder="Enter snapshot notes..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <Button onClick={handleCreateSnapshot} disabled={!snapshotNotes.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Snapshot
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Import/Export</CardTitle>
                <CardDescription>
                  Import or export data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button onClick={handleExport} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  
                  {onImport && (
                    <>
                      <textarea
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        placeholder="Paste import data here..."
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                      <Button onClick={handleImport} disabled={!importData.trim()} className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        )}

        {tabs.map(tab => (
          activeTab === tab.id && (
          <TabsContent key={tab.id} value={tab.id} active={true}>
            {tab.content}
          </TabsContent>
          )
        ))}
      </Tabs>
    </div>
  )
}
