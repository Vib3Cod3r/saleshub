'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, Filter, Calendar, Save, Loader2 } from 'lucide-react'
import type { ContactFilters, CompanyFilters } from '@/types/crm'

interface AdvancedFiltersProps {
  type: 'contacts' | 'companies'
  filters: ContactFilters | CompanyFilters
  onFiltersChange: (filters: ContactFilters | CompanyFilters) => void
  onSaveFilter?: (name: string, filters: ContactFilters | CompanyFilters) => void
  savedFilters?: Array<{ name: string; filters: ContactFilters | CompanyFilters }>
  onLoadFilter?: (filters: ContactFilters | CompanyFilters) => void
}

export function AdvancedFilters({
  type,
  filters,
  onFiltersChange,
  onSaveFilter,
  savedFilters = [],
  onLoadFilter
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filterName, setFilterName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const saveFilter = () => {
    if (filterName.trim() && onSaveFilter) {
      onSaveFilter(filterName.trim(), filters)
      setFilterName('')
      setShowSaveDialog(false)
    }
  }

  const loadFilter = (savedFilter: ContactFilters | CompanyFilters) => {
    if (onLoadFilter) {
      onLoadFilter(savedFilter)
    }
  }

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof typeof filters] !== undefined && 
    filters[key as keyof typeof filters] !== ''
  )

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          leftIcon={<Filter />}
          onClick={() => setIsOpen(!isOpen)}
          className={hasActiveFilters ? 'border-primary-500 text-primary-700' : ''}
        >
          Advanced Filters
          {hasActiveFilters && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
              {Object.keys(filters).filter(key => 
                filters[key as keyof typeof filters] !== undefined && 
                filters[key as keyof typeof filters] !== ''
              ).length}
            </span>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            leftIcon={<X />}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filter Options</span>
              <div className="flex items-center space-x-2">
                {onSaveFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveDialog(true)}
                    leftIcon={<Save />}
                  >
                    Save Filter
                  </Button>
                )}
                {savedFilters.length > 0 && (
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Loader2 />}
                    >
                      Load Filter
                    </Button>
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {savedFilters.map((savedFilter, index) => (
                        <button
                          key={index}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => loadFilter(savedFilter.filters)}
                        >
                          {savedFilter.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {type === 'contacts' ? (
                  <>
                    <Button
                      variant={filters.status === 'active' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('status', filters.status === 'active' ? undefined : 'active')}
                    >
                      Active
                    </Button>
                    <Button
                      variant={filters.status === 'inactive' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('status', filters.status === 'inactive' ? undefined : 'inactive')}
                    >
                      Inactive
                    </Button>
                    <Button
                      variant={filters.status === 'lead' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('status', filters.status === 'lead' ? undefined : 'lead')}
                    >
                      Lead
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant={filters.status === 'active' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('status', filters.status === 'active' ? undefined : 'active')}
                    >
                      Active
                    </Button>
                    <Button
                      variant={filters.status === 'inactive' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('status', filters.status === 'inactive' ? undefined : 'inactive')}
                    >
                      Inactive
                    </Button>
                    <Button
                      variant={filters.status === 'prospect' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('status', filters.status === 'prospect' ? undefined : 'prospect')}
                    >
                      Prospect
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created From
                </label>
                <Input
                  type="date"
                  value={(filters as any).createdFrom || ''}
                  onChange={(e) => handleFilterChange('createdFrom', e.target.value || undefined)}
                  leftIcon={<Calendar />}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created To
                </label>
                <Input
                  type="date"
                  value={(filters as any).createdTo || ''}
                  onChange={(e) => handleFilterChange('createdTo', e.target.value || undefined)}
                  leftIcon={<Calendar />}
                />
              </div>
            </div>

            {/* Company Filter (for contacts) */}
            {type === 'contacts' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <Input
                  placeholder="Filter by company..."
                  value={(filters as any).companyId || ''}
                  onChange={(e) => handleFilterChange('companyId', e.target.value || undefined)}
                />
              </div>
            )}

            {/* Industry Filter (for companies) */}
            {type === 'companies' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <Input
                  placeholder="Filter by industry..."
                  value={(filters as any).industry || ''}
                  onChange={(e) => handleFilterChange('industry', e.target.value || undefined)}
                />
              </div>
            )}

            {/* Tags Filter (for contacts) */}
            {type === 'contacts' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <Input
                  placeholder="Filter by tags (comma-separated)..."
                  value={Array.isArray((filters as any).tags) ? (filters as any).tags.join(', ') : ''}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    handleFilterChange('tags', tags.length > 0 ? tags : undefined)
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Name
                </label>
                <Input
                  placeholder="Enter filter name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveFilter}
                  disabled={!filterName.trim()}
                >
                  Save Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
