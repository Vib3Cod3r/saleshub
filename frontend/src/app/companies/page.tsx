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
import { BuildingOfficeIcon, GlobeAltIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { TriangleUpIcon, TriangleDownIcon } from '@/components/ui/triangle-icons'
import { ColumnManager } from '@/components/ui/column-manager'
import { AddColumnModal } from '@/components/ui/add-column-modal'

interface Company {
  id: string
  name: string
  domain?: string
  industry?: {
    id: string
    name: string
    code?: string
  } | null
  size?: {
    id: string
    name: string
    code?: string
  } | null
  phone?: string
  email?: string
  status?: string
  ownerContact?: {
    id: string
    firstName: string
    lastName: string
  } | null
  assignedUser?: {
    id: string
    firstName: string
    lastName: string
  } | null
  tenant?: {
    id: string
    name: string
    code?: string
  } | null
  createdAt: string
  updatedAt: string
  [key: string]: any // For custom fields
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

interface CompaniesResponse {
  data: Company[]
  pagination: {
    limit: number
    page: number
    total: number
    totalPages: number
  }
}

export default function CompaniesPage() {
  const [loading, setLoading] = useState(true)
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
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
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false)
  
  // Column configuration
  const [columns, setColumns] = useState<Column[]>([
    { id: 'checkbox', label: '', key: 'checkbox', width: 'w-16', sortable: false, locked: true, removable: false },
    { id: 'name', label: 'COMPANY NAME', key: 'name', width: 'w-64', sortable: true, locked: false, removable: false },
    { id: 'domain', label: 'DOMAIN', key: 'domain', width: 'w-48', sortable: true, locked: false, removable: false },
    { id: 'industry', label: 'INDUSTRY', key: 'industry', width: 'w-48', sortable: true, locked: false, removable: false },
    { id: 'size', label: 'SIZE', key: 'size', width: 'w-40', sortable: true, locked: false, removable: false },
    { id: 'contact', label: 'CONTACT INFO', key: 'contact', width: 'w-64', sortable: true, locked: false, removable: false },
    { id: 'status', label: 'STATUS', key: 'status', width: 'w-40', sortable: true, locked: false, removable: false },
    { id: 'createdAt', label: 'CREATION DATE', key: 'createdAt', width: 'w-80', sortable: true, locked: false, removable: false }
  ])

  // Fetch all companies for search functionality
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      await fetchAllCompanies()
      setLoading(false)
    }
    loadInitialData()
  }, [])

  // Reset to first page when search changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [searchQuery])

  // Ensure current page doesn't exceed total pages when data changes
  useEffect(() => {
    const paginationInfo = getPaginationInfo()
    if (pagination.page > paginationInfo.totalPages && paginationInfo.totalPages > 0) {
      setPagination(prev => ({ ...prev, page: paginationInfo.totalPages }))
    }
  }, [allCompanies, searchQuery])

  const fetchAllCompanies = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found')
        return
      }

      const response = await fetch(`http://localhost:8089/api/crm/companies?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch all companies for search')
        return
      }

      const data: CompaniesResponse = await response.json()
      setAllCompanies(data.data)
    } catch (err) {
      console.error('Error fetching all companies for search:', err)
    }
  }

  const handleSelectAll = () => {
    const filteredCompanies = getFilteredCompanies()
    if (selectedCompanies.length === filteredCompanies.length) {
      setSelectedCompanies([])
    } else {
      setSelectedCompanies(filteredCompanies.map(company => company.id))
    }
  }

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    )
  }

  const getCompanyContact = (company: Company) => {
    const contactInfo = []
    if (company.phone) contactInfo.push(company.phone)
    if (company.email) contactInfo.push(company.email)
    return contactInfo.join(' • ') || '--'
  }

  const getCompanyAvatar = (company: Company) => {
    return company.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  const getFilteredCompanies = () => {
    // Ensure allCompanies is always an array
    const companies = allCompanies || []
    
    if (!searchQuery.trim()) return companies

    const query = searchQuery.toLowerCase().trim()
    
    return companies.filter(company => {
      const name = company.name.toLowerCase()
      const domain = (company.domain || '').toLowerCase()
      const industry = (company.industry?.name || '').toLowerCase()
      const phone = (company.phone || '').toLowerCase()
      const email = (company.email || '').toLowerCase()
      
      return name.includes(query) || 
             domain.includes(query) || 
             industry.includes(query) ||
             phone.includes(query) ||
             email.includes(query)
    })
  }

  const getSortedCompanies = () => {
    const filteredCompanies = getFilteredCompanies()
    if (!sortConfig.key) return filteredCompanies

    const sorted = [...filteredCompanies].sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''

      switch (sortConfig.key) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'domain':
          aValue = (a.domain || '').toLowerCase()
          bValue = (b.domain || '').toLowerCase()
          break
        case 'industry':
          aValue = (a.industry?.name || '').toLowerCase()
          bValue = (b.industry?.name || '').toLowerCase()
          break
        case 'size':
          aValue = (a.size?.name || '').toLowerCase()
          bValue = (b.size?.name || '').toLowerCase()
          break
        case 'contact':
          aValue = getCompanyContact(a).toLowerCase()
          bValue = getCompanyContact(b).toLowerCase()
          break
        case 'status':
          aValue = (a.status || '').toLowerCase()
          bValue = (b.status || '').toLowerCase()
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

  const getPaginatedCompanies = () => {
    const sortedCompanies = getSortedCompanies()
    const startIndex = (pagination.page - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    return sortedCompanies.slice(startIndex, endIndex)
  }

  // Calculate pagination info based on filtered companies
  const getPaginationInfo = () => {
    const filteredCompanies = getFilteredCompanies()
    const totalItems = filteredCompanies.length
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }



  const handleMoveColumn = (columnId: string, direction: 'left' | 'right') => {
    setColumns(prevColumns => {
      const currentIndex = prevColumns.findIndex(col => col.id === columnId)
      if (currentIndex === -1) return prevColumns

      const newColumns = [...prevColumns]
      const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1

      // Check bounds
      if (targetIndex < 0 || targetIndex >= newColumns.length) return prevColumns

      // Check if current column is locked (don't allow moving locked columns)
      if (newColumns[currentIndex].locked) return prevColumns

      // Swap columns
      const temp = newColumns[currentIndex]
      newColumns[currentIndex] = newColumns[targetIndex]
      newColumns[targetIndex] = temp

      return newColumns
    })
  }

  const handleColumnLock = (columnId: string, locked: boolean) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, locked } : col
    ))
  }

  const handleColumnDelete = (columnId: string) => {
    setColumns(prev => prev.filter(col => col.id !== columnId))
  }

  const handleAddColumn = (position: 'before' | 'after', referenceColumnId: string) => {
    setIsAddColumnModalOpen(true)
  }

  const handleAddCustomColumn = (columnData: {
    id: string
    label: string
    key: string
    width: string
    type: string
  }) => {
    const newColumn: Column = {
      id: columnData.id,
      label: columnData.label,
      key: columnData.key,
      width: columnData.width,
      sortable: true,
      locked: false,
      removable: true,
      type: columnData.type
    }
    
    setColumns(prev => [...prev, newColumn])
  }

  const getColumnValue = (company: Company, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return company.name
      case 'domain':
        return company.domain || '--'
      case 'industry':
        return company.industry?.name || '--'
      case 'size':
        return company.size?.name || '--'
      case 'contact':
        return getCompanyContact(company)
      case 'status':
        if (company.status) {
          return `<span class="status-badge status-active">${company.status}</span>`
        }
        return `<span class="status-badge status-default">Active</span>`
      case 'createdAt':
        return formatDate(company.createdAt)
      default:
        // Handle nested objects and arrays safely
        const value = company[columnKey]
        if (value === null || value === undefined) {
          return '--'
        }
        if (typeof value === 'object') {
          // For nested objects, try to extract a meaningful string representation
          if (Array.isArray(value)) {
            return value.length > 0 ? `${value.length} items` : '--'
          }
          // For objects, try to get a name or id property
          if (value.name) return value.name
          if (value.id) return value.id
          if (value.code) return value.code
          // Fallback to JSON string for debugging
          return JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? '...' : '')
        }
        return String(value) || '--'
    }
  }

  if (loading) {
    return (
      <div className="bg-white">
        <div className="w-full">
          <div className="flex items-center justify-center py-8">
            <div className="text-lg text-gray-600">Loading companies...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white h-full">
      <div className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-6 pt-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
            <div className="text-sm text-gray-500">
              Columns: {columns.map(col => col.id).join(' → ')}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
              <LockClosedIcon className="h-4 w-4" />
              <span>Data Quality</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
              <span>Actions</span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Import
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">
              Create company
            </button>
          </div>
        </div>

        {/* Search, Filters, and Actions */}
        <div className="flex items-center justify-between mb-4 px-6">
          {/* Left side - Search and Filters */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative w-80">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Q Search name, domain, industry"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-1">
              <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-md">
                <span>All companies</span>
                <span className="text-orange-400">×</span>
              </button>
              <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">My companies</button>
              <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Unassigned companies</button>
              <select 
                className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                onChange={(e) => {
                  // TODO: Implement owner filtering
                  console.log('Filter by owner:', e.target.value)
                }}
              >
                <option value="">All owners</option>
                <option value="7ed98e09-6460-49aa-8f9e-6efbe9ebffb7">Ted Tse</option>
                <option value="0f4062f4-cde1-4a4e-83e4-2be22f02368b">Admin User</option>
              </select>
              <PlusIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Right side - Records count and Actions */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {(() => {
                const paginationInfo = getPaginationInfo()
                const startIndex = (paginationInfo.currentPage - 1) * pagination.limit + 1
                const endIndex = Math.min(paginationInfo.currentPage * pagination.limit, paginationInfo.totalItems)
                return `${startIndex}-${endIndex} of ${paginationInfo.totalItems} records`
              })()}
            </span>
            <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Export</button>
            <button 
              onClick={() => setIsAddColumnModalOpen(true)}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Add column
            </button>
          </div>
        </div>

        {/* Table with horizontal scrolling support */}
        <div className="px-6 mb-6 flex-1">
          <div className="w-full overflow-x-auto shadow-sm border border-gray-200 rounded-lg relative table-scroll-container">
          {getPaginatedCompanies().length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">
                {searchQuery ? 'No companies found matching your search' : 'No companies found'}
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <table className="w-full min-w-[2000px] table-fixed companies-table">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th key={`${column.id}-${index}`} className={`${column.width} px-4 py-3 text-left`}>
                    {column.key === 'checkbox' ? (
                      <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={selectedCompanies.length === getFilteredCompanies().length && getFilteredCompanies().length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <button 
                          className="flex items-center space-x-2 hover:text-gray-700 w-full justify-start"
                          onClick={() => column.sortable && handleSort(column.key)}
                          disabled={!column.sortable}
                        >
                          {column.sortable && (
                            <div className="flex flex-col">
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
                        <ColumnManager
                          column={column}
                          onLock={handleColumnLock}
                          onDelete={handleColumnDelete}
                          onAddColumn={handleAddColumn}
                          onMoveColumn={handleMoveColumn}
                          position={index}
                          totalColumns={columns.length}
                        />
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {getPaginatedCompanies().map((company) => (
                <tr key={company.id}>
                  {columns.map((column, index) => (
                    <td key={`${column.id}-${index}`} className={`${column.width} px-4 py-3 text-sm text-gray-900`}>
                      {column.key === 'checkbox' ? (
                        <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(company.id)}
                          onChange={() => handleSelectCompany(company.id)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        </div>
                      ) : column.key === 'name' ? (
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gray-200 text-gray-700 flex-shrink-0 mr-3">
                            {getCompanyAvatar(company)}
                          </div>
                          <div className="table-cell-content flex-1" title={getColumnValue(company, column.key)}>
                            <span className="text-sm font-medium text-gray-900">{getColumnValue(company, column.key)}</span>
                          </div>
                        </div>
                      ) : column.key === 'domain' ? (
                        <div className="flex items-center">
                          <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="table-cell-content flex-1" title={getColumnValue(company, column.key)}>
                            <span className="text-sm text-gray-900">{getColumnValue(company, column.key)}</span>
                          </div>
                        </div>
                      ) : column.key === 'contact' ? (
                        <div className="flex items-center">
                          <div className="table-cell-content flex-1" title={getColumnValue(company, column.key)}>
                          <div className="space-y-1">
                            {company.phone && (
                              <div className="flex items-center space-x-1">
                                <PhoneIcon className="h-3 w-3 text-gray-400" />
                                <span className="text-sm text-gray-900">{company.phone}</span>
                              </div>
                            )}
                            {company.email && (
                              <div className="flex items-center space-x-1">
                                <EnvelopeIcon className="h-3 w-3 text-gray-400" />
                                <span className="text-sm text-gray-900">{company.email}</span>
                              </div>
                            )}
                            {!company.phone && !company.email && (
                              <span className="text-sm text-gray-500">--</span>
                            )}
                            </div>
                          </div>
                        </div>
                      ) : column.key === 'status' ? (
                        <div className="flex items-center">
                          <div className="table-cell-content flex-1" title={getColumnValue(company, column.key)}>
                          <div dangerouslySetInnerHTML={{ __html: getColumnValue(company, column.key) }} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="table-cell-content flex-1" title={getColumnValue(company, column.key)}>
                          {getColumnValue(company, column.key)}
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
        {getPaginatedCompanies().length > 0 && (
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
                    
                    // If total pages is 10 or less, show all pages
                    if (totalPages <= 10) {
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // For more than 10 pages, show smart pagination
                      if (currentPage <= 5) {
                        // Show first 7 pages + ellipsis + last page
                        for (let i = 1; i <= 7; i++) {
                          pages.push(i);
                        }
                        pages.push('...');
                        pages.push(totalPages);
                      } else if (currentPage >= totalPages - 4) {
                        // Show first page + ellipsis + last 7 pages
                        pages.push(1);
                        pages.push('...');
                        for (let i = totalPages - 6; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Show first page + ellipsis + current page and neighbors + ellipsis + last page
                        pages.push(1);
                        pages.push('...');
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                          pages.push(i);
                        }
                        pages.push('...');
                        pages.push(totalPages);
                      }
                    }
                    
                    return pages.map((pageNum, index) => (
                      pageNum === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm text-gray-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          className={`px-2 py-1 text-sm font-medium rounded ${
                            pageNum === currentPage
                              ? 'text-orange-600 font-semibold' // Current page - orange and bold
                              : 'text-blue-600 hover:text-blue-800' // Other pages - blue
                          }`}
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum as number }))}
                        >
                          {pageNum}
                        </button>
                      )
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
            )
          })()}
          </div>
        )}
      </div>

      {/* Add Column Modal */}
      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        onAddColumn={handleAddCustomColumn}
      />
    </div>
  )
}
