// API Configuration and Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'SALES_REP' | 'SALES_MANAGER' | 'ADMIN';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  leadSource?: string;
  leadStatus: string;
  notes?: string;
  lastContactDate?: string;
  createdAt: string;
  updatedAt: string;
  assignedToId?: string;
  assignedTo?: User;
  deals?: Deal[];
  _count?: {
    communications: number;
    tasks: number;
  };
}

export interface Deal {
  id: string;
  title: string;
  description?: string;
  value?: number;
  probability?: number;
  stage: string;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  contactId: string;
  contact: Contact;
  assignedToId?: string;
  assignedTo?: User;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  contactId?: string;
  contact?: Contact;
  dealId?: string;
  deal?: Deal;
  assignedToId?: string;
  assignedTo?: User;
}

export interface Communication {
  id: string;
  type: string;
  direction: string;
  subject?: string;
  content?: string;
  outcome?: string;
  scheduledDate?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  contactId?: string;
  contact?: Contact;
  dealId?: string;
  deal?: Deal;
  assignedToId?: string;
  assignedTo?: User;
}

// API Client
class APIClient {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089/api';
    this.token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  }

  setToken = (token: string | null) => {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }

  hasToken = () => {
    return !!this.token;
  }

  private getHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle 401 errors gracefully for authentication checks
        if (response.status === 401) {
          this.setToken(null);
          throw new Error('Authentication required');
        }
        
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      
      // Handle unauthorized requests
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('Invalid or expired token'))) {
        this.setToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      
      throw error;
    }
  }

  // Authentication endpoints
  login = async (credentials: { email: string; password: string }) => {
    const response = await this.request<{ data: { token: string; user: User }; success: boolean; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  register = async (userData: { firstName: string; lastName: string; email: string; username: string; password: string }) => {
    const response = await this.request<{ data: { token: string; user: User }; success: boolean; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  logout = async () => {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  getCurrentUser = async () => {
    try {
      return await this.request<User>('/auth/me');
    } catch (error) {
      // Return null for authentication errors instead of throwing
      if (error instanceof Error && error.message.includes('Authentication required')) {
        return null;
      }
      throw error;
    }
  }

  // Contacts endpoints
  getContacts = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    leadStatus?: string;
    leadSource?: string;
    assignedTo?: string;
    tab?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request<{
      contacts: Contact[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/contacts?${searchParams.toString()}`);
  }

  getContact = async (id: string) => {
    return this.request<Contact>(`/contacts/${id}`);
  }

  createContact = async (contactData: Partial<Contact>) => {
    return this.request<Contact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  updateContact = async (id: string, contactData: Partial<Contact>) => {
    return this.request<Contact>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  deleteContact = async (id: string) => {
    return this.request(`/contacts/${id}`, { method: 'DELETE' });
  }

  // Deals endpoints
  getDeals = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    stage?: string;
    assignedTo?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request<{
      deals: Deal[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/deals?${searchParams.toString()}`);
  }

  getDeal = async (id: string) => {
    return this.request<Deal>(`/deals/${id}`);
  }

  createDeal = async (dealData: Partial<Deal>) => {
    return this.request<Deal>('/deals', {
      method: 'POST',
      body: JSON.stringify(dealData),
    });
  }

  updateDeal = async (id: string, dealData: Partial<Deal>) => {
    return this.request<Deal>(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dealData),
    });
  }

  deleteDeal = async (id: string) => {
    return this.request(`/deals/${id}`, { method: 'DELETE' });
  }

  // Tasks endpoints
  getTasks = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request<{
      tasks: Task[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/tasks?${searchParams.toString()}`);
  }

  getTask = async (id: string) => {
    return this.request<Task>(`/tasks/${id}`);
  }

  createTask = async (taskData: Partial<Task>) => {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  updateTask = async (id: string, taskData: Partial<Task>) => {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  deleteTask = async (id: string) => {
    return this.request(`/tasks/${id}`, { method: 'DELETE' });
  }

  // Dashboard endpoints
  getDashboardOverview = async (period = '30') => {
    return this.request(`/dashboard/overview?period=${period}`);
  }

  getRevenueChart = async (period = '12') => {
    return this.request(`/dashboard/revenue?period=${period}`);
  }

  getPipelineMetrics = async () => {
    return this.request('/deals/pipeline');
  }

  getRecentSales = async (limit = 5) => {
    return this.request(`/deals/recent?limit=${limit}`);
  }

  getTopPerformers = async (period = '30') => {
    return this.request(`/dashboard/performers?period=${period}`);
  }
}

// Create global API instance
export const api = new APIClient(); 