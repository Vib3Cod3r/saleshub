'use client'

import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon, 
  ChevronDownIcon, 
  PlusIcon, 
  EllipsisHorizontalIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import { LockClosedIcon } from '@heroicons/react/24/solid'
import { TriangleUpIcon, TriangleDownIcon } from '@/components/ui/triangle-icons'

interface Deal {
  id: string
  name: string
  amount: number
  probability: number
  currency: string
  expectedCloseDate?: string
  actualCloseDate?: string
  pipeline?: {
    id: string
    name: string
  }
  stage?: {
    id: string
    name: string
    probability: number
  }
  assignedUser?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  company?: {
    id: string
    name: string
  }
  contact?: {
    id: string
    firstName: string
    lastName: string
  }
  createdBy?: string
  createdAt: string
  updatedAt: string
  [key: string]: any
}

interface Column {
  id: string
  label: string
  key: string
  width: string
  sortable: boolean
  locked: boolean
  removable: boolean
  type?: string
}

export default function DealsPage() {
  const [loading, setLoading] = useState(true)
  const [selectedDeals, setSelectedDeals] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [allDeals, setAllDeals] = useState<Deal[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10
  })
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>({
    key: null,
    direction: 'asc'
  })
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'my' | 'unassigned'>('all')
  const [currentUser, setCurrentUser] = useState<{ id: string; firstName: string; lastName: string } | null>(null)
  
  // Column configuration with proper widths for deals
  const [columns, setColumns] = useState<Column[]>([
    { id: 'checkbox', label: '', key: 'checkbox', width: 'w-16', sortable: false, locked: true, removable: false },
    { id: 'name', label: 'DEAL NAME', key: 'name', width: 'w-64', sortable: true, locked: false, removable: false },
    { id: 'amount', label: 'AMOUNT', key: 'amount', width: 'w-32', sortable: true, locked: false, removable: false },
    { id: 'probability', label: 'PROBABILITY', key: 'probability', width: 'w-40', sortable: true, locked: false, removable: false },
    { id: 'stage', label: 'STAGE', key: 'stage', width: 'w-40', sortable: true, locked: false, removable: false },
    { id: 'pipeline', label: 'PIPELINE', key: 'pipeline', width: 'w-48', sortable: true, locked: false, removable: false },
    { id: 'company', label: 'COMPANY', key: 'company', width: 'w-56', sortable: true, locked: false, removable: false },
    { id: 'contact', label: 'CONTACT', key: 'contact', width: 'w-48', sortable: true, locked: false, removable: false },
    { id: 'assignedUser', label: 'ASSIGNED TO', key: 'assignedUser', width: 'w-48', sortable: true, locked: false, removable: false },
    { id: 'expectedCloseDate', label: 'EXPECTED CLOSE', key: 'expectedCloseDate', width: 'w-40', sortable: true, locked: false, removable: false },
    { id: 'createdAt', label: 'CREATED DATE', key: 'createdAt', width: 'w-40', sortable: true, locked: false, removable: false }
  ])

  // Fetch all deals
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      await fetchAllDeals()
      await getCurrentUser()
      setLoading(false)
    }
    loadInitialData()
  }, [activeFilter])

  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:8089/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setCurrentUser({
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName
        })
      }
    } catch (error) {
      console.error('Failed to get current user:', error)
    }
  }

  const fetchAllDeals = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setAllDeals([])
        return
      }

      let url = 'http://localhost:8089/api/crm/deals?limit=1000'
      
      if (activeFilter === 'my' && currentUser) {
        url += `&assigneeId=${currentUser.id}`
      } else if (activeFilter === 'unassigned') {
        url += '&unassigned=true'
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch deals:', response.status, response.statusText)
        setAllDeals([])
        return
      }

      const responseData = await response.json()
      
      let deals: Deal[] = []
      if (Array.isArray(responseData)) {
        deals = responseData
      } else if (responseData && responseData.data) {
        deals = responseData.data
      }
      
      setAllDeals(deals || [])
    } catch (error) {
      console.error('Error fetching deals:', error)
      setAllDeals([])
    }
  }

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectAll = () => {
    const filteredDeals = getFilteredDeals()
    if (selectedDeals.length === filteredDeals.length) {
      setSelectedDeals([])
    } else {
      setSelectedDeals(filteredDeals.map(deal => deal.id))
    }
  }

  const handleSelectDeal = (dealId: string) => {
    setSelectedDeals(prev => 
      prev.includes(dealId) 
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    )
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setActiveFilter('all')
  }

  // Helper functions for extracting deal data
  const getDealName = (deal: Deal) => {
    return deal.name || '--'
  }

  const getDealAmount = (deal: Deal) => {
    if (!deal.amount) return '--'
    return `${deal.currency || 'USD'} ${deal.amount.toLocaleString()}`
  }

  const getDealProbability = (deal: Deal) => {
    const probability = deal.probability || deal.stage?.probability || 0
    return probability
  }

  const getDealStage = (deal: Deal) => {
    return deal.stage?.name || '--'
  }

  const getDealPipeline = (deal: Deal) => {
    return deal.pipeline?.name || '--'
  }

  const getDealCompany = (deal: Deal) => {
    return deal.company?.name || '--'
  }

  const getDealContact = (deal: Deal) => {
    if (!deal.contact) return '--'
    return `${deal.contact.firstName} ${deal.contact.lastName}`.trim()
  }

  const getDealAssignedUser = (deal: Deal) => {
    if (!deal.assignedUser) return '--'
    return `${deal.assignedUser.firstName} ${deal.assignedUser.lastName}`.trim()
  }

  const getDealExpectedCloseDate = (deal: Deal) => {
    if (!deal.expectedCloseDate) return '--'
    return formatDate(deal.expectedCloseDate)
  }

  const getDealCreatedDate = (deal: Deal) => {
    if (!deal.createdAt) return '--'
    return formatDate(deal.createdAt)
  }

  const getDealAvatar = (deal: Deal) => {
    const name = getDealName(deal)
    if (!name || name === '--') return '?'
    return name.charAt(0).toUpperCase()
  }

  const getProbabilityClass = (probability: number) => {
    if (probability >= 80) return 'bg-green-100 text-green-800'
    if (probability >= 60) return 'bg-blue-100 text-blue-800'
    if (probability >= 40) return 'bg-yellow-100 text-yellow-800'
    if (probability >= 20) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getFilteredDeals = () => {
    let filtered = allDeals

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(deal => {
        const name = getDealName(deal).toLowerCase()
        const company = getDealCompany(deal).toLowerCase()
        const contact = getDealContact(deal).toLowerCase()
        const assignedUser = getDealAssignedUser(deal).toLowerCase()
        
        return name.includes(query) || 
               company.includes(query) || 
               contact.includes(query) ||
               assignedUser.includes(query)
      })
    }

    return filtered
  }

  const getSortedDeals = () => {
    const filteredDeals = getFilteredDeals()
    if (!sortConfig.key) return filteredDeals

    const sorted = [...filteredDeals].sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''

      switch (sortConfig.key) {
        case 'name':
          aValue = getDealName(a).toLowerCase()
          bValue = getDealName(b).toLowerCase()
          break
        case 'amount':
          aValue = a.amount || 0
          bValue = b.amount || 0
          break
        case 'probability':
          aValue = getDealProbability(a)
          bValue = getDealProbability(b)
          break
        case 'stage':
          aValue = getDealStage(a).toLowerCase()
          bValue = getDealStage(b).toLowerCase()
          break
        case 'pipeline':
          aValue = getDealPipeline(a).toLowerCase()
          bValue = getDealPipeline(b).toLowerCase()
          break
        case 'company':
          aValue = getDealCompany(a).toLowerCase()
          bValue = getDealCompany(b).toLowerCase()
          break
        case 'contact':
          aValue = getDealContact(a).toLowerCase()
          bValue = getDealContact(b).toLowerCase()
          break
        case 'assignedUser':
          aValue = getDealAssignedUser(a).toLowerCase()
          bValue = getDealAssignedUser(b).toLowerCase()
          break
        case 'expectedCloseDate':
          aValue = new Date(a.expectedCloseDate || '').getTime()
          bValue = new Date(b.expectedCloseDate || '').getTime()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          return 0
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
  }

  const getPaginatedDeals = () => {
    const sortedDeals = getSortedDeals()
    const startIndex = (pagination.page - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    return sortedDeals.slice(startIndex, endIndex)
  }

  const getPaginationInfo = () => {
    const filteredDeals = getFilteredDeals()
    const totalItems = filteredDeals.length
    const totalPages = Math.ceil(totalItems / pagination.limit)
    const currentPage = Math.min(pagination.page, totalPages || 1)
    
    return {
      totalItems,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '--'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getColumnValue = (deal: Deal, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return getDealName(deal)
      case 'amount':
        return getDealAmount(deal)
      case 'probability':
        return getDealProbability(deal)
      case 'stage':
        return getDealStage(deal)
      case 'pipeline':
        return getDealPipeline(deal)
      case 'company':
        return getDealCompany(deal)
      case 'contact':
        return getDealContact(deal)
      case 'assignedUser':
        return getDealAssignedUser(deal)
      case 'expectedCloseDate':
        return getDealExpectedCloseDate(deal)
      case 'createdAt':
        return getDealCreatedDate(deal)
      default:
        return '--'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white">
          <div className="w-full">
            <div className="flex items-center justify-center py-8">
              <div className="text-lg text-gray-600">Loading deals...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <div className="w-full">
          {/* Header */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Deals</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your sales deals and track their progress
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => console.log('Debug deals:', allDeals)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Debug
                </button>
                <button
                  onClick={() => console.log('Create deal clicked')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Deal
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search deals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Filter buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      activeFilter === 'all'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    All deals
                  </button>
                  <button
                    onClick={() => setActiveFilter('my')}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      activeFilter === 'my'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    My deals
                  </button>
                  <button
                    onClick={() => setActiveFilter('unassigned')}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      activeFilter === 'unassigned'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Unassigned deals
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {getFilteredDeals().length} of {allDeals.length} deals
                </span>
              </div>
            </div>
          </div>

          {/* Table with horizontal scrolling support */}
          <div className="px-6 mb-6 flex-1">
            <div className="w-full overflow-x-auto shadow-sm border border-gray-200 rounded-lg relative table-scroll-container">
            {getPaginatedDeals().length === 0 ? (
                            <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-2">
                    {(() => {
                      if (searchQuery) return 'No deals found matching your search'
                      if (activeFilter === 'my') return 'No deals assigned to you'
                      if (activeFilter === 'unassigned') return 'No unassigned deals found'
                      return 'No deals found'
                    })()}
                  </div>
                  {(searchQuery || activeFilter !== 'all') && (
                    <button
                      onClick={clearAllFilters}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Clear all filters
                    </button>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    Showing {getFilteredDeals().length} of {allDeals.length} deals
                    {activeFilter !== 'all' && (
                      <span className="ml-2 text-orange-600">
                        (Filtered by: {activeFilter === 'my' ? 'My deals' : 'Unassigned deals'})
                      </span>
                    )}
                  </div>
                </div>
            ) : (
              <table className="w-full min-w-[2000px] table-fixed deals-table">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th key={`${column.id}-${index}`} className={`${column.width} px-4 py-3 text-left`}>
                      {column.key === 'checkbox' ? (
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={selectedDeals.length === getFilteredDeals().length && getFilteredDeals().length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <button 
                            className="flex items-center hover:text-gray-700 w-full justify-start"
                            onClick={() => column.sortable && handleSort(column.key)}
                            disabled={!column.sortable}
                          >
                            {column.sortable && (
                              <div className="flex flex-col mr-2 -ml-2">
                                <TriangleUpIcon 
                                  className={`h-3 w-3 ${
                                    sortConfig.key === column.key && sortConfig.direction === 'asc' 
                                      ? 'text-blue-500' 
                                      : 'text-gray-400'
                                  }`} 
                                />
                                <TriangleDownIcon 
                                  className={`h-3 w-3 ${
                                    sortConfig.key === column.key && sortConfig.direction === 'desc' 
                                      ? 'text-blue-500' 
                                      : 'text-gray-400'
                                  }`} 
                                />
                              </div>
                            )}
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {column.label}
                            </span>
                            {column.locked && (
                              <LockClosedIcon className="h-3 w-3 text-gray-400" />
                            )}
                          </button>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {getPaginatedDeals().map((deal) => (
                  <tr key={deal.id}>
                    {columns.map((column, index) => (
                      <td key={`${column.id}-${index}`} className={`${column.width} px-4 py-3 text-sm text-gray-900`}>
                        {column.key === 'checkbox' ? (
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={selectedDeals.includes(deal.id)}
                              onChange={() => handleSelectDeal(deal.id)}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                          </div>
                        ) : column.key === 'name' ? (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gray-200 text-gray-700 flex-shrink-0 mr-3">
                              {getDealAvatar(deal)}
                            </div>
                            <div className="table-cell-content flex-1" title={getColumnValue(deal, column.key)}>
                              <span className="text-sm font-medium text-gray-900">{getColumnValue(deal, column.key)}</span>
                            </div>
                          </div>
                        ) : column.key === 'probability' ? (
                          <div className="flex items-center justify-center">
                            <div className="table-cell-content flex-1 flex justify-center" title={`${getColumnValue(deal, column.key)}%`}>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProbabilityClass(getDealProbability(deal))}`}>
                                {getColumnValue(deal, column.key)}%
                              </span>
                            </div>
                          </div>
                        ) : column.key === 'assignedUser' ? (
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mr-2">
                              <span className="text-xs text-gray-600">👤</span>
                            </div>
                            <div className="table-cell-content flex-1" title={getColumnValue(deal, column.key)}>
                              <span className="text-sm text-gray-900">{getColumnValue(deal, column.key)}</span>
                            </div>
                          </div>
                        ) : column.key === 'company' ? (
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded bg-gray-300 flex items-center justify-center flex-shrink-0 mr-2">
                              <span className="text-xs text-gray-600">🏢</span>
                            </div>
                            <div className="table-cell-content flex-1" title={getColumnValue(deal, column.key)}>
                              <span className="text-sm text-gray-900">{getColumnValue(deal, column.key)}</span>
                            </div>
                          </div>
                        ) : column.key === 'contact' ? (
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded bg-blue-300 flex items-center justify-center flex-shrink-0 mr-2">
                              <span className="text-xs text-blue-600">👤</span>
                            </div>
                            <div className="table-cell-content flex-1" title={getColumnValue(deal, column.key)}>
                              <span className="text-sm text-gray-900">{getColumnValue(deal, column.key)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div className="table-cell-content flex-1" title={getColumnValue(deal, column.key)}>
                              {getColumnValue(deal, column.key)}
                            </div>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            )}
            </div>
          </div>

          {/* Pagination */}
          {getPaginatedDeals().length > 0 && (
            <div className="flex items-center justify-center space-x-2 mt-2 pt-6 px-6 pb-6">
            {(() => {
              const paginationInfo = getPaginationInfo()
              
              return (
                <>
                  {/* Previous Button */}
                  <button 
                    className={`text-sm font-medium ${
                      paginationInfo.hasPrevPage 
                        ? 'text-blue-600 hover:text-blue-800' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!paginationInfo.hasPrevPage}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const { totalPages, currentPage } = paginationInfo
                      const pages = []
                      
                      if (totalPages <= 10) {
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        if (currentPage <= 5) {
                          for (let i = 1; i <= 7; i++) {
                            pages.push(i);
                          }
                          pages.push('...');
                          pages.push(totalPages);
                        } else if (currentPage >= totalPages - 4) {
                          pages.push(1);
                          pages.push('...');
                          for (let i = totalPages - 6; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          pages.push(1);
                          pages.push('...');
                          for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                            pages.push(i);
                          }
                          pages.push('...');
                          pages.push(totalPages);
                        }
                      }
                      
                      return pages.map((page, index) => (
                        <button
                          key={index}
                          className={`px-3 py-1 text-sm font-medium rounded ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : page === '...'
                              ? 'text-gray-500 cursor-default'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => typeof page === 'number' && setPagination(prev => ({ ...prev, page }))}
                          disabled={page === '...'}
                        >
                          {page}
                        </button>
                      ));
                    })()}
                  </div>
                  
                  {/* Next Button */}
                  <button 
                    className={`text-sm font-medium ${
                      paginationInfo.hasNextPage 
                        ? 'text-blue-600 hover:text-blue-800' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!paginationInfo.hasNextPage}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </button>
                </>
              );
            })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
