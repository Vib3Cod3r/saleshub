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
  createdAt: string
  updatedAt: string
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
  const [error, setError] = useState<string | null>(null)
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

  // We no longer need to fetch contacts on page change since we're using allContacts
  // useEffect(() => {
  //   fetchContacts()
  // }, [pagination.page])

  // Fetch all contacts for search functionality
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      await fetchAllContacts()
      await fetchContacts() // Still fetch initial page data for pagination info
      setLoading(false)
    }
    loadInitialData()
  }, [])

  // Reset to first page when search changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [searchQuery])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('No authentication token found')
        setLoading(false)
        return
      }

      const response = await fetch(`http://localhost:8089/api/crm/contacts?page=${pagination.page}&limit=${pagination.limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.status}`)
      }

      const data: ContactsResponse = await response.json()
      console.log('Received contacts data:', data.data) // Debug log
      setAllContacts(data.data) // Set the contacts data
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }))
      setError(null)
    } catch (err) {
      console.error('Error fetching contacts:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllContacts = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
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
    if (!searchQuery.trim()) return allContacts

    const query = searchQuery.toLowerCase().trim()
    
    return allContacts.filter(contact => {
      const name = getContactName(contact).toLowerCase()
      const email = getContactEmail(contact).toLowerCase()
      const phone = getContactPhone(contact).toLowerCase()
      
      return name.includes(query) || 
             email.includes(query) || 
             phone.includes(query)
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
    fetchContacts()
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

  if (error) {
    return (
      <div className="bg-white">
        <div className="w-full">
          <div className="flex items-center justify-center py-8">
            <div className="text-lg text-red-600">Error: {error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
        <div className="flex items-center justify-between mb-4">
          {/* Left side - Search and Filters */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative w-80">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, phone, email"
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
              {getFilteredContacts().length} records
            </span>
            <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Export</button>
            <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Edit columns</button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === getFilteredContacts().length && getFilteredContacts().length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center space-x-1 hover:text-gray-700"
                    onClick={() => handleSort('name')}
                  >
                    <span>NAME</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'name' && sortConfig.direction === 'asc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                      <ChevronDownIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'name' && sortConfig.direction === 'desc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </div>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </button>
                </th>
                <th className="w-64 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center space-x-1 hover:text-gray-700"
                    onClick={() => handleSort('email')}
                  >
                    <span>EMAIL</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'email' && sortConfig.direction === 'asc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                      <ChevronDownIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'email' && sortConfig.direction === 'desc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </div>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </button>
                </th>
                <th className="w-40 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center space-x-1 hover:text-gray-700"
                    onClick={() => handleSort('phone')}
                  >
                    <span>PHONE NUMBER</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'phone' && sortConfig.direction === 'asc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                      <ChevronDownIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'phone' && sortConfig.direction === 'desc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </div>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </button>
                </th>
                <th className="w-40 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center space-x-1 hover:text-gray-700"
                    onClick={() => handleSort('owner')}
                  >
                    <span>CONTACT OWNER</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'owner' && sortConfig.direction === 'asc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                      <ChevronDownIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'owner' && sortConfig.direction === 'desc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </div>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </button>
                </th>
                <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center space-x-1 hover:text-gray-700"
                    onClick={() => handleSort('company')}
                  >
                    <span>PRIMARY COMPANY</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'company' && sortConfig.direction === 'asc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                      <ChevronDownIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'company' && sortConfig.direction === 'desc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </div>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </button>
                </th>
                <th className="w-56 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center space-x-1 hover:text-gray-700"
                    onClick={() => handleSort('lastActivity')}
                  >
                    <span>LAST ACTIVITY DATE (GMT+8)</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'lastActivity' && sortConfig.direction === 'asc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                      <ChevronDownIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'lastActivity' && sortConfig.direction === 'desc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </div>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </button>
                </th>
                <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>LEAD STATUS</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon className="h-3 w-3" />
                      <ChevronDownIcon className="h-3 w-3" />
                    </div>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getPaginatedContacts().map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => handleSelectContact(contact.id)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gray-200 text-gray-700">
                        {getContactAvatar(contact)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{getContactName(contact)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{getContactEmail(contact)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{getContactPhone(contact)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-600">👤</span>
                      </div>
                      <span className="text-sm text-gray-900">{getContactOwner(contact)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded bg-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-600">🏢</span>
                      </div>
                      <span className="text-sm text-gray-900">{getContactCompany(contact)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(contact.updatedAt)}</td>
                  <td className="px-4 py-3">
                    {(() => {
                      console.log('Contact lead status:', contact.leadStatus, 'for contact:', contact.firstName, contact.lastName)
                      return contact.leadStatus ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {contact.leadStatus}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          --
                        </span>
                      )
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-2 mt-6 pt-4 border-t border-gray-200">
          {/* Previous Button */}
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </button>
          
          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {(() => {
              const filteredContacts = getFilteredContacts()
              const totalPages = Math.ceil(filteredContacts.length / pagination.limit)
              const currentPage = pagination.page
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
                        ? 'text-black font-semibold' // Current page - black and bold
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
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            disabled={pagination.page >= Math.ceil(getFilteredContacts().length / pagination.limit)}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </button>
        </div>
      </div>

      {/* Create Contact Modal */}
      <CreateContactModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateContactSuccess}
      />
    </div>
  )
}
