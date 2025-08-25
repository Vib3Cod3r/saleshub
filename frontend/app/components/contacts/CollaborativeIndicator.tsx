'use client'

import { useState, useEffect } from 'react'
import { Users, Edit3, Clock } from 'lucide-react'
import { useRealtimeContacts } from '@/hooks/useRealtimeContacts'
import type { Contact } from '@/types/crm'

interface CollaborativeIndicatorProps {
  contact: Contact
  onEditStart?: () => void
  onEditStop?: () => void
}

export function CollaborativeIndicator({ 
  contact, 
  onEditStart, 
  onEditStop 
}: CollaborativeIndicatorProps) {
  const { 
    isContactBeingEdited, 
    getEditingUsers, 
    notifyStartedEditing, 
    notifyStoppedEditing 
  } = useRealtimeContacts()
  
  const [isEditing, setIsEditing] = useState(false)
  const editingUsers = getEditingUsers(contact.id)
  const isBeingEdited = isContactBeingEdited(contact.id)

  // Handle edit start
  const handleEditStart = () => {
    setIsEditing(true)
    notifyStartedEditing(contact)
    onEditStart?.()
  }

  // Handle edit stop
  const handleEditStop = () => {
    setIsEditing(false)
    notifyStoppedEditing(contact)
    onEditStop?.()
  }

  // Auto-stop editing when component unmounts
  useEffect(() => {
    return () => {
      if (isEditing) {
        notifyStoppedEditing(contact)
      }
    }
  }, [isEditing, contact, notifyStoppedEditing])

  if (!isBeingEdited && !isEditing) {
    return null
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Current user editing indicator */}
      {isEditing && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
          <Edit3 className="w-3 h-3" />
          <span>You are editing</span>
        </div>
      )}
      
      {/* Other users editing indicators */}
      {editingUsers.map((editingUser) => (
        <div 
          key={editingUser.userId}
          className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs"
        >
          <Users className="w-3 h-3" />
          <span>{editingUser.userName} is editing</span>
          <Clock className="w-3 h-3" />
        </div>
      ))}
      
      {/* Edit button */}
      {!isEditing && (
        <button
          onClick={handleEditStart}
          className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors"
        >
          <Edit3 className="w-3 h-3" />
          <span>Start Editing</span>
        </button>
      )}
      
      {/* Stop editing button */}
      {isEditing && (
        <button
          onClick={handleEditStop}
          className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs hover:bg-red-200 transition-colors"
        >
          <Edit3 className="w-3 h-3" />
          <span>Stop Editing</span>
        </button>
      )}
    </div>
  )
}
