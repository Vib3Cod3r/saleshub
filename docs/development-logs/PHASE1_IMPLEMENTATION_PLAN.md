# Phase 1: Core Infrastructure & Authentication - Implementation Plan

**Date:** December 19, 2024  
**Status:** 🚀 READY TO IMPLEMENT  
**Duration:** 1 Week  
**Priority:** Critical Foundation  

---

## 🎯 Phase 1 Overview

Phase 1 establishes the foundational infrastructure for the SalesHub CRM frontend, focusing on authentication, layout, and design system. This phase follows DRY principles and creates a scalable architecture for future development.

---

## 📊 Current State Analysis

### ✅ **Already Available**
- Next.js 15.5.0 with App Router
- React 19.1.0 with latest features
- TypeScript with strict mode
- Tailwind CSS v4
- TanStack React Query + Zustand
- Headless UI + Lucide React
- Testing infrastructure (Jest + RTL)
- Search functionality (advanced features)

### 🔄 **Needs Implementation**
- Complete authentication system
- Responsive layout and navigation
- Design system foundation
- Protected route middleware
- Core UI component library

---

## 🏗️ Implementation Workflow

### **Day 1: Foundation Setup & Design System**

#### **Morning (4 hours): Environment & Dependencies**
```bash
# 1. Install additional dependencies
cd frontend
npm install react-hook-form @hookform/resolvers zod
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-tabs
npm install @radix-ui/react-toast @radix-ui/react-tooltip
npm install @radix-ui/react-avatar @radix-ui/react-badge
npm install @radix-ui/react-checkbox @radix-ui/react-radio-group
npm install @radix-ui/react-switch @radix-ui/react-progress

# 2. Start development server
npm run dev
```

#### **Afternoon (4 hours): Design System Foundation**

**1.1 Create Design Tokens** (`src/lib/design-system/`)
```typescript
// colors.ts
export const colors = {
  primary: { 50: '#eff6ff', 500: '#3b82f6', 900: '#1e3a8a' },
  gray: { 50: '#f9fafb', 500: '#6b7280', 900: '#111827' },
  success: { 50: '#f0fdf4', 500: '#22c55e', 900: '#14532d' },
  warning: { 50: '#fffbeb', 500: '#f59e0b', 900: '#78350f' },
  error: { 50: '#fef2f2', 500: '#ef4444', 900: '#7f1d1d' },
}

// spacing.ts
export const spacing = {
  xs: '0.25rem', sm: '0.5rem', md: '1rem',
  lg: '1.5rem', xl: '2rem', '2xl': '3rem',
}

// typography.ts
export const typography = {
  fontSizes: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem' },
  fontWeights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
}
```

**1.2 Create Core UI Components** (`src/components/ui/`)
```typescript
// Button/Button.tsx - Variant-based component
// Input/Input.tsx - Form input with validation
// Card/Card.tsx - Container component
// Modal/Modal.tsx - Dialog component
// Table/Table.tsx - Data display
// Form/Form.tsx - Form wrapper with validation
```

### **Day 2: Authentication System**

#### **Morning (4 hours): Authentication Context & Hooks**

**2.1 Create Authentication Context** (`src/contexts/AuthContext.tsx`)
```typescript
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<void>
  refreshToken: () => Promise<void>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Implementation with JWT token management
  // Automatic token refresh
  // Session persistence
  // Error handling
}
```

**2.2 Create Authentication Hooks** (`src/hooks/useAuth.ts`)
```typescript
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])
  
  return { user, loading }
}
```

#### **Afternoon (4 hours): Authentication Pages**

**2.3 Login Page** (`src/app/login/page.tsx`)
- Form validation with Zod
- Error handling and user feedback
- Remember me functionality
- Password reset link

**2.4 Register Page** (`src/app/register/page.tsx`)
- User registration form
- Email verification flow
- Terms and conditions

**2.5 Password Reset** (`src/app/reset-password/page.tsx`)
- Password reset request
- Token validation
- New password form

### **Day 3: Layout & Navigation**

#### **Morning (4 hours): Layout Components**

**3.1 Sidebar Navigation** (`src/components/layout/Sidebar.tsx`)
```typescript
interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'Deals', href: '/deals', icon: TrendingUp },
    { name: 'Leads', href: '/leads', icon: Target },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ]
  
  return (
    <nav className="...">
      {/* Navigation implementation */}
    </nav>
  )
}
```

**3.2 Header Component** (`src/components/layout/Header.tsx`)
- User menu with profile
- Search bar integration
- Notifications
- Mobile menu toggle

**3.3 Page Layout** (`src/components/layout/PageLayout.tsx`)
- Consistent page structure
- Breadcrumb navigation
- Page title and actions
- Responsive design

#### **Afternoon (4 hours): Protected Routes & Middleware**

**3.4 Protected Route Wrapper** (`src/components/auth/ProtectedRoute.tsx`)
```typescript
export function ProtectedRoute({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode
  requiredRole?: string 
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
  if (!user) return null
  
  return <>{children}</>
}
```

**3.5 Route Guards** (`src/middleware/routeGuards.ts`)
- Role-based access control
- Route-level permissions
- Redirect handling

### **Day 4: Dashboard Foundation**

#### **Morning (4 hours): Dashboard Layout & Components**

**4.1 Dashboard Layout** (`src/app/dashboard/layout.tsx`)
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

**4.2 Dashboard Page** (`src/app/dashboard/page.tsx`)
- KPI cards with metrics
- Recent activity feed
- Quick actions panel
- Performance charts

#### **Afternoon (4 hours): Data Integration**

