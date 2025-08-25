import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SearchState, SearchActions } from '../types/state';
import { searchApi } from '../services/searchApi';
import { toast } from 'react-hot-toast';

interface SearchStore extends SearchState, SearchActions {
  // Authentication state
  isAuthenticated: boolean;
  authToken: string | null;
  
  // Additional state
  lastSearchTime: number | null;
  searchPerformance: {
    averageResponseTime: number;
    cacheHitRate: number;
    successRate: number;
  };
  
  // Additional actions
  setAuthToken: (token: string) => void;
  clearAuthToken: () => void;
  authenticate: (token: string) => void;
  logout: () => void;
  updateSearchPerformance: (performance: any) => void;
}

export const useSearchStore = create<SearchStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        query: {
          text: '',
          entities: ['Contact', 'Company', 'Deal', 'Lead', 'Task'],
          filters: [],
          sortBy: 'createdAt',
          sortOrder: 'desc',
          page: 1,
          limit: 20
        },
        results: null,
        loading: false,
        error: null,
        filters: [],
        suggestions: [],
        history: [],
        
        // Authentication state
        isAuthenticated: false,
        authToken: null,
        
        // Additional state
        lastSearchTime: null,
        searchPerformance: {
          averageResponseTime: 0,
          cacheHitRate: 0,
          successRate: 0
        },

        // Basic actions
        setQuery: (query) => set((state) => ({
          query: { ...state.query, ...query }
        })),

        executeSearch: async () => {
          const { query, authToken } = get();
          
          if (!authToken) {
            set({ error: 'Authentication required' });
            toast.error('Please log in to search');
            return;
          }

          set({ loading: true, error: null });
          
          try {
            const startTime = Date.now();
            const results = await searchApi.searchWithAuth(query, authToken);
            const endTime = Date.now();
            
            set({ 
              results, 
              loading: false,
              lastSearchTime: endTime - startTime
            });
            
            get().addToHistory(query);
            
            // Update performance metrics
            if (results.metadata?.searchTime) {
              get().updateSearchPerformance({
                averageResponseTime: results.metadata.searchTime,
                cacheHitRate: (results.metadata as any).cacheHitRate || 0,
                successRate: 1.0 // Successful search
              });
            }
            
            toast.success(`Found ${results.data?.length || 0} results`);
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Search failed';
            set({
              error: errorMessage,
              loading: false
            });
            
            // Update performance metrics for failed search
            get().updateSearchPerformance({
              averageResponseTime: 0,
              cacheHitRate: 0,
              successRate: 0
            });
            
            toast.error(errorMessage);
          }
        },

        clearResults: () => set({ results: null }),

        addFilter: (filter) => set((state) => ({
          filters: [...state.filters, filter]
        })),

        removeFilter: (index) => set((state) => ({
          filters: state.filters.filter((_, i) => i !== index)
        })),

        clearFilters: () => set({ filters: [] }),

        setSuggestions: (suggestions) => set({ suggestions }),

        addToHistory: (query) => set((state) => ({
          history: [query, ...state.history.slice(0, 9)] // Keep last 10
        })),

        // Authentication actions
        setAuthToken: (token) => {
          searchApi.setToken(token);
          set({ 
            authToken: token, 
            isAuthenticated: true 
          });
        },

        clearAuthToken: () => {
          searchApi.setToken('');
          set({ 
            authToken: null, 
            isAuthenticated: false 
          });
        },

        authenticate: (token) => {
          get().setAuthToken(token);
          toast.success('Successfully authenticated');
        },

        logout: () => {
          get().clearAuthToken();
          set({ 
            results: null,
            error: null,
            history: []
          });
          toast.success('Logged out successfully');
        },

        // Performance tracking
        updateSearchPerformance: (performance) => set((state) => ({
          searchPerformance: {
            ...state.searchPerformance,
            ...performance
          }
        })),

        // Enhanced search actions
        executeFuzzySearch: async () => {
          const { query, authToken } = get();
          
          if (!authToken) {
            set({ error: 'Authentication required' });
            toast.error('Please log in to search');
            return;
          }

          set({ loading: true, error: null });
          
          try {
            const startTime = Date.now();
            const results = await searchApi.fuzzySearch(query);
            const endTime = Date.now();
            
            set({ 
              results, 
              loading: false,
              lastSearchTime: endTime - startTime
            });
            
            get().addToHistory(query);
            toast.success(`Found ${results.data?.length || 0} fuzzy results`);
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Fuzzy search failed';
            set({
              error: errorMessage,
              loading: false
            });
            toast.error(errorMessage);
          }
        },

        executeAdvancedSearch: async (options = {}) => {
          const { query, authToken } = get();
          
          if (!authToken) {
            set({ error: 'Authentication required' });
            toast.error('Please log in to search');
            return;
          }

          set({ loading: true, error: null });
          
          try {
            const startTime = Date.now();
            const results = await searchApi.advancedSearch(query, options);
            const endTime = Date.now();
            
            set({ 
              results, 
              loading: false,
              lastSearchTime: endTime - startTime
            });
            
            get().addToHistory(query);
            toast.success(`Found ${results.data?.length || 0} advanced results`);
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Advanced search failed';
            set({
              error: errorMessage,
              loading: false
            });
            toast.error(errorMessage);
          }
        },

        // Filter management
        saveFilterTemplate: async (filterName: string) => {
          const { filters, authToken } = get();
          
          if (!authToken) {
            toast.error('Please log in to save filters');
            return;
          }

          if (filters.length === 0) {
            toast.error('No filters to save');
            return;
          }

          try {
            const filterData = {
              name: filterName,
              filters: filters,
              createdAt: new Date().toISOString()
            };
            
            await searchApi.saveFilter(filterData);
            toast.success('Filter template saved successfully');
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save filter';
            toast.error(errorMessage);
          }
        },

        loadFilterTemplate: async (filterId: string) => {
          const { authToken } = get();
          
          if (!authToken) {
            toast.error('Please log in to load filters');
            return;
          }

          try {
            const filters = await searchApi.loadFilter(filterId);
            set({ filters });
            toast.success('Filter template loaded successfully');
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load filter';
            toast.error(errorMessage);
          }
        },

        // Cache management
        clearSearchCache: async () => {
          const { authToken } = get();
          
          if (!authToken) {
            toast.error('Please log in to clear cache');
            return;
          }

          try {
            await searchApi.clearCache();
            set({ results: null });
            toast.success('Search cache cleared successfully');
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to clear cache';
            toast.error(errorMessage);
          }
        },

        // Export functionality
        exportSearchResults: async () => {
          const { authToken } = get();
          
          if (!authToken) {
            toast.error('Please log in to export results');
            return;
          }

          try {
            await searchApi.exportDashboard();
            toast.success('Search results exported successfully');
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to export results';
            toast.error(errorMessage);
          }
        }
      }),
      {
        name: 'search-store',
        partialize: (state) => ({
          history: state.history,
          query: { text: state.query.text, entities: state.query.entities },
          authToken: state.authToken,
          isAuthenticated: state.isAuthenticated,
          searchPerformance: state.searchPerformance
        })
      }
    ),
    { name: 'search-store' }
  )
);
