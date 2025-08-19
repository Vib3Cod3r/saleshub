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
import { CreateContactModal } from '@/components/contacts/create-contact-modal'
import { ColumnManager } from '@/components/ui/column-manager'
import { AddColumnModal } from '@/components/ui/add-column-modal'

interface Contact {
  id: string
  firstName: string
  lastName: string
  title?: string
  emailAddresses?: Array<{ email: string; isPrimary: boolean }>
  phoneNumbers?: Array<{ number: string; isPrimary: boolean }>
  company?: {
    name: string
  }
  owner?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  leadStatus?: string
  address?: {
    street?: string
    city?: string
    country?: string
  }
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

interface ContactsResponse {
  data: Contact[]
  pagination: {
    limit: number
    page: number
    total: number
    totalPages: number
  }
}

export default function ContactsPage() {
  const [loading, setLoading] = useState(true)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [allContacts, setAllContacts] = useState<Contact[]>([])
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false)
  
  // Column configuration
  const [columns, setColumns] = useState<Column[]>([
    { id: 'checkbox', label: '', key: 'checkbox', width: 'w-16', sortable: false, locked: true, removable: false },
    { id: 'name', label: 'NAME', key: 'name', width: 'w-56', sortable: true, locked: false, removable: false },
    { id: 'email', label: 'EMAIL', key: 'email', width: 'w-72', sortable: true, locked: false, removable: false },
    { id: 'phone', label: 'PHONE NUMBER', key: 'phone', width: 'w-48', sortable: true, locked: false, removable: false },
    { id: 'owner', label: 'CONTACT OWNER', key: 'owner', width: 'w-56', sortable: true, locked: false, removable: false },
    { id: 'company', label: 'PRIMARY COMPANY', key: 'company', width: 'w-64', sortable: true, locked: false, removable: false },
    { id: 'lastActivity', label: 'LAST ACTIVITY DATE (GMT+8)', key: 'lastActivity', width: 'w-80', sortable: true, locked: false, removable: false },
    { id: 'leadStatus', label: 'LEAD STATUS', key: 'leadStatus', width: 'w-40', sortable: true, locked: false, removable: false },
    { id: 'address', label: 'FULL ADDRESS', key: 'address', width: 'w-80', sortable: true, locked: false, removable: false },
    { id: 'city', label: 'CITY', key: 'city', width: 'w-48', sortable: true, locked: false, removable: false },
    { id: 'country', label: 'COUNTRY', key: 'country', width: 'w-48', sortable: true, locked: false, removable: false },
    { id: 'createdAt', label: 'CREATION DATE', key: 'createdAt', width: 'w-80', sortable: true, locked: false, removable: false }
  ])

