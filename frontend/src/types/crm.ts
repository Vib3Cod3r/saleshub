export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  title?: string
  companyId?: string
  company?: Company
  status: 'active' | 'inactive' | 'lead'
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  industry?: string
  website?: string
  size?: 'small' | 'medium' | 'large'
  status: 'active' | 'inactive' | 'prospect'
  address?: Address
  contacts: Contact[]
  deals: Deal[]
  createdAt: string
  updatedAt: string
}

export interface Address {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface Deal {
  id: string
  title: string
  value: number
  stage: 'lead' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
  probability: number
  expectedCloseDate?: string
  contactId?: string
  contact?: Contact
  companyId?: string
  company?: Company
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ContactFilters {
  search?: string
  status?: string
  companyId?: string
  tags?: string[]
}

export interface CompanyFilters {
  search?: string
  status?: string
  industry?: string
  size?: string
}

export interface DashboardStats {
  totalContacts: number
  totalCompanies: number
  totalDeals: number
  totalRevenue: number
  contactsGrowth: number
  companiesGrowth: number
  dealsGrowth: number
  revenueGrowth: number
}

export interface Activity {
  id: string
  type: 'contact_created' | 'deal_won' | 'task_completed' | 'company_created'
  title: string
  description: string
  userId: string
  user: User
  timestamp: string
  metadata?: Record<string, any>
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'user'
  avatar?: string
  tenantId: string
}
