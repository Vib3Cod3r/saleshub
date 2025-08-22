import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Lean API client
const API_BASE = 'http://localhost:8089/api'

export const apiClient = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token')
    
    // Don't make API calls if no token is present
    if (!token) {
      throw new Error('No authentication token found')
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`
      
      // Log error for tracking
      if (typeof window !== 'undefined' && window.errorAnalysis) {
        window.errorAnalysis.logInternalServer?.(errorMessage, {
          endpoint,
          status: response.status,
          data
        })
      }
      
      throw new Error(errorMessage)
    }
    
    return response.json()
  },

  crm: {
    companies: (limit = 5) => apiClient.fetch(`/crm/companies?limit=${limit}`),
    contacts: (limit = 5) => apiClient.fetch(`/crm/contacts?limit=${limit}`),
    leads: (limit = 5) => apiClient.fetch(`/crm/leads?limit=${limit}`),
    deals: (limit = 5) => apiClient.fetch(`/crm/deals?limit=${limit}`),
  }
}
