import { Contact, Company, DashboardStats, Activity, User } from '../types/crm'

// Contact test data factory
export const createMockContact = (overrides: Partial<Contact> = {}): Contact => ({
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  company: createMockCompany(),
  tags: ['lead'],
  status: 'active',
  notes: 'Test contact notes',
  createdAt: new Date('2024-12-19T10:00:00Z').toISOString(),
  updatedAt: new Date('2024-12-19T10:00:00Z').toISOString(),
  ...overrides,
})

// Company test data factory
export const createMockCompany = (overrides: Partial<Company> = {}): Company => ({
  id: '1',
  name: 'Test Company',
  industry: 'Technology',
  website: 'https://example.com',
  size: 'medium',
  status: 'active',
  address: {
    street: '123 Test Street',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'Test Country',
  },
  contacts: [],
  deals: [],
  createdAt: new Date('2024-12-19T10:00:00Z').toISOString(),
  updatedAt: new Date('2024-12-19T10:00:00Z').toISOString(),
  ...overrides,
})

// Dashboard stats test data factory
export const createMockDashboardStats = (overrides: Partial<DashboardStats> = {}): DashboardStats => ({
  totalContacts: 1250,
  totalCompanies: 89,
  totalDeals: 234,
  totalRevenue: 1250000,
  contactsGrowth: 12.5,
  companiesGrowth: 8.2,
  dealsGrowth: 15.7,
  revenueGrowth: 23.4,
  ...overrides,
})

// Activity test data factory
export const createMockActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: '1',
  type: 'contact_created',
  title: 'New contact created',
  description: 'New contact John Doe added',
  userId: '1',
  user: createMockUser(),
  timestamp: new Date('2024-12-19T10:00:00Z').toISOString(),
  metadata: {},
  ...overrides,
})

// User test data factory
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  avatar: 'https://example.com/avatar.jpg',
  tenantId: 'tenant-1',
  ...overrides,
})

// Multiple contacts test data
export const createMockContacts = (count: number = 5): Contact[] => {
  return Array.from({ length: count }, (_, i) => 
    createMockContact({
      id: `contact-${i + 1}`,
      firstName: `Contact ${i + 1}`,
      lastName: 'Test',
      email: `contact${i + 1}@example.com`,
    })
  )
}

// Multiple companies test data
export const createMockCompanies = (count: number = 5): Company[] => {
  return Array.from({ length: count }, (_, i) => 
    createMockCompany({
      id: `company-${i + 1}`,
      name: `Test Company ${i + 1}`,
      industry: ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail'][i % 5],
    })
  )
}

// Multiple activities test data
export const createMockActivities = (count: number = 10): Activity[] => {
  const activityTypes: Array<'contact_created' | 'deal_won' | 'task_completed' | 'company_created'> = ['contact_created', 'deal_won', 'task_completed', 'company_created']
  const descriptions = [
    'New contact added',
    'Deal won successfully',
    'Task completed',
    'New company created',
  ]
  
  return Array.from({ length: count }, (_, i) => 
    createMockActivity({
      id: `activity-${i + 1}`,
      type: activityTypes[i % activityTypes.length],
      description: descriptions[i % descriptions.length],
      timestamp: new Date(`2024-12-19T${10 - Math.floor(i / 10)}:${i % 60}:00Z`).toISOString(),
    })
  )
}

// Test data for different scenarios
export const testData = {
  // Valid contact data
  validContact: createMockContact(),
  
  // Invalid contact data (missing required fields)
  invalidContact: {
    firstName: '',
    lastName: '',
    email: 'invalid-email',
  },
  
  // Contact with company
  contactWithCompany: createMockContact({
    company: createMockCompany({ name: 'Tech Corp' }),
  }),
  
  // Contact with tags
  contactWithTags: createMockContact({
    tags: ['lead', 'vip', 'enterprise'],
  }),
  
  // Large dataset for performance testing
  largeContactList: createMockContacts(1000),
  largeCompanyList: createMockCompanies(100),
  largeActivityList: createMockActivities(100),
  
  // Dashboard data
  dashboardStats: createMockDashboardStats(),
  recentActivities: createMockActivities(20),
  
  // User data
  adminUser: createMockUser({ role: 'admin' }),
  regularUser: createMockUser({ role: 'user' }),
}

// Helper function to create test data with specific overrides
export const createTestData = {
  contact: createMockContact,
  company: createMockCompany,
  dashboardStats: createMockDashboardStats,
  activity: createMockActivity,
  user: createMockUser,
  contacts: createMockContacts,
  companies: createMockCompanies,
  activities: createMockActivities,
}