  // Fetch all contacts for search functionality
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      await fetchAllContacts()
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
  }, [allContacts, searchQuery])



  const fetchAllContacts = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found')
        return
      }

      const response = await fetch(`http://localhost:8089/api/crm/contacts?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch all contacts for search')
        return
      }

      const data: ContactsResponse = await response.json()
      setAllContacts(data.data)
    } catch (err) {
      console.error('Error fetching all contacts for search:', err)
    }
  }

  const handleSelectAll = () => {
    const filteredContacts = getFilteredContacts()
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map(contact => contact.id))
    }
  }

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const getContactName = (contact: Contact) => {
    return `${contact.firstName} ${contact.lastName}`.trim()
  }

  const getContactEmail = (contact: Contact) => {
    const primaryEmail = contact.emailAddresses?.find(email => email.isPrimary)
    return primaryEmail?.email || '--'
  }

  const getContactPhone = (contact: Contact) => {
    const primaryPhone = contact.phoneNumbers?.find(phone => phone.isPrimary)
    return primaryPhone?.number || '--'
  }

  const getContactCompany = (contact: Contact) => {
    return contact.company?.name || '--'
  }

  const getContactOwner = (contact: Contact) => {
    if (contact.owner) {
      return `${contact.owner.firstName} ${contact.owner.lastName}`
    }
    return 'No owner'
  }

  const getContactAddress = (contact: Contact) => {
    return contact.address?.street || '--'
  }

  const getContactCity = (contact: Contact) => {
    return contact.address?.city || '--'
  }

  const getContactCountry = (contact: Contact) => {
    return contact.address?.country || '--'
  }

  const getContactAvatar = (contact: Contact) => {
    const name = getContactName(contact)
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  const getFilteredContacts = () => {
    // Ensure allContacts is always an array
    const contacts = allContacts || []
    
    if (!searchQuery.trim()) return contacts

    const query = searchQuery.toLowerCase().trim()
    
    return contacts.filter(contact => {
      const name = getContactName(contact).toLowerCase()
      const email = getContactEmail(contact).toLowerCase()
      const phone = getContactPhone(contact).toLowerCase()
      const address = getContactAddress(contact).toLowerCase()
      const city = getContactCity(contact).toLowerCase()
      const country = getContactCountry(contact).toLowerCase()
      
      return name.includes(query) || 
             email.includes(query) || 
             phone.includes(query) ||
             address.includes(query) ||
             city.includes(query) ||
             country.includes(query)
    })
  }

  const getSortedContacts = () => {
    const filteredContacts = getFilteredContacts()
    if (!sortConfig.key) return filteredContacts

    const sorted = [...filteredContacts].sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''

      switch (sortConfig.key) {
        case 'name':
          aValue = getContactName(a).toLowerCase()
          bValue = getContactName(b).toLowerCase()
          break
        case 'email':
          aValue = getContactEmail(a).toLowerCase()
          bValue = getContactEmail(b).toLowerCase()
          break
        case 'phone':
          aValue = getContactPhone(a).toLowerCase()
          bValue = getContactPhone(b).toLowerCase()
          break
        case 'company':
          aValue = getContactCompany(a).toLowerCase()
          bValue = getContactCompany(b).toLowerCase()
          break
        case 'owner':
          aValue = getContactOwner(a).toLowerCase()
          bValue = getContactOwner(b).toLowerCase()
          break
        case 'lastActivity':
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        case 'address':
          aValue = getContactAddress(a).toLowerCase()
          bValue = getContactAddress(b).toLowerCase()
          break
        case 'city':
          aValue = getContactCity(a).toLowerCase()
          bValue = getContactCity(b).toLowerCase()
          break
        case 'country':
          aValue = getContactCountry(a).toLowerCase()
          bValue = getContactCountry(b).toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'leadStatus':
          aValue = (a.leadStatus || '').toLowerCase()
          bValue = (b.leadStatus || '').toLowerCase()
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

  const getPaginatedContacts = () => {
    const sortedContacts = getSortedContacts()
    const startIndex = (pagination.page - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    return sortedContacts.slice(startIndex, endIndex)
  }

  // Calculate pagination info based on filtered contacts
  const getPaginationInfo = () => {
    const filteredContacts = getFilteredContacts()
    const totalItems = filteredContacts.length
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

  const handleCreateContactSuccess = () => {
    setIsCreateModalOpen(false)
    // Refresh the contacts data
    fetchAllContacts()
  }

  // Column management functions
  const handleColumnSort = (key: string, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction })
  }

  const handleMoveColumn = (columnId: string, direction: 'left' | 'right') => {
    setColumns(prev => {
      const currentIndex = prev.findIndex(col => col.id === columnId)
      if (currentIndex === -1) return prev

      const newColumns = [...prev]
      const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1

      // Check bounds
      if (targetIndex < 0 || targetIndex >= newColumns.length) return prev

      // Check if target column is locked
      if (newColumns[targetIndex].locked) return prev

      // Swap columns
      [newColumns[currentIndex], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[currentIndex]]

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

  const getColumnValue = (contact: Contact, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return getContactName(contact)
      case 'email':
        return getContactEmail(contact)
      case 'phone':
        return getContactPhone(contact)
      case 'owner':
        return getContactOwner(contact)
      case 'company':
        return getContactCompany(contact)
      case 'lastActivity':
        return formatDate(contact.updatedAt)
      case 'leadStatus':
        if (contact.leadStatus) {
          return `<span class="lead-status-badge lead-status-active">${contact.leadStatus}</span>`
        }
        return `<span class="lead-status-badge lead-status-default">--</span>`
      case 'address':
        return getContactAddress(contact)
      case 'city':
        return getContactCity(contact)
      case 'country':
        return getContactCountry(contact)
      case 'createdAt':
        return formatDate(contact.createdAt)
      default:
        return contact[columnKey] || '--'
    }
  }

  if (loading) {
    return (
      <div className="bg-white">
        <div className="w-full">
          <div className="flex items-center justify-center py-8">
            <div className="text-lg text-gray-600">Loading contacts...</div>
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
            <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
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
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600"
            >
              Create contact
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
                placeholder="Q Search name, phone, email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-1">
              <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-md">
                <span>All contacts</span>
                <span className="text-orange-400">×</span>
              </button>
              <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">My contacts</button>
              <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Unassigned contacts</button>
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
                <option value="b202f2a9-13fe-41f1-be43-df14aa2001e0">Test User</option>
                <option value="8b531e80-6526-4d0c-93ce-db70cc2366ea">Theodore Tse</option>
                <option value="ba774a5b-22b2-4766-b985-97548b2380dc">Admin User (example.com)</option>
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
          {getPaginatedContacts().length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">
                {searchQuery ? 'No contacts found matching your search' : 'No contacts found'}
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
            <table className="w-full min-w-[2000px] table-fixed contacts-table">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th key={column.id} className={`${column.width} px-4 py-3 text-left`}>
                    {column.key === 'checkbox' ? (
                      <input
                        type="checkbox"
                        checked={selectedContacts.length === getFilteredContacts().length && getFilteredContacts().length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <button 
                          className="flex items-center space-x-1 hover:text-gray-700"
                          onClick={() => column.sortable && handleSort(column.key)}
                          disabled={!column.sortable}
                        >
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {column.label}
                          </span>
                          {column.locked && (
                            <LockClosedIcon className="h-3 w-3 text-gray-400" />
                          )}
                          {column.sortable && (
                            <div className="flex flex-col">
                              <ChevronUpIcon 
                                className={`h-3 w-3 ${
                                  sortConfig.key === column.key && sortConfig.direction === 'asc' 
                                    ? 'text-orange-500' 
                                    : 'text-gray-400'
                                }`} 
                              />
                              <ChevronDownIcon 
                                className={`h-3 w-3 ${
                                  sortConfig.key === column.key && sortConfig.direction === 'desc' 
                                    ? 'text-orange-500' 
                                    : 'text-gray-400'
                                }`} 
                              />
                            </div>
                          )}
                        </button>
                        <ColumnManager
                          column={column}
                          onSort={handleColumnSort}
                          onLock={handleColumnLock}
                          onDelete={handleColumnDelete}
                          onAddColumn={handleAddColumn}
                          onMoveColumn={handleMoveColumn}
                          currentSortKey={sortConfig.key}
                          currentSortDirection={sortConfig.direction}
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
              {getPaginatedContacts().map((contact) => (
                <tr key={contact.id}>
                  {columns.map((column) => (
                    <td key={column.id} className={`${column.width} px-4 py-3 text-sm text-gray-900`}>
                      {column.key === 'checkbox' ? (
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => handleSelectContact(contact.id)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      ) : column.key === 'name' ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gray-200 text-gray-700 flex-shrink-0">
                            {getContactAvatar(contact)}
                          </div>
                          <div className="table-cell-content" title={getColumnValue(contact, column.key)}>
                            <span className="text-sm font-medium text-gray-900">{getColumnValue(contact, column.key)}</span>
                          </div>
                        </div>
                      ) : column.key === 'owner' ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-gray-600">👤</span>
                          </div>
                          <div className="table-cell-content" title={getColumnValue(contact, column.key)}>
                            <span className="text-sm text-gray-900">{getColumnValue(contact, column.key)}</span>
                          </div>
                        </div>
                      ) : column.key === 'company' ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 rounded bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-gray-600">🏢</span>
                          </div>
                          <div className="table-cell-content" title={getColumnValue(contact, column.key)}>
                            <span className="text-sm text-gray-900">{getColumnValue(contact, column.key)}</span>
                          </div>
                        </div>
                      ) : column.key === 'leadStatus' ? (
                        <div className="table-cell-content" title={getColumnValue(contact, column.key)}>
                          <div dangerouslySetInnerHTML={{ __html: getColumnValue(contact, column.key) }} />
                        </div>
                      ) : (
                        <div className="table-cell-content" title={getColumnValue(contact, column.key)}>
                          {getColumnValue(contact, column.key)}
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
        {getPaginatedContacts().length > 0 && (
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

      {/* Create Contact Modal */}
      <CreateContactModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateContactSuccess}
      />

      {/* Add Column Modal */}
      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        onAddColumn={handleAddCustomColumn}
      />
    </div>
  )
}
