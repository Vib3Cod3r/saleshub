# Phase 2: Core CRM Features - Implementation Plan

**Date:** December 19, 2024  
**Status:** 🚀 READY TO IMPLEMENT  
**Duration:** 2 Weeks (Week 2-3)  
**Priority:** Essential CRM Functionality  

---

## 🎯 Phase 2 Overview

Phase 2 focuses on implementing the core CRM functionality that users need daily: Dashboard, Contact Management, and Company Management. This phase builds upon the solid foundation established in Phase 1 and creates the essential features for a functional CRM system.

---

## 📊 Current State Analysis

### ✅ **Phase 1 Foundation Available**
- Complete design system with colors, spacing, typography
- Core UI components (Button, Input, Card, Modal)
- Development environment with hot reload
- TypeScript configuration and testing setup
- Component showcase and documentation

### 🔄 **Phase 2 Implementation Needs**
- Authentication system integration
- Dashboard with KPIs and metrics
- Contact management (CRUD operations)
- Company management system
- Data integration with backend API
- Real-time updates and notifications

---

## 🏗️ Implementation Workflow

### **Week 2: Dashboard & Data Integration**

#### **Day 8: Authentication System** (8 hours)

**Morning (4 hours): Authentication Context & API Integration**

**8.1 Create Authentication Context** (`src/contexts/AuthContext.tsx`)
```typescript
interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'user'
  avatar?: string
  tenantId: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<void>
  refreshToken: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  // JWT token management
  // Automatic token refresh
  // Session persistence
  // Error handling with toast notifications
}
```

**8.2 API Client Setup** (`src/lib/api/client.ts`)
```typescript
class ApiClient {
  private baseURL: string
  private token: string | null
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089'
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  }
  
  // Request interceptor for authentication
  // Response interceptor for error handling
  // Automatic token refresh
  // Retry logic for failed requests
  
  // CRUD methods with TypeScript generics
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T>
  post<T>(endpoint: string, data: any): Promise<T>
  put<T>(endpoint: string, data: any): Promise<T>
  delete<T>(endpoint: string): Promise<T>
  patch<T>(endpoint: string, data: any): Promise<T>
}

export const apiClient = new ApiClient()
```

**Afternoon (4 hours): Authentication Pages & Protected Routes**

**8.3 Login Page** (`src/app/login/page.tsx`)
- Form validation with Zod schemas
- Error handling and user feedback
- Remember me functionality
- Password reset link
- Social login options (future)

**8.4 Register Page** (`src/app/register/page.tsx`)
- User registration form
- Email verification flow
- Terms and conditions
- Company/tenant setup

**8.5 Protected Route Middleware** (`src/components/auth/ProtectedRoute.tsx`)
```typescript
export function ProtectedRoute({ 
  children, 
  requiredRole,
  fallback 
}: { 
  children: React.ReactNode
  requiredRole?: string
  fallback?: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (requiredRole && user?.role !== requiredRole) {
      router.push('/unauthorized')
    }
  }, [user, loading, router, requiredRole])
  
  if (loading) return <LoadingSpinner />
  if (!user) return fallback || null
  
  return <>{children}</>
}
```

#### **Day 9: Dashboard Foundation** (8 hours)

**Morning (4 hours): Dashboard Layout & Navigation**

**9.1 Dashboard Layout** (`src/app/dashboard/layout.tsx`)
```typescript
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:pl-72">
          <Header />
          <main className="py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
```

**9.2 Sidebar Navigation** (`src/components/layout/Sidebar.tsx`)
```typescript
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, badge: null },
  { name: 'Contacts', href: '/contacts', icon: Users, badge: null },
  { name: 'Companies', href: '/companies', icon: Building2, badge: null },
  { name: 'Deals', href: '/deals', icon: TrendingUp, badge: '12' },
  { name: 'Leads', href: '/leads', icon: Target, badge: '5' },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, badge: '8' },
  { name: 'Reports', href: '/reports', icon: BarChart3, badge: null },
]

export function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  
  return (
    <nav className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200">
      {/* Logo and branding */}
      {/* Navigation items */}
      {/* User profile section */}
    </nav>
  )
}
```

**9.3 Header Component** (`src/components/layout/Header.tsx`)
- User menu with profile
- Search bar integration
- Notifications center
- Mobile menu toggle
- Breadcrumb navigation

