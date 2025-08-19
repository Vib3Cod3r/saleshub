'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth-provider'
import { 
  BuildingOfficeIcon,
  UserGroupIcon,
  UserIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/utils'

interface Company {
  id: string
  name: string
  industry?: string
}

interface Contact {
  id: string
  firstName: string
  lastName: string
  title?: string
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const { data: companiesData } = useQuery({
    queryKey: ['companies', { limit: 5 }],
    queryFn: () => apiClient.crm.companies(5),
    enabled: !!user,
  })

  const { data: contactsData } = useQuery({
    queryKey: ['contacts', { limit: 5 }],
    queryFn: () => apiClient.crm.contacts(5),
    enabled: !!user,
  })

  const { data: leadsData } = useQuery({
    queryKey: ['leads', { limit: 5 }],
    queryFn: () => apiClient.crm.leads(5),
    enabled: !!user,
  })

  const { data: dealsData } = useQuery({
    queryKey: ['deals', { limit: 5 }],
    queryFn: () => apiClient.crm.deals(5),
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

  const stats = [
    {
      name: 'Total Companies',
      value: companiesData?.data?.total || 0,
      change: '+12%',
      changeType: 'positive',
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Total Contacts',
      value: contactsData?.data?.total || 0,
      change: '+8%',
      changeType: 'positive',
      icon: UserGroupIcon,
    },
    {
      name: 'Active Leads',
      value: leadsData?.data?.total || 0,
      change: '+5%',
      changeType: 'positive',
      icon: UserIcon,
    },
    {
      name: 'Total Deals',
      value: dealsData?.data?.total || 0,
      change: '+15%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your sales pipeline today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {item.value.toLocaleString()}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.changeType === 'positive' ? (
                          <ArrowUpIcon className="h-4 w-4 flex-shrink-0 self-center" aria-hidden="true" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 flex-shrink-0 self-center" aria-hidden="true" />
                        )}
                        <span className="sr-only">
                          {item.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                        </span>
                        {item.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent companies */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Companies</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {companiesData?.data?.data?.slice(0, 5).map((company: Company) => (
                <div key={company.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {company.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {company.industry || 'No industry'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent contacts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Contacts</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {contactsData?.data?.data?.slice(0, 5).map((contact: Contact) => (
                <div key={contact.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {contact.title || 'No title'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
