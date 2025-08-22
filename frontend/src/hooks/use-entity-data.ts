import { useCallback } from 'react'
import { QueryConfig, PaginatedResponse, EntityRecord } from '@/types/entity'
import { apiClient } from '@/lib/api-client'

// Fake data generators for development
const generateFakeContacts = (count: number): EntityRecord[] => {
  const contacts = []
  for (let i = 1; i <= count; i++) {
    contacts.push({
      id: `contact_${i}`,
      firstName: `John${i}`,
      lastName: `Doe${i}`,
      email: `john.doe${i}@example.com`,
      phone: `+1-555-${String(i).padStart(3, '0')}-${String(i).padStart(4, '0')}`,
      company: `Company ${i}`,
      status: ['Active', 'Inactive', 'Lead', 'Customer', 'Prospect'][i % 5],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  return contacts
}

const generateFakeCompanies = (count: number): EntityRecord[] => {
  const companies = []
  const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Other']
  for (let i = 1; i <= count; i++) {
    companies.push({
      id: `company_${i}`,
      name: `Company ${i}`,
      industry: industries[i % industries.length],
      website: `https://company${i}.com`,
      phone: `+1-555-${String(i).padStart(3, '0')}-${String(i).padStart(4, '0')}`,
      address: `${i} Main St, City ${i}, State`,
      status: ['Active', 'Inactive', 'Prospect', 'Customer', 'Partner'][i % 5],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  return companies
}

const generateFakeLeads = (count: number): EntityRecord[] => {
  const leads = []
  const sources = ['Website', 'Referral', 'Cold Call', 'Trade Show', 'Social Media', 'Other']
  const statuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
  for (let i = 1; i <= count; i++) {
    leads.push({
      id: `lead_${i}`,
      firstName: `Lead${i}`,
      lastName: `Smith${i}`,
      email: `lead.smith${i}@example.com`,
      company: `Lead Company ${i}`,
      source: sources[i % sources.length],
      status: statuses[i % statuses.length],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  return leads
}

const generateFakeDeals = (count: number): EntityRecord[] => {
  const deals = []
  const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
  for (let i = 1; i <= count; i++) {
    deals.push({
      id: `deal_${i}`,
      name: `Deal ${i}`,
      contact: `Contact ${i}`,
      company: `Company ${i}`,
      amount: Math.floor(Math.random() * 100000) + 1000,
      stage: stages[i % stages.length],
      closeDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  return deals
}

const generateFakeData = (entityType: string, count: number): EntityRecord[] => {
  switch (entityType) {
    case 'contacts':
      return generateFakeContacts(count)
    case 'companies':
      return generateFakeCompanies(count)
    case 'leads':
      return generateFakeLeads(count)
    case 'deals':
      return generateFakeDeals(count)
    default:
      return []
  }
}

// Simple filter implementation for fake data
const applyFilters = (data: EntityRecord[], filters: any[]): EntityRecord[] => {
  return data.filter(record => {
    return filters.every(filter => {
      const value = record[filter.field]
      
      switch (filter.operator) {
        case 'equals':
          return value === filter.value
        case 'not_equals':
          return value !== filter.value
        case 'contains':
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
        case 'not_contains':
          return !String(value).toLowerCase().includes(String(filter.value).toLowerCase())
        case 'starts_with':
          return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase())
        case 'ends_with':
          return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase())
        case 'greater_than':
          return Number(value) > Number(filter.value)
        case 'less_than':
          return Number(value) < Number(filter.value)
        case 'greater_than_or_equal':
          return Number(value) >= Number(filter.value)
        case 'less_than_or_equal':
          return Number(value) <= Number(filter.value)
        case 'between':
          const [min, max] = filter.value
          return Number(value) >= Number(min) && Number(value) <= Number(max)
        case 'in':
          const values = Array.isArray(filter.value) ? filter.value : filter.value.split(',').map(v => v.trim())
          return values.includes(value)
        case 'not_in':
          const notValues = Array.isArray(filter.value) ? filter.value : filter.value.split(',').map(v => v.trim())
          return !notValues.includes(value)
        case 'is_null':
          return value === null || value === undefined || value === ''
        case 'is_not_null':
          return value !== null && value !== undefined && value !== ''
        default:
          return true
      }
    })
  })
}

// Simple search implementation for fake data
const applySearch = (data: EntityRecord[], search: string): EntityRecord[] => {
  if (!search) return data
  
  const searchLower = search.toLowerCase()
  return data.filter(record => {
    return Object.values(record).some(value => 
      String(value).toLowerCase().includes(searchLower)
    )
  })
}

// Simple sort implementation for fake data
const applySort = (data: EntityRecord[], sort: any): EntityRecord[] => {
  if (!sort.field) return data
  
  return [...data].sort((a, b) => {
    const aValue = a[sort.field]
    const bValue = b[sort.field]
    
    if (aValue === bValue) return 0
    
    let comparison = 0
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue)
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime()
    } else {
      comparison = String(aValue).localeCompare(String(bValue))
    }
    
    return sort.direction === 'asc' ? comparison : -comparison
  })
}

export function useEntityData() {
  const fetchEntityData = useCallback(async (
    entityType: string, 
    queryConfig: QueryConfig
  ): Promise<PaginatedResponse<EntityRecord>> => {
    try {
      return await apiClient.getEntityData(entityType, queryConfig)
    } catch (error) {
      // Fallback to fake data if API fails
      console.warn('API call failed, using fake data:', error)
      
      // Generate fake data
      const allData = generateFakeData(entityType, 1000) // Generate 1000 records
      
      // Apply filters
      let filteredData = applyFilters(allData, queryConfig.filters)
      
      // Apply search
      filteredData = applySearch(filteredData, queryConfig.search || '')
      
      // Apply sort
      filteredData = applySort(filteredData, queryConfig.sort)
      
      // Apply pagination
      const total = filteredData.length
      const startIndex = (queryConfig.page - 1) * queryConfig.pageSize
      const endIndex = startIndex + queryConfig.pageSize
      const paginatedData = filteredData.slice(startIndex, endIndex)
      
      // Select only requested fields
      const selectedData = paginatedData.map(record => {
        if (queryConfig.fields.length === 0) return record
        
        const selectedRecord: EntityRecord = { id: record.id }
        queryConfig.fields.forEach(field => {
          if (record.hasOwnProperty(field)) {
            selectedRecord[field] = record[field]
          }
        })
        return selectedRecord
      })
      
      return {
        data: selectedData,
        pagination: {
          page: queryConfig.page,
          pageSize: queryConfig.pageSize,
          total,
          totalPages: Math.ceil(total / queryConfig.pageSize),
          hasNext: queryConfig.page < Math.ceil(total / queryConfig.pageSize),
          hasPrevious: queryConfig.page > 1
        }
      }
    }
  }, [])

  return {
    fetchEntityData
  }
}
