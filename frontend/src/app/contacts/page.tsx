'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react'
import { ContactModal } from '@/components/contacts/ContactModal'
import { AdvancedFilters } from '@/components/filters/AdvancedFilters'
import { DataExport } from '@/components/data/DataExport'
import { CollaborativeIndicator } from '@/components/contacts/CollaborativeIndicator'
import { ContactActivityFeed } from '@/components/contacts/ContactActivityFeed'
import { VirtualizedContactList } from '@/components/contacts/VirtualizedContactList'
import { useContacts, useDeleteContact, useCompanies } from '@/hooks/api/useApi'
import { useRealtimeContacts } from '@/hooks/useRealtimeContacts'
import { toast } from 'react-hot-toast'
import type { Contact, ContactFilters } from '@/types/crm'

export default function ContactsPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<ContactFilters>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>()
  const [savedFilters, setSavedFilters] = useState<Array<{ name: string; filters: ContactFilters }>>([])
  
  // API hooks
  const { data: contacts = [], isLoading: contactsLoading } = useContacts({
    search: search || undefined,
    ...filters,
  })
  
  const { data: companies = [] } = useCompanies()
  const deleteContact = useDeleteContact()
  
  // Real-time contact updates
  const { notifyContactUpdate, notifyStartedEditing, notifyStoppedEditing } = useRealtimeContacts()

  const handleAddContact = () => {
    setSelectedContact(undefined)
    setModalOpen(true)
  }

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact)
    setModalOpen(true)
    // Notify that user is starting to edit
    notifyStartedEditing(contact)
  }

  const handleDeleteContact = async (contact: Contact) => {
    if (confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`)) {
      try {
        await deleteContact.mutateAsync(contact.id)
        // Notify real-time update
        notifyContactUpdate('deleted', contact)
        toast.success('Contact deleted successfully')
      } catch (error) {
        toast.error('Failed to delete contact')
      }
    }
  }

  const handleSaveFilter = (name: string, filterData: ContactFilters) => {
    setSavedFilters(prev => [...prev, { name, filters: filterData }])
    toast.success(`Filter "${name}" saved successfully`)
  }

  const handleLoadFilter = (filterData: ContactFilters) => {
    setFilters(filterData)
    toast.success('Filter loaded successfully')
  }

  const handleExport = (format: 'csv' | 'json', options: any) => {
    // Simulate export functionality
    console.log('Exporting contacts:', { format, options, data: contacts })
    toast.success(`Contacts exported as ${format.toUpperCase()}`)
  }

  const filteredContacts = contacts.filter((contact: Contact) =>
    contact.firstName.toLowerCase().includes(search.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(search.toLowerCase()) ||
    contact.email.toLowerCase().includes(search.toLowerCase()) ||
    contact.company?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <div className="flex items-center space-x-3">
          <DataExport
            type="contacts"
            data={contacts}
            filters={filters}
            onExport={handleExport}
          />
          <Button leftIcon={<Plus />} onClick={handleAddContact}>
            Add Contact
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search />}
                />
              </div>
            </div>
            <AdvancedFilters
              type="contacts"
              filters={filters}
              onFiltersChange={setFilters}
              onSaveFilter={handleSaveFilter}
              savedFilters={savedFilters}
              onLoadFilter={handleLoadFilter}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VirtualizedContactList
            contacts={filteredContacts}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
            isLoading={contactsLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <ContactActivityFeed />
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          // Notify when modal closes (user stops editing)
          if (!open && selectedContact) {
            notifyStoppedEditing(selectedContact)
          }
        }}
        contact={selectedContact}
        companies={companies}
      />
    </div>
  )
}
