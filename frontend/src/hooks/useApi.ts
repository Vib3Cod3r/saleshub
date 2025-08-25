import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { APIResponse, PaginatedResponse, PaginationParams } from '@/types/api';

// Generic query hook
export function useQueryData<T>(
  key: string[],
  endpoint: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<T> => {
      const response = await api.request(endpoint);
      return response.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}

// Generic mutation hook
export function useMutationData<TData, TVariables>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options?: {
    invalidateQueries?: string[];
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      const response = await api.request(endpoint, {
        method,
        body: JSON.stringify(variables),
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

// Paginated query hook
export function usePaginatedQuery<T>(
  key: string[],
  endpoint: string,
  params: PaginationParams = {},
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const queryString = new URLSearchParams({
    page: params.page?.toString() ?? '1',
    limit: params.limit?.toString() ?? '10',
    ...(params.sortBy && { sortBy: params.sortBy }),
    ...(params.sortOrder && { sortOrder: params.sortOrder }),
  }).toString();

  return useQuery({
    queryKey: [...key, params],
    queryFn: async (): Promise<PaginatedResponse<T>> => {
      const response = await api.request(`${endpoint}?${queryString}`);
      return response;
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
  });
}

// Health check hook
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await api.health();
      return response;
    },
    refetchInterval: 30000, // Check every 30 seconds
    refetchOnWindowFocus: true,
  });
}
