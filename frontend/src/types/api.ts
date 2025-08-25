export * from '../../../shared/types/api';
export * from '../../../shared/types/auth';
export * from '../../../shared/types/crm';

// Frontend-specific types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: ApiError | null;
}

export interface QueryResult<T> extends LoadingState {
  data: T | null;
  refetch: () => void;
}
