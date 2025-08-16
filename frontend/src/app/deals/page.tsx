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
  ChevronRightIcon,
  Bars3Icon,
  Squares2X2Icon,
  ArrowUturnLeftIcon,
  DocumentDuplicateIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline'

interface Deal {
  id: string
  name: string
  stage: string
  closeDate: string
  owner: string
  amount: string
}

const mockDeals: Deal[] = [
  {
    id: '1',
    name: 'Big Deal',
    stage: 'Appointment Scheduled (Sal...)',
    closeDate: 'Aug 31, 2025 10:24 AM GMT+8',
    owner: 'Theodore Tse (ted@vib...)',
    amount: '$1,000,000'
  },
  {
    id: '2',
    name: 'Test',
    stage: 'Appointment Scheduled (Sal...)',
    closeDate: '--',
    owner: 'Theodore Tse (ted@vib...)',
    amount: '$100,000'
  }
]

export default function DealsPage() {
  const [selectedDeals, setSelectedDeals] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const handleSelectAll = () => {
    if (selectedDeals.length === mockDeals.length) {
      setSelectedDeals([])
    } else {
      setSelectedDeals(mockDeals.map(deal => deal.id))
    }
  }

  const handleSelectDeal = (dealId: string) => {
    setSelectedDeals(prev => 
      prev.includes(dealId) 
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-gray-900">Deals</h1>
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">2 records</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <span>Actions</span>
            <ChevronDownIcon className="h-4 w-4" />
          </button>
          
          <button className="px-4 py-2 text-sm font-medium text-orange-500 bg-white border border-orange-500 rounded-md hover:bg-orange-50">
            Import
          </button>
          
          <button className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">
            Create deal
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 mb-4">
        <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full">
          <span>All deals</span>
          <span className="text-gray-500">×</span>
        </button>
        <button className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-full hover:bg-gray-50">My deals</button>
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

      {/* Display Mode and Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Display Mode Icons */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Bars3Icon className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Dropdowns */}
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white">
            <option>All pipelines</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white">
            <option>Deal owner</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white">
            <option>Create date</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white">
            <option>Last activity date</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white">
            <option>Close date</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white">
            <option>+ More</option>
          </select>
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700">
            <FunnelIcon className="h-4 w-4" />
            <span>= Advanced filters</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search name or description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* Table Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <ArrowUturnLeftIcon className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <DocumentDuplicateIcon className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <BookmarkIcon className="h-4 w-4" />
          </button>
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
                  checked={selectedDeals.length === mockDeals.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>DEAL NAME</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>DEAL STAGE</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>CLOSE DATE (GMT+8)</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>DEAL OWNER</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>AMOUNT</span>
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
            {mockDeals.map((deal) => (
              <tr key={deal.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedDeals.includes(deal.id)}
                    onChange={() => handleSelectDeal(deal.id)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-blue-600">{deal.name}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{deal.stage}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{deal.closeDate}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs text-gray-600">👤</span>
                    </div>
                    <span className="text-sm text-gray-900">{deal.owner}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{deal.amount}</td>
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
        <button className="px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-md">1</button>
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
