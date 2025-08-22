'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { FilterBuilder } from './filter-builder'
import { EntitySpecification, FilterConfig } from '@/types/entity'

interface TableHeaderPanelProps {
  entitySpec: EntitySpecification
  search: string
  filters: FilterConfig[]
  onSearchChange: (search: string) => void
  onFilterChange: (filters: FilterConfig[]) => void
  onCreateNew: () => void
}

export function TableHeaderPanel({
  entitySpec,
  search,
  filters,
  onSearchChange,
  onFilterChange,
  onCreateNew
}: TableHeaderPanelProps) {
  const [showFilterBuilder, setShowFilterBuilder] = useState(false)

  const handleAddFilter = (filter: FilterConfig) => {
    onFilterChange([...filters, filter])
    setShowFilterBuilder(false)
  }

  const handleRemoveFilter = (filterId: string) => {
    onFilterChange(filters.filter(f => f.id !== filterId))
  }

  const handleClearAllFilters = () => {
    onFilterChange([])
  }

  const activeFiltersCount = filters.length

  return (
    <div className="border-b border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Search and Filters */}
        <div className="flex-1 flex items-center gap-4">
          {/* Magic Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${entitySpec.displayName.toLowerCase()}...`}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilterBuilder(!showFilterBuilder)}
            className={`flex items-center gap-2 ${
              activeFiltersCount > 0 ? 'bg-orange-50 border-orange-200 text-orange-700' : ''
            }`}
          >
            <FunnelIcon className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* New Button */}
        <Button
          onClick={onCreateNew}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New {entitySpec.displayName.slice(0, -1)}
        </Button>
      </div>

      {/* Active Filters Display */}
      {filters.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((filter) => {
            const field = entitySpec.fields.find(f => f.name === filter.field)
            return (
              <div
                key={filter.id}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                <span className="font-medium">{field?.displayName || filter.field}:</span>
                <span>{filter.displayValue || filter.value}</span>
                <button
                  onClick={() => handleRemoveFilter(filter.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Filter Builder */}
      {showFilterBuilder && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <FilterBuilder
            entitySpec={entitySpec}
            onAddFilter={handleAddFilter}
            onClose={() => setShowFilterBuilder(false)}
          />
        </div>
      )}
    </div>
  )
}
