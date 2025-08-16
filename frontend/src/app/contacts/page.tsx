'use client'

import { useState } from 'react'
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
import { CreateContactModal } from '@/components/contacts/create-contact-modal'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  owner: string
  company: string
  lastActivity: string
  leadStatus: string
  avatar: string
  avatarType: 'initials' | 'logo'
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'SF Steve Finch',
    email: 's.finch@fanjango.com.hk',
    phone: '+852 9410 8647',
    owner: 'Theodore Tse (ted@vib...)',
    company: 'Fanjango Limited',
    lastActivity: '--',
    leadStatus: 'Open',
    avatar: 'SF',
    avatarType: 'initials'
  },
  {
    id: '2',
    name: 'TT Theodore Tse',
    email: 'ted@vib3cod3r.com',
    phone: '+852 9170 6477',
    owner: 'Steven Finch (s.finch@f...)',
    company: 'vib3cod3r.com',
    lastActivity: 'Aug 6, 2025 3:24 PM GMT+8',
    leadStatus: 'In progress',
    avatar: 'TT',
    avatarType: 'initials'
  },
  {
    id: '3',
    name: 'Brian Halligan (Samp...',
    email: 'bh@hubspot.com',
    phone: '--',
    owner: 'No owner',
    company: 'HubSpot',
    lastActivity: 'Aug 2, 2025 4:20 PM GMT+8',
    leadStatus: '--',
    avatar: 'HubSpot',
    avatarType: 'logo'
  },
  {
    id: '4',
    name: 'Maria Johnson (Samp...',
    email: 'emailmaria@hubspot.com',
    phone: '--',
    owner: 'No owner',
    company: 'HubSpot',
    lastActivity: 'Jul 30, 2025 6:20 PM GMT+8',
    leadStatus: '--',
    avatar: 'HubSpot',
    avatarType: 'logo'
  }
]

export default function ContactsPage() {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleSelectAll = () => {
    if (selectedContacts.length === mockContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(mockContacts.map(contact => contact.id))
    }
  }

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
    // Here you would typically refresh your contacts list
    // If using React Query: queryClient.invalidateQueries(['contacts'])
    console.log('Contact created successfully!')
    // You could also show a success toast notification here
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">4 records</span>
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
          
          {/* Updated Create Contact Button - Now Functional */}
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors duration-200"
          >
            Create contact
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 mb-4">
        <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-md">
          <span>All contacts</span>
          <span className="text-orange-400">×</span>
        </button>
        <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">My contacts</button>
        <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Unassigned contacts</button>
        <PlusIcon className="h-4 w-4 text-gray-400" />
      </div>

      {/* Views Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900">
            <PlusIcon className="h-4 w-4" />
            <span>+ Add view (3/50)</span>
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-900">All Views</button>
        </div>
      </div>

      {/* Filters */}
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

      {/* Search Bar */}
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

      {/* Table Actions */}
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
                  checked={selectedContacts.length === mockContacts.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>NAME</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>EMAIL</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>PHONE NUMBER</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>CONTACT OWNER</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>PRIMARY COMPANY</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>LAST ACTIVITY DATE (GMT+8)</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>LEAD STATUS</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockContacts.map((contact) => (
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      contact.avatarType === 'logo' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {contact.avatar}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{contact.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{contact.email}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{contact.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs text-gray-600">👤</span>
                    </div>
                    <span className="text-sm text-gray-900">{contact.owner}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded bg-gray-300 flex items-center justify-center">
                      <span className="text-xs text-gray-600">🏢</span>
                    </div>
                    <span className="text-sm text-gray-900">{contact.company}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{contact.lastActivity}</td>
                <td className="px-4 py-3">
                  {contact.leadStatus !== '--' ? (
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      contact.leadStatus === 'Open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {contact.leadStatus}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">--</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-4 mt-6 pt-4 border-t border-gray-200">
        <button className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeftIcon className="h-4 w-4" />
          <span>Prev</span>
        </button>
        <button className="px-3 py-2 text-sm font-medium text-white bg-orange-500 rounded-md">1</button>
        <button className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
          <span>Next</span>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">25 per page</span>
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Create Contact Modal */}
      <CreateContactModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
