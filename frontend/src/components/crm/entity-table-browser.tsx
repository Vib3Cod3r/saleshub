'use client'

import { useState, useEffect, useCallback } from 'react'
import { EntitySpecification, TableState, ColumnConfig, FilterConfig, SortConfig, EntityRecord, PaginatedResponse } from '@/types/entity'
import { TableHeaderPanel } from './table-header-panel'
import { ConfigurableTable } from './configurable-table'
import { useEntityData } from '@/hooks/use-entity-data'
import { useTableState } from '@/hooks/use-table-state'

interface EntityTableBrowserProps {
  entitySpec: EntitySpecification
}

export function EntityTableBrowser({ entitySpec }: EntityTableBrowserProps) {
  const [data, setData] = useState<EntityRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  
  const { tableState, updateTableState } = useTableState(entitySpec)
  const { fetchEntityData } = useEntityData()

  // Load data when table state changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const response = await fetchEntityData(entitySpec.name, {
          search: tableState.search,
          filters: tableState.filters,
          sort: tableState.sort,
          page: tableState.page,
          pageSize: tableState.pageSize,
          fields: tableState.columns.filter(col => col.visible).map(col => col.field)
        })
        
        setData(response.data)
        setTotalCount(response.pagination.total)
      } catch (error) {
        console.error('Failed to fetch entity data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [entitySpec.name, tableState, fetchEntityData])

  const handleSearchChange = useCallback((search: string) => {
    updateTableState({ search, page: 1 })
  }, [updateTableState])

  const handleFilterChange = useCallback((filters: FilterConfig[]) => {
    updateTableState({ filters, page: 1 })
  }, [updateTableState])

  const handleSortChange = useCallback((sort: SortConfig) => {
    updateTableState({ sort })
  }, [updateTableState])

  const handlePageChange = useCallback((page: number) => {
    updateTableState({ page })
  }, [updateTableState])

  const handlePageSizeChange = useCallback((pageSize: number) => {
    updateTableState({ pageSize, page: 1 })
  }, [updateTableState])

  const handleColumnChange = useCallback((columns: ColumnConfig[]) => {
    updateTableState({ columns })
  }, [updateTableState])

  const handleCreateNew = useCallback(() => {
    // TODO: Implement create new entity modal
    console.log('Create new entity:', entitySpec.name)
  }, [entitySpec.name])

  return (
    <div className="h-full flex flex-col">
      {/* Header Panel with Filters and Search */}
      <TableHeaderPanel
        entitySpec={entitySpec}
        search={tableState.search}
        filters={tableState.filters}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onCreateNew={handleCreateNew}
      />

      {/* Configurable Table */}
      <div className="flex-1 overflow-hidden">
        <ConfigurableTable
          entitySpec={entitySpec}
          data={data}
          loading={loading}
          tableState={tableState}
          totalCount={totalCount}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onColumnChange={handleColumnChange}
        />
      </div>
    </div>
  )
}
