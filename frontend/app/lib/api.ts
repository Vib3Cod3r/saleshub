const API_BASE_URL = 'http://localhost:8089/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user: any
  accessToken: string
  refreshToken: string
  error?: string
}

export interface RegisterRequest {
  email: string
  password: string
  username: string
  firstName: string
  lastName: string
  middleName?: string
  jobTitle?: string
  department?: string
  phone?: string
  mobile?: string
  timezone?: string
  locale?: string
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      }
    }

    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return data
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getProfile(): Promise<any> {
    return this.request('/auth/profile')
  }

  async getContacts(): Promise<any[]> {
    return this.request('/contacts')
  }

  async getCompanies(): Promise<any[]> {
    return this.request('/companies')
  }

  async getLeads(): Promise<any[]> {
    return this.request('/leads')
  }

  async getDeals(): Promise<any[]> {
    return this.request('/deals')
  }
}

export const apiClient = new ApiClient()
