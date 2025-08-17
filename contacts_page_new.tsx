'use client'

import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon, 
  ChevronDownIcon, 
  PlusIcon, 
  FunnelIcon,
  EllipsisHorizontalIcon,
  ChevronUpIcon,
  ChevronDownIcon as ChevronDown,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { LockClosedIcon } from '@heroicons/react/24/solid'

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
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [currentView, setCurrentView] = useState('All contacts')
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10
  })

  useEffect(() => {
    fetchContacts()
  }, [pagination.page])

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
      setContacts(data.data)
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

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(contacts.map(contact => contact.id))
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

  const getContactAvatar = (contact: Contact) => {
    const name = getContactName(contact)
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading contacts...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Error: {error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">{pagination.total} records</span>
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
              Create contact
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1 mb-4">
          <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-md">
            <span>All contacts</span>
            <span className="text-orange-400">×</span>
          </button>
          <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">My contacts</button>
          <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Unassigned contacts</button>
          <PlusIcon className="h-4 w-4 text-gray-400" />
        </div>

        {/* Views */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900">
              <PlusIcon className="h-4 w-4" />
              <span>+ Add view (3/50)</span>
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900">All Views</button>
          </div>
        </div>

        {/* Sort and Filter */}
        <div className="flex items-center space-x-3 mb-4">
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white">
            <option>Contact owner</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white">
            <option>Create date</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white">
            <option>Last activity date</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white">
            <option>Lead status</option>
          </select>
          <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">+ More</button>
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
            <FunnelIcon className="h-4 w-4" />
            <span>= Advanced filters</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, phone, email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Export</button>
            <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Edit columns</button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>NAME</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon className="h-3 w-3" />
                      <ChevronDownIcon className="h-3 w-3" />
                    </div>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>EMAIL</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon className="h-3 w-3" />
                      <ChevronDownIcon className="h-3 w-3" />
                    </div>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>PHONE NUMBER</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon className="h-3 w-3" />
                      <ChevronDownIcon className="h-3 w-3" />
                    </div>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>CONTACT OWNER</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon className="h-3 w-3" />
                      <ChevronDownIcon className="h-3 w-3" />
                    </div>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>PRIMARY COMPANY</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon className="h-3 w-3" />
                      <ChevronDownIcon className="h-3 w-3" />
                    </div>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>LAST ACTIVITY DATE (GMT+8)</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon className="h-3 w-3" />
                      <ChevronDownIcon className="h-3 w-3" />
                    </div>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
              {contacts.map((contact) => (
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
                      <span className="text-sm text-gray-900">No owner</span>
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
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Open
                    </span>
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
            {Array.from({ length: Math.min(10, pagination.totalPages) }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`px-2 py-1 text-sm font-medium rounded ${
                  pageNum === pagination.page
                    ? 'text-black font-semibold' // Current page - black and bold
                    : 'text-blue-600 hover:text-blue-800' // Other pages - blue
                }`}
                onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
              >
                {pageNum}
              </button>
            ))}
          </div>
          
          {/* Next Button */}
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
