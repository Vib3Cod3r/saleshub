const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089'

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available (only in browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      }
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getProfile() {
    return this.request('/api/auth/me')
  }

  // Companies endpoints
  async getCompanies(params?: {
    page?: number
    limit?: number
    search?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)

    const query = searchParams.toString()
    return this.request<PaginatedResponse<any>>(`/api/crm/companies${query ? `?${query}` : ''}`)
  }

  async getCompany(id: string) {
    return this.request(`/api/crm/companies/${id}`)
  }

  async createCompany(companyData: any) {
    return this.request('/api/crm/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    })
  }

  async updateCompany(id: string, companyData: any) {
    return this.request(`/api/crm/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    })
  }

  async deleteCompany(id: string) {
    return this.request(`/api/crm/companies/${id}`, {
      method: 'DELETE',
    })
  }

  // Contacts endpoints
  async getContacts(params?: {
    page?: number
    limit?: number
    search?: string
    companyId?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.companyId) searchParams.append('companyId', params.companyId)

    const query = searchParams.toString()
    return this.request<PaginatedResponse<any>>(`/api/crm/contacts${query ? `?${query}` : ''}`)
  }

  async getContact(id: string) {
    return this.request(`/api/crm/contacts/${id}`)
  }

  async createContact(contactData: any) {
    return this.request('/api/crm/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    })
  }

  async updateContact(id: string, contactData: any) {
    return this.request(`/api/crm/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    })
  }

  async deleteContact(id: string) {
    return this.request(`/api/crm/contacts/${id}`, {
      method: 'DELETE',
    })
  }

  // Leads endpoints
  async getLeads(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)

    const query = searchParams.toString()
    return this.request<PaginatedResponse<any>>(`/api/crm/leads${query ? `?${query}` : ''}`)
  }

  async getLead(id: string) {
    return this.request(`/api/crm/leads/${id}`)
  }

  async createLead(leadData: any) {
    return this.request('/api/crm/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    })
  }

  async updateLead(id: string, leadData: any) {
    return this.request(`/api/crm/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    })
  }

  async deleteLead(id: string) {
    return this.request(`/api/crm/leads/${id}`, {
      method: 'DELETE',
    })
  }

  // Deals endpoints
  async getDeals(params?: {
    page?: number
    limit?: number
    search?: string
    pipelineId?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.pipelineId) searchParams.append('pipelineId', params.pipelineId)

    const query = searchParams.toString()
    return this.request<PaginatedResponse<any>>(`/api/crm/deals${query ? `?${query}` : ''}`)
  }

  async getDeal(id: string) {
    return this.request(`/api/crm/deals/${id}`)
  }

  async createDeal(dealData: any) {
    return this.request('/api/crm/deals', {
      method: 'POST',
      body: JSON.stringify(dealData),
    })
  }

  async updateDeal(id: string, dealData: any) {
    return this.request(`/api/crm/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dealData),
    })
  }

  async deleteDeal(id: string) {
    return this.request(`/api/crm/deals/${id}`, {
      method: 'DELETE',
    })
  }

  // Tasks endpoints
  async getTasks(params?: {
    page?: number
    limit?: number
    search?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)

    const query = searchParams.toString()
    return this.request<PaginatedResponse<any>>(`/api/crm/tasks${query ? `?${query}` : ''}`)
  }

  async getTask(id: string) {
    return this.request(`/api/crm/tasks/${id}`)
  }

  async createTask(taskData: any) {
    return this.request('/api/crm/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    })
  }

  async updateTask(id: string, taskData: any) {
    return this.request(`/api/crm/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    })
  }

  async deleteTask(id: string) {
    return this.request(`/api/crm/tasks/${id}`, {
      method: 'DELETE',
    })
  }

  // Lookups endpoints
  async getLeadStatuses() {
    return this.request('/api/lookups/lead-statuses')
  }

  async getLeadTemperatures() {
    return this.request('/api/lookups/lead-temperatures')
  }

  async getIndustries() {
    return this.request('/api/lookups/industries')
  }

  async getCompanySizes() {
    return this.request('/api/lookups/company-sizes')
  }

  async getTaskTypes() {
    return this.request('/api/lookups/task-types')
  }

  async getCommunicationTypes() {
    return this.request('/api/lookups/communication-types')
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
