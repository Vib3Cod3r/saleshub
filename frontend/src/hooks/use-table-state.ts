import { useState, useCallback, useEffect } from 'react'
import { EntitySpecification, TableState, ColumnConfig, SortConfig, FilterConfig } from '@/types/entity'

export function useTableState(entitySpec: EntitySpecification) {
  const [tableState, setTableState] = useState<TableState>({
    columns: [],
    sort: {
      field: entitySpec.defaultSortField,
      direction: entitySpec.defaultSortDirection
    },
    filters: [],
    search: '',
    page: 1,
    pageSize: entitySpec.defaultPageSize,
    selectedRows: []
  })

  // Initialize columns from entity specification
  useEffect(() => {
    const initialColumns: ColumnConfig[] = entitySpec.defaultFields.map((fieldName, index) => {
      const field = entitySpec.fields.find(f => f.name === fieldName)
      return {
        id: fieldName,
        field: fieldName,
        displayName: field?.displayName || fieldName,
        sortable: field?.sortable || false,
        filterable: field?.filterable || false,
        visible: true,
        order: index
      }
    })

    setTableState(prev => ({
      ...prev,
      columns: initialColumns,
      sort: {
        field: entitySpec.defaultSortField,
        direction: entitySpec.defaultSortDirection
      },
      pageSize: entitySpec.defaultPageSize
    }))
  }, [entitySpec])

  const updateTableState = useCallback((updates: Partial<TableState>) => {
    setTableState(prev => ({
      ...prev,
      ...updates
    }))
  }, [])

  const resetTableState = useCallback(() => {
    setTableState({
      columns: entitySpec.defaultFields.map((fieldName, index) => {
        const field = entitySpec.fields.find(f => f.name === fieldName)
        return {
          id: fieldName,
          field: fieldName,
          displayName: field?.displayName || fieldName,
          sortable: field?.sortable || false,
          filterable: field?.filterable || false,
          visible: true,
          order: index
        }
      }),
      sort: {
        field: entitySpec.defaultSortField,
        direction: entitySpec.defaultSortDirection
      },
      filters: [],
      search: '',
      page: 1,
      pageSize: entitySpec.defaultPageSize,
      selectedRows: []
    })
  }, [entitySpec])

  const updateColumns = useCallback((columns: ColumnConfig[]) => {
    updateTableState({ columns })
  }, [updateTableState])

  const updateSort = useCallback((sort: SortConfig) => {
    updateTableState({ sort })
  }, [updateTableState])

  const updateFilters = useCallback((filters: FilterConfig[]) => {
    updateTableState({ filters, page: 1 })
  }, [updateTableState])

  const updateSearch = useCallback((search: string) => {
    updateTableState({ search, page: 1 })
  }, [updateTableState])

  const updatePage = useCallback((page: number) => {
    updateTableState({ page })
  }, [updateTableState])

  const updatePageSize = useCallback((pageSize: number) => {
    updateTableState({ pageSize, page: 1 })
  }, [updateTableState])

  const updateSelectedRows = useCallback((selectedRows: string[]) => {
    updateTableState({ selectedRows })
  }, [updateTableState])

  return {
    tableState,
    updateTableState,
    resetTableState,
    updateColumns,
    updateSort,
    updateFilters,
    updateSearch,
    updatePage,
    updatePageSize,
    updateSelectedRows
  }
}