**Afternoon (4 hours): Dashboard Components & Data Fetching**

**9.4 Dashboard Page** (`src/app/dashboard/page.tsx`)
```typescript
export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.get<DashboardStats>('/api/dashboard/stats'),
  })
  
  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => apiClient.get<Activity[]>('/api/dashboard/activity'),
  })
  
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <StatsGrid stats={stats} loading={isLoading} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityCard activities={recentActivity} />
        <QuickActionsCard />
      </div>
    </div>
  )
}
```

**9.5 Dashboard Components** (`src/components/dashboard/`)
- `StatsCard.tsx` - KPI display with trends
- `ActivityFeed.tsx` - Recent activity timeline
- `QuickActions.tsx` - Common action buttons
- `Charts.tsx` - Performance charts

#### **Day 10: Data Models & API Integration** (8 hours)

**Morning (4 hours): Type Definitions & API Hooks**

**10.1 Type Definitions** (`src/types/crm.ts`)
```typescript
// Contact types
export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  title?: string
  companyId?: string
  company?: Company
  status: 'active' | 'inactive' | 'lead'
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

// Company types
export interface Company {
  id: string
  name: string
  industry?: string
  website?: string
  size?: 'small' | 'medium' | 'large'
  status: 'active' | 'inactive' | 'prospect'
  address?: Address
  contacts: Contact[]
  deals: Deal[]
  createdAt: string
  updatedAt: string
}

// Dashboard types
export interface DashboardStats {
  totalContacts: number
  totalCompanies: number
  totalDeals: number
  totalRevenue: number
  contactsGrowth: number
  companiesGrowth: number
  dealsGrowth: number
  revenueGrowth: number
}

export interface Activity {
  id: string
  type: 'contact_created' | 'deal_won' | 'task_completed'
  title: string
  description: string
  userId: string
  user: User
  timestamp: string
  metadata?: Record<string, any>
}
```

**10.2 API Hooks** (`src/hooks/api/useApi.ts`)
```typescript
// Generic API hooks
export function useApi<T>(endpoint: string, options?: UseQueryOptions<T>) {
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => apiClient.get<T>(endpoint),
    ...options,
  })
}

export function useMutation<T, V>(endpoint: string, options?: UseMutationOptions<T, Error, V>) {
  return useMutation({
    mutationFn: (data: V) => apiClient.post<T>(endpoint, data),
    ...options,
  })
}

// Specific CRM hooks
export function useContacts(filters?: ContactFilters) {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: () => apiClient.get<Contact[]>('/api/contacts', { params: filters }),
  })
}

export function useCompanies(filters?: CompanyFilters) {
  return useQuery({
    queryKey: ['companies', filters],
    queryFn: () => apiClient.get<Company[]>('/api/companies', { params: filters }),
  })
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.get<DashboardStats>('/api/dashboard/stats'),
    refetchInterval: 300000, // 5 minutes
  })
}
```

**Afternoon (4 hours): Error Handling & Loading States**

**10.3 Error Boundary** (`src/components/ErrorBoundary.tsx`)
```typescript
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    
    return this.props.children
  }
}
```

**10.4 Loading Components** (`src/components/ui/Loading/`)
- `LoadingSpinner.tsx` - General loading spinner
- `SkeletonCard.tsx` - Card skeleton loader
- `SkeletonTable.tsx` - Table skeleton loader
- `LoadingOverlay.tsx` - Full page loading overlay

#### **Day 11: Contact Management Foundation** (8 hours)

**Morning (4 hours): Contact List & Search**

**11.1 Contact List Page** (`src/app/contacts/page.tsx`)
```typescript
export default function ContactsPage() {
  const [filters, setFilters] = useState<ContactFilters>({})
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('list')
  
  const { data: contacts, isLoading } = useContacts({
    ...filters,
    search,
  })
  
  return (
    <div className="space-y-6">
      <ContactsHeader onViewChange={setView} />
      <ContactFilters filters={filters} onFiltersChange={setFilters} />
      <ContactSearch value={search} onChange={setSearch} />
      <ContactsList contacts={contacts} view={view} loading={isLoading} />
    </div>
  )
}
```

