'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth-provider'

import { useQuery } from '@tanstack/react-query'
// Direct API calls instead of apiClient
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface Lead {
  id: string
  firstName: string
  lastName: string
  title?: string
  email?: string
  phone?: string
  status?: string
  source?: string
  company?: {
    name: string
  }
}

export default function LeadsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', { page: currentPage, search: searchTerm }],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const searchParams = new URLSearchParams()
      searchParams.append('page', currentPage.toString())
      searchParams.append('limit', '10')
      if (searchTerm) searchParams.append('search', searchTerm)

      const response = await fetch(`http://localhost:8089/api/crm/leads?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`)
      }
      return response.json()
    },
    enabled: !!user,
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const leads = leadsData?.data?.data || []
  const totalPages = leadsData?.data?.totalPages || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your sales leads and potential customers.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="btn-primary btn-md"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Leads table */}
      <div className="card">
        <div className="card-content">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading leads...</div>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leads</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new lead.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead: Lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {lead.firstName} {lead.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lead.title || 'No title'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <div className="text-sm text-gray-900">
                            {lead.company?.name || 'No company'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.email && (
                            <div className="flex items-center">
                              <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center mt-1">
                              <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.source || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                          lead.status === 'New' 
                            ? 'bg-blue-100 text-blue-800'
                            : lead.status === 'Contacted'
                            ? 'bg-yellow-100 text-yellow-800'
                            : lead.status === 'Qualified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        )}>
                          {lead.status || 'New'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn-outline btn-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-outline btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
