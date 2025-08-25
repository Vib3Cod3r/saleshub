'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DashboardAlerts } from '@/components/dashboard/DashboardAlerts'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Calendar,
  Plus 
} from 'lucide-react'
import { useDashboardStats, useRecentActivity } from '@/hooks/api/useApi'
import { useRouter } from 'next/navigation'
import type { Activity } from '@/types/crm'

export default function DashboardPage() {
  const router = useRouter()
  
  // API hooks
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activities = [] } = useRecentActivity()

  // Format stats for display
  const dashboardStats = [
    {
      name: 'Total Contacts',
      value: stats?.totalContacts?.toLocaleString() || '0',
      change: stats?.contactsGrowth ? `${stats.contactsGrowth > 0 ? '+' : ''}${stats.contactsGrowth}%` : '0%',
      changeType: stats?.contactsGrowth && stats.contactsGrowth > 0 ? 'positive' : 'negative',
      icon: Users,
    },
    {
      name: 'Active Companies',
      value: stats?.totalCompanies?.toLocaleString() || '0',
      change: stats?.companiesGrowth ? `${stats.companiesGrowth > 0 ? '+' : ''}${stats.companiesGrowth}%` : '0%',
      changeType: stats?.companiesGrowth && stats.companiesGrowth > 0 ? 'positive' : 'negative',
      icon: Building2,
    },
    {
      name: 'Pipeline Value',
      value: stats?.totalRevenue ? `$${(stats.totalRevenue / 1000000).toFixed(1)}M` : '$0M',
      change: stats?.revenueGrowth ? `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}%` : '0%',
      changeType: stats?.revenueGrowth && stats.revenueGrowth > 0 ? 'positive' : 'negative',
      icon: TrendingUp,
    },
    {
      name: 'Total Deals',
      value: stats?.totalDeals?.toLocaleString() || '0',
      change: stats?.dealsGrowth ? `${stats.dealsGrowth > 0 ? '+' : ''}${stats.dealsGrowth}%` : '0%',
      changeType: stats?.dealsGrowth && stats.dealsGrowth > 0 ? 'positive' : 'negative',
      icon: Calendar,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button leftIcon={<Plus />} onClick={() => router.push('/contacts')}>
          Add Contact
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.slice(0, 5).map((activity: Activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {activity.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Add New Contact
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Create New Deal
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Dashboard Alerts */}
      <DashboardAlerts />
    </div>
  )
}