**11.2 Contact Components** (`src/components/contacts/`)
- `ContactCard.tsx` - Individual contact display
- `ContactList.tsx` - List/grid view container
- `ContactFilters.tsx` - Advanced filtering
- `ContactSearch.tsx` - Search functionality
- `ContactActions.tsx` - Bulk actions

**Afternoon (4 hours): Contact Forms & CRUD Operations**

**11.3 Contact Form** (`src/components/contacts/ContactForm.tsx`)
```typescript
const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  title: z.string().optional(),
  companyId: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive', 'lead']),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

export function ContactForm({ 
  contact, 
  onSubmit, 
  onCancel 
}: ContactFormProps) {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact || {
      firstName: '',
      lastName: '',
      email: '',
      status: 'active',
    },
  })
  
  const { mutate: createContact, isLoading } = useMutation('/api/contacts', {
    onSuccess: () => {
      toast.success('Contact created successfully')
      onSubmit()
    },
    onError: (error) => {
      toast.error('Failed to create contact')
    },
  })
  
  return (
    <form onSubmit={form.handleSubmit(createContact)}>
      {/* Form fields */}
    </form>
  )
}
```

**11.4 Contact CRUD Operations** (`src/hooks/api/useContacts.ts`)
```typescript
export function useCreateContact() {
  const queryClient = useQueryClient()
  
  return useMutation<Contact, CreateContactData>('/api/contacts', {
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts'])
      toast.success('Contact created successfully')
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  
  return useMutation<Contact, { id: string; data: UpdateContactData }>(
    ({ id, data }) => apiClient.put<Contact>(`/api/contacts/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contacts'])
        toast.success('Contact updated successfully')
      },
    }
  )
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  
  return useMutation<void, string>(
    (id) => apiClient.delete(`/api/contacts/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contacts'])
        toast.success('Contact deleted successfully')
      },
    }
  )
}
```

#### **Day 12: Company Management** (8 hours)

**Morning (4 hours): Company List & Management**

**12.1 Company List Page** (`src/app/companies/page.tsx`)
- Company grid/list view
- Company search and filtering
- Company statistics
- Bulk operations

**12.2 Company Components** (`src/components/companies/`)
- `CompanyCard.tsx` - Company information display
- `CompanyList.tsx` - List/grid container
- `CompanyFilters.tsx` - Advanced filtering
- `CompanyStats.tsx` - Company metrics

**Afternoon (4 hours): Company Forms & Relationships**

**12.3 Company Form** (`src/components/companies/CompanyForm.tsx`)
```typescript
const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  website: z.string().url().optional(),
  size: z.enum(['small', 'medium', 'large']).optional(),
  status: z.enum(['active', 'inactive', 'prospect']),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
})

export function CompanyForm({ company, onSubmit, onCancel }: CompanyFormProps) {
  // Form implementation with validation
  // Address form component
  // Industry and size selectors
}
```

**12.4 Company-Contact Relationships** (`src/components/companies/CompanyContacts.tsx`)
- Display company contacts
- Add/remove contacts from company
- Contact management within company context

### **Week 3: Advanced Features & Polish**

#### **Day 13: Advanced Filtering & Search** (8 hours)

**Morning (4 hours): Advanced Search Integration**

**13.1 Search Integration** (`src/components/search/SearchProvider.tsx`)
```typescript
// Integrate with existing search functionality
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    try {
      const results = await apiClient.get<SearchResult[]>('/api/search', {
        params: { q: query }
      })
      setSearchResults(results)
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }, [])
  
  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery,
      searchResults,
      isSearching,
      search,
    }}>
      {children}
    </SearchContext.Provider>
  )
}
```

**13.2 Advanced Filters** (`src/components/filters/AdvancedFilters.tsx`)
- Date range filters
- Status filters
- Custom field filters
- Saved filter templates

**Afternoon (4 hours): Data Export & Import**

**13.3 Data Export** (`src/components/data/DataExport.tsx`)
```typescript
export function DataExport({ type, filters }: DataExportProps) {
  const exportData = useMutation(`/api/${type}/export`, {
    onSuccess: (data) => {
      // Download CSV/Excel file
      downloadFile(data, `${type}-export.csv`)
      toast.success('Export completed')
    },
  })
  
  return (
    <Button onClick={() => exportData.mutate(filters)}>
      Export {type}
    </Button>
  )
}
```

**13.4 Data Import** (`src/components/data/DataImport.tsx`)
- File upload component
- CSV/Excel parsing
- Data validation
- Import progress tracking

#### **Day 14: Real-time Updates & Notifications** (8 hours)

**Morning (4 hours): WebSocket Integration**

**14.1 Real-time Updates** (`src/hooks/useRealtime.ts`)
```typescript
export function useRealtime() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  useEffect(() => {
    if (!user) return
    
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8089')
    
    socket.on('connect', () => {
      console.log('Connected to real-time updates')
    })
    
    socket.on('contact:updated', (contact: Contact) => {
      queryClient.setQueryData(['contacts'], (old: Contact[] | undefined) => {
        if (!old) return [contact]
        return old.map(c => c.id === contact.id ? contact : c)
      })
    })
    
    socket.on('company:updated', (company: Company) => {
      queryClient.setQueryData(['companies'], (old: Company[] | undefined) => {
        if (!old) return [company]
        return old.map(c => c.id === company.id ? company : c)
      })
    })
    
    return () => {
      socket.disconnect()
    }
  }, [user, queryClient])
}
```

**14.2 Notification System** (`src/components/notifications/NotificationCenter.tsx`)
- Real-time notifications
- Notification preferences
- Notification history
- Toast notifications

**Afternoon (4 hours): Performance Optimization**

**14.3 Performance Optimizations**
- React Query caching strategies
- Component memoization
- Lazy loading for large lists
- Virtual scrolling for performance

**14.4 Bundle Optimization**
- Code splitting for routes
- Dynamic imports for heavy components
- Tree shaking optimization
- Bundle analysis

---

## 🚀 Scalable Workflow Principles

### **1. Feature-Based Architecture**
```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   ├── contacts/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── companies/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
```

### **2. Data Management Strategy**
- **Server State**: TanStack React Query for API data
- **Client State**: Zustand for UI state
- **Form State**: React Hook Form for form management
- **URL State**: Next.js Router for navigation state

### **3. API Integration Pattern**
- **Consistent API Client**: Centralized API client with interceptors
- **Type-Safe Endpoints**: Full TypeScript coverage for API responses
- **Error Handling**: Consistent error handling across all API calls
- **Caching Strategy**: Intelligent caching with React Query

### **4. Component Composition**
- **Atomic Design**: Build components from smallest to largest
- **Composition Over Inheritance**: Use composition for component reuse
- **Props Interface**: Clear TypeScript interfaces for all components
- **Default Props**: Sensible defaults for all component props

---

## 📊 Success Metrics

### **Performance Targets**
- **Page Load Time**: < 2s for dashboard and list pages
- **Search Response**: < 500ms for contact/company search
- **Form Submission**: < 1s for create/update operations
- **Real-time Updates**: < 100ms for WebSocket updates

### **Quality Targets**
- **Test Coverage**: > 90% for all new components
- **TypeScript Coverage**: 100% for all new code
- **Accessibility Score**: > 95% for all pages
- **Error Rate**: < 1% for API operations

### **User Experience Targets**
- **Task Completion**: 90% of users can complete core tasks
- **Navigation**: < 3 clicks to reach any feature
- **Search**: 95% accuracy for search results
- **Responsive Design**: Perfect on all device sizes

---

## 🔧 Implementation Checklist

### **Week 2: Dashboard & Data Integration**
- [ ] Authentication system complete
- [ ] Dashboard layout and navigation
- [ ] Dashboard components and metrics
- [ ] API integration and data fetching
- [ ] Error handling and loading states

### **Week 3: Contact & Company Management**
- [ ] Contact list and search functionality
- [ ] Contact forms and CRUD operations
- [ ] Company list and management
- [ ] Company-contact relationships
- [ ] Advanced filtering and search
- [ ] Data export/import functionality
- [ ] Real-time updates and notifications
- [ ] Performance optimization

---

## 🎯 Next Steps After Phase 2

1. **Phase 3**: Sales Pipeline (Week 4-5)
2. **Phase 4**: Advanced Features (Week 6-7)
3. **Phase 5**: Polish & Deployment (Week 8)

---

**This Phase 2 plan provides a comprehensive roadmap for implementing core CRM features with a scalable, maintainable architecture that supports future growth.**
