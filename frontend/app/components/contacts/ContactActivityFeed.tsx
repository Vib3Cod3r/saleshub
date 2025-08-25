'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RefreshCw, Users, Edit3, Trash2, Tag, UserCheck, UserX } from 'lucide-react'
import { useRealtimeContacts } from '@/hooks/useRealtimeContacts'
import type { Contact } from '@/types/crm'

interface ContactActivity {
  id: string
  type: 'created' | 'updated' | 'deleted' | 'status_changed' | 'tagged' | 'started_editing' | 'stopped_editing'
  contact: Contact
  userId: string
  userName: string
  timestamp: string
  details?: string
}

export function ContactActivityFeed() {
  const [activities, setActivities] = useState<ContactActivity[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const { editingUsers } = useRealtimeContacts()

  // Simulate real-time activity feed for development
  useEffect(() => {
    const mockActivities: ContactActivity[] = [
      {
        id: '1',
        type: 'created',
        contact: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          status: 'active',
          tags: [],
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        userId: 'user1',
        userName: 'Alice Johnson',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        details: 'Added new contact'
      },
      {
        id: '2',
        type: 'updated',
        contact: {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          status: 'active',
          tags: ['VIP'],
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        },
        userId: 'user2',
        userName: 'Bob Wilson',
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        details: 'Updated contact information'
      },
      {
        id: '3',
        type: 'status_changed',
        contact: {
          id: '3',
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@example.com',
          status: 'lead',
          tags: ['Prospect'],
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        },
        userId: 'user1',
        userName: 'Alice Johnson',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        details: 'Changed status to Lead'
      },
      {
        id: '4',
        type: 'tagged',
        contact: {
          id: '4',
          firstName: 'Sarah',
          lastName: 'Brown',
          email: 'sarah.brown@example.com',
          status: 'active',
          tags: ['VIP', 'Decision Maker'],
          createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        },
        userId: 'user3',
        userName: 'Carol Davis',
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        details: 'Added VIP and Decision Maker tags'
      }
    ]

    setActivities(mockActivities)
  }, [])

  const getActivityIcon = (type: ContactActivity['type']) => {
    switch (type) {
      case 'created':
        return <Users className="w-4 h-4 text-green-600" />
      case 'updated':
        return <Edit3 className="w-4 h-4 text-blue-600" />
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-600" />
      case 'status_changed':
        return <UserCheck className="w-4 h-4 text-purple-600" />
      case 'tagged':
        return <Tag className="w-4 h-4 text-orange-600" />
      case 'started_editing':
        return <Edit3 className="w-4 h-4 text-yellow-600" />
      case 'stopped_editing':
        return <UserX className="w-4 h-4 text-gray-600" />
      default:
        return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: ContactActivity['type']) => {
    switch (type) {
      case 'created':
        return 'border-l-green-500 bg-green-50'
      case 'updated':
        return 'border-l-blue-500 bg-blue-50'
      case 'deleted':
        return 'border-l-red-500 bg-red-50'
      case 'status_changed':
        return 'border-l-purple-500 bg-purple-50'
      case 'tagged':
        return 'border-l-orange-500 bg-orange-50'
      case 'started_editing':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'stopped_editing':
        return 'border-l-gray-500 bg-gray-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const displayedActivities = isExpanded ? activities : activities.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Contact Activity</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivities(prev => [...prev])} // Trigger refresh
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            {activities.length > 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity</p>
            </div>
          ) : (
            displayedActivities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start space-x-3 p-3 border-l-4 ${getActivityColor(activity.type)} rounded-r-lg`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.userName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.details || `${activity.type} ${activity.contact.firstName} ${activity.contact.lastName}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Currently editing users */}
        {editingUsers.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Currently Editing</h4>
            <div className="space-y-2">
              {editingUsers.map((editingUser) => (
                <div
                  key={editingUser.userId}
                  className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <Edit3 className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-gray-700">
                    {editingUser.userName} is editing a contact
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(editingUser.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
