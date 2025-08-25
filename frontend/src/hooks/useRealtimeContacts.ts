import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from './useWebSocket'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import type { Contact } from '@/types/crm'

interface EditingUser {
  userId: string
  userName: string
  contactId: string
  timestamp: string
}

export function useRealtimeContacts() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { isConnected, sendMessage } = useWebSocket()
  const [editingUsers, setEditingUsers] = useState<EditingUser[]>([])

  // Handle real-time contact updates
  useEffect(() => {
    if (!isConnected) return

    const handleContactUpdate = (data: any) => {
      const { action, contact, userId, userName } = data
      
      switch (action) {
        case 'created':
          // Add new contact to the list
          queryClient.setQueryData(['contacts'], (old: Contact[] | undefined) => {
            if (!old) return [contact]
            return [contact, ...old]
          })
          
          // Update dashboard stats
          queryClient.setQueryData(['dashboard-stats'], (old: any) => {
            if (!old) return old
            return {
              ...old,
              totalContacts: (old.totalContacts || 0) + 1,
              contactsGrowth: (old.contactsGrowth || 0) + 1,
            }
          })
          
          // Only show notification if not created by current user
          if (userId !== user?.id) {
            toast.success(`${userName} added a new contact: ${contact.firstName} ${contact.lastName}`)
          }
          break

        case 'updated':
          // Update existing contact with conflict resolution
          queryClient.setQueryData(['contacts'], (old: Contact[] | undefined) => {
            if (!old) return old
            return old.map(c => {
              if (c.id === contact.id) {
                // Check for conflicts - if local version is newer, show conflict warning
                const localVersion = c.updatedAt
                const remoteVersion = contact.updatedAt
                
                if (new Date(localVersion) > new Date(remoteVersion)) {
                  toast.error(`Conflict detected: ${contact.firstName} ${contact.lastName} was updated by ${userName} while you were editing`)
                  return c // Keep local version
                }
                
                return contact
              }
              return c
            })
          })
          
          // Only show notification if not updated by current user
          if (userId !== user?.id) {
            toast.success(`${userName} updated: ${contact.firstName} ${contact.lastName}`)
          }
          break

        case 'deleted':
          // Remove contact from the list
          queryClient.setQueryData(['contacts'], (old: Contact[] | undefined) => {
            if (!old) return old
            return old.filter(c => c.id !== contact.id)
          })
          
          // Update dashboard stats
          queryClient.setQueryData(['dashboard-stats'], (old: any) => {
            if (!old) return old
            return {
              ...old,
              totalContacts: Math.max(0, (old.totalContacts || 0) - 1),
              contactsGrowth: Math.max(0, (old.contactsGrowth || 0) - 1),
            }
          })
          
          // Only show notification if not deleted by current user
          if (userId !== user?.id) {
            toast.success(`${userName} deleted: ${contact.firstName} ${contact.lastName}`)
          }
          break

        case 'status_changed':
          // Update contact status
          queryClient.setQueryData(['contacts'], (old: Contact[] | undefined) => {
            if (!old) return old
            return old.map(c => 
              c.id === contact.id 
                ? { ...c, status: contact.status, updatedAt: contact.updatedAt }
                : c
            )
          })
          
          // Only show notification if not changed by current user
          if (userId !== user?.id) {
            toast.success(`${userName} changed status: ${contact.firstName} ${contact.lastName} is now ${contact.status}`)
          }
          break

        case 'tagged':
          // Update contact tags
          queryClient.setQueryData(['contacts'], (old: Contact[] | undefined) => {
            if (!old) return old
            return old.map(c => 
              c.id === contact.id 
                ? { ...c, tags: contact.tags, updatedAt: contact.updatedAt }
                : c
            )
          })
          
          // Only show notification if not tagged by current user
          if (userId !== user?.id) {
            toast.success(`${userName} updated tags: ${contact.firstName} ${contact.lastName}`)
          }
          break

        case 'started_editing':
          // Add user to editing list
          setEditingUsers(prev => {
            const existing = prev.find(e => e.userId === userId && e.contactId === contact.id)
            if (existing) {
              return prev.map(e => 
                e.userId === userId && e.contactId === contact.id
                  ? { ...e, timestamp: new Date().toISOString() }
                  : e
              )
            }
            return [...prev, { userId, userName, contactId: contact.id, timestamp: new Date().toISOString() }]
          })
          
          // Only show notification if not current user
          if (userId !== user?.id) {
            toast(`${userName} is editing ${contact.firstName} ${contact.lastName}`, {
              icon: '✏️',
              duration: 3000,
            })
          }
          break

        case 'stopped_editing':
          // Remove user from editing list
          setEditingUsers(prev => prev.filter(e => !(e.userId === userId && e.contactId === contact.id)))
          break

        default:
          console.log('Unknown contact action:', action)
      }
    }

    // Listen for contact updates
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'contact_update') {
          handleContactUpdate(message.payload)
        }
      } catch (error) {
        console.error('Failed to handle contact update:', error)
      }
    }

    // Add event listener for WebSocket messages
    const socket = (window as any).__websocket__
    if (socket) {
      socket.addEventListener('message', handleMessage)
    }

    return () => {
      if (socket) {
        socket.removeEventListener('message', handleMessage)
      }
    }
  }, [isConnected, queryClient, user])

  // Clean up stale editing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setEditingUsers(prev => 
        prev.filter(editing => {
          const editingTime = new Date(editing.timestamp)
          const diffMinutes = (now.getTime() - editingTime.getTime()) / (1000 * 60)
          return diffMinutes < 5 // Remove after 5 minutes of inactivity
        })
      )
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Send contact update notifications
  const notifyContactUpdate = (action: string, contact: Contact) => {
    if (isConnected) {
      sendMessage({
        type: 'contact_update',
        payload: {
          action,
          contact,
          userId: user?.id,
          userName: user?.name,
          timestamp: new Date().toISOString(),
        }
      })
    }
  }

  // Notify when user starts editing
  const notifyStartedEditing = (contact: Contact) => {
    if (isConnected) {
      sendMessage({
        type: 'contact_update',
        payload: {
          action: 'started_editing',
          contact,
          userId: user?.id,
          userName: user?.name,
          timestamp: new Date().toISOString(),
        }
      })
    }
  }

  // Notify when user stops editing
  const notifyStoppedEditing = (contact: Contact) => {
    if (isConnected) {
      sendMessage({
        type: 'contact_update',
        payload: {
          action: 'stopped_editing',
          contact,
          userId: user?.id,
          userName: user?.name,
          timestamp: new Date().toISOString(),
        }
      })
    }
  }

  // Check if contact is being edited by someone else
  const isContactBeingEdited = (contactId: string) => {
    return editingUsers.some(editing => 
      editing.contactId === contactId && editing.userId !== user?.id
    )
  }

  // Get users editing a specific contact
  const getEditingUsers = (contactId: string) => {
    return editingUsers.filter(editing => 
      editing.contactId === contactId && editing.userId !== user?.id
    )
  }

  return {
    notifyContactUpdate,
    notifyStartedEditing,
    notifyStoppedEditing,
    isContactBeingEdited,
    getEditingUsers,
    editingUsers,
    isConnected,
  }
}
