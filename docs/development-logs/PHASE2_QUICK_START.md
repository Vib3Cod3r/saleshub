# Phase 2: Core CRM Features - Quick Start Guide

**Date:** December 19, 2024  
**Status:** 🚀 READY TO IMPLEMENT  
**Time to First Feature:** 4-6 hours  
**Builds Upon:** Phase 1 Foundation  

---

## 🎯 Quick Start Overview

This guide provides immediate steps to start implementing Phase 2 core CRM features, building upon the solid foundation established in Phase 1.

---

## 🚀 Immediate Implementation Steps

### **Step 1: Authentication System** (2 hours)

#### **1.1 Create Authentication Context**

```typescript
// src/contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      validateToken(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const validateToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        localStorage.removeItem('auth_token')
        setToken(null)
      }
    } catch (error) {
      localStorage.removeItem('auth_token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      
      if (!response.ok) {
        throw new Error('Login failed')
      }
      
      const data = await response.json()
      localStorage.setItem('auth_token', data.token)
      setToken(data.token)
      setUser(data.user)
      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Login failed. Please check your credentials.')
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setToken(null)
    setUser(null)
    router.push('/login')
    toast.success('Logged out successfully')
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      
      if (!response.ok) {
        throw new Error('Registration failed')
      }
      
      const data = await response.json()
      localStorage.setItem('auth_token', data.token)
      setToken(data.token)
      setUser(data.user)
      toast.success('Registration successful!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Registration failed. Please try again.')
      throw error
    }
  }

  const refreshToken = async () => {
    // Implement token refresh logic
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

#### **1.2 Create API Client**

```typescript
// src/lib/api/client.ts
class ApiClient {
  private baseURL: string
  private token: string | null
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089'
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  }
  
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
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
      if (response.status === 401) {
        // Handle unauthorized - redirect to login
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
        throw new Error('Unauthorized')
      }
      throw new Error(`API Error: ${response.status}`)
    }
    
    return response.json()
  }
  
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<T>(`${endpoint}${queryString}`)
  }
  
  post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
  
  put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
  
  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
  
  patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient()
```

### **Step 2: Dashboard Foundation** (2 hours)

#### **2.1 Create Dashboard Layout**

```typescript
// src/app/dashboard/layout.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

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

#### **2.2 Create Sidebar Navigation**

```typescript
// src/components/layout/Sidebar.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Users, 
  Building2, 
  TrendingUp, 
  Target, 
  CheckSquare, 
  BarChart3,
  User,
  Settings,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Deals', href: '/deals', icon: TrendingUp },
  { name: 'Leads', href: '/leads', icon: Target },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  return (
    <nav className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">SalesHub</h1>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-4 w-4 text-primary-700" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="ml-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

#### **2.3 Create Dashboard Page**

```typescript
// src/app/dashboard/page.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Calendar,
  Plus 
} from 'lucide-react'

export default function DashboardPage() {
  // Mock data for now - will be replaced with API calls
  const stats = [
    {
      name: 'Total Contacts',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Active Companies',
      value: '89',
      change: '+5%',
      changeType: 'positive',
      icon: Building2,
    },
    {
      name: 'Pipeline Value',
      value: '$2.4M',
      change: '+23%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: 'Tasks Due Today',
      value: '12',
      change: '-3',
      changeType: 'negative',
      icon: Calendar,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button leftIcon={<Plus />}>
          Add Contact
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-500">No recent activity</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Add New Contact
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Create New Deal
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### **Step 3: Contact Management** (2 hours)

#### **3.1 Create Contact Types**

```typescript
// src/types/crm.ts
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

export interface Company {
  id: string
  name: string
  industry?: string
  website?: string
  size?: 'small' | 'medium' | 'large'
  status: 'active' | 'inactive' | 'prospect'
  createdAt: string
  updatedAt: string
}

export interface ContactFilters {
  search?: string
  status?: string
  companyId?: string
  tags?: string[]
}
```

#### **3.2 Create Contact List Page**

```typescript
// src/app/contacts/page.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Search, Filter } from 'lucide-react'

// Mock data - will be replaced with API calls
const mockContacts = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    title: 'CEO',
    status: 'active',
    company: { name: 'Acme Corp' },
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-0124',
    title: 'CTO',
    status: 'active',
    company: { name: 'Tech Solutions' },
  },
]

export default function ContactsPage() {
  const [search, setSearch] = useState('')
  const [contacts] = useState(mockContacts)

  const filteredContacts = contacts.filter(contact =>
    contact.firstName.toLowerCase().includes(search.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(search.toLowerCase()) ||
    contact.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <Button leftIcon={<Plus />}>
          Add Contact
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search />}
              />
            </div>
            <Button variant="outline" leftIcon={<Filter />}>
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Contacts ({filteredContacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {contact.firstName[0]}{contact.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{contact.email}</p>
                    <p className="text-xs text-gray-400">{contact.title} at {contact.company?.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    contact.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {contact.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🎯 First Feature Implementation

### **Protected Route Component**

```typescript
// src/components/auth/ProtectedRoute.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
```

---

## 🚀 Next Steps After Quick Start

1. **Complete Authentication Pages** (Login, Register, Password Reset)
2. **Implement API Integration** (Replace mock data with real API calls)
3. **Add Contact Forms** (Create, Edit, Delete operations)
4. **Build Company Management** (Company list, forms, relationships)
5. **Implement Advanced Features** (Search, filtering, export/import)

---

## 📊 Success Checklist

- [ ] Authentication context working
- [ ] API client configured
- [ ] Dashboard layout responsive
- [ ] Sidebar navigation functional
- [ ] Contact list displaying
- [ ] Search functionality working
- [ ] Protected routes working
- [ ] User can navigate between pages

---

## 🔧 Troubleshooting

### **Common Issues:**

1. **Authentication not working:**
   - Check API endpoints are correct
   - Verify JWT token handling
   - Check localStorage for token persistence

2. **API calls failing:**
   - Verify backend server is running
   - Check CORS configuration
   - Validate API client base URL

3. **Styling issues:**
   - Ensure Tailwind CSS is properly configured
   - Check component imports are correct
   - Verify design system tokens are available

---

**This quick start guide will get you a functional CRM with authentication, dashboard, and contact management in 4-6 hours!**
