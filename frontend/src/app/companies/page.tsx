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
import { CreateCompanyModal } from '@/components/companies/create-company-modal'

interface Company {
  id: string
  name: string
  website?: string
  domain?: string
  revenue?: number
  industry?: {
    name: string
    code: string
  }
  size?: {
    name: string
    code: string
  }
  emailAddresses?: Array<{ email: string; isPrimary: boolean }>
  phoneNumbers?: Array<{ number: string; isPrimary: boolean }>
  addresses?: Array<{
    street1?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }>
  owner?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  updatedAt: string
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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

  const getCompanyName = (company: Company) => {
    return company.name || '--'
  }

  const getCompanyEmail = (company: Company) => {
    const primaryEmail = company.emailAddresses?.find(email => email.isPrimary)
    return primaryEmail?.email || '--'
  }

  const getCompanyPhone = (company: Company) => {
    const primaryPhone = company.phoneNumbers?.find(phone => phone.isPrimary)
    return primaryPhone?.number || '--'
  }

  const getCompanyWebsite = (company: Company) => {
    return company.website || company.domain || '--'
  }

  const getCompanyIndustry = (company: Company) => {
    return company.industry?.name || '--'
  }

  const getCompanySize = (company: Company) => {
    return company.size?.name || '--'
  }

  const getCompanyOwner = (company: Company) => {
    if (company.owner) {
      return `${company.owner.firstName} ${company.owner.lastName}`
    }
    return 'No owner'
  }

  const getCompanyCity = (company: Company) => {
    const primaryAddress = company.addresses?.[0]
    return primaryAddress?.city || '--'
  }

  const getCompanyCountry = (company: Company) => {
    const primaryAddress = company.addresses?.[0]
    return primaryAddress?.country || '--'
  }

  const getCompanyAvatar = (company: Company) => {
    const name = getCompanyName(company)
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatRevenue = (revenue: number) => {
    if (revenue >= 1000000) {
      return `$${(revenue / 1000000).toFixed(1)}M`
    } else if (revenue >= 1000) {
      return `$${(revenue / 1000).toFixed(1)}K`
    }
    return `$${revenue.toLocaleString()}`
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  const getFilteredCompanies = () => {
    if (!searchQuery.trim()) return allCompanies

    const query = searchQuery.toLowerCase().trim()
    
    return allCompanies.filter(company => {
      const name = getCompanyName(company).toLowerCase()
      const email = getCompanyEmail(company).toLowerCase()
      const phone = getCompanyPhone(company).toLowerCase()
      const website = getCompanyWebsite(company).toLowerCase()
      const industry = getCompanyIndustry(company).toLowerCase()
      const city = getCompanyCity(company).toLowerCase()
      const country = getCompanyCountry(company).toLowerCase()
      
      return name.includes(query) || 
             email.includes(query) || 
             phone.includes(query) ||
             website.includes(query) ||
             industry.includes(query) ||
             city.includes(query) ||
             country.includes(query)
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
          aValue = getCompanyName(a).toLowerCase()
          bValue = getCompanyName(b).toLowerCase()
          break
        case 'email':
          aValue = getCompanyEmail(a).toLowerCase()
          bValue = getCompanyEmail(b).toLowerCase()
          break
        case 'phone':
          aValue = getCompanyPhone(a).toLowerCase()
          bValue = getCompanyPhone(b).toLowerCase()
          break
        case 'website':
          aValue = getCompanyWebsite(a).toLowerCase()
          bValue = getCompanyWebsite(b).toLowerCase()
          break
        case 'industry':
          aValue = getCompanyIndustry(a).toLowerCase()
          bValue = getCompanyIndustry(b).toLowerCase()
          break
        case 'size':
          aValue = getCompanySize(a).toLowerCase()
          bValue = getCompanySize(b).toLowerCase()
          break
        case 'owner':
          aValue = getCompanyOwner(a).toLowerCase()
          bValue = getCompanyOwner(b).toLowerCase()
          break
        case 'revenue':
          aValue = a.revenue || 0
          bValue = b.revenue || 0
          break
        case 'lastActivity':
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        case 'city':
          aValue = getCompanyCity(a).toLowerCase()
          bValue = getCompanyCity(b).toLowerCase()
          break
        case 'country':
          aValue = getCompanyCountry(a).toLowerCase()
          bValue = getCompanyCountry(b).toLowerCase()
          break
        case 'createDate':
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

  const handleCreateCompanySuccess = () => {
    setIsCreateModalOpen(false)
    // Refresh the companies data
    fetchAllCompanies()
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
    <div className="bg-white">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
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
              Create company
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
                placeholder="Search name, phone, email, website, city, country"
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
            <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Edit columns</button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full">
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
            <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.length === getFilteredCompanies().length && getFilteredCompanies().length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center space-x-1 hover:text-gray-700"
                    onClick={() => handleSort('name')}
                  >
                    <span>COMPANY NAME</span>
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
                <th className="w-44 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center space-x-1 hover:text-gray-700"
                    onClick={() => handleSort('owner')}
                  >
                    <span>COMPANY OWNER</span>
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
                <th className="w-36 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center space-x-1 hover:text-gray-700"
                    onClick={() => handleSort('website')}
                  >
                    <span>WEBSITE</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'website' && sortConfig.direction === 'asc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                      <ChevronDownIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'website' && sortConfig.direction === 'desc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </div>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </button>
                </th>
                <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center space-x-1 hover:text-gray-700"
                    onClick={() => handleSort('city')}
                  >
                    <span>CITY</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'city' && sortConfig.direction === 'asc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                      <ChevronDownIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'city' && sortConfig.direction === 'desc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </div>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </button>
                </th>
                <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center space-x-1 hover:text-gray-700"
                    onClick={() => handleSort('country')}
                  >
                    <span>COUNTRY</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'country' && sortConfig.direction === 'asc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                      <ChevronDownIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'country' && sortConfig.direction === 'desc' 
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
                    onClick={() => handleSort('createDate')}
                  >
                    <span>CREATE DATE</span>
                    <div className="flex flex-col">
                      <ChevronUpIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'createDate' && sortConfig.direction === 'asc' 
                            ? 'text-orange-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                      <ChevronDownIcon 
                        className={`h-3 w-3 ${
                          sortConfig.key === 'createDate' && sortConfig.direction === 'desc' 
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
                <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>INDUSTRY</span>
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
              {getPaginatedCompanies().map((company) => (
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
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gray-200 text-gray-700">
                        {getCompanyAvatar(company)}
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate">{getCompanyName(company)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate">{getCompanyEmail(company)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate">{getCompanyPhone(company)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-600">👤</span>
                      </div>
                      <span className="text-sm text-gray-900 truncate">{getCompanyOwner(company)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded bg-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-600">🌐</span>
                      </div>
                      <span className="text-sm text-gray-900 truncate">{getCompanyWebsite(company)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate">{getCompanyCity(company)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate">{getCompanyCountry(company)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate">{formatDate(company.createdAt)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate">{formatDate(company.updatedAt)}</td>
                  <td className="px-4 py-3">
                    {getCompanyIndustry(company) !== '--' ? (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 truncate">
                        {getCompanyIndustry(company)}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                        --
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {/* Pagination */}
        {getPaginatedCompanies().length > 0 && (
          <div className="flex items-center justify-center space-x-2 mt-12 pt-6">
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

      {/* Create Company Modal */}
      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateCompanySuccess}
      />
    </div>
  )
}