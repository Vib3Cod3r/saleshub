'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { MainContent } from '@/components/layout/main-content'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { cn, formatCurrency } from '@/lib/utils'

export default function DealsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const { data: dealsData, isLoading } = useQuery({
    queryKey: ['deals', { page: currentPage, search: searchTerm }],
    queryFn: () => apiClient.getDeals({ 
      page: currentPage, 
      limit: 10, 
      search: searchTerm 
    }),
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

  const deals = dealsData?.data?.data || []
  const totalPages = dealsData?.data?.totalPages || 1

  return (
    <MainContent>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
            <p className="mt-2 text-sm text-gray-700">
              Track your sales opportunities and revenue pipeline.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="btn-primary btn-md"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Deal
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
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Deals table */}
        <div className="card">
          <div className="card-content">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-lg">Loading deals...</div>
              </div>
            ) : deals.length === 0 ? (
              <div className="text-center py-8">
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No deals</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new deal.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deals.map((deal: any) => (
                      <tr key={deal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {deal.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {deal.description || 'No description'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <BuildingOfficeIcon className="h-4 w-4 mr-1 text-gray-400" />
                            <div className="text-sm text-gray-900">
                              {deal.company?.name || 'No company'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {deal.value ? formatCurrency(deal.value) : 'Not specified'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                            deal.stage === 'Prospecting' ? 'bg-gray-100 text-gray-800' :
                            deal.stage === 'Qualification' ? 'bg-blue-100 text-blue-800' :
                            deal.stage === 'Proposal' ? 'bg-yellow-100 text-yellow-800' :
                            deal.stage === 'Negotiation' ? 'bg-orange-100 text-orange-800' :
                            deal.stage === 'Closed Won' ? 'bg-green-100 text-green-800' :
                            deal.stage === 'Closed Lost' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          )}>
                            {deal.stage || 'Prospecting'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                            <div className="text-sm text-gray-900">
                              {deal.owner?.firstName} {deal.owner?.lastName}
                            </div>
                          </div>
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
    </MainContent>
  )
}
