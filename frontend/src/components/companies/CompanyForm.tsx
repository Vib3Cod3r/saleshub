'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import type { Company } from '@/types/crm'

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  size: z.enum(['small', 'medium', 'large']).optional(),
  status: z.enum(['active', 'inactive', 'prospect']),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanyFormProps {
  company?: Company
  onSubmit: (data: CompanyFormData) => void
  onCancel: () => void
  loading?: boolean
}

export function CompanyForm({ 
  company, 
  onSubmit, 
  onCancel,
  loading = false
}: CompanyFormProps) {
  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: company || {
      name: '',
      industry: '',
      website: '',
      size: 'medium',
      status: 'active',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    },
  })

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Company Name"
              {...form.register('name')}
              error={form.formState.errors.name?.message}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Industry"
                {...form.register('industry')}
                error={form.formState.errors.industry?.message}
              />
              <Input
                label="Website"
                type="url"
                {...form.register('website')}
                error={form.formState.errors.website?.message}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Size
                </label>
                <select
                  {...form.register('size')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="small">Small (1-50 employees)</option>
                  <option value="medium">Medium (51-500 employees)</option>
                  <option value="large">Large (500+ employees)</option>
                </select>
                {form.formState.errors.size && (
                  <p className="text-sm text-error-600 mt-1">{form.formState.errors.size.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...form.register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="prospect">Prospect</option>
                </select>
                {form.formState.errors.status && (
                  <p className="text-sm text-error-600 mt-1">{form.formState.errors.status.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Street Address"
              {...form.register('address.street')}
              error={form.formState.errors.address?.street?.message}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City"
                {...form.register('address.city')}
                error={form.formState.errors.address?.city?.message}
              />
              <Input
                label="State/Province"
                {...form.register('address.state')}
                error={form.formState.errors.address?.state?.message}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="ZIP/Postal Code"
                {...form.register('address.zipCode')}
                error={form.formState.errors.address?.zipCode?.message}
              />
              <Input
                label="Country"
                {...form.register('address.country')}
                error={form.formState.errors.address?.country?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {company ? 'Update Company' : 'Create Company'}
          </Button>
        </div>
      </form>
    </div>
  )
}
