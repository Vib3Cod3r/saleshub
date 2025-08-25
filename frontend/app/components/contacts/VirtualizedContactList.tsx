'use client'

import { useVirtualizedList } from '@/hooks/useVirtualizedList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Edit, Trash2, Users, Building2 } from 'lucide-react'
import { CollaborativeIndicator } from './CollaborativeIndicator'
import type { Contact } from '@/types/crm'

interface VirtualizedContactListProps {
  contacts: Contact[]
  onEditContact: (contact: Contact) => void
  onDeleteContact: (contact: Contact) => void
  isLoading?: boolean
}

const CONTACT_ITEM_HEIGHT = 120 // Height of each contact item
const CONTAINER_HEIGHT = 600 // Height of the container

export function VirtualizedContactList({
  contacts,
  onEditContact,
  onDeleteContact,
  isLoading = false,
}: VirtualizedContactListProps) {
  const {
    visibleItems,
    containerStyle,
    contentStyle,
    handleScroll,
    shouldVirtualize,
    totalHeight,
  } = useVirtualizedList(contacts, {
    itemHeight: CONTACT_ITEM_HEIGHT,
    containerHeight: CONTAINER_HEIGHT,
    overscan: 3,
    threshold: 50,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Contacts...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (contacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Contacts Found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No contacts match your search criteria</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderContactItem = (contact: Contact) => (
    <div
      key={contact.id}
      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-sm font-medium text-primary-700">
            {contact.firstName[0]}{contact.lastName[0]}
          </span>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            {contact.firstName} {contact.lastName}
          </h3>
          <p className="text-sm text-gray-500">{contact.email}</p>
          <p className="text-xs text-gray-400">
            {contact.title} {contact.company && `at ${contact.company.name}`}
          </p>
          {contact.tags.length > 0 && (
            <div className="flex gap-1 mt-1">
              {contact.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
              {contact.tags.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{contact.tags.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          contact.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : contact.status === 'lead'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {contact.status}
        </span>
        
        {/* Collaborative Editing Indicator */}
        <CollaborativeIndicator contact={contact} />
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onEditContact(contact)}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onDeleteContact(contact)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>All Contacts ({contacts.length})</span>
          {shouldVirtualize && (
            <span className="text-sm text-gray-500">
              Virtualized for performance
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {shouldVirtualize ? (
          // Virtualized list for large datasets
          <div style={containerStyle} onScroll={handleScroll}>
            <div style={contentStyle}>
              {visibleItems.map(({ data: contact, style }) => (
                <div key={contact.id} style={style}>
                  {renderContactItem(contact)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Regular list for small datasets
          <div className="space-y-4">
            {contacts.map(renderContactItem)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
