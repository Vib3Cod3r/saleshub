import { useState, useCallback } from 'react'
import { EntitySpecification } from '@/types/entity'
import { apiClient } from '@/lib/api-client'

// Fake entity specifications for development
const fakeEntitySpecs: Record<string, EntitySpecification> = {
  contacts: {
    id: 'contacts',
    name: 'contacts',
    displayName: 'Contacts',
    description: 'Manage your contacts and their information',
    fields: [
      {
        id: 'id',
        name: 'id',
        displayName: 'ID',
        type: 'text',
        required: true,
        sortable: true,
        filterable: true,
        searchable: true
      },
      {
        id: 'firstName',
        name: 'firstName',
        displayName: 'First Name',
        type: 'text',
        required: true,
        sortable: true,
        filterable: true,
        searchable: true,
        validation: { minLength: 1, maxLength: 50 }
      },
      {
        id: 'lastName',
        name: 'lastName',
        displayName: 'Last Name',
        type: 'text',
        required: true,
        sortable: true,
        filterable: true,
        searchable: true,
        validation: { minLength: 1, maxLength: 50 }
      },
      {
        id: 'email',
        name: 'email',
        displayName: 'Email',
        type: 'email',
        required: false,
        sortable: true,
        filterable: true,
        searchable: true
      },
      {
        id: 'phone',
        name: 'phone',
        displayName: 'Phone',
        type: 'phone',
        required: false,
        sortable: true,
        filterable: true,
        searchable: true
      },
      {
        id: 'company',
        name: 'company',
        displayName: 'Company',
        type: 'relationship',
        required: false,
        sortable: true,
        filterable: true,
        searchable: true,
        relationshipEntity: 'companies'
      },
      {
        id: 'createdAt',
        name: 'createdAt',
        displayName: 'Created Date',
        type: 'date',
        required: false,
        sortable: true,
        filterable: true,
        searchable: false
      },
      {
        id: 'status',
        name: 'status',
        displayName: 'Status',
        type: 'picklist',
        required: false,
        sortable: true,
        filterable: true,
        searchable: true,
        picklistOptions: ['Active', 'Inactive', 'Lead', 'Customer', 'Prospect']
      }
    ],
    defaultFields: ['firstName', 'lastName', 'email', 'company', 'status'],
    defaultSortField: 'lastName',
    defaultSortDirection: 'asc',
    defaultPageSize: 50,
    maxPageSize: 200,
    supportsBulkActions: true,
    supportsExport: true,
    supportsImport: true
  },
  companies: {
    id: 'companies',
    name: 'companies',
    displayName: 'Companies',
    description: 'Manage your company information',
    fields: [
      {
        id: 'id',
        name: 'id',
        displayName: 'ID',
        type: 'text',
        required: true,
        sortable: true,
        filterable: true,
        searchable: true
      },
      {
        id: 'name',
        name: 'name',
        displayName: 'Company Name',
        type: 'text',
        required: true,
        sortable: true,
        filterable: true,
        searchable: true,
        validation: { minLength: 1, maxLength: 100 }
      },
      {
        id: 'industry',
        name: 'industry',
        displayName: 'Industry',
        type: 'picklist',
        required: false,
        sortable: true,
        filterable: true,
        searchable: true,
        picklistOptions: ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Other']
      },
      {
        id: 'website',
        name: 'website',
        displayName: 'Website',
        type: 'text',
        required: false,
        sortable: true,
        filterable: true,
        searchable: true
      },
      {
        id: 'phone',
        name: 'phone',
        displayName: 'Phone',
        type: 'phone',
        required: false,
        sortable: true,
        filterable: true,
        searchable: true
      },
      {
        id: 'address',
        name: 'address',
        displayName: 'Address',
        type: 'text',
        required: false,
        sortable: false,
        filterable: true,
        searchable: true
      },
      {
        id: 'createdAt',
        name: 'createdAt',
        displayName: 'Created Date',
        type: 'date',
        required: false,
        sortable: true,
        filterable: true,
        searchable: false
      },
      {
        id: 'status',
        name: 'status',
        displayName: 'Status',
        type: 'picklist',
        required: false,
        sortable: true,
        filterable: true,
        searchable: true,
        picklistOptions: ['Active', 'Inactive', 'Prospect', 'Customer', 'Partner']
      }
    ],
    defaultFields: ['name', 'industry', 'website', 'phone', 'status'],
    defaultSortField: 'name',
    defaultSortDirection: 'asc',
    defaultPageSize: 50,
    maxPageSize: 200,
    supportsBulkActions: true,
    supportsExport: true,
    supportsImport: true
  },
  leads: {
    id: 'leads',
    name: 'leads',
    displayName: 'Leads',
    description: 'Manage your sales leads',
    fields: [
      {
        id: 'id',
        name: 'id',
        displayName: 'ID',
        type: 'text',
        required: true,
        sortable: true,
        filterable: true,
        searchable: true
      },
      {
        id: 'firstName',
        name: 'firstName',
        displayName: 'First Name',
        type: 'text',
        required: true,
        sortable: true,
        filterable: true,
        searchable: true
      },
      {
        id: 'lastName',
        name: 'lastName',
        displayName: 'Last Name',
        type: 'text',
        required: true,
        sortable: true,
        filterable: true,
        searchable: true
      },
      {
        id: 'email',
        name: 'email',
        displayName: 'Email',
        type: 'email',
        required: false,
        sortable: true,
        filterable: true,
        searchable: true
      },
      {
        id: 'company',
        name: 'company',
        displayName: 'Company',
        type: 'text',
        required: false,
        sortable: true,
        filterable: true,
        searchable: true
      },
      {
        id: 'source',
        name: 'source',
        displayName: 'Lead Source',
        type: 'picklist',
        required: false,
        sortable: true,
        filterable: true,
        searchable: true,
        picklistOptions: ['Website', 'Referral', 'Cold Call', 'Trade Show', 'Social Media', 'Other']
      },
      {
        id: 'status',
        name: 'status',
        displayName: 'Status',
        type: 'picklist',
        required: false,
        sortable: true,
        filterable: true,
        searchable: true,
        picklistOptions: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
      },
      {
        id: 'createdAt',
        name: 'createdAt',
        displayName: 'Created Date',
        type: 'date',
        required: false,
        sortable: true,
        filterable: true,
        searchable: false
      }
    ],
    defaultFields: ['firstName', 'lastName', 'email', 'company', 'source', 'status'],
    defaultSortField: 'createdAt',
    defaultSortDirection: 'desc',
    defaultPageSize: 50,
    maxPageSize: 200,
    supportsBulkActions: true,
    supportsExport: true,
    supportsImport: true
  },
  deals: {
    id: 'deals',
    name: 'deals',
    displayName: 'Deals',
    description: 'Manage your sales deals and opportunities',
    fields: [
      {
        id: 'id',
        name: 'id',
        displayName: 'ID',
        type: 'text',
        required: true,
        sortable: true,
        filterable: true,
        searchable: true
      },
      {
        id: 'name',
        name: 'name',
        displayName: 'Deal Name',
        type: 'text',
        required: true,
        sortable: true,
        filterable: true,
        searchable: true
      },
      {
        id: 'contact',
        name: 'contact',
        displayName: 'Contact',
        type: 'relationship',
        required: false,
        sortable: true,
        filterable: true,
        searchable: true,
        relationshipEntity: 'contacts'
      },
      {
        id: 'company',
        name: 'company',
        displayName: 'Company',
        type: 'relationship',
        required: false,
        sortable: true,
        filterable: true,
        searchable: true,
        relationshipEntity: 'companies'
      },
      {
        id: 'amount',
        name: 'amount',
        displayName: 'Amount',
        type: 'number',
        required: false,
        sortable: true,
        filterable: true,
        searchable: false
      },
      {
        id: 'stage',
        name: 'stage',
        displayName: 'Stage',
        type: 'picklist',
        required: false,
        sortable: true,
        filterable: true,
        searchable: true,
        picklistOptions: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
      },
      {
        id: 'closeDate',
        name: 'closeDate',
        displayName: 'Close Date',
        type: 'date',
        required: false,
        sortable: true,
        filterable: true,
        searchable: false
      },
      {
        id: 'createdAt',
        name: 'createdAt',
        displayName: 'Created Date',
        type: 'date',
        required: false,
        sortable: true,
        filterable: true,
        searchable: false
      }
    ],
    defaultFields: ['name', 'contact', 'company', 'amount', 'stage', 'closeDate'],
    defaultSortField: 'closeDate',
    defaultSortDirection: 'asc',
    defaultPageSize: 50,
    maxPageSize: 200,
    supportsBulkActions: true,
    supportsExport: true,
    supportsImport: true
  }
}

export function useEntitySpecification() {
  const [specs] = useState(fakeEntitySpecs)

  const getEntitySpecification = useCallback(async (entityType: string): Promise<EntitySpecification> => {
    try {
      return await apiClient.getEntitySpecification(entityType)
    } catch (error) {
      // Fallback to fake data if API fails
      console.warn('API call failed, using fake data:', error)
      const spec = specs[entityType]
      if (!spec) {
        throw new Error(`Entity specification not found for type: ${entityType}`)
      }
      return spec
    }
  }, [specs])

  const getAllEntityTypes = useCallback((): string[] => {
    return Object.keys(specs)
  }, [specs])

  return {
    getEntitySpecification,
    getAllEntityTypes
  }
}
