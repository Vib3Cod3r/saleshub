import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api/client'
import { Contact, Company, DashboardStats, Activity } from '../../types/crm'

// Contact API hooks
export const useContacts = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: () => apiClient.get<Contact[]>('/contacts', { params: filters }),
  })
}

export const useCreateContact = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (contact: Partial<Contact>) => 
      apiClient.post<Contact>('/contacts', contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

export const useUpdateContact = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...contact }: Partial<Contact> & { id: string }) => 
      apiClient.put<Contact>(`/contacts/${id}`, contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

export const useDeleteContact = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

// Company API hooks
export const useCompanies = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['companies', filters],
    queryFn: () => apiClient.get<Company[]>('/companies', { params: filters }),
  })
}

export const useCreateCompany = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (company: Partial<Company>) => 
      apiClient.post<Company>('/companies', company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

export const useUpdateCompany = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...company }: Partial<Company> & { id: string }) => 
      apiClient.put<Company>(`/companies/${id}`, company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

export const useDeleteCompany = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/companies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

// Dashboard API hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.get<DashboardStats>('/dashboard/stats'),
  })
}

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => apiClient.get<Activity[]>('/dashboard/recent-activity'),
  })
}

// Generic API hooks
export const useApi = <T>(endpoint: string, options?: Record<string, unknown>) => {
  return useQuery({
    queryKey: [endpoint, options],
    queryFn: () => apiClient.get<T>(endpoint, options),
  })
}

export const useMutationApi = <T, V>(endpoint: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: V) => apiClient.post<T>(endpoint, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] })
    },
  })
}
