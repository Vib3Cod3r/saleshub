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

interface Company {
  id: string
  name: string
  owner: string
  createDate: string
  phone: string
  lastActivity: string
  city: string
  country: string
  avatar: string
  avatarType: 'logo' | 'default'
}

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Fanjango Limited',
    owner: 'Steven Finch (s.finch@f...)',
    createDate: 'Aug 5, 2025 1:38 PM GMT+8',
    phone: '--',
    lastActivity: '--',
    city: 'hong kong',
    country: '--',
    avatar: 'FL',
    avatarType: 'default'
  },
  {
    id: '2',
    name: '--',
    owner: 'No owner',
    createDate: 'Jul 30, 2025 4:27 PM GMT+8',
    phone: '--',
    lastActivity: 'Aug 6, 2025 3:24 PM GMT+8',
    city: '--',
    country: '--',
    avatar: '--',
    avatarType: 'default'
  },
  {
    id: '3',
    name: 'HubSpot',
    owner: 'No owner',
    createDate: 'Jul 30, 2025 4:20 PM GMT+8',
    phone: '--',
    lastActivity: 'Aug 2, 2025 4:20 PM GMT+8',
    city: '--',
    country: '--',
    avatar: 'HubSpot',
    avatarType: 'logo'
  }
]

export default function CompaniesPage() {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [currentView, setCurrentView] = useState('All companies')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSelectAll = () => {
    if (selectedCompanies.length === mockCompanies.length) {
      setSelectedCompanies([])
    } else {
      setSelectedCompanies(mockCompanies.map(company => company.id))
    }
  }

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">3 records</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="text-sm text-blue-600 hover:text-blue-700">
            See Target Accounts
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700">
            <LockClosedIcon className="h-4 w-4" />
            <span>Data Quality</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <span>Actions</span>
            <ChevronDownIcon className="h-4 w-4" />
          </button>
          
          <button className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">
            Import
          </button>
          
          <button className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">
            Create company
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 mb-4">
        <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">
          <span>All companies</span>
          <span className="text-gray-500">×</span>
        </button>
        <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">My companies</button>
      </div>

      {/* Views Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700">
            <PlusIcon className="h-4 w-4" />
            <span>+ Add view (2/50)</span>
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-700">All Views</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-3 mb-4">
        <select className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white">
          <option>Company owner</option>
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
        <button className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700">+ More</button>
        <button className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700">
          <FunnelIcon className="h-4 w-4" />
          <span>= Advanced filters</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search name, phone, or dc"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  checked={selectedCompanies.length === mockCompanies.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>COMPANY NAME</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>COMPANY OWNER</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>CREATE DATE (GMT+8)</span>
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
                  <span>LAST ACTIVITY DATE (G...)</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>CITY</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>COUNTRY/REGION</span>
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
            {mockCompanies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.includes(company.id)}
                    onChange={() => handleSelectCompany(company.id)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      company.avatarType === 'logo' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {company.avatar}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{company.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs text-gray-600">👤</span>
                    </div>
                    <span className="text-sm text-gray-900">{company.owner}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{company.createDate}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{company.phone}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{company.lastActivity}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{company.city}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{company.country}</td>
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
        <button className="px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-md">1</button>
        <button className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
          <span>Next</span>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">25 per page</span>
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  )
}