**4.3 API Integration** (`src/lib/api.ts`)
```typescript
class ApiClient {
  private baseURL: string
  private token: string | null
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089'
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  }
  
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options?.headers,
      },
      ...options,
    }
    
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new ApiError(response.status, response.statusText)
    }
    
    return response.json()
  }
  
  // CRUD methods
  get<T>(endpoint: string) { return this.request<T>(endpoint) }
  post<T>(endpoint: string, data: any) { return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }) }
  put<T>(endpoint: string, data: any) { return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }) }
  delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }) }
}

export const apiClient = new ApiClient()
```

**4.4 React Query Integration** (`src/hooks/useApi.ts`)
```typescript
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
```

### **Day 5: Form System & Validation**

#### **Morning (4 hours): Form Components**

**5.1 Form Builder** (`src/components/forms/FormBuilder.tsx`)
```typescript
interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox'
  required?: boolean
  validation?: ZodSchema
  options?: { value: string; label: string }[]
}

interface FormBuilderProps {
  fields: FormField[]
  onSubmit: (data: any) => void
  defaultValues?: any
}

export function FormBuilder({ fields, onSubmit, defaultValues }: FormBuilderProps) {
  const form = useForm({
    resolver: zodResolver(createSchema(fields)),
    defaultValues,
  })
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {fields.map(field => (
        <FormField key={field.name} field={field} form={form} />
      ))}
    </form>
  )
}
```

**5.2 Form Field Components** (`src/components/forms/FormField.tsx`)
- Text input with validation
- Select dropdown
- Checkbox and radio groups
- Textarea with character count

#### **Afternoon (4 hours): Validation & Error Handling**

**5.3 Validation Schemas** (`src/lib/validation/schemas.ts`)
```typescript
export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  companyId: z.string().uuid().optional(),
})

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  website: z.string().url().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
})
```

**5.4 Error Handling** (`src/lib/errors/ErrorBoundary.tsx`)
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
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    
    return this.props.children
  }
}
```

### **Day 6: Testing & Quality Assurance**

#### **Morning (4 hours): Component Testing**

**6.1 Test Utilities** (`src/lib/test-utils.tsx`)
```typescript
export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    )
  }
  
  return render(ui, { wrapper: AllTheProviders, ...options })
}

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    ...overrides,
  }
}
```

**6.2 Component Tests** (`src/components/__tests__/`)
- Button component tests
- Form component tests
- Layout component tests
- Authentication flow tests

#### **Afternoon (4 hours): Integration Testing**

**6.3 Integration Tests** (`src/__tests__/integration/`)
- Authentication flow
- Dashboard loading
- Form submission
- API integration

**6.4 E2E Test Setup** (`e2e/`)
- Playwright configuration
- Basic user journey tests
- Authentication E2E tests

### **Day 7: Polish & Documentation**

#### **Morning (4 hours): Performance & Accessibility**

**7.1 Performance Optimization**
- Code splitting implementation
- Image optimization
- Bundle analysis
- Performance monitoring

**7.2 Accessibility Improvements**
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast compliance

#### **Afternoon (4 hours): Documentation & Deployment**

**7.3 Documentation** (`docs/`)
- Component documentation
- API documentation
- Setup instructions
- Development guidelines

**7.4 Deployment Preparation**
- Environment configuration
- Build optimization
- Deployment scripts
- Monitoring setup

---

## 🚀 Scalable Workflow Principles

### **1. Component-Driven Development**
```typescript
// Create reusable components first
// Build features by composing components
// Maintain consistent interfaces
```

### **2. Feature-Based Organization**
```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── dashboard/
│   ├── contacts/
│   └── companies/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
```

### **3. State Management Strategy**
```typescript
// Server State: TanStack React Query
// Client State: Zustand
// Form State: React Hook Form
// URL State: Next.js Router
```

### **4. API Integration Pattern**
```typescript
// Consistent API client
// Type-safe endpoints
// Error handling
// Caching strategy
```

---

## 📊 Success Metrics

### **Performance Targets**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: < 500KB (gzipped)

### **Quality Targets**
- **Test Coverage**: > 90%
- **TypeScript Coverage**: 100%
- **Accessibility Score**: > 95%
- **Lighthouse Score**: > 90%

### **Development Targets**
- **Build Time**: < 30s
- **Hot Reload**: < 1s
- **Type Checking**: < 5s
- **Test Execution**: < 10s

---

## 🔧 Implementation Checklist

### **Day 1: Foundation**
- [ ] Dependencies installed
- [ ] Design tokens created
- [ ] Core UI components built
- [ ] Development server running

### **Day 2: Authentication**
- [ ] Auth context implemented
- [ ] Login page functional
- [ ] Register page functional
- [ ] Password reset working

### **Day 3: Layout**
- [ ] Sidebar navigation complete
- [ ] Header component built
- [ ] Protected routes working
- [ ] Responsive design implemented

### **Day 4: Dashboard**
- [ ] Dashboard layout complete
- [ ] KPI components built
- [ ] API integration working
- [ ] Data fetching functional

### **Day 5: Forms**
- [ ] Form builder component
- [ ] Validation schemas
- [ ] Error handling
- [ ] Form submission working

### **Day 6: Testing**
- [ ] Component tests written
- [ ] Integration tests complete
- [ ] E2E tests configured
- [ ] Test coverage > 90%

### **Day 7: Polish**
- [ ] Performance optimized
- [ ] Accessibility improved
- [ ] Documentation complete
- [ ] Ready for deployment

---

## 🎯 Next Steps After Phase 1

1. **Phase 2**: Contact Management (Week 2)
2. **Phase 3**: Company Management (Week 3)
3. **Phase 4**: Deal Pipeline (Week 4)
4. **Phase 5**: Advanced Features (Week 5-6)

---

**This Phase 1 plan provides a solid foundation for scalable, maintainable frontend development with clear daily goals and measurable success criteria.**
