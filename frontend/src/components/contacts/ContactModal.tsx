'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { ContactForm } from './ContactForm'
import { useCreateContact, useUpdateContact } from '@/hooks/api/useApi'
import { toast } from 'react-hot-toast'
import type { Contact, Company } from '@/types/crm'

interface ContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: Contact
  companies?: Company[]
}

export function ContactModal({ 
  open, 
  onOpenChange, 
  contact, 
  companies = [] 
}: ContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    
    try {
      if (contact) {
        // Update existing contact
        await updateContact.mutateAsync({
          id: contact.id,
          ...data,
        })
        toast.success('Contact updated successfully')
      } else {
        // Create new contact
        await createContact.mutateAsync(data)
        toast.success('Contact created successfully')
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving contact:', error)
      toast.error(contact ? 'Failed to update contact' : 'Failed to create contact')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="xl">
        <Modal.Header>
          {contact ? 'Edit Contact' : 'Add New Contact'}
        </Modal.Header>
        <Modal.Body>
          <ContactForm
            contact={contact}
            companies={companies}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={isSubmitting}
          />
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}
