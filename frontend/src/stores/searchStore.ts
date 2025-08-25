import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface SearchFilters {
  query: string
  category: string
  dateRange: {
    start: string
    end: string
  }
  status: string[]
  tags: string[]
  company: string
  assignedTo: string
}

export interface SearchResult {
  id: string
  type: 'contact' | 'company' | 'deal' | 'note'
  title: string
  description: string
  category: string
  tags: string[]
  status: string
  createdAt: string
  updatedAt: string
  relevance: number
  metadata: Record<string, any>
}

export interface SearchState {
  // Search state
  query: string
  filters: SearchFilters
  results: SearchResult[]
  isLoading: boolean
  error: string | null
  
  // Pagination
  currentPage: number
  totalPages: number
  totalResults: number
  pageSize: number
  
  // Search history
  searchHistory: string[]
  recentSearches: string[]
  
  // Advanced features
  isAdvancedSearch: boolean
  savedFilters: SearchFilters[]
  searchAnalytics: {
    totalSearches: number
    averageResults: number
    popularQueries: string[]
  }
  
  // Actions
  setQuery: (query: string) => void
  setFilters: (filters: Partial<SearchFilters>) => void
  setResults: (results: SearchResult[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPage: (page: number) => void
  setTotalPages: (pages: number) => void
  setTotalResults: (total: number) => void
  addToHistory: (query: string) => void
  clearHistory: () => void
  toggleAdvancedSearch: () => void
  saveFilter: (filter: SearchFilters, name: string) => void
  loadFilter: (filter: SearchFilters) => void
  deleteFilter: (index: number) => void
  updateAnalytics: (analytics: Partial<SearchState['searchAnalytics']>) => void
  resetSearch: () => void
}

const initialFilters: SearchFilters = {
  query: '',
  category: '',
  dateRange: {
    start: '',
    end: '',
  },
  status: [],
  tags: [],
  company: '',
  assignedTo: '',
}

const initialAnalytics = {
  totalSearches: 0,
  averageResults: 0,
  popularQueries: [],
}

export const useSearchStore = create<SearchState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        query: '',
        filters: initialFilters,
        results: [],
        isLoading: false,
        error: null,
        currentPage: 1,
        totalPages: 1,
        totalResults: 0,
        pageSize: 20,
        searchHistory: [],
        recentSearches: [],
        isAdvancedSearch: false,
        savedFilters: [],
        searchAnalytics: initialAnalytics,

        // Actions
        setQuery: (query: string) => {
          set({ query })
          if (query) {
            get().addToHistory(query)
          }
        },

        setFilters: (filters: Partial<SearchFilters>) => {
          set((state) => ({
            filters: { ...state.filters, ...filters }
          }))
        },

        setResults: (results: SearchResult[]) => {
          set({ results })
        },

        setLoading: (isLoading: boolean) => {
          set({ isLoading })
        },

        setError: (error: string | null) => {
          set({ error })
        },

        setPage: (currentPage: number) => {
          set({ currentPage })
        },

        setTotalPages: (totalPages: number) => {
          set({ totalPages })
        },

        setTotalResults: (totalResults: number) => {
          set({ totalResults })
        },

        addToHistory: (query: string) => {
          set((state) => {
            const newHistory = [query, ...state.searchHistory.filter(q => q !== query)].slice(0, 10)
            const newRecentSearches = [query, ...state.recentSearches.filter(q => q !== query)].slice(0, 5)
            
            return {
              searchHistory: newHistory,
              recentSearches: newRecentSearches,
            }
          })
        },

        clearHistory: () => {
          set({ searchHistory: [], recentSearches: [] })
        },

        toggleAdvancedSearch: () => {
          set((state) => ({ isAdvancedSearch: !state.isAdvancedSearch }))
        },

        saveFilter: (filter: SearchFilters, name: string) => {
          set((state) => ({
            savedFilters: [...state.savedFilters, { ...filter, name }]
          }))
        },

        loadFilter: (filter: SearchFilters) => {
          set({ filters: filter })
        },

        deleteFilter: (index: number) => {
          set((state) => ({
            savedFilters: state.savedFilters.filter((_, i) => i !== index)
          }))
        },

        updateAnalytics: (analytics: Partial<SearchState['searchAnalytics']>) => {
          set((state) => ({
            searchAnalytics: { ...state.searchAnalytics, ...analytics }
          }))
        },

        resetSearch: () => {
          set({
            query: '',
            filters: initialFilters,
            results: [],
            currentPage: 1,
            totalPages: 1,
            totalResults: 0,
            error: null,
          })
        },
      }),
      {
        name: 'search-store',
        partialize: (state) => ({
          searchHistory: state.searchHistory,
          recentSearches: state.recentSearches,
          savedFilters: state.savedFilters,
          searchAnalytics: state.searchAnalytics,
        }),
      }
    ),
    {
      name: 'search-store',
    }
  )
)
