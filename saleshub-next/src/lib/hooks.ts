import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Contact, type Deal, type Task, type User } from './api';

// Authentication hooks
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: async () => {
      const user = await api.getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated');
      }
      return user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Don't refetch on window focus to avoid unnecessary requests
    refetchOnWindowFocus: false,
    // Don't refetch on mount if we have data
    refetchOnMount: false,
    // Only enable the query if we have a token
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('authToken'),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'current'], data.data.user);
      // Don't invalidate queries to avoid refetching
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.register,
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'current'], data.data.user);
      // Don't invalidate queries to avoid refetching
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// Contacts hooks
export function useContacts(params: {
  page?: number;
  limit?: number;
  search?: string;
  leadStatus?: string;
  leadSource?: string;
  assignedTo?: string;
  tab?: string;
} = {}) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => api.getContacts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => api.getContact(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contact> }) =>
      api.updateContact(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', id] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

// Deals hooks
export function useDeals(params: {
  page?: number;
  limit?: number;
  search?: string;
  stage?: string;
  assignedTo?: string;
} = {}) {
  return useQuery({
    queryKey: ['deals', params],
    queryFn: () => api.getDeals(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: () => api.getDeal(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Deal> }) =>
      api.updateDeal(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', id] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

// Tasks hooks
export function useTasks(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
} = {}) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => api.getTasks(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => api.getTask(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      api.updateTask(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Dashboard hooks
export function useDashboardOverview(period = '30') {
  return useQuery({
    queryKey: ['dashboard', 'overview', period],
    queryFn: () => api.getDashboardOverview(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRevenueChart(period = '12') {
  return useQuery({
    queryKey: ['dashboard', 'revenue', period],
    queryFn: () => api.getRevenueChart(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePipelineMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'pipeline'],
    queryFn: () => api.getPipelineMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRecentSales(limit = 5) {
  return useQuery({
    queryKey: ['dashboard', 'recent-sales', limit],
    queryFn: () => api.getRecentSales(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTopPerformers(period = '30') {
  return useQuery({
    queryKey: ['dashboard', 'performers', period],
    queryFn: () => api.getTopPerformers(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
} 