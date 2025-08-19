/**
 * Mistake Log Viewer Component
 */

'use client'

import React, { useState, useMemo } from 'react'
import { useMistakeLogger } from '../../hooks/use-mistake-logger'
import { 
  type MistakeCategory, 
  type MistakeSeverity, 
  type MistakeLog,
  type MistakePattern 
} from '../../lib/mistake-logger'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Separator } from '../ui/separator'
import { ScrollArea } from '../ui/scroll-area'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Filter, 
  Download, 
  Upload, 
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Edit3,
  Plus
} from 'lucide-react'

interface MistakeLogViewerProps {
  className?: string
}

export function MistakeLogViewer({ className }: MistakeLogViewerProps) {
  const {
    getMistakes,
    getUnresolvedMistakes,
    getRepeatingMistakes,
    getRecentMistakes,
    getInsights,
    getPatterns,
    resolveMistake,
    addNote,
    clearMistakes,
    exportMistakes,
    importMistakes
  } = useMistakeLogger()

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCategory, setSelectedCategory] = useState<MistakeCategory | 'all'>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<MistakeSeverity | 'all'>('all')
  const [showResolved, setShowResolved] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity' | 'category' | 'repeatCount'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Get data
  const allMistakes = getMistakes()
  const insights = getInsights()
  const patterns = getPatterns()

  // Filter and sort mistakes
  const filteredMistakes = useMemo(() => {
    let filtered = allMistakes

    // Filter by resolved status
    if (!showResolved) {
      filtered = filtered.filter(mistake => !mistake.resolved)
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(mistake => mistake.category === selectedCategory)
    }

    // Filter by severity
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(mistake => mistake.severity === selectedSeverity)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(mistake => 
        mistake.title.toLowerCase().includes(term) ||
        mistake.description.toLowerCase().includes(term) ||
        mistake.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
          break
        case 'severity':
          const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 }
          aValue = severityWeight[a.severity]
          bValue = severityWeight[b.severity]
          break
        case 'category':
          aValue = a.category
          bValue = b.category
          break
        case 'repeatCount':
          aValue = a.repeatCount
          bValue = b.repeatCount
          break
        default:
          aValue = a.timestamp
          bValue = b.timestamp
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [allMistakes, showResolved, selectedCategory, selectedSeverity, searchTerm, sortBy, sortOrder])

  // Handle mistake resolution
  const handleResolve = (mistakeId: string) => {
    const notes = prompt('Add resolution notes (optional):')
    resolveMistake(mistakeId, 'User', notes || undefined)
  }

  // Handle adding notes
  const handleAddNote = (mistakeId: string) => {
    const note = prompt('Add a note:')
    if (note) {
      addNote(mistakeId, note)
    }
  }

  // Handle export
  const handleExport = () => {
    const data = exportMistakes()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mistakes_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Handle import
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          importMistakes(content)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // Get severity color
  const getSeverityColor = (severity: MistakeSeverity) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
    }
  }

  // Get category color
  const getCategoryColor = (category: MistakeCategory) => {
    const colors = {
      'ui-ux': 'bg-purple-100 text-purple-800',
      'performance': 'bg-blue-100 text-blue-800',
      'security': 'bg-red-100 text-red-800',
      'data-handling': 'bg-green-100 text-green-800',
      'api-integration': 'bg-indigo-100 text-indigo-800',
      'state-management': 'bg-pink-100 text-pink-800',
      'routing': 'bg-gray-100 text-gray-800',
      'authentication': 'bg-yellow-100 text-yellow-800',
      'validation': 'bg-orange-100 text-orange-800',
      'error-handling': 'bg-red-100 text-red-800',
      'code-quality': 'bg-teal-100 text-teal-800',
      'deployment': 'bg-cyan-100 text-cyan-800',
      'testing': 'bg-emerald-100 text-emerald-800',
      'documentation': 'bg-slate-100 text-slate-800',
      'other': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors.other
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mistake Logger</h2>
          <p className="text-gray-600">Track and prevent repeating mistakes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImport} size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              if (confirm('Are you sure you want to clear all mistakes?')) {
                clearMistakes()
              }
            }} 
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Mistakes</p>
                  <p className="text-2xl font-bold">{insights.totalMistakes}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{insights.resolvedMistakes}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Repeating</p>
                  <p className="text-2xl font-bold text-red-600">{insights.repeatMistakes}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-red-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent (24h)</p>
                  <p className="text-2xl font-bold">{getRecentMistakes(24).length}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
          </div>

          {/* Recent Trends */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Trends</h3>
            <div className="space-y-3">
              {insights.recentTrends.map((trend) => (
                <div key={trend.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(trend.category)}>
                      {trend.category}
                    </Badge>
                    {trend.trend === 'increasing' && <TrendingUp className="w-4 h-4 text-red-500" />}
                    {trend.trend === 'decreasing' && <TrendingDown className="w-4 h-4 text-green-500" />}
                    {trend.trend === 'stable' && <Minus className="w-4 h-4 text-gray-500" />}
                  </div>
                  <span className="font-medium">{trend.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Prevention Suggestions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Prevention Suggestions</h3>
            <div className="space-y-2">
              {insights.preventionSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{suggestion}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Mistakes Tab */}
        <TabsContent value="mistakes" className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as MistakeCategory | 'all')}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="all">All Categories</option>
                <option value="ui-ux">UI/UX</option>
                <option value="performance">Performance</option>
                <option value="security">Security</option>
                <option value="data-handling">Data Handling</option>
                <option value="api-integration">API Integration</option>
                <option value="state-management">State Management</option>
                <option value="routing">Routing</option>
                <option value="authentication">Authentication</option>
                <option value="validation">Validation</option>
                <option value="error-handling">Error Handling</option>
                <option value="code-quality">Code Quality</option>
                <option value="deployment">Deployment</option>
                <option value="testing">Testing</option>
                <option value="documentation">Documentation</option>
                <option value="other">Other</option>
              </select>

              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value as MistakeSeverity | 'all')}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showResolved}
                  onChange={(e) => setShowResolved(e.target.checked)}
                />
                Show Resolved
              </label>

              <input
                type="text"
                placeholder="Search mistakes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 border rounded text-sm flex-1 max-w-xs"
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="timestamp">Sort by Time</option>
                <option value="severity">Sort by Severity</option>
                <option value="category">Sort by Category</option>
                <option value="repeatCount">Sort by Repeats</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </Card>

          {/* Mistakes List */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Mistakes ({filteredMistakes.length})
              </h3>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-4">
                {filteredMistakes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No mistakes found matching the current filters.
                  </div>
                ) : (
                  filteredMistakes.map((mistake) => (
                    <div key={mistake.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{mistake.title}</h4>
                            <Badge className={getSeverityColor(mistake.severity)}>
                              {mistake.severity}
                            </Badge>
                            <Badge className={getCategoryColor(mistake.category)}>
                              {mistake.category}
                            </Badge>
                            {mistake.repeatCount > 1 && (
                              <Badge variant="secondary">
                                {mistake.repeatCount} repeats
                              </Badge>
                            )}
                            {mistake.resolved && (
                              <Badge className="bg-green-100 text-green-800">
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{mistake.description}</p>
                          
                          {mistake.context && (
                            <div className="text-xs text-gray-500 space-y-1">
                              {mistake.context.component && (
                                <div>Component: {mistake.context.component}</div>
                              )}
                              {mistake.context.function && (
                                <div>Function: {mistake.context.function}</div>
                              )}
                              {mistake.context.userAction && (
                                <div>Action: {mistake.context.userAction}</div>
                              )}
                            </div>
                          )}

                          {mistake.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {mistake.tags.map((tag) => (
                                <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {mistake.solution && (
                            <div className="mt-2 p-2 bg-blue-50 rounded">
                              <p className="text-xs font-medium text-blue-800">Solution:</p>
                              <p className="text-xs text-blue-700">{mistake.solution}</p>
                            </div>
                          )}

                          {mistake.notes && mistake.notes.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-700 mb-1">Notes:</p>
                              <div className="space-y-1">
                                {mistake.notes.map((note, index) => (
                                  <p key={index} className="text-xs text-gray-600 bg-gray-50 p-1 rounded">
                                    {note}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {!mistake.resolved && (
                            <Button
                              size="sm"
                              onClick={() => handleResolve(mistake.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddNote(mistake.id)}
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Add Note
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Created: {new Date(mistake.timestamp).toLocaleString()}
                        {mistake.repeatCount > 1 && (
                          <span className="ml-4">
                            Last: {new Date(mistake.lastOccurrence).toLocaleString()}
                          </span>
                        )}
                        {mistake.resolved && mistake.resolvedAt && (
                          <span className="ml-4">
                            Resolved: {new Date(mistake.resolvedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Mistake Patterns</h3>
            <div className="space-y-4">
              {patterns.map((pattern) => (
                <div key={pattern.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{pattern.pattern}</h4>
                    <Badge className={getSeverityColor(pattern.severity)}>
                      {pattern.severity}
                    </Badge>
                    <Badge className={getCategoryColor(pattern.category)}>
                      {pattern.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Prevention:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {pattern.prevention.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Examples:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {pattern.examples.map((example, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Analytics & Insights</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Most Common Issues</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <Badge className={getCategoryColor(insights.mostCommonCategory)}>
                      {insights.mostCommonCategory}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Severity:</span>
                    <Badge className={getSeverityColor(insights.mostCommonSeverity)}>
                      {insights.mostCommonSeverity}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Top Repeating Mistakes</h4>
                <div className="space-y-2">
                  {insights.topRepeatingMistakes.slice(0, 3).map((mistake) => (
                    <div key={mistake.id} className="text-sm">
                      <div className="flex justify-between">
                        <span className="truncate">{mistake.title}</span>
                        <Badge variant="secondary">{mistake.repeatCount}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
