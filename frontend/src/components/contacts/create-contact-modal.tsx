'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth-provider'

interface CreateContactModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ContactFormData {
  firstName: string
  lastName: string
  title?: string
  department?: string
  companyId?: string
  companyName?: string
  emailAddresses: Array<{
    email: string
    isPrimary: boolean
    typeId?: string
  }>
  phoneNumbers: Array<{
    number: string
    extension?: string
    isPrimary: boolean
    typeId?: string
  }>
  addresses: Array<{
    street1?: string
    street2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    isPrimary: boolean
    typeId?: string
  }>
  socialMedia: Array<{
    username?: string
    url?: string
    isPrimary: boolean
    typeId?: string
  }>
  emailOptIn: boolean
  smsOptIn: boolean
  callOptIn: boolean
  originalSource?: string
}

// Temporary API client
const apiClient = {
  createContact: async (contactData: ContactFormData) => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.')
    }

    const response = await fetch('http://localhost:8089/api/crm/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Handle specific error cases
      if (response.status === 401) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('token')
        throw new Error('Authentication failed. Please log in again.')
      }
      
      // Provide more specific error messages
      if (errorData.error) {
        throw new Error(errorData.error)
      }
      
      // Generic error based on status code
      switch (response.status) {
        case 400:
          throw new Error('Invalid contact data. Please check your input.')
        case 403:
          throw new Error('You do not have permission to create contacts.')
        case 500:
          throw new Error('Server error. Please try again later.')
        default:
          throw new Error(`Failed to create contact (${response.status})`)
      }
    }

    return response.json()
  }
}

export function CreateContactModal({ isOpen, onClose, onSuccess }: CreateContactModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    title: '',
    department: '',
    companyId: '',
    companyName: '',
    emailAddresses: [{ email: '', isPrimary: true }],
    phoneNumbers: [{ number: '', isPrimary: true }],
    addresses: [{ isPrimary: true }],
    socialMedia: [{ isPrimary: true }],
    emailOptIn: true,
    smsOptIn: false,
    callOptIn: true,
    originalSource: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createAndAddAnother, setCreateAndAddAnother] = useState(false)

  const queryClient = useQueryClient()

  const createContactMutation = useMutation({
    mutationFn: apiClient.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      if (createAndAddAnother) {
        // Reset form for another contact
        setFormData({
          firstName: '',
          lastName: '',
          title: '',
          department: '',
          companyId: '',
          companyName: '',
          emailAddresses: [{ email: '', isPrimary: true }],
          phoneNumbers: [{ number: '', isPrimary: true }],
          addresses: [{ isPrimary: true }],
          socialMedia: [{ isPrimary: true }],
          emailOptIn: true,
          smsOptIn: false,
          callOptIn: true,
          originalSource: ''
        })
        setErrors({})
      } else {
        onSuccess()
      }
    },
    onError: (error: Error) => {
      console.error('Failed to create contact:', error)
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('authentication') || error.message.includes('log in')) {
        setErrors({ submit: 'Authentication failed. Please log in again.' })
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        setErrors({ submit: error.message || 'Failed to create contact' })
      }
    },
    onSettled: () => {
      setIsSubmitting(false)
    }
  })

  // Check if user is authenticated - moved after all hooks
  if (!user) {
    return (
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Authentication Required
            </Dialog.Title>
            <p className="text-gray-600 mb-4">
              You need to be logged in to create contacts.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    )
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (formData.emailAddresses.length > 0 && formData.emailAddresses[0].email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.emailAddresses[0].email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    }

    if (formData.phoneNumbers.length > 0 && formData.phoneNumbers[0].number) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      const cleanPhone = formData.phoneNumbers[0].number.replace(/[\s\-\(\)]/g, '')
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid phone number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // Prepare contact data for API
      const contactData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        title: formData.title || undefined,
        department: formData.department || undefined,
        companyId: formData.companyId || undefined,
        companyName: formData.companyName || undefined,
        originalSource: formData.originalSource || undefined,
        emailOptIn: formData.emailOptIn,
        smsOptIn: formData.smsOptIn,
        callOptIn: formData.callOptIn,
        // Add contact information arrays
        emailAddresses: formData.emailAddresses.filter(e => e.email.trim()),
        phoneNumbers: formData.phoneNumbers.filter(p => p.number.trim()),
        addresses: formData.addresses.filter(a => a.street1?.trim() || a.city?.trim()),
        socialMedia: formData.socialMedia.filter(s => s.username?.trim() || s.url?.trim())
      }

      await createContactMutation.mutateAsync(contactData)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handleInputChange = (field: keyof ContactFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleArrayChange = (arrayName: keyof Pick<ContactFormData, 'emailAddresses' | 'phoneNumbers' | 'addresses' | 'socialMedia'>, index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }



  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-green-500 px-6 py-4 rounded-t-lg flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-white">
              Create Contact
            </Dialog.Title>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="text-white/80 hover:text-white text-sm flex items-center"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                Edit this form
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-white/80 hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.emailAddresses[0]?.email || ''}
                  onChange={(e) => handleArrayChange('emailAddresses', 0, 'email', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
                    errors.email ? "border-red-300" : "border-gray-300"
                  )}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phoneNumbers[0]?.number || ''}
                  onChange={(e) => handleArrayChange('phoneNumbers', 0, 'number', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
                    errors.phone ? "border-red-300" : "border-gray-300"
                  )}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
                    errors.firstName ? "border-red-300" : "border-gray-300"
                  )}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
                    errors.lastName ? "border-red-300" : "border-gray-300"
                  )}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>

              {/* Contact Owner */}
              <div>
                <label htmlFor="contactOwner" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact owner
                </label>
                <select
                  id="contactOwner"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select contact owner</option>
                  <option value="theodore-tse">Theodore Tse</option>
                </select>
              </div>

              {/* Job Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Job title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Company */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  value={formData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Lifecycle Stage */}
              <div>
                <label htmlFor="lifecycleStage" className="block text-sm font-medium text-gray-700 mb-2">
                  Lifecycle stage
                </label>
                <select
                  id="lifecycleStage"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select lifecycle stage</option>
                  <option value="lead">Lead</option>
                  <option value="contact">Contact</option>
                  <option value="customer">Customer</option>
                  <option value="prospect">Prospect</option>
                </select>
              </div>

              {/* Lead Status */}
              <div>
                <label htmlFor="leadStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  Lead status
                </label>
                <select
                  id="leadStatus"
                  className="w-full px-3 py-2 border border-teal-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-teal-50"
                >
                  <option value="">Select lead status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="unqualified">Unqualified</option>
                </select>
              </div>

              {/* Communication Preferences */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Communication Preferences</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.emailOptIn}
                      onChange={(e) => handleInputChange('emailOptIn', e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email opt-in</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.smsOptIn}
                      onChange={(e) => handleInputChange('smsOptIn', e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">SMS opt-in</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.callOptIn}
                      onChange={(e) => handleInputChange('callOptIn', e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Call opt-in</span>
                  </label>
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {errors.submit}
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex items-center justify-between">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreateAndAddAnother(true)
                  handleSubmit({ preventDefault: () => {} } as React.FormEvent)
                }}
                disabled={isSubmitting}
                className="border border-orange-500 text-orange-500 px-4 py-2 rounded-md hover:bg-orange-50 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create and add another
              </button>
              <button
                type="button"
                onClick={onClose}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
