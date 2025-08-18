'use client'

import { useState } from 'react'
import { CreateContactModal } from '@/components/contacts/create-contact-modal'

export function ContactFormTest() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSuccess = () => {
    console.log('Contact created successfully!')
    // Here you would typically refresh the contacts list
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Contact Form Test</h2>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
      >
        Open Create Contact Modal
      </button>

      <CreateContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
