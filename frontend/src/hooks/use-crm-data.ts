import { useState, useEffect, useCallback, useMemo } from 'react'
import { apiClient, CRM_CONSTANTS, formatDateTime } from '@/lib/utils'
import { logHookError } from '@/lib/cursor-error-tracker'

// Types
export interface PaginationState {
  page: number
  total: number
  totalPages: number
  limit: number
}

export interface SortConfig {
  key: string | null
  direction: 'asc' | 'desc'
}

export interface PaginationInfo {
  totalItems: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface UseCrmDataOptions<T> {
  endpoint: string
  pageSize?: number
  searchFields?: (keyof T)[]
  sortableFields?: string[]
  getDisplayValue?: (item: T, field: keyof T) => string
}

export function useCrmData<T extends { id: string; updatedAt: string }>(
  options: UseCrmDataOptions<T>
) {
  const {
    endpoint,
    pageSize = CRM_CONSTANTS.DEFAULT_PAGE_SIZE,
    searchFields = [],
    sortableFields = [],
    getDisplayValue
  } = options

  // State
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [allItems, setAllItems] = useState<T[]>([])
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: pageSize
  })
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc'
  })

  // Fetch all data for search functionality
  const fetchAllData = useCallback(async () => {
    try {
      const data = await apiClient.fetch(`${endpoint}?limit=${CRM_CONSTANTS.MAX_SEARCH_RESULTS}`)
      setAllItems(data.data || [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      logHookError(error, 'useCrmData', 'companies')
      console.error(`Error fetching data from ${endpoint}:`, err)
      setAllItems([])
    }
  }, [endpoint])

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      await fetchAllData()
      setLoading(false)
    }
    loadInitialData()
  }, [fetchAllData])

  // Reset to first page when search changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [searchQuery])

  // Search and filtering
  const getFilteredItems = useCallback(() => {
    const items = allItems || []
    
    if (!searchQuery.trim()) return items

    const query = searchQuery.toLowerCase().trim()
    
    return items.filter(item => {
      return searchFields.some(field => {
        const value = getDisplayValue 
          ? getDisplayValue(item, field)
          : String(item[field] || '')
        return value.toLowerCase().includes(query)
      })
    })
  }, [allItems, searchQuery, searchFields, getDisplayValue])

  // Ensure current page doesn't exceed total pages when data changes
  // Pagination
  const getPaginationInfo = useCallback((): PaginationInfo => {
    const filteredItems = getFilteredItems()
    const totalItems = filteredItems.length
    const totalPages = Math.ceil(totalItems / pagination.limit)
    const currentPage = Math.min(pagination.page, totalPages || 1)
    
    return {
      totalItems,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  }, [getFilteredItems, pagination.limit, pagination.page])

  useEffect(() => {
    const paginationInfo = getPaginationInfo()
    if (pagination.page > paginationInfo.totalPages && paginationInfo.totalPages > 0) {
      setPagination(prev => ({ ...prev, page: paginationInfo.totalPages }))
    }
  }, [allItems, searchQuery, pagination.limit, pagination.page, getPaginationInfo])

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    const filteredItems = getFilteredItems()
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map(item => item.id))
    }
  }, [selectedItems.length, getFilteredItems])

  const handleSelectItem = useCallback((itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }, [])

  // Sorting
  const handleSort = useCallback((key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }, [sortConfig])

  const getSortedItems = useCallback(() => {
    const filteredItems = getFilteredItems()
    if (!sortConfig.key) return filteredItems

    const sorted = [...filteredItems].sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''

      if (sortConfig.key === 'lastActivity') {
        aValue = new Date(a.updatedAt).getTime()
        bValue = new Date(b.updatedAt).getTime()
      } else {
        aValue = getDisplayValue 
          ? getDisplayValue(a, sortConfig.key as keyof T)
          : String(a[sortConfig.key as keyof T] || '')
        bValue = getDisplayValue 
          ? getDisplayValue(b, sortConfig.key as keyof T)
          : String(b[sortConfig.key as keyof T] || '')
        
        if (typeof aValue === 'string') aValue = aValue.toLowerCase()
        if (typeof bValue === 'string') bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })

    return sorted
  }, [getFilteredItems, sortConfig, getDisplayValue])

  // Pagination
  const getPaginatedItems = useCallback(() => {
    const sortedItems = getSortedItems()
    const startIndex = (pagination.page - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    return sortedItems.slice(startIndex, endIndex)
  }, [getSortedItems, pagination.page, pagination.limit])

  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  const goToNextPage = useCallback(() => {
    const paginationInfo = getPaginationInfo()
    if (paginationInfo.hasNextPage) {
      goToPage(pagination.page + 1)
    }
  }, [getPaginationInfo, pagination.page, goToPage])

  const goToPrevPage = useCallback(() => {
    const paginationInfo = getPaginationInfo()
    if (paginationInfo.hasPrevPage) {
      goToPage(pagination.page - 1)
    }
  }, [getPaginationInfo, pagination.page, goToPage])

  // Utility functions
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '--'
    return formatDateTime(dateString)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  const refreshData = useCallback(async () => {
    setLoading(true)
    await fetchAllData()
    setLoading(false)
  }, [fetchAllData])

  // Computed values
  const paginationInfo = useMemo(() => getPaginationInfo(), [getPaginationInfo])
  const filteredItems = useMemo(() => getFilteredItems(), [getFilteredItems])
  const sortedItems = useMemo(() => getSortedItems(), [getSortedItems])
  const paginatedItems = useMemo(() => getPaginatedItems(), [getPaginatedItems])
  const isAllSelected = useMemo(() => {
    return selectedItems.length === filteredItems.length && filteredItems.length > 0
  }, [selectedItems.length, filteredItems.length])

  return {
    // State
    loading,
    selectedItems,
    searchQuery,
    allItems,
    pagination,
    sortConfig,
    paginationInfo,
    
    // Computed data
    filteredItems,
    sortedItems,
    paginatedItems,
    isAllSelected,
    
    // Actions
    setSearchQuery,
    setSelectedItems,
    handleSelectAll,
    handleSelectItem,
    handleSort,
    goToPage,
    goToNextPage,
    goToPrevPage,
    clearSearch,
    refreshData,
    
    // Utilities
    formatDate,
    
    // Configuration
    sortableFields
  }
}
