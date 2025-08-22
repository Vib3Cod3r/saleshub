import { EntitySpecification, QueryConfig, PaginatedResponse, EntityRecord } from '@/types/entity'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089'

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Entity API methods
  async getEntitySpecification(entityType: string): Promise<EntitySpecification> {
    return this.request<EntitySpecification>(`/api/crm/entities/${entityType}/specification`)
  }

  async getEntityData(entityType: string, queryConfig: QueryConfig): Promise<PaginatedResponse<EntityRecord>> {
    return this.request<PaginatedResponse<EntityRecord>>(`/api/crm/entities/${entityType}/data`, {
      method: 'POST',
      body: JSON.stringify(queryConfig)
    })
  }

  // Legacy CRM API methods (for backward compatibility)
  async getContacts(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/api/crm/contacts${queryString}`)
  }

  async getCompanies(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/api/crm/companies${queryString}`)
  }

  async getLeads(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/api/crm/leads${queryString}`)
  }

  async getDeals(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/api/crm/deals${queryString}`)
  }

  // Auth methods
  async login(credentials: { email: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  async register(userData: { email: string; password: string; firstName: string; lastName: string }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async getProfile() {
    return this.request('/api/auth/me')
  }
}

export const apiClient = new ApiClient()
