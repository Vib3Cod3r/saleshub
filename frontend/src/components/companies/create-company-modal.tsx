'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth-provider'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role?: {
    name: string
  }
}

interface Industry {
  id: string
  name: string
  code: string
  description?: string
  isActive: boolean
}

interface CompanySize {
  id: string
  name: string
  code: string
  description?: string
  minEmployees?: number
  maxEmployees?: number
  isActive: boolean
}

interface EmailAddressType {
  id: string
  name: string
  code: string
  description?: string
  isActive: boolean
}

interface PhoneNumberType {
  id: string
  name: string
  code: string
  description?: string
  isActive: boolean
}

interface AddressType {
  id: string
  name: string
  code: string
  description?: string
  isActive: boolean
}

interface SocialMediaType {
  id: string
  name: string
  code: string
  icon?: string
  baseUrl?: string
  isActive: boolean
}

interface CreateCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface CompanyFormData {
  name: string
  website?: string
  domain?: string
  industryId?: string
  sizeId?: string
  revenue?: number
  externalId?: string
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
    platform: string
    username: string
    url?: string
    isPrimary: boolean
    typeId?: string
  }>
}

export function CreateCompanyModal({ isOpen, onClose, onSuccess }: CreateCompanyModalProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    website: '',
    domain: '',
    industryId: '',
    sizeId: '',
    revenue: undefined,
    externalId: '',
    emailAddresses: [{ email: '', isPrimary: true }],
    phoneNumbers: [{ number: '', isPrimary: true }],
    addresses: [{ isPrimary: true }],
    socialMedia: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        website: '',
        domain: '',
        industryId: '',
        sizeId: '',
        revenue: undefined,
        externalId: '',
        emailAddresses: [{ email: '', isPrimary: true }],
        phoneNumbers: [{ number: '', isPrimary: true }],
        addresses: [{ isPrimary: true }],
        socialMedia: []
      })
      setErrors({})
    }
  }, [isOpen])

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('http://localhost:8089/api/crm/companies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create company')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      onSuccess()
    },
    onError: (error: Error) => {
      console.error('Error creating company:', error)
      setErrors({ submit: error.message })
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required'
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL'
    }

    if (formData.domain && !isValidDomain(formData.domain)) {
      newErrors.domain = 'Please enter a valid domain'
    }

    // Validate email addresses
    const primaryEmails = formData.emailAddresses.filter(email => email.isPrimary)
    if (primaryEmails.length === 0) {
      newErrors.emailAddresses = 'At least one primary email is required'
    }

    formData.emailAddresses.forEach((email, index) => {
      if (email.email && !isValidEmail(email.email)) {
        newErrors[`emailAddresses.${index}.email`] = 'Please enter a valid email address'
      }
    })

    // Validate phone numbers
    const primaryPhones = formData.phoneNumbers.filter(phone => phone.isPrimary)
    if (primaryPhones.length === 0) {
      newErrors.phoneNumbers = 'At least one primary phone number is required'
    }

    formData.phoneNumbers.forEach((phone, index) => {
      if (phone.number && !isValidPhone(phone.number)) {
        newErrors[`phoneNumbers.${index}.number`] = 'Please enter a valid phone number'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
      return true
    } catch {
      return false
    }
  }

  const isValidDomain = (domain: string): boolean => {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return domainRegex.test(domain)
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    // Filter out empty email addresses and phone numbers
    const cleanData = {
      ...formData,
      emailAddresses: formData.emailAddresses.filter(email => email.email.trim()),
      phoneNumbers: formData.phoneNumbers.filter(phone => phone.number.trim()),
      addresses: formData.addresses.filter(addr => 
        addr.street1?.trim() || addr.city?.trim() || addr.state?.trim() || addr.postalCode?.trim()
      ),
      socialMedia: formData.socialMedia.filter(social => social.username.trim())
    }

    createCompanyMutation.mutate(cleanData)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addEmailAddress = () => {
    setFormData(prev => ({
      ...prev,
      emailAddresses: [...prev.emailAddresses, { email: '', isPrimary: false }]
    }))
  }

  const removeEmailAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emailAddresses: prev.emailAddresses.filter((_, i) => i !== index)
    }))
  }

  const updateEmailAddress = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      emailAddresses: prev.emailAddresses.map((email, i) => 
        i === index ? { ...email, [field]: value } : email
      )
    }))
  }

  const setPrimaryEmail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emailAddresses: prev.emailAddresses.map((email, i) => ({
        ...email,
        isPrimary: i === index
      }))
    }))
  }

  const addPhoneNumber = () => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, { number: '', isPrimary: false }]
    }))
  }

  const removePhoneNumber = (index: number) => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.filter((_, i) => i !== index)
    }))
  }

  const updatePhoneNumber = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.map((phone, i) => 
        i === index ? { ...phone, [field]: value } : phone
      )
    }))
  }

  const setPrimaryPhone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.map((phone, i) => ({
        ...phone,
        isPrimary: i === index
      }))
    }))
  }

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, { isPrimary: false }]
    }))
  }

  const removeAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }))
  }

  const updateAddress = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    }))
  }

  const setPrimaryAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => ({
        ...addr,
        isPrimary: i === index
      }))
    }))
  }

  const addSocialMedia = () => {
    setFormData(prev => ({
      ...prev,
      socialMedia: [...prev.socialMedia, { platform: '', username: '', isPrimary: false }]
    }))
  }

  const removeSocialMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.filter((_, i) => i !== index)
    }))
  }

  const updateSocialMedia = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.map((social, i) => 
        i === index ? { ...social, [field]: value } : social
      )
    }))
  }

  const setPrimarySocialMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.map((social, i) => ({
        ...social,
        isPrimary: i === index
      }))
    }))
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Create New Company
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
                      errors.name ? "border-red-300" : "border-gray-300"
                    )}
                    placeholder="Enter company name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateFormData('website', e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
                      errors.website ? "border-red-300" : "border-gray-300"
                    )}
                    placeholder="https://example.com"
                  />
                  {errors.website && (
                    <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => updateFormData('domain', e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
                      errors.domain ? "border-red-300" : "border-gray-300"
                    )}
                    placeholder="example.com"
                  />
                  {errors.domain && (
                    <p className="mt-1 text-sm text-red-600">{errors.domain}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revenue
                  </label>
                  <input
                    type="number"
                    value={formData.revenue || ''}
                    onChange={(e) => updateFormData('revenue', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <select
                    value={formData.industryId}
                    onChange={(e) => updateFormData('industryId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select Industry</option>
                    <option value="tech">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size
                  </label>
                  <select
                    value={formData.sizeId}
                    onChange={(e) => updateFormData('sizeId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select Size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Email Addresses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Email Addresses</h3>
                <button
                  type="button"
                  onClick={addEmailAddress}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  + Add Email
                </button>
              </div>
              
              {errors.emailAddresses && (
                <p className="text-sm text-red-600">{errors.emailAddresses}</p>
              )}

              {formData.emailAddresses.map((email, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={email.email}
                    onChange={(e) => updateEmailAddress(index, 'email', e.target.value)}
                    className={cn(
                      "flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
                      errors[`emailAddresses.${index}.email`] ? "border-red-300" : "border-gray-300"
                    )}
                    placeholder="email@example.com"
                  />
                  <button
                    type="button"
                    onClick={() => setPrimaryEmail(index)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-md",
                      email.isPrimary
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    Primary
                  </button>
                  {formData.emailAddresses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmailAddress(index)}
                      className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Phone Numbers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Phone Numbers</h3>
                <button
                  type="button"
                  onClick={addPhoneNumber}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  + Add Phone
                </button>
              </div>
              
              {errors.phoneNumbers && (
                <p className="text-sm text-red-600">{errors.phoneNumbers}</p>
              )}

              {formData.phoneNumbers.map((phone, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="tel"
                    value={phone.number}
                    onChange={(e) => updatePhoneNumber(index, 'number', e.target.value)}
                    className={cn(
                      "flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
                      errors[`phoneNumbers.${index}.number`] ? "border-red-300" : "border-gray-300"
                    )}
                    placeholder="+1 (555) 123-4567"
                  />
                  <input
                    type="text"
                    value={phone.extension || ''}
                    onChange={(e) => updatePhoneNumber(index, 'extension', e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Ext"
                  />
                  <button
                    type="button"
                    onClick={() => setPrimaryPhone(index)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-md",
                      phone.isPrimary
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    Primary
                  </button>
                  {formData.phoneNumbers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhoneNumber(index)}
                      className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Addresses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Addresses</h3>
                <button
                  type="button"
                  onClick={addAddress}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  + Add Address
                </button>
              </div>

              {formData.addresses.map((address, index) => (
                <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={address.street1 || ''}
                      onChange={(e) => updateAddress(index, 'street1', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Street Address"
                    />
                    <input
                      type="text"
                      value={address.street2 || ''}
                      onChange={(e) => updateAddress(index, 'street2', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Suite, Apt, etc."
                    />
                    <input
                      type="text"
                      value={address.city || ''}
                      onChange={(e) => updateAddress(index, 'city', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={address.state || ''}
                      onChange={(e) => updateAddress(index, 'state', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="State/Province"
                    />
                    <input
                      type="text"
                      value={address.postalCode || ''}
                      onChange={(e) => updateAddress(index, 'postalCode', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Postal Code"
                    />
                    <input
                      type="text"
                      value={address.country || ''}
                      onChange={(e) => updateAddress(index, 'country', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Country"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPrimaryAddress(index)}
                      className={cn(
                        "px-3 py-2 text-sm rounded-md",
                        address.isPrimary
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      Primary Address
                    </button>
                    {formData.addresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAddress(index)}
                        className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Social Media</h3>
                <button
                  type="button"
                  onClick={addSocialMedia}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  + Add Social Media
                </button>
              </div>

              {formData.socialMedia.map((social, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <select
                    value={social.platform}
                    onChange={(e) => updateSocialMedia(index, 'platform', e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Platform</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="text"
                    value={social.username}
                    onChange={(e) => updateSocialMedia(index, 'username', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Username"
                  />
                  <button
                    type="button"
                    onClick={() => setPrimarySocialMedia(index)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-md",
                      social.isPrimary
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    Primary
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSocialMedia(index)}
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Company'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
